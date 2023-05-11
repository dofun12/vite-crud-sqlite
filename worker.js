import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const logHtml = function (cssClass, ...args) {
    postMessage({
        type: 'log',
        payload: { cssClass, args },
    });
};

const log = (...args) => logHtml('', ...args);
const error = (...args) => logHtml('error', ...args);

let root_sqlite3;
const start = function (sqlite3) {
    root_sqlite3 = sqlite3;
    log('Running SQLite3 version', sqlite3.version.libVersion);
    let db = start_db(sqlite3);
    try {
        log('Creating a table...');
        db.exec('CREATE TABLE IF NOT EXISTS t(a,b)');
        log('Insert some data using exec()...');
        for (let i = 20; i <= 25; ++i) {
            insert(db, 'INSERT INTO t(a,b) VALUES (?,?)', [i, i * 2])
        }
        select(db, 'SELECT a FROM t ORDER BY a LIMIT 3');
    } finally {
        db.close();
    }
};


function insert(db, sql, args){
    db.exec({
        sql,
        bind: args,
    });
}

function select(db, sql){
    let rows = [];
    db.exec({
        sql,
        callback: (row) => {
            rows.push(row);
            log(row);
        },
    });
    log('Query data with exec()...');
    console.log(rows);
    return rows;
}

function start_db(sqlite3){
    let db;
    if ('opfs' in sqlite3) {
        db = new sqlite3.oo1.OpfsDb('/mydb.sqlite3');
        log('OPFS is available, created persisted database at', db.filename);
    } else {
        db = new sqlite3.oo1.DB('/mydb.sqlite3', 'ct');
        log('OPFS is not available, created transient database', db.filename);
    }
    return db;
}

addEventListener('message', function (e){
    const data = e.data;
    if('listar' == data.cmd){
        const db = start_db(root_sqlite3);
        select(db, 'SELECT a FROM t ORDER BY a LIMIT 3');
    }
    console.log(data);
})

log('Loading and initializing SQLite3 module...');
sqlite3InitModule({
    print: log,
    printErr: error,
}).then((sqlite3) => {
    log('Done initializing. Running demo...');
    try {
        start(sqlite3);
    } catch (err) {
        error(err.name, err.message);
    }
});
