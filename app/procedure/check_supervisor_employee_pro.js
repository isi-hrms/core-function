const database = require('../connection/mysql');

module.exports = (data, callback) => {
	database.query(
		'CALL view_emp_supervisor(?)',
		[data.id],
		async (err, res) => {
			if (err) return callback(true, 'procedure')
			try {
				return callback (null, res[0])
			}
			catch (error) {
				return callback(true, 'procedure')
			}
		}
	);
};
