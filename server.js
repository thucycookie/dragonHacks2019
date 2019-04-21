//express does not come with node
//so we had to installed it with npm
//we also ran npm init
//npm install -s express to save express as one of the
//dependencies in package.json which serves as the package management file
//for other users
//
var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var morgan = require('morgan')
var cognito = require('./public/cognito/js/cognito.js')
var path = require('path');
var queries = require('./public/cognito/js/queries.js')

//this is needed to create a user model
//that can be then created in the POSTGRES
//auth-system table in the postgres DB
//
var User = require('./model/user')

//this is needed to create a document mode
//that can be then created in POSTGRES
//auth-system table in the postgres DB
var Document = require('./model/document')

//invoke an instance of the express application
var app = express()

// set our application port
app.set('port', 4000);

//use EJS template engine to serve html files dynamically
//
app.set('view engine', 'ejs')

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {

	var dr_or_patient = req.body.dr_or_patient;

	if(dr_or_patient == "doctor"){

	    res.redirect('/dashboard_doctor');

	}else if(dr_or_patient == "patient"){

            res.redirect('/dashboard_patient')

	}

    } else {

	next();

    }    

};

//load static files like css and other JS
//for EJS files that were once HTML
//with static files developed with it
app.use(express.static(__dirname + '/public/main'));
app.use(express.static(__dirname + '/public/cognito/js/'));
app.use(express.static(__dirname + '/public/cognito/register_page/'));
app.use(express.static(__dirname + '/public/cognito/login_page/Login_v4/'));
app.use(express.static(__dirname + '/public/cognito/dashboard_doctor/'));
app.use(express.static(__dirname + '/public/cognito/dashboard_patient/'));
app.use(express.static(__dirname + '/public/cognito/diagnosis/'))
app.use(express.static(__dirname + '/public/cognito/share_page/share.ejs'))
app.use(express.static(__dirname + '/public/cognito/remove_page/remove.ejs'))

// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/main');
});

app.route('/main')
    .get(sessionChecker, (req, res) => {
    	res.render(__dirname + '/public/main/index.ejs'); 
    })

// route for user registration
app.route('/register')
    .get(sessionChecker, (req, res) => {
        res.render(__dirname + '/public/cognito/register_page/register.ejs', {message:null});
     })
    .post((req, res) => {
	//the register function will return a message (password do not match, password is too weak or null)
	message = cognito.register(req.body.id, req.body.email, req.body.password, req.body.confirmPassword);
	
	if(message == "Password Do Not Match!" || message == "Weak password!"){
		res.redirect(__dirname + '/public/cognito/register_page/register.ejs', {message:message});
	}

	User.create({
            	firstName: req.body.firstName,
		lastName: req.body.lastName,
            	email: req.body.email,
		id: req.body.id,
		dr_or_patient: req.body.dr_or_patient,
		permissions: "",
		social_security: req.body.social_security
	})
        .then(user => {
	    res.redirect("/signin");
	    //res.redirect(__dirname + '/public/cognito/register_page/register.ejs', {message: "Please check your email for a verification link."});
	
	})
        .catch(error => {
            res.redirect('/register');
        });
    });


// route for user login
app.route('/signin')
    .get(sessionChecker, (req, res) => {
        res.render(__dirname + '/public/cognito/login_page/Login_v4/login.ejs', {message: null});
    })
    .post((req, res) => {
        var email = req.body.email;
        var password = req.body.password;
        var dr_or_patient = req.body.dr_or_patient;

	User.findOne({ where: { email: email } }).then(function (user) {
            if (!user) {
                res.redirect('/signin');
		console.log(`User ${req.body.email} is not registered`);	
	    } else if (cognito.signIn(email, password) == false) {
                console.log("Wrong password");
		res.redirect('/signin');
            } else {
                req.session.user = user.dataValues;
		console.log("Successfully signed in.");
		
		//redirect to either dr or patient dashboard
		if(dr_or_patient == "Doctor"){
                	res.redirect('/dashboard_doctor');
            	}else if(dr_or_patient == "Patient"){
			res.redirect('/dashboard_patient')
		}

	    }
        });
    }); 

