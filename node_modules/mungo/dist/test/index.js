'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redtea = require('redtea');

var _redtea2 = _interopRequireDefault(_redtea);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

var _ = require('..');

var _2 = _interopRequireDefault(_);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _index = require('../lib/index');

var _index2 = _interopRequireDefault(_index);

var _query = require('../lib/query');

var _query2 = _interopRequireDefault(_query);

var _model = require('../lib/model');

var _model2 = _interopRequireDefault(_model);

var _document = require('../lib/document');

var _document2 = _interopRequireDefault(_document);

var _schema = require('../lib/schema');

var _schema2 = _interopRequireDefault(_schema);

var _type = require('../lib/type');

var _type2 = _interopRequireDefault(_type);

var _connection = require('../lib/connection');

var _connection2 = _interopRequireDefault(_connection);

var _migration = require('../lib/migration');

var _migration2 = _interopRequireDefault(_migration);

var _error = require('../lib/error');

var _error2 = _interopRequireDefault(_error);

var _findStatement = require('../lib/find-statement');

var _findStatement2 = _interopRequireDefault(_findStatement);

var _updateStatement = require('../lib/update-statement');

var _updateStatement2 = _interopRequireDefault(_updateStatement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function test() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return (0, _redtea2.default)('Mungo v' + _package2.default.version, function (it) {
    it('module', function (it) {
      it('should be a class', function () {
        return _2.default.should.be.a.Function();
      });

      it('Deprecated', function (it) {
        it('Mixed', function (it) {
          it('should exist', function () {
            return _2.default.should.have.property('Mixed');
          });
          it('should be Type.Mixed', function () {
            return _2.default.Mixed.should.be.exactly(_type2.default.Mixed);
          });
        });

        it('ObjectID', function (it) {
          it('should exist', function () {
            return _2.default.should.have.property('ObjectID');
          });
          it('should be Type.ObjectID', function () {
            return _2.default.ObjectID.should.be.exactly(_type2.default.ObjectID);
          });
        });
      });

      it('Index', function (it) {
        it('should be Index', function () {
          return _2.default.should.have.property('Index').which.is.exactly(_index2.default);
        });
      });

      it('Query', function (it) {
        it('should be Query', function () {
          return _2.default.should.have.property('Query').which.is.exactly(_query2.default);
        });
      });

      it('Model', function (it) {
        it('should be Model', function () {
          return _2.default.should.have.property('Model').which.is.exactly(_model2.default);
        });
      });

      it('Document', function (it) {
        it('should be Document', function () {
          return _2.default.should.have.property('Document').which.is.exactly(_document2.default);
        });
      });

      it('Schema', function (it) {
        it('should be Schema', function () {
          return _2.default.should.have.property('Schema').which.is.exactly(_schema2.default);
        });
      });

      it('Type', function (it) {
        it('should be Type', function () {
          return _2.default.should.have.property('Type').which.is.exactly(_type2.default);
        });
      });

      it('Connection', function (it) {
        it('should be Connection', function () {
          return _2.default.should.have.property('Connection').which.is.exactly(_connection2.default);
        });
      });

      it('Migration', function (it) {
        it('should be Migration', function () {
          return _2.default.should.have.property('Migration').which.is.exactly(_migration2.default);
        });
      });

      it('Error', function (it) {
        it('should be Error', function () {
          return _2.default.should.have.property('Error').which.is.exactly(_error2.default);
        });
      });

      it('FindStatement', function (it) {
        it('should be FindStatement', function () {
          return _2.default.should.have.property('FindStatement').which.is.exactly(_findStatement2.default);
        });
      });

      it('UpdateStatement', function (it) {
        it('should be UpdateStatement', function () {
          return _2.default.should.have.property('UpdateStatement').which.is.exactly(_updateStatement2.default);
        });
      });

      it('Aliases', function (it) {
        it('Connect', function (it) {
          it('connect()', function (it) {
            it('should be Connection.connect()', function () {
              return _2.default.should.have.property('connect').which.is.a.Function();
            });
          });

          it('disconnect()', function (it) {
            it('should be Connection.disconnect()', function () {
              return _2.default.should.have.property('disconnect').which.is.a.Function();
            });
          });

          it('connectify()', function (it) {
            it('should be Connection.connectify()', function () {
              return _2.default.should.have.property('connectify').which.is.a.Function();
            });
          });

          it('connections', function (it) {
            it('should be Connection.connections', function () {
              return _2.default.should.have.property('connections').which.is.an.Array();
            });
          });
        });
      });
    });
  });
}

exports.default = test;