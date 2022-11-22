/** @format */

const controller    = require('./app/controller');
const path       	= require('path');
const lib = require('./app/library');

// 
 /* controller.calculation({
    type: 'cutoff',
    name: null,
    dates: '2020/02/27-2020/03/08',
    department: 139,
    job: null,
    localit: null
  }, (message,dt)=>{
    console.log(message, dt,9090);
  });

*/

/*controller.notif_leave_only_ctrl({
  local_it: 'local',
  from_type: 'leave',
  user: 'user',
  user_login: '2010004',
  type: 2,
  name: '2016015',
  from_type: 'leave',
  swap: null
}, message => {
  return console.log(message);
});
*/
module.exports = {
  notifLib: (req, callback)=>{
    return new Promise((resolve, reject) => {
      controller.test_lab_ctrl(req, message => {
        return resolve(message);
      });
    })
  },
  notifLeaveOnly: (req, callback)=>{
    return new Promise((resolve, reject) => {
      controller.notif_leave_only_ctrl(req, message => {
        return resolve(message);
      });
    })
  },
  pool_update: (req, callback)=>{
    controller.pool_update(req, message => {
      return message;
    })
  },
  calculation: (req, callback)=>{
    return new Promise((resolve, reject)=>{
      controller.calculation(req, (err, message) => {
        if (err) return reject(err);
        return resolve(message);
      })
    })
  },
  check_previllage_request: (req, callback)=>{
    controller.check_previllage_request(req, (err, message) => {
      return message;
    })
  },
  logger: lib.logger
}



