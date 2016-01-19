import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
const Schema = mongoose.Schema;

const TwitterSchema = new Schema({
  date: { type: String },
  text: { type: String, default: null, trim: true },
  user_name: { type: String, trim: true },
  screen_name: { type: String, trim: true },
  location: { type: String, default: null, trim: true },
  time_zone: String,
  sentiment: Number,
  retweet_count: Number,
  favorite_count: Number,
  timeStamp: Number,
  terms: [String],
  user_id: String,
  id: { type: Number, unique: true },
  is_reply: Boolean,
  is_retweet: Boolean,
  approximated_geo: { type: Boolean, default: false },
  geo_enabled: { type: Boolean, default: false },
  has_hashtags: Boolean,
  hashtags: [String],
  coordinates: { type: String, default: null },
  has_user_mentions: Boolean,
  user_mentions: [String],
});

TwitterSchema.plugin(uniqueValidator);
// TwitterSchema.path('terms').required(true, 'Tweet must have terms');
/* eslint-disable func-names*/
TwitterSchema.pre('save', function (next) {
  const err = this.validateSync();
  next(err);
});

export default TwitterSchema;
