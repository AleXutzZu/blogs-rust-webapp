use diesel::{Insertable, Queryable, Selectable};

#[derive(Insertable, Queryable, Selectable)]
#[diesel(table_name = crate::schema::sessions)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(primary_key(session_id))]
pub struct Session {
    pub session_id: String,
    pub username: String,
}
