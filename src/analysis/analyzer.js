/**
 * anlyses facebook data
 */
import fs from 'fs';
import salient from 'salient';
import cleanUp from './cleanUp';
import utils from './utils';
import _ from 'lodash';
//import prettyjson from 'prettyjson';
//import Immutable from 'immutable';


export default class Analyzer {
  /**
   * takes in data source
   * @param  {[string]} file [json file with data to analyze]
   * @return {[promise] promise that has data}
   */
  constructor() {
    this.tokenizers = new salient.tokenizers.RegExpTokenizer({
      pattern: /\W+/
    });
    this.classifier = new salient.sentiment.BayesSentimentAnalyser();
    this.POSTagger = new salient.tagging.HmmTagger();
  }


  readInData(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  cleanUpData(raw, options) {
    let data = null;
    if (options.type === 'topic' || options.type === 'pages') {
      data = cleanUp.assignIds(raw);
    } else {
      data = cleanUp.tweeterData(raw);
    }
    if (options.type == 'topic') data = cleanUp.removeSelfPosts(options.poster, data);
    return data;
  }

  getSentiment(sentence) {
    return this.classifier.classify(sentence);
  }

  getKeyWords(text) {
    let nouns = [];
    if (!utils.isEmpty(text)) {
      const concepts = this.tokenizers.tokenize(text);
      concepts.forEach((concept) => {
        let tag = this.POSTagger.tag([concept]);
        if (tag[1] == 'NOUN' && concept.length > 3) {
          nouns.push(concept.toLowerCase());
        }
      });
    }
    return nouns;
  }

  getTopItems(terms, count) {
      let aggregated = _.countBy(terms, (n) => {
        return n;
      });
      aggregated = _.pairs(aggregated);
      if (count >= aggregated.length) count = aggregated.length / 2;
      aggregated = _.sortBy(aggregated, function(n) {
        return n[1];
      });
      let top = aggregated.slice((aggregated.length - count), aggregated.length);
      return top;
    }
    /**
     * gets sentiment for a field in a d
     * @return {array} has post objects
     */
  fbPostsSentiments(list, field) {
      return new Promise((resolve, reject) => {
        list.forEach((post) => {
          let sentiment = null;
          if (!utils.isEmpty(post[field])) {
            sentiment = this._getSentiment(post[field]);
            post.sentiment = sentiment;
          }
        });
        resolve(list);
        reject(null);
      });
    }
    /**
     * fbPostsCommentsSentiments uses sentiments of a posts comments to
     * determine posts sentiments
     * @return {array} containing post data with comments sentiments
     */
  fbPostsCommentsSentiments(list) {
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
  fbPostsStats(list) {
      list.forEach((post) => {
        let comments_count = post.comments.length;
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
  fbPostsTerms(list) {
    list.forEach((post) => {
      let terms = this._getKeyWords(post.post);
      post.terms = terms;
      post.comments.forEach((comment) => {
        let terms = this._getKeyWords(comment.comment);
        comment.terms = terms;
        //comment.terms = this._getTopItems(terms);
      });
    });
    return list;
  }

  /**
   * aggregatePostsTerms get top terms for each posts comments
   * this is a helper method for conveniance
   * @return {[type]} [description]
   */
  aggregatePostsTerms(count) {
    const posts = this.fbPostsTerms();
    let terms = [];
    posts.forEach((post) => {
      terms.push(post.terms);
      post.comments.forEach((comment) => {
        terms.push(comment.terms);
      });
    });
    terms = _.flatten(terms);
    const top = this._getTopItems(terms, count);
    //console.log(top);
    return top;
  }

  /**
   * fbPagesActiveCommenters gets a pages most active commenters
   * @return {[type]} [description]
   */
  fbPagesActiveCommenters(data,count) {
    const commenters = [];
    data.forEach((post) => {
      post.comments.forEach((comment) => {
        commenters.push(comment.commenters);
      });
    });
    return this._getTopItems(commenters, count);
  }


  topFrequentItems(data, field, count) {
    const posters = data.map(post => post[field]);
    return this._getTopItems(posters, count);
  }

  filterData(data, field, assertion) {
      return _.filter(data, d => d[field] == assertion || d[field].length > 0);
    }
    /**
     * [fbTopicsFrequentPosters helper methods]
     * @return {[type]} [description]
     */
  fbTopicsFrequentPosters(data, count) {
    return this.topFrequentItems(data, 'poster', count);
  }

  twTerms(data) {
    data.forEach((tweet) => {
      let terms = this._getKeyWords(tweet.text);
      tweet.terms = terms;
    });
    return data;
  }

  tweetSentiments(data) {
    data.forEach((tweet) => {
      let sentiment = this._getSentiment(tweet.text);
      tweet.sentiment = sentiment;
    });
    return data;
  }

  aggregateTwSentiments(data) {
    let sentiment_count = 0;
    data.forEach((tweet) => {
      sentiment_count += tweet.sentiment;
    });
    return sentiment_count;
  }

  nestTweetReplies(data) {
    let replies = _.filter(data, d => d.is_reply);
    data.forEach((tweet) => {
      tweet.replies = [];
      replies.forEach((r) => {
        if (r.in_reply_to_status_id === tweet.id) {
          tweet.replies.push(r);
        }
      });
    });
    return data;
  }
}
