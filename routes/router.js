const { Router } = require('express');
const controller = require('../service/controller');

const router = new Router();

router.get('/', controller.getRoot);

router.get('/api/json', controller.apiJson);

router.post('/api/pedidos', controller.postApiPedidos);

router.get('/info', controller.getInfo);

module.exports = router;
