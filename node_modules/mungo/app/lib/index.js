'use strict';

class Index {

  v = 1;

  fields = {};

  options = {};

  get name () {
    const names = [];

    for ( let field in this.fields ) {
      names.push(`${field}_${this.fields[field]}`);
    }

    return names.join('_');
  }

  constructor (index, field, options = {}) {
    options.v = this.v;

    if ( index === true ) {
      this.fields = { [field] : 1 };
    }

    if ( typeof index ===  'object' ) {
      this.fields = { [field] : 1 };

      Object.assign(this.options, index);
    }

    if ( typeof index ===  'string' ) {
      this.fields = { [field] : index };
    }

    if ( options.unique ) {
      this.options.unique = true;
    }

    if ( options.coumpound ) {
      if ( typeof options.coumpound === 'string' ) {
        this.fields[options.coumpound] = 1;
      }
    }
  }
}

export default Index;
