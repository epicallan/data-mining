import analyzer from '../lib/analyzer';

export default class TwWorker {

  constructor(data) {
    this.data = analyzer.getData(data, {
      type: 'twitter',
    });
    // add names if present in the tweet to the user mentions field
    this.data = analyzer.addToUserMentions(this.data, ['museveni', 'besigye', 'amama', 'jpm']);
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
    /* eslint-disable func-names */
    return new Promise(async function(resolve, reject) {
      try {
        const geoTagged = await this._addCordinates(this.data);
        /* eslint-disable no-param-reassign */
        geoTagged.forEach((d) => {
          d.coordinates = `${d.coordinates.lat},${d.coordinates.lng}`;
        });
        const sentimated = analyzer.tweetSentiments(geoTagged);
        resolve(sentimated);
      } catch (error) {
        reject(error);
      }
    }.bind(this));
  }
}
