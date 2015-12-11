/**
 * anlyses facebook data
 */
import fs from 'fs';
import {
  sentiment
}
from 'salient';
import cleanUp from './cleanUp';

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
    let raw =  fs.readFile(file);
    let data  = cleanUp.assignIds(raw);
    if(this.options.type === 'topic')
      data =  cleanUp.removeSelfPosts(data);

  }

  prepareData(){

  }

}
