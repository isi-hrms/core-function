/** @format */

const async = require('async');
const procedure = require('../procedure');
const library = require('../library');

const method = 'get';
const formName = 'Employee Status';
const buildResponse = require('../library').response;

module.exports = (req, callback) => {
    const query = req.query || null;
    const body = req.body || null;
    const param = req.params || null;

    const data = {
        query,
        body,
        param,
    };

    async.waterfall(
        [
            /**
			 * CHECK PREVILLAGE REQUESTOR
			 */
			(next) => {
				let employeeId = helper.decodeKey(req.query.key);
				procedure.check_previllage_request_pro(employeeId, (err, value) => {
					if (err) return next(true, value);
					data.privillage = value;
					return next(null, data);
				});
			},
			/**
			 * CHECK PREVILLAGE REQUESTOR TO EMPLOYEE
			 */
			(data, next) => {
				if (data.privillage.status.toUpperCase() === "USER") {
					if(data.id === data.privillage.employee_id) return next(null, data);
					else return next('access denied', null);
				} else if (data.privillage.status.toUpperCase() === "SUPERVISOR") {
					procedure.check_supervisor_employee_pro(data, (err, value) => {
						if(err) return next(true, value);
						else {
							let isSupervisor = value.findIndex( x => x.emp_supervisor === data.privillage.employee_id);
							if (isSupervisor !== -1) return next(null, data);
							else return next('access denied', null);
						}
					});
				} else if (data.privillage.status.toUpperCase() === "HR" || data.privillage.status.toUpperCase() === "SUPERSU") {
					if (data.id === data.privillage.employee_id && data.privillage.status.toUpperCase() === "SUPERSU") return next('access denied', null)
					else return next(null, data)
				} else return next('access denied', null)
			},
        ],
        (error, results) => {

            /**
             * handle error
             */
            if(error) {
                let data = {
                    header: {
                        status 	: 500,
                        message : error,
                    },
                    data: null,
                };
                return callback(data);
            };
            
            let data = {
                header: {
                    message : results.message,
                    status 	: 200,
                },
                data: results
            };
            return callback(data);

            },
    );
};
