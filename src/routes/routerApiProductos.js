const { Router } = require('express');
const controller = require('../controller/controllerApiProductos.js');
const passport = require('passport');
const multer = require('multer');
const authPassport = require('../../middlewares/authPassport.js');
const upload = multer();

authPassport();

const routerProductos = new Router();

routerProductos.get('/', controller.getProds);

routerProductos.post('/form', upload.none(), controller.routerPostForm);

routerProductos.post('/login', upload.none(), passport.authenticate('login', { failureRedirect: '/api/productos/fail/login' }), controller.routerPostLogin);

routerProductos.get('/form', controller.routerGetForm);

routerProductos.get('/login', controller.routerGetLogin);

routerProductos.get('/logout', controller.routerGetLogout);

routerProductos.get('/signup', controller.routerGetSignup);

routerProductos.post('/signup', passport.authenticate('signup', { failureRedirect: '/api/productos/fail/signup' }), controller.routerPostSignup);

routerProductos.get('/fail/login', controller.routerGetFailLogin);

routerProductos.get('/fail/signup', controller.routerGetFailSignup);

module.exports = routerProductos;
