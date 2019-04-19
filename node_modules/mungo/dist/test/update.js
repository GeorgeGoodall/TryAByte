'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

  return Foo;
}(_2.default.Model);

Foo.collection = 'mungo_test_update';
Foo.schema = {
  number: Number
};


function test() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var locals = {};

  return (0, _redtea2.default)('Update', function (it) {
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

      for (var i = 0; i < 1; i++) {
        _loop(i);
      }
    });

    it('Document\'s version should be 0', function (it) {
      it('Fetch document', function () {
        return Foo.findOne().then(function (doc) {
          locals.doc = doc;
        });
      });

      it('__v should be 0', function () {
        locals.doc.should.have.property('__v').which.is.exactly(0);
      });
    });

    it('Direct update', function (it) {
      it('Update document', function () {
        return Foo.update({}, { $inc: { number: 1 } }).then(function (docs) {
          locals.doc = docs[0];
        });
      });

      it('__v should be 1', function () {
        return locals.doc.should.have.property('__v').which.is.exactly(1);
      });

      it('Document\'s version should be 1', function (it) {
        it('Fetch document', function () {
          return Foo.findOne().then(function (doc) {
            locals.doc = doc;
          });
        });

        it('__v should be 1', function () {
          locals.doc.should.have.property('__v').which.is.exactly(1);
        });
      });
    });

    it('Indirect update', function (it) {
      it('Find one', function (it) {
        it('Update document by fetching it', function () {
          return new Promise(function (pass, fail) {
            Foo.findOne().then(function (doc) {
              locals.doc = doc;
              doc.set('number', 100).save().then(pass, fail);
            }).catch(fail);
          });
        });

        it('Document\'s version should be 2', function (it) {
          it('Fetch document', function () {
            return Foo.findOne().then(function (doc) {
              locals.doc = doc;
            });
          });

          it('__v should be 2', function () {
            locals.doc.should.have.property('__v').which.is.exactly(2);
          });
        });
      });

      it('Find', function (it) {
        it('Empty collection', function () {
          return Foo.remove();
        });

        it('Create { number : 10 }', function () {
          return Foo.insert({ number: 10 });
        });

        it('Update document by fetching it', function () {
          return new Promise(function (pass, fail) {
            Foo.find().then(function (docs) {
              Promise.all(docs.map(function (doc) {
                return doc.set('number', 100).save();
              })).then(pass, fail);
            }).catch(fail);
          });
        });

        it('Document\'s version should be 1', function (it) {
          it('Fetch document', function () {
            return Foo.findOne().then(function (doc) {
              locals.doc = doc;
            });
          });

          it('__v should be 1', function () {
            locals.doc.should.have.property('__v').which.is.exactly(1);
          });
        });
      });
    });

    it('Empty collection', function () {
      return Foo.remove();
    });
  });
}

exports.default = test;