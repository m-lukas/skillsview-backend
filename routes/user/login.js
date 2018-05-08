import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import firebase from 'firebase';
import { firebaseInstance } from '../../configs/database';
import dotenv from 'dotenv';

dotenv.config();

var ref = firebaseInstance.database().ref().child('auth');

const router = express.Router();

const isValidPassword = (password, passwordHash) => {
  return bcrypt.compareSync(password, passwordHash);
}

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

router.post('/', (req, res) => {
    const { credentials } = req.body;
    ref.orderByChild('email').equalTo(credentials.email).once('value')
        .then( snapshot => {
            if(snapshot.val()){
                snapshot.forEach(function(data) {
                    if(isValidPassword(credentials.password, data.val().passwordHash)){
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

export default router;
