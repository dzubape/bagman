const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const textParser = bodyParser.text();

const { promises, constants } = require('fs')

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./storage/db.sqlite3');
db.run("CREATE TABLE IF NOT EXISTS 'backup' (backup_id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");

const lockFile = path => {
    const lockPath = `${path}.lock`
    return promises.open(lockPath, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR).catch(() => lockFile(path))
};
const unlockFile = path => {
    const lockPath = `${path}.lock`
    return promises.unlink(lockPath).catch(() => unlockFile(path))
};


/// server config
const { exit } = require('process');
const configFile = './server-config.json';
let servConfig = fs.readFileSync(configFile);
if(!servConfig)
    throw new Error(`Error while reading server config file ${configFile}`);
servConfig = JSON.parse(servConfig);
console.log(servConfig); 

const app = express();
const router = express.Router();

router.use('/', express.static(path.join(__dirname, "dist")));
router.use('/src', express.static(path.join(__dirname, "storage")));

router.get('/hello', (req, resp, next) => {

    console.log('This is hello');
	resp.status(200);
	resp.setHeader('Content-Type', 'text/plain; charset=utf-8');
	resp.flushHeaders();
    resp.write('world');

    next();
});

router.get('/ping', (req, resp, next) => {

    resp.status(200);
    resp.setHeader('Content-Type', 'text/plain; charset=utf-8');
    resp.write('pong');

    next();
});

router.put('/db/data', jsonParser, (req, resp, next) => {

    
    let data = req.body;
    console.log('>> PUT /db/data');
    console.log('>> body:', data);

    db.serialize(() => {

        const stmt = db.prepare("INSERT INTO 'backup' (data) VALUES (?)");
        stmt.run(JSON.stringify(data))
        stmt.finalize();
        resp.status(200).send({status: 'ok'});
        next();
    });
});

router.get('/db/data', (req, resp, next) => {

    console.log('>> GET /db/data');

    resp.status(200);
    resp.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    resp.flushHeaders();

    db.serialize(() => {
    
        db.all("SELECT `backup_id`, `data` FROM `backup` ORDER BY `backup_id` DESC LIMIT 1", (err, rows) => {

            if(rows.length) {

                const row = rows[rows.length-1];
                resp.write(row.data);
            }
            else {

                resp.write({});
            }
            resp.write('\n')
            next();
        })
    });
    
});

router.get('/db/data/debug', (req, resp, next) => {

    console.log('>> GET /db/data');

    resp.status(200);
    resp.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    resp.flushHeaders();

    db.serialize(() => {
    
        db.all("SELECT `backup_id`, `data` FROM `backup` ORDER BY `backup_id` DESC LIMIT 1", (err, rows) => {

            if(rows.length) {

                const row = rows[rows.length-1];
                // resp.write(`${row.backup_id}: ${row.data}`);
                resp.write(`${row.data}\n`);
                resp.write('------------\n')
                resp.write(`backup_id: ${row.backup_id}\n`)
            }
            else {

                resp.write({});
            }
            resp.write('\n')
            // next();
            resp.end();
        })
    });
});

router.get('/db/data/:backup_id', (req, resp, next) => {

    console.log('>> GET /db/data/:backup_id', req.params.backup_id);

    resp.status(200);
    resp.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    resp.flushHeaders();

    db.serialize(() => {

        const stmt = db.prepare("SELECT `backup_id`, `data` FROM `backup` WHERE `backup_id`=$backup_id");
        const rows = stmt.all({
            $backup_id: req.params.backup_id,
        }, (err, rows) => {
            
            if(rows.length) {
    
                const row = rows[rows.length-1];
                resp.write(row.data);
            }
            else {
    
                resp.write({});
            }
            resp.write('\n')
            next();
        });
    });
});

router.get('/db/test', (req, resp, next) => {

    console.log('>> GET /db/test');

    resp.status(200);
    resp.setHeader('Content-Type', 'text/plain; charset=utf-8');
    resp.flushHeaders();

    db.serialize(() => {
    
        db.all("SELECT `backup_id`, `data` FROM `backup` ORDER BY `backup_id` DESC LIMIT 1", (err, rows) => {


            if(rows.length) {

                const row = rows[rows.length-1];
                resp.write(`${row.backup_id}: ${row.data}`);
            }
            next();
        })
    });
    
});

router.put('/db/test', textParser, (req, resp, next) => {

    
    let data = req.body;
    console.log('>> PUT /db/test');
    console.log('>> body:', data);

    db.serialize(() => {

        const stmt = db.prepare("INSERT INTO 'backup' (data) VALUES (?)");
        stmt.run(data)
        const res = stmt.finalize();

        console.log('res:', res);
        next();
    });
});

router.use('*', (req, resp, next) => {

    resp.end();
});

app.use(router);

const server = http.createServer(app);
server.listen(servConfig.port, () => console.log(`server started on port: ${servConfig.port}`));

// db.close();