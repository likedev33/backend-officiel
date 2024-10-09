
let mysql = require('mysql');
require('dotenv').config();
// let mysqlHost = process.env.DATABASE_HOST || 'localhost'; // mydb
// let mysqlPort = process.env.MYSQL_PORT || 3306;
let mysqlUser = process.env.DB_USER; // || 'uqfx2551_arezki';        // 'root';           
let mysqlPass = process.env.DB_PASS; // || 'b3ZXqfJlEWxNfjdh2m'; // 'bial3717';   
let mysqlDB   = process.env.DB_NAME; // || 'uqfx2551_gestmedic'; // 'gestmedic';  

let connection = mysql.createConnection({
  port	   : 3306,
  host     : 'localhost', // mydb
  user     : mysqlUser,
  password : mysqlPass,
  database : mysqlDB
});

connection.connect(function(err ) {

    if (err) {
      
    console.log(
      ' --- host :' + connection.host +
    //  ' --- port:' + connection.port + 
      ' --- user:' + connection.user + 
      ' --- password:' + connection.password + 
      ' --- database:' + connection.database);
       
        console.error('error connecting :' + err.stack);
        return;
    }

    console.log('Connected as id '+connection.threadId);
});
connection.end();
module.exports = connection
