'use strict';

import describe           from 'redtea';
import should             from 'should';
import MungoError         from '../lib/error';
import json               from '../../package.json';

function test(props = {}) {
  const locals = {};

  return describe('Mungo v' + json.version, it => {
    it('Error', it => {
      it('should be a class', () => MungoError.should.be.a.Function());

      it('should be an instance of Error', () => {
        locals.error = new MungoError('Oops!');
        locals.error.should.be.an.instanceof(Error);
      });

      it('should have the original message', () =>
        locals.error.should.have.property('originalMessage')
          .which.is.exactly('Oops!')
      );
    });
  });
}

export default test;
