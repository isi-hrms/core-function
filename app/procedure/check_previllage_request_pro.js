const database = require('../connection/mysql');

module.exports = (id, callback) => {
	database.query(
		'CALL check_api_request_training(?)',
		[id],
		async (err, res) => {
			if (err) return callback(true, 'procedure')
			try {
				let previllage = "user";
				let isSupervisor = res[0][0].supervisor_result;
				let isHr = res[1][0].hr_result;
				let isSuperuser = res[2][0].superuser_result;
				let userData = res[3][0].name;

				if (isSuperuser !== null) previllage = "superSU"
				else if (isHr !== null) previllage = "hr"
				else if (isSupervisor) previllage = "supervisor"

				let dataUser = {
					 employee_name : userData,
					 employee_id : id,
					 status : previllage
				};

				return callback (null, dataUser)
			}
			catch (error) {
				return callback(true, 'procedure')
			}
		}
	);
};
