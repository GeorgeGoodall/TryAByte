'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    cls.apply(this, arguments);
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var ExtendableError = function (_extendableBuiltin2) {
  _inherits(ExtendableError, _extendableBuiltin2);

  function ExtendableError(message) {
    _classCallCheck(this, ExtendableError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ExtendableError).call(this, message));

    _this.name = _this.constructor.name;
    _this.message = message;
    Error.captureStackTrace(_this, _this.constructor.name);
    return _this;
  }

  return ExtendableError;
}(_extendableBuiltin(Error));

var MungoError = function (_ExtendableError) {
  _inherits(MungoError, _ExtendableError);

  function MungoError(message) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, MungoError);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MungoError).call(this, message));

    var msg = undefined;

    try {
      msg = JSON.stringify({ message: message, options: options }, null, 2);
    } catch (e) {
      msg = message;
    } finally {
      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MungoError).call(this, msg));
    }

    _this2.originalMessage = message;

    if ('code' in options) {
      _this2.code = options.code;
    }

    _this2.options = options;
    return _this2;
  }

  _createClass(MungoError, null, [{
    key: 'rethrow',
    value: function rethrow(error, message) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      options.error = {};

      if (error instanceof this) {
        options.error.message = error.originalMessage;
        options.error.code = error.code;
        options.error.options = error.options;
        options.error.stack = error.stack.split(/\n/);
      } else {
        options.error.name = error.name;
        options.error.message = error.message;
        options.error.code = error.code;
        options.error.stack = error.stack.split(/\n/);
      }

      return new this(message, options);
    }
  }]);

  return MungoError;
}(ExtendableError);

MungoError.MISSING_REQUIRED_FIELD = 1;
MungoError.DISTINCT_ARRAY_CONSTRAINT = 2;
exports.default = MungoError;