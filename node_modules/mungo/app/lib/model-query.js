'use strict';

import Query                      from './query';
import Document                   from './document';
import FindStatement              from './find-statement';
import UpdateStatement            from './update-statement';
import ModelMigrate               from './model-migrate';
import sequencer                  from 'promise-sequencer';
import prettify                   from './prettify';
import MungoError                 from './error';

class MungoModelQueryError extends MungoError {}

function normalizeModifier (modifier, model) {
  if ( ! ( '$inc' in modifier ) ) {
    modifier.$inc = {};
  }

  modifier.$inc.__v = 1;

  if ( ! ( '$set' in modifier ) ) {
    modifier.$set = {};
  }

  if ( ! ( '__V' in modifier.$set ) && ! ( modifier.$unset && '__V' in modifier.$unset ) ) {
    modifier.$set.__V = model.version;
  }

  if ( ! Object.keys(modifier.$set).length ) {
    delete modifier.$set;
  }
}

class ModelQuery extends ModelMigrate {

  static isFromDB = true;

  //----------------------------------------------------------------------------

  /** Execute a new Query with this as model
   *
   *  @arg        string      cmd
   *  @arg        [mixed]     args
   *  @return     {Promise}
   */

  //----------------------------------------------------------------------------

  static exec (cmd, ...args) {
    const q = new Query(this);

    return q[cmd].apply(q, args);
  }

  //----------------------------------------------------------------------------

  /** Count documents in collection
   *
   *  @arg        {Object}      filter={}       - Get filter
   *  @arg        {Object}      options={}
   *  @return     {Promise}
   */

  //----------------------------------------------------------------------------

  static count (filter = {}, options = {}) {
    if ( ! ( filter instanceof FindStatement ) ) {
      filter = new FindStatement(filter, this);
    }

    delete filter.$projection;

    return this.exec('count', filter, options);
  }

  //----------------------------------------------------------------------------

  static create (...args) {
    if ( Array.isArray(args[0]) ) {
      return this.insertMany(...args[0]);
    }

    if ( ! args.length ) {
      return this.insertOne({});
    }

    if ( args.length === 1 ) {
      return this.insertOne(args[0]);
    }

    return this.insertMany(...args);
  }

  //----------------------------------------------------------------------------

  static delete (...args) {
    return this.deleteMany(...args);
  }

  //----------------------------------------------------------------------------

  static deleteById (_id) {
    return this.deleteOne({ _id });
  }

  //----------------------------------------------------------------------------

  /** Delete many
   *
   *  @arg        object      filter
   *  @arg        object      projection
   *  @arg        object      options
   *  @return     {Promise}
   */

  //----------------------------------------------------------------------------

  static deleteMany (filter = {}, projection = {}, options = {}) {
    return new Promise((ok, ko) => {
      if ( ! ( filter instanceof FindStatement ) ) {
        filter = new FindStatement(filter, this);
      }

      Object.assign(projection, filter.$projection);

      delete filter.$projection;

      const delProjection = query => {
        delete query.$projection;
        return query;
      }

      sequencer
        .pipe(

          () => this.find(filter, projection, options),

          docs => sequencer.pipe(

            () => Promise.all(docs.map(doc => sequencer(
              (this.removing() || []).map(fn => () => fn(doc))
            ))),

            () => this.exec('deleteMany',
              delProjection(new FindStatement({ _id : { $in : docs } }, this))
            ),

            () => new Promise(ok => ok(docs))

          )

      )
      .then(docs => {
        ok(docs);

        Promise.all(docs.map(doc => sequencer(
          (this.removed() || []).map(fn => () => fn(doc))
        )));
      })
      .catch(ko);
    });
  }

  //----------------------------------------------------------------------------

  static deleteOne (filter = {}) {
    return new Promise((ok, ko) => {
      if ( ! ( filter instanceof FindStatement ) ) {
        filter = new FindStatement(filter, this);
      }

      delete filter.$projection;

      const delProjection = query => {
        delete query.$projection;
        return query;
      }

      sequencer.pipe(
        () => this.findOne(filter),

        doc => sequencer.pipe(

          () => sequencer((this.removing() || []).map(fn => () => fn(doc))),

          () => this.exec('deleteOne', delProjection(new FindStatement({ _id : doc }, this))),

          () => new Promise(ok => ok(doc))

        )
      )
      .then(doc => {
        ok(doc);

        sequencer((this.removed() || []).map(fn => () => fn(doc)));
      })
      .catch(ko);
    });
  }

  //----------------------------------------------------------------------------

