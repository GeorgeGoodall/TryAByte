'use strict';

require('babel-polyfill');

function isPrototypeOf (child, parent) {
  const prototypeOf = Reflect.getPrototypeOf(child);

  if ( prototypeOf === parent ) {
    return true;
  }

  if ( prototypeOf.name ) {
    return isPrototypeOf(prototypeOf, parent);
  }

  return false;
}

export default isPrototypeOf;
