/**
 * go through entire dataset
 * add a time stamp field
 * add used terms
 * and save it to a new collection
 */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign*/
import mongodb from 'mongodb';
import analyzer from '../../src/lib/analyzer';
import _async from 'async';
import settings from '../config/settings';

const MongoClient = mongodb.MongoClient;
const MONGO_URL = 'mongodb://localhost/mine-twt';
let db = null;
const tweets = [];
function _connection() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(MONGO_URL, (err, connection) => {
      resolve(connection);
      console.log('connected');
      reject(err);
    });
  });
}

async function run() {
  try {
    let counter = 0;
    console.log(new Date);
    db = await _connection();
    const cursor = db.collection('twitters').find({
      is_retweet: false,
    })
    .stream({
      transform: (tweet) => {
        // purge user_mentions
        // console.log(tweet.id);
        const userMentionsMatch = settings.track.toLowerCase().split(',');
        const newTweet = analyzer.addToUserMentions([tweet], userMentionsMatch)[0];
        newTweet.terms = analyzer._getKeyWords(newTweet.text);
        newTweet.timeStamp = new Date(newTweet.date).getTime();
        return tweet;
      },
    });
    cursor.Option = {
      noTimeout: true,
      maxScan: -1,
      maxTimeMS: 10000,
    };
    cursor.on('data', (doc) => {
      /* db.collection('tweetss').insertOne(doc, (err) => {
        if (err) {
          console.log('insert Error');
          throw new Error(err);
        }
        counter++;
        // console.log(`saved ${doc.id} ${counter}`);
      });*/
      counter ++;
      tweets.push(doc.id);
    });
    cursor.once('end', () => {
      const date = new Date();
      console.log(`final tweets saved ${counter} ${date}`);
      db.close();
    });
  } catch (e) {
    throw new Error(e);
  }
}

run();
