import chai from 'chai';
import fs from 'fs-extra';
import TwWorker from '../src/twitter/TwWorker';
import path from 'path';
import Twitter from '../src/models/twitter';
import config from '../src/config';

const expect = chai.expect;
/* eslint-disable func-names */
describe('twitter worker tests', function () {
  let data = null;
  this.timeout(5000);

  before((done) => {
    const file = path.resolve(__dirname, './data/tw-allan.json');
    fs.readJson(file, (err, json) => {
      /* eslint-disable no-console */
      if (err) console.error(err);
      data = json;
      config.dbOpen(done);
    });
  });
  after((done) => {
    config.removeCollection('twitters', done);
  });
  it('should process data and save to mongodb', (done) => {
    const twWorker = new TwWorker([data[1]]);
    twWorker.processData().then((res) => {
      const twitter = new Twitter(res[0]);
      twitter.save((err) => {
        if (err) console.log(err);
        expect(res[0]).to.to.have.property('id');
        done();
      });
    }).catch(error => console.log(error));
  });
});
