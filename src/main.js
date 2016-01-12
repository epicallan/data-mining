import './config';
import mongoose from 'mongoose';
import TwitterSchema from '../src/models/twitter';
import TwWorker from './twitter/TwWorker';
/* eslint-disable no-console */
const connection = mongoose.createConnection(process.env.MONGO_URL);
let Twitter = null;
let counter = 0;
connection.once('open', () => {
  console.log('connected to Mongo DB');
  Twitter = connection.model('Twitter', TwitterSchema);
});
process.on('message', async(data) => {
  const twWorker = new TwWorker(data);
  try {
    const processedData = await twWorker.processData();
    processedData.forEach((d) => {
      // console.log(`processed twit: ${d.id}`);
      const twitter = new Twitter(d);
      twitter.save((err) => {
        if (err) throw new Error(err);
        counter ++;
        process.send(`saved twit: ${d.id} number : ${counter}`);
      });
    });
  } catch (err) {
    console.log(err);
  }
});
