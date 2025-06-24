use crate::error::AppResult;
use crate::model::post::{NewPost, Post};
use deadpool_diesel::sqlite::{Manager, Object};
use deadpool_diesel::Pool;
use diesel::associations::HasTable;
use diesel::{ExpressionMethods, Insertable, OptionalExtension, QueryDsl, RunQueryDsl, SelectableHelper};

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
}
