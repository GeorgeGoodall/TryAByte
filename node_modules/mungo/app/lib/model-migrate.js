'use strict';

import sequencer            from 'promise-sequencer';
import ModelType            from './model-type';
import Query                from './query';

class ModelMigrate extends ModelType {

  //----------------------------------------------------------------------------

  /**
   *  @return     {Promise}
   */

  static buildIndexes () {

    const { name, indexes } = this;

    const q = new Query(this);

    return sequencer(

      () => q.getCollection(),

      () => q.collection.indexes(),

      dbIndexes => new Promise((ok, ko) => {
        dbIndexes = dbIndexes.filter(dbIndex => dbIndex.name !== '_id_');

        if ( ! dbIndexes.length && ! indexes.length ) {
          return ok();
        }

        const promises = indexes.map(index => new Promise((ok, ko) => {
          const indexExists = dbIndexes.some(
            dbIndex => dbIndex.name === index.name
          );

          if ( indexExists ) {
            return ok();
          }

          else {

            if ( index.options.force ) {
              index.options.dropDups = true;
            }

            q.collection.createIndex(index.fields, index.options)
              .then(ok, ko);
          }
        }));

        Promise.all(promises).then(ok, ko);
      })

    );
  }

  //----------------------------------------------------------------------------

  /** Migrate model
   *
   *  @arg        [string]    versions
   *  @return     {Promise}
   */

  //----------------------------------------------------------------------------

  static migrate (...versions) {

    return sequencer(

      () => this.buildIndexes(),

      () => new Promise((ok, ko) => {
        {
          const { name, migrations } = this;

          const currentVersion = this.version;

          if ( ! migrations ) {
            return ok();
          }

          const pipe = [];

          for ( let version in migrations ) {
            version = +version;

            const migration = migrations[version];

            if ( versions.length && versions.indexOf(version) === -1 ) {
              continue;
            }

            if ( version <= currentVersion ) {
              pipe.push(() => migration.do());
            }
          }

          sequencer(pipe).then(ok, ko);
        }
      })
    );
  }

  //----------------------------------------------------------------------------

}

export default ModelMigrate;
