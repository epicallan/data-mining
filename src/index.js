/**
 * Mines data and passes it to a child process
 * for transformation and saving
 * TODO spawn new child if a process is busy
 */
/* eslint-disable no-console */
/* eslint-disable comma-dangle */
import process from 'child_process';
import Twit from 'twit';
import crendentials from './config/twCredentials';

const child = process.fork('./main');
const twitter = new Twit(crendentials);

const stream = twitter.stream('statuses/filter', {
  track: 'museveni,besigye,ugandaDecides,AmamaMbabazi,JPM,amama'
});

stream.on('tweet', (data) => {
  child.send(data);
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
