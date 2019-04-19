'use strict';

import mongodb from 'mongodb';
import Type from './type';
import prettify from './prettify';
import MungoError from './error';

class MungoFindStatementError extends MungoError {}

class FindStatement {

  static operators = [
    '$eq',
    '$gt',
    '$gte',
    '$lt',
    '$lte',
    '$ne',
    '$in',
    '$nin',
    '$or',
    '$and',
    '$not',
    '$nor',
    '$exists',
    '$type',
    '$mod',
    '$regex',
    '$options',
    '$text',
    '$where',
    '$geoWithin',
    '$geoIntersects',
    '$near',
    '$nearSphere',
    '$all',
    '$elemMatch',
    '$size',
    '$bitsAllSet',
    '$bitsAnySet',
    '$bitsAllClear',
    '$bitsAnyClear',
    '$comment',
    '$meta',
    '$slice',
    '$sort'
  ];

  /** new FindStatement
   *  @arg object document
   *  @arg function model
   **/

  constructor (document, model) {
    if ( document.constructor !== Object ) {
      throw new MungoError(
        'new FindStatement(document) > document must be an object',
        { document, model }
      );
    }

    if ( typeof model !== 'function' ) {
      throw new MungoError(
        'new FindStatement(model) > model must be a class',
        { document, model }
      );
    }

    const parsed = this.parseAll(document, model.getSchema());

    for ( let field in parsed ) {
      if ( typeof parsed[field] !== 'undefined' ) {
        this[field] = parsed[field];
      }
    }
  }

  /** Parse an object of fields
   *
   *  @arg object document
   *  @arg object structure
   *  @return object
   **/

  parseAll (document, structure) {

    const parsed = {
      $projection : {}
    };

    for ( let field in document ) {

      if ( document[field] instanceof Promise ) {

      }

      else if ( typeof document[field] === 'function' ) {
        let $type;

        switch ( document[field] ) {
          case Number:
            $type = 1;
            break;
          case String: case Type.String :
            $type = 2;
            break;
          case Object: case Type.Object :
            $type = 3;
            break;
          case Array: case Type.Array :
            $type = 4;
            break;
          case mongodb.ObjectId: case Type.ObjectId :
            $type = 7;
            break;
          case Boolean: case Type.Boolean :
            $type = 8;
            break;
          case Date: case Type.Date :
            $type = 9;
            break;
        }

        parsed[field] = $type;
      }

      else if ( FindStatement.operators.indexOf(field) > -1 ) {
        switch ( field ) {
          case '$or'  :
          case '$and' :
          case '$nor' :
            if ( ! Array.isArray(document[field]) ) {
              throw new MungoError(
                `${field} is expecting an array`,
                { got : document[field] }
              );
            }
            parsed[field] = document[field].map(v => this.parseAll(v, structure));
            break;

          case '$sort' :
            parsed.$projection.sort = document.$sort;
            break;
        }
      }
      else {
        parsed[field] = this.parseField(field, document[field], structure[field], structure);
      }
    }

    return parsed;
  }

  /** Parse a field
   *
   *  @arg string fieldName
   *  @arg mixed fieldValue
   *  @arg Field fieldStructure
   *  @return mixed
   **/

  parseField (fieldName, fieldValue, fieldStructure, schema) {
    try {

      if ( /\./.test(fieldName) ) {
        fieldStructure = schema.flatten[fieldName];
      }

      if ( fieldValue && typeof fieldValue === 'object' ) {
        const key = Object.keys(fieldValue)[0],
          value = fieldValue[key];

        if ( FindStatement.operators.indexOf(key) > -1 ) {
          switch ( key ) {
            case '$lt'    :
            case '$gt'    :
            case '$gte'   :
            case '$lte'   :
            case '$size'  :
            case '$slice' :
              return { [key] : fieldStructure.type.convert(value) };

            case '$eq'    :
            case '$ne'    :
              return { [key] : fieldStructure.type.convert(value) };

            case '$in'    :
            case '$nin'   :
              return { [key] : value.map(v => fieldStructure.type.convert(v)) };

            case '$not'   :
            case '$elemMatch' :
              return { [key] : this.parseField(fieldName, value, fieldStructure) };

            case '$exists'  :
              return { [key] : Type.Boolean.convert(value) };

            case '$type'  :
            case '$where' :
            case '$bitsAllSet' :
            case '$bitsAnySet':
            case '$bitsAllClear':
            case '$bitsAnyClear':
              return { [key] : value };

            case '$mod'   :
              if ( ! Array.isArray(value) ) {
                throw new MungoError(
                  'FindStatement:$mod > value must be an Array',
                  { value }
                );
              }
              return { [key] : value.map(value => Type.Number.convert(value)) };

            case '$regex' :
              const parsed = { [key] : value };
              if ( '$options' in fieldValue ) {
                parsed.$options = fieldValue.$options;
              }
              return parsed;

            case '$text' :
              let search = {};

              if ( typeof value === 'string' ) {
                search.$search = value;
              }

              else if ( ! value || typeof value !== 'object' ) {
                throw new MungoError(
                  'FindStatement:$text > value must be either a string or an object',
                  { value }
                );
              }

              if ( typeof value === 'object' ) {
                search = value;
              }

              return { [key] : search };

            case '$geoWithin':
            case '$geoIntersects':
            case '$near':
            case '$nearSphere':

              if ( ! value || typeof value !== 'object' ) {
                throw new MungoError(
                  `FindStatement:${key} > value must be an object`,
                  { value }
                );
              }

              return { [key] : value };

            case '$all':

              if ( ! Array.isArray(value) ) {
                throw new MungoError(
                  `FindStatement:${key} > value must be an array`,
                  { value }
                );
              }

              return { [key] : fieldStructure.type.convert(value) };

            case '$comment':
            case '$meta':
              return { [key] : Type.String.convert(value) };
          }
        }
      }

      if ( ! fieldStructure || ! ( 'type' in fieldStructure ) ) {
        console.log('parse field error', { fieldName, fieldValue, fieldStructure, schema });
      }

      return fieldStructure.type.convert(fieldValue);
    }
    catch ( error ) {
      throw MungoFindStatementError.rethrow(error, 'Can not parse field of find statement', {fieldName, fieldValue, fieldStructure});
    }
  }

}

export default FindStatement;
