"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var express = require('express');

var bodyParser = require('body-parser');

var _require = require('express-graphql'),
    graphqlHTTP = _require.graphqlHTTP;

var _require2 = require('graphql'),
    buildSchema = _require2.buildSchema;

var mongoose = require('mongoose');

var bcrypt = require('bcryptjs');

var Event = require('./models/event');

var User = require('./models/user');

var _require3 = require('./models/event'),
    populate = _require3.populate;

var app = express();
app.use(bodyParser.json());
app.use('/graphql', graphqlHTTP({
  schema: buildSchema("\n        type Event {\n            _id: ID!\n            title: String!\n            description: String!\n            price: Float!\n            date: String!\n            creator: User!\n        }\n         \n        type User {\n            _id:ID!\n            email: String!\n            password: String\n            createdEvents: [Event!]\n        }\n\n        input EventInput {\n            title: String!\n            description: String!\n            price: Float!\n            date: String!\n        }\n         \n        input UserInput {\n            email:String! \n            password: String!\n        }\n\n        type RootQuery {\n            events: [Event!]!\n        }\n\n        type RootMutation { \n            createEvent(eventInput: EventInput): Event\n            createUser(userInput: UserInput): User\n        }\n\n        schema {\n            query: RootQuery  \n            mutation: RootMutation\n        }\n    "),
  rootValue: {
    events: function events() {
      return Event.find().populate('creator').then(function (events) {
        return events.map(function (event) {
          return _objectSpread({}, event._doc, {
            _id: event.id
          });
        });
      })["catch"](function (err) {
        throw err;
      });
    },
    createEvent: function createEvent(args) {
      var event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '5f49176aa5d4ae5728313f24'
      });
      var createdEvent;
      return event.save().then(function (result) {
        createdEvent = _objectSpread({}, result._doc, {
          _id: result._doc._id.toString()
        });
        return User.findById('5f49176aa5d4ae5728313f24');
      }).then(function (user) {
        if (!user) {
          throw new Error('User not found');
        }

        user.createdEvents.push(event);
        return user.save();
      }).then(function (result) {
        return createdEvent;
      })["catch"](function (err) {
        console.log(err);
        throw err;
      });
    },
    createUser: function createUser(args) {
      return User.findOne({
        email: args.userInput.email
      }).then(function (user) {
        if (user) {
          throw new Error('User exists already .');
        }

        return bcrypt.hash(args.userInput.password, 12);
      }).then(function (hashedPassword) {
        var user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      }).then(function (result) {
        return _objectSpread({}, result._doc, {
          password: null,
          _id: result.id
        });
      })["catch"](function (err) {
        throw err;
      });
    }
  },
  graphiql: true
}));
mongoose.connect("mongodb+srv://".concat(process.env.MONGO_USER, ":").concat(process.env.MONGO_PASSWORD, "@cluster0.i5krb.mongodb.net/").concat(process.env.MONGO_DB, "?retryWrites=true&w=majority")).then(function () {
  app.listen(3000);
})["catch"](function (err) {
  console.log(err);
});