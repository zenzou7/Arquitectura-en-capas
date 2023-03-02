const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./config.js');

const MongoDBService = async () => {
  try {
    await mongoose.connect('mongodb+srv://Leo:62742@coder-backend.3x5udc7.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true });
  } catch (e) {
    console.log(e);
    throw 'can not connect to the db';
  }
};

const MongoSession = session({
  store: MongoStore.create({
    mongoUrl: config.MONGOURL,
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    ttl: 60000 * 10,
    cookie: { maxAge: 60000 * 10 },
  }),
  secret: config.SECRET,
  resave: false,
  saveUninitialized: false,
});

module.exports = { MongoDBService, MongoSession };
