/** @format */

const async = require('async');
const validator = require('../validator');
const procedure = require('../procedure');
const database = require('../connection/mysql');

const moment = require('moment');
const method = 'store';
const formName = 'Employee Status';
const buildResponse = require('.').response;

function formatDate(date, param) {
    if(param =="toampm"){
        // console.log(date, 'HALOOO')
        var time = moment.unix(date).format("a")
        
        return time;
    }else if(param == "toampm2"){
        // var d = new Date(date);
        try{
            
            var time = date.split(':')
        }catch(e){
            console.log(e, date, 90909090);
        }
        var dd = "am";
        var h = time[0];
        if (h >= 12) {
        // h = hh - 12;
        dd = "pm";
        }


        return dd;
    }else if(param == "+1 day"){
        var date1 = moment(date, 'YYYY-MM-DD HH:mm:ss').add(1, 'days')
    // console.log(ttt, 'TTTT')
        var unix = moment(new Date(date1)).format('x');
            
        return unix;
    }else if(param == 'hplusi'){
        var s = date
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        // console.log(secs, 'SECCSSSSS')
        s = (s - secs) / 60;
        // console.log(s, 'SSSSSSSS')
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        // console.log(hrs, 'HRSSSSSS')
        // console.log(mins, 'MINSSSSS')
        mins = mins < 10 ? "0" + mins : mins;
        hrs = hrs<10?"0"+hrs:hrs;
        
        return hrs + ':' + mins;
    }else if(param == 'datetiemtoms'){

        var momentT = moment(date, "YYYY-MM-DD HH:mm:ss")
        
        var unix = moment(new Date(momentT)).format('x');
        
        var unixtoms = unix/1000
        return unixtoms
    }else if(param == 'addhours'){
        var date1 = moment(date, 'YYYY-MM-DD HH:mm:ss').add(1, 'h')
    // console.log(ttt, 'TTTT')
        var unix = moment(new Date(date1)).format('x');
            
        return unix;
    }else if(param == 'timetos'){
        var hms = date
        if(hms == null){
            return null
        }
        var a = hms.split(':'); // split it at the colons
        if(a[2] == undefined){
            var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60; 
        }else{
            // minutes are worth 60 seconds. Hours are worth 60 minutes.
            var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
        }
        return seconds;
    }else if(param == 'stotime' || param == 'stotimehs'){
        var seconds = date;
        // console.log(seconds, 'secondss')
        var nan = isNaN(seconds)
        if(nan == true){
            return 'NaN'
        }

        // seconds == NaN ? seconds = 00 : seconds;
        var hours = new Date(seconds * 1000).toISOString().substr(11, 8);
        var split = hours.split(':')
        var hrs = hours[0]
        hrs = hrs<10?"0"+hrs:hrs;
        var mins = hours[1]
        mins = mins < 10 ? "0" + mins : mins;

        // return [hrs, mins].join(':');
        return param == 'stotime' ? hours : param == 'stotimehs' ? [hrs, mins].join(':') : null
    }else if(param == 'sectohm'){
        // Hours, minutes and seconds
        var hrs = ~~(date / 3600);
        var mins = ~~((date % 3600) / 60);
        var secs = ~~date % 60;

        // Output like "1:01" or "4:03:59" or "123:03:59"
        // var ret = "";
        // if (hrs > 0) {
        //     ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        // }
        // ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        // ret += "" + secs;
        hrs = hrs<10?"0"+hrs:hrs;
        mins = mins < 10 ? "0" + mins : mins;
        return [hrs, mins].join(':');
    }
}

