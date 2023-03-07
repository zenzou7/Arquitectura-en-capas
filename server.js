const express = require('express');
const passport = require('passport');
const app = express();
const config = require('./config/config.js');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const routerApiProductos = require('./src/routes/routerApiProductos.js');
const router = require('./src/routes/router.js');
const websocket = require('./src/service/io.js');
const { MongoSession, MongoDBService } = require('./config/services');
const yargs = require('yargs/yargs')(process.argv.slice(2));
const args = yargs.default({ PORT: config.PORT }).argv;

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

MongoDBService();

app.use(MongoSession);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/productos', routerApiProductos);
app.use('/', router);

websocket(io);

httpServer.listen(args.PORT, () => {
  console.log(`Server on http://${config.HOST}:${args.PORT}`);
});
