use crate::error::AppError::{InternalError, LoginError};
use crate::error::AppResult;
use crate::model::user::User;
use crate::AppState;
use axum::extract::State;
use axum::http::StatusCode;
use axum::Json;
use axum_extra::extract::cookie::{Cookie, SameSite};
use axum_extra::extract::CookieJar;
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
    
    Ok((
        jar.add(cookie),
        StatusCode::NO_CONTENT,
    ))
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

pub async fn validate_session(
    State(state): State<AppState>,
    jar: CookieJar,
) -> AppResult<Json<User>> {
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
