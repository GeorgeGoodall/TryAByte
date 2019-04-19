'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Index = function () {
  _createClass(Index, [{
    key: 'name',
    get: function get() {
      var names = [];

      for (var field in this.fields) {
        names.push(field + '_' + this.fields[field]);
      }

      return names.join('_');
    }
  }]);

  function Index(index, field) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, Index);

    this.v = 1;
    this.fields = {};
    this.options = {};

    options.v = this.v;

    if (index === true) {
      this.fields = _defineProperty({}, field, 1);
    }

    if ((typeof index === 'undefined' ? 'undefined' : _typeof(index)) === 'object') {
      this.fields = _defineProperty({}, field, 1);

      Object.assign(this.options, index);
    }

    if (typeof index === 'string') {
      this.fields = _defineProperty({}, field, index);
    }

    if (options.unique) {
      this.options.unique = true;
    }

    if (options.coumpound) {
      if (typeof options.coumpound === 'string') {
        this.fields[options.coumpound] = 1;
      }
    }
  }

  return Index;
}();

exports.default = Index;