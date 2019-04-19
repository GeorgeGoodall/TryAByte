'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redtea = require('redtea');

var _redtea2 = _interopRequireDefault(_redtea);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _findStatement = require('../lib/find-statement');

var _findStatement2 = _interopRequireDefault(_findStatement);

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

Foo.schema = { foo: String };


function test() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var locals = {};

  return (0, _redtea2.default)('$sort', function (it) {
    it('should instantiate a new FindStatement', function (it) {
      locals.query = new _findStatement2.default({ $sort: { foo: 1 } }, Foo);
    });

    it('should have a projection property', function (it) {
      locals.query.should.have.property('$projection').which.is.an.Object();
    });

    it('should have a sort', function (it) {
      locals.query.$projection.should.have.property('sort').which.is.an.Object();
    });

    it('should be a sorter', function (it) {
      locals.query.$projection.sort.should.have.property('foo').which.is.exactly(1);
    });
  });
}

exports.default = test;