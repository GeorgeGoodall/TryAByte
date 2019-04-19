'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redtea = require('redtea');

var _redtea2 = _interopRequireDefault(_redtea);

require('should');

var _ = require('..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Foo = function (_Mungo$Model) {
  _inherits(Foo, _Mungo$Model);

  function Foo() {
    _classCallCheck(this, Foo);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Foo).apply(this, arguments));
  }

  return Foo;
}(_2.default.Model);

Foo.collection = 'mungo_test_find_one_projection';
Foo.schema = {
  number: Number
};


function test() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var locals = {};

  return (0, _redtea2.default)('Find One - Projection', function (it) {
    it('Connect', function () {
      return new Promise(function (pass, fail) {
        _2.default.connect(process.env.MUNGO_URL || 'mongodb://localhost/test').on('error', fail).on('connected', pass);
      });
    });

    it('Create documents', function (it) {
      var _loop = function _loop(i) {
        it('Create { number : ' + i + ' }', function () {
          return Foo.insert({ number: i });
        });
      };

      for (var i = 0; i < 5; i++) {
        _loop(i);
      }
    });

    it('Find One - sort', function (it) {
      it('Sort up', function (it) {
        it('findOne().sort({ number : 1 })', function () {
          return Foo.findOne().sort({ number: 1 }).then(function (result) {
            locals.result = result;
          });
        });

        it('should have 1 result', function () {
          locals.result.should.be.an.Object;
        });

        it('it should be the lowest number', function () {
          locals.result.should.have.property('number').which.is.exactly(0);
        });
      });

      it('Sort down', function (it) {
        it('findOne().sort({ number : -1 })', function () {
          return Foo.findOne().sort({ number: -1 }).then(function (result) {
            locals.result = result;
          });
        });

        it('should have 1 result', function () {
          locals.result.should.be.an.Object;
        });

        it('it should be the highest number', function () {
          locals.result.should.have.property('number').which.is.exactly(4);
        });
      });
    });

    it('Empty collection', function () {
      return Foo.remove();
    });
  });
}

exports.default = test;