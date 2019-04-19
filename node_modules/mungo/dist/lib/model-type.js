'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModelTypeError = function (_MungoError) {
  _inherits(ModelTypeError, _MungoError);

  function ModelTypeError() {
    _classCallCheck(this, ModelTypeError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ModelTypeError).apply(this, arguments));
  }

  return ModelTypeError;
}(_error2.default);

var ModelType = function () {
  function ModelType() {
    _classCallCheck(this, ModelType);
  }

  _createClass(ModelType, null, [{
    key: 'validate',
    value: function validate(value) {
      return value instanceof _mongodb2.default.ObjectID;
    }
  }, {
    key: 'convert',
    value: function convert(value) {
      try {
        if (!value) {
          return null;
        }

        if (value instanceof this) {
          if (value.get('_id')) {
            return value.get('_id');
          }

          value.set('_id', _mongodb2.default.ObjectID());

          return value.get('_id');
        }

        if (value instanceof _mongodb2.default.ObjectID) {
          return value;
        } else if (typeof value === 'string') {
          return _mongodb2.default.ObjectID(value);
        }

        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value._id) {
          return _mongodb2.default.ObjectID(value._id);
        }

        var model = new this(value);

        model.set('_id', _mongodb2.default.ObjectID());

        return model._id;
      } catch (error) {
        throw ModelTypeError.rethrow(error, 'Could not convert model', { value: value, model: { name: this.name, version: this.version } });
      }
    }
  }]);

  return ModelType;
}();

exports.default = ModelType;