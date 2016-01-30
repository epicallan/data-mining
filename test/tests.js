import chai from 'chai';
import fs from 'fs-extra';
import Twitter from '../src/Twitter';
import path from 'path';
import utils from '../src/lib/utils';
import prettyjson from 'prettyjson';
import { AKILIHUB_API } from '../config';


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
      done();
    });
  });
  it.skip('should send data to remote', async (done) => {
    const payload = [
      { name: 'allan' },
      { name: 'ak' },
    ];
    utils.sendPayload(payload, AKILIHUB_API, (body) => {
      console.log(prettyjson.render(body));
      expect(body).to.be.an('object');
      done();
    });
  });

  it('should process data and send to remote', async(done) => {
    const twitter = new Twitter(data);
    try {
      const processedData = await twitter.processData();
      // console.log(prettyjson.render(processedData[0]));
      utils.sendPayload(processedData, AKILIHUB_API, (body) => {
        console.log(body);
        expect(body).to.be.an('object');
        done();
      });
    } catch (err) {
      console.log(err.message);
    }
  });
});
