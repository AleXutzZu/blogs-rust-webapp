# 📝 RustyPosts - Full-Stack Blog Application

This is a full-stack blogging platform built using:

- 🦀 [Rust](https://www.rust-lang.org/) (Axum framework)
- ⚛️ [React](https://reactjs.org/) (with Vite & TypeScript)
- 🐘 PostgreSQL for database
- 📦 Docker for containerized deployment

## 🌐 Features

- User authentication (signup, login, logout)
- View all posts or posts by specific users
- Basic post creation with image upload
- User profile editing with avatar support
- Responsive UI for mobile and desktop
- Optimized build using Vite and Docker multi-stage builds

---

## 🚀 Running locally

There is a `docker-compose.yml` file ready with a PostgresSQL container and the container for the webserver:
- For the PostgresSQL container, supply the user, password and database name as environment variables.
- For the webserver container, supply the `DATABASE_URL` environment variable and you are ready to go.

Aditionally, you can use the `Dockerfile` to build just the webserver container and hook it up to whatever Postgres database you have available.

You can also access the hosted version [here](https://rustyposts.onrender.com/).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please open a PR or issue.
