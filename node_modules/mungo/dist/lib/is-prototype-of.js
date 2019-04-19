'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
require('babel-polyfill');

function isPrototypeOf(child, parent) {
  var prototypeOf = Reflect.getPrototypeOf(child);

  if (prototypeOf === parent) {
    return true;
  }

  if (prototypeOf.name) {
    return isPrototypeOf(prototypeOf, parent);
  }

  return false;
}

exports.default = isPrototypeOf;