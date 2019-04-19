'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redtea = require('redtea');

var _redtea2 = _interopRequireDefault(_redtea);

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

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

  _createClass(Foo, null, [{
    key: 'updating',
    value: function updating() {
      return [this.touching.bind(this)];
    }
  }, {
    key: 'touching',
    value: function touching(doc) {
      return new Promise(function (pass, fail) {
        doc.increment('touched', 1);
        pass();
      });
    }
  }]);

  return Foo;
}(_2.default.Model);

Foo.collection = 'mungo_test_updating_hook';
Foo.schema = {
  number: Number,
  touched: {
    type: Number, default: 0
  }
};


function test() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var locals = {};

  return (0, _redtea2.default)('Updating hook', function (it) {
    it('Connect', function () {
      return new Promise(function (pass, fail) {
        _2.default.connect(process.env.MUNGO_URL || 'mongodb://localhost/test').on('error', fail).on('connected', pass);
      });
    });

    it('Create documents', function (it) {
      it('Model.create({ number : 0 })', function () {
        return Foo.insert({ number: 0 });
      });
    });

    it('Direct update', function (it) {
      it('Model.update({ number : 1 })', function () {
        return Foo.update({}, { number: 1 });
      });

      it('fetch document', function () {
        return Foo.findOne().then(function (doc) {
          locals.doc = doc;
        });
      });

      it('touched should be 1', function () {
        return locals.doc.should.have.property('touched').which.is.exactly(1);
      });
    });

    it('Empty collection', function () {
      return Foo.remove();
    });
  });
}

exports.default = test;