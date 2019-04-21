var data = { 
	UserPoolId : _config.cognito.userPoolId,
        ClientId : _config.cognito.clientId
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();
	
window.onload = function(){
if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
          if (err) {
               alert(err);
               return;
          }
          console.log('session validity: ' + session.isValid());

	//Set the profile info
	cognitoUser.getUserAttributes(function(err, result) {
	if (err) {
		console.log(err);
		return;
	}

	console.log(result);
	document.getElementById("email_value").innerHTML = result[2].getValue();	
	});			
			
        });
    }
}
function signOut(){
	    if (cognitoUser != null) {
               cognitoUser.signOut();	  
    }
}
