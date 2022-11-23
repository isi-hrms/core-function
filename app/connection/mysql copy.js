const mysql 	= require('mysql2');
const database 	= require('../config').mysql;
var ip = require("ip");

const ipList = ['10.129.1.12', '10.129.1.18', '10.129.1.14','192.168.1.12'];
const passList = ['asdf1234*', 'P@ss1234**'];
const userList = ['root', 'isilabs'];
let currentip = ip.address();
let ipIndex = ipList.indexOf(currentip);

if (ipIndex === 0) {
	database.host = ipList[0]
	database.user = userList[1];
	database.password = passList[0];
} else if (ipIndex === 1) {
	database.host = ipList[1]
	database.user = userList[1];
	database.password = passList[1];
}  else if (ipIndex === 2) {
	database.host = ipList[0]
	database.user = userList[1];
	database.password = passList[0];
} else  {
	database.host = ipList[3]
	database.user = userList[0];
	database.password = passList[0];
}

/**
 * create connection to mysql database
 */
const connection = mysql.createConnection({
	host 				: database.host,
	port				: database.port,
	user 				: database.user,
	password 			: database.password,
	database 			: database.database,
	multipleStatements 	: true
});


connection.connect(err => {
	
	if(err) return console.log(`${err} mysql error connection`);

	const connect = connection.config;
	return console.log(`mysql database success connect to host ${connect.host} and table ${connect.database}`);
});

module.exports = connection;
