use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Serialize;

#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error(transparent)]
    PoolError(#[from] deadpool_diesel::PoolError),
    #[error(transparent)]
    InteractError(#[from] deadpool_diesel::InteractError),
    #[error("Invalid credentials")]
    LoginError,
    #[error("{0}")]
    NotFoundError(String),
    #[error("Error: {0}")]
    InternalError(String),
    #[error(transparent)]
    BcryptError(#[from] bcrypt::BcryptError),
    #[error(transparent)]
    FormError(#[from] axum_extra::extract::multipart::MultipartError),
    #[error("{0}")]
    SignUpError(String),
    #[error("{0}")]
    DieselError(String),
}

impl From<diesel::result::Error> for AppError {
    fn from(value: diesel::result::Error) -> Self {
        match value {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::UniqueViolation,
                _,
            ) => AppError::SignUpError("Username already exists".to_string()),
            _ => AppError::DieselError(value.to_string()),
        }
    }
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::PoolError(_)
            | AppError::DieselError(_)
            | AppError::InteractError(_)
            | AppError::BcryptError(_)
            | AppError::FormError(_)
            | AppError::InternalError(_)
            | AppError::SignUpError(_) => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),

            AppError::LoginError => (StatusCode::UNAUTHORIZED, self.to_string()),

            AppError::NotFoundError(_) => (StatusCode::NOT_FOUND, self.to_string()),
        };

        let body = Json(ErrorResponse {
            error: status.to_string(),
            message,
        });

        (status, body).into_response()
    }
}
pub type AppResult<T> = Result<T, AppError>;
pub type JsonResult<T> = AppResult<Json<T>>;
