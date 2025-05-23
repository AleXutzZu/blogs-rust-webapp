use crate::error::{map_internal_error, ApiResult};
use crate::model::post::Post;
use crate::AppState;
use axum::extract::{Path, State};
use axum::Json;
use std::sync::Arc;

pub async fn get_posts(State(state) : State<AppState>) -> ApiResult<Json<Vec<Post>>> {
    let result = state
        .post_service
        .get_all_posts()
        .await
        .map_err(map_internal_error)?;

    Ok(Json(result))
}

pub async fn get_post(Path(post_id): Path<i32>, State(state): State<AppState>) -> ApiResult<Json<Option<Post>>> {
    let result = state
        .post_service
        .get_post(post_id)
        .await
        .map_err(map_internal_error)?;

    Ok(Json(result))
}
