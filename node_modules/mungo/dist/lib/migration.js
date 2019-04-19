'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _migration = require('../models/migration');

var _migration2 = _interopRequireDefault(_migration);

var _promiseSequencer = require('promise-sequencer');

var _promiseSequencer2 = _interopRequireDefault(_promiseSequencer);

var _prettify = require('./prettify');

var _prettify2 = _interopRequireDefault(_prettify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Migration = function (_Model) {
  _inherits(Migration, _Model);

  function Migration() {
    _classCallCheck(this, Migration);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Migration).apply(this, arguments));
  }

  _createClass(Migration, null, [{
    key: 'migrate',


    //----------------------------------------------------------------------------

    value: function migrate() {
      throw new Error('Can not call migrate() on a migration -- only on a model');
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'undo',
    value: function undo() {
      var _this2 = this;

      return (0, _promiseSequencer2.default)(function () {
        return _migration2.default.find({
          collection: _this2.collection,
          version: _this2.version
        });
      }, function (migrations) {
        return Promise.all(migrations.map(function (migration) {
          return new Promise(function (ok, ko) {
            try {

              // console.log(prettify([migration]));

              if ('remove' in migration) {
                return _this2.deleteById(migration.remove._id).then(ok, ko);
              }

              if ('unset' in migration) {
                return _this2.update(migration.unset.get, { $unset: migration.unset.fields }).then(ok, ko);
              }

              if ('update' in migration) {
                return _this2.update(migration.update.get, migration.update.set).then(ok, ko);
              }
            } catch (error) {
              ko(error);
            }
          });
        }));
      });
    }
  }, {
    key: 'revert',
    value: function revert() {
      var instructions = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return _migration2.default.insert(Object.assign({
        collection: this.collection,
        version: this.version
      }, instructions));
    }
  }]);

  return Migration;
}(_model2.default);

Migration.model = _migration2.default;
exports.default = Migration;