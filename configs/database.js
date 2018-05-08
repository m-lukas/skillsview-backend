import firebase from 'firebase';
import dotenv from 'dotenv';

dotenv.config();

export const firebaseInstance = firebase.initializeApp({
    serviceAccount: './skillboard-service-account.json',
    databaseURL: process.env.FIREBASE_DB_URL
  });