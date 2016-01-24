/**
 * processes mined tweets
 */
import analyzer from '../lib/analyzer';
import settings from '../config/settings';

export default class TwWorker {

  constructor(data) {
    this.data = analyzer.getData(data, {
      type: 'twitter',
    });
    // add names if present in the tweet to the user mentions field
    const userMentionsMatch = settings.track.toLowerCase().split(',');
    this.data = analyzer.addToUserMentions(this.data, userMentionsMatch);
  }
  removeRetweets() {
    return analyzer.filterData(this.data, 'is_retweet', false);
  }
  _addCordinates(data) {
    return new Promise((resolve, reject) => {
      analyzer.getCordinates(data, (results, error) => {
        resolve(results);
        reject(error);
      });
    });
  }
  _addTermsandTimeStamp(data) {
    /* eslint-disable no-param-reassign */
    data.forEach((tweet) => {
      tweet.terms = analyzer._getKeyWords(tweet.text);
      tweet.timeStamp = new Date(tweet.date).getTime();
    });
  }
  processData() {
    /* eslint-disable func-names */
    return new Promise(async(resolve, reject) => {
      try {
        this._addTermsandTimeStamp(this.data);
        const geoTagged = await this._addCordinates(this.data);
        /* eslint-disable no-param-reassign */
        geoTagged.forEach((d) => {
          if (d.coordinates) d.coordinates = `${d.coordinates.lat},${d.coordinates.lng}`;
        });
        const sentimated = analyzer.tweetSentiments(geoTagged);
        resolve(sentimated);
      } catch (error) {
        reject(error);
      }
    });
  }
}
