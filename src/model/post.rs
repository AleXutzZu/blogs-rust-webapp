use crate::model::user::User;
use chrono::NaiveDate;
use diesel::{Associations, Insertable, Queryable, Selectable};
use serde::Serialize;

#[derive(Queryable, Selectable, Serialize, Associations)]
#[diesel(table_name = crate::schema::posts)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[diesel(belongs_to(User, foreign_key=username))]
pub struct Post {
    pub id: i32,
    pub body: String,
    pub date: NaiveDate,
    #[serde(skip_serializing)]
    pub image: Option<Vec<u8>>,
    pub username: String,
}

#[derive(Insertable, Default)]
#[diesel(table_name = crate::schema::posts)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct InsertPost {
    pub body: String,
    pub date: NaiveDate,
    pub image: Option<Vec<u8>>,
    pub username: String,
}
