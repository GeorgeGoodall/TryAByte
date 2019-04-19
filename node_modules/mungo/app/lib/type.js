'use strict';

import mongodb from 'mongodb';
import prettify from './prettify';
import MungoError from './error';

class MungoTypeError extends MungoError {}

//------------------------------------------------------------------------------

class _Object {
  constructor(object = {}) {
    Object.assign(this, object);
  }

  /** Boolean */ static validate (value) {
    return value && typeof value === 'object' && value.constructor === Object;
  }

  /** Mixed */ static convert (value) {
    return value;
  }
}

//------------------------------------------------------------------------------

class _Array {
  static convert (array, type) {
    try {
      if ( array === null ) {
        return null;
      }

      type = Type.associate(type);

      // if ( type.isSubdocument() ) {
      //   console.log('-------------------------------------');
      //   return array.map(item => {
      //     for ( let field in item ) {
      //
      //     }
      //   })
      // }

      return array.map(item => type.convert(item));
    }
    catch ( error ) {
      console.log(type);

      throw MungoTypeError.rethrow(error, 'Could not convert array', { array, type });
    }
  }

  static validate (array, type) {
    try {
      type = Type.associate(type);

      return array.every(item => type.validate(item));
    }
    catch ( error ) {
      throw MungoTypeError.rethrow(error, 'Could not convert array', { array, type });
    }
  }
}

//------------------------------------------------------------------------------

class _Subdocument {
  static convert (subdoc, schema) {
    const converted = {};

    for ( let field in subdoc ) {
      if ( field in schema ) {
        converted[field] = schema[field].type.convert(subdoc[field]);
      }
    }

    return converted;
  }

  static validate (array, type) {
    const validated = {};

    for ( let field in subdoc ) {
      validated[field] = schema[field].type.validate(subdoc[field]);
    }

    return Object.keys(validated).every(key => validated[key]);
  }
}

//------------------------------------------------------------------------------

class _Mixed {
  static validate (value) {
    return true;
  }

  static convert (value) {
    return value;
  }
}

//------------------------------------------------------------------------------

class _String {

  static validate (value) {
    return (typeof value === 'string');
  }

  static convert (value) {
    if ( value === null || typeof value === 'undefined' ) {
      return null;
    }
    return value.toString();
  }

}

//------------------------------------------------------------------------------

class _Number {

  static validate (value) {
    return value.constructor === Number && isFinite(value);
  }

  static convert (value) {
    return +value;
  }

}

//------------------------------------------------------------------------------

class _Boolean {

  static validate (value) {
    return typeof value === 'boolean';
  }

  static convert (value) {
    return !!value;
  }

}

//------------------------------------------------------------------------------

class _Date {
  static validate (value) {
    return value instanceof Date;
  }

  static convert (value) {
    try {
      return new Date(new Date(value).toISOString());
    }
    catch ( error ) {
      throw MungoTypeError.rethrow(error, 'Could not convert value to date', { value });
    }
  }
}

//------------------------------------------------------------------------------

class _ObjectID extends mongodb.ObjectID {
  static validate (value) {
    return value instanceof mongodb.ObjectID;
  }

  static convert (value) {
    try {
      // console.log(prettify({'converting ObjectId' : { value }}));

      if ( value === null ) {
        return undefined;
      }

      if ( typeof value === 'string' ) {
        return mongodb.ObjectID(value);
      }

      if ( value instanceof mongodb.ObjectID ) {
        return value;
      }

      if ( value && typeof value === 'object' ) {

        if ( value.$in ) {
          return { $in : value.$in.map(value => Type.ObjectID.convert(value)) };
        }

        if ( value._id ) {
          return mongodb.ObjectID(value._id);
        }
      }
    }
    catch ( error ) {
      throw MungoTypeError.rethrow(error, 'Could not convert objectId', { value });
    }
  }
}

//------------------------------------------------------------------------------

class _Geo {
  static MongoDBType = '2d';

  static validate (value) {
    return new Type(Array, Number).validate(value);
  }

  static convert (value) {
    return new Type(Array, Number).convert(value);
  }
}

//------------------------------------------------------------------------------

class Type {
  static Object         =   _Object;

  static ObjectID       =   _ObjectID;

  static Mixed          =   _Mixed;

  static String         =   _String;

  static Number         =   _Number;

  static Boolean        =   _Boolean;

  static Date           =   _Date;

  static Array          =   _Array;

  static Subdocument    =   _Subdocument;

  static Geo            =   _Geo;

  static associate(type) {
    switch ( type ) {
      case String:      return Type.String;
      case Number:      return Type.Number;
      case Boolean:     return Type.Boolean;
      case Object:      return Type.Object;
      case Date:        return Type.Date;
      case Array:       return Type.Array;
      default:          return type;
    }
  }

  args = [];

  getType() {
    return this.type;
  }

  isSubdocument () {
    return this.type === _Subdocument;
  }

  getSubdocument () {
    if ( this.isSubdocument() ) {
      return this.args[0];
    }
  }

  isArray () {
    return this.type === _Array;
  }

  getArray () {
    if ( this.isArray() ) {
      return this.args[0];
    }
  }

  convert(value) {

    if ( typeof this.type.convert !== 'function' ) {
      throw MungoTypeError.rethrow(
        new Error('Can not convert type'),
        'Can not convert type',
        {
          type : this.type.name,
          convert : this.type.convert
        }
      );
    }

    try {
      return this.type.convert(value, ...this.args);
    }
    catch ( error ) {
      throw error;
    }
  }

  validate(value) {
    return this.type.validate(value, ...this.args);
  }

  constructor(type, ...args) {

    this.args = args;

    this.type = this.constructor.associate(type);
  }
}

export default Type;
