const database = require('../connection/mysql');
const config   = require('../config.js');

module.exports = (data) => {
    const {EXP_WHOIAM} = data;

    return database.promise().query(`
        select * from view_nonactive_login  where  lower(role_name) = 'superuser' and employee_id  =  '${EXP_WHOIAM}' 
    `);


};