// route for user's dashboard
app.get('/dashboard_doctor', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
	
	var id = req.session.user.id;

	//since the permissions string is formatted in id_1/id_2/id_3
	//we split it with the / separator
	var permissions = req.session.user.permissions.split("/");

	//var sharedNotes is an array that contains all 
	//the documentID that is shared with a doctor
	var sharedNotes = [];
	//console.log(permissions);	

	if(permissions != ""){
	    //getDocumentbyId is a function that takes in a document ID
	    //query the data table that contains the document data table
	    //for the row that matches the document ID
	    //and return the result in the form of a JSON string
	    //in which the JSON string contains all the necessary information
	    //
	    for(var i = 0; i < permissions.length; i++){
		sharedNotes.push(queries.getDocumentbyId(permissions[i]))
	    }

	    //after sharedNotes done pushing values returned by getDcoumentbyID function
	    //the elements will be in [object Promise] values
	    //we use Promise.all to iterate through each of these elements
	    //and return the real values
	    Promise.all(sharedNotes).then(values => {
		console.log("Values are " + values);
		var data = [[]]
		
		//values is an array that is 1D so we need to reorganize it back into
		//2D
		for(var i = 0; i < values.length; i += 5){
		    data.push([]);
		    data[i].push(values[i]);
		    data[i].push(values[i + 1]);
		    data[i].push(values[i + 2]);
		    data[i].push(values[i + 3]);
		    data[i].push(values[i + 4]);
		}
		res.render(__dirname + '/public/cognito/dashboard_doctor/dashboard_doctor.ejs', {message:null,data:data});
	    })

	}else{
	    res.render(__dirname + '/public/cognito/dashboard_doctor/dashboard_doctor.ejs',{message:null,data:null})
	}
	
    } else {
	console.log("Sorry");
        res.redirect('/');
    }
});

// route for diagnosis page (for doctors only)
app.get('/diagnosis', (req,res) => {
    if (req.session.user && req.cookies.user_sid) {
	
	console.log("Logging into diagnostic endpoint!")
	res.render(__dirname + '/public/cognito/diagnosis/diagnosis.ejs',{message:null})
		
    }else{
	console.log("Sorry");
	res.redirect('/');
	
    }	
})

app.post('/diagnosis_submit',(req, res) => {
    	
    if (req.session.user && req.cookies.user_sid) {
        console.log(req.cookies.user_sid);
	
	//if a patient tries to access the diagnosis, it will send them
	//back to the patient endpoint
	if(req.session.dr_or_patient != "Doctor"){
	    res.redirect("/");
	}
	
	//Dr ID and permissions
        var doctor_id = req.session.user.id;

	// document ID is randomly generated 
	var documentId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);

	//re-generate if documentID matches up with another document
	//in the data table
	//????
	
	//Add into the permission column's string of a doctor
	//to allow whether he or she has viewing permission
        var permissions = req.session.user.permissions;

	//get patient Id so permission can be added       
	var patient_id = req.body.patientId;
 
	//create a document model and post in the postgres data base
	Document.create({
            documentId: documentId,
            date: JSON.stringify(new Date()),
	    author: doctor_id,
	    patientId: req.body.patientId,
	    notes: req.body.notes
	})
        .then(doc => {
	    //since this is the first that the note
	    //is created, the default is that the author
	    //has permission to read it
	    queries.addPermissions(doctor_id, permissions, documentId);	    
	    queries.addPermissions(patient_id, permissions, documentId);
            console.log("Permission added successfully");
	    //res.redirect("/dashboard_doctor");
	})
        .catch(error => {
	    console.log(error);
        });

	} else {
        console.log("Sorry");

	}
});

