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
    this.data = options.data || this._getData(options.file);
    this.tokenizers = new salient.tokenizers.RegExpTokenizer({
      pattern: /\W+/
    });
    this.classifier = new salient.sentiment.BayesSentimentAnalyser();
    this.posTagger = new salient.tagging.HmmTagger();

  }

  _getData(file) {
    const raw = fs.readFile(file);
    let data = cleanUp.assignIds(raw);
    if (this.options.type === 'topic')
      data = cleanUp.removeSelfPosts(data);
    return data;
  }
  _getSentiment(sentence) {
    return this.classifier.classify(sentence);
  }
  _getKeyWords(text) {
    const concepts = this.tokenizer.tokenize(text);
    const nouns = [];
    concepts.forEach(function(concept) {
      console.log(concept);
      let tag = this.posTagger.tag([concept]);
      if (tag[1] == 'NOUN' && concept.length > 3) {
        nouns.push(concept);
      }
    });
    return nouns;
  }
  _getItemCounts(terms) {
      const aggregated = _.chain(terms)
        .countBy(terms, term => term)
        .pairs();
      return aggregated;
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
          sentiment = this._getSentiment(post.poster);
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
              let sentiment = this._getSentiment(comment.comment);
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
    /**
     * [fbPostsKeyTermsByTitles get posts keyTerms]
     * @return {[array]} [description]
     */
  fbPostsTerms() {
    const list = _.cloneDeep(this.data);
    list.forEach((post) => {
      let terms = this._getKeyWords(post.post);
      post.terms = terms;
      post.comments.forEach((comment) => {
        let terms = this._getKeyWords(comment.comment);
        comment.terms = this._getItemCounts(terms);
      });
    });
    return list;
  }

  /**
   * aggregatePostsTerms get top terms for each posts comments
   * TODO
   * @return {[type]} [description]
   */
  aggregatePostsTerms() {
    const posts = this.fbPostsTerms();
    let terms = [];
    posts.forEach((post) => {
      post.comments.forEach((comment) => {
        terms.push(comment.terms);
      });
    });
  }

  /**
   * fbPagesActiveCommenters gets a pages most active commenters
   * @return {[type]} [description]
   */
  fbPagesActiveCommenters() {
    const commenters = [];
    this.data.forEach((post) => {
      post.comments.forEach((comment) => {
        commenters.push(comment.commenters);
      });
    });
    return this._getItemCounts(commenters);
  }

  /**
   * [fbTopicsFrequentPosters description]
   * @return {[type]} [description]
   */
  fbTopicsFrequentPosters() {
    const posters = this.data.map(post => post.poster);
    return this._getItemCounts(posters);
  }


}
