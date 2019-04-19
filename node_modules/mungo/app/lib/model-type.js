'use strict';

import mongodb from 'mongodb';
import MungoError from './error';

class ModelTypeError extends MungoError {}

class ModelType {

  static validate (value) {
    return value instanceof mongodb.ObjectID;
  }

  static convert (value) {
    try {
      if ( ! value ) {
        return null;
      }

      if ( value instanceof this ) {
        if ( value.get('_id') ) {
          return value.get('_id');
        }

        value.set('_id', mongodb.ObjectID());

        return value.get('_id');
      }

      if ( value instanceof mongodb.ObjectID ) {
        return value;
      }

      else if ( typeof value === 'string' ) {
        return mongodb.ObjectID(value);
      }

      if ( typeof value === 'object' && value._id ) {
        return mongodb.ObjectID(value._id);
      }

      const model = new this(value);

      model.set('_id', mongodb.ObjectID());

      return model._id;
    }
    catch ( error ) {
      throw ModelTypeError.rethrow(error, 'Could not convert model', { value, model: { name : this.name, version : this.version } });
    }
  }

}

export default ModelType;
