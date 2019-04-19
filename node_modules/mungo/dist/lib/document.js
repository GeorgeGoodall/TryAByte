'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _prettify = require('./prettify');

var _prettify2 = _interopRequireDefault(_prettify);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MungoDocumentError = function (_MungoError) {
  _inherits(MungoDocumentError, _MungoError);

  function MungoDocumentError() {
    _classCallCheck(this, MungoDocumentError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MungoDocumentError).apply(this, arguments));
  }

  return MungoDocumentError;
}(_error2.default);

var Document = function () {

  /** new Document
   *  @arg object document
   *  @arg function model
   **/

  function Document(document, model) {
    _classCallCheck(this, Document);

    if (!document || (typeof document === 'undefined' ? 'undefined' : _typeof(document)) !== 'object' || Array.isArray(document)) {
      throw new MungoDocumentError('new Document(document) > document must be an object', { document: document, modelName: model.name });
    }

    if (typeof model !== 'function') {
      throw new MungoDocumentError('new Document(model) > model must be a class', { document: document, model: model });
    }

    var parsed = this.parseAll(document, model.getSchema());

    for (var field in parsed) {
      this[field] = parsed[field];
    }
  }

  /** Parse an object of fields
   *
   *  @arg object document
   *  @arg object structure
   *  @return object
   **/

  _createClass(Document, [{
    key: 'parseAll',
    value: function parseAll(document, structure) {
      var parsed = {};

      for (var field in document) {
        if (field in structure) {
          parsed[field] = this.parseField(field, document[field], structure[field]);
        }
      }

      return parsed;
    }
  }, {
    key: 'parseField',
    value: function parseField(fieldName, fieldValue, fieldStructure) {
      if (!fieldStructure) {
        throw new MungoDocumentError('Could not parse field - missing structure', {
          fieldName: fieldName, fieldValue: fieldValue, fieldStructure: fieldStructure
        });
      }
      if (!fieldStructure.type) {
        throw new MungoDocumentError('Could not parse field - missing type', {
          fieldName: fieldName, fieldValue: fieldValue, fieldStructure: fieldStructure
        });
      }
      return fieldStructure.type.convert(fieldValue);
    }
  }]);

  return Document;
}();

exports.default = Document;