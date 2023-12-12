'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objJobpost = require('../process/employer_jobpost_process_controller');
const Logger = require('../services/logger_service')
const objMail = require('../process/send_email_process_controller');
const objEmployerProfile = require('../process/employer_profile_view_process_controller');
const objSendNotification = require('../process/send_notification_process_controller');  
const objJobView = require('../process/employee_job_view_process_controller')
const logger = new Logger('logs')
exports.JobPostLoad = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Job Post Load ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    objJobpost.PostedTotalCount(logparams, req, function (totalcount) {
                        ////console.log(totalcount);
                        if (totalcount != 0 && totalcount > 0) {
                            objJobpost.PostedCount(logparams, req, function (postcount) {
                                if (postcount != null) {
                                    ////console.log(postcount);
                                    var result = Number(totalcount - postcount);
                                    ////console.log(result);

                                    if (result != 0 && result > 0) {
                                        objJobpost.FormLoad(logparams, req, function (loadresult) {
                                            if (loadresult != null) {
                                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                    const msgparam = { "messagecode": objconstants.listcode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            employer_json_result: {
                                                                response: objconstants.successresponsecode,
                                                                varstatuscode: objconstants.listcode,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey,
                                                                Languagelist: loadresult.languagelist,
                                                                Genderlist: loadresult.genderlist,
                                                                Maritallist: loadresult.maritallist,
                                                                Shiftlist: loadresult.shiftlist,
                                                                JobFunctionlist: loadresult.jobfunction,
                                                                JobRolelist: loadresult.jobrole,
                                                                EducationcategoryList: loadresult.educationcategory,
                                                                Branchlist: loadresult.branch,
                                                                Facilitylist: loadresult.facility,
                                                                Specializationlist: loadresult.specialization,
                                                                Qualificationlist: loadresult.qualification,
                                                                ExperienceList: loadresult.experience,
                                                                SkillList: loadresult.skill,
                                                                DistrictList: loadresult.districtlist,
                                                                StateList: loadresult.statelist,
                                                                TalukList:loadresult.taluklist,
                                                                JobtypeList: loadresult.jobtype,
                                                                industrycode: loadresult.industrycode,
                                                                currenttime: currenttime,
                                                                maxskillcount: loadresult.settingsresult[0].employee_skill_count
                                                            }
                                                        });

                                                    });
                                                });                                                
                                            }
                                            else {
                                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        employer_json_result: {
                                                            varstatuscode: objconstants.recordnotfoundcode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                            response: objconstants.successresponsecode,
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": objconstants.jobpostexceedcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                employer_json_result: {
                                                    varstatuscode: objconstants.jobpostexceedcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objconstants.successresponsecode,
                                                }
                                            });
                                        });
                                    }
                                      }
                                    //  else {
                                    //      const msgparam = { "messagecode": objconstants.notvalidcode };
                                    //      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    //          return res.status(200).json({
                                    //              employer_json_result: {
                                    //                  varstatuscode: objconstants.notvalidcode,
                                    //                  responsestring: msgresult[0].messagetext,
                                    //                  responsekey: msgresult[0].messagekey,
                                    //                  response: objconstants.successresponsecode,
                                    //              }
                                    //          });
                                    //      });
                                    //  } 
                                });
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.notvalidcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.notvalidcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                    }
                                });
                            });
                        }
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Job post Load: " + e);
    }
}
exports.InsertJobpost = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Job post Insertion ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    if (req.body.jobfunctioncode != null) {
                        // //console.log(req.body.branch);
                        objUtilities.InsertLog(logparams, function (validlog) {
                            if (validlog != null && validlog != "") {
                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                    var d = new Date(currenttime),
                                                        month = ('' + (d.getMonth() + 1)).padStart(2, "0"),
                                                        day = ('' + d.getDate()).padStart(2, "0"),
                                                        year = ('' + d.getFullYear()).substring(2,4);
                                    var prefix = year+month+day;
                                    objJobpost.getMaxcode(logparams, function (validcode) {
                                        objJobpost.generateJobId(logparams,prefix, function (jobserialno) {
                                            if (jobserialno != null && jobserialno != 0) {
                                                    var noofdays = req.body.subscriptiondetails.validitydays - 1
                                                    var jobpostcreateddate = new Date();
                                                    var newdate = new Date(new Date(jobpostcreateddate).setDate(jobpostcreateddate.getDate() + noofdays))
                                                    newdate.setHours(23,59,59,0)
                                                    var jobpostexpirydate = newdate.getTime();
                                                    // console.log(newdate);
                                                    // console.log(milliseconds);
                                                    
                                                    var prefixcode = prefix + ('' +jobserialno).padStart(4, "0");
                                                    var insertitem = req.body;
                                                    insertitem.validitydate = jobpostexpirydate;
                                                    insertitem.jobcode = (Number(validcode));
                                                    insertitem.jobid = prefixcode;
                                                    insertitem.jobprefix = prefix;
                                                    insertitem.jobserialno = jobserialno;
                                                    insertitem.makerid = validlog;
                                                    insertitem.createddate = currenttime;
                                                    insertitem.updateddate = 0;
                                                    objJobpost.InsertJobpost(logparams, insertitem, function (insertresult) {
                                                        if (insertresult != null && insertresult > 0) {
                                                            var employercode = { "employercode": insertitem.employercode };
                                                              
                                                            const msgparam = { "messagecode": objconstants.createcode };
                                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                return res.status(200).json({
                                                                    employer_json_result: {
                                                                        varstatuscode: objconstants.createcode,
                                                                        responsestring: msgresult[0].messagetext,
                                                                        responsekey: msgresult[0].messagekey,
                                                                        response: objconstants.successresponsecode,
                                                                    }
                                                                });
                                                            });
                                                                if(req.body.statuscode==4){
                                                                    objUtilities.GetAdminMailId( objconstants.admincode ,function(mailid){
                                                              
                                                                        //adminmailid = ' '
                                                                        var empparams = { "employercode": insertitem.employercode, "jobcode": Number(validcode), employeecode: 0, languagecode: objconstants.defaultlanguagecode, statuscode: [0] };
                                                                        objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
                                                                            objMail.JobPostSubmission(logparams, insertitem.employercode, jobviewresult[0], mailid, function (validmail) {
                                                                            });
                                                                            objSendNotification.SendJobApprovalNotification(logparams,insertitem.employercode, jobviewresult[0] ,function(result){
                                                                            });
                                                                        });
                                                                
                                                                    });
                                                                }
                                                                
                                                            
                                                            //var registered_email = req.body.registered_email;
                                                            // //console.log(registered_email);
                                                                
                                                            
                                                        }
                                                        else {
                                                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                return res.status(200).json({
                                                                    employer_json_result: {
                                                                        varstatuscode: objconstants.recordnotfoundcode,
                                                                        responsestring: msgresult[0].messagetext,
                                                                        responsekey: msgresult[0].messagekey,
                                                                        response: objconstants.successresponsecode,
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    })
                                                
                                                
                                            }
                                        });
                                    });
                                    
                                });
                            }
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.notvalidcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.notvalidcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }

                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Job post Insertion: " + e);
    }
}
exports.UpdateJobpost = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Job post Insertion ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    if (req.body.jobfunctioncode != null) {
                        objJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                            if (existscode != null && existscode > 0) {
                                objUtilities.InsertLog(logparams, function (validlog) {
                                    if (validlog != null && validlog != "") {
                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                            var updateitem = req.body;
                                            updateitem.makerid = validlog;
                                            updateitem.updateddate = currenttime;
                                            ////console.log(updateitem);
                                            objJobpost.UpdateJobpostDetails(logparams, req, updateitem, function (updateresult) {
                                                if (updateresult != null && updateresult > 0) {
                                                    const msgparam = { "messagecode": objconstants.updatecode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            employer_json_result: {
                                                                varstatuscode: objconstants.updatecode,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey,
                                                                response: objconstants.successresponsecode,
                                                            }
                                                        });
                                                    });
                                                    if(req.body.statuscode==4){
                                                        objUtilities.GetAdminMailId( objconstants.admincode ,function(mailid){
                                                  
                                                            //adminmailid = ' '
                                                            var empparams = { "employercode": updateitem.employercode, "jobcode": Number(req.query.jobcode), employeecode: 0, languagecode: objconstants.defaultlanguagecode, statuscode: [0] };
                                                            objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
                                                                objMail.JobPostSubmission(logparams, updateitem.employercode, jobviewresult[0], mailid, function (validmail) {
                                                                });
                                                                objSendNotification.SendJobApprovalNotification(logparams,updateitem.employercode, jobviewresult[0] ,function(result){
                                                                });
                                                            });
                                                    
                                                        });
                                                    }
                                                }
                                                else {
                                                    const msgparam = { "messagecode": objconstants.alreadyapproved };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            employer_json_result: {
                                                                varstatuscode: objconstants.alreadyapproved,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey,
                                                                response: objconstants.successresponsecode,
                                                            }
                                                        });
                                                    });
                                                }
                                            })
                                        });
                                        

                                    }
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                        });

                    }
                    else {
                        const msgparam = { "messagecode": objconstants.notvalidcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.notvalidcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }

                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Job post Insertion: " + e);
    }
}
exports.JobPost_list_by_code = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Job post EditLoad ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    // //console.log(req.query.jobcode);
                    if (req.query.jobcode != null) {
                        objJobpost.EditLoadByCode(logparams, req, function (response) {
                            if (response != null && response.length > 0) {
                                const msgparam = { "messagecode": objconstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            response: objconstants.successresponsecode,
                                            varstatuscode: objconstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            jobpost_list: response
                                        }
                                    });

                                });
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in jobpost List by Code: " + e);
    }
}
exports.DeleteJobpost = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Job post details delete ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    // //console.log(req.query.jobcode);
                    objJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                        if (existscode != null && existscode > 0) {
                            objJobpost.DeleteJobpostDetails(logparams, req, function (deleteresult) {
                                if (deleteresult != null && deleteresult > 0) {
                                    const msgparam = { "messagecode": objconstants.deletecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employer_json_result: {
                                                varstatuscode: objconstants.deletecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employer_json_result: {
                                                varstatuscode: objconstants.recordnotfoundcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });
                            });
                        }
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Deletion jobpost: " + e);
    }
}
exports.UpdateStatuscode = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Update Statuscode', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    if (req.query.statuscode != null) {
                        objJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                            if (existscode != null && existscode > 0) {
                                if (Number(req.query.statuscode) == objconstants.approvedstatus) {
                                    objJobpost.UpdateApprovedStatuscodeInjobpost(logparams, req, function (updateresult) {
                                        if (updateresult != 0 && updateresult > 0) {
                                            const msgparam = { "messagecode": objconstants.approvedcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    employer_json_result: {
                                                        varstatuscode: objconstants.approvedcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                        response: objconstants.successresponsecode,
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            const msgparam = { "messagecode": objconstants.alreadyapprovedcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    employer_json_result: {
                                                        varstatuscode: objconstants.alreadyapprovedcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                        response: objconstants.successresponsecode,
                                                    }
                                                });
                                            });
                                        }
                                    });

                                }
                                else if (Number(req.query.statuscode) == objconstants.inactivestatus) {
                                    objJobpost.UpdateInactiveStatuscodeInjobpost(logparams, req, function (updateresult) {
                                        if (updateresult != 0 && updateresult > 0) {
                                            const msgparam = { "messagecode": objconstants.accinactivecode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    employer_json_result: {
                                                        varstatuscode: objconstants.accinactivecode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                        response: objconstants.successresponsecode,
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            const msgparam = { "messagecode": objconstants.alreadydeactivatedcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    employer_json_result: {
                                                        varstatuscode: objconstants.alreadydeactivatedcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                        response: objconstants.successresponsecode,
                                                    }
                                                });
                                            });
                                        }
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employer_json_result: {
                                                varstatuscode: objconstants.recordnotfoundcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objconstants.successresponsecode,
                                            }
                                        });
                                    });
                                }
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.notvalidcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.notvalidcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }

                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Statuscode jobpost: " + e);
    }
}
exports.JobPostList = function (req, res) {
    try {
        objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Jobpost List', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1) {
                    objJobpost.JobpostListPortal(logparams, req, function (validresult) {
                        if (validresult != null && validresult.length > 0) {
                            const msgparam = { "messagecode": objconstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                        employerlist: validresult
                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                    }
                                });
                            });
                        }
                    })
                }
                else if (req.query.appcode == 2) {
                    objJobpost.JobpostListInApp(logparams, req, function (validresult) {
                        if (validresult != null && validresult.length > 0) {
                            const msgparam = { "messagecode": objconstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                        employerlist: validresult
                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                    }
                                });
                            });
                        }
                    })
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in jobpost List : " + e);
    }
}
exports.FilterList = function (req, res) {
    try {
        // //console.log("entry")
        // //console.log("employercode",req.query.employercode);
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Filter List', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    objJobpost.JobfunctionList(logparams, req, function (jbfunlist) {
                        objJobpost.JobRoleList(logparams, req, function (jobroleresult) {
                            if (jbfunlist != null && jbfunlist.length > 0 && jobroleresult != null && jobroleresult.length > 0) {
                                const msgparam = { "messagecode": objconstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                            jobfunctionlist: jbfunlist,
                                            jobrolelist: jobroleresult
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                        });

                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }

        });
    }
    catch (e) {
        logger.error("Error in Filter List : " + e);
    }
}
exports.UpdateValiditydate = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Update validitydate', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    objJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                        if (existscode != null && existscode > 0) {
                            objJobpost.UpdateValidate(logparams, req, function (updateresult) {
                                if (updateresult != null && updateresult > 0) {
                                    const msgparam = { "messagecode": objconstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employer_json_result: {
                                                varstatuscode: objconstants.updatecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objconstants.successresponsecode,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employer_json_result: {
                                                varstatuscode: objconstants.recordnotfoundcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objconstants.successresponsecode,
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                    }
                                });
                            });
                        }

                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update validitydate  jobpost: " + e);
    }
}


