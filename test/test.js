import {
  expect as expect
}
from 'chai';
import Analyzer from '../src/analysis/analyzer';
import path from 'path';

describe('cleanup mined data', () => {

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

  it('should create a cleaned up data instance without self posts and having ids', () => {
    const posters = analyzer.data.map(post => post.poster);
    expect(posters).to.not.include('Airtel Uganda');
    expect(analyzer.data[0].id).to.exist;
  });

});


/*describe('should get over all sentiment for each post by sentiment analyzer');

describe('should get/segement posts by popularity based on shares and likes');

describe('should aggregate sentiments and popularity into one value per post');

describe('should get/segement posts by key terms (themes)');

describe('should get/segement actions of the posters and commenters on a per post basis eg mtn was sued, mobile money not working');

describe('should get frequent commenters and posters on a per topic basis i.e people who post or tweet about mobile money ');

describe('should get commenters per post with most likes');

describe('should get commenters per post with most negative or postive sentiments');

describe('should add location details to poster or commenter object ');*/