// route for patient's dashboard
// similar to doctor but the ejs template will have a share or unshare button
//
app.get('/dashboard_patient', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
	console.log(req.cookies.user_sid);
	
	var id = req.session.user.id;

	//since the permissions string is formatted in id_1/id_2/id_3
	//we split it with the / separator
	var permissions = req.session.user.permissions.split("/");

	//var sharedNotes is an array that contains all 
	//the documentID that is shared with a doctor
	var sharedNotes = [];

	if(permissions != ""){
	    //getDocumentbyId is a function that takes in a document ID
	    //query the data table that contains the document data table
	    //for the row that matches the document ID
	    //and return the result in the form of a JSON string
	    //in which the JSON string contains all the necessary information
	    //
	    for(var i = 0; i < permissions.length; i++){
		sharedNotes.push(queries.getDocumentbyId(permissions[i]))	
	    }

	    //after sharedNotes done pushing values returned by getDcoumentbyID function
	    //the elements will be in [object Promise] values
	    //we use Promise.all to iterate through each of these elements
	    //and return the real values
	    Promise.all(sharedNotes).then(values => {
		var data = [[]]

		//values is an array that is 1D so we need to reorganize it back into
		//2D
		
		for(var i = 0; i < values.length; i += 5){
		    data.push([]);
		    data[i].push(values[i]);
		    data[i].push(values[i + 1]);
		    data[i].push(values[i + 2]);
		    data[i].push(values[i + 3]);
		    data[i].push(values[i + 4]);
		}

		res.render(__dirname + '/public/cognito/dashboard_patient/dashboard_patient.ejs', {message:null,data:data});
	    })
	}else{
	    	res.render(__dirname + '/public/cognito/dashboard_patient/dashboard_patient.ejs', {message:null,data:null});
	}

    } else {

	console.log("Sorry");
        res.redirect('/');

    }
});

//route for the share endpoint (this is when the submit button is selected)
//this for handling the post request
app.post('/share', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        console.log(req.cookies.user_sid);
	
	//Doctor's ID that the user want to share his/her record with
	var shareId = req.body.shareId;	
	var documentId= req.body.documentId;
	console.log("The documentIds are " + documentId);

	//add permission for the doctor ID
	queries.addPermissions(doctor_id, queries.getPermissions(shareId), documentId);	

    }
})

// route for user logout
app.get('/signout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});

// route for setting
app.get('/setting', (req, res) => {

    //stuff for rendering setting page goes here
    //
    if (req.session.user && req.cookies.user_sid) {
        console.log(req.cookies.user_sid);

        var username = req.session.user.email;

	res.render(__dirname + '/public/setting/setting.ejs', {username:username});
    } else {
        console.log("Sorry");
        res.redirect('/');
    }
})

// route for profile
app.get('/profile', (req, res) => {
	if(req.session.user && req.cookies.user_sid) {
		console.log(req.cookies.user_sid);
		res.render(__dirname + '/public/profile/profile.ejs', {username:username});
	}else {
		console.log("Lost cookie");
		res.redirect('/');
	}
})

// route for profile
app.get('/shareNotes', (req, res) => {
	if(req.session.user && req.cookies.user_sid) {
		console.log(req.cookies.user_sid);
		res.render(__dirname + '/public/cognito/share_page/share.ejs');
	}else {
		console.log("Lost cookie");
		res.redirect('/');
	}
})

//share a note
app.post('/share_submit',(req, res) => {
    	
    if (req.session.user && req.cookies.user_sid) {
        console.log(req.cookies.user_sid);
		
	//Patient ID and permissions
        var patient_id = req.session.user.id;
	
	//Dr ID
	var doctor_id = req.session.doctorId;

	//Document ID
	var document_id = req.session.documentID;
	    
	//find the doctor's permissions
	var permissions = queries.getPermissions(doctor_id);
	    
	//add the documentID into the doctor's permissions
	queries.addPermissions(doctor_id, permissions, document_id)
	res.redirect("/dashboard_patient");
    }
})

//remove read permission for a note
app.post('remove_note',(req, res) => {
    if (req.session.user && req.cookies.user_sid){
	
	//Dr ID
	var doctor_id = req.session.doctorId;

	//document ID
	var document_id = req.session.documentID;

	//find the doctor's permissions
	var permissions = queries.getPermissions(doctor_id);
	
	queries.removePermissions(doctor_id, permissions, document_id)
    }
})	 


// route for handling 404 requests(unavailable routes)                             
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


// start the express server   
//
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));
