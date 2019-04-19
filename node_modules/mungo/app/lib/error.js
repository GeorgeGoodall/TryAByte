'use strict';

class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class MungoError extends ExtendableError {

  static MISSING_REQUIRED_FIELD = 1;

  static DISTINCT_ARRAY_CONSTRAINT = 2;

  constructor (message, options = {}) {
    super(message);
    let msg;

    try {
      msg = JSON.stringify({ message , options }, null, 2);
    } catch (e) {
      msg = message;
    } finally {
      super(msg);
    }

    this.originalMessage = message;

    if ( 'code' in options ) {
      this.code = options.code;
    }

    this.options = options;
  }

  static rethrow (error, message, options = {}) {
    options.error = {};

    if ( error instanceof this ) {
      options.error.message = error.originalMessage;
      options.error.code = error.code;
      options.error.options = error.options;
      options.error.stack = error.stack.split(/\n/);
    }
    else {
      options.error.name = error.name;
      options.error.message = error.message;
      options.error.code = error.code;
      options.error.stack = error.stack.split(/\n/);
    }

    return new this(message, options);
  }
}

export default MungoError;
