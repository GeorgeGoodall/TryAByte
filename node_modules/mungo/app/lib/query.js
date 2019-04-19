'use strict';

import mongodb              from 'mongodb';
import Connection           from './connection';
import Projection           from './projection';
import prettify             from './prettify';
import MungoError           from './error';

class MungoQueryError extends MungoError {}

class Query {

  //----------------------------------------------------------------------------

  constructor (model) {
    this.model = model;
  }


  //----------------------------------------------------------------------------

  connect () {
    return new Promise((ok, ko) => {

      if ( this.db ) {
        return ok();
      }

      const aliveConnections = Connection.connections
        .filter(conn => ! conn.disconnected );

      const connection = aliveConnections[0];

      if ( connection ) {
        if ( connection.connected ) {
          this.db = connection.db;
        }
        else {
          connection.on('connected', connection => {
            this.db = connection.db;
          });
        }

        ok();
      }
      else {
        Connection.events.on('connected', connection => {
          this.db = connection.db;
          return ok();
        });
      }

    });
  }

  //----------------------------------------------------------------------------


  getCollection () {
    return new Promise((ok, ko) => {
      this.connect().then(
        () => {
          if ( this.collection ) {
            return ok();
          }

          this.collection = this.db.collection(this.model.collection);

          // console.log(prettify({ collection : this.collection.collectionName }));

          ok();
        },
        ko
      );
    });
  }

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------

  find (query = {}, projection = {}, options = {}) {

    const { model } = this;

    projection = new Projection(projection);

    // console.log(prettify({[`>>  Query {${this.model.name}#${this.model.version}} => find`] : { query, projection, options } }));

    const promise = new Promise((ok, ko) => {
      this.getCollection()
        .then(() => {
          const action = this.collection.find(query);

          action
            .limit(projection.limit)
            .skip(projection.skip)
            .sort(projection.sort);

          action.toArray()
            .then(documents => {

              // documents = documents.map(doc => new model(doc, true));

              // console.log(prettify({ [`<<  Query {${this.model.name}#${this.model.version}} <= find`] : { found : documents } }));

              ok(documents);
            })
            .catch(ko);
          })
          .catch(ko);
    });

    promise.limit = limit => {
      projection.setLimit(limit);
      return promise;
    };

    promise.skip = skip => {
      projection.setSkip(skip);
      return promise;
    };

    return promise;
  }

  //----------------------------------------------------------------------------

  findOne (query = {}, projection = {}, options = {}) {

    const { model } = this;

    projection = new Projection(projection);

    Object.assign(options, projection);

    return new Promise((ok, ko) => {
      this.getCollection()
        .then(() => {
          try {
            const action = this.collection.findOne(query, options);

            action.
              then(document => {
                try {
                  // console.log(`>> ${this.model.name}#${this.model.version} => findOne`.blue.bold);
                  // console.log(prettify(document));

                  ok(document);
                }
                catch ( error ) {
                  ko(error);
                }
              })
              .catch(ko);
          }
          catch ( error ) {
            ko(error);
          }
        })
        .catch(ko);
    });
  }

  //----------------------------------------------------------------------------

  count (query = {}) {
    const { model } = this;

    // console.log(prettify({ [`${this.model.name}.count()`] : query }));

    return new Promise((ok, ko) => {
      this.getCollection()
        .then(() => {
          try {
            const action = this.collection.count(query);

            action
              .then(count => {
                try {
                  // console.log(prettify({ [`${this.model.name}.count()`] : count}));

                  ok(count);
                }
                catch ( error ) {
                  ko(error);
                }
              })
              .catch(ko);
          }
          catch ( error ) {
            ko(error);
          }
        })
        .catch(ko);
    });
  }

  //----------------------------------------------------------------------------

