use crate::error::AppResult;
use crate::model::post::{NewPost, Post};
use crate::model::user::User;
use deadpool_diesel::postgres::{Manager, Object};
use deadpool_diesel::Pool;
use diesel::associations::HasTable;
use diesel::{
    BelongingToDsl, ExpressionMethods, OptionalExtension, QueryDsl, RunQueryDsl, SelectableHelper,
};

pub struct PostRepository {
    connection_pool: Pool<Manager, Object>,
}

impl PostRepository {
    pub fn new(connection_pool: Pool<Manager, Object>) -> Self {
        Self { connection_pool }
    }

    pub async fn fetch_posts_on_page(&self, page: u32) -> AppResult<Vec<Post>> {
        let posts_per_page: i64 = 10;

        use crate::schema::posts::dsl::*;
        let conn = self.connection_pool.get().await?;
        let result = conn
            .interact(move |conn| {
                let offset_count: i64 = (page - 1) as i64 * posts_per_page;

                posts::table()
                    .select(Post::as_select())
                    .order_by(date.desc())
                    .offset(offset_count)
                    .limit(posts_per_page)
                    .load(conn)
            })
            .await??;

        Ok(result)
    }

    pub async fn fetch_post(&self, post_id: i32) -> AppResult<Option<Post>> {
        use crate::schema::posts::dsl::*;
        let conn = self.connection_pool.get().await?;

        let result = conn
            .interact(move |conn| {
                posts
                    .find(post_id)
                    .select(Post::as_select())
                    .first(conn)
                    .optional()
            })
            .await??;

        Ok(result)
    }

    pub async fn create_post(&self, post: NewPost) -> AppResult<()> {
        use crate::schema::posts::dsl::*;
        let conn = self.connection_pool.get().await?;
        conn.interact(move |conn| {
            diesel::insert_into(posts::table())
                .values(post)
                .execute(conn)
        })
        .await??;
        Ok(())
    }

    pub async fn get_post_count_by_username(&self, username: String) -> AppResult<i64> {
        use crate::schema::posts::dsl::posts;
        let conn = self.connection_pool.get().await?;
        let result = conn
            .interact(move |conn| {
                posts
                    .filter(crate::schema::posts::dsl::username.eq(username))
                    .count()
                    .get_result(conn)
            })
            .await??;

        Ok(result)
    }

    pub async fn get_posts_by_username(&self, user: &User, page: i32) -> AppResult<Vec<Post>> {
        let posts_per_page: i64 = 7;

        let conn = self.connection_pool.get().await?;
        let username = user.username.clone();
        let result = conn
            .interact(move |conn| {
                let offset_count: i64 = (page - 1) as i64 * posts_per_page;

                let user = User {
                    username,
                    ..Default::default()
                };
                Post::belonging_to(&user)
                    .select(Post::as_select())
                    .order_by(crate::schema::posts::dsl::date.desc())
                    .offset(offset_count)
                    .limit(posts_per_page)
                    .load(conn)
            })
            .await??;

        Ok(result)
    }

    pub async fn delete_post_belonging_to_username(
        &self,
        post_id: i32,
        user: String,
    ) -> AppResult<()> {
        use crate::schema::posts::dsl::*;
        let conn = self.connection_pool.get().await?;

        conn.interact(move |conn| {
            diesel::delete(posts::table())
                .filter(id.eq(post_id))
                .filter(username.eq(user))
                .execute(conn)
        })
        .await??;

        Ok(())
    }
}
