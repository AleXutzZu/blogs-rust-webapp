use crate::error::AppResult;
use crate::model::post::{NewPost, Post};
use crate::repository::post::PostRepository;

pub struct PostService {
    post_repository: PostRepository,
}

impl PostService {
    pub fn new(post_repository: PostRepository) -> Self {
        Self { post_repository }
    }

    pub async fn get_all_posts(&self) -> AppResult<Vec<Post>> {
        let result = self.post_repository.fetch_all_posts().await?;
        Ok(result)
    }

    pub async fn get_post(&self, id: i32) -> AppResult<Option<Post>> {
        let result = self.post_repository.fetch_post(id).await?;
        Ok(result)
    }

    pub async fn get_post_image(&self, id: i32) -> AppResult<Option<Vec<u8>>> {
        let result = self.post_repository.fetch_post(id).await?;
        match result {
            None => Ok(None),
            Some(post) => Ok(post.image),
        }
    }

    pub async fn create_post(
        &self,
        title: String,
        body: String,
        image: Option<Vec<u8>>,
        username: String,
    ) -> AppResult<()> {
        let post = NewPost {
            title,
            body,
            image,
            username,
            date: chrono::Utc::now().date_naive(),
        };

        self.post_repository.create_post(post).await?;
        Ok(())
    }
}
