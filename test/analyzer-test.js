import chai from 'chai';
import analyzer from '../src/lib/analyzer';
import path from 'path';
import prettyjson from 'prettyjson';
const expect = chai.expect;
// import testData from './fixtures/cfdata';

describe('analyzer class', () => {
  let data = null;
  before('should read in data for tests', (done) => {
    const filePath = path.resolve(__dirname, './data/tw-allan.json');
    const options = {
      file: filePath,
      type: 'twitter',
    };
    data = analyzer.getDataFromFile(options);
    expect(data).to.have.length.above(0);
    done();
  });
  describe.skip('saving and getting json from redis ', () => {
    it('should cache and get json objects from redis', (done) => {
      /* eslint-disable no-console */
      analyzer.saveJsonRedis('MyKey', JSON.stringify(data), (res) => {
        console.log('successful save: ' + res);
        analyzer.getJsonRedis('MyKey', (redisData) => {
          console.log(prettyjson.render(redisData[0]));
          expect(redisData[0]).to.be.an('object');
          done();
        }).catch((error) => console.log(error));
      });
    });
  });
  describe(' it should add specific names to user_mentions field', () => {
    it('add specific names to the user_mentions array of a tweet', () => {
      const testTweets = [
        { text: '@yoweri_museveni Maybe you should also - mbabazi stop being a troll! @besigye',
          user_mentions: ['Yoweri K Museveni'],
        },
        { text: 'besigye Maybe you should also - Amamambabazi stop being a troll!',
          user_mentions: ['besigye'],
        },
        { text: 'UgandaDecides Maybe you should also museveni stop being a troll! @besigye',
          user_mentions: ['besigye'],
        },
      ];
      const trackedNames = ['museveni', 'besigye', 'UgandaDecides', 'mbabazi'];
      const newTweetdata = analyzer.addToUserMentions(testTweets, trackedNames);
      console.log(prettyjson.render(newTweetdata));
      expect(newTweetdata[2].user_mentions).to.have.length.above(1);
    });
  });
  describe.skip(' unspecific unit tests', () => {
    it('should get top tweeps (user_name)', () => {
      const tweeps = analyzer.topFrequentItems(data, 'user_name', 5);
      expect(tweeps).to.have.length.above(0);
    });

    it('should return filtered tweets or fb posts by a certain field', () => {
      /* eslint-disable no-console */
      const filtered = analyzer.filterData(data, 'geo_enabled', true);
      // console.log(prettyjson.render(filtered[0]));
      expect(filtered).to.have.length.above(0);
    });
    it('should get top terms in tweets', () => {
      const refinedTop = analyzer.topTwTerms(data, {
        filterRetweets: true,
        exclude: ['president', 'museveni'],
        count: 10,
      });
      expect(refinedTop).to.have.length.above(0);
    });
  });
  describe.skip('geocoding unit tests', () => {
    before(async(done) => {
      await analyzer._saveToRedis({
        location: 'masaka',
        lat: -0.3267383,
        lng: 31.7537404,
      });
      done();
    });

    after((done) => {
      analyzer.deletFromRedis(['jinja', 'masaka'], done);
    });

    it('should get location co-ordinates', async(done) => {
      const coordinates = await analyzer._geoCodeLocation('kampala');
      /* eslint-disable no-console */
      console.log(coordinates);
      expect(coordinates.lat).to.be.a('number');
      done();
    });

    it('should be able to get from redis', async(done) => {
      const coordinates = await analyzer._getFromRedis('masaka');
      expect(coordinates).to.be.an('object');
      done();
    });

    it('should get location co-ordinates if cached on redis or from google map API', () => {
      const payload = [{
        location: 'kampala',
      }, {
        location: 'jinja',
      }, {
        location: 'masaka',
      }];
      analyzer.getCordinates(payload, (results, error) => {
        /* eslint-disable no-console */
        if (error) console.log(error);
        expect(results[0]).to.be.an('object');
      });
    });
  });
  describe.skip('geocoding functional test', () => {
    it('should get geo-location of different tweets', (done) => {
      analyzer.getCordinates(data, (geoTagged, err) => {
        if (err) console.log(err);
        console.log(prettyjson.render(geoTagged[0]));
        expect(geoTagged[0]).to.be.an('object');
        done();
      });
    });
  });
});
