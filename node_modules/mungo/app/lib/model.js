'use strict';

import colors           from 'colors';
import sequencer        from 'promise-sequencer';
import ModelStatic      from './model-static';
import Document         from './document';
import UpdateStatement  from './update-statement';
import prettify         from './prettify';
import MungoError       from './error';
import Type             from './type';
import isPrototypeOf    from './is-prototype-of';
import Schema           from './schema';

class MungoModelError extends MungoError {}

class Model extends ModelStatic {

  $changes = {};

  $populated = {};

  //----------------------------------------------------------------------------

  getSchema () {
    return this.constructor.getSchema();
  }

  //----------------------------------------------------------------------------

  $document = {};

  //----------------------------------------------------------------------------

  $original = {};

  //----------------------------------------------------------------------------

  constructor (original = {}, fromDB = false) {
    super();

    this.$original = original;

    this.$fromDB = fromDB;

    this.$document = new Document(original, this.constructor);

    // console.log(prettify({ [this.constructor.name] : this }));

    const self = this;

    for ( let field in this.$document ) {
      Object.assign(this, {
        get [field] () {
          return self.$document[field];
        }
      });
    }
  }

  //----------------------------------------------------------------------------

  set (field, value) {

    if ( typeof field === 'object' ) {
      for( let i in field ) {
        this.set(i, field[i]);
      }
      return this;
    }

    const schema = this.constructor.getSchema();

    this.$document[field] = this.$document.parseField(field, value, schema[field]);

    if ( field !== '_id' ) {
      this.$changes[field] = this.$document[field];
    }

    const self = this;

    Object.assign(this, {
      get [field] () {
        return self.$document[field];
      }
    });

    return this;
  }

  //----------------------------------------------------------------------------

  increment (field, step = 1) {
    if ( typeof field === 'object' ) {
      for( let i in field ) {
        this.increment(i, field[i]);
      }
      return this;
    }

    const schema = this.constructor.getSchema();

    let current = +(this.$document[field] || 0);

    return this.set(field, current + step);
  }

  //----------------------------------------------------------------------------

  push (field, value) {

    if ( typeof field === 'object' ) {
      for( let i in field ) {
        this.push(i, field[i]);
      }
      return this;
    }

    const schema = this.constructor.getSchema();

    if ( ! ( field in schema ) ) {
      throw new MungoModelError('Can not push to an unset field', { field, modelName : this.constructor.name });
    }

    if ( ! this.$document[field] ) {
      this.$document[field] = this.$document.parseField(field, [], schema[field]);
    }

    this.$document[field].push(this.$document.parseField(field, [value], schema[field])[0]);

    this.$changes[field] = this.$document[field];

    const self = this;

    Object.assign(this, {
      get [field] () {
        return self.$document[field];
      }
    });

    return this;
  }

  //----------------------------------------------------------------------------

  map (field, mapper) {

    if ( typeof field === 'object' ) {
      for( let i in field ) {
        this.push(i, field[i]);
      }
      return this;
    }

    const schema = this.constructor.getSchema();

    if ( ! ( field in schema ) ) {
      throw new MungoModelError('Can not map to an unset field', { field, modelName : this.constructor.name });
    }

    if ( ! this.$document[field] ) {
      this.$document[field] = this.$document.parseField(field, [], schema[field]);
    }

    const mapped = this.$document[field].map(mapper);

    return this.set(field, mapped);

  }

  //----------------------------------------------------------------------------

  get (field) {
    return this.$document[field];
  }

  //----------------------------------------------------------------------------

