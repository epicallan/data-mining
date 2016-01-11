// Invoke 'strict' JavaScript mode
'use strict';
/**
 * TODO should offer various configs depending on env variables
 */
import mongoose from 'mongoose';

class Config {

  constructor() {
    this.connection = null;
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    if (process.env.NODE_ENV === 'development') {
      this.db = 'mine-dev';
    } else if (process.env.NODE_ENV === 'production') {
      this.db = 'mine';
    } else if (process.env.NODE_ENV == 'test') {
      this.db = 'mine-test';
    }
  }

  dbOpen(callback) {
    mongoose.connect('mongodb://localhost/' + this.db, (err) => {
      if (err) {
        throw new Error(err);
      } else {
        console.log('connected to mongodb: ' + this.db);
        callback();
      }
    });
    this.connection = mongoose.connection;
  }

  dbClose() {
    if (this.connection) {
      mongoose.disconnect();
    } else {
      console.log('connection not available');
    }
  }

  removeCollection(collection, cb) {
    mongoose.connection.db.dropCollection(collection, function(err, result) {
      if (err) throw err;
      console.log(result);
      cb();
    });
  }

}
export default new Config();
