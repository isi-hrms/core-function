const database = require('../connection/mysql');
const async = require('async');

// public function currentWorkHour(){
//     $LIB = new calculation;
//     $decode = base64_decode(\Request::get('keys'));
//     $nameDefault = substr($decode,strpos($decode,'-')+1,strpos($decode,'-'));
//     if (\Input::get('name')){
//         $id = \Input::get('name');
//     }
//     else{
//         $id = $nameDefault;
//     }


//     $name = \DB::select("CALL search_employee_by_id ('$id')");

//     $dateRequest = \Input::get('dateRequest');
//     $type = \Input::get('type');
//     // find workshift by given name and dateRequest
//     $check_data1  = \DB::SELECT("select concat(attendance_work_shifts._from,' to ',attendance_work_shifts._to) as schedule from att_swap_shift,att_schedule_request,attendance_work_shifts where att_swap_shift.employee_id =  '$id'  and date = '$dateRequest' and att_swap_shift.swap_id =  att_schedule_request.request_id and att_schedule_request.status_id = 2 and att_swap_shift.old_shift_id =  attendance_work_shifts.shift_id");
//     $check_data2  = \DB::SELECT("select concat(attendance_work_shifts._from,' to ',attendance_work_shifts._to) as schedule from att_swap_shift,att_schedule_request,attendance_work_shifts where swap_with =  '$id'  and date = '$dateRequest' and att_swap_shift.swap_id =  att_schedule_request.request_id and att_schedule_request.status_id = 2 and att_swap_shift.new_shift_id =  attendance_work_shifts.shift_id  ");
//     if($check_data1 != null ){
//         $data_xc  = $check_data1[0]->schedule;
//     }
//     if($check_data2 != null ){
//         $data_xc  = $check_data2[0]->schedule;
//     }

//     $show = \DB::select("CALL View_WorkShift_by_emp('$id','$dateRequest', 'overtime')");

//     if (!$show){
//         return \Response::json(['header'=>['message'=>'No work hour found in '.$dateRequest.' for employee '.$name[0]->name,'status'=>500],'data'=>['name'=>$name[0]->name]],500);
//     }
//     else{
//         $LIB_ATT = $LIB->att('view-attendance-perday',$dateRequest,$id,null,null);
//         $total_overtimes = null;
//         //return $LIB_ATT['data'];
//         if(isset($LIB_ATT['data'][0])){
//             $total_overtimes = $LIB_ATT['data'][0]['total_overtime'];
//             $schedule_att 	= $LIB_ATT['data'][0]['schedule'];
//             if(strlen($schedule_att) < 4){

//                 $total_overtimes = $LIB_ATT['data'][0]['OvertimeRestDay']; 
//             }

//             $timeIn 	= $LIB_ATT['data'][0]['timeIn'];
//             $timeOut 	= $LIB_ATT['data'][0]['timeOut'];

//             $schedule_att 	= $LIB_ATT['data'][0]['schedule'];
//             if(strlen($schedule_att) > 5){

//                 $tmp_explode = explode("-", $schedule_att);
//                 $schedule_att = $tmp_explode[0]." to ".$tmp_explode[1];
//             }else{
//                 $schedule_att = "00:00 to 00:00";
//             }
//             $nextday 	= $LIB_ATT['data'][0]['nextday'];
//             if($total_overtimes == "-"){
//                 // $total_overtimes = $LIB_ATT['data'][0]['OvertimeRestDay']; 
//                 return \Response::json(['header'=>['message'=>'Oertime not found','status'=>404],'data'=>[]],404);
//             }

//         }else{
//             return \Response::json(['header'=>['message'=>'Schedule not found','status'=>404],'data'=>[]],404);
//         }
//         if(!isset($data_xc)){
//             $data_xc =  $show[0]->_from.' to '.$show[0]->_to;
//         }else{
//             $dtxc = explode(' to ', $data_xc);
//             $dtxc_from = explode(':', $dtxc[0]);
//             $dtxc_to = explode(':', $dtxc[1]);


//             if(count($dtxc_from) > 2){
//                 $f = "$dtxc_from[0]:$dtxc_from[1]";
//             }

//             if(count($dtxc_to) > 2){
//                 $t = "$dtxc_to[0]:$dtxc_to[1]";
//             }

//             if(isset($f) && isset($t)){
//                 $data_xc ="$f to $t";
//             }
//         }
//         // data return for overtime and undertime
//         if ($type == "Overtime"){
//             if($schedule_att != $data_xc){
//                 $data_xc = $schedule_att;
//             }
//             $data =   ['name'=>$name[0]->name, 'work_hour' =>$data_xc, 'shift_code' => $show[0]->shift_code, "total_overtime" => $total_overtimes, 'timeIn' => $timeIn, "timeOut"=>$timeOut,"nextday"=>$nextday ];
//         }
//         else{
//             $data =   ['name'=>$name[0]->name, 'from' => $data_xc,'shift_code' => $show[0]->shift_code, 'duration' => $show[0]->duration];
//         }
//         return \Response::json(['header'=>['message'=>'Show schedule work hours','status'=>200],'data'=>$data],200);
//     }
// }
module.exports = (data, empid, callback) => {
    async.waterfall([
        (next)=>{
            if (data.name){ empid = data.name; }
            database.query(
                'CALL search_employee_by_id(?)',
                [empid],
                (err, res) => {
                    if (err) return next('Employee not found', null)
                    try {
                        return next (null, data.test)
                    }
                    catch (error) {
                        return next('Employee not found', null)
                    }
                }
            );
        },
        (name_emp, next)=>{
            database.query(
                'CALL check_overtime(?,?)',
                [empid, data.dateRequest],
                (err, res) => {
                    const msgErr = `No work hour found in ${data.dateRequest} for employee ${name_emp}`;
                    if (err) return next(msgErr, null)
                    try {
                        if(res[0].lenght === 0){
                            return next(msgErr, null);
                        }else{
                            let dataRes = { 
                                name: name_emp,
                                nextday: null,
                                shift_code: null,
                                timeIn: "00:00",
                                timeOut: "00:00",
                                total_overtime: "0",
                                work_hour: "00:00 to 00:00",
                            }
                            if (res[0][0].nextday > 0) dataRes.nextday = true;
                            
                            dataRes.work_hour = `${res[0][0]._from} to ${res[0][0]._to}`;
                            dataRes.shift_code = res[0][0].shift_code;
                            dataRes.timeIn = res[0][0].time_in_biometric;
                            dataRes.timeOut = res[0][0].time_out_biometric;

                            if(res[0][0].overtime_hour <= 9){
                                dataRes.total_overtime = `0${res[0][0].overtime_hour}:`;
                            }
                            if(res[0][0].overtime_munites <= 9){
                                dataRes.total_overtime += `0${res[0][0].overtime_munites}`;
                            }

                            return next(null, dataRes);
                        }
                    }
                    catch (error) {
                        console.log(error, 99)
                        return next(msgErr, null)
                    }
                }
            );
        },
    ], (err, response)=>{
        if(err) return callback(err, null);
        return callback(null, response);
    });
};
