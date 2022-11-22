const database = require('../connection/mysql');
const helper = require('../library');

module.exports = (data, callback) => {
	database.query(
		'CALL check_supervisor_hr_request_training(?,?,?,?)',
		[data.id, data.privillage.employee_id, data.privillage.status, data.lastId.idAttSchedule],
		async (err, res) => {
			if (err) return callback(true, 'procedure')
			try {
				let sqlResponse = {
					supervisor : res[0],
					hr : res[1],
					chat : res[2],
					localit : res[3]
				}

				let currDateTime = new Date()
				let approvalDate = `${currDateTime.getFullYear()}-${currDateTime.getMonth()+1}-${currDateTime.getDate()}`;
				let approvaltime = `${approvalDate} ${helper.formatAMPM(currDateTime)}`

				if (sqlResponse.supervisor.length === 0 && data.privillage.status.toUpperCase() !== "HR") return callback (true, 'access_denied');

				/**
				 * CREATE JSON DATA FOR COMMAND CENTER
				 */
				let jsonData = {}
				
				//CREATE OBJECT SUPERVISOR
				jsonData.sup = [];
				let supx_comp = [];
				if (sqlResponse.supervisor.length !== 0) {
					sqlResponse.supervisor.map(sup => {
						let tempData = {
							[sup.supervisor] : 0,
							"sup_stat" : 0,
							"sup_date" : "0000-00-00",
							"sup_time" : "00:00",
							"read_stat" : 0
						}
						jsonData.sup.push(tempData);
						if (sup.requestorID) supx_comp.push(sup.requestorID.toString());
					});
				}
				//CREATE OBJECT HR
				jsonData.hr = [];
				let hrx_comp = [];
				if (sqlResponse.hr.length !== 0) {
					sqlResponse.hr.map(hr => {
						let tempData = {
							[hr.employee_id] : 0,
							"hr_stat" : 0,
							"hr_date" : "0000-00-00",
							"hr_time" : "00:00",
							"read_stat" : 0
						}
						jsonData.hr.push(tempData);
						if (hr.employee_id) hrx_comp.push(hr.employee_id.toString());
					});
				}
				//CREATE OBJECT SUPERVISOR
				jsonData.swap = [];

				//CREATE SUMMARY OBJECT SUPERVISOR, HR, SWAP
				jsonData.supx_comp = supx_comp;
				jsonData.hrx_comp = hrx_comp;
				jsonData.swapx_comp = [];				
				jsonData.requestor_stat = {[data.privillage.employee_id]:0};	
				
				//CREATE OBJECT CHAT
				jsonData.chat_id = [];
				sqlResponse.chat.map(chat => {
					jsonData.chat_id.push({[chat.id]:"u"})
				});	
				jsonData.req_flow = {
					sup: jsonData.sup.length,
					hr: jsonData.hr.length,
					swap: jsonData.swap.length,
					sup_approve : "o",
					hr_approve : "o",
					swap_approve : "o",
				};

				//CREATE EMPLOYEE DATA 
				if(data.id !== data.privillage.employee_id) {
					jsonData.req_flow.employee = data.id,
    				jsonData.req_flow.employee_approve = "o",
    				jsonData.req_flow.employee_dates = null,
    				jsonData.req_flow.employee_times = null,
    				jsonData.req_flow.employee_requestor = Object.keys(jsonData.requestor_stat)
				}

				//CREATE OBJECT MASTER & LOCAL IT
				jsonData.master = "schedule";
				jsonData.local_it = sqlResponse.localit[0].localit;

				if (data.privillage.status.toUpperCase() === "SUPERVISOR") {
					jsonData.sup = [];
					supx_comp = [];
					if (sqlResponse.supervisor.length !== 0) {
						sqlResponse.supervisor.map(sup => {
							let tempData = {
								[sup.requestorID] : 1,
								"sup_stat" : 1,
								"sup_date" : approvalDate,
								"sup_time" : approvaltime,
								"read_stat" : 1
							}
							jsonData.sup.push(tempData);
							if (sup.requestorID) supx_comp.push(sup.requestorID.toString());
							jsonData.req_flow.sup_approve = "x"
						});
					}
				} else if (data.privillage.status.toUpperCase() === "HR") {
					if (sqlResponse.hr.length !== 0) {
						jsonData.hr = [];
						hrx_comp = [];
						sqlResponse.hr.map(hr => {
							let tempData = {
								[hr.requestorID] : 1,
								"hr_stat" : 1,
								"hr_date" : approvalDate,
								"hr_time" : approvaltime,
								"read_stat" : 1
							}
							jsonData.hr.push(tempData);
							if (hr.employee_id) hrx_comp.push(hr.employee_id.toString());
							jsonData.req_flow.hr_approve = "x"
						});
					}
				}

				return callback (null, jsonData)
			}
			catch (error) {
				return callback(true, 'procedure')
			}
		}
	);
};
