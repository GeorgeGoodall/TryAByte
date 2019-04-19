'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('stream');

var _mungo = require('./mungo');

var _mungo2 = _interopRequireDefault(_mungo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Streamable = function (_Readable) {
  _inherits(Streamable, _Readable);

  function Streamable(options) {
    _classCallCheck(this, Streamable);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Streamable).call(this, {
      encoding: 'utf8'
    }));

    _this.setEncoding('utf8');

    _this.collection = [];
    return _this;
  }

  _createClass(Streamable, [{
    key: '_read',
    value: function _read(n) {
      console.log('reading');
    }
  }, {
    key: 'add',
    value: function add() {
      for (var _len = arguments.length, doc = Array(_len), _key = 0; _key < _len; _key++) {
        doc[_key] = arguments[_key];
      }

      console.log('adding', doc.length);
      // this.collection.push(...doc);
      this.resume();
      this.emit('readable');

      doc.map(function (doc) {
        return doc.toJSON();
      });

      var source = JSON.stringify(doc);

      console.log(source);
      this.emit('data', source);
    }
  }, {
    key: 'end',
    value: function end() {
      this.emit('end');
    }
  }]);

  return Streamable;
}(_stream.Readable);

_mungo2.default.Streamable = Streamable;