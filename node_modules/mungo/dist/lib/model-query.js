'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _findStatement = require('./find-statement');

var _findStatement2 = _interopRequireDefault(_findStatement);

var _updateStatement = require('./update-statement');

var _updateStatement2 = _interopRequireDefault(_updateStatement);

var _modelMigrate = require('./model-migrate');

var _modelMigrate2 = _interopRequireDefault(_modelMigrate);

var _promiseSequencer = require('promise-sequencer');

var _promiseSequencer2 = _interopRequireDefault(_promiseSequencer);

var _prettify = require('./prettify');

var _prettify2 = _interopRequireDefault(_prettify);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MungoModelQueryError = function (_MungoError) {
  _inherits(MungoModelQueryError, _MungoError);

  function MungoModelQueryError() {
    _classCallCheck(this, MungoModelQueryError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MungoModelQueryError).apply(this, arguments));
  }

  return MungoModelQueryError;
}(_error2.default);

function normalizeModifier(modifier, model) {
  if (!('$inc' in modifier)) {
    modifier.$inc = {};
  }

  modifier.$inc.__v = 1;

  if (!('$set' in modifier)) {
    modifier.$set = {};
  }

  if (!('__V' in modifier.$set) && !(modifier.$unset && '__V' in modifier.$unset)) {
    modifier.$set.__V = model.version;
  }

  if (!Object.keys(modifier.$set).length) {
    delete modifier.$set;
  }
}

