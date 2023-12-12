'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objJobDescription = require('../process/employer_job_description_process_controller')
const objJobView = require('../process/employee_job_view_process_controller')
const objProfile = require('../process/employee_profile_view_process_controller')

const Logger = require('../services/logger_service')
const logger = new Logger('logs')
exports.JobDescriptionView = function (req, res) {
    try {
      //  objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
        objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Job description view ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    // //console.log("Entry");
                    if (req.body.employeecode == null) {
                        // //console.log("Entry2");
                        var empparams = { "employercode": Number(req.query.employercode), "jobcode": req.body.jobcode, employeecode: 0, languagecode: req.body.languagecode, statuscode: [0] };
                        objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
                            // //console.log(jobviewresult);
                            if (jobviewresult != null && jobviewresult.length > 0) {
                                const msgparam = { "messagecode": objconstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                            job_details: jobviewresult

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
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
                                        }

                                    });
                                });
                            }
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
                            response: objconstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Job description view - employer: " + e);
    }
}
exports.JobDescriptionEmployeeView = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Job description employer view ', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    var empparams = { employeecode: Number(req.query.employeecode), jobcode: Number(req.query.jobcode) };
                    objProfile.getProfileView(logparams, empparams, req.query.languagecode,req, function (prefresult) {
                        const msgparam = { "messagecode": objconstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                    personalinfo: prefresult.personalinfo,
                                    contactinfo: prefresult.contactinfo,
                                    references: prefresult.references,
                                    experience: prefresult.experience,
                                    totalexperience: prefresult.totalexperience,
                                    expmonth: prefresult.expmonth,
                                    expyear: prefresult.expyear,
                                    fresherstatus: prefresult.fresherstatus,
                                    schooling: prefresult.schooling,
                                    afterschooling: prefresult.afterschooling,
                                    preferences: prefresult.preferences,
                                    skilllist: prefresult.skilllist,
                                    invitedshortliststatus: prefresult.invitedshortliststatus,
                                    invitedshortlistdate: prefresult.totalshortlistdate,
                                    appliedstatus: prefresult.appliedstatus,
                                    applieddate: prefresult.applieddate,
                                    invitedstatus: prefresult.invitedstatus,
                                    inviteddate: prefresult.inviteddate,
                                    appliedshortliststatus: prefresult.appliedshortliststatus,
                                    appshortlistdate: prefresult.appshortlistdate,
                                    wishliststatus: prefresult.wishliststatus,
                                    wishlistdate: prefresult.wishlistdate,
                                    abusestatus: prefresult.abusestatus

                                }
                            });
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
                            response: objconstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Job description view - employer: " + e);
    }
}