  static find (filter = {}, projection = {}, options = {}) {
    const promise = new Promise((ok, ko) => {
      if ( ! ( filter instanceof FindStatement ) ) {
        filter = new FindStatement(filter, this);
      }

      Object.assign(projection, filter.$projection);

      delete filter.$projection;

      process.nextTick(() => {
        this
          .exec('find', filter, projection, options)
          .then(documents => {
            documents = documents.map(doc => new this(doc, true));
            ok(documents);
          })
          .catch(ko);
      });
    });

    promise.limit = limit => {
      projection.limit = limit;
      return promise;
    };

    promise.skip = skip => {
      projection.skip = skip;
      return promise;
    };

    promise.sort = sort => {
      projection.sort = sort;
      return promise;
    };

    return promise;
  }

  //----------------------------------------------------------------------------

  static findById (id) {
    return this.findOne({ _id : id });
  }

  //----------------------------------------------------------------------------

  static findByIds (..._ids) {
    if ( _ids.length === 1 && Array.isArray(_ids[0]) ) {
      _ids = _ids[0];
    }
    return this.find({ _id : { $in : _ids } });
  }

  //----------------------------------------------------------------------------

  static findOne (filter = {}, projection = {}) {
    if ( ! ( filter instanceof FindStatement ) ) {
      filter = new FindStatement(filter, this);
    }

    Object.assign(projection, filter.$projection);

    delete filter.$projection;

    const promise = new Promise((ok, ko) => {
      process.nextTick(() => {
        this
          .exec('findOne', filter, projection)
          .then(document => {
            if ( ! document ) {
              return ok();
            }
            ok(new this(document, this.isFromDB));
          })
          .catch(ko);
      });
    });

    promise.limit = limit => {
      projection.limit = limit;
      return promise;
    };

    promise.skip = skip => {
      projection.skip = skip;
      return promise;
    };

    promise.sort = sort => {
      projection.sort = sort;
      return promise;
    };

    return promise;
  }

  //----------------------------------------------------------------------------

  static findOneRandom (filter = {}, projection = {}, options = {}) {
    if ( ! ( filter instanceof FindStatement ) ) {
      filter = new FindStatement(filter, this);
    }

    Object.assign(projection, filter.$projection);

    delete filter.$projection;

    return sequencer.pipe(

      () => this.exec('count', filter),

      count => new Promise((ok, ko) => {
        options.skip = Math.ceil(Math.max(0, Math.floor(count)*Math.random()));
        ok();
      }),

      () => this.findOne(filter, projection, options)

    );
  }

  //----------------------------------------------------------------------------

  static findRandomOne (filter = {}, projection = {}, options = {}) {
    return this.findOneRandom(filter, projection, options);
  }

  //----------------------------------------------------------------------------

  static insert (...args) {
    return this.create(...args);
  }

  //----------------------------------------------------------------------------

  static insertMany (...docs) {
    // console.log('insertMany', ...docs);
    return Promise.all(
      docs
        .map(doc => {
          if ( ! ( doc instanceof this ) ) {
            doc = new this(doc);
          }
          // console.log('new', doc);
          return doc;
        })
        .map(doc => new Promise((ok, ko) => {
          doc.save().then(() => ok(doc)).catch(ko);
        }))
    );
  }

  //----------------------------------------------------------------------------

  static insertOne (doc) {
    return new Promise((ok, ko) => {
      try {
        if ( ! ( doc instanceof this ) ) {
          doc = new this(doc);
        }

        doc
          .set({ __v : 0, __V : this.version })
          .save()
          .then(() => ok(doc))
          .catch(ko);
      }
      catch ( error ) {
        ko(error);
      }
    });
  }

  //----------------------------------------------------------------------------

  static remove (filter = {}) {
    return this.deleteMany(filter);
  }

  //----------------------------------------------------------------------------

  static update (filter = {}, modifier = {}, options = {}) {
    return this.updateMany(filter, modifier, options);
  }

  //----------------------------------------------------------------------------

  static updateById (_id, modifier = {}, options = {}) {
    return this.updateOne({ _id }, modifier, options);
  }

  //----------------------------------------------------------------------------

  static updateByIds (ids, modifier = {}, options = {}) {
    return this.updateMany({ _id : { $in : ids } }, modifier, options);
  }

  //----------------------------------------------------------------------------