const queryatt = (req, next) => {
    console.log(req.rangeDt, '111111111')
    var querys = `SELECT distinct  t2.employee_id as employee_id, date_format(t1.date,'%Y-%m-%d') as date,
    concat(t2.first_name,' ',t2.middle_name,' ',t2.last_name) as Name, 
    t2.first_name as first_name,
    t2.last_name as last_name,
    t3._from as fromx, 
    t3._to as tox,
    t3.shift_code as shift_code,
    t11.job,
    t2.department,
    t2.local_it,
    '99:99:99' as value,
    '99:99:99' as date_changeShift,
    '99:99:99' as start_date_training,
    '99:99:99' as end_date_training,
    '99:99:99' as approve_date_training,
    '99:99:99' as date_swapShift,
    '99:99:99' as schedule_swapShift,

     date_format(t10.time_in,'%H:%i')as timeIn,date_format(t10.time_out,'%H:%i')as timeOut,
    date_format(t10.date,'%Y-%m-%d') as date_absen, date_format(t10.inquire_date,'%Y-%m-%d') as date_inquire_absen,
          t3.hour_per_day,t5.total_overtime,t5.total_overtime as total_overtimes,t6.total_overtime as OvertimeRestDay, t6.status_id as RestDay_App ,
   
         t1.status,t10.input_ as ApproveStatus, t10.inquire_date as nextdays
         FROM att_schedule t1
         left join emp t2 on t2.employee_id=t1.employee_id 
         left join job_history t11 on  t11.employee_id = t2.employee_id	
         left join attendance_work_shifts t3 on t3.shift_id=t1.shift_id
         left join biometrics_device t10 on t10.employee_id=t1.employee_id and t10.date=t1.date
         left join att_overtime t5 on t5.employee_id=t1.employee_id and t5.date_str=t1.date and t5.status_id=2 and t3.shift_code !='DO'
         left join att_overtime t6 on t6.employee_id=t1.employee_id and t6.date_str=t1.date and t6.status_id=2 and t3.shift_code ='DO'
         left join biometrics_device t7 on t7.employee_id=t1.employee_id and t7.date=t1.date and t3._from !='00:00:00' and t3._to !='00:00:00' and date_format(str_to_date(time_to_sec(timediff(t7.time_out,t7.time_in))/60/60,'%l.%i'),'%i') !='00'
         left join biometrics_device t8 on t8.employee_id=t1.employee_id and t3._from !='00:00:00'  and t8.time_in > t3._from and t8.date=t1.date 
         left join biometrics_device t9 on t9.employee_id=t1.employee_id and t3._to !='00:00:00'and t9.time_out<t3._to  and t9.date=t1.date
         where `;

        if(req.types == 'cut-off'){
            //tidak dipakai
        }else if(req.types == 'cut-off-record'){
            //tidak dipakai
        }else if(req.types == "view-attendance"){
            // console.log('masooookkkkkk')
            querys += `t1.employee_id='${req.rangeDt}' and t1.status = 2 group by t1.date order by t1.date ASC LIMIT 0,30`;
        }else if(req.types == "view-attendance-perday"){
           //tidak dipakai
        }else{
            //tidak dipakai
        }
            //   console.log(querys, 'querys')
        database.query(querys, (err, result)=>{
        // console.log('MASOOOOOKKKKK PA AJI')
            if(err) return next(true, err)

            return next(null, result)
        })
        
}

