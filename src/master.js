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
import os from 'os';
import redis from 'redis';
import bluebird from 'bluebird';

const client = redis.createClient();
const twitter = new Twit(crendentials);
const childPath = path.resolve(process.cwd(), 'dist/child.js');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
client.on('error', (err) => console.log(err));

class Master {

  constructor() {
    this.tweetsBuffer = [];
    this.counter = 0;
    this.stream = null;
    this.workers = [];
    this.isTobeConsumed = false;
    this.createWorkerPool();
    console.log(`Master process pid ${process.pid}`);
  }

  init() {
    this.startStream();
    this.listenToStream();
    this.listenToWorkers();
  }
  createWorkerPool() {
    for (let i = 0; i < os.cpus().length - 1; i++) {
      const child = childProcess.fork(childPath);
      client.set(child.pid.toString(), '0', redis.print);
      console.log(`child process pid ${child.pid}`);
      this.workers.push(child);
    }
    console.log('number of workers: ' + this.workers.length);
  }

  startStream() {
    // listen to twitter stream
    this.stream = twitter.stream('statuses/filter', {
      track: settings.track,
    });
  }
  listenToStream() {
    this.stream.on('tweet', (data) => {
      this.tweetsBuffer.push(data);
      this.counter++;
      if (this.tweetsBuffer.length > 10 && !this.isTobeConsumed) {
        console.log(`Total Tweets = ${this.counter} tweet buffer is ${this.tweetsBuffer.length}`);
        this.isTobeConsumed = true;
        this.sendToWorkerProcess();
      }
    });
  }

  getWorkerStatus(worker, cb) {
    // check for status of worker from redis
    return client.getAsync(worker.pid).then((reply) => {
      cb(parseInt(reply, 10));
    }).catch((error) => {
      console.log(error);
    });
  }

  sendToWorkerProcess() {
    let isConsumed = false;
    this.workers.forEach((worker, index) => {
      this.getWorkerStatus(worker, (isWorkerBusy) => {
        if (!isWorkerBusy && !isConsumed) {
          worker.send(this.tweetsBuffer);
          console.log(`PID: ${worker.pid} index: ${index} `);
          isConsumed = true;
          // reset
          this.tweetsBuffer = [];
          this.isTobeConsumed = false;
        }
      });
    });
  }

  listenToWorkers() {
    // TODO remove from pool on exit or close
    this.workers.forEach((child) => {
      child.on('message', (msg) => {
        // reset and start accepting new payload
        console.log(`child pid ${child.pid} : message ${msg}`);
      });

      child.on('exit', (signal) => {
        console.log(`child process exited with signal ${signal}`);
        process.exit(1);
      });

      child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        process.exit(1);
      });
    });
  }
}
export default new Master();
