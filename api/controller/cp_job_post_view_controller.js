'use strict';
var get_jobpost_view_details = require('../process/cp_job_post_view_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
var date = new Date(); // some mock date
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
const objJobView = require('../process/employee_job_view_process_controller')
//const objJobpost = require('../process/employer_jobpost_process_controller');
const objMail = require('../process/send_email_process_controller');
var objEmployerProfile = require('../process/employer_profile_view_process_controller');
const objRecommended = require('../process/employer_recommended_process_controller');
const objProfileList = require('../process/employer_profile_list_process_controller');
const objSendNotification = require('../process/send_notification_process_controller');
exports.job_post_view_list = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job post List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (Object.keys(req.body).length > 0) {

                    //var params = { "statuscode": Number(req.query.statuscode) };
                    var params = req.body;
                    get_jobpost_view_details.JobpostList(logparams, params, function (employeeresult) {
                        if (employeeresult != null && employeeresult.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    jobpost_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objConstants.successresponsecode,
                                        jobpost_list: employeeresult

                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    jobpost_json_result: {
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objConstants.successresponsecode
                                    }
                                });
                            });
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            jobpost_json_result: {
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: objConstants.successresponsecode
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        jobpost_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objConstants.successresponsecode
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Jobp post view- Jobpost " + e);
    }
}
exports.update_jobpost_remarks = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update Remarks', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var params = { "jobcode": Number(req.body.jobcode) };
                get_jobpost_view_details.FindJobcode(logparams, params, function (validcode) {
                    if (validcode == true) {
                        // var updateitem = "";
                        // var statuscode=0;
                        // //Get job post details
                        // get_jobpost_view_details.GetJobpostDetails(logparams, req, function (jobresponse) {
                            
                        //     if(jobresponse){
                        //         if(jobresponse.length>0){
                        //             if(jobresponse[0].editedstatuscode){ 
                        //                 if(jobresponse[0].editedstatuscode == 4){
                        //                     statuscode = jobresponse[0].editedstatuscode;
                        //                     updateitem = jobresponse[0];
                        //                     updateitem.experience = jobresponse[0].editedexperience;
                        //                     updateitem.schooling = jobresponse[0].editedschooling;
                        //                     updateitem.afterschooling = jobresponse[0].editedafterschooling;
                        //                     updateitem.salaryrange = jobresponse[0].editedstatuscode;
                        //                 }
                        //             } 
                        //         }
                        //     }  }); 
                        
                            
                            get_jobpost_view_details.UpdateRemarks(logparams, req, function (response) {
                                if (response != null && response != "") {
                                    if (Number(req.body.statuscode) == 9) {
                                        var employercode = { "employercode": Number(req.query.employercode) };
                                        objEmployerProfile.getProfileView(logparams, employercode, objConstants.defaultlanguagecode, function (employerresult) {
                                            var empparams = { "employercode": Number(employercode), "jobcode": req.body.jobcode, employeecode: 0, languagecode: objConstants.defaultlanguagecode };
                                            objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
                                                //objJobpost.ViewJob(logparams, req.body.jobcode, function (jobviewresult) {
                                                    ////console.log(jobviewresult);
                                                objUtilities.GetAdminMailId( objConstants.jobapprovalmailcode ,function(mailid){
                                                    objMail.JobPostRejected(logparams, employercode, jobviewresult[0], mailid, function (validmail) {
                                                    });
                                                });
                                        //adminmailid = ' '
                                            
                                        });
                                        });
                                        const msgparam = { "messagecode": objConstants.jobrejectedcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                jobpost_json_result: {
                                                    varstatuscode: objConstants.jobrejectedcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode
                                                }
                                            });
                                        });
                                        
                                    }
                                    else if ((Number(req.body.statuscode) == 5)) {
                                        var employercode = { "employercode": Number(req.body.employercode) };
                                        objEmployerProfile.getProfileView(logparams, employercode, objConstants.defaultlanguagecode, function (employerresult) {
                                            //var empparams = { "employercode": Number(req.query.employercode), "jobcode": req.body.jobcode, employeecode: 0, languagecode: objConstants.defaultlanguagecode };
                                            var empparams = { "employercode": employercode, "jobcode": Number(req.body.jobcode), employeecode: 0, languagecode: objConstants.defaultlanguagecode, statuscode: [0] };
                                            objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
                                               // //console.log(jobviewresult);
                                               var empparams = {"jobcode": req.body.jobcode};
                                                objRecommended.getJobProfileConditions(logparams, empparams, function(profileresult){
                                                //Get active employee
                                                  objUtilities.FindAllActiveEmployee(objConstants.defaultlanguagecode,function (employeedetails) {
                                                    var getactiveemployees = employeedetails && employeedetails.length > 0 ? employeedetails.length : req.query.limit; 
                                                    var   listparams = {"jobfunctioncode": profileresult[0].jobfunctioncode,"jobrolecode":profileresult[0].jobrolecode, "skillcode":profileresult[0].skillcode, "locationcode":profileresult[0].locationcode, "jobtypecode":profileresult[0].jobtypecode,"schoolqualcode":profileresult[0].schoolqualcode, "afterschoolcatecode":profileresult[0].afterschoolcatecode,  "afterschoolqualcode":profileresult[0].afterschoolqualcode, "afterschoolspeccode":profileresult[0].afterschoolspeccode,"afterschoolcatecode":profileresult[0].afterschoolcatecode, "experiencecode":profileresult[0].experiencecode, "maritalcode":profileresult[0].maritalcode, "gendercode":profileresult[0].gendercode, "differentlyabled": profileresult[0].differentlyabled, "salaryfrom":profileresult[0].salaryfrom, "salaryto": profileresult[0].salaryto, "agefrom": profileresult[0].agefrom, "ageto": profileresult[0].ageto, "anyage": profileresult[0].anyage,"skip":req.query.skip,"limit":getactiveemployees};
                                                    var langparams ={"languagecode": objConstants.defaultlanguagecode, "jobcode": req.body.jobcode};   
                                                    objProfileList.getAllProfiles(logparams, langparams, listparams,6, 0, 0, function (profilelistresult) {
                                                       //  console.log(profilelistresult.count,'profilelistresult.count');
                                                        //Insert Matching profile count
                                                        objUtilities.InsertJobCounts(parseInt(req.body.jobcode),objConstants.matchingprofile,parseInt(profilelistresult.length),function(err, result) {
                                                            
                                                        });
                                                     var makerid = response;
                                                            objUtilities.GetAdminMailId(objConstants.jobapprovalmailcode,function(mailid){
                                                                  const msgparam = { "messagecode": objConstants.approvedcode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        jobpost_json_result: {
                                                                            varstatuscode: objConstants.approvedcode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
                                                                            response: objConstants.successresponsecode
                                                                        }
                                                                    });
                                                                });
                                                                console.log(objConstants.approvedcode,'notificationChanges')
                                                                objSendNotification.SendNewJobNotification(logparams, profilelistresult,req.body.employercode,  jobviewresult[0],makerid, req,function(result){
                                                                });
                                                                //adminmailid = ' '
                                                                
                                                            objMail.JobPostApproval(logparams, req.body.employercode, jobviewresult[0], mailid, function (validmail) {
                                                                
                                                            });
                                                    
                                                        });
                                                        });
                                                    });
                                                });
                                               
                                        });
                                        });
                                        
                                        
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                jobpost_json_result: {
                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode
                                                }
                                            });
                                        });
                                    }
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            jobpost_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objConstants.successresponsecode
                                            }
                                        });
                                    });
                                }
                            })
        
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                jobpost_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objConstants.successresponsecode
                                }
                            });
                        });
                    }
                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        jobpost_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objConstants.successresponsecode
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Remarks- Jobpost " + e);
    }
}
exports.getJobView = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: Number(req.query.usercode) }, function (validemp) {
            if (validemp == true) {
                var objLogdetails;

                ////console.log(langparams);
                var logUserCode = "";
                var logType = "";
                if (req.query.usercode != null) {
                    logUserCode = req.query.usercode;
                    logType = objConstants.portalLogType;
                }
                else {
                    logUserCode = req.query.employeecode;
                    logType = objConstants.employeeLogType;
                }
                var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Job post View', "type": logType };
                objUtilities.getLogDetails(params, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;

                var empparams = { "languagecode": req.query.languagecode, "jobcode": req.query.jobcode, "employeecode": req.query.employeecode, "statuscode": [0] };
                objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
                    ////console.log(jobfunctionresult);
                    if (jobviewresult != null && jobviewresult.length > 0) {
                        //return res.status(200).json({
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            ////console.log("Hello");  
                            ////console.log(prefresult);
                            ////console.log("Hi");
                            return res.status(200).json({
                                job_view_json_result: {
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objConstants.successresponsecode,
                                    job_details: jobviewresult

                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                job_view_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey
                                }

                            });
                        });
                    }
                    ////console.log(response);
                    ////console.log(response.length);


                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        job_view_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey
                        }

                    });
                });
            }
        });

    }
    catch (e) { logger.error("Error in Job post View: " + e); }
}