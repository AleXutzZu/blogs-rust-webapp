use bcrypt::DEFAULT_COST;
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
                    Err(LoginError)
                }
                Err(_) => Err(InternalError("Invalid password".to_string())),
            }
        } else {
            Err(LoginError)
        }
    }

    pub async fn logout(&self, session_id: String) -> AppResult<()> {
        self.session_repository.delete_session(session_id).await?;
        Ok(())
    }
    
    pub async fn get_user_by_session(&self, session_id: String) -> AppResult<Option<User>> {
        self.session_repository.get_user_by_session(session_id).await
    }
    
    pub async fn create_user(&self, username: &str, password: &str) -> AppResult<()> {
        let hashed_pass = bcrypt::hash(password, DEFAULT_COST)?;
        
        self.user_repository.create_new_user(User {
            username: username.to_string(),
            password: hashed_pass,
            avatar: None
        }).await?;
        Ok(())
    }
}
