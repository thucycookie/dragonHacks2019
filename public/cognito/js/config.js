//window is for when the script
//to authenticate against cognito
//is embedded within a HTML file
/* window._config = {
    cognito: {
        userPoolId: 'us-east-1_7HGB1clTd', // old --> 'us-east-1_Ev41J1ws2',
        region: 'us-east-1', 
	clientId: '6rvgt9q5icn4d5i63iku0t64s2' // old --> '7fl7ma113g1ctvik1v5660aogh' 
    },
}; */

//export this to be used by JS scripts
//called by a nodeJS app
module.exports  = {
    cognito: {
        userPoolId: 'us-east-1_7HGB1clTd', // old --> 'us-east-1_Ev41J1ws2',
        region: 'us-east-1',
        clientId: '6rvgt9q5icn4d5i63iku0t64s2' // old --> '7fl7ma113g1ctvik1v5660aogh'
    },
};