  deleteMany (filter = {}, projection = {}, options = {}) {
    return new Promise((ok, ko) => {

      projection = new Projection(Object.assign({ limit : 0 }, projection));

      // console.log(prettify({ [`>> Query {${this.model.name}#${this.model.version}} => deleteMany`] : {filter, projection, options}}));

      this.getCollection().then(
        () => {

          let action;

          if ( ! projection.limit ) {
            action = this.collection.deleteMany(filter);
          }

          action
            .then(result => {
              // console.log(result);
              ok();
            })
            .catch(ko)
        },
        ko
      );
    });
  }

  //----------------------------------------------------------------------------

  deleteOne (filter = {}, projection = {}, options = {}) {
    return new Promise((ok, ko) => {
      try {
        projection = new Projection(Object.assign({ limit : 0 }, projection));

        // console.log(prettify({ [`>> Query {${this.model.name}#${this.model.version}} => deleteOne`] : {filter, projection, options}}));

        this.getCollection()
          .then(() => {
            try {
              let action;

              if ( ! projection.limit ) {
                action = this.collection.deleteOne(filter);
              }

              action
                .then(result => {
                  try {
                    // console.log('---------------------------------------');
                    // console.log(result);

                    // console.log(prettify({ [`<< Query {${this.model.name}#${this.model.version}} <= deleteOne`] : result.deletedCount}));

                    ok(result.deletedCount);
                  }
                  catch ( error ) {
                    ko(error);
                  }
                })
                .catch(ko)
            }
            catch ( error ) {
              ko(error);
            }
          })
          .catch(ko);
      }
      catch ( error ) {
        ko(error);
      }
    });
  }

  //----------------------------------------------------------------------------

  insertMany (docs = [], options = {}) {
    return new Promise((ok, ko) => {

      const { model } = this;

      // console.log(prettify({ [`>> Query {${model.name}#${model.version}} => insertMany`] : { docs, options }}));

      this.getCollection().then(
        () => {

          let action = this.collection.insertMany(docs);

          action
            .then(res => {
              ok(res.ops.map(op => new model(op, true)));
            })
            .catch(ko);
        },
        ko
      );
    });
  }

  //----------------------------------------------------------------------------

  insertOne (doc = {}, options = {}) {
    return new Promise((ok, ko) => {

      const { model } = this;

      // console.log(prettify({ [`>> Query {${this.model.name}#${this.model.version}} => insertOne`] : { doc, options } }));

      this.getCollection()

        .then(() => {
          let action = this.collection.insertOne(doc);

          action
            .then(inserted => {

              // const document = new model(inserted.ops[0], true);

              // console.log(prettify({ [`<< Query {${this.model.name}#${this.model.version}} <= insertOne`] : { ops:  inserted.ops } }));



              ok(inserted.ops[0]);
            })
            .catch(ko);
        })

        .catch(ko);
    });
  }

  //----------------------------------------------------------------------------

  /**   Update One Document
   *
   *    @arg      {Object}    filter={}     - Getter
   *    @arg      {Object}    modifier={}   - Setter
   *    @arg      {Object}    options={}
   */

  //----------------------------------------------------------------------------

  updateOne (filter = {}, modifier = {}, options = {}) {
    return new Promise((ok, ko) => {

      const { model } = this;

      this.getCollection().then(
        () => {
          let action = this.collection.updateOne(filter, modifier, options);

          action
            .then(ok, ko);
        },
        ko
      );
    });
  }

  //----------------------------------------------------------------------------

  updateMany (filter = {}, modifier = {}, options = {}) {
    return new Promise((ok, ko) => {
      try {
        // console.log(prettify({[`>> Query {${this.model.name}#${this.model.version}} => updateMany`]: {filter,modifier,options}}));

        this.getCollection().then(
          () => {
            let action = this.collection.updateMany(
              filter,
              modifier,
              options
            );

            action.then(ok, ko);
          },
          ko
        );
      }
      catch ( error ) {
        ko(error);
      }
    });
  }

}

export default Query;
