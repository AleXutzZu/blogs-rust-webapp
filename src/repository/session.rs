use crate::error::AppResult;
use crate::model::session::Session;
use deadpool_diesel::sqlite::{Manager, Object};
use deadpool_diesel::Pool;
use diesel::associations::HasTable;
use diesel::ExpressionMethods;
use diesel::QueryDsl;
use diesel::{OptionalExtension, RunQueryDsl};

pub struct SessionRepository {
    connection_pool: Pool<Manager, Object>,
}

impl SessionRepository {
    pub fn new(connection_pool: Pool<Manager, Object>) -> Self {
        Self { connection_pool }
    }

    pub async fn add_session(&self, session: Session) -> AppResult<()> {
        use crate::schema::sessions::dsl::*;
        let conn = self.connection_pool.get().await?;
        conn.interact(move |conn| {
            diesel::insert_into(sessions::table())
                .values(&session)
                .execute(conn)
        })
        .await??;

        Ok(())
    }

    pub async fn get_session(&self, username: String) -> AppResult<Option<Session>> {
        use crate::schema::sessions::dsl::sessions;
        let conn = self.connection_pool.get().await?;

        let result = conn
            .interact(move |conn| {
                sessions
                    .filter(crate::schema::sessions::dsl::username.eq(username))
                    .first(conn)
                    .optional()
            })
            .await??;

        Ok(result)
    }
}
