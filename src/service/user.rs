use crate::error::AppError::{InternalError, LoginError};
use crate::error::{AppError, AppResult};
use crate::model::session::Session;
use crate::model::user::{UpdateUser, User};
use crate::repository::session::SessionRepository;
use crate::repository::user::UserRepository;
use bcrypt::DEFAULT_COST;
use chrono::Utc;

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

    pub async fn get_user_by_username(&self, username: String) -> AppResult<Option<User>> {
        self.user_repository
            .get_user_by_username(username)
            .await
    }

    pub async fn login(&self, username: String, password: String) -> AppResult<uuid::Uuid> {
        let user = self
            .user_repository
            .get_user_by_username(username.clone())
            .await?;

        if let Some(result) = user {
            let verify = bcrypt::verify(password, result.password.as_str());
            match verify {
                Ok(boolean) => {
                    if boolean {
                        let session_id = uuid::Uuid::new_v4();

                        let session: Session = Session {
                            username,
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
        self.session_repository
            .get_user_by_session(session_id)
            .await
    }

    pub async fn create_user(&self, username: String, password: String) -> AppResult<()> {
        let hashed_pass = bcrypt::hash(password, DEFAULT_COST)?;

        self.user_repository
            .create_new_user(User {
                username,
                password: hashed_pass,
                avatar: None,
                joined: Utc::now().date_naive(),
            })
            .await?;
        Ok(())
    }

    pub async fn update_user_avatar(&self, username: String, avatar: Vec<u8>) -> AppResult<()> {
        let payload = UpdateUser {
            username: Some(username),
            password: None,
            avatar: Some(avatar),
        };

        self.user_repository.update_user(payload).await?;

        Ok(())
    }

    pub async fn get_user_avatar(&self, username: String) -> AppResult<Option<Vec<u8>>> {
        let user = self.get_user_by_username(username).await?;
        match user {
            None => Ok(None),
            Some(u) => {
                if let Some(avatar) = u.avatar {
                    Ok(Some(avatar))
                } else {
                    Ok(None)
                }
            }
        }
    }
}
