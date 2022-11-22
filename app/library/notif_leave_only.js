const async     = require('async');
const database  = require('../connection/mysql');
const config    = require('../config.js');
const procedure = require('../procedure');
const momentjs  = require('moment');


module.exports = async (data, callback) => {

	/**
	 * Algorithm
	 * 0. get hr form db
	 * 1. Check id is int
	 * 2. Check id is available in table
	 */
    const datetime = new Date().toISOString().split('T');
    const dates = datetime[0];
    const times = datetime[1].substring(0,5);
    
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

                    // const _check_su = await database.promise().query(`select  * from  view_nonactive_login where employee_id  =  '${val._employee_id}'  and lower(role_name) =   'superuser'  `);
                    // const _supervisorx = await database.promise().query(`select * from emp_supervisor where employee_id =  '${val._employee_id}' `);
                    // const _emp_x = await database.promise().query(`select * from view_nonactive_login where employee_id  =   '${val._employee_id}' and (lower(role_name) = 'regular employee user' or  lower(role_name) = 'user') `);
                    // const _hrx =  await database.promise().query(`select employee_id from  ldap, role where ldap.role_id = role.role_id and (lower(role.role_name) like '%human%' or  '%human resource%' or '%hr%')`);
                    // let _hrx;
                    // if (val._local_it == 'expat') {
                    //     _hrx = await database.promise().query(`select distinct job.title, emp.employee_id from emp, job_history, job where emp.employee_id = job_history.employee_id and job.id =  job_history.job and (lower(job.title) like '%it director%')`);
                    // } else {
                    //     _hrx = await database.promise().query(`select distinct job.title, emp.employee_id from emp, job_history, job where emp.employee_id = job_history.employee_id and job.id =  job_history.job and ((lower(job.title) like '%hr%') or 
                    //                                             (lower(job.title) like '%human resource%') or (lower(job.title) like '%human%'))`);
                    // }
                    // const _subx = await database.promise().query(`select subordinate from emp_subordinate where employee_id = '${val._employee_id}'`);
                    //const _supx = await database.promise().query(`select supervisor from emp_supervisor where employee_id = '${val._employee_id}'`);
                    const _check_su = await database.promise().query(`select  * from  view_nonactive_login where employee_id  =  '${val._employee_id}'  and lower(role_name) =   'superuser'  `);
                    const _supervisorx = await database.promise().query(`select * from emp_supervisor where employee_id =  '${val._employee_id}' `);
                    const _emp_x = await database.promise().query(`select * from view_nonactive_login where employee_id  =   '${val._employee_id}' and (lower(role_name) = 'regular employee user' or  lower(role_name) = 'user') `);
                    const _hrx =  await database.promise().query(`select employee_id from  ldap, role where ldap.role_id = role.role_id and (lower(role.role_name) like '%human%' or  '%human resource%' or '%hr%')`);
                    
                    return next(null, {
                        ...val,
                        __check_su: _check_su[0],
                        __supervisorx: _supervisorx[0],
                        __emp_x: _emp_x[0],
                        __hrx: _hrx[0],
                        __subx: [],
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
                        
                        if(value._employee_id && value._employee_id !== value._user_login){
                            // let cekHR = value.__hrx.findIndex((str)=>{return str.employee_id === value._user_login;});
                            // let cekSPV = value.__supervisorx.findIndex((str)=>{return str.supervisor === value._user_login;});

                            if(el.supervisor === value._user_login){
                                requestor = 'sup';
                                //console.log((value._employee_id && value._employee_id !== value._user_login), value._employee_id, value._user_login, cekSPV, el.supervisor)
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
                        if(value._employee_id && value._employee_id !== value._user_login){
                            // const cekHR = value.__hrx.findIndex((str)=> str.employee_id == value._user_login );
                            // const cekSPV = value.__supervisorx.findIndex((str) =>  str.employee_id == value._user_login);
                            if(value._user_login === '2014888'){
                                requestor = 'su';
                            }else if(requestor != 'sup' && el.employee_id === value._user_login){
                                    requestor = 'hr';
                                    jsons = {
                                        [el.employee_id]: 1,
                                        hr_stat: 1,
                                        hr_date: dates.split('T')[0],
                                        hr_time: times,
                                        read_stat: 1,
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
                let master, end, arr;

                if(!requestor && value._employee_id != value._user_login){
                    return next(true, 500);
                }
                if (value._type == 2) {
                    if (value._local_it == 'local') {
                        master = 'leave';
                        end = {hr: 1, sup: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            hr: value.hrx,
                            sup: value.supx,
                            swap: [],
                            hrx_comp: value.hrx,
                            supx_comp: value.supx_comp,
                            swapx_comp: [],
                        };
                    } else {
                        master = 'leave';
                        end = {sup: 1, hr: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            swap: [],
                            hr: [],
                            supx_comp: value.supx_comp,
                            swapx_comp: [],
                            hrx_comp: [],
                        };
                    }
                }
                if (value._type == 10) {
                    master = 'leave';
                    end = {hr: 1, sup: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                    if (value._local_it == 'expat') {
                        end = {hr: 0, sup: 1, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            hr: [],
                            sup: value.supx,
                            swap: [],
                            hrx_comp: [],
                            supx_comp: value.supx_comp,
                            swapx_comp: [],
                        };
                    } else {
                        arr = {
                            hr: value.hrx,
                            sup: value.supx,
                            swap: [],
                            hrx_comp: value.hrx_comp,
                            supx_comp: value.supx_comp,
                            swapx_comp: [],
                        };
                    }
                }
                if (value._type == 3) {
                    master = 'leave';
                    if (value._local_it == 'local') {
                        end = {hr: 1, sup: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            hr: value.hrx,
                            sup: value.supx,
                            swap: [],
                            hrx_comp: value.hrx_comp,
                            supx_comp: value.supx_comp,
                            swapx_comp: [],
                        };
                    }
                }
                if (value._type == 1) {
                    master = 'leave';
                    if (value._local_it == 'local') {
                        end = {hr: 1, sup: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            hr: value.hrx,
                            sup: [],
                            swap: [],
                            hrx_comp: value.hrx_comp,
                            supx_comp: [],
                            swapx_comp: [],
                        };
                    }
                }
                if (value._user == 'hr' && value._type == 4) {
                    if (value._local_it == 'local') {
                        master = 'leave';
                        end = {sup: 1, swap: 0, hr: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.sup,
                            hr: [],
                            swap: [],
                            supx_comp: value.supx_comp,
                            hrx_comp: [],
                            swapx_comp: [],
                        };
                    }
                }
                if (value._type == 4 && value._local_it == 'local') {
                    master = 'leave';
                    end = {hr: 1, sup: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                    arr = {
                        hr: value.hrx,
                        sup: value.supx,
                        swap: [],
                        hrx_comp: value.hrx_comp,
                        supx_comp: value.supx_comp,
                        swapx_comp: [],
                    };
                }
                if (value._type == 4 && value._local_it == 'expat') {
                    master = 'leave';
                    end = {sup: 1, swap: 0, hr: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                    arr = {
                        sup: value.supx,
                        hr: [],
                        swap: [],
                        supx_comp: value.supx_comp,
                        hrx_comp: [],
                        swapx_comp: [],
                    };
                }
                if (value._type == 5) {
                    master = 'leave';
                    if (value._user == 'hr') {
                        if (value._local_it == 'local') {
                            end = {hr: 1, swap: 0, sup: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                hr: value.hrx,
                                sup: [],
                                swap: [],
                                hrx_comp: value.hrx_comp,
                                supx_comp: [],
                                swapx_comp: [],
                            };
                        }
                    } else {
                        if (value._local_it == 'expat') {
                            end = {sup: 1, hr: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: value.supx,
                                hr: [],
                                swap: [],
                                supx_comp: value.supx_comp,
                                hrx_comp: [],
                                swapx_comp: [],
                            };
                        }
                    }
                }
                if (value._type == 6) {
                    master = 'leave';
                    if (value._local_it == 'local') {
                        end = {sup: 1, hr: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            hr: value.hrx,
                            swap: [],
                            supx_comp: value.supx_comp,
                            hrx_comp: value.hrx_comp,
                            swapx_comp: [],
                        };
                    } else {
                        end = {sup: 1, hr: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            hr: [],
                            swap: [],
                            supx_comp: value.supx_comp,
                            hrx_comp: [],
                            swapx_comp: [],
                        };
                    }
                }
                if (value._type == 7) {
                    master = 'leave';
                    if (value._user == 'hr') {
                        if (value._local_it == 'local') {
                            end = {sup: 1, hr: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: value.supx,
                                hr: [],
                                swap: [],
                                supx_comp: value.supx_comp,
                                hrx_comp: [],
                                swapx_comp: [],
                            };
                        }
                    } else {
                        if (value._local_it == 'local') {
                            end = {sup: 1, hr: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: value.supx,
                                hr: value.hrx,
                                swap: [],
                                supx_comp: value.supx,
                                hrx_comp: value.hrx,
                                swapx_comp: [],
                            };
                        } else {
                            end = {sup: 1, swap: 0, hr: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: value.supx,
                                hr: [],
                                swap: [],
                                supx_comp: value.supx_comp,
                                hrx_comp: [],
                                swapx_comp: [],
                            };
                        }
                    }
                }
                if (value._type == 8) {
                    master = 'leave';
                    if (value._local_it == 'local') {
                        end = {sup: 1, hr: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            hr: value.hrx,
                            swap: [],
                            supx_comp: value.supx_comp,
                            hrx_comp: value.hrx_comp,
                            swapx_comp: [],
                        };
                    } else {
                        end = {sup: 1, hr: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            hr: [],
                            swap: [],
                            supx_comp: value.supx_comp,
                            hrx_comp: [],
                            swapx_comp: [],
                        };
                    }
                }
                if (value._type == 11) {
                    master = 'leave';
                    if (value._local_it == 'local') {
                        end = {sup: 1, hr: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            hr: value.hrx,
                            swap: [],
                            supx_comp: value.supx_comp,
                            hrx_comp: value.hrx_comp,
                            swapx_comp: [],
                        };
                    } else {
                        end = {sup: 1, swap: 0, hr: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            hr: [],
                            swap: [],
                            supx_comp: value.supx,
                            hrx_comp: [],
                            swapx_comp: [],
                        };
                    }
                }
                if (value._type == 12) {
                    master = 'leave';
                    if (value._type == 12) {
                        end = {sup: 0, swap: 0, hr: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        if (value._user == 'hr') {
                            if (value._local_it == 'local') {
                                arr = {
                                    sup: value.supx,
                                    hr: value.hrx,
                                    swap: [],
                                    supx_comp: value.supx_comp,
                                    hrx_comp: value.hrx_comp,
                                    swapx_comp: [],
                                };
                            }
                        }
                    }
                }
                if (value._type == 9) {
                    master = 'leave';
                    if (value.swapx) {
                        if (value._local_it == 'local') {
                            end = {sup: 1, hr: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                            arr = {
                                sup: value.supx,
                                hr: value.hrx,
                                swap: [],
                                supx_comp: value.supx_comp,
                                hrx_comp: value.hrx_comp,
                                swapx_comp: [],
                            };
                        }
                    }
                }
                          
                // updated code
                end.requestor_approve = null;
                end.employee_requestor = [];
                end.employee_dates = '0000-00-00';
                end.employee_times = '00:00';
                end.employee_approve = null; 
                end.approver = [];
                
                const idx1 = arr.hrx_comp.length;
                const idx2 = arr.supx_comp.length;

                if(idx1 > 0){
                    
                    end.approver.push({
                        job_approval : 'HR',
                        name : null,
                        date : null,
                        time: null,
                        status : 'Pending Approval'

                    });
                }
                if(idx2 > 0){
                    
                    end.approver.push({
                        job_approval : 'SUP',
                        name : null,
                        date : null,
                        time: null,
                        status : 'Pending Approval'

                    });
                }
               if(requestor){
                    const cek_approve = end.approver.findIndex((str)=>{ return str.job_approval == requestor.toUpperCase(); });
                    if(cek_approve > -1){
                        end.approver.splice(cek_approve,1);
                    }
                    end.requestor_approve = 'x';
                    end.employee_requestor = [ value._user_login, requestor ];
                    end.employee_dates = null;
                    end.employee_times = null;
                    end.employee_approve = 'o';

                    if(requestor == 'sup'){
                        end.sup_approve = 'x';
                    }else if(requestor == 'hr'){
                        end.hr_approve = 'x';
                    }

                    end.approver.push({
                        job_approval : 'EMPLOYEE',
                        name : null,
                        date : null,
                        time: null,
                        status : 'Pending Approval'

                    });
                }
                //return console.log(requestor,value._employee_id, 909090)
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

