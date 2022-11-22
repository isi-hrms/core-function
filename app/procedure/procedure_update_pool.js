const database = require('../connection/mysql');
const config   = require('../config.js');

module.exports = (data) => {
    const {json_x, comment_id, TYP_ID, RES} = data;
    return database.promise().query(`
    update pool_request set json_data = '${json_x}'  where id_req = ${comment_id}  and master_type = 1 and type_id = ${TYP_ID} and employee_id = '${RES['name']}'
    `);


};
