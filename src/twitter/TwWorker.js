import analyzer from '../lib/analyzer';

export default class TwWorker {

  constructor(data) {
    this.data = analyzer.getData(data, {
      type: 'twitter',
    });
    // add names if present in the tweet to the user mentions field
    this.data = analyzer.addToUserMentions(this.data, ['museveni', 'besigye']);
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

  processData() {
    return new Promise(async(resolve, reject) => {
      try {
        const geoTagged = await this._addCordinates(this.data);
        const sentimated = analyzer.tweetSentiments(geoTagged);
        resolve(sentimated);
      } catch (error) {
        reject(error);
      }
    });
  }
}
