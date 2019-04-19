'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Projection = function () {
  function Projection() {
    var projection = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Projection);

    this.setLimit(projection.limit);
    this.setSkip(projection.skip);
    this.setSorter(projection.sort, projection.reverse);
  }

  _createClass(Projection, [{
    key: 'setLimit',
    value: function setLimit(value) {
      if (value === false) {
        this.limit = 0;
      } else if (typeof value === 'number') {
        this.limit = value;
      } else {
        this.limit = this.default.limit;
      }
      return this;
    }
  }, {
    key: 'setSkip',
    value: function setSkip(value) {
      if (typeof value === 'number') {
        this.skip = value;
      } else {
        this.skip = this.default.skip;
      }
    }
  }, {
    key: 'setSorter',
    value: function setSorter(sorter) {
      var reverse = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (typeof sorter === 'string') {
        this.sort = _defineProperty({}, sorter, 1);
      } else if (sorter && (typeof sorter === 'undefined' ? 'undefined' : _typeof(sorter)) === 'object') {
        this.sort = sorter;
      } else {
        this.sort = this.default.sort;
      }

      if (reverse) {
        for (var field in this.sort) {
          this.sort[field] = -1;
        }
      }
    }
  }, {
    key: 'default',
    get: function get() {
      return {
        limit: 100,
        skip: 0,
        sort: { _id: 1 }
      };
    }
  }]);

  return Projection;
}();

exports.default = Projection;