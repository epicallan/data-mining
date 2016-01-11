import config from './config';
import Twitter from './models/twitter';
import TwWorker from './twitter/TwWorker';

config.dbOpen(() => {
  /* eslint-disable no-console */
  console.log('connected to MongoDb in child Process');
});

process.on('message', async(data) => {
  console.log(`tweet: ${data.id} `);
  const twWorker = new TwWorker([data]);
  try {
    console.log('in try');
    const processedData = await twWorker.processData();
    console.log(processedData);
    const twitter = new Twitter(processedData);
    twitter.save((err) => {
      if (err) throw new Error(err);
      process.send(`saved twit: ${processedData.id}`);
    });
  } catch (err) {
    /* eslint-disable no-console */
    console.error(`error: ${err}`);
  }
});
