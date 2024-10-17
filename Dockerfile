FROM rust:1.78 AS builder

WORKDIR /usr/src/app

COPY . .

RUN cargo build --release

FROM ubuntu:latest

RUN apt-get update && apt-get install -y libsqlite3-dev
ENV DATABASE_URL=/app/db.sqlite

WORKDIR /app

COPY --from=builder /usr/src/app/target/release/blog_posts /app/blog_posts

COPY /templates /templates

EXPOSE 3000

CMD ["./blog_posts"]