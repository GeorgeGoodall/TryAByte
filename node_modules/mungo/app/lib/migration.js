'use strict';

import Model                from './model';
import MigrationModel       from '../models/migration';
import sequencer            from 'promise-sequencer';
import prettify             from './prettify';

class Migration extends Model {

  static model = MigrationModel;

  //----------------------------------------------------------------------------

  static migrate () {
    throw new Error('Can not call migrate() on a migration -- only on a model');
  }

  //----------------------------------------------------------------------------

  static undo () {
    return sequencer(

      () => MigrationModel.find({
          collection  :   this.collection,
          version     :   this.version
        }),

      migrations => Promise.all(
        migrations.map(migration => new Promise((ok, ko) => {
          try {

            // console.log(prettify([migration]));

            if ( 'remove' in migration ) {
              return this.deleteById(migration.remove._id)
                .then(ok, ko);
            }

            if ( 'unset' in migration ) {
              return this
                .update(
                  migration.unset.get,
                  { $unset : migration.unset.fields }
                )
                .then(ok, ko);
            }

            if ( 'update' in migration ) {
              return this
                .update(migration.update.get, migration.update.set)
                .then(ok, ko);
            }
          }
          catch ( error ) {
            ko(error);
          }
        }))
      )

    );
  }

  static revert (instructions = {}) {
    return MigrationModel.insert(Object.assign({
      collection  :   this.collection,
      version     :   this.version
    }, instructions));
  }

}

export default Migration;
