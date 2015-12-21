/**
 * anlyses facebook data
 */
import fs from 'fs';
import salient from 'salient';
import cleanUp from './cleanUp';
import utils from './utils';
import _ from 'lodash';
import Promise from 'bluebird';
import prettyjson from 'prettyjson';
const readFile = Promise.promisify(fs.readFile);

export default class Analyzer {

  constructor() {
    this.tokenizers = new salient.tokenizers.RegExpTokenizer({
      pattern: /\W+/,
    });
    this.classifier = new salient.sentiment.BayesSentimentAnalyser();
    this.POSTagger = new salient.tagging.HmmTagger();
    this.data = null;
  }


  readInData(options, cb) {
    console.log(options);
    readFile(options.file).then(source => {
      const raw = JSON.parse(source);
      this.data = this.dataCleanUp(raw, options);
      cb();
    });

  }

  dataCleanUp(raw, options) {
    let data = null;
    if (options.type === 'topic' || options.type === 'pages') {
      data = cleanUp.assignIds(raw);
    } else {
      data = cleanUp.tweeterData(raw);
    }
    if (options.type === 'topic') data = cleanUp.removeSelfPosts(options.poster, data);
    return data;
  }


  getSentiment(sentence) {
    return this.classifier.classify(sentence);
  }

  getKeyWords(text) {
    const nouns = [];
    if (!utils.isEmpty(text)) {
      const concepts = this.tokenizers.tokenize(text);
      concepts.forEach((concept) => {
        const tag = this.POSTagger.tag([concept]);
        if (tag[1] === 'NOUN' && concept.length > 3) {
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
    let myCount = count;
    if (myCount >= aggregated.length) myCount = aggregated.length / 2;
    aggregated = _.sortBy(aggregated, (n) => {
      return n[1];
    });
    return aggregated.slice((aggregated.length - myCount), aggregated.length);
  }

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

  fbPostsCommentsSentiments(list) {
    list.forEach((post) => {
      if (post.comments) {
        let sentiments = 0;
        post.comments.forEach((comment) => {
          if (!utils.isEmpty(comment.comment)) {
            const sentiment = this._getSentiment(comment.comment);
            comment.sentiment = sentiment;
            sentiments += sentiment;
          }
        });
        post.commentSentiments = sentiments;
      }
    });
    return list;
  }

  fbPostsStats(list) {
    list.forEach((post) => {
      let commentsCount = post.comments.length;
      post.comments.forEach((comment) => {
        if (comment.reply) {
          commentsCount += comment.reply.length;
        }
      });
      post.likes = ~~post.likes;
      post.shares = ~~post.shares;
      post.commentsCount = commentsCount;
      delete post.comments;
    });
    return list;
  }

  fbPostsTerms(list) {
    list.forEach((post) => {
      post.terms = this._getKeyWords(post.post);
      post.comments.forEach((comment) => {
        comment.terms = this._getKeyWords(comment.comment);
      });
    });
    return list;
  }


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
    return top;
  }

  fbPagesActiveCommenters(data, count) {
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
    const filtered = _.filter(data, (d) => {
      //console.log(prettyjson.render(d['has_hashtags']));
      return d[field] == assertion
    });
    return filtered;
  }

  fbTopicsFrequentPosters(data, count) {
    return this.topFrequentItems(data, 'poster', count);
  }

  twTerms(data) {
    data.forEach((tweet) => {
      tweet.terms = this._getKeyWords(tweet.text);
    });
    return data;
  }

  tweetSentiments(data) {
    data.forEach((tweet) => {
      tweet.sentiment = this._getSentiment(tweet.text);
    });
    return data;
  }

  aggregateTwSentiments(data) {
    let sentimentCount = 0;
    data.forEach((tweet) => {
      sentimentCount += tweet.sentiment;
    });
    return sentimentCount;
  }

  nestTweetReplies(data) {
    const replies = _.filter(data, d => d.is_reply);
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
