/**
 * data clean up utilities
 */
import uid from 'uid';
import utils from './utils';

//import prettyjson from 'prettyjson';

class CleanUp {

  removeSelfPosts(poster, data) {
    let new_data = [];
    data.forEach((d) => {
      if (!utils.isEmpty(d.poster)) {
        if (d.poster.trim() !== poster) {
          new_data.push(d);
        }
      }
    });
    return new_data;
  }

  assignIds(data) {
      data.forEach((post, index) => {
        if (post == undefined) data.splice(index, 1);
        if (post.id == undefined) post.id = uid(10);
      });
      return data;
    }

  fbData(data){
    //TODO make fb data schema match twitters
    return data;
  }

  tweeterData(data) {
    let twitter_data = data.map((tweet) => {
      let obj = {};
      obj.created_at = tweet.created_at;
      obj.text = tweet.text;
      obj.user_name = tweet.user.name;
      obj.location = tweet.user.location;
      obj.time_zone = tweet.user.time_zone;
      obj.retweet_count = tweet.retweet_count;
      obj.favorite_count = tweet.favorite_count;
      obj.user_id = tweet.user.id;
      obj.id = tweet.id;
      obj.geo_enabled = false;
      obj.is_reply = tweet.in_reply_to_status_id == null || !tweet.in_reply_to_status_id ? false : true;
      if (obj.is_reply) {
        obj.in_reply_to_status_id = tweet.in_reply_to_status_id;
      }
      if (tweet.place) {
        obj.coordinates = tweet.place.bounding_box.coordinates;
        obj.country = tweet.place.country;
        obj.geo_enabled = true;
      }
      obj.has_hashtags = false;
      if (tweet.entities.hashtags.length) {
        obj.has_hashtags = true;
        obj.hastags = tweet.entities.hashtags.map(tag => tag.text);
      }
      obj.has_user_mentions = false;
      if (tweet.entities.user_mentions.length) {
        obj.has_user_mentions = true;
        obj.user_mentions = tweet.entities.user_mentions.map(user => user.name);
      }
      return obj;
    });
    return twitter_data;
  }
}
export default new CleanUp();
