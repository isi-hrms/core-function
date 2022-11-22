const database = require('../connection/mysql');
const config   = require('../config.js');

module.exports = (data, callback) => {
	database.query(
		'CALL view_att_swap_shift_by_id(?,?)', [data.emp_id, data.ids],
		(err, res) => {
			if(err) return callback(true, err.sqlMessage);
			return callback(null, res);
	});
};
