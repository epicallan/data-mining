/**
 * i used this class to clean up old data
 * go through entire dataset
 * add a time stamp field and add used terms
 * and save it to a new collection
 */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign*/
import mongoose from 'mongoose';
import TwitterSchema from '../models/twitter';
import analyzer from '../../src/lib/analyzer';
import settings from '../config/settings';
const Schema = mongoose.Schema;

const MONGO_URL = 'mongodb://localhost/mine-dev';
mongoose.connect(MONGO_URL);
const Tweets = mongoose.model('twits', TwitterSchema);
const OldTweets = mongoose.model('twitters', new Schema({ any: {} }));


async function run() {
  try {
    let counter = 0;
    console.log(new Date);
    const stream = OldTweets.find()
    .lean()
    .stream({
      transform: (tweet) => {
        // purge user_mentions
        const userMentionsMatch = settings.names;
        const newTweet = analyzer.addToUserMentions([tweet], userMentionsMatch)[0];
        newTweet.terms = analyzer._getKeyWords(newTweet.text);
        newTweet.timeStamp = new Date(newTweet.date).getTime();
        return newTweet;
      },
    });
    stream.on('data', (doc) => {
      counter ++;
      const tweet = new Tweets(doc);
      tweet.save(tweet);
    });
    stream.once('close', () => {
      const date = new Date();
      console.log(`final tweets saved ${counter} ${date}`);
    });
  } catch (e) {
    throw new Error(e);
  }
}

run();
