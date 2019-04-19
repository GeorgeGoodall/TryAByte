'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _events = require('events');

var _promiseSequencer = require('promise-sequencer');

var _promiseSequencer2 = _interopRequireDefault(_promiseSequencer);

var _prettify = require('./prettify');

var _prettify2 = _interopRequireDefault(_prettify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Connection = function (_EventEmitter) {
  _inherits(Connection, _EventEmitter);

  function Connection() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Connection);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Connection)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.connected = false, _this.db = null, _temp), _possibleConstructorReturn(_this, _ret);
  }

  //----------------------------------------------------------------------------

  /** @type [Connection] */

  _createClass(Connection, [{
    key: 'disconnect',


    //----------------------------------------------------------------------------

    // Instance methods

    //----------------------------------------------------------------------------

    value: function disconnect() {
      var _this2 = this;

      return (0, _promiseSequencer2.default)(function () {
        return _this2.db.close();
      }, function () {
        return new Promise(function (ok, ko) {
          _this2.connected = false;
          _this2.disconnected = true;
          _this2.emit('disconnected');
          ok();
        });
      });
    }

    //----------------------------------------------------------------------------

  }], [{
    key: 'connect',


    //----------------------------------------------------------------------------

    // Static methods

    //----------------------------------------------------------------------------

    /** @resolve Connection
     *  @arg String url
     */

    value: function connect(url) {
      var _this3 = this;

      url = url || this.url;

      var connection = new Connection();

      connection.index = this.connections.push(connection);

      _promiseSequencer2.default.promisify(_mongodb2.default.MongoClient.connect, [url], _mongodb2.default.MongoClient).then(function (db) {
        connection.connected = true;

        connection.db = db;

        connection.emit('connected', connection);
        _this3.events.emit('connected', connection);
      }).catch(function (error) {
        connection.emit('error', error);
      });

      return connection;
    }
  }, {
    key: 'connectify',
    value: function connectify(url) {
      var _this4 = this;

      return new Promise(function (ok, ko) {
        _this4.connect(url).on('connected', ok).on('error', ko);
      });
    }

    //----------------------------------------------------------------------------

    /** @return Promise */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      return Promise.all(this.connections.map(function (connection) {
        return connection.disconnect();
      }));
    }

    //----------------------------------------------------------------------------

    // Instance properties

    //----------------------------------------------------------------------------

  }]);

  return Connection;
}(_events.EventEmitter);

Connection.connections = [];
Connection.url = 'mongodb://@localhost';
Connection.events = new _events.EventEmitter();
exports.default = Connection;