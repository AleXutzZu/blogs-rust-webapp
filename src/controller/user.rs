use crate::AppState;
use axum::extract::State;
use std::sync::Arc;

pub async fn get_users(state: State<Arc<AppState>>) {
    println!("Fetched users");
    let result = state.user_service.get_users().await;

    match result {
        Ok(users) => { println!("Got some users") }
        Err(_) => { println!("Something went wrong") }
    }
}