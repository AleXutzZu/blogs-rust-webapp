use crate::error::AppError;
use crate::model::user::User;
use crate::repository::user::UserRepository;

pub struct UserService {
    user_repository: UserRepository,
}


impl UserService {
    pub fn new(user_repository: UserRepository) -> UserService {
        Self { user_repository }
    }

    pub async fn get_users(&self) -> Result<Vec<User>, AppError> {
        self.user_repository.fetch_all_users().await
    }
}