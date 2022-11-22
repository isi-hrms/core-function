const database = require('../connection/mysql');
const config   = require('../config.js');

module.exports = (data) => {
    const {RES, EXP_WHOIAM} = data;

    return database.promise().query(`
    select * from emp_supervisor where employee_id = '${RES['name']}' and supervisor = '${EXP_WHOIAM}' 
    `);


};
