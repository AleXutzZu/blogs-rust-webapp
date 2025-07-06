use crate::error::AppError::SignUpError;
use crate::error::AppResult;
use crate::model::user::{UpdateUser, User};
use deadpool_diesel::postgres::{Manager, Object};
use deadpool_diesel::Pool;
use diesel::ExpressionMethods;
use diesel::OptionalExtension;
use diesel::QueryDsl;
use diesel::{RunQueryDsl, SelectableHelper};

pub struct UserRepository {
    connection_pool: Pool<Manager, Object>,
}

impl UserRepository {
    pub fn new(connection_pool: Pool<Manager, Object>) -> Self {
        Self { connection_pool }
    }

    fn is_correct_username(username: &str) -> bool {
        !username.is_empty()
            && username
                .chars()
                .all(|c| c.is_ascii_alphanumeric() || c == '_')
    }

    pub async fn create_new_user(&self, user: User) -> AppResult<()> {
        if !Self::is_correct_username(&user.username) {
            return Err(SignUpError("Username is invalid".to_string()));
        }

        use crate::schema::users::dsl::*;
        let conn = self.connection_pool.get().await?;

        conn.interact(|conn| diesel::insert_into(users).values(user).execute(conn))
            .await??;
        Ok(())
    }

    pub async fn get_user_by_username(&self, username: String) -> AppResult<Option<User>> {
        use crate::schema::users::dsl::users;
        let conn = self.connection_pool.get().await?;

        let result = conn
            .interact(|conn| {
                users
                    .find(username)
                    .select(User::as_select())
                    .first(conn)
                    .optional()
            })
            .await??;

        Ok(result)
    }

    pub async fn update_user(&self, user: UpdateUser) -> AppResult<()> {
        let conn = self.connection_pool.get().await?;

        conn.interact(move |conn| {
            diesel::update(crate::schema::users::table)
                .set(&user)
                .filter(crate::schema::users::username.eq(&user.username))
                .execute(conn)
        })
        .await??;

        Ok(())
    }
}
