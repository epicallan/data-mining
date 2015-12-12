/**
 * anlyses facebook data
 */
import fs from 'fs';
import {
  sentiment
}
from 'salient';
import cleanUp from './cleanUp';
import utils from '../utils/utils'

export default class Analyzer {
  /**
   * takes in data source
   * @param  {[string]} file [json file with data to analyze]
   * @return {[promise] promise that has data}
   */
  constructor(options) {
    this.options = options;
    this.data = options.data || this.getData(options.file);
  }

  getData(file) {
    const raw =  fs.readFile(file);
    let data  = cleanUp.assignIds(raw);
    if(this.options.type === 'topic')
      data =  cleanUp.removeSelfPosts(data);
    return data;
  }

  /**
   * gets over all sentiment of the post by its title
   * @return {array} has post objects
   */
  postsSentimentsByTitle(){
    const posts = [];
    const classifier = sentiment.BayesSentimentAnalyser();
    this.data.forEach((post)=>{
      let post_title = post.post;
      let sentiment = null;
      if(!utils.isEmpty(post_title)){
        sentiment = classifier.classify(post.poster)
        post.sentiment = sentiment;
        //remove the comments object
        delete post.comments;
        posts.push(post);
      }
    })
    return posts
  }
  /**
   * postsSentimentsByComments uses sentiments of a posts comments to
   * determine posts sentiments
   * @return {[type]} [description]
   */
  postsSentimentsByComments(){
    const posts = [];

  }
}
