var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');
//var signInCognito = require('../public/cognito/js/signInButton');

// create a sequelize instance with our local postgres database information.
var sequelize = new Sequelize('postgres://postgres@localhost:5432/auth-system');

// setup User model and its fields.
//we have users for including username, email, hashed password
//users_2 for username, email and not password because it is handled by cognito
var Document = sequelize.define('documentDataTable', {
    documentId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    patientId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    date: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    author: {
	type: Sequelize.STRING,
	unique: false,
	allowNull: true
    },
    notes: {
	type: Sequelize.STRING,
	unique: false,
	allowNull: true
    }
});

// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = Document;
