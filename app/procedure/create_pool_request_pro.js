const database = require('../connection/mysql');
const { concat } = require('async');

module.exports = (data, callback) => {
	let type_id = null;
	if (data.type.toUpperCase() === "OVERTIME") type_id = 3;
	else if (data.type.toUpperCase() === "UNDERTIME") type_id = 4;
	database.query(
		'CALL insert_pool_request(?,?,?,?,?)',
		[data.id, data.lastId.idAttSchedule, JSON.stringify(data.jsonData), type_id, 1],
		async (err, res) => {
			if (err) return callback(true, 'procedure')
			try {
				return callback (null, [])
			}
			catch (error) {
				return callback(true, 'procedure')
			}
		}
	);
};
