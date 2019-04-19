'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

var _deprecatedNotice = require('./deprecated-notice');

var _deprecatedNotice2 = _interopRequireDefault(_deprecatedNotice);

var _modelQuery = require('./model-query');

var _modelQuery2 = _interopRequireDefault(_modelQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModelStatic = function (_ModelQuery) {
  _inherits(ModelStatic, _ModelQuery);

  function ModelStatic() {
    _classCallCheck(this, ModelStatic);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ModelStatic).apply(this, arguments));
  }

  _createClass(ModelStatic, null, [{
    key: 'getSchema',


    //----------------------------------------------------------------------------

    // Static methods

    //----------------------------------------------------------------------------

    /** @return {Schema} */

    value: function getSchema() {
      if (this._schema) {
        return this._schema;
      }

      if (_typeof(this.schema) === 'object') {
        this._schema = new _schema2.default(this.schema, this.version);
      }

      // legacy support

      else if (typeof this.schema === 'function') {
          this._schema = new _schema2.default(this.schema(), this.version);
        }

      return this._schema;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'updating',
    value: function updating() {
      return [];
    }
  }, {
    key: 'updated',
    value: function updated() {
      return [];
    }
  }, {
    key: 'inserting',
    value: function inserting() {
      return [];
    }
  }, {
    key: 'inserted',
    value: function inserted() {
      return [];
    }
  }, {
    key: 'removing',
    value: function removing() {
      return [];
    }
  }, {
    key: 'removed',
    value: function removed() {
      return [];
    }
  }, {
    key: 'indexes',


    //---------------------------------------------------------------------------

    // Static getters

    //----------------------------------------------------------------------------

    /** @return [Index] */

    //----------------------------------------------------------------------------

    get: function get() {
      return this.getSchema().indexes;
    }

    //---------------------------------------------------------------------------

    /** @return {String} */

    /** @type {Schema} */

    //---------------------------------------------------------------------------

    // Static properties

    //---------------------------------------------------------------------------

  }, {
    key: 'collection',
    get: function get() {
      return this._collection || this.name.toLowerCase() + 's';
    },
    set: function set(collection) {
      this._collection = collection;
    }
  }]);

  return ModelStatic;
}(_modelQuery2.default);

ModelStatic.version = 0;
ModelStatic.schema = {};
exports.default = ModelStatic;