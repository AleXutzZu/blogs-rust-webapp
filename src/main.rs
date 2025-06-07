use blog_posts::database;
use deadpool_diesel::sqlite::Pool;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
mod controller;
mod error;
mod model;
mod repository;
mod schema;

mod service;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations/");

#[derive(Clone)]
struct AppState {
    user_service: Arc<service::user::UserService>,
    post_service: Arc<service::post::PostService>,
}

impl AppState {
    pub fn new(pool: Pool) -> Self {
        let user_repo = repository::user::UserRepository::new(pool.clone());
        let session_repo = repository::session::SessionRepository::new(pool.clone());
        let post_repo = repository::post::PostRepository::new(pool.clone());

        let user_service = Arc::new(service::user::UserService::new(user_repo, session_repo));
        let post_service = Arc::new(service::post::PostService::new(post_repo));

        Self {
            user_service,
            post_service,
        }
    }
}

#[tokio::main]
async fn main() {
    let pool = database::create_pool();

    {
        let conn = pool.get().await.unwrap();
        conn.interact(|conn| conn.run_pending_migrations(MIGRATIONS).map(|_| ()))
            .await
            .unwrap()
            .unwrap();
    }

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:5173".parse::<axum::http::HeaderValue>().unwrap())
        .allow_credentials(true)
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::DELETE,
        ]);

    let state = AppState::new(pool);
    let app = axum::Router::new()
        .fallback_service(tower_http::services::ServeDir::new("frontend/dist"))
        // .not_found_service(tower_http::services::ServeFile::new("frontend/dist/index.html"))
        .route(
            "/api/posts",
            axum::routing::get(controller::post::get_posts),
        )
        .route(
            "/api/posts/{postId}",
            axum::routing::get(controller::post::get_post),
        )
        .route(
            "/api/posts/{postId}/image",
            axum::routing::get(controller::post::get_post_image),
        )
        // .route("api/posts/create", TODO: add POST mapping)
        // .route("api/posts/{postId}", TODO: add deleter)
        // .route("api/user/{username}", TODO: add getter)
        // .route("api/user/{username}/avatar", TODO: add getter)
        .route(
            "/api/auth/login",
            axum::routing::post(controller::user::login_user),
        )
        .route(
            "/api/auth/logout",
            axum::routing::post(controller::user::logout_user),
        )
        .route(
            "/api/auth/signup",
            axum::routing::post(controller::user::signup_user),
        )
        .route(
            "/api/auth/me",
            axum::routing::get(controller::user::validate_session),
        )
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

/*async fn accept_form(State(state): State<Arc<AppState>>, mut form_data: Multipart) -> Result<(), (StatusCode, String)> {
    let mut new_post = blog_posts::models::InsertPost::default();

    new_post.date = Local::now().date_naive();

    while let Some(field) = form_data.next_field().await.map_err(internal_error)? {
        let name = field.name().unwrap().to_string();

        match name.as_str() {
            "username" => {
                new_post.username = field.text().await.map_err(internal_error)?;
            }
            "avatar" => {
                let url_result = field.text().await;

                match url_result {
                    Ok(url) => {
                        if url.is_empty() {
                            new_post.avatar = None;
                        } else {
                            let res = state.http_client.get(url).send()
                                .await
                                .map_err(internal_error)?
                                .bytes()
                                .await
                                .map_err(internal_error)?
                                .to_vec();

                            if res.is_empty() {
                                new_post.avatar = None;
                            } else {
                                new_post.avatar = Some(res);
                            }
                        }
                    }
                    _ => new_post.avatar = None
                }
            }
            "image" => {
                let file_data = field.bytes().await;

                match file_data {
                    Ok(data) => {
                        if data.is_empty() {
                            new_post.image = None
                        } else {
                            new_post.image = Some(data.to_vec())
                        }
                    }
                    _ => new_post.image = None,
                }
            }
            "body" => {
                new_post.body = field.text().await.map_err(internal_error)?;
            }
            _ => {}
        }
    }

    let conn = state.connection_pool.get().await.map_err(internal_error)?;
    let _res = conn
        .interact(|conn| {
            diesel::insert_into(posts::table())
                .values(new_post)
                .execute(conn)
        })
        .await.map_err(internal_error)?.map_err(internal_error)?;
    Ok(())
}
*/