exports.UpdateJobpostAfterApproval = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Update Job post after approval', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    //if (req.query.statuscode != null) {
                        objJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                            if (existscode != null && existscode > 0) {
                                //if (Number(req.query.statuscode) == objconstants.approvedstatus) {
                                    objJobpost.UpdatejobpostAfterApproval(logparams, req, function (updateresult) {
                                        if (updateresult != 0 && updateresult > 0) {
                                            const msgparam = { "messagecode": objconstants.updatecode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    employer_json_result: {
                                                        varstatuscode: objconstants.updatecode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                        response: objconstants.successresponsecode,
                                                    }
                                                }); 
                                                
                                            });
                                            // //Get Edited status code
                                            // var editedstatuscode =0;
                                            // if(req.body){
                                            //     if(req.body.editedstatuscode){
                                            //         editedstatuscode = req.body.editedstatuscode;
                                            //     }
                                            // }
                                            //     if(editedstatuscode == 4){
                                            //         //Send mail and notification 
                                            //         objUtilities.GetAdminMailId( objconstants.admincode ,function(mailid){
                                                                                                                
                                            //             //adminmailid = ' '
                                            //             var empparams = { "employercode": req.body.employercode, "jobcode": Number(req.query.jobcode), employeecode: 0, languagecode: objconstants.defaultlanguagecode, statuscode: [0] };
                                            //             objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
                                            //                 objMail.JobPostSubmission(logparams, req.body.employercode, jobviewresult[0], mailid, function (validmail) {
                                            //                 });
                                            //                 objSendNotification.SendJobApprovalNotification(logparams,req.body.employercode, jobviewresult[0] ,function(result){
                                            //                 });
                                            //             });

                                            //         });
                                            // }
                                            

                                        }
                                        else {
                                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    employer_json_result: {
                                                        varstatuscode: objconstants.recordnotfoundcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                        response: objconstants.successresponsecode,
                                                    }
                                                });
                                            });
                                        }
                                    });

                               /*  }
                               
                                else {
                                    const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employer_json_result: {
                                                varstatuscode: objconstants.recordnotfoundcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objconstants.successresponsecode,
                                            }
                                        });
                                    });
                                } */
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                        });
                   /*  }
                    else {
                        const msgparam = { "messagecode": objconstants.notvalidcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.notvalidcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    } */

                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Statuscode jobpost: " + e);
    }
}