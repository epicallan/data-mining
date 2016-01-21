module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _master = __webpack_require__(209);

	var _master2 = _interopRequireDefault(_master);

	_master2['default'].init();

/***/ },

/***/ 205:
/***/ function(module, exports) {

	module.exports = require("redis");

/***/ },

/***/ 206:
/***/ function(module, exports) {

	module.exports = require("bluebird");

/***/ },

/***/ 208:
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var settings = {
	  names: ['museveni', 'besigye', 'mbabazi', 'baryamureeba', 'bwanika'],
	  track: 'museveni,besigye,ugandaDecides,AmamaMbabazi,amama mbabazi,ugdebate16,benon beraro' + 'JPM uganda,amama Uganda,abed bwanika,baryamureeba,Prof. V Baryamureeba,UGDebate16,'
	};
	exports['default'] = settings;
	module.exports = exports['default'];

/***/ },

/***/ 209:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Mines data and passes it to a child process
	 * for transformation and saving
	 * TODO spawn new child if the child process is busy
	 */
	/* eslint-disable no-console */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _child_process = __webpack_require__(210);

	var _child_process2 = _interopRequireDefault(_child_process);

	var _twit = __webpack_require__(211);

	var _twit2 = _interopRequireDefault(_twit);

	var _path = __webpack_require__(212);

	var _path2 = _interopRequireDefault(_path);

	var _configCred = __webpack_require__(213);

	var _configCred2 = _interopRequireDefault(_configCred);

	var _configSettings = __webpack_require__(208);

	var _configSettings2 = _interopRequireDefault(_configSettings);

	var _os = __webpack_require__(214);

	var _os2 = _interopRequireDefault(_os);

	var _fsExtra = __webpack_require__(215);

	var _fsExtra2 = _interopRequireDefault(_fsExtra);

	var _redis = __webpack_require__(205);

	var _redis2 = _interopRequireDefault(_redis);

	var _bluebird = __webpack_require__(206);

	var _bluebird2 = _interopRequireDefault(_bluebird);

	var _events = __webpack_require__(216);

	var _events2 = _interopRequireDefault(_events);

	var eventEmitter = new _events2['default'].EventEmitter();
	var client = _redis2['default'].createClient();
	var twitter = new _twit2['default'](_configCred2['default']);
	var childPath = _path2['default'].resolve(process.cwd(), 'dist/child.js');

	_bluebird2['default'].promisifyAll(_redis2['default'].RedisClient.prototype);
	_bluebird2['default'].promisifyAll(_redis2['default'].Multi.prototype);
	client.on('error', function (err) {
	  return console.log(err);
	});

	var Master = (function () {
	  function Master() {
	    _classCallCheck(this, Master);

	    this.tweetsBuffer = [];
	    this.counter = 0;
	    this.stream = null;
	    this.workers = [];
	    this.isConsumed = false;
	    this.createWorkerPool();
	    console.log('Master process pid ' + process.pid);
	  }

	  _createClass(Master, [{
	    key: 'init',
	    value: function init() {
	      this.startStream();
	      this.listenToStream();
	      // this.startEvent();
	      // this.listenToEvent();
	      this.listenToWorkers();
	    }
	  }, {
	    key: 'createWorkerPool',
	    value: function createWorkerPool() {
	      for (var i = 0; i < _os2['default'].cpus().length - 1; i++) {
	        var child = _child_process2['default'].fork(childPath);
	        client.set(child.pid.toString(), '0', _redis2['default'].print);
	        console.log('child process pid ' + child.pid);
	        this.workers.push(child);
	      }
	      console.log('number of workers: ' + this.workers.length);
	    }
	  }, {
	    key: 'startStream',
	    value: function startStream() {
	      // listen to twitter stream
	      this.stream = twitter.stream('statuses/filter', {
	        track: _configSettings2['default'].track
	      });
	    }
	  }, {
	    key: 'listenToStream',
	    value: function listenToStream() {
	      var _this = this;

	      this.stream.on('tweet', function (data) {
	        _this.tweetsBuffer.push(data);
	        _this.counter++;
	        console.log(_this.counter);
	        if (_this.tweetsBuffer.length > 10) {
	          _this.isConsumed = false;
	          console.log('Total Tweets = ' + _this.counter + ' tweet buffer is ' + _this.tweetsBuffer.length);
	          _this.sendTochildProcess();
	        }
	      });
	    }
	  }, {
	    key: 'getWorker',
	    value: function getWorker(worker, index) {
	      var _this2 = this;

	      // if first and second workers are busy just push the
	      // payload to the last worker
	      client.getAsync(worker.pid).then(function (reply) {
	        var isBusy = parseInt(reply, 10);
	        if (!_this2.isConsumed && !isBusy) {
	          _this2.isConsumed = true;
	          _this2.sendPayload(worker);
	          console.log('PID: ' + worker.pid + ' index: ' + index + ' C : ' + _this2.isConsumed + ' busy: ' + isBusy);
	        }
	      })['catch'](function (error) {
	        console.log(error);
	      });
	    }
	  }, {
	    key: 'sendPayload',
	    value: function sendPayload(worker) {
	      worker.send(this.tweetsBuffer);
	      this.tweetsBuffer = [];
	    }
	  }, {
	    key: 'sendTochildProcess',
	    value: function sendTochildProcess() {
	      var _this3 = this;

	      this.workers.forEach(function (worker, index) {
	        _this3.getWorker(worker, index);
	      });
	    }
	  }, {
	    key: 'listenToWorkers',
	    value: function listenToWorkers() {
	      // TODO remove from pool on exit or close
	      this.workers.forEach(function (child) {
	        child.on('message', function (msg) {
	          console.log('child pid ' + child.pid + ' : message ' + msg);
	        });

	        child.on('exit', function (signal) {
	          console.log('child process exited with signal ' + signal);
	          process.exit(1);
	        });

	        child.on('close', function (code) {
	          console.log('child process exited with code ' + code);
	          process.exit(1);
	        });
	      });
	    }
	  }]);

	  return Master;
	})();

	exports['default'] = new Master();
	module.exports = exports['default'];

/***/ },

/***/ 210:
/***/ function(module, exports) {

	module.exports = require("child_process");

/***/ },

/***/ 211:
/***/ function(module, exports) {

	module.exports = require("twit");

/***/ },

/***/ 212:
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },

/***/ 213:
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var credentials = {
	  consumer_key: 'mEeWQoooOPsXVh8WGYaFZjU93',
	  consumer_secret: 'RtEGoK1Z1iDrGQOYqO78zn5is1YVQExwvZELSBlPhjPRtuU6KR',
	  access_token: '282545192-ub693jp5wHs0fubn05mJXqlqCFi2JKipfkGXFxs3',
	  access_token_secret: 'nwegbEIxA5p2wMfrX9CbWcFXnIJBBxWR1nt8xUZoa0qV5',
	  callback: 'http://akilihub.io/twitter/callback'
	};
	exports['default'] = credentials;
	module.exports = exports['default'];

/***/ },

/***/ 214:
/***/ function(module, exports) {

	module.exports = require("os");

/***/ },

/***/ 215:
/***/ function(module, exports) {

	module.exports = require("fs-extra");

/***/ },

/***/ 216:
/***/ function(module, exports) {

	module.exports = require("events");

/***/ }

/******/ });