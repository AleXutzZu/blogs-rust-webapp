use diesel::{Identifiable, Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use crate::model::post::Post;

#[derive(Serialize, Deserialize, Queryable, Selectable, Insertable, Identifiable, Default)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(primary_key(username))]
pub struct User {
    pub username: String,
    #[serde(skip_serializing)]
    pub password: String,
    #[serde(skip_serializing)]
    pub avatar: Option<Vec<u8>>,
}

#[derive(Serialize)]
pub struct UserDTO {
    #[serde(flatten)]
    pub user: User,
    pub posts: Vec<Post>,
    pub total_posts: i64,
}