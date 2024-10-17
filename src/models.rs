use chrono::NaiveDate;
use diesel::prelude::*;
use serde::{Serialize, Deserialize};
#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = crate::schema::posts)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Post {
    pub id: i32,
    pub body: String,
    pub date: NaiveDate,
    pub image: Option<Vec<u8>>,
    pub username: String,
    pub avatar: Option<Vec<u8>>,
}


#[derive(Insertable, Default)]
#[diesel(table_name = crate::schema::posts)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct InsertPost {
    pub body: String,
    pub date: NaiveDate,
    pub image: Option<Vec<u8>>,
    pub username: String,
    pub avatar: Option<Vec<u8>>,
}
