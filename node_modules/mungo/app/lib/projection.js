'use strict';

class Projection {

  constructor (projection = {}) {
    this.setLimit(projection.limit);
    this.setSkip(projection.skip);
    this.setSorter(projection.sort, projection.reverse);
  }

  get default () {
    return {
      limit : 100,
      skip : 0,
      sort : { _id : 1 }
    };
  }

  setLimit (value) {
    if ( value === false ) {
      this.limit = 0;
    }
    else if ( typeof value === 'number' ) {
      this.limit = value;
    }
    else {
      this.limit = this.default.limit;
    }
    return this;
  }

  setSkip (value) {
    if ( typeof value === 'number' ) {
      this.skip = value;
    }
    else {
      this.skip = this.default.skip;
    }
  }

  setSorter (sorter, reverse = false) {
    if ( typeof sorter === 'string' ) {
      this.sort = { [sorter] : 1 };
    }
    else if ( sorter && typeof sorter === 'object' ) {
      this.sort = sorter;
    }
    else  {
      this.sort = this.default.sort;
    }

    if ( reverse ) {
      for ( let field in this.sort ) {
        this.sort[field] = -1;
      }
    }
  }

}

export default Projection;
