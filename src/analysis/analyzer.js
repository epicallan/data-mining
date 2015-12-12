/**
 * anlyses facebook data
 */
import fs from 'fs';
import salient from 'salient';
import cleanUp from './cleanUp';
import utils from '../utils/utils';
import _ from 'lodash';
//import Immutable from 'immutable';


export default class Analyzer {
  /**
   * takes in data source
   * @param  {[string]} file [json file with data to analyze]
   * @return {[promise] promise that has data}
   */
  constructor(options) {
    this.options = options;
    this.data = options.data || this.getData(options.file);
    this.tokenizers = new salient.tokenizers.RegExpTokenizer({
      pattern: /\W+/
    });
    this.classifier = new salient.sentiment.BayesSentimentAnalyser();
  }

  getData(file) {
    const raw = fs.readFile(file);
    let data = cleanUp.assignIds(raw);
    if (this.options.type === 'topic')
      data = cleanUp.removeSelfPosts(data);
    return data;
  }

  /**
   * gets over all sentiment of the post by its title
   * @return {array} has post objects
   */
  fbPostsSentimentsByTitle() {
      const list = _.cloneDeep(this.data);
      list.forEach((post) => {
        let post_title = post.post;
        let sentiment = null;
        if (!utils.isEmpty(post_title)) {
          sentiment = this.classifier.classify(post.poster);
          post.sentiment = sentiment;
          //remove the comments object
          delete post.comments;
        }
      });
      return list;
    }
    /**
     * fbPostsCommentsSentiments uses sentiments of a posts comments to
     * determine posts sentiments
     * @return {array} containing post data with comments sentiments
     */
  fbPostsCommentsSentiments() {
      //const list = Immutable.fromJS(this.data);
      const list = _.cloneDeep(this.data);
      list.forEach((post) => {
        if (post.comments) {
          let sentiments = 0;
          post.comments.forEach((comment) => {
            if (!utils.isEmpty(comment.comment)) {
              let sentiment = this.classifier.classify(comment.comment);
              comment.sentiment = sentiment;
              sentiments += sentiment;
            }
          });
          post.commentSentiments = sentiments;
        }
      });
      return list;
    }
    /**
     * fbPostsStats gets total likes comments shares and replies
     * Note we are adding replies to comments count
     * @return {[type]} [description]
     */
  fbPostsStats() {
    const list = _.cloneDeep(this.data);
    //const list = Immutable.fromJS(this.data);
    list.forEach((post) => {
      const comments_count = post.comments.length;
      post.comments.forEach((comment) => {
        if (comment.reply) {
          comments_count += comment.reply.length;
        }
      });
      post.likes = ~~post.likes;
      post.shares = ~~post.shares;
      post.commentsCount = comments_count;
      delete post.comments;
    });
    return list;
  }

  fbPostsKeyTermsByTitles() {

  }

  fbPostsCommentsKeyTerms() {}

  fbPagesActiveCommenters() {}

  fbTopicsFrequentPosters() {}


}
