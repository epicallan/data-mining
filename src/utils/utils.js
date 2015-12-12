/**
 * utils
 */

class Utils {
  isEmpty(str){
    return typeof str == 'string' && !str.trim() || typeof str == 'undefined' || str === null;
  }
}

export default new Utils();
