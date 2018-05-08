const firebase = require('firebase');
const dotenv = require('dotenv');

dotenv.config();

module.exports = firebase.initializeApp({
    serviceAccount: './skillboard-service-account.json',
    databaseURL: process.env.FIREBASE_DB_URL
  });