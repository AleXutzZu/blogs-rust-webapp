-- Your SQL goes here
CREATE TABLE sessions
(
    session_id VARCHAR PRIMARY KEY,
    username   VARCHAR NOT NULL,
    FOREIGN KEY (username) REFERENCES users (username)
)