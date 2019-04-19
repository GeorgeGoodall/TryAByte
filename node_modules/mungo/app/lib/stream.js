'use strict';

import { Readable }       from 'stream';
import Mungo               from './mungo';

class Streamable extends Readable {
  constructor (options) {
    super({
      encoding: 'utf8'
    });

    this.setEncoding('utf8');

    this.collection = [];
  }

  _read (n) {
    console.log('reading');
  }

  add (...doc) {
    console.log('adding', doc.length);
    // this.collection.push(...doc);
    this.resume();
    this.emit('readable');

    doc.map(doc => doc.toJSON());

    let source = JSON.stringify(doc);

    console.log(source)
    this.emit('data', source);
  }

  end () {
    this.emit('end');
  }
}

Mungo.Streamable = Streamable;
