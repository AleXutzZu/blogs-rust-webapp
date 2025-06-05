-- Your SQL goes here

CREATE TABLE posts
(
    id       INTEGER NOT NULL PRIMARY KEY,
    title    TEXT    NOT NULL,
    body     TEXT    NOT NULL,
    date     DATE    NOT NULL,
    image    BLOB,
    username VARCHAR NOT NULL,
    FOREIGN KEY (username) REFERENCES users (username)
);