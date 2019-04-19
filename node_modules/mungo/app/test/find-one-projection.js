'use strict';

import describe from 'redtea';
import 'should';
import Mungo from '..';

class Foo extends Mungo.Model {
  static collection = 'mungo_test_find_one_projection';

  static schema = {
    number : Number
  };
}

function test(props = {}) {
  const locals = {};

  return describe('Find One - Projection', it => {
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

    it('Find One - sort', it => {
      it('Sort up', it => {
        it('findOne().sort({ number : 1 })', () => Foo
          .findOne()
          .sort({ number : 1 })
          .then(result => { locals.result = result })
        );

        it('should have 1 result', () => {
          locals.result.should.be.an.Object;
        });

        it('it should be the lowest number', () => {
          locals.result.should.have.property('number').which.is.exactly(0);
        });
      });

      it('Sort down', it => {
        it('findOne().sort({ number : -1 })', () => Foo
          .findOne()
          .sort({ number : -1 })
          .then(result => { locals.result = result })
        );

        it('should have 1 result', () => {
          locals.result.should.be.an.Object;
        });

        it('it should be the highest number', () => {
          locals.result.should.have.property('number').which.is.exactly(4);
        });
      });
    });

    it('Empty collection', () => Foo.remove());
  });
}

export default test;
