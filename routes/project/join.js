const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const firebase = require('firebase');
const firebaseInstance = require('../../configs/database');
const dotenv = require('dotenv');

dotenv.config();

//define main firebase reference
var ref = firebaseInstance.database().ref();

//action-specific firebase references
var projectRef = ref.child('projects');
var userRef = ref.child('users');

const router = express.Router();

//custom function to add async forEach
const asyncForEach = async (array,callback) => {
    for(let index = 0; index < array.length; index++){
      await callback(array[index], index, array);
    }
  }

//function to decode jsonwebtoken
const decodeJWT = token => {
    return jwt.decode(token, process.env.JWT_SECRET);
}

router.post('/', (req, res) => {
    const { token, projectid, first_name, last_name, email, skills } = req.body.data;
    //get user uid from jsonwebtoken
    let uid = decodeJWT(token).uid;
    projectRef.child(projectid).once('value').then(async projectSnapshot => {
        let projectData = projectSnapshot.val();
        //if user already joined project
        if(projectData.users.includes(uid)){
            res.status(400).json({ errors: { global: "Already joined!"} });
        }else{
            var newUsersString = "";
            //add uid to userString in project reference
            if(projectData.users === ""){
                newUsersString = uid;     
            }else{
                newUsersString = projectData.users + "," + uid; 
            }
            //set edited project userString to project
            projectRef.child(projectid + '/users').set(newUsersString);
            //create new project-specific user data object
            let userObject = {
                first_name: first_name,
                last_name: last_name,
                email: email,
                skills: skills
            }
            //add project-specific userObject in database
            await userRef.child(uid + '/projects/' + projectid).set(userObject);
            var userList = [];
            //create userObject for each user with data from user reference
            await asyncForEach(newUsersString.split(','), async (user) => {
                let keyNumber = 1;
                let userObject = {key: keyNumber};
                const userData = await userRef.child(user + '/projects/' + projectid).once('value');
                //add received user data to userObject
                Object.assign(userObject, userData.val());
                //add userObject to userList
                userList.push(userObject);
                //dynamic key
                keyNumber++; 
            });
            //respond with project data
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