function calculation_attendance(arr){
    // return console.log(arr.fromx2, arr.tox, 'YYYYYYYYYYYY')
    var value                       = arr.value;
    var fromx2                      = arr.fromx2;
    var tox                         = arr.tox;
    var strtotime_formx             = arr.strtotime_formx;
    var strtotime_tox               = arr.strtotime_tox;
    var timeIn                      = arr.timeIn;
    var timeOuts                    = arr.timeOuts;
    var strtotime_TimeInInquire     = arr.strtotime_TimeInInquire;
    var strtotime_TimeInBiometric   = arr.strtotime_TimeInBiometric;
    var strtotime_TimeOutInquire    = arr.strtotime_TimeOutInquire;
    var strtotime_TimeOutBiometric  = arr.strtotime_TimeOutBiometric;
    var late_fix                    = arr.late_fix;
    var eot_fix2                    = arr.eot_fix2;

    var total_device_workhours      = 0;

    // console.log(fromx2, 'FROMMM')
    // console.log(tox, 'TOXXXX')
    // console.log(Date.parse(fromx2), 'parsefromx')
    // console.log(Date.parse(tox), 'parsetox')
    var am_pm_sch_from 			= formatDate(fromx2, 'toampm2');
	var am_pm_sch_to 			= formatDate(tox, 'toampm2');
    // console.log(am_pm_sch_from, 'ampmfrom')
    // console.log(am_pm_sch_to, 'ampmto')
    // console.log(value, 'ini value')
    // return console.log(value.date_inquire_absen, 'dateinquire')
    var value_date_inquire_absen = value.date_inquire_absen
    // return console.log(value.date_inquire_absen, 'value_date_inquire_absen')
    // console.log(strtotime_TimeInBiometric, 'inbio')
    // console.log(strtotime_TimeOutBiometric, 'inbio')
    // console.log(value_date_inquire_absen[0], 'sfafsafa')
    // if(value.date_inquire_absen){
    //     return console.log('tidak null')
    // }else{
    //     return console.log('null')
    // }
    // console.log(`${value.date}T${tox}`, '`${value.date}T${tox}`')
    // var ttt = moment(`${value.date}T${tox}`, 'YYYY-MM-DD HH:mm:ss').add(5, 'days')
    // // console.log(ttt, 'TTTT')
    // var unixS = moment(new Date(ttt)).format('x');
    // console.log(formatDate(`${value.date}T${tox}`, "+1 day"), '+1111111+')
    // return console.log(unixS, 'TTTT')

    // var mktimes_late_fix    = 1547456400000
    // console.log(mktimes_late_fix, 'mktimes_late_fix')
    // var momentT = moment(mktimes_late_fix, "HH:mm")
    // console.log(momentT, 'MOMENTTTT')
    // var late_fix            = formatDate(mktimes_late_fix, 'hplusi')
    // return console.log(momentT, 'momentT')
    // console.log(value_date_inquire_absen, 'value_date_inquire_absen')
    if(value_date_inquire_absen){
        
        var mktimes_late_fix, mktimes_eot_fix2;

        if(am_pm_sch_from == 'pm' && am_pm_sch_to == 'am'){ //SCH 23-12
            // console.log(value.map(a => a.date), 'dateeeeeeeeeeee')
            // console.log(tox, 'toxx')

            // let datetimeparse = Date.parse(`${value.date}T${tox}`)
            // let plus1day = datetimeparse + 86400000
            // strtotime_tox = datetimeparse + 86400000;
            strtotime_tox   = formatDate(`${value.date}T${tox}`, "+1 day")

            var am_pm_bio_in    = formatDate(timeIn, "toampm2")
            var am_pm_bio_out   = formatDate(timeOuts, "toampm2")

            if((am_pm_bio_in == 'am' && am_pm_bio_out == 'am') || (am_pm_bio_in == 'pm' && am_pm_bio_out == 'pm') || (am_pm_bio_in == 'am' && am_pm_bio_out == 'pm')){

                total_device_workhours = strtotime_TimeOutInquire - strtotime_TimeInInquire;

                if(total_device_workhours > 0){
                    if(strtotime_TimeInInquire > strtotime_formx){
                        mktimes_late_fix    = (strtotime_TimeInInquire - strtotime_formx)/60
                        late_fix            = mktimes_late_fix
                    }else{
                        late_fix            = null
                    }
                }else{
                    total_device_workhours = strtotime_TimeOutInquire = strtotime_TimeInBiometric;

                    if(strtotime_TimeInInquire > strtotime_formx){
                        mktimes_late_fix    = (strtotime_TimeInBiometric - strtotime_formx)/60
                        late_fix            = mktimes_late_fix
                    }else{
                        late_fix            = null
                    }
                }
            }else if(am_pm_bio_in == 'pm' && am_pm_bio_out == 'am'){

                total_device_workhours = strtotime_TimeOutInquire - strtotime_TimeInBiometric;

                if(strtotime_TimeInBiometric > strtotime_formx){
                    mktimes_late_fix    = (strtotime_TimeInBiometric - strtotime_formx)/60
                    late_fix            = mktimes_late_fix
                }else{
                    late_fix            = null
                }
            }

            if(strtotime_tox > strtotime_TimeOutInquire){
                if(strtotime_TimeInBiometric > strtotime_formx){
                    mktimes_eot_fix2    = (strtotime_tox - strtotime_TimeOutInquire)/60
                    eot_fix2            = mktimes_eot_fix2
                }else{
                    eot_fix2            = null
                }
            }
        }else{
            var am_pm_bio_in    = moment(timeIn, "toampm2")
            var am_pm_bio_out   = moment(timeOuts, "toampm2")

            if(am_pm_bio_in == 'pm' && am_pm_bio_out == 'am'){
                total_device_workhours = strtotime_TimeOutInquire - strtotime_TimeInBiometric;

                if(strtotime_TimeInBiometric > strtotime_formx){
                    mktimes_late_fix    = (strtotime_tox - strtotime_TimeOutInquire)/60
                    late_fix            = mktimes_late_fix
                }else{
                    late_fix            = null
                }

                if(strtotime_tox > strtotime_TimeOutInquire){
                    mktimes_eot_fix2    = (strtotime_tox - strtotime_TimeOutInquire)/60
                    eot_fix2            = mktimes_eot_fix2
                }else{
                    eot_fix2            = null
                }
            }
        }
    }else{ // tanpa next day bio
        // console.log('MASUK ELSE')
        // console.log(value.date, 'DATEEE')
        // console.log(am_pm_sch_from, 'from')
        // console.log(am_pm_sch_to, 'to')
        if(am_pm_sch_from == 'pm' && am_pm_sch_to == 'am'){ // SCH 23-12
            // console.log('masuk1++++++++++++')
            var mktimes_late_fix, mktimes_eot_fix2;
            // let datetimeparse = Date.parse(`${value.date}T${tox}`)
            // let plus1day = datetimeparse + 86400000
            strtotime_tox   = formatDate(`${value.date}T${tox}`, "+1 day")
            // strtotime_tox = datetimeparse + 86400000

            total_device_workhours = strtotime_TimeOutBiometric - strtotime_TimeInBiometric;
        
            if(strtotime_TimeInBiometric > strtotime_formx){
                mktimes_late_fix    = (strtotime_TimeInBiometric - strtotime_formx)/60
                late_fix            = mktimes_late_fix
            }else{
                late_fix            = null
            }
            // console.log(late_fix, 'LATEEEEE')
            if(strtotime_tox > strtotime_TimeOutBiometric){
                mktimes_eot_fix2    = (strtotime_tox - strtotime_TimeOutBiometric)/60
                eot_fix2            = mktimes_eot_fix2
            }else{
                eot_fix2            = null
            }
            // console.log(eot_fix2, 'eot_fix2')
        }else if((am_pm_sch_from == 'am' && am_pm_sch_to == 'pm') || (am_pm_sch_from == 'pm' && am_pm_sch_to == 'pm')) {
            // console.log('masuk2==============')
            // console.log(strtotime_TimeOutBiometric, 'strtotime_TimeOutBiometric')
            // console.log(strtotime_TimeInBiometric, 'strtotime_TimeInBiometric')
            total_device_workhours = strtotime_TimeOutBiometric - strtotime_TimeInBiometric;
            // console.log(total_device_workhours, 'deviceworkhours')
            // console.log(strtotime_TimeOutBiometric, 'timeout')
            // console.log(strtotime_TimeInBiometric, 'timein')
            // console.log(strtotime_formx, 'strtotime_formx')
            if(strtotime_TimeInBiometric > strtotime_formx){
                mktimes_late_fix    = (strtotime_TimeInBiometric - strtotime_formx)/60
                // late_fix            = moment(mktimes_late_fix, 'HH:mm')
                late_fix            = mktimes_late_fix
                // console.log(mktimes_late_fix, 'mktimes_late_fix')
                // console.log(mktimes_late_fix/60, '6000000')
                // console.log(late_fix, 'LATEFIXXX')
            }else{
                late_fix            = null
            }
            // console.log(late_fix, 'LATEEEEE')
            // console.log(strtotime_tox, 'strtotime_tox')
            // console.log(strtotime_TimeOutBiometric, 'strtotime_TimeOutBiometric')
            if(strtotime_tox > strtotime_TimeOutBiometric){
                mktimes_eot_fix2    = (strtotime_tox - strtotime_TimeOutBiometric)/60
                eot_fix2            = mktimes_eot_fix2
            }else{
                eot_fix2            = null
            }
            // console.log(eot_fix2, 'eot_fix2')

        }

        // var d = Date.parse(value.date, tox);
        // console.log(d, 'DDDDDDD')
        // var newDate = new Date(d)
        // console.log(moment(strtotime_tox).valueOf(), 'NDNDNDND')
        // console.log(moment(new Date(value.map(a => a.date), tox)).format('x'), 'moment 111')
        // console.log(moment(d), 'moment')
        // console.log(new Date(Date.parse(value.map(a => a.date), tox)/1000), '11111')
    }

    arr.value                       = value;
    arr.fromx2                      = fromx2;
    arr.tox                         = tox;
    arr.strtotime_formx             = strtotime_formx;
    arr.strtotime_tox               = strtotime_tox;
    arr.strtotime_TimeInInquire     = strtotime_TimeInInquire;
    arr.strtotime_TimeInBiometric   = strtotime_TimeInBiometric;
    arr.strtotime_TimeOutInquire    = strtotime_TimeOutInquire;
    arr.strtotime_TimeOutBiometric  = strtotime_TimeOutBiometric;     
    arr.late_fix                    = late_fix;
    arr.eot_fix2                    = eot_fix2;
    arr.total_device_workhours      = total_device_workhours;
    return arr;
}

