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
import fs from 'fs-extra';
import redis from 'redis';
import bluebird from 'bluebird';
import events from 'events';

const eventEmitter = new events.EventEmitter();
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
    this.isConsumed = false;
    this.createWorkerPool();
    console.log(`Master process pid ${process.pid}`);
  }

  init() {
    this.startStream();
    this.listenToStream();
    // this.startEvent();
    // this.listenToEvent();
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
      console.log(this.counter);
      if (this.tweetsBuffer.length > 10) {
        this.isConsumed = false;
        console.log(`Total Tweets = ${this.counter} tweet buffer is ${this.tweetsBuffer.length}`);
        this.sendTochildProcess();
      }
    });
  }

  getWorker(worker, index) {
    // if first and second workers are busy just push the
    // payload to the last worker
    client.getAsync(worker.pid).then((reply) => {
      const isBusy = parseInt(reply, 10);
      if (!this.isConsumed && !isBusy) {
        this.isConsumed = true;
        this.sendPayload(worker);
        console.log(`PID: ${worker.pid} index: ${index} C : ${this.isConsumed} busy: ${isBusy}`);
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  sendPayload(worker) {
    worker.send(this.tweetsBuffer);
    this.tweetsBuffer = [];
  }

  sendTochildProcess() {
    this.workers.forEach((worker, index) => {
      this.getWorker(worker, index);
    });
  }

  listenToWorkers() {
    // TODO remove from pool on exit or close
    this.workers.forEach((child) => {
      child.on('message', (msg) => {
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
