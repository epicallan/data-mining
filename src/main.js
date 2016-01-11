import 'babel-polyfill';
import config from './config';
import twitter from './models/twitter';
import TwWorker from './twitter/TwWorker';

// connect to mongodb
config.dbOpen();

process.on('message', async(data) => {
  const twWorker = new TwWorker(data);
  try {
    const processedData = await twWorker.processData();
    twitter.save(processedData, () => {
      process.send('saved data to mongodb');
    });
  } catch (err) {
    console.log(err);
  }
});
