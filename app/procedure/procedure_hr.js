const database = require('../connection/mysql');
const config   = require('../config.js');

module.exports = (data) => {
    const {EXP_WHOIAM} = data;

    return database.promise().query(`
    select distinct job.title, emp.employee_id from emp, job_history, 
    job where emp.employee_id = job_history.employee_id 
    and job.id =  job_history.job and emp.employee_id = '${EXP_WHOIAM}' 
    and ((lower(job.title) like '%hr%') or (lower(job.title) like '%human resource%') or (lower(job.title) like '%human%'))
    `);

};
