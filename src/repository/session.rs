use crate::error::AppResult;
use crate::model::session::Session;
use crate::model::user::User;
use deadpool_diesel::postgres::{Manager, Object};
use deadpool_diesel::Pool;
use diesel::associations::HasTable;
use diesel::QueryDsl;
use diesel::{ExpressionMethods, SelectableHelper};
use diesel::RunQueryDsl;

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
            diesel::delete(sessions::table()).filter(username.eq(&session.username)).execute(conn)?;
            
            diesel::insert_into(sessions::table())
                .values(&session)
                .execute(conn)
        })
        .await??;

        Ok(())
    }
    
    pub async fn delete_session(&self, session_id: String) -> AppResult<()> {
        use crate::schema::sessions::dsl::sessions;
        let conn = self.connection_pool.get().await?;
        conn.interact(move |conn| {
            diesel::delete(sessions.filter(crate::schema::sessions::dsl::session_id.eq(session_id)))
                .execute(conn)
        })
        .await??;
        Ok(())
    }

    pub async fn get_user_by_session(&self, session_id: String) -> AppResult<Option<User>> {
        use crate::schema::sessions::dsl::sessions;
        use crate::schema::users::dsl::users;

        let conn = self.connection_pool.get().await?;

        let result = conn
            .interact(|conn| {
                sessions::table()
                    .left_join(users::table())
                    .filter(crate::schema::sessions::session_id.eq(session_id))
                    .select((Session::as_select(), Option::<User>::as_select()))
                    .first::<(Session, Option<User>)>(conn)
            })
            .await??;
        
        Ok(result.1)
    }
}
