import 'babel-polyfill';
import './config';
import mongoose from 'mongoose';
import TwitterSchema from '../src/models/twitter';
import TwWorker from './twitter/TwWorker';
/* eslint-disable no-console */
const connection = mongoose.createConnection(process.env.MONGO_URL);
let Twitter = null;

connection.once('open', () => {
  console.log('connected to Mongo DB');
  Twitter = connection.model('Twitter', TwitterSchema);
});

process.on('message', async(data) => {
  console.log('receieved payload from master');
  const twWorker = new TwWorker(data);
  try {
    const processedData = await twWorker.processData();
    processedData.forEach((d) => {
      const twitter = new Twitter(d);
      twitter.save((err) => {
        if (err) throw new Error(err);
        process.send(`saved twit: ${d.id}`);
      });
    });
  } catch (err) {
    console.error(`error: ${err}`);
  }
});
