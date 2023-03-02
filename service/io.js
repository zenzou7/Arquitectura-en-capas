const { normalize, schema } = require('normalizr');
const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const mensajesDaoMongo = require('../src/DAO/daoMongoMensajes');
const classMsgs = new mensajesDaoMongo();
const productosMongo = require('../src/DAO/daoMongoProductos.js');
const classProductos = new productosMongo();
// const io = require("socket.io")(httpServer);

async function websocket(io) {
  io.on('connection', async (socket) => {
    console.log('Usuario conectado');

    socket.on('msg', async (data) => {
      let fecha = new Date();

      const msg = {
        author: {
          id: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
          edad: data.edad,
          avatar: data.avatar,
        },
        text: {
          mensaje: data.mensaje,
          fecha: fecha.getDate() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getFullYear(),
          hora: fecha.getHours() + ':' + fecha.getMinutes() + ':' + fecha.getSeconds(),
        },
      };

      classMsgs.save(msg);
      const allData = await classMsgs.getAll();

      const mensajeSchema = new schema.Entity('mensaje');
      const authorSchema = new schema.Entity(
        'author',
        {
          mensaje: mensajeSchema,
        },
        { idAttribute: 'email' }
      );
      const chatSchema = new schema.Entity('chat', {
        author: [authorSchema],
      });
      const normalizado = normalize({ id: 'chatHistory', messages: allData }, chatSchema);
      console.log(JSON.stringify(normalizado));

      io.sockets.emit('msg-list', { normalizado: normalizado });
    });

    socket.on('sendTable', async (data) => {
      classProductos.save(data);

      try {
        const productos = await classProductos.getAll();
        socket.emit('prods', productos);
      } catch (err) {
        logger.log('error', `${err} - log error`);
      }
    });
  });
}

module.exports = websocket;
