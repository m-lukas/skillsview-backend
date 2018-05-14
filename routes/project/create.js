const express = require('express');
const jwt = require('jsonwebtoken');
const firebase = require('firebase');
const firebaseInstance = require('../../configs/database');

//define firebase reference
var ref = firebaseInstance.database().ref().child('projects');

const router = express.Router();

//function to decode jsonwebtoken
const decodeJWT = token => {
    return jwt.decode(token, process.env.JWT_SECRET);
}

router.post('/', (req, res) => {
    const { projectname, description } = req.body.data;
    const { projectid, createdBy } = req.body.addition;
    ref.child(projectid).once('value')
        .then( snapshot => {
            //if project is already created
            if(snapshot.val()){
                res.status(400).json({ errors: { global: "Project-id already taken!"} });
            }else{
                //get user uid from jsonwebtoken
                let uid = decodeJWT(createdBy).uid;
                //new project object
                let projectObject = {
                    projectname: projectname,
                    description: description,
                    createdBy: uid,
                    users: ''
                }
                //write new project in database
                ref.child(projectid).set(projectObject);
                //respond with project data
                res.json({ project: {
                    existing: true,
                    joined: false,
                    projectid: projectid, 
                    projectname: projectname,
                    description: description
                }});
            }
        });
});

module.exports = router;