'use strict';

import Type from './type';

function prettify (prim, options = {}) {
  try {
    // console.log(require('util').inspect(options, { depth: null }));

    let tab = options.tab || '';

    if ( options.isArray ) {
      // tab = tab.replace(/-/g, ' ') + '- ';
    }

    if ( prim === null ) {
      return tab + 'null'.grey.italic.bold;
    }

    if ( typeof prim === 'undefined' ) {
      return tab + 'undefined'.magenta.italic;
    }

    if ( typeof prim === 'string' ) {
      return tab + `"${prim}"`.cyan;
    }

    if ( typeof prim === 'number' ) {
      return tab + prim.toString().yellow;
    }

    if ( typeof prim === 'function' ) {
      return tab + `[Function: ${prim.name || 'lambda'}]`.italic;
    }

    if ( prim === true ) {
      return tab + 'true'.bgGreen.white.bold;
    }

    if ( prim === false ) {
      return tab + 'false'.bgRed.white.bold;
    }

    if ( Array.isArray(prim) ) {
      if ( ! prim.length ) {
        return tab + '[]'.bold.grey;
      }

      const reOptions = {};

      Object.assign(reOptions, options, {
        tab : tab + '',
        isArray : true
      })

      const lines = prim
        .map(prim => prettify(prim, reOptions).replace(/^(\s+)/, '$1 - ') + '\n')
        .join('\n');

      return lines
        .split('\n')
        .map(line => {
          if ( ! /^-/.test(line.trim()) ) {
            line = `   ${line}`;
          }
          return line;
        })
        .join('\n');
    }

    if ( typeof prim === 'object' ) {


      if ( 'plugins' in options && 'objects' in options.plugins ) {

        for ( let _constructor in options.plugins.objects ) {
          if ( prim instanceof options.plugins.objects[_constructor].def ) {

            return tab + options.plugins.objects[_constructor].output(prim, options);
          }
        }
      }

      if ( ! Object.keys(prim).length ) {
        return tab + '{}'.bold.grey;
      }

      const reOptions = {};

      Object.assign(reOptions, options, {
        tab : tab + '  ',
        isArray : false
      });

      if ( prim instanceof require('mongodb').ObjectID ) {
        return '  ' + tab + 'ObjectId'.magenta.italic + ` ${prim.toString()}`.grey;
      }

      return Object.keys(prim)
        .map((key, index) => ({ index, key, parsed : prettify(prim[key], reOptions) }))
        .map(f => {
          let str = '';

          if ( f.index === 0 ) {
            if ( prim.constructor !== Object ) {
              str += tab + prim.constructor.name.bold.grey + '\n';
            }
          }

          str += tab;

          if ( /^_/.test(f.key) ) {
            str += f.key.grey;
          }
          else {
            str += f.key;
          }

          let padding = ':..'.grey;

          for ( let i = 0; i < 10 - f.key.length; i ++ ) {
            padding += '.'.grey;
          }

          let breakLine = false;

          if ( prim[f.key] && typeof prim[f.key] === 'object' && Object.keys(prim[f.key]).length ) {
            breakLine = true;

            if ( prim[f.key] instanceof require('mongodb').ObjectID ) {
              return str + padding + 'ObjectId'.magenta.italic + ` ${prim[f.key].toString()}`.grey;
            }

            if ( prim[f.key] instanceof require('./type') ) {
              let ret = str + padding + 'Type'.magenta.italic + ` ${prim[f.key].getType().name}`.grey;

              if ( prim[f.key].isSubdocument() ) {
                ret += '\n' + prettify(
                  prim[f.key].getSubdocument(),
                  { tab : tab +'  '}
                );
              }

              else if ( prim[f.key].isArray() ) {
                ret += (' of ' + (prim[f.key].getArray().getType().name.italic)).grey;

                if ( prim[f.key].getArray().isSubdocument() ) {
                  ret += '\n' + prettify(
                    prim[f.key].getArray().getSubdocument(),
                    { tab : tab +'  '}
                  );
                }
              }

              return ret;
            }
          }

          if ( Array.isArray(prim[f.key]) && ! prim[f.key].length ) {
            breakLine = false;
          }

          if ( breakLine ) {
            str += '\n' + f.parsed
          }

          else {
            str += padding + f.parsed.trimLeft()
          }

          return str;
        })
        .join('\n');
    }
  }
  catch ( error ) {
    let tab = options.tab || '';

    if ( error.message === 'Maximum call stack size exceeded' ) {
      return tab + '[Circular]'.red.bold;
    }
    return tab + '{could not prettify}'.red.bgYellow.bold + ' ' + error.message.bgRed;
  }
}

prettify.styles = {
  null : {
    color : 'grey'
  }
};

export default prettify;
