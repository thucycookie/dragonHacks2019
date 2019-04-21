var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');
//var signInCognito = require('../public/cognito/js/signInButton');

// create a sequelize instance with our local postgres database information.
var sequelize = new Sequelize('postgres://postgres@localhost:5432/auth-system');

// setup User model and its fields.
//we have users for including username, email, hashed password
//users_2 for username, email and not password because it is handled by cognito
var User = sequelize.define('drAndPatient', {
    firstName: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    id: {
	primaryKey: true,
	type: Sequelize.STRING,
	unique: false,
	allowNull: false
    },
    dr_or_patient: {
	type: Sequelize.STRING,
	unique: false,
	allowNull: false
    },
    social_security: {
	type: Sequelize.STRING,
	unique: false,
	allowNull: false
    },
    permissions: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true
    },
    /*password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}
, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },*/ 
    /*instanceMethods: {
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      }
    }*    
    /*User.prototype.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
    };}*/
});

/*User.prototype.validPassword = function (password) {
	//console.log("This" + this.password);
	//console.log("Second" + password);                                                      
        return bcrypt.compareSync(password, this.password);                                                     
};*/

/*User.prototype.validCognitoPassword = function (username, password) {
        return signInCognito(username, password); 
};*/

// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = User;
