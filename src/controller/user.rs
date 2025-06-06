use crate::error::AppResult;
use crate::AppState;
use axum::extract::State;
use axum::http::StatusCode;
use axum::Form;
use axum_extra::extract::cookie::Cookie;
use axum_extra::extract::CookieJar;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct AuthForm {
    username: String,
    password: String,
}

pub async fn login_user(State(state): State<AppState>,  jar: CookieJar, Form(form): Form<AuthForm>)
                        -> AppResult<(CookieJar, StatusCode)> {
    let uuid = state.user_service
        .login(&form.username, &form.password)
        .await?;

    Ok((jar.add(Cookie::new("session_id", uuid.to_string())), StatusCode::NO_CONTENT))
}