//window is for when the script
//to authenticate against cognito

//export this to be used by JS scripts
//called by a nodeJS app
module.exports  = {
    cognito: {
        userPoolId: '<userPoolId>', 
        region: 'us-east-1', //can be something like us-east-1
        clientId: '<clientId>' // you get this from creating an app client
    },
};
