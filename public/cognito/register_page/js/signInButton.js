module.exports = function (username, password) {
   
	//initialize these as global variable to make sure
	//other JS files can query the MongoDB to get a user's information
	//
	//var username = document.getElementById("inputUsername").value;
	//var password = document.getElementById("inputPassword").value;
 
	var authenticationData = {
        /*Username : document.getElementById("inputUsername").value,
        Password : document.getElementById("inputPassword").value,
    	*/
	    Username : username,
	    Password : password
	};
	
    	var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    
	var poolData = {
        
	UserPoolId : _config.cognito.userPoolId, // Your user pool id here
        ClientId : _config.cognito.clientId, // Your client id here
    	
	};
	
    	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	
    	var userData = {
        Username : document.getElementById("inputUsername").value,
        Pool : userPool,
    	};
	
    	var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);	
	cognitoUser.authenticateUser(authenticationDetails, {
	onSuccess: function (result) {
			var accessToken = result.getAccessToken().getJwtToken();
			console.log(accessToken);

			//after a user's successfully logged in,
			//he or she will see their user's page
			//
			//window.location.href = "/cognito/profile_page/profile.html";	
        		return true;
	},
        
	onFailure: function(err) {
            alert(err.message || JSON.stringify(err));
	    return false; 
	},
    	
    });

}

