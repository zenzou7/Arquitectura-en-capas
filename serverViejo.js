const express = require('express');
const session = require('./utils/session.js');
/* const session = require('express-session'); */
/* const { sendMail } = require('./utils/nodemailer.js'); */

const cors = require('cors');

const config = require('./utils/config.js');

/* const MongoStore = require('connect-mongo'); */

const routerApiProductos = require('./routerApiProductos.js');
const router = require('./routes/router.js');

const { normalize, schema } = require('normalizr');

const mensajesDaoMongo = require('./src/DAO/daoMongoMensajes.js');
const classMsgs = new mensajesDaoMongo();

const passport = require('./utils/passport.js');

/* const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('./models/users.js');
 */

const yargs = require('yargs/yargs')(process.argv.slice(2));
const args = yargs.default({ PORT: config.PORT }).argv;

const compression = require('compression');

const winston = require('winston');

const logger = winston.createLogger({
  level: 'warn',
  transports: [new winston.transports.Console({ level: 'info' }), new winston.transports.File({ filename: 'warn.log', level: 'warn' }), new winston.transports.File({ filename: 'error.log', level: 'error' })],
});

const app = express();

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

app.use(cors());

app.use(compression());

/* app.use(express.static(__dirname + '/public'));*/
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Passport
/* function isValidPassword(user, password) {
  return bcrypt.compareSync(password, user.password);
}

function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

passport.use(
  'login',
  new LocalStrategy((username, password, done) => {
    Usuarios.findOne({ username }, (err, user) => {
      if (err) return done(err);

      if (!user) {
        logger.log('error', `User Not Found with username ${username} - log error`);
        return done(null, false);
      }

      if (!isValidPassword(user, password)) {
        logger.log('error', 'Invalid Password - log error');
        return done(null, false);
      }

      return done(null, user);
    });
  })
);

passport.use(
  'signup',
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      Usuarios.findOne({ username: username }, function (err, user) {
        if (err) {
          logger.log('error', `Error in signup ${err}- log error`);
          return done(err);
        }

        if (user) {
          logger.log('error', 'User alredy exist - log error');
          return done(null, false);
        }

        const newUser = {
          username: username,
          password: createHash(password),
          email: req.body.email,
          number: req.body.number,
          avatar: req.body.avatar,
        };
        sendMail(newUser);
        Usuarios.create(newUser, (err, userWithId) => {
          if (err) {
            logger.log('error', `Error in saving ${err}- log error`);
            return done(err);
          }
          console.log(user);
          console.log('User Registration succesful');
          return done(null, userWithId);
        });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await Usuarios.findById(id);
  done(user);
}); */

//Session

/* app.use(passport.session()); */
app.use(passport.initialize());

httpServer.listen(args.PORT, () => {
  console.log(`Server on http://${config.HOST}:${args.PORT}`);
});

app.set('view engine', 'ejs');

app.use('/api/productos', routerApiProductos);
app.use('/', router);

/* app.get('*', route.getInexistent); */
//SOCKET
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
