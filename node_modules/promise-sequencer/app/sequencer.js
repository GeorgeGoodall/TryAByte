'use strict';

function sequencer (...pipeline) {

  if ( Array.isArray(pipeline[0]) ) {
    pipeline = pipeline[0];
  }

  let write;

  const results = [];

  results.getLast = () => results[results.length -1];

  return new Promise((resolve, reject) => {
    try {
      let cursor = 0;

      let run = () => {
        try {
          if ( pipeline[cursor] ) {
            pipeline[cursor](write, results)
              .then(result => {
                try {
                  cursor ++;
                  results.push(result);
                  write = result;
                  run();
                }
                catch ( error ) {
                  reject(error);
                }
              })
              .catch(reject);
          }
          else {
            resolve(results);
          }
        }
        catch ( error ) {
          reject(error);
        }
      };

      run();
    }
    catch ( error ) {
      reject(error);
    }
  });
}

sequencer.pipe = function pipe (...stack) {
  return new Promise((resolve, reject) => {
    sequencer(stack)
      .then(results => resolve(results.getLast()))
      .catch(reject);
  });
};

sequencer.promisify = function promisify (fn, args = [], that = null) {
  return new Promise((resolve, reject) => {
    args.push((error, ...args) => {
      if ( error ) {
        reject(error);
      }
      else {
        resolve(...args);
      }
    });

    fn.apply(that, args);
  });
}

export default sequencer;
