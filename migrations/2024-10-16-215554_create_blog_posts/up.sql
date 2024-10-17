-- Your SQL goes here

CREATE TABLE posts
(
    id       INTEGER NOT NULL PRIMARY KEY,
    body     TEXT    NOT NULL,
    date     TEXT    NOT NULL,
    image    BLOB,
    username VARCHAR NOT NULL,
    avatar   BLOB
);