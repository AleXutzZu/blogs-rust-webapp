use crate::error::AppError::{InternalError, LoginError};
use crate::error::{AppError, AppResult};
use crate::model::session::Session;
use crate::model::user::User;
use crate::repository::session::SessionRepository;
use crate::repository::user::UserRepository;

pub struct UserService {
    user_repository: UserRepository,
    session_repository: SessionRepository,
}

impl UserService {
    pub fn new(user_repository: UserRepository, session_repository: SessionRepository) -> Self {
        Self {
            user_repository,
            session_repository,
        }
    }

    pub async fn get_users(&self) -> Result<Vec<User>, AppError> {
        self.user_repository.fetch_all_users().await
    }

    pub async fn login(&self, username: &str, password: &str) -> AppResult<uuid::Uuid> {
        let user = self
            .user_repository
            .get_user_by_username(username.to_string())
            .await?;

        if let Some(result) = user {
            let verify = bcrypt::verify(password, result.password.as_str());
            match verify {
                Ok(boolean) => {
                    if boolean {
                        let session_id = uuid::Uuid::new_v4();

                        let session: Session = Session {
                            username: username.to_string(),
                            session_id: session_id.to_string(),
                        };
                        self.session_repository.add_session(session).await?;

                        return Ok(session_id);
                    }
                    Err(LoginError("Invalid password".to_string()))
                }
                Err(_) => Err(InternalError("Invalid password".to_string())),
            }
        } else {
            Err(LoginError("Invalid username".to_string()))
        }
    }
}
