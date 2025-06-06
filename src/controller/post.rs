use crate::error::AppError::NotFoundError;
use crate::error::AppResult;
use crate::model::post::Post;
use crate::AppState;
use axum::extract::{Path, State};
use axum::http::HeaderMap;
use axum::response::IntoResponse;
use axum::Json;

pub async fn get_posts(State(state): State<AppState>) -> AppResult<Json<Vec<Post>>> {
    let result = state
        .post_service
        .get_all_posts()
        .await?;

    Ok(Json(result))
}

pub async fn get_post(
    Path(post_id): Path<i32>,
    State(state): State<AppState>,
) -> AppResult<Json<Option<Post>>> {
    let result = state
        .post_service
        .get_post(post_id)
        .await?;

    Ok(Json(result))
}

pub async fn get_post_image(
    Path(post_id): Path<i32>,
    State(state): State<AppState>,
) -> AppResult<impl IntoResponse> {
    let result = state
        .post_service
        .get_post_image(post_id)
        .await?;

    let content_type = "image/png";

    let mut headers = HeaderMap::new();
    headers.insert(
        "Content-Type",
        content_type.parse().unwrap(),
    );

    match result {
        None => Err(NotFoundError("Could not find image".to_string())),
        Some(data) => Ok((headers, data)),
    }
}
