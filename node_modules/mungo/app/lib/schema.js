'use strict';

import Index                      from './index';
import Type                       from './type';

function testRegex (regex, value) {
  return regex.test(value);
}

class Schema {

  //----------------------------------------------------------------------------

  static defaultFields = {
    _id : Type.ObjectID,

    __v : {
      type : Number,
      default : 0
    },

    __V : {
      type : Number,
      default : 0
    }
  };

  //----------------------------------------------------------------------------

  static find (flattenName, schema) {

    // console.log('FIND', flattenName, schema);

    const bits = flattenName.split(/\./);

    while ( bits.length ) {
      if ( ! schema ) {
        return undefined;
      }

      if ( ( bits[0] in schema ) ) {
        schema = schema[bits.shift()];
      }
      else if ( Array.isArray(schema) ) {
        schema = schema[0];
      }
      else {
        return undefined;
      }
    }

    return schema;
  }

  //----------------------------------------------------------------------------

  get indexes () {
    return Object.keys(this.flatten)
      .map(field => Object.assign(this.flatten[field], { field }))
      .filter(field => field.index)
      .map(field => field.index);
  }

  get flatten () {
    return this.makeFlatten(this);
  }

  //----------------------------------------------------------------------------

  constructor (original = {}, version = 0, ns = '', options = {}) {

    const normalized = {};

    if ( options.defaultFields !== false ) {
      Object.assign(normalized, Schema.defaultFields);
      normalized.__V.default = version;
    }

    Object.assign(normalized, original);

    // const structure = this.makeStructure(normalized);

    const structure = {};

    const setTypes      =   this.setTypes(normalized, ns);
    const setNames      =   this.setNames(setTypes);
    const setIndexes    =   this.setIndexes(setTypes, normalized, ns);
    const setDefaults   =   this.setDefaults(setTypes, normalized, ns);
    const setValidates  =   this.setValidates(setTypes, normalized, ns);
    const setRequired   =   this.setRequired(setTypes, normalized, ns);
    const setPrivates   =   this.setPrivates(setTypes, normalized, ns);

    for ( let field in setTypes ) {
      structure[field] = Object.assign(
        {},
        setTypes[field],
        setNames[field],
        setIndexes[field],
        setDefaults[field],
        setValidates[field],
        setRequired[field],
        setPrivates[field]
      );
    }

    if ( ns ) {
      ns += '.';
    }

    for ( let field in structure ) {
      this[`${field}`] = structure[field];
    }

  }

  //----------------------------------------------------------------------------

  setNames (structure) {
    const parsed = {};

    for ( const field in structure ) {
      parsed[field] = { field };
    }

    return parsed;
  }

  //----------------------------------------------------------------------------

  makeFlatten (structure, ns = '') {
    const flatten = {};

    for ( let field in structure ) {
      const name = `${ns}.${field}`.replace(/^\./, '');

      structure[field].flatten = name;

      const { type } = structure[field];

      if ( type.isArray() ) {
        flatten[name] = structure[field];

        if ( type.getArray().isSubdocument() ) {
          Object.assign(
            flatten,
            this.makeFlatten(type.getArray().getSubdocument(), name)
          );
        }
      }

      else if ( type.isSubdocument() ) {
        flatten[name] = structure[field];

        Object.assign(flatten, this.makeFlatten(type.getSubdocument(), name));
      }

      else {
        flatten[name] = structure[field];
      }
    }

    return flatten;
  }

  //----------------------------------------------------------------------------

  setTypes (structure, ns) {
    const normalized = {};

    for ( let field in structure ) {
      const name = `${ns}.${field}`.replace(/^\./, '');

      normalized[field]  =   {
        type        :   this.setType(structure[field], name)
      };
    }

    return normalized;
  }

  //----------------------------------------------------------------------------

