const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const firebase = require('firebase');
const firebaseInstance = require('../../configs/database');
const dotenv = require('dotenv');

dotenv.config();

//firebase reference
var ref = firebaseInstance.database().ref().child('auth');

const router = express.Router();

//compare password with passwordHash
const isValidPassword = (password, passwordHash) => {
  return bcrypt.compareSync(password, passwordHash);
}

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

router.post('/', (req, res) => {
    const { credentials } = req.body;
    ref.orderByChild('email').equalTo(credentials.email).once('value')
        .then( snapshot => {
            //if user account exist
            if(snapshot.val()){
                snapshot.forEach(function(data) {
                    //validate login information
                    if(isValidPassword(credentials.password, data.val().passwordHash)){
                        //respond with mail and jsonwebtoken
                        res.json({ user: toAuthJson(data.key, data.val().email) });
                    }else{
                        res.status(400).json({ errors: { global: "Incorrect email or password"} });
                    }
                });
            }else{
                res.status(400).json({ errors: { global: "Unknown email"} });
            }
        });
});

module.exports = router;
