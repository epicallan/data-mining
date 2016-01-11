/**
 * Mines data and passes it to a child process
 * for transformation and saving
 * TODO spawn new child if a process is busy
 */
import process from 'child_process';
import Twit from 'twit';
import crendentials from './config/twCredentials';

const child = process.fork('./main');
const twitter = new Twit(crendentials);

const stream = twitter.stream('statuses/filter', {
  track: 'museveni,besigye,ugandaDecides,amama,JPM'
});

stream.on('tweet', (data) => {
  // const twData = JSON.stringify(data);
  child.send(data);
});

child.on('message', (msg) => {
  console.log('msg content from child: ' + msg);
});
