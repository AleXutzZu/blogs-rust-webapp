-- Your SQL goes here

CREATE TABLE posts
(
    id       SERIAL PRIMARY KEY,
    title    TEXT      NOT NULL,
    body     TEXT      NOT NULL,
    date     TIMESTAMP NOT NULL,
    image    BYTEA,
    username VARCHAR   NOT NULL,
    FOREIGN KEY (username) REFERENCES users (username)
);