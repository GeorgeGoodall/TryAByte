'use strict';

import Type from './type';
import prettify from './prettify';
import MungoError from './error';

class MungoDocumentError extends MungoError {}

class Document {

  /** new Document
   *  @arg object document
   *  @arg function model
   **/

  constructor (document, model) {
    if ( ! document || typeof document !== 'object' || Array.isArray(document) ) {
      throw new MungoDocumentError(
        'new Document(document) > document must be an object',
        { document, modelName : model.name }
      );
    }

    if ( typeof model !== 'function' ) {
      throw new MungoDocumentError(
        'new Document(model) > model must be a class',
        { document, model }
      );
    }

    const parsed = this.parseAll(document, model.getSchema());

    for ( let field in parsed ) {
      this[field] = parsed[field];
    }
  }

  /** Parse an object of fields
   *
   *  @arg object document
   *  @arg object structure
   *  @return object
   **/

  parseAll (document, structure) {
    const parsed = {};

    for ( let field in document ) {
      if ( field in structure ) {
        parsed[field] = this.parseField(field, document[field], structure[field]);
      }
    }

    return parsed;
  }

  parseField (fieldName, fieldValue, fieldStructure) {
    if ( ! fieldStructure ) {
      throw new MungoDocumentError('Could not parse field - missing structure', {
        fieldName, fieldValue, fieldStructure
      });
    }
    if ( ! fieldStructure.type ) {
      throw new MungoDocumentError('Could not parse field - missing type', {
        fieldName, fieldValue, fieldStructure
      });
    }
    return fieldStructure.type.convert(fieldValue);
  }

}

export default Document;
