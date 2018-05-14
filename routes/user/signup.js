const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const firebase = require('firebase');
const firebaseInstance = require('../../configs/database');
const dotenv = require('dotenv');

dotenv.config();

//firebase reference
var ref = firebaseInstance.database().ref().child('auth');

const router = express.Router();

//generate jsonwebtoken
const generateJTW = (uid, email) => {
    return jwt.sign({
        uid: uid,
        email: email
    }, process.env.JWT_SECRET);
}

//create user object to return
const toAuthJson = (uid, email) => {
    return{
        email: email,
        token: generateJTW(uid, email)
    }
}

//hash passoword
const encryptPassword = (password) => {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

router.post('/', (req, res) => {
    const { email, password } = req.body.user;
    ref.orderByChild('email').equalTo(email).once('value')
        .then( snapshot => {
            //if email exists
            if(snapshot.val()){
                res.status(400).json({ errors: { global: "Email already exists!"} });
            }else{
                //create unique user id
                var uid = uniqid();
                //create userObject
                var userObject = {
                    email: email,
                    passwordHash: encryptPassword(password)
                }
                var projects = [];
                //add auth data in database
                ref.child(uid).set(userObject);
                //respond with user data
                res.json({ user: toAuthJson(uid, email) });
            }
        });
});

module.exports = router;