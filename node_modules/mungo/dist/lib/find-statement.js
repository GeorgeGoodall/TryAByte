'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _prettify = require('./prettify');

var _prettify2 = _interopRequireDefault(_prettify);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MungoFindStatementError = function (_MungoError) {
  _inherits(MungoFindStatementError, _MungoError);

  function MungoFindStatementError() {
    _classCallCheck(this, MungoFindStatementError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MungoFindStatementError).apply(this, arguments));
  }

  return MungoFindStatementError;
}(_error2.default);

var FindStatement = function () {

  /** new FindStatement
   *  @arg object document
   *  @arg function model
   **/

  function FindStatement(document, model) {
    _classCallCheck(this, FindStatement);

    if (document.constructor !== Object) {
      throw new _error2.default('new FindStatement(document) > document must be an object', { document: document, model: model });
    }

    if (typeof model !== 'function') {
      throw new _error2.default('new FindStatement(model) > model must be a class', { document: document, model: model });
    }

    var parsed = this.parseAll(document, model.getSchema());

    for (var field in parsed) {
      if (typeof parsed[field] !== 'undefined') {
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

  _createClass(FindStatement, [{
    key: 'parseAll',
    value: function parseAll(document, structure) {
      var _this2 = this;

      var parsed = {
        $projection: {}
      };

      for (var field in document) {

        if (document[field] instanceof Promise) {} else if (typeof document[field] === 'function') {
          var $type = undefined;

          switch (document[field]) {
            case Number:
              $type = 1;
              break;
            case String:case _type2.default.String:
              $type = 2;
              break;
            case Object:case _type2.default.Object:
              $type = 3;
              break;
            case Array:case _type2.default.Array:
              $type = 4;
              break;
            case _mongodb2.default.ObjectId:case _type2.default.ObjectId:
              $type = 7;
              break;
            case Boolean:case _type2.default.Boolean:
              $type = 8;
              break;
            case Date:case _type2.default.Date:
              $type = 9;
              break;
          }

          parsed[field] = $type;
        } else if (FindStatement.operators.indexOf(field) > -1) {
          switch (field) {
            case '$or':
            case '$and':
            case '$nor':
              if (!Array.isArray(document[field])) {
                throw new _error2.default(field + ' is expecting an array', { got: document[field] });
              }
              parsed[field] = document[field].map(function (v) {
                return _this2.parseAll(v, structure);
              });
              break;

            case '$sort':
              parsed.$projection.sort = document.$sort;
              break;
          }
        } else {
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

  }, {
    key: 'parseField',
    value: function parseField(fieldName, fieldValue, fieldStructure, schema) {
      try {

        if (/\./.test(fieldName)) {
          fieldStructure = schema.flatten[fieldName];
        }

        if (fieldValue && (typeof fieldValue === 'undefined' ? 'undefined' : _typeof(fieldValue)) === 'object') {
          var key = Object.keys(fieldValue)[0],
              value = fieldValue[key];

          if (FindStatement.operators.indexOf(key) > -1) {
            switch (key) {
              case '$lt':
              case '$gt':
              case '$gte':
              case '$lte':
              case '$size':
              case '$slice':
                return _defineProperty({}, key, fieldStructure.type.convert(value));

              case '$eq':
              case '$ne':
                return _defineProperty({}, key, fieldStructure.type.convert(value));

              case '$in':
              case '$nin':
                return _defineProperty({}, key, value.map(function (v) {
                  return fieldStructure.type.convert(v);
                }));

              case '$not':
              case '$elemMatch':
                return _defineProperty({}, key, this.parseField(fieldName, value, fieldStructure));

              case '$exists':
                return _defineProperty({}, key, _type2.default.Boolean.convert(value));

              case '$type':
              case '$where':
              case '$bitsAllSet':
              case '$bitsAnySet':
              case '$bitsAllClear':
              case '$bitsAnyClear':
                return _defineProperty({}, key, value);

              case '$mod':
                if (!Array.isArray(value)) {
                  throw new _error2.default('FindStatement:$mod > value must be an Array', { value: value });
                }
                return _defineProperty({}, key, value.map(function (value) {
                  return _type2.default.Number.convert(value);
                }));

              case '$regex':
                var parsed = _defineProperty({}, key, value);
                if ('$options' in fieldValue) {
                  parsed.$options = fieldValue.$options;
                }
                return parsed;

              case '$text':
                var search = {};

                if (typeof value === 'string') {
                  search.$search = value;
                } else if (!value || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
                  throw new _error2.default('FindStatement:$text > value must be either a string or an object', { value: value });
                }

                if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                  search = value;
                }

                return _defineProperty({}, key, search);

              case '$geoWithin':
              case '$geoIntersects':
              case '$near':
              case '$nearSphere':

                if (!value || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
                  throw new _error2.default('FindStatement:' + key + ' > value must be an object', { value: value });
                }

                return _defineProperty({}, key, value);

              case '$all':

                if (!Array.isArray(value)) {
                  throw new _error2.default('FindStatement:' + key + ' > value must be an array', { value: value });
                }

                return _defineProperty({}, key, fieldStructure.type.convert(value));

              case '$comment':
              case '$meta':
                return _defineProperty({}, key, _type2.default.String.convert(value));
            }
          }
        }

        if (!fieldStructure || !('type' in fieldStructure)) {
          console.log('parse field error', { fieldName: fieldName, fieldValue: fieldValue, fieldStructure: fieldStructure, schema: schema });
        }

        return fieldStructure.type.convert(fieldValue);
      } catch (error) {
        throw MungoFindStatementError.rethrow(error, 'Can not parse field of find statement', { fieldName: fieldName, fieldValue: fieldValue, fieldStructure: fieldStructure });
      }
    }
  }]);

  return FindStatement;
}();

FindStatement.operators = ['$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin', '$or', '$and', '$not', '$nor', '$exists', '$type', '$mod', '$regex', '$options', '$text', '$where', '$geoWithin', '$geoIntersects', '$near', '$nearSphere', '$all', '$elemMatch', '$size', '$bitsAllSet', '$bitsAnySet', '$bitsAllClear', '$bitsAnyClear', '$comment', '$meta', '$slice', '$sort'];
exports.default = FindStatement;