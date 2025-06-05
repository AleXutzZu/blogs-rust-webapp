use crate::error::{map_internal_error, map_not_found_error, ApiResult};
use crate::model::post::Post;
use crate::AppState;
use axum::extract::{Path, State};
use axum::http::HeaderMap;
use axum::response::IntoResponse;
use axum::Json;
use diesel::NotFound;

pub async fn get_posts(State(state): State<AppState>) -> ApiResult<Json<Vec<Post>>> {
    let result = state
        .post_service
        .get_all_posts()
        .await
        .map_err(map_internal_error)?;

    Ok(Json(result))
}

pub async fn get_post(
    Path(post_id): Path<i32>,
    State(state): State<AppState>,
) -> ApiResult<Json<Option<Post>>> {
    let result = state
        .post_service
        .get_post(post_id)
        .await
        .map_err(map_internal_error)?;

    Ok(Json(result))
}

pub async fn get_post_image(
    Path(post_id): Path<i32>,
    State(state): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    let result = state
        .post_service
        .get_post_image(post_id)
        .await
        .map_err(map_internal_error)?;

    let content_type = "image/png";

    let mut headers = HeaderMap::new();
    headers.insert(
        "Content-Type",
        content_type.parse().map_err(map_internal_error)?,
    );

    match result {
        None => Err(map_not_found_error(NotFound)),
        Some(data) => Ok((headers, data)),
    }
}
