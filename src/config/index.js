class Config {

  constructor() {
    this.connection = null;
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    if (process.env.NODE_ENV === 'development') {
      this.db = 'mine-dev';
    } else if (process.env.NODE_ENV === 'production') {
      this.db = 'mine';
    } else if (process.env.NODE_ENV === 'test') {
      this.db = 'mine-test';
    }
    process.env.MONGO_URL = 'mongodb://localhost/' + this.db;
  }
}
export default new Config();
