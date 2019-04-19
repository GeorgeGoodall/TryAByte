'use strict';

var _should = require('should');

var _should2 = _interopRequireDefault(_should);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _sequencer = require('./sequencer');

var _sequencer2 = _interopRequireDefault(_sequencer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function exec(label, story) {
  return new Promise(function (ok, ko) {
    function passed() {
      console.log(' :) Passed'.green);
      ok();
    }

    function failed(error) {
      console.log(' :( Failed'.red);
      console.log();
      console.log(error.stack.yellow);
      ko();
    }

    console.log();
    console.log(('> ' + label).bold.underline.blue);
    console.log();

    try {
      var fn = story();

      if (fn.then) {
        fn.then(passed).catch(failed);
      } else {
        passed();
      }
    } catch (error) {
      failed(error);
    }
  });
}

function run(tests) {
  var i = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var test = Object.keys(tests)[i];

  if (test) {
    exec(test, tests[test]).then(function () {
      return run(tests, i + 1);
    }).catch(function (error) {
      console.log(error.stack);
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
    });
  } else {
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
  }
}

run({
  'it should be a function': function itShouldBeAFunction() {
    return _sequencer2.default.should.be.a.Function();
  },

  'it should return a promise': function itShouldReturnAPromise() {
    return (0, _sequencer2.default)().should.be.an.instanceof(Promise);
  },

  'it should return [1]': function itShouldReturn1() {
    return new Promise(function (ok, ko) {
      (0, _sequencer2.default)(function () {
        return new Promise(function (ok) {
          return ok(1);
        });
      }).then(function (results) {
        try {
          results.should.be.an.Array().and.have.length(1);
          results[0].should.be.exactly(1);
          ok();
        } catch (error) {
          ko(error);
        }
      }).catch(ko);
    });
  },

  'it should return [1,2]': function itShouldReturn12() {
    return new Promise(function (ok, ko) {
      (0, _sequencer2.default)(function () {
        return new Promise(function (ok) {
          return ok(1);
        });
      }, function () {
        return new Promise(function (ok) {
          return ok(2);
        });
      }).then(function (results) {
        try {
          results.should.be.an.Array().and.have.length(2);
          results[0].should.be.exactly(1);
          results[1].should.be.exactly(2);
          ok();
        } catch (error) {
          ko(error);
        }
      }).catch(ko);
    });
  },

  'it should return 1': function itShouldReturn1() {
    return new Promise(function (ok, ko) {
      _sequencer2.default.pipe(function () {
        return new Promise(function (ok) {
          return ok(1);
        });
      }).then(function (results) {
        try {
          results.should.be.an.Number().and.is.exactly(1);
          ok();
        } catch (error) {
          ko(error);
        }
      }).catch(ko);
    });
  },

  'it should return error': function itShouldReturnError() {
    return new Promise(function (ok, ko) {
      (0, _sequencer2.default)(function () {
        return new Promise(function (ok, ko) {
          return ko(new Error('Oops'));
        });
      }).then(function (results) {
        return ko(new Error('Should have thrown'));
      }).catch(ok);
    });
  }
});