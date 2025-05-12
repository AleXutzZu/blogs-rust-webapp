-- Your SQL goes here

CREATE TABLE posts
(
    id       INTEGER NOT NULL PRIMARY KEY,
    body     TEXT    NOT NULL,
    date     DATE    NOT NULL,
    image    BLOB,
    username VARCHAR(200) NOT NULL,
    avatar   BLOB
);