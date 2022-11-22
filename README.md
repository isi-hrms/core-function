# coreFunction
Ini adalah kumpulan beberapa lib untuk hrms
# Setup : 
```
npm i hrms_corefunction@0.0.x (newest version)
please setup db connection on app/config
```
## List function
```
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
    controller.calculation(req, (err, message) => {
      return message;
    })
  },
  check_previllage_request: (req, callback)=>{
    controller.check_previllage_request(req, (err, message) => {
      return message;
    })
  },
}
```

# Cara pakai : 
1. config set di dalam libnya
```
mysql 	: {
		host 		: ENV.DB_HOST 		|| "192.168.1.xx", // ip database
		port 		: ENV.DB_PORT 		|| "3306",
		user 		: ENV.DB_USER 		|| "root",
		password	: ENV.DB_PASSWORD 	|| "yourpassword",
		database 	: 'database', // DB
	},
```


2. require dulu
```
const library   = require('hrmscorefunction');
```

3. cara pakai
```
let val_notif = {
    type: value.type,
    name: value.name,
    local_it: 'local', // memang nilainya harcode kaya gini
    user: 'user', // memang nilainya harcode kaya gini
    from_type: 'attendance', // memang nilainya harcode kaya gini
    swap: value.swap // beri nilai null jika bukan swap shift
};
// panggil si notif
let notif = await library.notifLib(val_notif);

console.log(notif.jsonData, '===== LURR');
```
