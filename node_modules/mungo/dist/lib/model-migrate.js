'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _promiseSequencer = require('promise-sequencer');

var _promiseSequencer2 = _interopRequireDefault(_promiseSequencer);

var _modelType = require('./model-type');

var _modelType2 = _interopRequireDefault(_modelType);

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModelMigrate = function (_ModelType) {
  _inherits(ModelMigrate, _ModelType);

  function ModelMigrate() {
    _classCallCheck(this, ModelMigrate);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ModelMigrate).apply(this, arguments));
  }

  _createClass(ModelMigrate, null, [{
    key: 'buildIndexes',


    //----------------------------------------------------------------------------

    /**
     *  @return     {Promise}
     */

    value: function buildIndexes() {
      var name = this.name;
      var indexes = this.indexes;


      var q = new _query2.default(this);

      return (0, _promiseSequencer2.default)(function () {
        return q.getCollection();
      }, function () {
        return q.collection.indexes();
      }, function (dbIndexes) {
        return new Promise(function (ok, ko) {
          dbIndexes = dbIndexes.filter(function (dbIndex) {
            return dbIndex.name !== '_id_';
          });

          if (!dbIndexes.length && !indexes.length) {
            return ok();
          }

          var promises = indexes.map(function (index) {
            return new Promise(function (ok, ko) {
              var indexExists = dbIndexes.some(function (dbIndex) {
                return dbIndex.name === index.name;
              });

              if (indexExists) {
                return ok();
              } else {

                if (index.options.force) {
                  index.options.dropDups = true;
                }

                q.collection.createIndex(index.fields, index.options).then(ok, ko);
              }
            });
          });

          Promise.all(promises).then(ok, ko);
        });
      });
    }

    //----------------------------------------------------------------------------

    /** Migrate model
     *
     *  @arg        [string]    versions
     *  @return     {Promise}
     */

    //----------------------------------------------------------------------------

  }, {
    key: 'migrate',
    value: function migrate() {
      var _this2 = this;

      for (var _len = arguments.length, versions = Array(_len), _key = 0; _key < _len; _key++) {
        versions[_key] = arguments[_key];
      }

      return (0, _promiseSequencer2.default)(function () {
        return _this2.buildIndexes();
      }, function () {
        return new Promise(function (ok, ko) {
          {
            var name = _this2.name;
            var migrations = _this2.migrations;


            var currentVersion = _this2.version;

            if (!migrations) {
              return ok();
            }

            var pipe = [];

            var _loop = function _loop(_version) {
              _version = +_version;

              var migration = migrations[_version];

              if (versions.length && versions.indexOf(_version) === -1) {
                return 'continue';
              }

              if (_version <= currentVersion) {
                pipe.push(function () {
                  return migration.do();
                });
              }
              version = _version;
            };

            for (var version in migrations) {
              var _ret = _loop(version);

              if (_ret === 'continue') continue;
            }

            (0, _promiseSequencer2.default)(pipe).then(ok, ko);
          }
        });
      });
    }

    //----------------------------------------------------------------------------

  }]);

  return ModelMigrate;
}(_modelType2.default);

exports.default = ModelMigrate;