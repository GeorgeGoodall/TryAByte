'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _prettify = require('./prettify');

var _prettify2 = _interopRequireDefault(_prettify);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MungoTypeError = function (_MungoError) {
  _inherits(MungoTypeError, _MungoError);

  function MungoTypeError() {
    _classCallCheck(this, MungoTypeError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MungoTypeError).apply(this, arguments));
  }

  return MungoTypeError;
}(_error2.default);

//------------------------------------------------------------------------------

var _Object = function () {
  function _Object() {
    var object = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, _Object);

    Object.assign(this, object);
  }

  /** Boolean */

  _createClass(_Object, null, [{
    key: 'validate',
    value: function validate(value) {
      return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.constructor === Object;
    }

    /** Mixed */
  }, {
    key: 'convert',
    value: function convert(value) {
      return value;
    }
  }]);

  return _Object;
}();

//------------------------------------------------------------------------------

var _Array = function () {
  function _Array() {
    _classCallCheck(this, _Array);
  }

  _createClass(_Array, null, [{
    key: 'convert',
    value: function convert(array, type) {
      try {
        if (array === null) {
          return null;
        }

        type = Type.associate(type);

        // if ( type.isSubdocument() ) {
        //   console.log('-------------------------------------');
        //   return array.map(item => {
        //     for ( let field in item ) {
        //
        //     }
        //   })
        // }

        return array.map(function (item) {
          return type.convert(item);
        });
      } catch (error) {
        console.log(type);

        throw MungoTypeError.rethrow(error, 'Could not convert array', { array: array, type: type });
      }
    }
  }, {
    key: 'validate',
    value: function validate(array, type) {
      try {
        type = Type.associate(type);

        return array.every(function (item) {
          return type.validate(item);
        });
      } catch (error) {
        throw MungoTypeError.rethrow(error, 'Could not convert array', { array: array, type: type });
      }
    }
  }]);

  return _Array;
}();

//------------------------------------------------------------------------------

var _Subdocument = function () {
  function _Subdocument() {
    _classCallCheck(this, _Subdocument);
  }

  _createClass(_Subdocument, null, [{
    key: 'convert',
    value: function convert(subdoc, schema) {
      var converted = {};

      for (var field in subdoc) {
        if (field in schema) {
          converted[field] = schema[field].type.convert(subdoc[field]);
        }
      }

      return converted;
    }
  }, {
    key: 'validate',
    value: function validate(array, type) {
      var validated = {};

      for (var field in subdoc) {
        validated[field] = schema[field].type.validate(subdoc[field]);
      }

      return Object.keys(validated).every(function (key) {
        return validated[key];
      });
    }
  }]);

  return _Subdocument;
}();

//------------------------------------------------------------------------------

var _Mixed = function () {
  function _Mixed() {
    _classCallCheck(this, _Mixed);
  }

  _createClass(_Mixed, null, [{
    key: 'validate',
    value: function validate(value) {
      return true;
    }
  }, {
    key: 'convert',
    value: function convert(value) {
      return value;
    }
  }]);

  return _Mixed;
}();

//------------------------------------------------------------------------------

var _String = function () {
  function _String() {
    _classCallCheck(this, _String);
  }

  _createClass(_String, null, [{
    key: 'validate',
    value: function validate(value) {
      return typeof value === 'string';
    }
  }, {
    key: 'convert',
    value: function convert(value) {
      if (value === null || typeof value === 'undefined') {
        return null;
      }
      return value.toString();
    }
  }]);

  return _String;
}();

//------------------------------------------------------------------------------

var _Number = function () {
  function _Number() {
    _classCallCheck(this, _Number);
  }

  _createClass(_Number, null, [{
    key: 'validate',
    value: function validate(value) {
      return value.constructor === Number && isFinite(value);
    }
  }, {
    key: 'convert',
    value: function convert(value) {
      return +value;
    }
  }]);

  return _Number;
}();

//------------------------------------------------------------------------------

var _Boolean = function () {
  function _Boolean() {
    _classCallCheck(this, _Boolean);
  }

  _createClass(_Boolean, null, [{
    key: 'validate',
    value: function validate(value) {
      return typeof value === 'boolean';
    }
  }, {
    key: 'convert',
    value: function convert(value) {
      return !!value;
    }
  }]);

  return _Boolean;
}();

//------------------------------------------------------------------------------

