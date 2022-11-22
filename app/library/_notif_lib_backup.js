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
        async.waterfall([
            (next) => {
                //user =  hr /supervisor ? regular employee no needed it
                (async function () {
                    let val = {
                        hr: [],
                        ...data
                    };
                    const _check_su = await database.promise().query(`select  * from  view_nonactive_login where employee_id  =  '${val._employee_id}'  and lower(role_name) =   'superuser'  `);
                    const _supervisorx = await database.promise().query(`select * from emp_supervisor where supervisor =  '${val._employee_id}' `);
                    const _emp_x = await database.promise().query(`select * from view_nonactive_login where employee_id  =   '${val._employee_id}' and (lower(role_name) = 'regular employee user' or  lower(role_name) = 'user') `);
                    const _hrx =  await database.promise().query(`select employee_id from  ldap, role where ldap.role_id = role.role_id and (lower(role.role_name) like '%human%' or  '%human resource%' or '%hr%')`);
                    const _subx = await database.promise().query(`select subordinate from emp_subordinate where employee_id = '${val._employee_id}'`);
                    // const _swapx = `select swap_with from att_swap_shift where employee_id = '${val._employee_id}' and swap_id = (select request_id from att_schedule_request where employee_id='${val._employee_id}' and id = ids and type_id = 6 order by id desc limit 1 )`;
                    
                    return next(null, {
                        ...val,
                        __check_su: _check_su[0],
                        __supervisorx: _supervisorx[0],
                        __emp_x: _emp_x[0],
                        __hrx: _hrx[0],
                        __subx: _subx[0],
                    });
                })();
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
                        hrx.push({
                            [el.employee_id]: 0,
                            hr_stat:  0,
                            hr_date: '0000-00-00',
                            hr_time: '00:00',
                            read_stat: 0,
                        });
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
                        supx.push({
                            [el.supervisor]: 0,
                            sup_stat: 0,
                            sup_date: "0000-00-00",
                            sup_time: "00:00",
                            read_stat: 0,
                        });
                        supx_comp.push(el.supervisor);
                        if (value.__supx.length == (index + 1)) {
                            return next(null, { ...value, supx: supx, supx_comp: supx_comp });
                        }
                    });
                } else {
                    return next(null, { ...value, supx: supx, supx_comp: supx_comp });
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

                if (value._from_type == 'attendance') {
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
                                sup: value.supx,
                                hr: value.hrx,
                                swap: [],
                                supx_comp: value.supx_comp,
                                hrx_comp: value.hrx_comp,
                                swapx_comp: []
                            };
                        }
                    }
                    if (value._type == 2) {
                        master = 'schedule';
                        end = {sup: 1, hr: 2, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                        arr = {
                            sup: value.supx,
                            hr: value.hrx,
                            swap: [],
                            supx_comp: value.supx_comp,
                            hrx_comp: value.hrx_comp,
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
                                end = {swap: 1, sup: 0, hr: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
                                arr = {
                                    swap: value.swapx,
                                    sup: [],
                                    hr: [],
                                    swapx_comp: value.supx_comp,
                                    supx_comp: [],
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
                } else {
                    if (value._type == 2) {
                        if (value._local_it == 'local') {
                            master = 'leave';
                            end = {hr: 1, sup: 0, swap: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
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
                        arr = {
                            hr: value.hrx,
                            sup: value.supx,
                            swap: [],
                            hrx_comp: value.hrx_comp,
                            supx_comp: value.supx_comp,
                            swapx_comp: [],
                        };
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
                                supx_comp: value.supx,
                                hrx_comp: [],
                                swapx_comp: [],
                            };
                        }
                    }
                    if (value._type == 12) {
                        master = 'leave';
                        if (value._type == 12) {
                            if (value._user == 'hr') {
                                if (value._local_it == 'local') {
                                    end = {sup: 0, swap: 0, hr: 0, hr_approve: 'o', swap_approve: 'o', sup_approve: 'o'};
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
