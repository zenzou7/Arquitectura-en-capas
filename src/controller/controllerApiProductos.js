const daoMongoProductos = require('../service/DAO/daoMongoProductos.js');
const classProductos = new daoMongoProductos();
const daoMongoPedidos = require('../service/DAO/daoMongoProductos.js');
const classPedidos = new daoMongoPedidos();
const yargs = require('yargs/yargs')(process.argv.slice(2));
const config = require('../../config/config.js');
const args = yargs.default({ PORT: config.PORT }).argv;
const winston = require('winston');
const { sendCartMail } = require('../../utils/nodemailer.js');
const { sendPhoneMsg, sendWhatsAppMsg } = require('../../utils/twilio.js');

const logger = winston.createLogger({
  level: 'warn',
  transports: [new winston.transports.Console({ level: 'info' }), new winston.transports.File({ filename: 'warn.log', level: 'warn' }), new winston.transports.File({ filename: 'error.log', level: 'error' })],
});

const postPedidos = (req, res) => {
  logger.log('info', 'Post en /api/pedidos - log info');
  try {
    const body = req.body;

    const { username, password, number, avatar, email } = req.user;

    const pedido = {
      usuario: username,
      email: email,
      numero: number,
      avatar: avatar,
      pedido: body,
    };
    sendWhatsAppMsg(JSON.stringify(pedido.pedido));
    sendCartMail(req.user.username, pedido);
    sendPhoneMsg(req.user.number);
    console.log(pedido);
    classPedidos.save(pedido);
    res.json('Pedido hecho con exito!');
  } catch (err) {
    logger.log('error', `Error in Post /api/pedidos: ${err}- log error`);
  }
};

const getProds = (req, res) => {
  logger.log('info', 'Get /api/productos - log info');
  try {
    if (req.isAuthenticated()) {
      res.render('pages/productos');
    } else {
      res.render('pages/login');
    }
  } catch (err) {
    logger.log('error', `Error in Get /: ${err}- log error`);
  }
};

const routerPostForm = (req, res) => {
  logger.log('info', 'Post en /api/productos/form - log info');
  try {
    const body = req.body;
    classProductos.save(body);
    if (body) {
    } else {
      res.json({ error: true, msg: 'Producto no agregado' });
    }
  } catch (err) {
    logger.log('error', `Error in Post /api/productos/form: ${err}- log error`);
  }
};

const routerPostLogin = (req, res) => {
  logger.log('info', 'Post en /api/productos/login - log info');
  try {
    const { username, password, number, avatar, email } = req.user;
    const user = { username: username, password: password, number: number, avatar: avatar, email: email };
    res.render('pages/profile', { user });
  } catch (err) {
    logger.log('error', `Error in Post /api/productos/login: ${err}- log error`);
  }
};

const routerGetForm = async (req, res) => {
  logger.log('info', 'Get en /api/productos/form: - log info');
  try {
    const prods = await classProductos.getAll();

    res.render('pages/form', { products: prods });
  } catch (err) {
    logger.log('error', `Error in Get /api/productos/form: ${err}- log error`);
  }
};

const routerGetLogin = async (req, res) => {
  logger.log('info', 'Get en /api/productos/login - log info');
  if (req.isAuthenticated()) {
    const { username, password, number, avatar, email } = req.user;
    const user = { username, password, number, avatar, email };
    res.render('pages/profile', { user });
  } else {
    res.render('pages/login');
  }
};

const routerGetLogout = async (req, res) => {
  try {
    logger.log('info', 'Get en /api/productos/logout - log info');

    req.session.destroy((err) => {
      if (err) {
        res.send('no pudo deslogear');
      } else {
        res.render('pages/logout');
      }
    });
  } catch (err) {
    logger.log('error', `Error in Get /api/productos/logout: ${err}- log error`);
  }
};

const routerGetSignup = (req, res) => {
  logger.log('info', 'Get en /api/productos/signup - log info');

  if (req.isAuthenticated()) {
    const { username, password, number, avatar, email } = req.user;
    const user = { username, password, number, avatar, email };
    res.render('pages/profile', { user });
  } else {
    res.render('pages/signup');
  }
};

const routerPostSignup = (req, res) => {
  logger.log('info', 'Post en /api/productos/signup - log info');

  const { username, password, number, avatar, email } = req.body;
  const user = { username, password, number, avatar, email };
  res.render('pages/profile', { user });
};

const routerGetFailLogin = (req, res) => {
  logger.log('info', 'Get en /api/productos/fail/login - log info');

  res.render('pages/faillogin', { Port: args.port });
};

const routerGetFailSignup = (req, res) => {
  logger.log('info', 'Get en /api/productos/fail/signup - log info');
  const port = args.port;
  res.render('pages/failsignup', { Port: port });
};

const getInexistent = (req, res) => {
  logger.log('warn', 'Get en Inexistent- log warn');
  res.render('pages/inexistent', { Port: args.PORT });
};

module.exports = {
  postPedidos,
  getProds,
  routerPostForm,
  routerPostLogin,
  routerGetForm,
  routerGetLogin,
  routerGetLogout,
  routerGetSignup,
  routerPostSignup,
  routerGetFailLogin,
  routerGetFailSignup,
  getInexistent,
};
