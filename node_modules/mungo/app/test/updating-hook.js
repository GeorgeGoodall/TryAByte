'use strict';

import describe from 'redtea';
import should from 'should';
import Mungo from '..';

class Foo extends Mungo.Model {
  static collection = 'mungo_test_updating_hook';

  static schema = {
    number : Number,
    touched : {
      type : Number, default : 0
    }
  };

  static updating () {
    return [::this.touching];
  }

  static touching (doc) {
    return new Promise((pass, fail) => {
      doc.increment('touched', 1);
      pass();
    });
  }
}

function test(props = {}) {
  const locals = {};

  return describe('Updating hook', it => {
    it('Connect', () => new Promise((pass, fail) => {
      Mungo.connect(process.env.MUNGO_URL || 'mongodb://localhost/test')
        .on('error', fail)
        .on('connected', pass);
    }));

    it('Create documents', it => {
      it('Model.create({ number : 0 })', () => Foo.insert({ number : 0 }))
    });

    it('Direct update', it => {
      it('Model.update({ number : 1 })', () => Foo.update({}, { number : 1 }));

      it('fetch document', () => Foo.findOne().then(doc => { locals.doc = doc }));

      it('touched should be 1', () => locals.doc.should.have.property('touched').which.is.exactly(1));
    });

    it('Empty collection', () => Foo.remove());
  });
}

export default test;