var _Date = function () {
  function _Date() {
    _classCallCheck(this, _Date);
  }

  _createClass(_Date, null, [{
    key: 'validate',
    value: function validate(value) {
      return value instanceof Date;
    }
  }, {
    key: 'convert',
    value: function convert(value) {
      try {
        return new Date(new Date(value).toISOString());
      } catch (error) {
        throw MungoTypeError.rethrow(error, 'Could not convert value to date', { value: value });
      }
    }
  }]);

  return _Date;
}();

//------------------------------------------------------------------------------

var _ObjectID = function (_mongodb$ObjectID) {
  _inherits(_ObjectID, _mongodb$ObjectID);

  function _ObjectID() {
    _classCallCheck(this, _ObjectID);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(_ObjectID).apply(this, arguments));
  }

  _createClass(_ObjectID, null, [{
    key: 'validate',
    value: function validate(value) {
      return value instanceof _mongodb2.default.ObjectID;
    }
  }, {
    key: 'convert',
    value: function convert(value) {
      try {
        // console.log(prettify({'converting ObjectId' : { value }}));

        if (value === null) {
          return undefined;
        }

        if (typeof value === 'string') {
          return _mongodb2.default.ObjectID(value);
        }

        if (value instanceof _mongodb2.default.ObjectID) {
          return value;
        }

        if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {

          if (value.$in) {
            return { $in: value.$in.map(function (value) {
                return Type.ObjectID.convert(value);
              }) };
          }

          if (value._id) {
            return _mongodb2.default.ObjectID(value._id);
          }
        }
      } catch (error) {
        throw MungoTypeError.rethrow(error, 'Could not convert objectId', { value: value });
      }
    }
  }]);

  return _ObjectID;
}(_mongodb2.default.ObjectID);

//------------------------------------------------------------------------------

var _Geo = function () {
  function _Geo() {
    _classCallCheck(this, _Geo);
  }

  _createClass(_Geo, null, [{
    key: 'validate',
    value: function validate(value) {
      return new Type(Array, Number).validate(value);
    }
  }, {
    key: 'convert',
    value: function convert(value) {
      return new Type(Array, Number).convert(value);
    }
  }]);

  return _Geo;
}();

//------------------------------------------------------------------------------

_Geo.MongoDBType = '2d';

var Type = function () {
  _createClass(Type, [{
    key: 'getType',
    value: function getType() {
      return this.type;
    }
  }, {
    key: 'isSubdocument',
    value: function isSubdocument() {
      return this.type === _Subdocument;
    }
  }, {
    key: 'getSubdocument',
    value: function getSubdocument() {
      if (this.isSubdocument()) {
        return this.args[0];
      }
    }
  }, {
    key: 'isArray',
    value: function isArray() {
      return this.type === _Array;
    }
  }, {
    key: 'getArray',
    value: function getArray() {
      if (this.isArray()) {
        return this.args[0];
      }
    }
  }, {
    key: 'convert',
    value: function convert(value) {

      if (typeof this.type.convert !== 'function') {
        throw MungoTypeError.rethrow(new Error('Can not convert type'), 'Can not convert type', {
          type: this.type.name,
          convert: this.type.convert
        });
      }

      try {
        var _type;

        return (_type = this.type).convert.apply(_type, [value].concat(_toConsumableArray(this.args)));
      } catch (error) {
        throw error;
      }
    }
  }, {
    key: 'validate',
    value: function validate(value) {
      var _type2;

      return (_type2 = this.type).validate.apply(_type2, [value].concat(_toConsumableArray(this.args)));
    }
  }], [{
    key: 'associate',
    value: function associate(type) {
      switch (type) {
        case String:
          return Type.String;
        case Number:
          return Type.Number;
        case Boolean:
          return Type.Boolean;
        case Object:
          return Type.Object;
        case Date:
          return Type.Date;
        case Array:
          return Type.Array;
        default:
          return type;
      }
    }
  }]);

  function Type(type) {
    _classCallCheck(this, Type);

    this.args = [];

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    this.args = args;

    this.type = this.constructor.associate(type);
  }

  return Type;
}();

Type.Object = _Object;
Type.ObjectID = _ObjectID;
Type.Mixed = _Mixed;
Type.String = _String;
Type.Number = _Number;
Type.Boolean = _Boolean;
Type.Date = _Date;
Type.Array = _Array;
Type.Subdocument = _Subdocument;
Type.Geo = _Geo;
exports.default = Type;