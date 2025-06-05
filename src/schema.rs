// @generated automatically by Diesel CLI.

diesel::table! {
    posts (id) {
        id -> Integer,
        title -> Text,
        body -> Text,
        date -> Date,
        image -> Nullable<Binary>,
        username -> Text,
    }
}

diesel::table! {
    sessions (session_id) {
        session_id -> Nullable<Text>,
        username -> Text,
    }
}

diesel::table! {
    users (username) {
        username -> Text,
        password -> Text,
        avatar -> Nullable<Binary>,
    }
}

diesel::joinable!(posts -> users (username));
diesel::joinable!(sessions -> users (username));

diesel::allow_tables_to_appear_in_same_query!(
    posts,
    sessions,
    users,
);