  static updateOne (filter, modifier, options = {}) {
    return new Promise((ok, ko) => {
      if ( ! ( filter instanceof FindStatement ) ) {
        filter = new FindStatement(filter, this);
      }

      delete filter.$projection;

      if ( ! ( modifier instanceof UpdateStatement ) ) {
        modifier = new UpdateStatement(modifier, this);
      }

      normalizeModifier(modifier, this);

      // Get document from DB

      this.findOne(filter, options)
        .then(doc => {
          if ( ! doc ) {
            return ok();
          }

          sequencer.pipe(

            // Apply before hooks

            () => sequencer((this.updating() || []).map(fn => () => fn(doc))),

            // Put hooks changes into modifiers and update

            () => new Promise((ok, ko) => {

              let _modifiers = Object.assign({}, modifier);

              if ( Object.keys(doc.$changes).length ) {
                if ( ! ( '$set' in _modifiers ) ) {
                  _modifiers.$set = {};
                }

                Object.assign(_modifiers.$set, doc.$changes);
              }

              sequencer
                .pipe(
                  () => this.exec('updateOne', { _id : doc._id }, _modifiers),

                  () => this.findOne({ _id : doc._id })
                )
                .then(doc => ok(doc))
                .catch(ko)
            })

          )
          .then(doc => {


            ok(doc);

            sequencer((this.updated() || []).map(fn => () => fn(doc)))
          })
          .catch(ko)
        })
        .catch(ko);
    });

    // if ( ! ( filter instanceof FindStatement ) ) {
    //   filter = new FindStatement(filter, this);
    // }
    //
    // if ( ! ( modifier instanceof UpdateStatement ) ) {
    //   modifier = new UpdateStatement(modifier, this);
    // }
    //
    // normalizeModifier(modifier, this);
    //
    // return sequencer.pipe(
    //   () => this.exec('updateOne', filter, modifier, options),
    //
    //   updated => new Promise(ok => ok(new this(updated, true)))
    // );
  }

  //----------------------------------------------------------------------------

  /**   Update Many - Update more than 1 document at a time
   *
   *    @arg  {FindStatement}|{Object}      filter={}       - Get filter
   *    @arg  {UpdateStatement}|{Object}    modifier={}     - Set filter
   *    @arg  {Object}                      options={}      - Optional settings
   *    @return   {Promise}
  */

  //----------------------------------------------------------------------------

  static updateMany (filter = {}, modifier = {}, options = {}) {
    return new Promise((ok, ko) => {

      if ( ! ( filter instanceof FindStatement ) ) {
        filter = new FindStatement(filter, this);
      }

      delete filter.$projection;

      if ( ! ( modifier instanceof UpdateStatement ) ) {
        modifier = new UpdateStatement(modifier, this);
      }

      normalizeModifier(modifier, this);

      sequencer.pipe(

        // Get documents from DB

        () => this.find(filter, options),

        docs => sequencer.pipe(

          // Apply before hooks

          // () => Promise.all(docs.map(doc =>
          //   sequencer((this.updating() || []).map(fn => () => fn(doc)))
          // )),

          // Put hooks changes into modifiers

          () => Promise.all(docs.map(doc => new Promise((ok, ko) => {

            let _modifiers = Object.assign({}, modifier);

            if ( Object.keys(doc.$changes).length ) {
              if ( ! ( '$set' in _modifiers ) ) {
                _modifiers.$set = {};
              }

              Object.assign(_modifiers.$set, doc.$changes);
            }

            if ( _modifiers.$set ) {
              for ( const set in _modifiers.$set ) {
                doc.set(set, _modifiers.$set[set]);
              }
            }

            if ( _modifiers.$inc ) {
              for ( const inc in _modifiers.$inc ) {
                doc.increment(inc, _modifiers.$inc[inc]);
              }
            }

            doc.save().then(ok, ko);

            // this
            //   .exec('updateOne', { _id : doc._id }, _modifiers)
            //   .then(() => {
            //
            //     if ( _modifiers.$set ) {
            //       for ( const set in _modifiers.$set ) {
            //         doc.set(set, _modifiers.$set[set]);
            //       }
            //     }
            //
            //     if ( _modifiers.$inc ) {
            //       for ( const inc in _modifiers.$inc ) {
            //         doc.increment(inc, _modifiers.$inc[inc]);
            //       }
            //     }
            //
            //     ok(doc);
            //   })
            //   .catch(ko)
          })))
        )
      )
      .then(docs => {
        ok(docs);

        docs.forEach(doc =>
          sequencer((this.updated() || []).map(fn => () => fn(doc)))
        );
      })
      .catch(ko);

    });

  }

  //----------------------------------------------------------------------------
}

export default ModelQuery;
