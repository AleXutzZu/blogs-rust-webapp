use deadpool_diesel::sqlite::{Manager, Object};
use deadpool_diesel::Pool;
use diesel::{RunQueryDsl, SelectableHelper};
use diesel::query_dsl::select_dsl::SelectDsl;
use crate::error::AppError;
use crate::model::user::User;

pub struct UserRepository {
    connection_error: Pool<Manager, Object>,
}

impl UserRepository {
    pub fn new(connection_error: Pool<Manager, Object>) -> Self {
        Self { connection_error }
    }

    pub async fn fetch_all_users(&self) -> Result<Vec<User>, AppError> {
        use crate::schema::users::dsl::*;

        let conn = self.connection_error.get().await?;

        let results = conn.interact(|conn| {
            users.select(User::as_select())
            .load::<User>(conn)
        }).await??;

        Ok(results)
    }
}