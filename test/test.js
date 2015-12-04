import { expect as expect } from 'chai';
import tweetMinner from '../src/twitter/miner.js';

describe('dataMining', () => {

  it('should return tweets matching search terms', () => {
    tweetMinner.tweets('mtn').then((data)=>{
      console.log(data);
      expect(data).to.be.an('object');
      expect(data).to.not.be.empty;
    });
  });

  it('should get tweets from users',()=>{
    tweetMinner.userTweests('epicallan').then((data)=>{
      console.log(data);
      expect(data).to.be.an('object');
      expect(data).to.not.be.empty;
    });
  });



});
