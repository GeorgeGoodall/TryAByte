'use strict';

import describe from 'redtea';
import should from 'should';
import Mungo from '../';
import FindStatement from '../lib/find-statement';

class Foo extends Mungo.Model {
  static schema = { foo : String };
}

function test (props = {}) {
  const locals = {};

  return describe('$sort', it => {
    it('should instantiate a new FindStatement', it => {
      locals.query = new FindStatement({ $sort : { foo : 1 } }, Foo);
    });

    it('should have a projection property', it => {
      locals.query.should.have.property('$projection').which.is.an.Object();
    });

    it('should have a sort', it => {
      locals.query.$projection.should.have.property('sort')
        .which.is.an.Object();
    });

    it('should be a sorter', it => {
      locals.query.$projection.sort.should.have.property('foo')
        .which.is.exactly(1);
    });
  });
}

export default test;
