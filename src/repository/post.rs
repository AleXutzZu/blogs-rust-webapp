use crate::error::AppResult;
use crate::model::post::Post;
use deadpool_diesel::sqlite::{Manager, Object};
use deadpool_diesel::Pool;
use diesel::associations::HasTable;
use diesel::{QueryDsl, RunQueryDsl, SelectableHelper};

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
                    .load(conn)
            })
            .await??;

        Ok(result)
    }
}
