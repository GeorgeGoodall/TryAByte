'use strict';

import describe from 'redtea';
import should from 'should';
import Mungo from '..';

class Foo extends Mungo.Model {
  static collection = 'mungo_test_find_operators';

  static schema = {
    string : String,
    number : Number,
    date : Date
  };
}

function test(props = {}) {
  const locals = {};

  return describe('Find / Statement', it => {
    it('Connect', () => new Promise((pass, fail) => {
      Mungo.connect(process.env.MUNGO_URL || 'mongodb://localhost/test')
        .on('error', fail)
        .on('connected', pass);
    }));

    it('Create documents', it => {
      for ( let i = 0; i < 5; i ++ ) {
        it(`Create { number : ${i} }`, () => Foo.insert({ number : i }));
      }
    });

    it('$lt', it => {
      it('{ number : { $lt : 2 } }', () => Foo
        .find({ number : { $lt : 2 } })
        .then(result => { locals.result = result })
      );

      it('should have 2 results', () => {
        locals.result.should.have.length(2);
      });

      it('all results should be below 2', () => {
        locals.result.forEach(result => result.number.should.be.below(2));
      });
    });

    it('Empty collection', () => Foo.remove());
  });
}

export default test;
