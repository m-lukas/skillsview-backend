const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const firebase = require('firebase');
const firebaseInstance = require('../configs/database');
const dotenv = require('dotenv');

function User(userData){
    this.uri = '';
    this.email = '';
    this.passwordHash = '';
    this.confirmed = false;
    this.confirmationToken = '';    
}s

User.prototype.isValidPassword = function(password) {
    return bcrypt.compareSync(password, this.passwordHash);
};

User.prototype.setPassword = function(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

User.prototype.setConfirmationToken = function() {
    this.confirmationToken = this.generateJWT();
};

User.prototype.generateConfirmationUrl = function() {

};

User.prototype.generateJWT = function() {
    return jwt.sign(
        {
            email: this.email,
            uri: this.uri,
            confirmed: this.confirmed
        },
        process.env.JWT_SECRET
    );
};

User.prototype.generateResetPasswordLink = function() {

};

User.prototype.genereateResetPasswordToken = function() {

};

User.prototype.toAuthJSON = function() {
    return {
        email: this.email,
        confirmed: this.confirmed,
        token: this.generateJWT()
    };
};

User.prototype.save = function() {
    
}