var ModelQuery = function (_ModelMigrate) {
  _inherits(ModelQuery, _ModelMigrate);

  function ModelQuery() {
    _classCallCheck(this, ModelQuery);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ModelQuery).apply(this, arguments));
  }

  _createClass(ModelQuery, null, [{
    key: 'exec',


    //----------------------------------------------------------------------------

    /** Execute a new Query with this as model
     *
     *  @arg        string      cmd
     *  @arg        [mixed]     args
     *  @return     {Promise}
     */

    //----------------------------------------------------------------------------

    value: function exec(cmd) {
      var q = new _query2.default(this);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return q[cmd].apply(q, args);
    }

    //----------------------------------------------------------------------------

    /** Count documents in collection
     *
     *  @arg        {Object}      filter={}       - Get filter
     *  @arg        {Object}      options={}
     *  @return     {Promise}
     */

    //----------------------------------------------------------------------------

  }, {
    key: 'count',
    value: function count() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (!(filter instanceof _findStatement2.default)) {
        filter = new _findStatement2.default(filter, this);
      }

      delete filter.$projection;

      return this.exec('count', filter, options);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'create',
    value: function create() {
      if (Array.isArray(arguments.length <= 0 ? undefined : arguments[0])) {
        return this.insertMany.apply(this, _toConsumableArray(arguments.length <= 0 ? undefined : arguments[0]));
      }

      if (!arguments.length) {
        return this.insertOne({});
      }

      if (arguments.length === 1) {
        return this.insertOne(arguments.length <= 0 ? undefined : arguments[0]);
      }

      return this.insertMany.apply(this, arguments);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'delete',
    value: function _delete() {
      return this.deleteMany.apply(this, arguments);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'deleteById',
    value: function deleteById(_id) {
      return this.deleteOne({ _id: _id });
    }

    //----------------------------------------------------------------------------

    /** Delete many
     *
     *  @arg        object      filter
     *  @arg        object      projection
     *  @arg        object      options
     *  @return     {Promise}
     */

    //----------------------------------------------------------------------------

  }, {
    key: 'deleteMany',
    value: function deleteMany() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _this3 = this;

      var projection = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return new Promise(function (ok, ko) {
        if (!(filter instanceof _findStatement2.default)) {
          filter = new _findStatement2.default(filter, _this3);
        }

        Object.assign(projection, filter.$projection);

        delete filter.$projection;

        var delProjection = function delProjection(query) {
          delete query.$projection;
          return query;
        };

        _promiseSequencer2.default.pipe(function () {
          return _this3.find(filter, projection, options);
        }, function (docs) {
          return _promiseSequencer2.default.pipe(function () {
            return Promise.all(docs.map(function (doc) {
              return (0, _promiseSequencer2.default)((_this3.removing() || []).map(function (fn) {
                return function () {
                  return fn(doc);
                };
              }));
            }));
          }, function () {
            return _this3.exec('deleteMany', delProjection(new _findStatement2.default({ _id: { $in: docs } }, _this3)));
          }, function () {
            return new Promise(function (ok) {
              return ok(docs);
            });
          });
        }).then(function (docs) {
          ok(docs);

          Promise.all(docs.map(function (doc) {
            return (0, _promiseSequencer2.default)((_this3.removed() || []).map(function (fn) {
              return function () {
                return fn(doc);
              };
            }));
          }));
        }).catch(ko);
      });
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'deleteOne',
    value: function deleteOne() {
      var _this4 = this;

      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Promise(function (ok, ko) {
        if (!(filter instanceof _findStatement2.default)) {
          filter = new _findStatement2.default(filter, _this4);
        }

        delete filter.$projection;

        var delProjection = function delProjection(query) {
          delete query.$projection;
          return query;
        };

        _promiseSequencer2.default.pipe(function () {
          return _this4.findOne(filter);
        }, function (doc) {
          return _promiseSequencer2.default.pipe(function () {
            return (0, _promiseSequencer2.default)((_this4.removing() || []).map(function (fn) {
              return function () {
                return fn(doc);
              };
            }));
          }, function () {
            return _this4.exec('deleteOne', delProjection(new _findStatement2.default({ _id: doc }, _this4)));
          }, function () {
            return new Promise(function (ok) {
              return ok(doc);
            });
          });
        }).then(function (doc) {
          ok(doc);

          (0, _promiseSequencer2.default)((_this4.removed() || []).map(function (fn) {
            return function () {
              return fn(doc);
            };
          }));
        }).catch(ko);
      });
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'find',
    value: function find() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _this5 = this;

      var projection = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var promise = new Promise(function (ok, ko) {
        if (!(filter instanceof _findStatement2.default)) {
          filter = new _findStatement2.default(filter, _this5);
        }

        Object.assign(projection, filter.$projection);

        delete filter.$projection;

        process.nextTick(function () {
          _this5.exec('find', filter, projection, options).then(function (documents) {
            documents = documents.map(function (doc) {
              return new _this5(doc, true);
            });
            ok(documents);
          }).catch(ko);
        });
      });

      promise.limit = function (limit) {
        projection.limit = limit;
        return promise;
      };

      promise.skip = function (skip) {
        projection.skip = skip;
        return promise;
      };

      promise.sort = function (sort) {
        projection.sort = sort;
        return promise;
      };

      return promise;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'findById',
    value: function findById(id) {
      return this.findOne({ _id: id });
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'findByIds',
    value: function findByIds() {
      for (var _len2 = arguments.length, _ids = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        _ids[_key2] = arguments[_key2];
      }

      if (_ids.length === 1 && Array.isArray(_ids[0])) {
        _ids = _ids[0];
      }
      return this.find({ _id: { $in: _ids } });
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'findOne',
    value: function findOne() {
      var _this6 = this;

      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var projection = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (!(filter instanceof _findStatement2.default)) {
        filter = new _findStatement2.default(filter, this);
      }

      Object.assign(projection, filter.$projection);

      delete filter.$projection;

      var promise = new Promise(function (ok, ko) {
        process.nextTick(function () {
          _this6.exec('findOne', filter, projection).then(function (document) {
            if (!document) {
              return ok();
            }
            ok(new _this6(document, _this6.isFromDB));
          }).catch(ko);
        });
      });

      promise.limit = function (limit) {
        projection.limit = limit;
        return promise;
      };

      promise.skip = function (skip) {
        projection.skip = skip;
        return promise;
      };

      promise.sort = function (sort) {
        projection.sort = sort;
        return promise;
      };

      return promise;
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'findOneRandom',
    value: function findOneRandom() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _this7 = this;

      var projection = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      if (!(filter instanceof _findStatement2.default)) {
        filter = new _findStatement2.default(filter, this);
      }

      Object.assign(projection, filter.$projection);

      delete filter.$projection;

      return _promiseSequencer2.default.pipe(function () {
        return _this7.exec('count', filter);
      }, function (count) {
        return new Promise(function (ok, ko) {
          options.skip = Math.ceil(Math.max(0, Math.floor(count) * Math.random()));
          ok();
        });
      }, function () {
        return _this7.findOne(filter, projection, options);
      });
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'findRandomOne',
    value: function findRandomOne() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var projection = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return this.findOneRandom(filter, projection, options);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'insert',
    value: function insert() {
      return this.create.apply(this, arguments);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'insertMany',
    value: function insertMany() {
      var _this8 = this;

      for (var _len3 = arguments.length, docs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        docs[_key3] = arguments[_key3];
      }

      // console.log('insertMany', ...docs);
      return Promise.all(docs.map(function (doc) {
        if (!(doc instanceof _this8)) {
          doc = new _this8(doc);
        }
        // console.log('new', doc);
        return doc;
      }).map(function (doc) {
        return new Promise(function (ok, ko) {
          doc.save().then(function () {
            return ok(doc);
          }).catch(ko);
        });
      }));
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'insertOne',
    value: function insertOne(doc) {
      var _this9 = this;

      return new Promise(function (ok, ko) {
        try {
          if (!(doc instanceof _this9)) {
            doc = new _this9(doc);
          }

          doc.set({ __v: 0, __V: _this9.version }).save().then(function () {
            return ok(doc);
          }).catch(ko);
        } catch (error) {
          ko(error);
        }
      });
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'remove',
    value: function remove() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this.deleteMany(filter);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'update',
    value: function update() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var modifier = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return this.updateMany(filter, modifier, options);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'updateById',
    value: function updateById(_id) {
      var modifier = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return this.updateOne({ _id: _id }, modifier, options);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'updateByIds',
    value: function updateByIds(ids) {
      var modifier = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return this.updateMany({ _id: { $in: ids } }, modifier, options);
    }

    //----------------------------------------------------------------------------

  }, {
    key: 'updateOne',
    value: function updateOne(filter, modifier) {
      var _this10 = this;

      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return new Promise(function (ok, ko) {
        if (!(filter instanceof _findStatement2.default)) {
          filter = new _findStatement2.default(filter, _this10);
        }

        delete filter.$projection;

        if (!(modifier instanceof _updateStatement2.default)) {
          modifier = new _updateStatement2.default(modifier, _this10);
        }

        normalizeModifier(modifier, _this10);

        // Get document from DB

        _this10.findOne(filter, options).then(function (doc) {
          if (!doc) {
            return ok();
          }

          _promiseSequencer2.default.pipe(

          // Apply before hooks

          function () {
            return (0, _promiseSequencer2.default)((_this10.updating() || []).map(function (fn) {
              return function () {
                return fn(doc);
              };
            }));
          },

          // Put hooks changes into modifiers and update

          function () {
            return new Promise(function (ok, ko) {

              var _modifiers = Object.assign({}, modifier);

              if (Object.keys(doc.$changes).length) {
                if (!('$set' in _modifiers)) {
                  _modifiers.$set = {};
                }

                Object.assign(_modifiers.$set, doc.$changes);
              }

              _promiseSequencer2.default.pipe(function () {
                return _this10.exec('updateOne', { _id: doc._id }, _modifiers);
              }, function () {
                return _this10.findOne({ _id: doc._id });
              }).then(function (doc) {
                return ok(doc);
              }).catch(ko);
            });
          }).then(function (doc) {

            ok(doc);

            (0, _promiseSequencer2.default)((_this10.updated() || []).map(function (fn) {
              return function () {
                return fn(doc);
              };
            }));
          }).catch(ko);
        }).catch(ko);
      });

      // if ( ! ( filter instanceof FindStatement ) ) {
      //   filter = new FindStatement(filter, this);
      // }
      //
      // if ( ! ( modifier instanceof UpdateStatement ) ) {
      //   modifier = new UpdateStatement(modifier, this);
      // }
      //
      // normalizeModifier(modifier, this);
      //
      // return sequencer.pipe(
      //   () => this.exec('updateOne', filter, modifier, options),
      //
      //   updated => new Promise(ok => ok(new this(updated, true)))
      // );
    }

    //----------------------------------------------------------------------------

    /**   Update Many - Update more than 1 document at a time
     *
     *    @arg  {FindStatement}|{Object}      filter={}       - Get filter
     *    @arg  {UpdateStatement}|{Object}    modifier={}     - Set filter
     *    @arg  {Object}                      options={}      - Optional settings
     *    @return   {Promise}
    */

    //----------------------------------------------------------------------------

  }, {
    key: 'updateMany',
    value: function updateMany() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _this11 = this;

      var modifier = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return new Promise(function (ok, ko) {

        if (!(filter instanceof _findStatement2.default)) {
          filter = new _findStatement2.default(filter, _this11);
        }

        delete filter.$projection;

        if (!(modifier instanceof _updateStatement2.default)) {
          modifier = new _updateStatement2.default(modifier, _this11);
        }

        normalizeModifier(modifier, _this11);

        _promiseSequencer2.default.pipe(

        // Get documents from DB

        function () {
          return _this11.find(filter, options);
        }, function (docs) {
          return _promiseSequencer2.default.pipe(

          // Apply before hooks

          // () => Promise.all(docs.map(doc =>
          //   sequencer((this.updating() || []).map(fn => () => fn(doc)))
          // )),

          // Put hooks changes into modifiers

          function () {
            return Promise.all(docs.map(function (doc) {
              return new Promise(function (ok, ko) {

                var _modifiers = Object.assign({}, modifier);

                if (Object.keys(doc.$changes).length) {
                  if (!('$set' in _modifiers)) {
                    _modifiers.$set = {};
                  }

                  Object.assign(_modifiers.$set, doc.$changes);
                }

                if (_modifiers.$set) {
                  for (var set in _modifiers.$set) {
                    doc.set(set, _modifiers.$set[set]);
                  }
                }

                if (_modifiers.$inc) {
                  for (var inc in _modifiers.$inc) {
                    doc.increment(inc, _modifiers.$inc[inc]);
                  }
                }

                doc.save().then(ok, ko);

                // this
                //   .exec('updateOne', { _id : doc._id }, _modifiers)
                //   .then(() => {
                //
                //     if ( _modifiers.$set ) {
                //       for ( const set in _modifiers.$set ) {
                //         doc.set(set, _modifiers.$set[set]);
                //       }
                //     }
                //
                //     if ( _modifiers.$inc ) {
                //       for ( const inc in _modifiers.$inc ) {
                //         doc.increment(inc, _modifiers.$inc[inc]);
                //       }
                //     }
                //
                //     ok(doc);
                //   })
                //   .catch(ko)
              });
            }));
          });
        }).then(function (docs) {
          ok(docs);

          docs.forEach(function (doc) {
            return (0, _promiseSequencer2.default)((_this11.updated() || []).map(function (fn) {
              return function () {
                return fn(doc);
              };
            }));
          });
        }).catch(ko);
      });
    }

    //----------------------------------------------------------------------------

  }]);

  return ModelQuery;
}(_modelMigrate2.default);

ModelQuery.isFromDB = true;
exports.default = ModelQuery;