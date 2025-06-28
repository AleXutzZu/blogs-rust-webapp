use crate::error::AppResult;
use crate::model::post::{NewPost, Post};
use crate::model::user::User;
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
            date: chrono::Utc::now().naive_utc(),
        };

        self.post_repository.create_post(post).await?;
        Ok(())
    }
    
    pub async fn get_posts_of_user(&self, user: &User, page: i32, page_size: i32) -> AppResult<Vec<Post>> {
        self.post_repository.get_posts_by_username(user, page, page_size).await
    }
    
    pub async fn get_post_count_by_username(&self, username: &str) -> AppResult<i64> {
        self.post_repository.get_post_count_by_username(username.to_string()).await
    }
}
