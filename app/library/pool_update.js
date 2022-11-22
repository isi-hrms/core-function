const async     = require('async');
const database  = require('../connection/mysql');
const config    = require('../config.js');
const procedure = require('../procedure');
const moment 	= require('moment');

module.exports = async (data, callback) => {

	/**
	 * Algorithm
	 * 0. get hr form db
	 * 1. Check id is int
	 * 2. Check id is available in table
	 */
    async.waterfall([
		(next) => {
			(async function(){
				try {
					const {js, EXP_WHOIAM, RES, TYP_ID, comment_id} = data;
					const [ [_super], 
							[_sup], 
							[_hr], 
							[_it_director]
					] = await Promise.all([
						procedure.procedure_super(data),
						procedure.procedure_sup(data),
						procedure.procedure_hr(data),
						procedure.procedure_it_director(data)
					]);
					let _user = null;

					if (_sup) _user = 'sup';
					else if (_hr) _user = 'hr';
					else if (_super) _user = 'hr';
					else if (_it_director) _user = 'hr';
	
					if (js) _model = 'success';
	
					if( RES['name'] !== EXP_WHOIAM ){
						js['req_flow']['employee'] = RES['name'];
						js['req_flow']['employee_approve'] = 'o';
						js['req_flow']['employee_dates'] = null;
						js['req_flow']['employee_times'] = null;
						js['req_flow']['employee_requestor'] = [EXP_WHOIAM, _user];
					};
	
					// const _idx = Object.keys(js['hrx_comp'])
					function array_search(value, obj){
						return Object.keys(obj).filter(val => obj[val] === value)[0];
					}
					const _idx = array_search(EXP_WHOIAM, js['hrx_comp']);
	
					if(!Number.isInteger(_idx)) array_search(EXP_WHOIAM, js['supx_comp']);
	
					if ((Number.isInteger(_idx) || _idx === 0) && _user && EXP_WHOIAM !== '20148888'){
						dt = moment(new Date()).format('YYYY-MM-DD HH:mm:ss a');
						exp = dt.split(' ');
						js[_user][idx][EXP_WHOIAM] = 1;
						js[_user][idx][`${_user}_stat`] = 1;
						js[_user][idx][`${_user}_date`] = exp[0];
						js[_user][idx][`${_user}_time`] = `${exp[1]} ${exp[2]}`;
						js[_user][idx]['read_stat'] = 1;
	
						if ([1,2,3,4,5,6,7,8,9].includes(TYP_ID)){
							js['req_flow'][`${user}_approve`] = 'o';
						} else {
							js['req_flow'][`${user}_approve`] = 'x';
						}
	
					}
	
					const json_x = JSON.stringify(js);
	

					await procedure.procedure_update_pool({
						json_x,
						comment_id,
						TYP_ID,
						RES
					})
	
					
					return next(null, true);
					
				} catch(e) {
					return next(true);
				}
			})();
     
            
		},

	],(error, result) => {
		/**
		 * handle error
		 */
        if (error) {
            return callback(true, result);
        }
		return callback(null, 'success');
	});
};
