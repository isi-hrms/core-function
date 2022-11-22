const async 		= require('async');
const validator 	= require('../validator');
const procedure 	= require('../procedure');
const library 		= require('../library');

module.exports = (req, callback) => {
	
	return new Promise((resolve, reject) => {
		async.waterfall([
			(next) => {
				/**
				 * Validator check params from client 
				 * @callback Requester~requestCallback
				 * @param {string} req
				 * @param {string} err		The callback that handles the response error.
				 * @param {string} value	The callback that handles the response succes.
				 */
				// validator.notif_lib_val(req.query, (err, value) => {
				// 	if(err) return next(true, value);
				return next(null, {...req});
				// });
				// return next(null, {});
			},
			(value, next) => {

				// INI LIB NOTIFNYA

				/**
				 * EXAMPLE lib notif | tinggal panggil kayak manggil procedure
				 */
				// let val =  {
				// 	ids: "360",
				// 	type: "time",
				// 	employee_id: "2006001",
				// 	local_it: "local",
				// 	user: "sup",
				// 	from_type: "attendance"
				// };
				let val =  {
					_type: value.type, // type request INT
					_employee_id: value.name, // employee_id atau input name yang request atau di request
					_local_it: value.local_it, // local
					_user: value.user, // user
					_from_type: value.from_type, // attendance
					_swap: value.swap, // jika type 6 makan value swap adalah employee_id swap
					_user_login : value.user_login || null // employee_id user login
				};
				// console.log(val, '==== SIAPPPPPPP');
				
				library.notif_leave_only(val, (err, res) => {
					if (err) return next(true, res);
					return next(null, res);
				});
			}
		],

		(error, response) => {
			return callback(response);
		});
	});
};
