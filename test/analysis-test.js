import {
  expect as expect
}
from 'chai';
import Analyzer from '../src/analysis/analyzer';
import path from 'path';
//import _ from 'lodash';
import prettyjson from 'prettyjson';

describe('fb data analysis', () => {

  let analyzer = null;

  before(function() {
    //skipping facebook data analysis test suite
    this.skip();
    const file = path.resolve(__dirname, 'data/topic-airtel.json');

    const options = {
      file: file,
      type: 'topic',
      poster: 'Airtel Uganda'
    };
    analyzer = new Analyzer(options);
  });


  it('should read In data from a specified datasource', () => {
    const data = analyzer.raw;
    expect(data).to.have.length.above(2);
  });

  it('remove self posts for fb topic data and ids to data', () => {
    const posters = analyzer.data.map(post => post.poster);
    expect(posters).to.not.include('Airtel Uganda');
    expect(analyzer.data[0].id).to.exist;
  });

  it('should get sentiments of posts by their titles', () => {
    const sentimented_data = analyzer.fbPostsSentimentsByTitle();
    expect(sentimented_data[0].sentiment).to.be.above(0);
  });

  it('should get posts comment sentiments and overall post sentiment by comments', () => {
    const sentimented_data = analyzer.fbPostsCommentsSentiments();
    expect(sentimented_data[2].comments[0].sentiment).to.be.above(0);
    expect(sentimented_data[2].commentSentiments).to.be.above(0);
  });

  it('should get stats on posts', () => {
    const stats_data = analyzer.fbPostsStats();
    expect(stats_data[2].commentsCount).to.be.above(1);
  });

  it('should get fb post terms', () => {
    const termed_data = analyzer.fbPostsTerms();
    //console.log(prettyjson.render(termed_data[2].comments[0]));
    expect(termed_data[2].terms).to.have.length.above(1);
    expect(termed_data[2].comments[0].terms).to.have.length.above(0);
  });

  it('should get fb top terms', () => {
    const frq = analyzer.aggregatePostsTerms(5);
    console.log(prettyjson.render(frq));
    expect(frq).to.not.be.empty;
  });

});

describe('twitter data analysis', () => {


  const analyzer = new Analyzer();

  before(function(done) {
    const file = path.resolve(__dirname, 'data/tw-museveni.json');
    const options = {
      file: file,
      type: 'twitter'
    };
    analyzer.readInData(options,()=>{
      expect(analyzer.data).to.not.be.empty;
      done();
    });
  });

  it('should return filtered tweets or fb posts by a certain field', () => {
    const filtered = analyzer.filterData(analyzer.data, 'has_hashtags', true);
    expect(filtered).to.have.length.above(0);
  });

  it('should get top tweeps (user_name)', () => {
    const data = analyzer.topFrequentItems(analyzer.data, 5, 'user_name');
    expect(data).to.have.length.above(0);
  });

  it('should get terms in tweets', () => {
    const data = analyzer.twTerms(data);
    expect(data).to.have.length.above(0);
  });

  it('should get tweet sentiments', () => {
    const data = analyzer.tweetSentiments(analyzer.data);
    expect(data[0].sentiment).to.be.above(0);
  });

  it('should return aggregated tweet sentiments', () => {
    const count = analyzer.aggregateTwSentiments(analyzer.data);
    expect(count).to.not.equal(0);
  });

});

describe('TO DO ', () => {
  //add location features
  let analyzer = null;

  before(function() {
    this.skip();
    const file = path.resolve(__dirname, 'data/tw-allan.json');

    const options = {
      file: file,
      type: 'twitter'
    };
    analyzer = new Analyzer(options);
  });

  it('should get action phrases ', () => {
    const data = analyzer.actionPhrases(analyzer.data);
    expect(data[0].verbs).to.be.above(0);
  });

  it('should get noun phrases ', () => {
    const data = analyzer.nounPhrases(analyzer.data);
    expect(data[0].verbs).to.be.above(0);
  });

  it('should get tweet action term', () => {
    const data = analyzer.actionTerms(analyzer.data);
    expect(data[0].verbs).to.be.above(0);
  });


});
