use std::path::Path;
use axum::extract::{Multipart, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{Html, IntoResponse};
use blog_posts::database;
use deadpool_diesel::sqlite::Pool;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use minijinja::context;
use std::sync::Arc;
use diesel::associations::HasTable;
use diesel::{QueryDsl, RunQueryDsl, SelectableHelper};
use blog_posts::models::Post;
use blog_posts::schema::posts::dsl::posts;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations/");

struct AppState {
    templates: minijinja::Environment<'static>,
    connection_pool: Pool,
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

    let mut templates = minijinja::Environment::new();
    templates.add_template("home", include_str!("../templates/home.html")).unwrap();

    let state = Arc::new(AppState { templates, connection_pool: pool });

    let app = axum::Router::new()
        .route("/home", axum::routing::get(home).post(accept_form))
        .route("/posts/:post_id", axum::routing::get(get_image))
        .route("/avatars/:post_id", axum::routing::get(get_avatar))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}


async fn home(State(state): State<Arc<AppState>>) -> Result<Html<String>, StatusCode> {
    let template = state.templates.get_template("home").unwrap();
    let some_example_entries = vec!["Data 1", "Data 2", "Data 3"];

    let rendered = template
        .render(context! {
            entries => some_example_entries,
        })
        .unwrap();

    Ok(Html(rendered))
}
async fn accept_form(State(state): State<Arc<AppState>>, mut form_data: Multipart) {
    let mut new_post = blog_posts::models::InsertPost::default();

    while let Some(field) = form_data.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();

        match name.as_str() {
            "username" => {
                new_post.username = field.text().await.unwrap();
            }
            "avatar" => {

                //todo get the image from the url with reqwest
            }
            "image" => {
                let file_data = field.bytes().await.unwrap();

                new_post.image = Some(file_data.to_vec());
            }
            "body" => {
                new_post.body = field.text().await.unwrap();
            }
            _ => {}
        }
    }

    let conn = state.connection_pool.get().await.unwrap();
    let _res = conn
        .interact(|conn| {
            diesel::insert_into(posts::table())
                .values(new_post)
                .execute(conn)
        })
        .await.unwrap().unwrap();
}

async fn get_image(axum::extract::Path(post_id): axum::extract::Path<i32>, state: State<Arc<AppState>>) -> impl IntoResponse {
    let conn = state.connection_pool.get().await.unwrap();

    let res = conn.interact(move |conn| {
        posts::table().find(post_id).select(Post::as_select()).first(conn)
    }).await.unwrap().unwrap();

    let content_type = "image/png";

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", content_type.parse().unwrap());

    (headers, res.image.unwrap())
}

async fn get_avatar(axum::extract::Path(post_id): axum::extract::Path<i32>, state: State<Arc<AppState>>) -> impl IntoResponse {
    let conn = state.connection_pool.get().await.unwrap();

    let res = conn.interact(move |conn| {
        posts::table().find(post_id).select(Post::as_select()).first(conn)
    }).await.unwrap().unwrap();

    let content_type = "image/png";

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", content_type.parse().unwrap());

    (headers, res.avatar.unwrap())
}
