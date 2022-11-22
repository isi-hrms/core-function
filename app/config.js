const ENV = process.env;

module.exports = {

	/**
	 * service connection
	 * 
	 * @param	{string}	NODE_PORT
	 * @param	{string}	NODE_HOST
	 */
	port 		: ENV.NODE_PORT || '',
	ip 			: ENV.NODE_HOST || '0.0.0.0',
	_main_url	: '',
	_pages		: 0,


	/**
	 * mysql database connection
	 * 
	 * @param	{string}	DB_HOST
	 * @param	{string}	DB_PORT
	 * @param	{string}	DB_USER
	 * @param	{string}	DB_PASSWORD
	 */
	mysql 	: {
		host 		: ENV.DB_HOST 		|| "0.0.0.0", // ip database
		port 		: ENV.DB_PORT 		|| "3306",
		user 		: ENV.DB_USER 		|| "root",
		password	: ENV.DB_PASSWORD 	|| "asdf1234*",
		database 	: 'db_hrms_prod', // DB
	},
};



