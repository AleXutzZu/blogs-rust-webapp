use axum::extract::{Multipart, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{Html, IntoResponse};
use blog_posts::database;
use blog_posts::models::Post;
use blog_posts::schema::posts::dsl::posts;
use chrono::{Local, NaiveDate};
use deadpool_diesel::sqlite::Pool;
use diesel::associations::HasTable;
use diesel::{ExpressionMethods, NotFound, QueryDsl, RunQueryDsl, SelectableHelper};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use serde::Serialize;
use std::sync::Arc;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations/");

struct AppState {
    connection_pool: Pool,
    http_client: reqwest::Client,
}

#[derive(Serialize)]
struct ClientPost {
    body: String,
    username: String,
    avatar: bool,
    image: bool,
    post_id: i32,
    date: NaiveDate,

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

    let state = Arc::new(AppState {
        // templates,
        connection_pool: pool,
        http_client: reqwest::Client::new(),
    });

    let app = axum::Router::new()
        .fallback_service(tower_http::services::ServeDir::new("frontend/dist"))
        // .not_found_service(tower_http::services::ServeFile::new("frontend/dist/index.html"))
        /*.route("/home", axum::routing::get(home).post(accept_form))
        .route("/posts/:post_id", axum::routing::get(get_image))
        .route("/avatars/:post_id", axum::routing::get(get_avatar))*/
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}


/*async fn home(State(state): State<Arc<AppState>>) -> Result<Html<String>, (StatusCode, String)> {
    let template = state.templates.get_template("home").map_err(internal_error)?;
    let conn = state.connection_pool.get().await.map_err(internal_error)?;

    use blog_posts::schema::posts::id;

    let user_posts = conn.interact(|conn| {
        QueryDsl::order(posts::table().select(Post::as_select()), id.desc()).load(conn)
    }).await.map_err(internal_error)?.map_err(internal_error)?;

    let client = user_posts.into_iter().map(|post| {
        ClientPost {
            username: post.username,
            date: post.date,
            body: post.body,
            post_id: post.id,
            image: post.image.is_some(),
            avatar: post.avatar.is_some(),
        }
    }).collect::<Vec<_>>();

    let rendered = template
        .render(context! {
            posts => client,
        })
        .map_err(internal_error)?;

    Ok(Html(rendered))
}
async fn accept_form(State(state): State<Arc<AppState>>, mut form_data: Multipart) -> Result<(), (StatusCode, String)> {
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

async fn get_image(axum::extract::Path(post_id): axum::extract::Path<i32>, state: State<Arc<AppState>>) -> Result<impl IntoResponse, (StatusCode, String)> {
    let conn = state.connection_pool.get().await.map_err(internal_error)?;

    let res = conn.interact(move |conn| {
        posts::table().find(post_id).select(Post::as_select()).first(conn)
    }).await.map_err(internal_error)?.map_err(internal_error)?;

    let content_type = "image/png";

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", content_type.parse().map_err(internal_error)?);

    match res.image {
        None => {
            Err(internal_error(NotFound))
        }
        Some(data) => {
            Ok((headers, data))
        }
    }
}

async fn get_avatar(axum::extract::Path(post_id): axum::extract::Path<i32>, state: State<Arc<AppState>>) -> Result<impl IntoResponse, (StatusCode, String)> {
    let conn = state.connection_pool.get().await.map_err(internal_error)?;

    let res = conn.interact(move |conn| {
        posts::table().find(post_id).select(Post::as_select()).first(conn)
    }).await.map_err(internal_error)?.map_err(internal_error)?;

    let content_type = "image/png";

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", content_type.parse().map_err(internal_error)?);

    match res.avatar {
        None => {
            Err(internal_error(NotFound))
        }
        Some(data) => {
            Ok((headers, data))
        }
    }
}*/

fn internal_error<E>(err: E) -> (StatusCode, String)
where
    E: std::error::Error,
{
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}