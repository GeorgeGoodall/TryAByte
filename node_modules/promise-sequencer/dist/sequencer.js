'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function sequencer() {
  for (var _len = arguments.length, pipeline = Array(_len), _key = 0; _key < _len; _key++) {
    pipeline[_key] = arguments[_key];
  }

  if (Array.isArray(pipeline[0])) {
    pipeline = pipeline[0];
  }

  var write = undefined;

  var results = [];

  results.getLast = function () {
    return results[results.length - 1];
  };

  return new Promise(function (resolve, reject) {
    try {
      (function () {
        var cursor = 0;

        var run = function run() {
          try {
            if (pipeline[cursor]) {
              pipeline[cursor](write, results).then(function (result) {
                try {
                  cursor++;
                  results.push(result);
                  write = result;
                  run();
                } catch (error) {
                  reject(error);
                }
              }).catch(reject);
            } else {
              resolve(results);
            }
          } catch (error) {
            reject(error);
          }
        };

        run();
      })();
    } catch (error) {
      reject(error);
    }
  });
}

sequencer.pipe = function pipe() {
  for (var _len2 = arguments.length, stack = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    stack[_key2] = arguments[_key2];
  }

  return new Promise(function (resolve, reject) {
    sequencer(stack).then(function (results) {
      return resolve(results.getLast());
    }).catch(reject);
  });
};

sequencer.promisify = function promisify(fn) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var that = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  return new Promise(function (resolve, reject) {
    args.push(function (error) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      if (error) {
        reject(error);
      } else {
        resolve.apply(undefined, args);
      }
    });

    fn.apply(that, args);
  });
};

exports.default = sequencer;