'use strict';

import Type from './type';
import MungoError from './error';

class MungoUpdateStatementError extends MungoError {}

class UpdateStatement {

  static operators = [
    '$unset',
    '$push',
    '$inc',
    '$incr',
    '$increment',
    '$mul',
    '$rename'
  ];

  /** new UpdateStatement
   *  @arg object document
   *  @arg function model
   **/

  constructor (document, model) {
    try {
      if ( document.constructor !== Object ) {
        throw new (Mungo.Error)(
          'new UpdateStatement(document) > document must be an object',
          { document, model : model.name }
        );
      }

      if ( typeof model !== 'function' ) {
        throw new (Mungo.Error)(
          'new UpdateStatement(model) > model must be a class',
          { document, model }
        );
      }

      const parsed = this.parseAll(document, model.getSchema());

      for ( let field in parsed ) {
        this[field] = parsed[field];
      }
    }
    catch ( error ) {
      throw MungoUpdateStatementError.rethrow(error, 'Could not parse document', { document, modelName : model.name });
    }
  }

  parseAll (document, structure) {
    const parsed = {};


    for ( let field in document ) {

      if ( UpdateStatement.operators.indexOf(field) > -1 ) {

        // Aliases

        let operator = field;

        if ( field === '$incr' || field === '$increment' ) {
          operator = '$inc';
        }

        switch ( operator ) {
          case '$inc'  :
          case '$mul' :
            parsed[operator] =  document[field];
            for ( let f in parsed[field] ) {
              parsed[operator][f] = this.parseField(f, parsed[operator][f], structure[f]);
            }
            break;

          case '$rename' :
            parsed[operator] =  document[field];
            break;

          case '$push' :
            parsed[operator] = {};
            for ( let i in document[field] ) {
              parsed[operator][i] = this.parseField(i, [document[field][i]], structure[i])[0];
            }
            break;

          case '$unset' :

            if ( Array.isArray(document[field]) ) {
              parsed.$unset = document[field].reduce(
                (unset, field) => {
                  unset[field] = '';
                  return unset;
                },
                {}
              );
            }

            else if ( typeof document[field] === 'string' ) {
              parsed.$unset = { [document[field]] : '' };
            }

            else {
              parset.$unset = document[field];
            }

            break;
        }
      }
      else {
        if ( ! ( '$set' in parsed ) ) {
          parsed.$set = {};
        }
        let parsedField;

        try {
          parsedField = this.parseField(field, document[field], structure[field]);

          Object.assign(parsed.$set, { [field] : parsedField });
        }
        catch ( error ) {
          console.log(' mungodb . new UpdateStatement > warning > Could not parse field', { field, doc : document[field], structure : structure[field] })
        }
      }
    }

    return parsed;
  }

  parseField (fieldName, fieldValue, fieldStructure) {
    try {
      return fieldStructure.type.convert(fieldValue);
    }
    catch ( error ) {
      throw MungoUpdateStatementError.rethrow(error, 'Could not parse field', { name : fieldName, value : fieldValue, field : fieldStructure });
    }
  }

}

export default UpdateStatement;
