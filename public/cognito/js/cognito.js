//import all the necessary AWS Cognito 
//modules
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');
const _config = require('./config');

//alert has been commented out because it is aa property
//of the window objects and only available when executing
//in special context of browser windows

//template for writing a function 
//and exports it

/*const nameOfFunction = (params) => {
	content of the function with params passed in
} */

//to export
//
/*
	module.exports = {
		nameOfFunction
	} 

*/

//define pool info
//loading in credential through config.js file
const poolData = {
	UserPoolId: _config.cognito.userPoolId, // Your user pool id here
	ClientId: _config.cognito.clientId //Your client id here
};

//initiate the user pool
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

//function to check password strength
const validatePassword = (password) => {
	var p = password,
        errors = [];
    if (p.length < 8) {
        errors.push("Your password must be at least 8 characters"); 
    }
    if (p.search(/[a-z]/i) < 0) {
        errors.push("Your password must contain at least one letter.");
    }
    if (p.search(/[A-Z]/i) < 0) {
        errors.push("Your password must contain at least one letter.");
    }
    if (p.search(/[0-9]/) < 0) {
        errors.push("Your password must contain at least one digit."); 
    }
    if (errors.length > 0) {
        errors.join("\n");
        return false;
    }
    return true;
}

//function to register users
const register = (username, email, password, confirmPassword) => {
	
	if(password != confirmPassword){
		//alert("Password Do Not Match!");
		//throw("Password Do Not Match!");
		return "Password Do Not Match!";
	}

	if(!validatePassword(password)){
		//throw("Weak password!");
		return "Weak password!";
	}
	//Username, email and password for now
	var attributeList = [];
	attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:email}));
	attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:username}));
	userPool.signUp(email, password, attributeList, null, function(err, result){
	
	if(err){
			//alert(err.message || JSON.stringify(err));
		    if(err['code'] == "UsernameExistsException"){
			return "This email has been used already";
		    }
			return;
		}
		
		cognitoUser = result.user;
		console.log("The username is " + cognitoUser.getUsername());
		
		//in server.js, res.render will change the element of
		//register page to say to check an email to verify registered
		//email
		//
	})
	

}

//function to login
const signIn = (username, password) => {
	
	var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        	Username : username,
        	Password : password,
    	});

    	var userData = {
        	Username : username,
        	Pool : userPool
    	};

	var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    	
	cognitoUser.authenticateUser(authenticationDetails, {
        	onSuccess: function (result) {
            	console.log('access token + ' + result.getAccessToken().getJwtToken());
            	console.log('id token + ' + result.getIdToken().getJwtToken());
            	console.log('refresh token + ' + result.getRefreshToken().getToken());
        	return true;
	},

        onFailure: function(err) {
            	//alert(err.message || JSON.stringify(err));
		//return false; 
		console.log(err);
		return false;
        },

    });
}

//function to update user's attributes
const update = (username, password) => {
	
	var attributeList = [];

	//possibly receive and decode a post request
	//from a parameter called req in the function
	attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
            Name: "name",
            Value: "some new value"
        }));

	var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password,
        });

        var userData = {
            Username: username,
            Pool: userPool
        };

        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.updateAttributes(attributeList, (err, result) => {
            if (err) {
                //handle error
            
	     	} else {
                	console.log(result);
                }
            });

}

//function to delete a user, maybe trigger by a post request
//after hitting a deleteAccount button?
const deleteUser = (username, password) => {
	
	var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password,
        });

        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                cognitoUser.deleteUser((err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully deleted the user.");
                        console.log(result);
                    }
                });
            },
            onFailure: function (err) {
                console.log(err);
            },
        });

}

//function to change password
const changePassword = (username, password, newPassword) => {
        
	var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password,
        });

        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                cognitoUser.changePassword(password, newpassword, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully changed password of the user.");
                        console.log(result);
                    	
			//change something on the ejs template
                    	//letting user to know their password
                    	//has been changed
                    	//in server.js 
		    }
                });
            },
            onFailure: function (err) {
                console.log(err);
            },
        });

}

//export all the functions for use
module.exports = {
	register,
	signIn,
	update,
	deleteUser,
	changePassword,
}
