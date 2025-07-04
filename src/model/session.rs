use crate::model::user::User;
use diesel::{Associations, Insertable, Queryable, Selectable};

#[derive(Insertable, Queryable, Selectable, Associations)]
#[diesel(table_name = crate::schema::sessions)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(session_id))]
#[diesel(belongs_to(User, foreign_key = username))]
pub struct Session {
    pub session_id: String,
    pub username: String,
}
