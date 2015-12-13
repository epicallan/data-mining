/**
 * data clean up utilities
 */
import uid from 'uid';
import utils from '../utils/utils';


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
}
export default new CleanUp();
