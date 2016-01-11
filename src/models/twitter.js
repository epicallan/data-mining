import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
const Schema = mongoose.Schema;

const TwitterSchema = new Schema({
  date: { type: String },
  text: { type: String, default: '', trim: true },
  user_name: { type: String, trim: true },
  location: { type: String, default: '', trim: true },
  time_zone: String,
  retweet_count: Number,
  favorite_count: Number,
  user_id: String,
  id: { type: Number, unique: true },
  is_reply: Boolean,
  is_retweet: Boolean,
  approximated_geo: { type: Boolean, default: false },
  geo_enabled: { type: Boolean, default: false },
  has_hashtags: Boolean,
  hashtags: [String],
  coordinates: { type: String, default: '' },
  has_user_mentions: Boolean,
  user_mentions: [String],
});

TwitterSchema.plugin(uniqueValidator);
TwitterSchema.path('user_mentions').required(true, 'Twitter must mention have a user mention');
/* eslint-disable func-names*/
TwitterSchema.pre('save', function (next) {
  const err = this.validateSync();
  if (err && err.toString()) throw new Error(err.toString());
  next(err);
});

const Twitter = mongoose.model('Twitter', TwitterSchema);

export default Twitter;
