//this method is to take in an array medical docs ID
//and output a 2D array in which each smaller array
//contains a single medical document's date, author
//and notes from a local Postgres table
//called documentDataTables that resides on
//a database called auth-system

const getDocumentbyId = (documentID) => {

  const { Pool } = require('pg');
    
  //create a new pool object to connect to the auth-system database
  const pool = new Pool({
  connectionString: 'postgres://postgres@localhost:5432/auth-system'
  });

  //an array that contains date, author and notes
  //this will be returned to whoever call this function
    
  var results = []
  
  const queryText = "SELECT * FROM \"documentDataTables\" WHERE \"documentId\" =" + "'" + documentID + "'";

  //Promise is a proxy for an unknown value
  //that will be reveal to us asynchronously
  return new Promise(function (resolve, reject){
	  pool.query(queryText, (err, res) => {
	      if(err){
		  reject(0);
	      }
	      else{
		  if(res.rows[0] !== []){
		  pool.end;
		  console.log(res);
		  results.push(res.rows[0].documentId);
		  results.push(res.rows[0].patientId);
		  results.push(res.rows[0].date);
		  results.push(res.rows[0].author);
		  results.push(res.rows[0].notes);
		  resolve(results);
		}
	      }
	  })
  })
}

const getPermissions = (user_id) => {
  const { Pool } = require('pg')
  const pool = new Pool({
  connectionString: 'postgres://postgres@localhost:5432/auth-system'
  });
  console.log("HELLLLOOO I AM " + user_id);
  const queryText = "SELECT permissions FROM \"drAndPatients\" WHERE \"id\" = " + "'" + user_id + "'";

   return new Promise(function (resolve, reject){
   	pool.query(queryText, (err, res) => {
     		if(err){
			reject(0);
		}
		else{
			pool.end;
			console.log(res);
			resolve(res.rows[0].permissions);
		}
     	
   	})
   })
}

const addPermissions = (user_id, permissions, documentId) => {
  const { Pool } = require('pg')
  const pool = new Pool({
  connectionString: 'postgres://postgres@localhost:5432/auth-system'
  });
   
  console.log("Username is: " + user_id); 
  //get the current permissions of a user
  var permissions = getPermissions(user_id);
 
  /*if(value != ""){
                var permissions_new = value + "/" + documentId
        }else{
               var permissions_new = documentId;
  	      
  }*/ 
  var permissions_new = "";
  Promise.resolve(permissions).then(value => { 
  	console.log("I have this permission" + value);

 	if(value != ""){
		permissions_new = value + "/" + documentId
  	}else{
		permissions_new = documentId;
	}
	const queryText = "UPDATE \"drAndPatients\" SET \"permissions\" = " + "'" + permissions_new + "'" + " WHERE " + "'" + user_id + "'" + " = id";
	
   	pool.query(queryText)
   	.then((res) => {
     		console.log(res);
     		pool.end();
     		return res;
   	})
   		.catch((err) => {
     		console.log(err);
     		pool.end();
   	})
    })	
}


//this method is only available for patients, not doctors
//since patients have full rights to whomever they want
//to share their medical documents with
const removePermissions = (doctor_id, documentId) => {
  const { Pool } = require('pg')
  const pool = new Pool({
  connectionString: 'postgres://postgres@localhost:5432/auth-system'
  });
    
  //get the current permissions of a user
  var permissions = getPermissions(doctor_id);
  
  Promise.resolve(permissions).then(value => { 
      console.log("I have this permission" + value);
      var permissions_new = value.replace(documentId,"");
      const queryText = "UPDATE \"drAndPatients\" SET \"permissions\" = " + "'" + permissions_new + "'" + " WHERE " + "'" + doctor_id + "'" + " = id";

   	pool.query(queryText)
   	.then((res) => {
     		console.log(res);
     		pool.end();
     		return res;
   	})
   		.catch((err) => {
     		console.log(err);
     		pool.end();
   	})
    })	
}


module.exports = {
    getDocumentbyId,
    addPermissions,
    getPermissions,
    removePermissions
}

