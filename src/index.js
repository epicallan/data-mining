/**
 * Mines data and passes it to a child process
 * for transformation and saving
 * TODO spawn new child if a process is busy
 */
/* eslint-disable no-console */
/* eslint-disable comma-dangle */
import childProcess from 'child_process';
import Twit from 'twit';
import path from 'path';
import crendentials from './config/cred';
const tweetsBuffer = [];
// process.cwd is a hacky replacement for __dirname and i am not sure why it
// wouldnt work
const childPath = path.resolve(process.cwd(), 'dist/main.js');

const child = childProcess.fork(childPath);
const twitter = new Twit(crendentials);

const stream = twitter.stream('statuses/filter', {
  track: 'museveni,besigye,ugandaDecides,AmamaMbabazi,JPM,amama,david'
});

if (tweetsBuffer.length < 4) {
  stream.on('tweet', (data) => {
    tweetsBuffer.push(data);
    if (tweetsBuffer.length === 2) {
      console.log('sending tweets');
      child.send(tweetsBuffer);
    }
  });
}


child.on('message', (msg) => {
  console.log('msg content from child: ' + msg);
});

child.on('exit', (signal) => {
  console.log(`child process exited with signal ${signal}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
