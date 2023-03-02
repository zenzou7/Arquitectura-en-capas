const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/users.js');
const { sendMail } = require('./nodemailer.js');

function isValidPassword(user, password) {
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
});
