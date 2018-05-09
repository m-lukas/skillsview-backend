const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const firebase = require('firebase');
const firebaseInstance = require('../../configs/database');
const dotenv = require('dotenv');

dotenv.config();

var ref = firebaseInstance.database().ref();
var projectRef = ref.child('projects');
var userRef = ref.child('users');

const router = express.Router();

const asyncForEach = async (array,callback) => {
    for(let index = 0; index < array.length; index++){
      await callback(array[index], index, array);
    }
  }

const decodeJWT = token => {
    return jwt.decode(token, process.env.JWT_SECRET);
}

router.post('/', (req, res) => {
    const { token, projectid, first_name, last_name, email, skills } = req.body.data;
    let uid = decodeJWT(token).uid;
    projectRef.child(projectid).once('value').then(async projectSnapshot => {
        let projectData = projectSnapshot.val();
        if(projectData.users.includes(uid)){
            res.status(400).json({ errors: { global: "Already joined!"} });
        }else{
            var newUsersString = projectData.users + "," + uid; 
            projectRef.child(projectid + '/users').set(newUsersString);
            let userObject = {
                first_name: first_name,
                last_name: last_name,
                email: email,
                skills: skills
            }
            await userRef.child(uid + '/projects/' + projectid).set(userObject);
            var userList = [];
            await asyncForEach(newUsersString.split(','), async (user) => {
                let keyNumber = 1;
                let userObject = {key: keyNumber};
                const userData = await userRef.child(user + '/projects/' + projectid).once('value');
                Object.assign(userObject, userData.val());
                userList.push(userObject);
                keyNumber++; 
            });
            res.json({ project: {
                existing: true,
                joined: true,
                projectid: projectid, 
                projectname: projectData.projectname, 
                description: projectData.description, 
                participants: userList, 
                createdBy: projectData.createdBy 
           }});
        }
    });
});

module.exports = router;