const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const { promises, constants } = require('fs')
const lockFile = path => {
    const lockPath = `${path}.lock`
    return promises.open(lockPath, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR).catch(() => lockFile(path))
};
const unlockFile = path => {
    const lockPath = `${path}.lock`
    return promises.unlink(lockPath).catch(() => unlockFile(path))
};

// async () => {
//     const path = 'some/path/to/file'
//     await lockFile(path)
//     // Do something with the file
//     // ...
//     await unlockFile(path)
// }

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

router.use('/data', bodyParser.json());
router.post('/data', (req, resp, next) => {
    
    let data = JSON.stringify(req.body);
    console.log('POST /data', req.body);
    console.log('POST /data', data);
    
    const filepath = path.join(__dirname, "storage", "data.bak.json")

    fs.writeFileSync(filepath, data, 'utf8');
    // /*  await*/ lockFile(filepath)

    // let ws = fs.createWriteStream(filepath);
    // ws.write(data);
    // ws.end();

    
    // /*await*/ unlockFile(filepath);

    // fs.open(path.join(__dirname, "storage", "data.bak.json"), 'w', (e, fd)  => {

    //     if(e) {

    //         console.error(e);
    //         return
    //     }

    //     fs.write(fd, data, e => {});
    // });

    // const dataBuf = Buffer.alloc(data.length, data, 'utf8')
    // fs.writeFile(path.join(__dirname, "storage", "data.bak.json"), dataBuf, (e) => {});
    // next();

    // fs.writeFile(path.join(__dirname, "storage", "data.bak.json"), data, {flag: 'w'}, e  => {})

    // try {

    //     fs.writeFileSync(path.join(__dirname, "storage", "data.bak.json"), data, (e) => {
    // } catch {

    // }

    //     console.error(e);
    // });

    resp.status(200);
    resp.end();
    next();
});

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

router.use('*', (req, resp, next) => {

    resp.end();
});

app.use(router);

const server = http.createServer(app);
server.listen(servConfig.port, () => console.log(`server started on port: ${servConfig.port}`));