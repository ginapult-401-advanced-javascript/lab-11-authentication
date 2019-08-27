'use strict';
/**
 * API Server Module
 * @module src/auth/users-model
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jsonWebToken = require('jsonwebtoken');


const users = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String},
  role: {type: String, required:true, default:'user', enum:['admin','editor','user'] },
});

/**
 * Pre hook uses bcrypt.hash() to hash the password
 */
users.pre('save', function(next) {
  const SALT_ROUNDS = 10;
  bcrypt.hash(this.password, SALT_ROUNDS)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch( error => {throw error;} );
});

/**
 * This function will see if a user can login to our system
 * We compare provided password with stored hash
 * @param auth
 */
users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};

  return this.findOne(query)
    .then(user => {
      return user ? user.comparePassword(auth.password) : null;
    })
    .catch(console.error);
};

/**
 * This uses bcrypt.compare to compare entered password with stored password
 * @param password
 * @returns {*}
 */
users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then(isPasswordValid => isPasswordValid ? this : null);
};

/**
 * This uses jsonWebToken to make a token with user ID and secret
 * @returns {token|*}
 */
users.methods.generateToken = function() {
  let tokenData = {
    id: this._id,
    capabilities: (this.acl && this.acl.capabilities) || [],
  };
  return jsonWebToken.sign(tokenData, process.env.SECRET || 'IYXXhwMBwCnDIZa9jlAL' );
};

module.exports = mongoose.model('users', users);
