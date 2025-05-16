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