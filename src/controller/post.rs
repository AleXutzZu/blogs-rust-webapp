use crate::error::AppError::{InternalError, NotFoundError};
use crate::error::AppResult;
use crate::model::post::Post;
use crate::AppState;
use axum::extract::{Path, State};
use axum::http::HeaderMap;
use axum::response::IntoResponse;
use axum::Json;
use axum_extra::extract::{CookieJar, Multipart};

pub async fn get_posts(State(state): State<AppState>) -> AppResult<Json<Vec<Post>>> {
    let result = state.post_service.get_all_posts().await?;

    Ok(Json(result))
}

pub async fn get_post(
    Path(post_id): Path<i32>,
    State(state): State<AppState>,
) -> AppResult<Json<Option<Post>>> {
    let result = state.post_service.get_post(post_id).await?;

    Ok(Json(result))
}

pub async fn get_post_image(
    Path(post_id): Path<i32>,
    State(state): State<AppState>,
) -> AppResult<impl IntoResponse> {
    let result = state.post_service.get_post_image(post_id).await?;

    let content_type = "image/png";

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", content_type.parse().unwrap());

    match result {
        None => Err(NotFoundError("Could not find image".to_string())),
        Some(data) => Ok((headers, data)),
    }
}

pub async fn create_post(
    State(state): State<AppState>,
    jar: CookieJar,
    mut form_data: Multipart,
) -> AppResult<impl IntoResponse> {
    let cookie_opt = jar.get("session_id");
    if cookie_opt.is_none() {
        return Err(InternalError("Could not create post".to_string()));
    }
    let cookie = cookie_opt.unwrap();

    let session_id = cookie.value().to_string();
    let result = state.user_service.get_user_by_session(session_id).await?;

    if result.is_none() {
        return Err(InternalError("Could not create post".to_string()));
    }

    let user = result.unwrap();
    let mut title: String = "".to_string();
    let mut body: String = "".to_string();
    let mut image: Option<Vec<u8>> = None;

    
    while let Some(field) = form_data.next_field().await? {
        let name = field
            .name()
            .ok_or(InternalError("Field not found".to_string()))?;

        match name {
            "title" => {
                title = field.text().await?;
            }
            "body" => {
                body = field.text().await?;
            }
            "image" => {
                let file_data = field.bytes().await;

                match file_data {
                    Ok(data) => {
                        if data.is_empty() {
                            image = None
                        } else {
                            image = Some(data.to_vec())
                        }
                    }
                    _ => image = None,
                }
            }
            _ => {}
        }
    }
    
    state
        .post_service
        .create_post(title, body, image, user.username)
        .await?;
    Ok(())
}