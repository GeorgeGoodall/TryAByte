'use strict';

import should from 'should';
import colors from 'colors';
import sequencer from './sequencer';

function exec (label, story) {
  return new Promise((ok, ko) => {
    function passed () {
      console.log(' :) Passed'.green);
      ok();
    }

    function failed (error) {
      console.log(' :( Failed'.red);
      console.log();
      console.log(error.stack.yellow);
      ko();
    }

    console.log();
    console.log(`> ${label}`.bold.underline.blue);
    console.log();

    try {
      const fn = story();

      if ( fn.then ) {
        fn.then(passed).catch(failed);
      }

      else {
        passed();
      }
    }
    catch ( error ) {
      failed(error);
    }
  });
}

function run (tests, i = 0) {
  const test = Object.keys(tests)[i];

  if ( test ) {
    exec(test, tests[test])
      .then(() => run(tests, i + 1))
      .catch(error => {
        console.log(error.stack);
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
      });
  }
  else {
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
  }
}

run({
  'it should be a function' : () =>
    sequencer.should.be.a.Function(),

  'it should return a promise' : () =>
    sequencer().should.be.an.instanceof(Promise),

  'it should return [1]' : () =>
    new Promise((ok, ko) => {
      sequencer(
        () => new Promise(ok => ok(1))
      )
      .then(results => {
        try {
          results.should.be.an.Array().and.have.length(1);
          results[0].should.be.exactly(1);
          ok();
        }
        catch ( error ) {
          ko(error);
        }
      })
      .catch(ko);
    }),

  'it should return [1,2]' : () =>
    new Promise((ok, ko) => {
      sequencer(
        () => new Promise(ok => ok(1)),
        () => new Promise(ok => ok(2))
      )
      .then(results => {
        try {
          results.should.be.an.Array().and.have.length(2);
          results[0].should.be.exactly(1);
          results[1].should.be.exactly(2);
          ok();
        }
        catch ( error ) {
          ko(error);
        }
      })
      .catch(ko);
    }),

  'it should return 1' : () =>
    new Promise((ok, ko) => {
      sequencer.pipe(
        () => new Promise(ok => ok(1))
      )
      .then(results => {
        try {
          results.should.be.an.Number().and.is.exactly(1);
          ok();
        }
        catch ( error ) {
          ko(error);
        }
      })
      .catch(ko);
    }),

  'it should return error' : () =>
    new Promise((ok, ko) => {
      sequencer(
        () => new Promise((ok, ko) => ko(new Error('Oops')))
      )
      .then(results => ko(new Error('Should have thrown')))
      .catch(ok);
    })
});
