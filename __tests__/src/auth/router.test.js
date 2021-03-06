'use strict';

process.env.STORAGE = 'mongo';

const jwt = require('jsonwebtoken');

const server = require('../../../src/app.js').server;
const supergoose = require('../../supergoose.js');

const mockRequest = supergoose.server(server);

let users = {
  admin: {username: 'admin', password: 'password', role: 'admin'},
  editor: {username: 'editor', password: 'password', role: 'editor'},
  user: {username: 'user', password: 'password', role: 'user'},
};

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Auth Router', () => {
  
  Object.keys(users).forEach( userType => {
    
    describe(`${userType} users`, () => {
      
      let encodedToken;
      let id;
      
      it('can create one', () => {
        return mockRequest.post('/signup')
          .send(users[userType])
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET || 'IYXXhwMBwCnDIZa9jlAL');
            id = token.id;
            encodedToken = results.text;
            expect(token.id).toBeDefined();
            expect(token.capabilities).toBeDefined();
          });
      });

      it('can signin with basic', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET || 'IYXXhwMBwCnDIZa9jlAL');
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
          });
      });

    });
    
  });
  
});

describe('Book router', () => {
  describe('book route authentication', () => {

    it('can protect /books route', () => {
      return mockRequest.get('/books')
        .auth('Fred', 'password')
        .then(results => {
          expect(results.status).toEqual(401);
        });
    });

    it('can protect /books/:id route', () => {
      return mockRequest.get('/books/:id')
        .auth('Fred', 'password')
        .then(results => {
          expect(results.status).toEqual(401);
        });
    });
  });
});

