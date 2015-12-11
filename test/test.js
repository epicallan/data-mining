import {
  expect as expect
}
from 'chai';
import cleanUp from '../analysis/cleanUp';

import fs from 'fs';

describe('cleanup mined data', () => {
  this.data = null;
  //import test data set
  before(() => {
    let mined_data = fs.readFileSync('./data/topic-airtel.json');
    this.data = JSON.parse(mined_data);
  });

  it('should remove all self posts from topic data i.e data cleanup', () => {
    let cleaned_data = cleanUp.removeSelfPosts('Airtel Uganda')
    let posters = cleaned_data.map(obj => obj.poster);
    console.log(posters);
    expect(posters).to.not.include('Airtel Uganda');
  });
});


describe('should get over all sentiment for each post by sentiment analyzer');

describe('should get/segement posts by popularity based on shares and likes');

describe('should aggregate sentiments and popularity into one value per post');

describe('should get/segement posts by key terms (themes)')

describe('should get/segement actions of the posters and commenters on a per post basis eg mtn was sued, mobile money not working')

describe('should get frequent commenters and posters on a per topic basis i.e people who post or tweet about mobile money ')

describe('should get commenters per post with most likes')

describe('should get commenters per post with most negative or postive sentiments')

/***
 *TODO
 */

describe('should add location details to poster or commenter object ')
