import express from 'express';
import jwt from 'jsonwebtoken';
import firebase from 'firebase';
import { firebaseInstance } from '../../configs/database';

var ref = firebaseInstance.database().ref().child('projects');

const router = express.Router();

const decodeJWT = token => {
    return jwt.decode(token, process.env.JWT_SECRET);
}

router.post('/', (req, res) => {
    const { projectname, description } = req.body.data;
    const { projectid, createdBy } = req.body.addition;
    ref.child(projectid).once('value')
        .then( snapshot => {
            if(snapshot.val()){
                res.status(400).json({ errors: { global: "Project-id already taken!"} });
            }else{
                let uid = decodeJWT(createdBy).uid;
                let projectObject = {
                    projectname: projectname,
                    description: description,
                    createdBy: uid,
                    users: ''
                }
                ref.child(projectid).set(projectObject);
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

export default router;