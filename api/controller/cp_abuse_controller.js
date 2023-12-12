'use strict';
var get_jobpost_view_details = require('../process/cp_job_post_view_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
const objAbuse = require('../process/cp_abuse_process_controller');
const objProfile = require('../process/employee_profile_view_process_controller');
var objJobView = require('../process/employee_job_view_process_controller');
var objEmployerProfile = require('../process/employer_profile_view_process_controller');
const objMail = require('../process/send_email_process_controller');
exports.abuse_reporting = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Abuse reporting List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (Number(req.query.statuscode != null)) {
                   // var params = { "statuscode": Number(req.query.statuscode) };
                    objAbuse.AbuseList(logparams, req, function (abuseresult) {
                        if (abuseresult != null && abuseresult.length > 0) {
                            objUtilities.findCount(objConstants.abusecount, function (abusecount) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        abuse_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                            Abuse_list: abuseresult,
                                            pendingcount: abusecount[0],
                                            unblockcount: abusecount[1],
                                            blockcount: abusecount[2],
                                            totalcount: abusecount[3]
                                        }
                                    });
                                });
                            });
                            
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    abuse_json_result: {
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
                            abuse_json_result: {
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
                const msgparam = { "messagecode": objConstants.validusercode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        abuse_json_result: {
                            varstatuscode: objConstants.validusercode,
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
        logger.error("Error in Abuse reporting list- Abuse " + e);
    }
}
exports.Update_statuscode = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Updation Remarks', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var statuscode = Number(req.body.statuscode);
                var apptypecode = Number(req.body.apptypecode);
                ////console.log(apptypecode);
                if (statuscode == 14 && (apptypecode == 1 || apptypecode == 2)) {
                    var params = { "apptypecode": Number(req.body.apptypecode), "employercode": Number(req.body.employercode), "employeecode": Number(req.body.employeecode) };
                    objAbuse.UpdateStatuscode(logparams, params, req, function (result) {
                        if (result != null && result == true) {
                            var employerparams = { "employercode": Number(req.body.employercode) };
                            if (apptypecode == 1) {
                                objAbuse.UpdateStatuscodeInEmployer(logparams, employerparams, req.body.statuscode, function (employerresult) {
                                    if (employerresult != null && employerresult == true) {
                                        // objUtilities.FindEmployerMailID(req.body.employercode, function (result) {
                                        //     var empparams = { "employeecode": Number(req.body.employeecode) };
                                        //     objProfile.getProfileView(logparams, empparams, objConstants.defaultlanguagecode,req, function (prefresult) {
                                        //       objUtilities.GetAdminMailId( objConstants.abuseemployermailcode ,function(mailid){
                                        //         var registered_email = result[0].registered_email;
                                        //         var adminmailid = mailid;
                                        //         objMail.AbuseEmployer(logparams,prefresult, registered_email, adminmailid, function (validmail) {
                                        //         });
                                        //       });
                                        //     });
                                            
                                        //   });
                                        const msgparam = { "messagecode": objConstants.blockedcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.blockedcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
                                                }
                                            });
                                        });
                                       
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
                                                }
                                            });
                                        });
                                    }
                                });

                            }
                            else if (apptypecode == 2) {
                                var employeeparams = { "employeecode": Number(req.body.employeecode) };
                                objAbuse.UpdateStatuscodeInEmployee(logparams, employeeparams, req.body.statuscode, function (employeeresult) {
                                    if (employeeresult != null && employeeresult == true) {
                                        // objUtilities.FindEmployeeMailID(req.body.employeecode, function (result) {
                                        //     var empparams = { "employeecode": Number(req.body.employeecode) };
                                        //     objProfile.getProfileView(logparams, empparams, objConstants.defaultlanguagecode,req, function (prefresult) {
                                        //       objUtilities.GetAdminMailId( objConstants.abuseemployeemailcode ,function(mailid){
                                        //         var registered_email = result;
                                        //         var adminmailid = mailid;
                                        //         objMail.AbuseEmployee(logparams,"", registered_email, adminmailid, function (validmail) {
                                        //         });
                                        //       });
                                        //     });
                                            
                                        //   });
                                        const msgparam = { "messagecode": objConstants.blockedcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.blockedcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
                                                }
                                            });
                                        });
                                       
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
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
                                        abuse_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.notvalidcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    abuse_json_result: {
                                        varstatuscode: objConstants.notvalidcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objConstants.successresponsecode,
                                    }
                                });
                            });
                        }

                    });
                }
                else if (statuscode == 15 && (apptypecode == 1 || apptypecode == 2)) {
                    var params = { "apptypecode": Number(req.body.apptypecode), "employercode": Number(req.body.employercode), "employeecode": Number(req.body.employeecode) };
                    objAbuse.UpdateStatuscode(logparams, params, req, function (result) {
                        if (result != null && result > 0) {
                            var employerparams = { "employercode": Number(req.body.employercode) };
                            if (apptypecode == 1) {
                                objAbuse.UpdateStatuscodeInEmployer(logparams, employerparams, objConstants.activestatus, function (employerresult) {
                                    if (employerresult != null && employerresult == true) {                                        
                                        const msgparam = { "messagecode": objConstants.unblockedcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.unblockedcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
                                                }
                                            });
                                        });
                                       
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
                                                }
                                            });
                                        });
                                    }
                                });

                            }
                            else if (apptypecode == 2) {
                                var employeeparams = { "employeecode": Number(req.body.employeecode) };
                                objAbuse.UpdateStatuscodeInEmployee(logparams, employeeparams, objConstants.activestatus, function (employeeresult) {
                                    if (employeeresult != null && employeeresult == true) {                                        
                                        const msgparam = { "messagecode": objConstants.unblockedcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.unblockedcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
                                                }
                                            });
                                        });                                       
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
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
                                        abuse_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                            
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    abuse_json_result: {
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objConstants.successresponsecode,
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
                            abuse_json_result: {
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: objConstants.successresponsecode,
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        abuse_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objConstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Remarks - Abuse " + e);
    }
}
exports.abuse_view = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Updation Remarks', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var apptypecode = Number(req.body.apptypecode);
                var jobcode = req.body.jobcode;
                // //console.log()
                if (req.body.apptypecode != null) {
                    if (apptypecode == 1 && jobcode != null) {
                        var params = { "employercode": req.body.employercode };
                        objEmployerProfile.getProfileView(logparams, params, req.body.languagecode, function (employerresult) {
                            // //console.log(employerresult.length);
                            if (employerresult != null ) {
                                var empparams = { "employercode": Number(req.body.employercode), "jobcode": req.body.jobcode, "employeecode": req.body.employeecode, languagecode: req.body.languagecode, statuscode: [0] };
                                // //console.log(empparams);
                                objJobView.getJobViewProcess(logparams, empparams, function (jobresult) {
                                    if (jobresult != null && jobresult.length > 0) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    "profileinfo": employerresult.profileinfo,
                                                    "contactinfo": employerresult.contactinfo,
                                                    "companyinfo": employerresult.companyinfo,
                                                    "preferences": employerresult.preferences,
                                                    "govtidentification": employerresult.govtidentification,
                                                    "branchlist": employerresult.branchlist,
                                                    "job_details": jobresult
                                                }
                                            });
                                        });

                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                abuse_json_result: {
                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
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
                                        abuse_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                        }
                                    });
                                });
                            }

                        })

                    }
                    else if (apptypecode == 2) {
                        var empparams = { "employeecode": Number(req.body.employeecode) };
                        objProfile.getProfileView(logparams, empparams,objConstants.defaultlanguagecode,req, function (profileresult) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    abuse_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        personalinfo: profileresult.personalinfo,
                                        contactinfo: profileresult.contactinfo,
                                        references: profileresult.references,
                                        experience: profileresult.experience,
                                        totalexperience: profileresult.totalexperience,                                        
                                        expmonth: profileresult.expmonth,
                                        expyear: profileresult.expyear,
                                        expmonth: profileresult.expmonth,
                                        expyear: profileresult.expyear,
                                        fresherstatus: profileresult.fresherstatus,
                                        schooling: profileresult.schooling,
                                        afterschooling: profileresult.afterschooling,
                                        preferences: profileresult.preferences,
                                        skilllist: profileresult.skilllist
                                    }
                                });
                            });
                        });

                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                abuse_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objConstants.successresponsecode,
                                }
                            });
                        });
                    }
                }
                else {
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            abuse_json_result: {
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: objConstants.successresponsecode,
                            }
                        });
                    });
                }

            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        abuse_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objConstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Abuse view - Abuse " + e);
    }
}