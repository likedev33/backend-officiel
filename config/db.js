
let mysql = require('mysql');
require('dotenv').config();

let mysqlPort = 3306; 			// process.env.DB_PORT; 
let mysqlHost = 'localhost';	// process.env.DB_HOST; 
let mysqlUser = 'arezki';		// process.env.DB_USER; 
let mysqlPass = process.env.DB_PASS; 
let mysqlDB   = 'logimac_bd';	// process.env.DB_NAME;

const connection = async() => {
	try {
		mysql.createConnection({
		  port	   : mysqlPort,
		  host     : mysqlHost,
		  user     : mysqlUser,
		  password : mysqlPass,
		  database : mysqlDB
		});
		console.log('Système connecté');
	} catch (err) {
		console.log(
		  ' --- host :' + connection.host +
		  ' --- user:' + connection.user + 
		  ' --- password:' + connection.password + 
		  ' --- database:' + connection.database);
			console.error('error connecting :' + err.stack);
			return;
	}
}
module.exports = connection