module.exports = (types,  param_emp,rangeDt, job, department, localit, callback)=> {
    
    async.waterfall([
        (next)=>{
                if(types == 'cutoff'){
                    if(!param_emp){
                        querys = `CALL db_hrms_prod.trial_employee_attendance_record(NULL,NULL,'${rangeDt}',${department},${job},${localit},'CUTOFF')`;

                    }else{
                        querys = `CALL db_hrms_prod.trial_employee_attendance_record('${param_emp}',NULL,'${rangeDt}',${department},${job},${localit},'CUTOFF')`;
                    }
                }else if(types == 'cut-off-record'){
                    if(!param_emp){

                        querys = `CALL db_hrms_prod.trial_employee_attendance_record(NULL,NULL,'${rangeDt}',${department},${job},${localit},'CUTOFF')`;
                    }else{
                        querys = `CALL db_hrms_prod.trial_employee_attendance_record('${param_emp}',NULL,'${rangeDt}',${department},${job},${localit},'CUTOFF')`;
                        
                    }
                }else if(types == `attendance`){
                    querys = `CALL db_hrms_prod.trial_employee_attendance_record('${param_emp}','${rangeDt}',NULL,NULL,NULL,NULL,'ATTENDANCE')`;
                }else if(types == "perday"){
                    querys = `CALL db_hrms_prod.trial_employee_attendance_record('${param_emp}','${rangeDt}',NULL,NULL,NULL,NULL,'ATTENDANCE')`;
                }
                //console.log(querys, 7777);
                database.query(querys, (err, result)=>{
                    if(err) return next(true, err)
                    
                    if(result[0].length == 0){
                        next(true, 'Data is Empty');
                    }else{
                        return next(null, result[0])
                    }
                })
        },(query, cb1)=>{
            (async function() {
                var sch_date = []
                var training_temp = [];
                if(query != null && query.length > 1){
                    var query2 = [];

                    for(var key in query){
                        var value = query[key]
                        // console.log(value.fromx, 'fromxxxxxx')
                        if(value.employee_id && value.Name){
                            let variable = {
                                employee_id : query.employee_id,
                                date        : query.date
                            }
                            query2.push(value)
                        }
                    }

                    if(query2.length > 0){query = query2}

                    for(var key in query){
                        var value = query[key];

                        var date_changeShift  =  '';
                        var schedule= value.schedule;
                        query[key].tox = value.tox;
                        query[key].fromx = value.fromx
                        var fromx = value.fromx;
                        var tox = value.tox;

                        query[key].schedule = schedule || '-';
                        
                        // if(schedule === undefined || query[key].schedule === undefined){
                        //     return console.log(query[key], schedule, 10000)
                        // }


                        if(['BL','T','TB','OB'].includes(value.shift_code)){
                            value.timeIn    = '-';
                            value.timeOut   = '-';
                        }
                        
                        // get data and time
                        sch_date.push({
                            'date' : value.date,
                            'time' : {
                                'in'  : fromx,
                                'out' : tox,
                                'timeIn' : value.timeIn,
                                'timeOut' : value.timeOut
                            }
                        });

                        /** workhour */
                        var workhours = null;
                        var timeIn = value.timeIn;

                        var total_menit_workhours = null;
                        var short_fix = null;
                        var late_fix = null;
                        var earlyOut_fix = null;
                        var eot_fix2 = null;
                        var overT_fix = null;
                        
                        if((value.timeIn !== '-' && value.timeOut !==  '-') || (value.timeIn !== null &&  value.timeOut !==  null)){
                            if(value.timeIn !== null &&  value.timeOut !==  null){
                                // console.log('ALASIASHHHBUOSSSS')
                               // timeIn                          += ':00';
                                var fromx2                      = fromx;
                                //return console.log(fromx2, 10000);
                                var timeOuts                    = value.timeOut;
                                //timeOuts                        += ':00';
                                var date_inquire_absen          = value.date_inquire_absen;
                                var dates                       = value.date;
                                var dates_Biometric             = value.date_absen;
                                var strtotime_TimeInInquire     = formatDate(`${value.date_inquire_absen}T${timeIn}`, 'datetiemtoms');
                                var strtotime_TimeInBiometric   = formatDate(`${value.date_absen}T${timeIn}`, 'datetiemtoms');
                                var strtotime_formx             = formatDate(`${value.date}T${fromx2}`, 'datetiemtoms');
                                var strtotime_tox               = formatDate(`${value.date}T${tox}`, 'datetiemtoms');
                                var strtotime_TimeOutBiometric  = formatDate(`${value.date_absen}T${timeOuts}`, 'datetiemtoms');
                                var strtotime_TimeOutInquire    = formatDate(`${value.date_inquire_absen}T${timeOuts}`, 'datetiemtoms');

                                // ######################################################################################
                                
                                var am_pm_form                  = formatDate(strtotime_formx, 'toampm')
                                var am_pm_to                    = formatDate(strtotime_tox, 'toampm')

                                if(value.date_inquire_absen){
                                    var am_pm_deviceFrom 				= formatDate(strtotime_TimeInBiometric,  'toampm');
                                    var am_pm_deviceTo					= formatDate(strtotime_TimeOutInquire,  'toampm');
                                }else{

                                    if(am_pm_form == 'pm' && am_pm_to == 'am'){
                                        // console.log('ULALALALALALA')
                                        var am_pm_bio1                  = formatDate(strtotime_TimeInBiometric, 'toampm');
                                        var am_pm_bio2                  = formatDate(strtotime_TimeOutBiometric, 'toampm');

                                        if(am_pm_bio1 == 'am' && am_pm_bio2 == 'pm'){
                                            var strtotime_tox = formatDate(`${value.date}T${tox}`, 'datetiemtoms');
                                            var strtotime_TimeOutBiometric = formatDate(`${value.date_absen}T${timeOuts}`, 'datetiemtoms');
                                        }else{
                                            var strtotime_tox = formatDate(`${value.date}T${tox}`, "+1 day");
                                            var strtotime_TimeOutBiometric = formatDate(`${value.date_absen}T${timeOuts}`, "+1 day");
                                        }
                                    }
                                    var am_pm_deviceFrom 				= formatDate(strtotime_TimeInBiometric,  'toampm');
                                    var am_pm_deviceTo					= formatDate(strtotime_TimeOutBiometric,  'toampm');
                                }

                                var am_pm_schFrom 			= formatDate(strtotime_formx, 'toampm');
                                var am_pm_schTo				= formatDate(strtotime_tox, 'toampm');
                                var am_pm_sch_from 			= formatDate(fromx2, 'toampm2');
                                var am_pm_sch_to 			= formatDate(tox, 'toampm2');

                                var splitOut_time 		= timeOuts.split(":");
                                var splitOut_time_h 	= splitOut_time[0];
                                var splitOut_time_m 	= splitOut_time[1];

                                var LIB_CALL_ATT = calculation_attendance({
                                    'value'							: value,
                                    'fromx2'						: fromx2,
                                    'tox'							: tox,
                                    'strtotime_formx'				: strtotime_formx,
                                    'strtotime_tox'					: strtotime_tox,
                                    'timeIn' 						: timeIn,
                                    'timeOuts' 						: timeOuts,
                                    'strtotime_TimeInInquire' 		: strtotime_TimeInInquire,
                                    "strtotime_TimeInBiometric" 	: strtotime_TimeInBiometric,
                                    "strtotime_TimeOutInquire" 		: strtotime_TimeOutInquire,
                                    "strtotime_TimeOutBiometric" 	: strtotime_TimeOutBiometric,
                                    "late_fix" 						: late_fix,
                                    "eot_fix2" 						: eot_fix2
                                })

                                value                           = LIB_CALL_ATT.value;
                                fromx2   						= LIB_CALL_ATT.fromx2;
                                tox      						= LIB_CALL_ATT.tox;
                                strtotime_formx      			= LIB_CALL_ATT.strtotime_formx;
                                strtotime_tox    				= LIB_CALL_ATT.strtotime_tox;
                                strtotime_TimeInInquire      	= LIB_CALL_ATT.strtotime_TimeInInquire;
                                strtotime_TimeInBiometric 		= LIB_CALL_ATT.strtotime_TimeInBiometric;
                                strtotime_TimeOutInquire 		= LIB_CALL_ATT.strtotime_TimeOutInquire;
                                strtotime_TimeOutBiometric 	    = LIB_CALL_ATT.strtotime_TimeOutBiometric;
                                late_fix 						= LIB_CALL_ATT.late_fix;
                                eot_fix2 						= LIB_CALL_ATT.eot_fix2;
                                var total_device_workhours 		= LIB_CALL_ATT.total_device_workhours;
                                
                                var total_schedule_workhours    = strtotime_tox - strtotime_formx;
                                
                                // schedule work
                                var total_schedule_minutes 	= total_schedule_workhours / 60;

                                var split_schedule_hours 	= Math.floor(total_schedule_minutes / 60);
                                
                                var split_schedule_minutes 	= (total_schedule_minutes % 60);
                                
                                var total_device_minutes    = total_device_workhours / 60;
                                
                                var split_device_minutes 	= (total_device_minutes % 60);
                                var split_device_hours 		= Math.floor(total_device_minutes / 60);
                                
                                if(value.date_inquire_absen){
                                    var mktime_do 	= (strtotime_TimeOutBiometric-strtotime_TimeInInquire)/60;
                                   
                                    var time_do     = Math.floor(mktime_do / 60) + ':' + (mktime_do % 60)
                                    
                                    
                                }else{
                                    var mktime_do 	= (strtotime_TimeOutBiometric-strtotime_TimeInBiometric)/60;
                                    
                                    var time_do     = Math.floor(mktime_do / 60) + ':' + (mktime_do % 60)
                                    
                                }
                                // OVERTIME

                                var tmp_m = 0;
                                var tmp_h = 0;

                                // if(split_schedule_hours < split_device_hours){
                                    
                                //     if(split_schedule_minutes < split_device_minutes){
                                //         tmp_m = split_device_minutes - split_schedule_minutes
                                //     }else{
                                //         tmp_m = split_schedule_minutes - split_device_minutes
                                //     }

                                //     tmp_h = split_device_hours - split_schedule_hours
                                //     if(tmp_m < 10){ tmp_m = "0" + tmp_m }
                                //     if(tmp_h < 10){ tmp_h = "0" + tmp_h }

                                //     query[key].total_overtime = `${tmp_h}:${tmp_m}`;
                                //     if(`${tmp_h}:${tmp_m}` == "00:00"){
                                //         query[key].total_overtime = "-";
                                //     }           
                                // }else{

                                //     if(split_schedule_minutes < split_device_minutes){
                                //         tmp_m = split_device_minutes - split_schedule_minutes
                                //     }else{
                                //         tmp_m = split_schedule_minutes - split_device_minutes
                                //     }

                                //     // console.log(tmp_m, 'TMP MMMMMMMMM')

                                //     if(tmp_m < 10){ tmp_m = "0" + tmp_m }
                                //     if(tmp_h < 10){ tmp_h = "0" + tmp_h }

                                //     query[key].total_overtime = `${tmp_h}:${tmp_m}`;
                                //     if(`${tmp_h}:${tmp_m}` == "00:00"){
                                //         query[key].total_overtime = "-";
                                //     }         
                                // }
                                
                                var time_work = null;
                                if(split_device_hours < 10){
                                    time_work = `0${split_device_hours}:`
                                }else{
                                    time_work = `${split_device_hours}:`
                                }

                                if(split_device_minutes < 10){
                                    time_work += `0${split_device_minutes}`
                                }else{
                                    time_work += `${split_device_minutes}`
                                }

                                var timeOut_device_fix0 = moment.unix(strtotime_TimeInBiometric/1000, 'YYYY-MM-DD HH:mm:ss').add(split_schedule_hours, 'hours')
                                
                                var timeOut_device_fix = moment(new Date(timeOut_device_fix0)).format('x');
                                

                                /*
                                * CARI EARLYOUT
                                * earlyout not working training and dayoff
                                */
                                if(timeOut_device_fix > strtotime_TimeInBiometric){
                                    var mktimes_earlyOut_fix    = timeOut_device_fix - strtotime_TimeOutBiometric;
                                    
                                    var earlyOut_fix            = formatDate(mktimes_earlyOut_fix, 'sectohm')
                                    
                                }else{
                                    var earlyOut_fix            = null
                                }

                                /* CARI SHORT
                                *  short not working dayoff and training 
                                */
                                if(total_device_workhours < total_schedule_workhours){
                                    var mktimes_short_fix       = total_schedule_workhours - total_device_workhours;
                                    var short_fix               = formatDate(mktimes_short_fix, 'sectohm')
                                }else{
                                    var short_fix            = null
                                }


                                // OVERTIME FIX
                                // if(total_schedule_workhours < total_device_workhours){
                                //     var mktimes_overtime_fix       = (total_device_workhours - total_schedule_workhours);
                                    
                                //     let hours = 3600;
                                //     if(mktimes_overtime_fix < hours){
                                //         var total_overtime_fix  = null
                                //     }else{
                                //         var total_overtime_fix         = formatDate(mktimes_overtime_fix, 'sectohm')
                                //     }
                                    
                                // }else{
                                //     var total_overtime_fix  = null
                                // }

                                //query[key].total_overtime = total_overtime_fix;
                               
                                var exp_strtotime_TimeInInquire 	= strtotime_TimeInInquire.toString().split(':');
                                var exp_strtotime_TimeInBiometric 	= strtotime_TimeInBiometric.toString().split(':');
                                var exp_strtotime_formx 			= strtotime_formx.toString().split(':');
                                var exp_strtotime_TimeOutBiometric  = strtotime_TimeOutBiometric.toString().split(':');
                                var exp_timein 					    = timeIn.toString().split(':');
                                var late_time 						= null;
                                var mktimes_workhours_device        = total_device_workhours/60;

                                workhours                           = time_work;
                                
                                var toxminfromx     = formatDate(tox, 'timetos') - formatDate(fromx, 'timetos')
                                
                                var toxminfromxhi   = formatDate(toxminfromx, 'stotime')
                                
                                if(formatDate(workhours, 'timetos') > formatDate(toxminfromxhi, 'timetos')){
                                    
                                    var Eout = 0
                                }else{
                                    
                                    var timeOut = value.timeOut;
                                    timeOut     += ':00'
                                    
                                    
                                    var time1   = query[key].schedule.substr(6,5) + ':00'
                                   
                                    if(formatDate(time1, 'timetos') < formatDate(timeOut, 'timetos')){
                                        Eout    = 0
                                    }else{
                                        var eout1 = formatDate(time1, 'timetos') - formatDate(value.timeOut, 'timetos')
                                        Eout    = formatDate(eout1, 'stotimehs')
                                        
                                    }
                                }

                            }else{
                                var Eout        = '-';
                                var workhours   = null;
                            }       
                        }else{ // Not Found Activity Device
                            Eout        = '-';
                            workhours   = null;
                        }

                       // query[key].WorkHours = workhours;
                        // if(query[key].shift_code == 'DO' && typeof(timeIn != undefined) && typeof(timeOuts != undefined)){
                        //     if(typeof(time_do != undefined)){
                        //         workhours = time_do
                        //     }
        
                        //     query[key].WorkHours          = workhours;
                        //     query[key].OvertimeRestDay    = workhours;
                        // }
        
        
                        query[key].Short  =  short_fix;
                        // query[key].schedule_mod = query[key].schedule.substr(0,5) + ':00';
                        
                        // if(value.date_inquire_absen){
                        //     // console.log('11111111')
                        //     var jam_schedule        = value.fromx.split(':')
                        //     var jam_masuk_device    = value.timeIn.split(':');

                        //     var am_pm               = formatDate(value.timeIn, 'toampm2')

                        //     if(am_pm == 'am'){      
                        //         // belum
                        //         var countings =  formatDate(`${value.date_inquire_absen}T${value.timeIn}`, 'datetiemtoms') -  formatDate(`${value.date}T${query[key].schedule_mod}`, 'datetiemtoms')
                        //     }else{
                        //         if(formatDate(`${value.date_absen}T${value.timeIn}`, 'datetiemtoms') <= formatDate(`${value.date}T${query[key].schedule_mod}`, 'datetiemtoms')){
                        //             var late = null;
                        //             countings = null;
                        //         }else{
                        //             countings = formatDate(`${value.date_absen}T${value.timeIn}`, 'datetiemtoms') - formatDate(`${value.date}T${query[key].schedule_mod}`, 'datetiemtoms')
                        //         }
                        //     }

                        //     if(!countings){
                        //         late = null
                        //     }else{
                        //         late = moment(countings, 'HH:mm')
                        //     }
                        // }else{
                        //     let a = query[key].schedule_mod.split(':')
                        //     // console.log(a, 'SI AAAA')
                        //     var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
                        //     if(formatDate(query[key].schedule_mod, 'timetos') < formatDate(value.timeIn, 'timetos') && value.timeOut != null){
                        //         late = formatDate((formatDate(value.timeIn, 'timetos') - formatDate(query[key].schedule_mod, 'timetos')), 'stotimehs')
                        //     }else{
                        //         late = null
                        //     }
                        // }
                        // query[key].Late = late_fix
                        // query[key].EarlyOut = eot_fix2
                        // query[key].Short  =  short_fix;

                    }
                }
                return cb1(null, query, sch_date)
            })()
        },(querys,sch_date, next)=>{
            let tmp = [];

            for (let i = 0; i < querys.length; i++) {
                
                var noTimeOutStatus = "no";
                var noTimeInStatus = "no";
                var overStatus = 'no';
                var status = 'no';
                if(querys[i].timeIn){
                    noTimeInStatus = 'yes';
                }
                if(querys[i].timeOut){
                    noTimeOutStatus = 'yes';
                }

                if(querys[i].total_overtime){
                    overStatus = 'yes';
                }

                if(querys[i].ApproveStatus ==1){
                    status = 'yes';
                }
                 
                if(querys[i].OvertimeRestDay && querys[i].OvertimeRestDay_Color == 'green'){
                    querys[i].earlyOut = null;
                    querys[i].Late = null;
                    querys[i].Short = null;
                    querys[i].total_overtime = null;
                }

                tmp.push({
                    'check_holiday': querys[i].check_holiday,
                    'job': querys[i].job,
                    'department': querys[i].department,
                    'department_name': querys[i].department_name,
                    'local_it': querys[i].local_it,
                    'early_c' :  querys[i].early_c,
                    'date' :  querys[i].date,
                    'nextday': querys[i].nextdays,
                    'colorLate' :  querys[i].colorLate,
                    'employee_id' :  querys[i].employee_id,
                    'Name' :  querys[i].Name,
                    'first_name' :  querys[i].first_name,
                    'last_name' :  querys[i].last_name,
                    'schedule' :  querys[i].schedule,
                    'schedule_shift_code' :  querys[i].schedule_shift_code,
                    'timeIn' :  querys[i].timeIn || '-',
                    'timeOut' :  querys[i].timeOut || '-',
                    'noTimeIn' :  noTimeInStatus,
                    'noTimeOut' :  noTimeOutStatus,
                    'WorkHours' :  querys[i].WorkHours || '-',
                    'workStatus' :  querys[i].WorkHours || '-',
                    'total_overtime' :  querys[i].total_overtime || '-',
                    'new_color_overtime' :  querys[i].new_color_overtime,
                    'before_work_hours': querys[i].before_overtime,
                    'after_work_hours': querys[i].after_overtime,
                    'overStatus' :  overStatus,
                    'status' :  status,
                    'OvertimeRestDay' :  querys[i].OvertimeRestDay || '-',
                    'OvertimeRestDay_Color' :  querys[i].OvertimeRestDay_Color,
                    // 'overtime_start_time' :  overtime_start_time,
                    // 'overtime_end_time' :  overtime_end_time,
                    // 'timeOutStatus' :  timeOutStatus,
                    // 'timeInStatus' :  timeInStatus,
                    'C_TimeIn' :  querys[i].C_TimeIn,
                    'C_TimeOut' : querys[i].C_TimeOut,
                    'Short' :  querys[i].Short || '-' /*(short == 0 ? short = '-' : short = short  )*/,
                    'Late' :  querys[i].Late || '-' /*(late == 0 ? late = '-' : late = late  )*/,
                    'EarlyOut' :   querys[i].EarlyOut || '-',
                    'undertime_req' :   querys[i].undertime_req || '-',
                    'earlyout_req' :   querys[i].earlyout_req || '-',
                    'undertime_status' :   querys[i].undertime_status || '-',
                    'earlyout_status' :   querys[i].earlyout_status || '-',
                    // 'between' :  between,
                    'sch_workhours': querys[i].sch_workhours,
                    'undertime': querys[i].undertime || '-',
                    'undertime_color': querys[i].undertime_color,
                    'ndot_status': querys[i].ndot_status,
                })
            }
            next(null, tmp);
        }
    ], (err, result)=>{
        if(err){
            return callback(true, {
                data : [],
                status: 50,
                message : 'record is empty'
            })
        }else{
            return callback(null, {
                data :result,
                status: 200,
                message : 'View record schedule'
            })
        }
    })
}
