'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _model = require('./lib/model');

var _model2 = _interopRequireDefault(_model);

var _schema = require('./lib/schema');

var _schema2 = _interopRequireDefault(_schema);

var _type = require('./lib/type');

var _type2 = _interopRequireDefault(_type);

var _connection = require('./lib/connection');

var _connection2 = _interopRequireDefault(_connection);

var _migration = require('./lib/migration');

var _migration2 = _interopRequireDefault(_migration);

var _deprecatedNotice = require('./lib/deprecated-notice');

var _deprecatedNotice2 = _interopRequireDefault(_deprecatedNotice);

var _document = require('./lib/document');

var _document2 = _interopRequireDefault(_document);

var _index = require('./lib/index');

var _index2 = _interopRequireDefault(_index);

var _query = require('./lib/query');

var _query2 = _interopRequireDefault(_query);

var _error = require('./lib/error');

var _error2 = _interopRequireDefault(_error);

var _findStatement = require('./lib/find-statement');

var _findStatement2 = _interopRequireDefault(_findStatement);

var _updateStatement = require('./lib/update-statement');

var _updateStatement2 = _interopRequireDefault(_updateStatement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mungo = function () {
  function Mungo() {
    _classCallCheck(this, Mungo);
  }

  _createClass(Mungo, null, [{
    key: 'Mixed',
    get: function get() {
      (0, _deprecatedNotice2.default)('Mungo.Mixed', 'Mungo.Type.Mixed');
      return _type2.default.Mixed;
    }
  }, {
    key: 'ObjectID',
    get: function get() {
      (0, _deprecatedNotice2.default)('Mungo.ObjectID', 'Mungo.Type.ObjectID');
      return _type2.default.ObjectID;
    }
  }]);

  return Mungo;
}();

Mungo.Index = _index2.default;
Mungo.Query = _query2.default;
Mungo.Model = _model2.default;
Mungo.Document = _document2.default;
Mungo.Schema = _schema2.default;
Mungo.Type = _type2.default;
Mungo.Connection = _connection2.default;
Mungo.connect = _connection2.default.connect.bind(_connection2.default);
Mungo.connectify = _connection2.default.connectify.bind(_connection2.default);
Mungo.disconnect = _connection2.default.disconnect.bind(_connection2.default);
Mungo.connections = _connection2.default.connections;
Mungo.Migration = _migration2.default;
Mungo.Error = _error2.default;
Mungo.FindStatement = _findStatement2.default;
Mungo.UpdateStatement = _updateStatement2.default;

Mungo.mongodb = _mongodb2.default;

Mungo.verbosity = 0;

/*
  0 = no verbose
  1 = success
  2 = error + success
  3 = warning + error + success
  4 = notice + warning + error + success
*/

exports.default = Mungo;