use crate::error::AppError::{InternalError, LoginError, NotFoundError};
use crate::error::{AppResult, JsonResult};
use crate::model::user::{User, UserDTO};
use crate::AppState;
use axum::extract::{Path, Query, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::Json;
use axum_extra::extract::cookie::{Cookie, SameSite};
use axum_extra::extract::{CookieJar, Multipart};
use serde::Deserialize;
#[derive(Deserialize)]
pub struct AuthForm {
    username: String,
    password: String,
}

pub async fn login_user(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(form): Json<AuthForm>,
) -> AppResult<(CookieJar, StatusCode)> {
    let uuid = state
        .user_service
        .login(&form.username, &form.password)
        .await?;

    let cookie = Cookie::build(("session_id", uuid.to_string()))
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .build();

    Ok((jar.add(cookie), StatusCode::NO_CONTENT))
}

pub async fn logout_user(
    State(state): State<AppState>,
    jar: CookieJar,
) -> AppResult<(CookieJar, StatusCode)> {
    let cookie_opt = jar.get("session_id");
    match cookie_opt {
        None => Err(InternalError("session_id missing".to_string())),
        Some(cookie) => {
            state
                .user_service
                .logout(cookie.value().to_string())
                .await?;

            let removed_cookie = Cookie::build(("session_id", ""))
                .path("/")
                .http_only(true)
                .same_site(SameSite::Lax)
                .max_age(time::Duration::seconds(0))
                .build();

            let jar = jar.remove(removed_cookie);
            Ok((jar, StatusCode::NO_CONTENT))
        }
    }
}

pub async fn validate_session(State(state): State<AppState>, jar: CookieJar) -> JsonResult<User> {
    let cookie_opt = jar.get("session_id");
    match cookie_opt {
        None => Err(InternalError("session_id missing".to_string())),
        Some(cookie) => {
            let session_id = cookie.value().to_string();

            let result = state
                .user_service
                .get_user_by_session(session_id)
                .await?
                .map(|user| Json(user));

            Ok(result.ok_or(LoginError)?)
        }
    }
}

pub async fn signup_user(
    State(state): State<AppState>,
    Json(form): Json<AuthForm>,
) -> AppResult<StatusCode> {
    state
        .user_service
        .create_user(&form.username, &form.password)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}

#[derive(Deserialize)]
pub struct PaginatedPostSearch {
    pub page: Option<i32>,
}

pub async fn get_user_with_posts(
    State(state): State<AppState>,
    Path(username): Path<String>,
    Query(params): Query<PaginatedPostSearch>,
) -> JsonResult<Option<UserDTO>> {
    let user = state.user_service.get_user_by_username(&username).await?;
    match user {
        None => Err(NotFoundError("Could not find user".to_string())),
        Some(u) => {
            let count = state
                .post_service
                .get_post_count_by_username(&username)
                .await?;
            let posts = state
                .post_service
                .get_posts_of_user(&u, params.page.map_or(1, |t| t))
                .await?;

            Ok(Json(Some(UserDTO {
                user: u,
                posts,
                total_posts: count,
            })))
        }
    }
}

pub async fn update_user(
    State(state): State<AppState>,
    Path(username): Path<String>,
    jar: CookieJar,
    mut multipart: Multipart,
) -> AppResult<StatusCode> {
    let cookie = jar.get("session_id").ok_or(InternalError(
        "Could not update profile picture".to_string(),
    ))?;

    let session_id = cookie.value().to_string();
    let user = state
        .user_service
        .get_user_by_session(session_id)
        .await?
        .ok_or(InternalError("Could not create post".to_string()))?;

    if user.username != username {
        return Err(InternalError("Usernames do not match".to_string()));
    }

    let mut avatar: Option<Vec<u8>> = None;

    while let Some(field) = multipart.next_field().await? {
        let name = field
            .name()
            .ok_or(InternalError("Field not found".to_string()))?;

        match name {
            "avatar" => {
                let file_data = field.bytes().await;

                match file_data {
                    Ok(data) => {
                        if data.is_empty() {
                            avatar = None
                        } else {
                            avatar = Some(data.to_vec())
                        }
                    }
                    _ => avatar = None,
                }
            }
            _ => {}
        }
    }
    if let Some(avatar) = avatar {
        state
            .user_service
            .update_user_avatar(&username, &avatar)
            .await?;
    }

    Ok(StatusCode::OK)
}

pub async fn get_user_avatar(
    State(state): State<AppState>,
    Path(username): Path<String>,
) -> AppResult<impl IntoResponse> {
    let result = state.user_service.get_user_avatar(&username).await?;

    let content_type = "image/png";

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", content_type.parse().unwrap());

    match result {
        None => Err(NotFoundError("Could not find image".to_string())),
        Some(data) => Ok((headers, data)),
    }
}
