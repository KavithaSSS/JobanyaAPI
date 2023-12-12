'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const privateobjJobpost = require('../process/employer_private_jobpost_process_controller');
const Logger = require('../services/logger_service')
const objMail = require('../process/send_email_process_controller');
const objEmployerProfile = require('../process/employer_profile_view_process_controller');
const objSendNotification = require('../process/send_notification_process_controller');
const objJobView = require('../process/employee_private_job_view_process_controller')
const objProfileList = require('../process/employer_profile_list_process_controller');
const logger = new Logger('logs')
exports.JobPostLoad = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validemp) {
            // objUtilities.checkvaliduser(req.query.usercode, function (validemp) {
            if (validemp) {
                var logType = objconstants.portalAdminLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job Post Load ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                privateobjJobpost.FormLoad(logparams, req, function (loadresult) {
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
                                        statuscodelist: loadresult.statuscodelist,
                                        Languagelist: loadresult.languagelist,
                                        JobFunctionlist: loadresult.jobfunction,
                                        JobRolelist: loadresult.jobrole,
                                        Facilitylist: loadresult.facility,
                                        ExperienceList: loadresult.experience,
                                        DistrictList: loadresult.districtlist,
                                        StateList: loadresult.statelist,
                                        TalukList: loadresult.taluklist,
                                        currenttime: currenttime
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
        // objUtilities.checkvalidemployer(req.query.usercode, function (validemp) {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validemp) {
            if (validemp) {
                var logType = objconstants.portalAdminLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Private Job post Insertion ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body.jobfunctioncode != null && req.body.jobrolecode != null) {
                    objUtilities.InsertLog(logparams, function (validlog) {
                        if (validlog != null && validlog != "") {
                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                var d = new Date(currenttime),
                                    month = ('' + (d.getMonth() + 1)).padStart(2, "0"),
                                    day = ('' + d.getDate()).padStart(2, "0"),
                                    year = ('' + d.getFullYear()).substring(2, 4);
                                var prefix = year + month + day;
                                privateobjJobpost.getMaxcode(logparams, function (validcode) {
                                    privateobjJobpost.generateJobId(logparams, prefix, function (jobserialno) {
                                        if (jobserialno != null && jobserialno != 0) {
                                            var prefixcode = prefix + ('' + jobserialno).padStart(4, "0");
                                            var insertitem = req.body;
                                            insertitem.jobcode = (Number(validcode));
                                            insertitem.jobid = prefixcode;
                                            insertitem.jobprefix = prefix;
                                            insertitem.jobserialno = jobserialno;
                                            insertitem.makerid = validlog;
                                            insertitem.createddate = currenttime;
                                            insertitem.updateddate = 0;
                                            privateobjJobpost.InsertJobpost(logparams, insertitem, function (insertresult) {
                                                if (insertresult != null && insertresult > 0) {
                                                    var usercode = { "usercode": insertitem.usercode };
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
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validemp) {
            // objUtilities.checkvalidemployer(req.query.usercode, function (validemp) {
            if (validemp) {
                var logType = objconstants.portalAdminLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Private Job post Updation ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body.jobfunctioncode != null && req.body.jobrolecode != null) {
                    privateobjJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                        if (existscode != null && existscode > 0) {
                            objUtilities.InsertLog(logparams, function (validlog) {
                                if (validlog != null && validlog != "") {
                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                        var updateitem = req.body;
                                        updateitem.makerid = validlog;
                                        updateitem.updateddate = currenttime;
                                        ////console.log(updateitem);
                                        privateobjJobpost.UpdateJobpostDetails(logparams, req, updateitem, function (updateresult) {
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
                                                var jobdetails = req.body;
                                                if (req.body.issendnotification == 1 && req.body.statuscode == 5) {
                                                    // SEND PUSH NOTIFICATION TO EMPLOYEE'S
                                                    var experiencecode = [];
                                                    if (jobdetails.experience[0].isfresher == "true") {
                                                        experiencecode.push(0);
                                                    }
                                                    experiencecode.push(jobdetails.experience[0].from);
                                                    experiencecode.push(jobdetails.experience[0].to);
                                                    var listparams = {
                                                        "jobfunctioncode": [jobdetails.jobfunctioncode],
                                                        "jobrolecode": [],
                                                        "skillcode": [],
                                                        "locationcode": [],
                                                        "jobtypecode": [],
                                                        "schoolqualcode": [],
                                                        "afterschoolcatecode": [],
                                                        "afterschoolqualcode": [],
                                                        "afterschoolspeccode": [],
                                                        "experiencecode": experiencecode,
                                                        "maritalcode": [],
                                                        "gendercode": [],
                                                        "differentlyabled": -1,
                                                        "salaryfrom": Number(jobdetails.salaryrange.min),
                                                        "salaryto": Number(jobdetails.salaryrange.max),
                                                        "agefrom": 0,
                                                        "ageto": 0,
                                                        "anyage": 'true',
                                                    };
                                                    // console.log(listparams)
                                                    var langparams = { "languagecode": objconstants.defaultlanguagecode, "jobcode": req.query.jobcode };
                                                    objProfileList.getAllProfiles(logparams, langparams, listparams, 7, 0, 0, function (profilelistresult) {
                                                        // console.log(profilelistresult.length)
                                                        // console.log(profilelistresult)
                                                        // console.log(profilelistresult.filter(t=>t==2))
                                                        var pushedcount = profilelistresult.length;
                                                        objUtilities.InsertFlashJobPushNotificationCounts(parseInt(req.query.jobcode), pushedcount, function (err, result) { });
                                                        var empparams = { "usercode": req.body.usercode, "jobcode": Number(req.query.jobcode), employeecode: 0, languagecode: objconstants.defaultlanguagecode, statuscode: [0] };
                                                        objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
                                                            objSendNotification.SendNewPrivateJobNotification(logparams, profilelistresult, req.body.usercode, jobviewresult[0], req.body.usercode, req, function (result) {
                                                            });
                                                        })
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
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validemp) {
            // objUtilities.checkvalidemployer(req.query.usercode, function (validemp) {
            if (validemp) {
                var logType = objconstants.portalAdminLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job post EditLoad ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.jobcode != null) {
                    privateobjJobpost.EditLoadByCode(logparams, req, function (response) {
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
        // objUtilities.checkvalidemployer(req.query.usercode, function (validemp) {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validemp) {
            if (validemp) {
                var logType = objconstants.portalAdminLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job post details delete ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                privateobjJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                    if (existscode != null && existscode > 0) {
                        privateobjJobpost.DeleteJobpostDetails(logparams, req, function (deleteresult) {
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
        objUtilities.checkvalidemployer(req.query.usercode, function (validemp) {
            if (validemp == true) {
                var logType = objconstants.portalAdminLogType;
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update Statuscode', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    if (req.query.statuscode != null) {
                        privateobjJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                            if (existscode != null && existscode > 0) {
                                if (Number(req.query.statuscode) == objconstants.approvedstatus) {
                                    privateobjJobpost.UpdateApprovedStatuscodeInjobpost(logparams, req, function (updateresult) {
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
                                    privateobjJobpost.UpdateInactiveStatuscodeInjobpost(logparams, req, function (updateresult) {
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
                var logType = objconstants.portalAdminLogType;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Jobpost List', logdate: new Date(), type: logType }
                var objLogdetails;
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                privateobjJobpost.JobpostListPortal(logparams, req, function (validresult) {
                    if (validresult != null && validresult.length > 0) {
                        const msgparam = { "messagecode": objconstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                    joblist: validresult
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
        // //console.log("usercode",req.query.usercode);
        objUtilities.checkvalidemployer(req.query.usercode, function (validemp) {
            if (validemp == true) {
                var logType = objconstants.portalAdminLogType;
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Filter List', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    privateobjJobpost.JobfunctionList(logparams, req, function (jbfunlist) {
                        privateobjJobpost.JobRoleList(logparams, req, function (jobroleresult) {
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
        objUtilities.checkvalidemployer(req.query.usercode, function (validemp) {
            if (validemp == true) {
                var logType = objconstants.portalAdminLogType;
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update validitydate', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    privateobjJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                        if (existscode != null && existscode > 0) {
                            privateobjJobpost.UpdateValidate(logparams, req, function (updateresult) {
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
        objUtilities.checkvalidemployer(req.query.usercode, function (validemp) {
            if (validemp == true) {
                var logType = objconstants.portalAdminLogType;
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update Job post after approval', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    //if (req.query.statuscode != null) {
                    privateobjJobpost.FindJobpostcodeExists(logparams, req, function (existscode) {
                        if (existscode != null && existscode > 0) {
                            //if (Number(req.query.statuscode) == objconstants.approvedstatus) {
                            privateobjJobpost.UpdatejobpostAfterApproval(logparams, req, function (updateresult) {
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

                                    //             //adminmailid = 'malashri@shivasoftwares.com'
                                    //             var empparams = { "usercode": req.body.usercode, "jobcode": Number(req.query.jobcode), employeecode: 0, languagecode: objconstants.defaultlanguagecode, statuscode: [0] };
                                    //             objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
                                    //                 objMail.JobPostSubmission(logparams, req.body.usercode, jobviewresult[0], mailid, function (validmail) {
                                    //                 });
                                    //                 objSendNotification.SendJobApprovalNotification(logparams,req.body.usercode, jobviewresult[0] ,function(result){
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