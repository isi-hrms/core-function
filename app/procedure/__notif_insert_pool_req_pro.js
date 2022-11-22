const database = require('../connection/mysql');
const config   = require('../config.js');

module.exports = (data, callback) => {
	database.query(
		'CALL insert_pool_request2(?,?,?)', [data.employee_id, data.ids, data.json_arr],
		(err, res) => {
			if(err) return callback(true, err.sqlMessage);
			return callback(null, res);
	});
};
