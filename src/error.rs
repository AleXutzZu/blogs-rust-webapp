use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error(transparent)]
    PoolError(#[from] deadpool_diesel::PoolError),
    #[error(transparent)]
    DieselError(#[from] diesel::result::Error),
    #[error(transparent)]
    InteractError(#[from] deadpool_diesel::InteractError),
    #[error("Could not be logged in: {0}")]
    LoginError(String),
    #[error("Could not find: {0}")]
    NotFoundError(String),
    #[error("Error: {0}")]
    InternalError(String),
    #[error(transparent)]
    BcryptError(#[from] bcrypt::BcryptError),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::PoolError(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
            AppError::DieselError(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
            AppError::InteractError(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
            AppError::LoginError(_) => StatusCode::UNAUTHORIZED.into_response(),
            AppError::NotFoundError(_) => StatusCode::NOT_FOUND.into_response(),
            AppError::InternalError(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
            AppError::BcryptError(_) => StatusCode::BAD_REQUEST.into_response(),
        }
    }
}
pub type AppResult<T> = Result<T, AppError>;
