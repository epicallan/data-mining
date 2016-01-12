/**
 * Mines data and passes it to a child process
 * for transformation and saving
 * TODO spawn new child if the child process is busy
 */
/* eslint-disable no-console */
import childProcess from 'child_process';
import Twit from 'twit';
import path from 'path';
import crendentials from './config/cred';
import settings from './config/settings';
let tweetsBuffer = [];
let counter = 0;
// process.cwd is a hacky replacement for __dirname and i am not sure why it
// wouldnt work
const childPath = path.resolve(process.cwd(), 'dist/main.js');

const child = childProcess.fork(childPath);
const twitter = new Twit(crendentials);

const stream = twitter.stream('statuses/filter', {
  track: settings.track,
});

stream.on('tweet', (data) => {
  tweetsBuffer.push(data);
  counter ++;
  if (tweetsBuffer.length > 3) {
    setTimeout(() => {
      if (tweetsBuffer.length) {
        child.send(tweetsBuffer);
        console.log(`Total Tweets = ${counter} `);
      }
      tweetsBuffer = [];
    }, 10000);
  }
});

child.on('message', (msg) => {
  console.log('msg content from child: ' + msg);
});

child.on('exit', (signal) => {
  console.log(`child process exited with signal ${signal}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
