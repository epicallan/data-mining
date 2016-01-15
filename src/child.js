import './config';
import mongoose from 'mongoose';
import TwitterSchema from '../src/models/twitter';
import TwWorker from './twitter/TwWorker';
import redis from 'redis';
import _async from 'async';

/* eslint-disable no-console */
const client = redis.createClient();
client.on('error', (err) => console.log(err));

const connection = mongoose.createConnection(process.env.MONGO_URL);
let Twitter = null;
let counter = 0;
let savedTweets = 0;
let notSaved = 0;
let isWorking = null;

function changeState(state) {
  isWorking = state;
  client.set(process.pid, isWorking, (err) => {
    if (err) console.log(err);
    console.log(`process ${process.pid} changed state to ${isWorking} `);
  });
}

connection.once('open', () => {
  console.log(`connected to Mongo DB in process: ${process.pid}`);
  Twitter = connection.model('Twitter', TwitterSchema);
});

async function processPayload(data) {
  changeState('1');
  const twWorker = new TwWorker(data);
  try {
    const processedData = await twWorker.processData();
    _async.each(processedData, (d, callback) => {
      counter++;
      const twitter = new Twitter(d);
      twitter.save((err) => {
        if (err) {
          notSaved++;
          console.log(`err.message not saved ${d.id}`);
        } else {
          savedTweets++;
        }
        callback();
      });
    }, (err) => {
      if (err) console.log(err);
      process.send(`total processed ${counter} total saved: ${savedTweets} notSaved: ${notSaved}`);
      changeState('0');
    });
  } catch (err) {
    console.log(err.message);
  }
}

process.on('message', async(data) => {
  // set process to be busy on redis
  processPayload(data);
});
