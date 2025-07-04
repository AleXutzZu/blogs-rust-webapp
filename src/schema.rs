// @generated automatically by Diesel CLI.

diesel::table! {
    posts (id) {
        id -> Int4,
        title -> Text,
        body -> Text,
        date -> Timestamp,
        image -> Nullable<Bytea>,
        username -> Varchar,
    }
}

diesel::table! {
    sessions (session_id) {
        session_id -> Varchar,
        username -> Varchar,
    }
}

diesel::table! {
    users (username) {
        username -> Varchar,
        password -> Varchar,
        avatar -> Nullable<Bytea>,
        joined -> Date,
    }
}

diesel::joinable!(posts -> users (username));
diesel::joinable!(sessions -> users (username));

diesel::allow_tables_to_appear_in_same_query!(
    posts,
    sessions,
    users,
);
