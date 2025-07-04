use crate::model::user::User;
use chrono::NaiveDateTime;
use diesel::{Associations, Identifiable, Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Serialize, Associations, Identifiable)]
#[diesel(table_name = crate::schema::posts)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(belongs_to(User, foreign_key=username))]
pub struct Post {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub date: NaiveDateTime,
    #[serde(skip_serializing)]
    pub image: Option<Vec<u8>>,
    pub username: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::posts)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct NewPost {
    pub title: String,
    pub body: String,
    pub date: NaiveDateTime,
    pub image: Option<Vec<u8>>,
    pub username: String,
}

#[derive(Deserialize)]
pub struct PaginatedPostSearch {
    pub page: Option<i32>,
}