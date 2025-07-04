pub mod database {
    use deadpool_diesel::Pool;
    use deadpool_diesel::postgres::{Manager, Object};
    use dotenv::dotenv;
    pub fn create_pool() -> Pool<Manager, Object> {
        dotenv().ok();
        let db_url = std::env::var("DATABASE_URL").unwrap();
        let manager = Manager::new(db_url, deadpool_diesel::Runtime::Tokio1);
        let pool = Pool::builder(manager)
            .build().unwrap();
        pool
    }
}
