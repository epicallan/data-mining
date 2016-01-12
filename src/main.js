import './config';
import mongoose from 'mongoose';
import TwitterSchema from '../src/models/twitter';
import TwWorker from './twitter/TwWorker';
/* eslint-disable no-console */
// const connection = mongoose.createConnection(process.env.MONGO_URL);
// let Twitter = null;

/* connection.once('open', () => {
  console.log('connected to Mongo DB');
  // Twitter = connection.model('Twitter', TwitterSchema);
});*/
process.on('message', (data) => {
  console.log('got messages');
  const twWorker = new TwWorker(data);
  try {
    twWorker.processData().then((processedData) => {
      processedData.forEach((d) => {
        process.send(`saved twit: ${d.id}`);
        // const twitter = new Twitter(d);
        /* twitter.save((err) => {
          if (err) throw new Error(err);
          process.send(`saved twit: ${d.id}`);
        });*/
      });
    });
  } catch (err) {
    console.error(`error: ${err}`);
  }
});
