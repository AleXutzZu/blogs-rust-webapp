// @generated automatically by Diesel CLI.

diesel::table! {
    posts (id) {
        id -> Integer,
        body -> Text,
        date -> Date,
        image -> Nullable<Binary>,
        username -> Text,
        avatar -> Nullable<Binary>,
    }
}