  setType (structure, ns) {

    let type;

    // no field

    if ( ! structure ) {
      return new Type(Type.Mixed);
    }

    // { field : new Type() }

    if ( structure instanceof Type ) {
      return structure;
    }

    // { field : Function }

    if ( typeof structure === 'function' ) {
      return new Type(structure);
    }

    // { field : [Function] }

    if ( Array.isArray(structure) ) {
      return new Type(Array, this.setType(structure[0], ns));
    }

    // { field : Schema }

    if ( structure instanceof this.constructor ) {
      return new Type(Type.Subdocument, structure);
    }

    // { field : {} }

    if ( 'type' in structure ) {

      if ( Array.isArray(structure.type) ) {
        const parsed = this.setType(structure.type[0], ns);
        return new Type(Array, parsed);
      }

      return new Type(structure.type);
    }

    if ( structure && typeof structure === 'object' ) {
      return new Type(Type.Subdocument, new Schema(structure, 0, ns, {
        defaultFields : false
      }));
    }

    return new Type(Type.Mixed);
  }

  //----------------------------------------------------------------------------

  setIndexes (structure, normalized, ns) {
    const parsed = {};

    for ( let field in structure ) {

      const name = `${ns}.${field}`.replace(/^\./, '');

      if( structure[field].type.isArray() ) {

      }

      else if( structure[field].type.isSubdocument() ) {

      }

      else {
        if( 'index' in normalized[field] ) {
          if ( normalized[field].index === true ) {
            parsed[field] = { index : new Index(true, name) };
          }
          else if ( typeof normalized[field].index === 'object' ) {
            parsed[field] = { index : new Index(true, name, normalized[field].index) };
          }
        }

        else if( 'unique' in normalized[field] ) {
          if ( normalized[field].unique === true ) {
            parsed[field] = { index : new Index(true, name, { unique : true }) };
          }
          else if ( typeof normalized[field].unique === 'object' ) {
            parsed[field] = { index : new Index(true, name, Object.assign({ unique : true }, normalized[field].unique)) };
          }
        }

        else if( 'indexWith' in normalized[field] ) {
          parsed[field] = { index : new Index(true, name, { coumpound : normalized[field].indexWith }) };
        }

        else if( 'uniqueWith' in normalized[field] ) {
          parsed[field] = { index : new Index(true, name, { coumpound : normalized[field].uniqueWith }) };
        }
      }
    }

    return parsed;
  }

  //----------------------------------------------------------------------------

  setDefaults (structure, normalized, ns) {

    const parsed = {};

    for ( let field in structure ) {

      const name = `${ns}.${field}`.replace(/^\./, '');

      if( 'default' in normalized[field] ) {
        parsed[field] = { default : normalized[field].default };
      }
    }

    return parsed;

  }

  //----------------------------------------------------------------------------

  setRequired (structure, normalized, ns) {

    const parsed = {};

    for ( let field in structure ) {

      const name = `${ns}.${field}`.replace(/^\./, '');

      if( structure[field].type.isArray() ) {

      }

      else if( structure[field].type.isSubdocument() ) {

      }

      else {
        if( 'required' in normalized[field] ) {
          parsed[field] = { required : normalized[field].required };
        }
      }
    }

    return parsed;

  }

  //----------------------------------------------------------------------------

  setValidates (structure, normalized, ns) {

    const parsed = {};

    for ( let field in structure ) {

      const name = `${ns}.${field}`.replace(/^\./, '');

      if( structure[field].type.isArray() ) {

      }

      else if( structure[field].type.isSubdocument() ) {

      }

      else {
        if( 'validate' in normalized[field] ) {
          if ( normalized[field].validate instanceof RegExp ) {
            parsed[field] = {
              validate : value => normalized[field].validate.test(value)
            };
          }
          else if ( typeof normalized[field].validate === 'function' ) {
            parsed[field] = { validate : normalized[field].validate };
          }
        }
      }
    }

    return parsed;

  }

  //----------------------------------------------------------------------------

  setPrivates (structure, normalized, ns) {

    const parsed = {};

    for ( let field in structure ) {

      const name = `${ns}.${field}`.replace(/^\./, '');

      if( structure[field].type.isArray() ) {

      }

      else if( structure[field].type.isSubdocument() ) {

      }

      else {
        if( 'private' in normalized[field] ) {
          parsed[field] = { private : normalized[field].private };
        }
      }
    }

    return parsed;

  }

  //----------------------------------------------------------------------------

}

export default Schema;
