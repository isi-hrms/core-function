const database = require('../connection/mysql');
const config   = require('../config.js');

module.exports = (data, callback) => {
	database.query(
		'CALL view_emp_subordinate_by_id(?)', [data],
		(err, res) => {
			if(err) return callback(true, err.sqlMessage);
			return callback(null, res);
	});
};
