'use strict';

import describe from 'redtea';
import should from 'should';
import Mungo from '..';

class Foo extends Mungo.Model {
  static collection = 'mungo_test_update';

  static schema = {
    number : Number
  };
}

function test(props = {}) {
  const locals = {};

  return describe('Update', it => {
    it('Connect', () => new Promise((pass, fail) => {
      Mungo.connect(process.env.MUNGO_URL || 'mongodb://localhost/test')
        .on('error', fail)
        .on('connected', pass);
    }));

    it('Create documents', it => {
      for ( let i = 0; i < 1; i ++ ) {
        it(`Create { number : ${i} }`, () => Foo.insert({ number : i }));
      }
    });

    it('Document\'s version should be 0', it => {
      it('Fetch document', () => Foo.findOne().then(doc => { locals.doc = doc }));

      it('__v should be 0', () => {
        locals.doc.should.have.property('__v').which.is.exactly(0);
      });
    });

    it('Direct update', it => {
      it('Update document', () => Foo
        .update({}, { $inc : { number : 1 } })
        .then(docs => { locals.doc = docs[0] })
      );

      it('__v should be 1', () => locals.doc.should.have.property('__v').which.is.exactly(1));

      it('Document\'s version should be 1', it => {
        it('Fetch document', () => Foo.findOne().then(doc => { locals.doc = doc }));

        it('__v should be 1', () => {
          locals.doc.should.have.property('__v').which.is.exactly(1);
        });
      });
    });

    it('Indirect update', it => {
      it('Find one', it => {
        it('Update document by fetching it', () => new Promise((pass, fail) => {
          Foo.findOne()
            .then(doc => {
              locals.doc = doc;
              doc.set('number', 100).save().then(pass, fail);
            })
            .catch(fail);
        }));

        it('Document\'s version should be 2', it => {
          it('Fetch document', () => Foo.findOne().then(doc => { locals.doc = doc }));

          it('__v should be 2', () => {
            locals.doc.should.have.property('__v').which.is.exactly(2);
          });
        });
      });

      it('Find', it => {
        it('Empty collection', () => Foo.remove());

        it(`Create { number : 10 }`, () => Foo.insert({ number : 10 }));

        it('Update document by fetching it', () => new Promise((pass, fail) => {
          Foo.find()
            .then(docs => {
              Promise
                .all(docs.map(doc => doc.set('number', 100).save()))
                .then(pass, fail);
            })
            .catch(fail);
        }));

        it('Document\'s version should be 1', it => {
          it('Fetch document', () => Foo.findOne().then(doc => { locals.doc = doc }));

          it('__v should be 1', () => {
            locals.doc.should.have.property('__v').which.is.exactly(1);
          });
        });
      });
    });

    it('Empty collection', () => Foo.remove());
  });
}

export default test;
