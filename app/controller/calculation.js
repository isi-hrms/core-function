const async 		= require('async');
const library 		= require('../library');

module.exports = (req, callback) => {
	
	async.waterfall([
		(next) => {
			if(req.type == 'perday'){
				var dates = req.date_req;
				library.calculation(req.type,req.dates,req.name,null,null,null,(err, dt)=>{
					if(err) return next(err, null)

					return next(null, dt)
				});
			}else{
				const department = `${req.department}`;
				const subDepartment = `${req.sub_department}`;

				let paramDepartment = {
					department 		 : department,
					sub_department : subDepartment
				};

				if(req.sub_department == null || req.sub_department == undefined) {
					paramDepartment = {
						department : department
					};
				};

				library.calculation(req.type, req.name, req.employee_id, req.dates, req.job, paramDepartment, req.batch, req.localit,(err, dt)=>{
					//console.log(err,dt, 9090)
					if(err) return next(err, null)

					return next(null, dt)
				});
			}
		}
	],
	(error, response) => {
		/**
		 * handle error
		 */
		if(error) {
			let data = {
                header: {
                    status: 500,
                    message: error,
                    access: {
                        create: 1,
                        read: 1,
                        update: 1,
                        delete: 1
                    }
                },
                data: error,
			};
			return callback(data, null);
		};


		let data = {
			header: {
				status 	: 200,
				message : 'Success.',
				access:  {
					create	: 1,
					read	: 1,
					update	: 1,
					delete	: 1
				}
			},
			data: response,
		};
		return callback(null, data);
	});
};