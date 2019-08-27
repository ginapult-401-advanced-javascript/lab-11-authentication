'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const auth = require('./middleware.js');

authRouter.post('/signup', (request, response, next) => {
  let user = new User(request.body);
  user.save()
    .then( (user) => {
      request.token = user.generateToken();
      request.user = user;
      response.set('token', request.token);
      response.cookie('auth', request.token);
      response.send(request.token);
    })
    .catch(next);
});

authRouter.post('/signin', auth, (request, response, next) => {
  response.cookie('auth', request.token);
  response.send(request.token);
});

module.exports = authRouter;
