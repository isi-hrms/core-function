const async     = require('async');
const database  = require('../connection/mysql');
const config    = require('../config.js');
const procedure = require('../procedure');


module.exports = async (data, callback) => {

	/**
	 * Algorithm
	 * 0. get hr form db
	 * 1. Check id is int
	 * 2. Check id is available in table
	 */
    
    return new Promise((resolve, reject) => {
        // updated code
        let requestor = null;
        if(data._user === undefined) data._user = null;
        
        async.waterfall([
            (next) => {
                //user =  hr /supervisor ? regular employee no needed it
                (async function () {
                    let val = {
                        hr: [],
                        ...data
                    };

                    const _check_su = await database.promise().query(`select  * from  view_nonactive_login where employee_id  =  '${val._employee_id}'  and lower(role_name) =   'superuser'  `);
                    const _supervisorx = await database.promise().query(`select distinct * from emp_supervisor where supervisor =  '${val._employee_id}' `);
                    const _emp_x = await database.promise().query(`select * from view_nonactive_login where employee_id  =   '${val._employee_id}' and (lower(role_name) = 'regular employee user' or  lower(role_name) = 'user') `);
                    const _hrx =  await database.promise().query(`select employee_id from  ldap, role where ldap.role_id = role.role_id and (lower(role.role_name) like '%human%' or  '%human resource%' or '%hr%')`);
                    //const _subx = await database.promise().query(`select subordinate from emp_subordinate where employee_id = '${val._employee_id}'`);
                    const _subx = val._ids == undefined ? [] : await database.promise().query(`select swap_with from att_swap_shift where employee_id = '${val._employee_id}' and swap_id = (select request_id from att_schedule_request where employee_id='${val._employee_id}' and id = ${val._ids} and type_id = 6 order by id desc limit 1 )`);
                    
                    return next(null, {
                        ...val,
                        __check_su: _check_su[0],
                        __supervisorx: _supervisorx[0],
                        __emp_x: _emp_x[0],
                        __hrx: _hrx[0],
                        __subx: _subx.length == 0 ? [] : _subx[0],
                    });
                })();
            },
            (value, next) => {
                // console.log(value, '=== soehaifhidfhdifh');
                // return;
                // SET SUPX
                let supx = [
                    {
                        [2014888]: 0,
                        sup_stat:  0,
                        sup_date: '0000-00-00',
                        sup_time: '00:00',
                        read_stat: 0,
                    }
                ];
                let supx_comp = ['2014888'];
                if (value.__supervisorx.length > 0) {
                    value.__supervisorx.map((el, index) => {
                        let jsons = {
                            [el.supervisor]: 0,
                            sup_stat: 0,
                            sup_date: '0000-00-00',
                            sup_time: '00:00',
                            read_stat: 0,
                        };

                        // updated code
                        if(value._user && value._user !== value._employee_id){
                            const cekHR = value.__hrx.findIndex((str)=>{return str.employee_id == value._user;});
                            const cekSPV = value.__supervisorx.findIndex((str)=>{return str.employee_id == value._user;});
                            if( cekSPV > 1 || (cekSPV > -1 && cekHR > -1)){
                                requestor = 'sup';
                                const datetime = new Date().toISOString().split('T');
                                const dates = datetime[0];
                                const times = datetime[1].substring(0,5);
                                jsons = {
                                    [el.supervisor]: 1,
                                    sup_stat: 1,
                                    sup_date: dates.split('T')[0],
                                    sup_time: times,
                                    read_stat: 1,
                                }
                            }
                        }
                        supx.push(jsons);
                        
                        supx_comp.push(el.supervisor);
                        if (value.__supervisorx.length == (index + 1)) {
                            return next(null, { ...value, supx: supx, supx_comp: supx_comp });
                        }
                    });
                } else {
                    return next(null, { ...value, supx: supx, supx_comp: supx_comp });
                }
            },
            (value, next) => {
                // console.log(value.__hrx.length, '=== OKE LUERR');
                // return;
                // SET HRX
                let hrx  = [
                    {
                    "2014888": 0,
                    "hr_stat": 0,
                    "hr_date": "0000-00-00",
                    "hr_time": "00:00",
                    "read_stat": 0
                    }
                ];
                let hrx_comp = ['2014888'];
                if (value.__hrx.length > 0) {
                    value.__hrx.map((el, index) => {
                        let jsons = {
                            [el.employee_id]: 0,
                            hr_stat: 0,
                            hr_date: '0000-00-00',
                            hr_time: '00:00',
                            read_stat: 0,
                        };
                        
                        // updated code
                        if(value._user && value._user !== value._employee_id){
                            const cekHR = value.__hrx.findIndex((str)=> str.employee_id == value._user );
                            const cekSPV = value.__supervisorx.findIndex((str) =>  str.employee_id == value._user);
                            
                            if(cekHR > -1){
                                if(requestor != 'sup'){
                                    requestor = 'hr';
                                    const datetime = new Date().toISOString().split('T');
                                    const dates = datetime[0];
                                    const times = datetime[1].substring(0,5);
                                    jsons = {
                                        [el.employee_id]: 1,
                                        hr_stat: 1,
                                        hr_date: dates.split('T')[0],
                                        hr_time: times,
                                        read_stat: 1,
                                    }
                                }
                            }
                        }
                        hrx.push(jsons);
                        hrx_comp.push(el.employee_id);
                        if (value.__hrx.length == (index + 1)) {
                            return next(null, { ...value, hrx: hrx, hrx_comp: hrx_comp });
                        }
                    });
                } else {
                    return next(null, { ...value, hrx: hrx, hrx_comp: hrx_comp });
                }
            },
            (value, next) => {
                // console.log(value, '=== OKE WOYy');
                // return;
                // SET SUBX
                let subx  = [
                    {
                        "2014888": 0,
                        "swap_stat": 0,
                        "swap_date": "0000-00-00",
                        "swap_time": "00:00",
                        "read_stat": 0
                    }
                ];
                let subx_comp = ['2014888'];
                
                if (value.__subx.length > 0) {
                    value.__subx.map((el, index) => {
                        subx.push({
                            [el.subordinate]: 0,
                            swap_stat: 0,
                            swap_date: "0000-00-00",
                            swap_time: "00:00",
                            read_stat: 0,
                        });
                        subx_comp.push(el.subordinate);
                        if (value.__subx.length == (index + 1)) {
                            return next(null, { ...value, subx: subx, subx_comp: subx_comp });
                        }
                    });
                } else {
                    return next(null, { ...value, subx: subx, subx_comp: subx_comp });
                }

            },
            (value, next) => {
                // console.log(value, '=== WOHIHIHFIHF');
                // return;
                // SET SWAPX
                let swapx;
                let swapx_comp;
                if (value._swap == null) {
                    swapx = [
                        {
                            "2014888": 0,
                            swap_stat: 0,
                            swap_date: "0000-00-00",
                            swap_time: "00:00",
                            read_stat: 0,
                        },
                    ];
                    swapx_comp = ["2014888"];
                } else {
                    swapx = [
                        {
                            [value._swap]: 0,
                            swap_stat: 0,
                            swap_date: "0000-00-00",
                            swap_time: "00:00",
                            read_stat: 0,
                        },
                    ];
                    swapx_comp = [`${value._swap}`];
                }
                return next(null, { ...value, swapx: swapx, swapx_comp: swapx_comp });
            },
            (value, next) => {
                let master, end, arr;

                    if (value._type == 9) {
                        if (value._local_it == 'local') {
                            master = 'schedule';
                            end = {hr: 1, swap: '0', sup: '0', hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                hr: value.hrx,
                                sup: [],
                                swap: [],
                                hrx_comp: value.hrx_comp,
                                supx_comp: [],
                                empx_comp: []
                            };
                        } else {
                            master = 'schedule';
                            end = {sup: 1, hr: '0', swap: '0', hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: value.supx,
                                hr: [],
                                swap: [],
                                supx_comp: value.supx_comp,
                                hrx_comp: [],
                                swapx_comp: []
                            };
                        }
                    }
                    if (value._type == 3) {
                        if (value._local_it == 'local') {
                            master = 'schedule';
                            end = {sup: 1, swap: '0', hr: '0', hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: value.supx,
                                hr: [],
                                swap: [],
                                supx_comp: value.supx_comp,
                                hrx_comp: [],
                                swapx_comp: []
                            };
                        }
                    }
                    if (value._type == 4) {
                        if (value._local_it == 'local') {
                            master = 'schedule';
                            end = {sup: 1, swap: '0', hr: '0', hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: value.supx,
                                hr: [],
                                swap: [],
                                supx_comp: value.supx_comp,
                                hrx_comp: [],
                                swapx_comp: []
                            };
                        }
                    }
                    if (value._type == 7 || value._type == 8) {
                        if (value._local_it == 'local') {
                            master = 'schedule';
                            end = {sup: 1, hr: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: /*value.supx*/[],
                                hr: value.hrx,
                                swap: [],
                                supx_comp: /*value.supx_comp*/[],
                                hrx_comp: value.hrx_comp,
                                swapx_comp: []
                            };
                        }
                    }
                    if (value._type == 2) {
                        master = 'schedule';
                        end = {sup: 1, hr: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            hr: /*value.hrx*/[],
                            swap: [],
                            supx_comp: value.supx_comp,
                            hrx_comp: /*value.hrx_comp*/[],
                            swapx_comp: []
                        };
                    }
                    if (value._type == 1) {
                        master = 'schedule';
                        end = {sup: 1, hr: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            hr: [],
                            swap: [],
                            supx_comp: value.supx_comp,
                            hrx_comp: [],
                            swapx_comp: []
                        };
                    }
                    if (value._type == 5) {
                        if (value._user == 'sup') {
                            master = 'schedule';
                            end = {sup: 1, hr: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                swap: value.subx,
                                sup: [],
                                hr: [],
                                swapx_comp: value.subx_comp,
                                supx_comp: [],
                                hrx_comp: [],
                            };
                        } else {
                            master = 'schedule';
                            end = {sup: 1, hr: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: value.supx,
                                swap: [],
                                hr: [],
                                supx_comp: value.supx_comp,
                                hrx_comp: [],
                                swapx_comp: []
                            };
                        }
                    }
                    if (value._type == 6) {
                        if (value._local_it == 'local') {
                            if (value._supervisorx) {
                                master = 'schedule';
                                end = {swap: 1, sup: 2, hr: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                                arr = {
                                    swap: value.swapx,
                                    sup: value.supx,
                                    hr: [],
                                    swapx_comp: value.supx_comp,
                                    supx_comp: value.supx_comp,
                                    hrx_comp: [],
                                };
                            } else {
                                master = 'schedule';
                                end = {swap: 1, sup: 2, hr: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                                arr = {
                                    swap: value.swapx,
                                    sup: value.supx,
                                    hr: [],
                                    swapx_comp: value.supx_comp,
                                    supx_comp: value.supx_comp,
                                    hrx_comp: [],
                                };
                            }
                        }
                    }
                
                // updated code
                if(requestor){
                    end.requestor_approve = 'x';
                    end.employee_requestor = [ value._user, requestor ];
                }
                let new_arr = {
                    ...arr,
                    requestor_stat: [{[value._employee_id]: 0}],
                    chat_id: [],
                    req_flow: end,
                    master: master,
                    local_it: value._local_it
                };

                let jsonData = JSON.stringify(new_arr);
                

                return next(null, {...value, jsonData});
            },
        ],(error, result) => {
            /**
             * handle error
             */
            // return;
            if (error) {
                return callback(true, result);
            }
            return callback(null, result);
        });
	});
};

