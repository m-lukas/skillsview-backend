const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const firebase = require('firebase');
const firebaseInstance = require('../../configs/database');
const dotenv = require('dotenv');

dotenv.config();

var ref = firebaseInstance.database().ref().child('auth');

const router = express.Router();

const generateJTW = (uid, email) => {
    return jwt.sign({
        uid: uid,
        email: email
    }, process.env.JWT_SECRET);
}

const toAuthJson = (uid, email) => {
    return{
        email: email,
        token: generateJTW(uid, email)
    }
}

const encryptPassword = (password) => {
    return bcrypt.hashSync(password, 10);
}

router.post('/', (req, res) => {
    const { email, password } = req.body.user;

    ref.orderByChild('email').equalTo(email).once('value')
        .then( snapshot => {
            if(snapshot.val()){
                res.status(400).json({ errors: { global: "Email already exists!"} });
            }else{
                var uid = uniqid();
                var userObject = {
                    email: email,
                    passwordHash: encryptPassword(password)
                }
                var projects = [];
                ref.child(uid).set(userObject);
                res.json({ user: toAuthJson(uid, email) });
            }
        });
});

module.exports = router;