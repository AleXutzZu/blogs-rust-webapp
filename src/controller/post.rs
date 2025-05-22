use crate::error::{map_internal_error, ApiResult};
use crate::model::post::Post;
use crate::AppState;
use axum::extract::State;
use axum::Json;
use std::sync::Arc;

pub async fn get_posts(state: State<Arc<AppState>>) -> ApiResult<Json<Vec<Post>>> {
    let service = state
        .post_service
        .get_all_posts()
        .await
        .map_err(map_internal_error)?;

    Ok(Json(service))
}
