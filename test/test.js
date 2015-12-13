import {
  expect as expect
}
from 'chai';
import Analyzer from '../src/analysis/analyzer';
import path from 'path';
import prettyjson from 'prettyjson';

describe('data analysis', () => {

  let analyzer = null;

  before(function() {
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

  it('should have a cleaned up data instance without self posts and having ids', () => {
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

  it('should get stats on posts',()=>{
    const stats_data = analyzer.fbPostsStats();
    expect(stats_data[2].commentsCount).to.be.above(1);
  });

  it('should get fb post terms',()=>{
    const termed_data = analyzer.fbPostsTerms();
    //console.log(prettyjson.render(termed_data[2].comments[0]));
    expect(termed_data[2].terms).to.have.length.above(1);
    expect(termed_data[2].comments[0].terms).to.have.length.above(0);
  });

});


/*

describe('should get/segement posts by popularity based on shares and likes');

describe('should aggregate sentiments and popularity into one value per post');

describe('should get/segement posts by key terms (themes)');

describe('should get/segement actions of the posters and commenters on a per post basis eg mtn was sued, mobile money not working');

describe('should get frequent commenters and posters on a per topic basis i.e people who post or tweet about mobile money ');

describe('should get commenters per post with most likes');

describe('should get commenters per post with most negative or postive sentiments');

describe('should add location details to poster or commenter object ');*/
