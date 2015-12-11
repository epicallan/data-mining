/**
 * data clean up utilities
 */
import uid from 'uid';

class CleanUp {

  removeSelfPosts(poster, data) {
    return data.map(d => d.poster !== poster);
  }

  assignIds(data){
    return data.map(d => d.id = d.poster+'-'+uid(10));
  }
}
export default new CleanUp();
