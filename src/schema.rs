// @generated automatically by Diesel CLI.

diesel::table! {
    posts (id) {
        id -> Integer,
        body -> Text,
        date -> Date,
        image -> Nullable<Binary>,
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

diesel::allow_tables_to_appear_in_same_query!(
    posts,
    users,
);
