const async 		= require('async');
const fs 			= require('fs');
const validator 	= require('../validator');
const library		= require('../library');
const procedure 	= require('../procedure');

module.exports = (req, callback) => {
	async.waterfall([
		(next) => {
			/**
			 * Validator check params from client 
			 * @callback Requester~requestCallback
			 * @param {string} req
			 * @param {string} err		The callback that handles the response error.
			 * @param {string} value	The callback that handles the response succes.
		 	 */
			
			//  validator.delete_photograph({...req.query, ...req.params}, (err, value) => {
            //     if (err) return next(true, value)
            // 	 next(null, value);
			//  });
			const exampleData =  {
				js: {
					req_flow: {},
					hrx_comp: {},
					supx_comp: {}
				},
				EXP_WHOIAM: 2006003,
				RES: {
					name: 2006001
				},
				TYP_ID: '',
				comment_id: ''
			}
			next(null, exampleData);
		},
		(value, next) => {
			/**
			 * JSON read
			 * @callback Requester~requestCallback
			 * @param {string} value
			 * @param {string} err		The callback that handles the response error.
			 * @param {string} res		The callback that handles the response succes.
			*/

			library.pool_update(value, (err, res) => {
				// console.log("TESLA", res, err);
				if (err) return next(true, err);
				return next(null, res)
			})
		
        },
	],
	(error, response) => {
		/**
		 * handle error
		 */
		if(error) {
			let data = {
				header: {
					status 	: 500,
					message : response,
				},
				data: null,
			};
			return callback(data);
		};
        
		let data = {
			header: {
				message : 'Pool Update Successfully.',
                status 	: 200,
			},
			data: response
		};
		return callback(data);
	});
};
