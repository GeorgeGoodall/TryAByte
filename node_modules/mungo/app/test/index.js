'use strict';

import describe           from 'redtea';
import should             from 'should';
import Mungo              from '..';
import json               from '../../package.json';
import Index              from '../lib/index';
import Query              from '../lib/query';
import Model              from '../lib/model';
import Document           from '../lib/document';
import Schema             from '../lib/schema';
import Type               from '../lib/type';
import Connection         from '../lib/connection';
import Migration          from '../lib/migration';
import MungoError         from '../lib/error';
import FindStatement      from '../lib/find-statement';
import UpdateStatement    from '../lib/update-statement';

function test(props = {}) {
  return describe('Mungo v' + json.version, it => {
    it('module', it => {
      it('should be a class', () => Mungo.should.be.a.Function());

      it('Deprecated', it => {
        it('Mixed', it => {
          it('should exist', () => Mungo.should.have.property('Mixed'));
          it('should be Type.Mixed', () => Mungo.Mixed.should.be.exactly(Type.Mixed));
        });

        it('ObjectID', it => {
          it('should exist', () => Mungo.should.have.property('ObjectID'));
          it('should be Type.ObjectID', () => Mungo.ObjectID.should.be.exactly(Type.ObjectID));
        });
      });

      it('Index', it => {
        it('should be Index', () => Mungo
          .should.have.property('Index')
          .which.is.exactly(Index)
        );
      });

      it('Query', it => {
        it('should be Query', () => Mungo
          .should.have.property('Query')
          .which.is.exactly(Query)
        );
      });

      it('Model', it => {
        it('should be Model', () => Mungo
          .should.have.property('Model')
          .which.is.exactly(Model)
        );
      });

      it('Document', it => {
        it('should be Document', () => Mungo
          .should.have.property('Document')
          .which.is.exactly(Document)
        );
      });

      it('Schema', it => {
        it('should be Schema', () => Mungo
          .should.have.property('Schema')
          .which.is.exactly(Schema)
        );
      });

      it('Type', it => {
        it('should be Type', () => Mungo
          .should.have.property('Type')
          .which.is.exactly(Type)
        );
      });

      it('Connection', it => {
        it('should be Connection', () => Mungo
          .should.have.property('Connection')
          .which.is.exactly(Connection)
        );
      });

      it('Migration', it => {
        it('should be Migration', () => Mungo
          .should.have.property('Migration')
          .which.is.exactly(Migration)
        );
      });

      it('Error', it => {
        it('should be Error', () => Mungo
          .should.have.property('Error')
          .which.is.exactly(MungoError)
        );
      });

      it('FindStatement', it => {
        it('should be FindStatement', () => Mungo
          .should.have.property('FindStatement')
          .which.is.exactly(FindStatement)
        );
      });

      it('UpdateStatement', it => {
        it('should be UpdateStatement', () => Mungo
          .should.have.property('UpdateStatement')
          .which.is.exactly(UpdateStatement)
        );
      });

      it('Aliases', it => {
        it('Connect', it => {
          it('connect()', it => {
            it('should be Connection.connect()', () =>
              Mungo.should.have.property('connect')
                .which.is.a.Function()
            );
          });

          it('disconnect()', it => {
            it('should be Connection.disconnect()', () =>
              Mungo.should.have.property('disconnect')
                .which.is.a.Function()
            );
          });

          it('connectify()', it => {
            it('should be Connection.connectify()', () =>
              Mungo.should.have.property('connectify')
                .which.is.a.Function()
            );
          });

          it('connections', it => {
            it('should be Connection.connections', () =>
              Mungo.should.have.property('connections')
                .which.is.an.Array()
            );
          });
        })
      });
    });
  });
}

export default test;
