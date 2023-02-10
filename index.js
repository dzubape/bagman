const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');

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

app.use('/', express.static(path.join(__dirname, "public", "html")));
app.use('/js', express.static(path.join(__dirname, "public", "js")));

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