'use strict';

import mongodb                    from 'mongodb';
import Model                      from './lib/model';
import Schema                     from './lib/schema';
import Type                       from './lib/type';
import Connection                 from './lib/connection';
import Migration                  from './lib/migration';
import deprecatedNotice           from './lib/deprecated-notice';
import Document                   from './lib/document';
import Index                      from './lib/index';
import Query                      from './lib/query';
import MungoError                 from './lib/error';
import FindStatement              from './lib/find-statement';
import UpdateStatement            from './lib/update-statement';

class Mungo {
  static get Mixed () {
    deprecatedNotice('Mungo.Mixed', 'Mungo.Type.Mixed');
    return Type.Mixed;
  }

  static get ObjectID () {
    deprecatedNotice('Mungo.ObjectID', 'Mungo.Type.ObjectID');
    return Type.ObjectID;
  }
}

Mungo.Index                       =   Index;
Mungo.Query                       =   Query;
Mungo.Model                       =   Model;
Mungo.Document                    =   Document;
Mungo.Schema                      =   Schema;
Mungo.Type                        =   Type;
Mungo.Connection                  =   Connection;
Mungo.connect                     =   Connection.connect.bind(Connection);
Mungo.connectify                  =   Connection.connectify.bind(Connection);
Mungo.disconnect                  =   Connection.disconnect.bind(Connection);
Mungo.connections                 =   Connection.connections;
Mungo.Migration                   =   Migration;
Mungo.Error                       =   MungoError;
Mungo.FindStatement               =   FindStatement;
Mungo.UpdateStatement             =   UpdateStatement;

Mungo.mongodb = mongodb;

Mungo.verbosity = 0;

/*
  0 = no verbose
  1 = success
  2 = error + success
  3 = warning + error + success
  4 = notice + warning + error + success
*/

export default Mungo;
