import chai from 'chai';
import fs from 'fs-extra';
import TwWorker from '../src/twitter/TwWorker';
import path from 'path';
import mongoose from 'mongoose';
import TwitterSchema from '../src/models/twitter';

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

  it('should process data and save to mongodb', (done) => {
    const twWorker = new TwWorker([data[1]]);
    twWorker.processData().then((res) => {
      // console.log(res[0]);
      const twitter = new Twitter(res[0]);
      twitter.save((err) => {
        if (err) console.log(err);
        expect(res[0]).to.to.have.property('id');
        Twitter.remove({}, (error) => {
          if (error) console.log(error);
          done();
        });
      });
    }).catch(error => console.log(error));
  });
});
