/**
 * data clean up utilities
 */
import uid from 'uid';
import utils from './utils';


class CleanUp {

  removeSelfPosts(poster, data) {
    const newData = [];
    data.forEach((d) => {
      if (!utils.isEmpty(d.poster)) {
        if (d.poster.trim() !== poster) {
          newData.push(d);
        }
      }
    });
    return newData;
  }

  assignIds(data) {
    data.forEach((post, index) => {
      if (post === undefined) data.splice(index, 1);
      if (post.id === undefined) post.id = uid(10);
    });
    return data;
  }

  fbData(data) {
    // TODO make fb data schema match twitters
    return data;
  }

  convertToDateObjs(data) {
    data.forEach(d => new Date(d.date));
  }

  tweeterData(data) {
    const twitterData = data.map((tweet) => {
      const obj = {};
      obj.date = new Date(tweet.created_at);
      obj.text = tweet.text;
      obj.user_name = tweet.user.name;
      obj.location = tweet.user.location;
      obj.time_zone = tweet.user.time_zone;
      obj.retweet_count = tweet.retweet_count;
      obj.favorite_count = tweet.favorite_count;
      obj.user_id = tweet.user.id;
      obj.id = tweet.id;
      obj.is_reply = tweet.in_reply_to_status_id === null || !tweet.in_reply_to_status_id ? false : true;
      if (obj.is_reply) {
        obj.in_reply_to_status_id = tweet.in_reply_to_status_id;
      }
      obj.is_retweet = tweet.retweeted_status !== undefined ? true : false;
      obj.approximated_geo = false;
      if (tweet.place) {
        obj.bounding_box = tweet.place.bounding_box.coordinates;
        obj.coordinates = { lat: obj.bounding_box[0][0][1], lng: obj.bounding_box[0][0][0] };
        obj.country = tweet.place.country;
        obj.geo_enabled = true;
      } else {
        obj.geo_enabled = false;
      }
      obj.has_hashtags = false;
      if (tweet.entities.hashtags.length) {
        obj.has_hashtags = true;
        obj.hashtags = tweet.entities.hashtags.map(tag => tag.text);
      } else {
        obj.hashtags = [];
      }
      obj.has_user_mentions = false;
      if (tweet.entities.user_mentions.length) {
        obj.has_user_mentions = true;
        obj.user_mentions = tweet.entities.user_mentions.map(user => user.name.toLowerCase());
      } else {
        obj.user_mentions = [];
      }
      return obj;
    });
    return twitterData;
  }
}
export default new CleanUp();
