import chai from 'chai';
import fs from 'fs-extra';
import TwWorker from '../src/twitter/TwWorker';
import path from 'path';
import mongoose from 'mongoose';
import TwitterSchema from '../src/models/twitter';
import _async from 'async';

const expect = chai.expect;
/* eslint-disable func-names */
describe('twitter worker tests', function () {
  let data = null;
  let connection = null;
  let Twitter = null;
  this.timeout(5000);

  before((done) => {
    const file = path.resolve(__dirname, './data/tw-allan.json');
    fs.readJson(file, (err, json) => {
      /* eslint-disable no-console */
      if (err) console.error(err);
      data = json;
      connection = mongoose.createConnection(process.env.MONGO_URL || 'mongodb://127.0.0.1/mine-test');
      connection.once('open', () => {
        Twitter = connection.model('Twitter', TwitterSchema);
        console.log('connected');
        done();
      });
    });
  });

  it('should process data and save to mongodb', async(done) => {
    const twWorker = new TwWorker(data);
    try {
      const processedData = await twWorker.processData();
      let savedTweets = 0;
      _async.each(processedData, (d, callback) => {
        const twitter = new Twitter(d);
        twitter.save((err) => {
          if (err) console.log(err.message);
          savedTweets++;
          console.log('saved ' + d.id);
          callback();
        });
      }, (err) => {
        expect(processedData.length).to.equal(savedTweets);
        Twitter.remove({});
        if (err) throw new Error(err);
        done();
      });
    } catch (err) {
      console.log(err.message);
    }
  });
});
