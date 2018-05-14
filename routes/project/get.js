const express = require('express');
const firebase = require('firebase');
const firebaseInstance = require('../../configs/database');
const jwt = require('jsonwebtoken');

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
  const { projectid, token } = req.body.data;
  var userList = [];
  projectRef.child(projectid).once('value').then(async snapshot => {
    let projectData = snapshot.val();
    //if project exists
    if(projectData){
      //get users string from snapshot
      var usersString = projectData.users;
      //if user joined project
      if(usersString.includes(decodeJWT(token).uid)){
        //create userObject for each user with data from user reference
        await asyncForEach(usersString.split(','), async (user) => {
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
        res.json({ 
          project: {
            existing: true,
            joined: true, 
            projectid: projectData.projectid, 
            projectname: projectData.projectname, 
            description: projectData.description, 
            participants: userList, 
            createdBy: projectData.createdBy 
          }
        });
      }else{
        //respond with limited project data for join screen
        res.json({ 
          project: {
            existing: true,
            joined: false, 
            projectid: projectid,
            projectname: projectData.projectname,
            description: projectData.description
          }
        });
      }
    }else{
      //project does not exist
      res.json({
        project: {
          existing: false
        }
      });
    }
  });
});

module.exports = router;