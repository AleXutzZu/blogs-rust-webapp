use axum::http::StatusCode;

#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error(transparent)]
    PoolError(#[from] deadpool_diesel::PoolError),
    #[error(transparent)]
    DieselError(#[from] diesel::result::Error),
    #[error(transparent)]
    InteractError(#[from] deadpool_diesel::InteractError),
}

pub type AppResult<T> = Result<T, AppError>;

pub type ApiResult<T> = Result<T, (StatusCode, String)>;

pub fn map_internal_error<E>(err: E) -> (StatusCode, String)
where
    E: std::error::Error,
{
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}

pub fn map_not_found_error<E>(err: E) -> (StatusCode, String)
where
    E: std::error::Error,
{
    (StatusCode::NOT_FOUND, err.to_string())
}
