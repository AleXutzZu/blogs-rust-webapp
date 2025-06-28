use crate::error::AppResult;
use crate::model::post::{NewPost, Post};
use crate::model::user::User;
use deadpool_diesel::sqlite::{Manager, Object};
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

    pub async fn fetch_all_posts(&self) -> AppResult<Vec<Post>> {
        use crate::schema::posts::dsl::*;
        let conn = self.connection_pool.get().await?;

        let result = conn
            .interact(|conn| {
                posts::table()
                    .select(Post::as_select())
                    .order_by(date.desc())
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

    pub async fn get_post_count_by_username(&self,  username: String) -> AppResult<i64> {
        use crate::schema::posts::dsl::posts;
        let conn = self.connection_pool.get().await?;
        let result = conn.interact(move |conn| {
            posts.filter(crate::schema::posts::dsl::username.eq(username)).count().get_result(conn)
        }).await??;
        
        Ok(result)
    }
    
    pub async fn get_posts_by_username(
        &self,
        user: &User,
        page: i32,
        page_size: i32,
    ) -> AppResult<Vec<Post>> {
        let conn = self.connection_pool.get().await?;
        let username = user.username.clone();
        let result = conn
            .interact(move |conn| {
                let offset_count: i64 = if page_size == -1 {
                    0
                } else {
                    (page - 1) as i64 * page_size as i64
                };

                let limit_count = if page_size == -1 {
                    i64::MAX
                } else {
                    page_size as i64
                };

                let user = User {
                    username,
                    ..Default::default()
                };
                Post::belonging_to(&user)
                    .select(Post::as_select())
                    .offset(offset_count)
                    .limit(limit_count)
                    .load(conn)
            })
            .await??;

        Ok(result)
    }
}