  save (options = {}) {
    return new Promise((ok, ko) => {
      try {
        const Model = this.constructor;

        this.set('__V', Model.version);

        if ( this.$fromDB ) {

          if ( typeof this.get('__v') === 'undefined' ) {
            this.set('__v', 0);
          }

          else if ( ! ( '__v' in this.$changes ) ) {
            this.increment('__v', 1);
          }

          sequencer(

            () => sequencer((Model.updating() || []).map(fn => () => fn(this))),

            () => Model.exec('updateOne', { _id : this.get('_id') }, new UpdateStatement(this.$changes, Model))

          )

            .then(() => {
              ok(this);

              sequencer((Model.updated() || []).map(fn => () => fn(this)))
                .then(() => { this.$changes = {} });
            })

            .catch(ko);
        }

        else {
          this.set('__v', 0);

          this.setDefaults();

          try {
            this.required();
          }
          catch (error) {
            return ko(error);
          }

          sequencer.pipe(
            () => sequencer(
              (Model.inserting() || []).map(fn => () => fn(this))
            ),

            () => Model.exec('insertOne', this.$document)
          )

            .then(inserted =>  {

              this.set('_id', inserted._id);

              this.$fromDB = true;

              const self = this;

              Object.assign(this, {
                get _id () {
                  return self.get('_id')
                }
              });

              ok(this);

              sequencer((Model.inserted() || []).map(fn => () => fn(this)))
            })

            .catch(ko);
        }
      }
      catch ( error ) {
        ko(error);
      }
    });
  }

  //----------------------------------------------------------------------------

  toJSON (options = {}) {
    const serialized = JSON.parse(JSON.stringify(this.$document));

    const schema = this.constructor.getSchema();

    const { flatten } = schema;

    for ( let field in flatten ) {
      if ( flatten[field].private ) {
        delete serialized[field];
      }
    }

    return serialized;
  }

  //----------------------------------------------------------------------------

  toString (options = {}) {
    return JSON.stringify(this.toJSON(options));
  }

  //----------------------------------------------------------------------------

  populate (options = {}) {

    return new Promise((ok, ko) => {
      try {
        const { flatten } = this.constructor.getSchema();

        // console.log('POPULATING'.bgMagenta, this.$document);

        const promises = [];

        for ( let field in flatten ) {
          let { type } = flatten[field];

          if ( isPrototypeOf(type.type, Model) ) {

            const value = this.get(flatten[field].flatten);

            if ( value ) {

              // console.log('POPULATING'.bgBlue, field, flatten[field].flatten, value);

              promises.push(new Promise((ok, ko) => {
                try {
                  type.type
                    .findById(value)
                    .then(doc => {
                      try {
                        // console.log('POPULATED'.bgGreen, flatten[field].flatten, doc);
                        this.$populated[flatten[field].flatten] = doc;
                        ok();
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
              }));
            }
          }

          else if ( type.type === Type.Array &&
            isPrototypeOf(type.args[0].type, Model) ) {
            const value = this.get(flatten[field].flatten);

            if ( value ) {
              promises.push(new Promise((ok, ko) => {
                try {
                  type.args[0].type
                    .find({ _id : { $in : value } })
                    .then(docs => {
                      try {
                        this.$populated[flatten[field].flatten] = docs;
                        ok();
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
              }));
            }
          }
        }

        Promise.all(promises).then(ok, ko);
      }
      catch ( error ) {
        ko(MungoModelError.rethrow(error, 'Could not populate', {
          modelName : this.constructor.name, _id : this._id
        }));
      }
    });
  }

  //----------------------------------------------------------------------------

  setDefaults () {
    const schema = this.constructor.getSchema();

    for ( let field in schema ) {
      const applyDefaultCheckers = [
        ( 'default' in schema[field] ),
        (
          ! ( field in this.$document ) ||
          this.$document[field] === null ||
          typeof this.$document[field] === 'undefined'
        )
      ];

      if ( applyDefaultCheckers.every(i => i) ) {
        if ( typeof schema[field].default === 'function' ) {
          this.set(field, schema[field].default());
        }
        else {
          this.set(field, schema[field].default);
        }
      }
    }

    return this;
  }

  //----------------------------------------------------------------------------

  required () {
    const schema = this.constructor.getSchema();

    const { flatten } = schema;

    for ( let field in flatten ) {
      if ( 'required' in flatten[field] ) {

        if ( ! /\./.test(field) && ! ( field in this.$document ) ) {
          throw new MungoModelError(`Missing field ${field}`, {
            code : MungoModelError.MISSING_REQUIRED_FIELD,
          });
        }

        const val = Schema.find(field, this.$document);

        if ( typeof val === 'undefined' ) {
          throw new MungoModelError(`Missing field ${field}`, {
            code : MungoModelError.MISSING_REQUIRED_FIELD,
            document : this.$document
          });
        }
      }
    }
  }

}

Model.MungoModelError = MungoModelError;

export default Model;
