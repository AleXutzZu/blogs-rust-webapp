use blog_posts::database;
use deadpool_diesel::postgres::Pool;
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
        .allow_origin(
            "http://localhost:5173"
                .parse::<axum::http::HeaderValue>()
                .unwrap(),
        )
        .allow_credentials(true)
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::DELETE,
        ]);

    let state = AppState::new(pool);
    let api_routes = axum::Router::new()
        .route(
            "/posts",
            axum::routing::get(controller::post::get_posts_on_page),
        )
        .route(
            "/posts/{postId}",
            axum::routing::get(controller::post::get_post),
        )
        .route(
            "/posts/{postId}/image",
            axum::routing::get(controller::post::get_post_image),
        )
        .route(
            "/posts/create",
            axum::routing::post(controller::post::create_post),
        )
        .route(
            "/posts/{postId}",
            axum::routing::delete(controller::post::delete_user_post),
        )
        .route(
            "/users/{username}",
            axum::routing::get(controller::user::get_user_with_posts),
        )
        .route(
            "/users/{username}",
            axum::routing::post(controller::user::update_user),
        )
        .route(
            "/users/{username}/avatar",
            axum::routing::get(controller::user::get_user_avatar),
        )
        .route(
            "/auth/login",
            axum::routing::post(controller::user::login_user),
        )
        .route(
            "/auth/logout",
            axum::routing::post(controller::user::logout_user),
        )
        .route(
            "/auth/signup",
            axum::routing::post(controller::user::signup_user),
        )
        .route(
            "/auth/me",
            axum::routing::get(controller::user::validate_session),
        );

    let assets = tower_http::services::ServeDir::new("frontend/dist/assets");

    let index = tower_http::services::ServeFile::new("frontend/dist/index.html");
    let favicon = axum::routing::get_service(tower_http::services::ServeFile::new(
        "frontend/dist/favicon.ico",
    ));
    let spa_dir = tower_http::services::ServeDir::new("frontend/dist").fallback(index);
    
    let app = axum::Router::new()
        .nest("/api", api_routes)
        .nest_service("/assets", assets)
        .route("/favicon.ico", favicon)
        .fallback(axum::routing::get_service(spa_dir))
        .with_state(state)
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
