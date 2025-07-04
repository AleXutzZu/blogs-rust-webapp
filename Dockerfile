# 1) Build the React frontend
FROM node:18-alpine AS react-builder
WORKDIR /app

# only copy package.json for cache
COPY frontend/package*.json ./
RUN npm ci

# copy sources & build
COPY frontend/ ./
RUN npm run build

# 2) Compile the Rust backend
FROM rust:1.88 AS rust-builder
WORKDIR /usr/src/app

COPY Cargo.toml Cargo.lock ./
COPY src/ ./src
COPY migrations/ ./migrations
RUN cargo build --release

# 3) Final image
FROM debian:bookworm-slim AS runner
WORKDIR /app

# Install runtime deps
RUN apt-get update \
 && apt-get install -y --no-install-recommends libpq5 \
 && rm -rf /var/lib/apt/lists/*

# Copy ONLY the React build output
COPY --from=react-builder /app/dist ./frontend/dist

# Copy your compiled server
COPY --from=rust-builder /usr/src/app/target/release/blog_posts ./blog_posts

RUN mkdir -p /app/database

ENV DATABASE_URL=/app/database/db.sqlite
EXPOSE 3000

CMD ["./blog_posts"]
