"use strict";

const mysql = require("mysql2");


class MyMariaDB {
	constructor(host, port, user, password, database) {
		this.host = host;
		this.port = port;
		this.user = user;
		this.password = password;
		this.database = database;
		this.connection = null;
	}


	connectToDB() {
		const connection = mysql.createConnection({
			host 				: this.host,
			port				: this.port,
			user 				: this.user,
			password 			: this.password,
			database 			: this.database,
			multipleStatements 	: true
		});

		connection.connect(err => {
			if(err) return console.log(`${err} mysql error connection`);
		
			const connect = connection.config;
			return console.log(`mysql database success connect to host ${connect.host} and database ${connect.database}`);
		});
		
		connection.on("error", async error => {
			// connection.destroy();
			this.sleep(1000);
			this.connectToDB();
			
		});

		this.connection = connection;
		return connection;
	}

	sleep(ms) {
		return new Promise((resolve) => {
		setTimeout(resolve, ms);
		});
	}

	query(query, data, callback) {
		  if (this.connection) {
			this.connection.query(query, data, async (error, result) => {
			  if (error) {
				// this.__log(__line, {message: error.message}); // logger
				return callback(error, null);
			  } else {
				return callback(null, result);
			  }
			});
		  } else {
			// this.__log(__line, {message: "internal server error"}); // logger
			return callback("internal server error", null);
		  }
	}

	query2(query, callback) {
		  if (this.connection) {
			this.connection.query(query, async (error, result) => {
			  if (error) {
				// this.__log(__line, {message: error.message}); // logger
				return callback(error, null);
			  } else {
				return callback(null, result);
			  }
			});
		  } else {
			// this.__log(__line, {message: "internal server error"}); // logger
			return callback("internal server error", null);
		  }
	}

	query3(query) {
		  if (this.connection) {
			this.connection.query(query, async (error, result) => {
			  if (error) {
				// this.__log(__line, {message: error.message}); // logger
				return error;
			  } else {
				return result;
			  }
			});
		  } else {
			// this.__log(__line, {message: "internal server error"}); // logger
			return "internal server error";
		  }
	}

	beginTransaction(callback) {
		this.connection.beginTransaction((errBeginTrancasction) => {
			if (errBeginTrancasction)
			  return callback(true);
			return callback(false);
		});
	}

	rollback(callback) {
		this.connection.rollback((errRollback) => {
			if (errRollback)
			  return callback(true);
			return callback(false);
		  });
	}

	commit(callback) {
		this.connection.commit((errCommit) => {
			// console.log(errCommit, 'errCommiterrCommiterrCommiterrCommit')
			if (errCommit) callback(true);
			return callback(false);
		});
	}

  
}

module.exports = MyMariaDB;
