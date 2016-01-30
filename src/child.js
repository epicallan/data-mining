/**
 * child process that does the heavy lifting
 */
import { AKILIHUB_API } from './config';
import Twitter from './Twitter';
import redis from 'redis';
import utils from './lib/utils';

/* eslint-disable no-console */
const client = redis.createClient();
client.on('error', (err) => console.log(err));

let isWorking = null;
let counter = 0;

function changeState(state) {
  isWorking = state;
  client.set(process.pid, isWorking, (err) => {
    if (err) console.log(err);
    console.log(`process ${process.pid} changed state to ${isWorking} `);
  });
}

async function processPayload(data) {
  changeState('1');
  const twitter = new Twitter(data);
  console.log(`received payload ${data.length}`);
  try {
    const processedData = await twitter.processData();
    counter += processedData.length;
    const url = AKILIHUB_API;
    // const url = 'http://localhost:5000/api/social/twdata/';
    utils.sendPayload(processedData, url, (body) => {
      changeState('0');
      const date = new Date();
      process.send(`processed ${counter} saved: ${body.saved} notSaved: ${body.notSaved} ${date}`);
    });
  } catch (err) {
    console.log(err.message);
  }
}

process.on('message', async(data) => {
  processPayload(data);
});
