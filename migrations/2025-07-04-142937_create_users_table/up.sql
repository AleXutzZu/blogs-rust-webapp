-- Your SQL goes here


CREATE TABLE users
(
    username VARCHAR PRIMARY KEY NOT NULL,
    password VARCHAR             NOT NULL,
    avatar   BYTEA,
    joined     DATE            NOT NULL
);