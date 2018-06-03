const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const firebase = require('firebase');
const firebaseInstance = require('../configs/database');
const dotenv = require('dotenv');

dotenv.config();

//firebase reference
var authRef = firebaseInstance.database().ref().child('auth');
var userRef = firebaseInstance.database().ref().child('users');

function User(userData){
    this.uid = null;
    this.email = null;
    this.passwordHash = null;
    this.confirmed = false;
    this.confirmationToken = null;  
    
    this.prename = null;
    this.lastname = null;
    this.skills = [];

    this.projects = [];

    this.facebook = null;
    this.twitter = null;
    this.instagram = null;
    this.linkedin = null;
    this.xing = null;

    this.telephone = null;
}

User.prototype.isValidPassword = function(password) {
    return bcrypt.compareSync(password, this.passwordHash);
};

User.prototype.setPassword = function(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

User.prototype.setConfirmationToken = function() {
    this.confirmationToken = this.generateJWT();
};

User.prototype.generateConfirmationUrl = function() {

};

User.prototype.generateUID = function() {
    this.uid = uniqid();
    return this.uid;
}

User.prototype.getUID = function(token) {
    return jwt.decode(token, process.env.JWT_SECRET).uid;
}

User.prototype.generateJWT = function() {
    return jwt.sign(
        {
            email: this.email,
            uri: this.uid,
            confirmed: this.confirmed
        },
        process.env.JWT_SECRET
    );
};

User.prototype.generateResetPasswordLink = function() {

};

User.prototype.genereateResetPasswordToken = function() {

};

User.prototype.load = function() {
    authRef.orderByChild('email').equalTo(this.email).once('value')
        .then( userAuth => {
            //if user account exist
            if(userAuth.val()){
                this.uid = userAuth.key;
                this.email = userAuth.val().email;
                this.passwordHash = userAuth.val().passwordHash;

                userRef.child(this.uid).once('value')
                    .then( userData => {
                        //if user account exist
                        if(userData.val()){
                            this.prename = userData.val().prename ? userData.val().prename : ''; //ToDo: required
                            this.lastname = userData.val().lastname ? userData.val().lastname : ''; //ToDo: required
                            this.skills = userData.val().skills ? userData.val().skills : [];
                            this.facebook = userData.val().facebook ? userData.val().facebook : null;
                            this.twitter = userData.val().twitter ? userData.val().twitter : null;
                            this.instagram = userData.val().instagram ? userData.val().instagram : null;
                            this.linkedin = userData.val().linkedin ? userData.val().linkedin : null;
                            this.xing = userData.val().xing ? userData.val().xing : null;
                            this.telephone = userData.val().telephone ? userData.val().telephone : null;
                        }else{
                            //userData doesn't exists
                        }
                    });

            }else{
                //Email/User doesn't exist
            }
        });    
}

User.prototype.toAuthJSON = function() {
    return {
        email: this.email,
        confirmed: this.confirmed,
        token: this.generateJWT()
    };
};

User.prototype.save = function() {
    authRef.child(this.uid).set({
        email: this.email, 
        passwordHash: this.passwordHash,
        confirmed: this.confirmed
    });
    userRef.child(this.uid).set({
        prename: this.prename,
        lastname: this.lastname,
        skills:  this.skills,
        facebook: this.facebook,
        twitter: this.twitter,
        instagram: this.instagram,
        linkedin: this.linkedin,
        xing: this.xing,
        telephone: this.telephone,
        confirmationToken: this.confirmationToken


    })
    
}

