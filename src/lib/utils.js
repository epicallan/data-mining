/**
 * utils
 */
import fetch from 'node-fetch';

class Utils {

  isEmpty(str) {
    return typeof str === 'string' && !str.trim() || typeof str === 'undefined' || str === null;
  }

  sendPayload(data, url, cb) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then((res) => res.json())
    .then((json) => {
      cb(json);
    });
  }
}

export default new Utils();
