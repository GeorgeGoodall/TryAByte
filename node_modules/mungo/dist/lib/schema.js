'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function testRegex(regex, value) {
  return regex.test(value);
}

var Schema = function () {
  _createClass(Schema, [{
    key: 'indexes',


    //----------------------------------------------------------------------------

    get: function get() {
      var _this = this;

      return Object.keys(this.flatten).map(function (field) {
        return Object.assign(_this.flatten[field], { field: field });
      }).filter(function (field) {
        return field.index;
      }).map(function (field) {
        return field.index;
      });
    }
  }, {
    key: 'flatten',
    get: function get() {
      return this.makeFlatten(this);
    }

    //----------------------------------------------------------------------------

  }], [{
    key: 'find',


    //----------------------------------------------------------------------------

    value: function find(flattenName, schema) {

      // console.log('FIND', flattenName, schema);

      var bits = flattenName.split(/\./);

      while (bits.length) {
        if (!schema) {
          return undefined;
        }

        if (bits[0] in schema) {
          schema = schema[bits.shift()];
        } else if (Array.isArray(schema)) {
          schema = schema[0];
        } else {
          return undefined;
        }
      }

      return schema;
    }

    //----------------------------------------------------------------------------

  }]);

  function Schema() {
    var original = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var version = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var ns = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    _classCallCheck(this, Schema);

    var normalized = {};

    if (options.defaultFields !== false) {
      Object.assign(normalized, Schema.defaultFields);
      normalized.__V.default = version;
    }

    Object.assign(normalized, original);

    // const structure = this.makeStructure(normalized);

    var structure = {};

    var setTypes = this.setTypes(normalized, ns);
    var setNames = this.setNames(setTypes);
    var setIndexes = this.setIndexes(setTypes, normalized, ns);
    var setDefaults = this.setDefaults(setTypes, normalized, ns);
    var setValidates = this.setValidates(setTypes, normalized, ns);
    var setRequired = this.setRequired(setTypes, normalized, ns);
    var setPrivates = this.setPrivates(setTypes, normalized, ns);

    for (var field in setTypes) {
      structure[field] = Object.assign({}, setTypes[field], setNames[field], setIndexes[field], setDefaults[field], setValidates[field], setRequired[field], setPrivates[field]);
    }

    if (ns) {
      ns += '.';
    }

    for (var field in structure) {
      this['' + field] = structure[field];
    }
  }

  //----------------------------------------------------------------------------

  _createClass(Schema, [{
    key: 'setNames',
    value: function setNames(structure) {
      var parsed = {};

      for (var field in structure) {
        parsed[field] = { field: field };
      }

      return parsed;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'makeFlatten',
    value: function makeFlatten(structure) {
      var ns = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      var flatten = {};

      for (var field in structure) {
        var name = (ns + '.' + field).replace(/^\./, '');

        structure[field].flatten = name;

        var type = structure[field].type;


        if (type.isArray()) {
          flatten[name] = structure[field];

          if (type.getArray().isSubdocument()) {
            Object.assign(flatten, this.makeFlatten(type.getArray().getSubdocument(), name));
          }
        } else if (type.isSubdocument()) {
          flatten[name] = structure[field];

          Object.assign(flatten, this.makeFlatten(type.getSubdocument(), name));
        } else {
          flatten[name] = structure[field];
        }
      }

      return flatten;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'setTypes',
    value: function setTypes(structure, ns) {
      var normalized = {};

      for (var field in structure) {
        var name = (ns + '.' + field).replace(/^\./, '');

        normalized[field] = {
          type: this.setType(structure[field], name)
        };
      }

      return normalized;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'setType',
    value: function setType(structure, ns) {

      var type = undefined;

      // no field

      if (!structure) {
        return new _type2.default(_type2.default.Mixed);
      }

      // { field : new Type() }

      if (structure instanceof _type2.default) {
        return structure;
      }

      // { field : Function }

      if (typeof structure === 'function') {
        return new _type2.default(structure);
      }

      // { field : [Function] }

      if (Array.isArray(structure)) {
        return new _type2.default(Array, this.setType(structure[0], ns));
      }

      // { field : Schema }

      if (structure instanceof this.constructor) {
        return new _type2.default(_type2.default.Subdocument, structure);
      }

      // { field : {} }

      if ('type' in structure) {

        if (Array.isArray(structure.type)) {
          var parsed = this.setType(structure.type[0], ns);
          return new _type2.default(Array, parsed);
        }

        return new _type2.default(structure.type);
      }

      if (structure && (typeof structure === 'undefined' ? 'undefined' : _typeof(structure)) === 'object') {
        return new _type2.default(_type2.default.Subdocument, new Schema(structure, 0, ns, {
          defaultFields: false
        }));
      }

      return new _type2.default(_type2.default.Mixed);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'setIndexes',
    value: function setIndexes(structure, normalized, ns) {
      var parsed = {};

      for (var field in structure) {

        var name = (ns + '.' + field).replace(/^\./, '');

        if (structure[field].type.isArray()) {} else if (structure[field].type.isSubdocument()) {} else {
          if ('index' in normalized[field]) {
            if (normalized[field].index === true) {
              parsed[field] = { index: new _index2.default(true, name) };
            } else if (_typeof(normalized[field].index) === 'object') {
              parsed[field] = { index: new _index2.default(true, name, normalized[field].index) };
            }
          } else if ('unique' in normalized[field]) {
            if (normalized[field].unique === true) {
              parsed[field] = { index: new _index2.default(true, name, { unique: true }) };
            } else if (_typeof(normalized[field].unique) === 'object') {
              parsed[field] = { index: new _index2.default(true, name, Object.assign({ unique: true }, normalized[field].unique)) };
            }
          } else if ('indexWith' in normalized[field]) {
            parsed[field] = { index: new _index2.default(true, name, { coumpound: normalized[field].indexWith }) };
          } else if ('uniqueWith' in normalized[field]) {
            parsed[field] = { index: new _index2.default(true, name, { coumpound: normalized[field].uniqueWith }) };
          }
        }
      }

      return parsed;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'setDefaults',
    value: function setDefaults(structure, normalized, ns) {

      var parsed = {};

      for (var field in structure) {

        var name = (ns + '.' + field).replace(/^\./, '');

        if ('default' in normalized[field]) {
          parsed[field] = { default: normalized[field].default };
        }
      }

      return parsed;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'setRequired',
    value: function setRequired(structure, normalized, ns) {

      var parsed = {};

      for (var field in structure) {

        var name = (ns + '.' + field).replace(/^\./, '');

        if (structure[field].type.isArray()) {} else if (structure[field].type.isSubdocument()) {} else {
          if ('required' in normalized[field]) {
            parsed[field] = { required: normalized[field].required };
          }
        }
      }

      return parsed;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'setValidates',
    value: function setValidates(structure, normalized, ns) {

      var parsed = {};

      var _loop = function _loop(field) {

        var name = (ns + '.' + field).replace(/^\./, '');

        if (structure[field].type.isArray()) {} else if (structure[field].type.isSubdocument()) {} else {
          if ('validate' in normalized[field]) {
            if (normalized[field].validate instanceof RegExp) {
              parsed[field] = {
                validate: function validate(value) {
                  return normalized[field].validate.test(value);
                }
              };
            } else if (typeof normalized[field].validate === 'function') {
              parsed[field] = { validate: normalized[field].validate };
            }
          }
        }
      };

      for (var field in structure) {
        _loop(field);
      }

      return parsed;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'setPrivates',
    value: function setPrivates(structure, normalized, ns) {

      var parsed = {};

      for (var field in structure) {

        var name = (ns + '.' + field).replace(/^\./, '');

        if (structure[field].type.isArray()) {} else if (structure[field].type.isSubdocument()) {} else {
          if ('private' in normalized[field]) {
            parsed[field] = { private: normalized[field].private };
          }
        }
      }

      return parsed;
    }

    //----------------------------------------------------------------------------

  }]);

  return Schema;
}();

Schema.defaultFields = {
  _id: _type2.default.ObjectID,

  __v: {
    type: Number,
    default: 0
  },

  __V: {
    type: Number,
    default: 0
  }
};
exports.default = Schema;