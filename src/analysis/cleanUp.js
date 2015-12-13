/**
 * data clean up utilities
 */
import uid from 'uid';
import utils from '../utils/utils';
class CleanUp {

  removeSelfPosts(poster, data) {
    data.forEach((d, index) => {
      if (!utils.isEmpty(d.poster)) {
        if (d.poster == poster) delete data[index];
      }
    });
    return data;
  }

  assignIds(data) {
    data.forEach((post) => {
      if(post.id == undefined) post.id = uid(10);
    });
    return data;
  }
}
export default new CleanUp();
