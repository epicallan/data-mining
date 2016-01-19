/**
 * go through entire dataset
 * add a time stamp field
 * add used terms
 * and save it to a new collection
 */
/* eslint-disable no-console */
import mongodb from 'mongodb';
import analyzer from '../../src/lib/analyzer';
import _async from 'async';

const MongoClient = mongodb.MongoClient;
const MONGO_URL = 'mongodb://localhost/mine-twt';
let db = null;

function _connection() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(MONGO_URL, (err, connection) => {
      resolve(connection);
      reject(err);
    });
  });
}

async function findAll() {
  try {
    db = await _connection();
    return db.collection('twitters').find({
      is_retweet: false,
    }).toArray();
  } catch (e) {
    throw new Error(e);
  }
}

/* function reverseTag(coordinates) {

}*/

function transform(data, cb) {
  /* eslint-disable no-param-reassign*/
  console.log(`intial tweets ${data.length}`);
  let counter = 0;
  _async.each(data, async(tweet, callback) => {
    tweet.terms = analyzer._getKeyWords(tweet.text);
    // tweet.country = await reverseTag(tweet.coordinates);
    tweet.timeStamp = new Date(tweet.date).getTime();
    if (!db) callback(new Error('db is null'));
    db.collection('tws').insertOne(tweet, (err) => {
      if (err) throw new Error(err);
      counter++;
      callback();
    });
  }, (err) => {
    if (err) throw new Error(err);
    const date = new Date();
    console.log(`final tweets saved ${counter} ${date}`);
    cb();
  });
}

async function run() {
  try {
    const data = await findAll();
    transform(data, () => {
      console.log('resaved all data');
      db.close();
    });
  } catch (e) {
    console.log(e);
  }
}

run();
