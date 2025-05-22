use diesel::{Queryable, Selectable, Insertable};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Selectable, Insertable)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(primary_key(username))]
pub struct User {
    pub username: String,
    #[serde(skip_serializing)]
    pub password: String,
    pub avatar: Option<Vec<u8>>,
}