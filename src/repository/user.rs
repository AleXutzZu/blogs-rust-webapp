use crate::error::AppResult;
use crate::model::user::User;
use deadpool_diesel::sqlite::{Manager, Object};
use deadpool_diesel::Pool;
use diesel::QueryDsl;
use diesel::OptionalExtension;
use diesel::{RunQueryDsl, SelectableHelper};

pub struct UserRepository {
    connection_pool: Pool<Manager, Object>,
}

impl UserRepository {
    pub fn new(connection_pool: Pool<Manager, Object>) -> Self {
        Self { connection_pool }
    }

    pub async fn fetch_all_users(&self) -> AppResult<Vec<User>> {
        use crate::schema::users::dsl::*;

        let conn = self.connection_pool.get().await?;

        let results = conn
            .interact(|conn| users.select(User::as_select()).load::<User>(conn))
            .await??;

        Ok(results)
    }

    pub async fn create_new_user(&self, user: User) -> AppResult<()> {
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
}
