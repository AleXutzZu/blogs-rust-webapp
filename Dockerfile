FROM node:18-alpine AS react-builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM rust:1.88 AS rust-builder
WORKDIR /usr/src/app

COPY Cargo.toml Cargo.lock ./
COPY src/ ./src
COPY migrations/ ./migrations
RUN cargo build --release

FROM debian:bookworm-slim AS runner
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends libpq5 \
 && rm -rf /var/lib/apt/lists/*

COPY --from=react-builder /app/dist ./frontend/dist

COPY --from=rust-builder /usr/src/app/target/release/blog_posts ./blog_posts
EXPOSE 3000

CMD ["./blog_posts"]
