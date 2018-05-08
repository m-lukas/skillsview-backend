const express = require('express');
const firebase = require('firebase');
const firebaseInstance = require('../../configs/database');
const jwt = require('jsonwebtoken');

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
  const { projectid, token } = req.body.data;
  var userList = [];

  projectRef.child(projectid).once('value').then(async snapshot => {
    let projectData = snapshot.val();
    if(projectData){
      var usersString = projectData.users;
      if(usersString.includes(decodeJWT(token).uid)){
        await asyncForEach(usersString.split(','), async (user) => {
          let keyNumber = 1;
          let userObject = {key: keyNumber};
          const userData = await userRef.child(user + '/projects/' + projectid).once('value');
          Object.assign(userObject, userData.val());
          userList.push(userObject);
          keyNumber++;
        });
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
      res.json({
        project: {
          existing: false
        }
      });
    }
  });
});

module.exports = router;