'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objOTP = require('../process/send_email_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')
exports.SendOTP = async function (req, res) {
    try {
        // const decoded = await objUtilities.validateToken(req);
        // if (!decoded) {
        //   return res.status(200).json({
        //     status: 401,
        //     message: "Unauthorized",
        //   });
        // }
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        var logType = "";
        var logUserCode = "";
        if (req.query.employercode != null) {
            logUserCode = req.query.employercode;
            logType = varconstant.AppEmployerLogType;
        }
        else {
            logUserCode = req.query.registered_email;
            logType = varconstant.AppEmployerLogType;
        }
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: logUserCode, orginator: 'Send OTP', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.typecode == varconstant.forgetpwdtypecode) {
            //var params = { "registered_email": req.query.registered_email };
            objOTP.CheckMailNameExists(logparams, req, function (validmail) {
                if (validmail != null && validmail.length > 0) {
                    var email = validmail[0].registeredname;
                    ////console.log(email);
                    objUtilities.GetAdminMailId( varconstant.jobpakagemailcode ,function(mailid){
                    objOTP.SendOTP(logparams, email, mailid, req, function (response) {
                        if (response != null && response != 0) {
                            var params = {
                                employercode: Number(req.query.employercode),
                                typecode: Number(req.query.typecode),
                                emailid: req.query.registered_email,
                                otpvalue: response,
                                createddate: milliseconds,
                                validitydate: milliseconds + varconstant.forgetpwdvalidity,
                            };
                            objOTP.InsertOTPDetails(logparams, params, function (insertresult) {
                                if (insertresult != null && insertresult > 0) {
                                    const msgparam = { "messagecode": varconstant.sendotpcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            sendotp_json_result: {
                                                varstatuscode: varconstant.sendotpcode,
                                                response: varconstant.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            sendotp_json_result: {
                                                varstatuscode: varconstant.recordnotfoundcode,
                                                response: varconstant.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            const msgparam = { "messagecode": varconstant.invalidmailcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendotp_json_result: {
                                        varstatuscode: varconstant.invalidmailcode,
                                        response: varconstant.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey
                                    }
                                });
                            });
                        }
                    });
                });
                }
                else {
                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            sendotp_json_result: {
                                varstatuscode: varconstant.recordnotfoundcode,
                                response: varconstant.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }
                        });
                    });
                }
            })
        }
        else if (req.query.typecode == varconstant.changeemailtypecode) {
            // var params = { "oldmail": req.query.oldmail};
            objOTP.CheckOldMailNameExists(logparams, req, function (maildetails) {
                if (maildetails != null && maildetails.length > 0) {
                    objUtilities.checkEmailIdExists(logparams, req.body.registered_email, function (validmail) {
                        if (validmail == null || validmail == 0) {
                            var email = maildetails[0].registeredname;
                        // //console.log(req.query.registered_email);
                        objUtilities.GetAdminMailId( varconstant.jobpakagemailcode ,function(mailid){
                            objOTP.SendOTP(logparams, email, mailid, req, function (response) {
                                ////console.log(response);
                                if (response != null && response != 0) {
                                    var params = {
                                        employercode: Number(req.query.employercode),
                                        typecode: Number(req.query.typecode),
                                        emailid: req.query.registered_email,
                                        otpvalue: response,
                                        createddate: milliseconds,
                                        validitydate: milliseconds + varconstant.changeemailvalidity,
                                    };
                                    objOTP.InsertOTPDetails(logparams, params, function (insertresult) {
                                        if (insertresult != null && insertresult > 0) {
                                            const msgparam = { "messagecode": varconstant.sendotpcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    sendotp_json_result: {
                                                        varstatuscode: varconstant.sendotpcode,
                                                        response: varconstant.successresponsecode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    sendotp_json_result: {
                                                        varstatuscode: varconstant.recordnotfoundcode,
                                                        response: varconstant.successresponsecode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey
                                                    }
                                                });
                                            });
                                        }
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": varconstant.invalidmailcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            sendotp_json_result: {
                                                varstatuscode: varconstant.invalidmailcode,
                                                response: varconstant.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey
                                            }
                                        });
                                    });
                                }
                            });
                        });
                        }
                        else {
                            const msgparam = { "messagecode": varconstant.existcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendotp_json_result: {
                                        varstatuscode: varconstant.existcode,
                                        response: varconstant.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey
                                    }
                                });
                            });
                        }
                    });
                    
                }
                else {
                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            sendotp_json_result: {
                                varstatuscode: varconstant.recordnotfoundcode,
                                response: varconstant.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }
                        });
                    });
                }
            })
        }
        else if (req.query.typecode == varconstant.invisiblemodetypecode) {
            //var params = { "registered_email": req.query.registered_email };
            objOTP.CheckValidMailNameExists(logparams, req, function (validmail) {
                if (validmail != null && validmail.length > 0) {
                    var email = validmail[0].registeredname;
                    //console.log(milliseconds);
                    objUtilities.GetAdminMailId( varconstant.jobpakagemailcode ,function(mailid){
                    objOTP.SendOTP(logparams, email, mailid, req, function (response) {
                        if (response != null && response != 0) {
                            var params = {
                                employercode: Number(req.query.employercode),
                                typecode: Number(req.query.typecode),
                                emailid: req.query.registered_email,
                                otpvalue: response,
                                createddate: milliseconds,
                                validitydate: milliseconds + varconstant.invisiblemodecodevalidity,
                            };
                            objOTP.InsertOTPDetails(logparams, params, function (insertresult) {
                                if (insertresult != null && insertresult > 0) {
                                    const msgparam = { "messagecode": varconstant.sendotpcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            sendotp_json_result: {
                                                varstatuscode: varconstant.sendotpcode,
                                                response: varconstant.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            sendotp_json_result: {
                                                varstatuscode: varconstant.recordnotfoundcode,
                                                response: varconstant.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            const msgparam = { "messagecode": varconstant.invalidmailcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendotp_json_result: {
                                        varstatuscode: varconstant.invalidmailcode,
                                        response: varconstant.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey
                                    }
                                });
                            });
                        }
                    });
                });
                }
                else {
                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            sendotp_json_result: {
                                varstatuscode: varconstant.recordnotfoundcode,
                                response: varconstant.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }
                        });
                    });
                }
            })
        }
        else if (req.query.typecode == varconstant.verify_employer_email_typecode) {
            //var params = { "registered_email": req.query.registered_email };
                    var email = req.query.registeredname;
                    //console.log(milliseconds);
                    objUtilities.GetAdminMailId( varconstant.jobpakagemailcode ,function(mailid){
                    objOTP.SendOTP(logparams, email, mailid, req, function (response) {
                        if (response != null && response != 0) {
                            var params = {
                                employercode: 0,
                                typecode: Number(req.query.typecode),
                                emailid: req.query.registered_email,
                                otpvalue: response,
                                createddate: milliseconds,
                                validitydate: milliseconds + varconstant.forgetpwdvalidity,
                            };
                            objOTP.InsertOTPDetails(logparams, params, function (insertresult) {
                                if (insertresult != null && insertresult > 0) {
                                    const msgparam = { "messagecode": varconstant.sendotpcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            sendotp_json_result: {
                                                varstatuscode: varconstant.sendotpcode,
                                                response: varconstant.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            sendotp_json_result: {
                                                varstatuscode: varconstant.recordnotfoundcode,
                                                response: varconstant.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            const msgparam = { "messagecode": varconstant.invalidmailcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendotp_json_result: {
                                        varstatuscode: varconstant.invalidmailcode,
                                        response: varconstant.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey
                                    }
                                });
                            });
                        }
                    });
               });
        }
        else {
            const msgparam = { "messagecode": varconstant.notvalidcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                    sendotp_json_result: {
                        varstatuscode: varconstant.notvalidcode,
                        response: varconstant.successresponsecode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey
                    }
                });
            });
        }

    }
    catch (e) {
        logger.error("Error in Send OTP : Employer" + e);
    }
}

exports.ResendVerificationLink = async function (req, res) {
    try {
        // const decoded = await objUtilities.validateToken(req);
        // if (!decoded) {
        //   return res.status(200).json({
        //     status: 401,
        //     message: "Unauthorized",
        //   });
        // }
        var logType = "";
        var logUserCode = "";
        logUserCode = req.query.usercode;
        logType = varconstant.portalLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: logUserCode, orginator: 'Resend Verification Link', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.body.registered_email != null && req.body.registered_email != "") {
            //var params = { "registered_email": req.query.registered_email };
            objUtilities.checkVerifyEmailIdExists(logparams, req.body.registered_email, function (validmail) {
                if (validmail != null && validmail > 0) {
                ////console.log(validmail);
                    objUtilities.GetAdminMailId( varconstant.admincode ,function(mailid){
                        // console.log(req.body.registered_email);
                        objOTP.VerificationMail(logparams, req.body.registered_email, mailid, req.body.employercode,2, function (response) {
                            // console.log(response);
                            if (response != null && response != 0) {
                                const msgparam = { "messagecode": varconstant.verifiedlinkcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        resendmail_json_result: {
                                            varstatuscode: varconstant.verifiedlinkcode,
                                            response: varconstant.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": varconstant.invalidmailcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        resendmail_json_result: {
                                            varstatuscode: varconstant.invalidmailcode,
                                            response: varconstant.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
                else {
                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            resendmail_json_result: {
                                varstatuscode: varconstant.recordnotfoundcode,
                                response: varconstant.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }
                        });
                    });
                }
            });
        }
        else {
            const msgparam = { "messagecode": varconstant.notvalidcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                    resendmail_json_result: {
                        varstatuscode: varconstant.notvalidcode,
                        response: varconstant.successresponsecode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey
                    }
                });
            });
        }

    }
    catch (e) {
        logger.error("Error in Send OTP : Employer" + e);
    }
}

exports.ResendVerificationLink_test = async function (req, res) {
    try {
        // const decoded = await objUtilities.validateToken(req);
        // if (!decoded) {
        //   return res.status(200).json({
        //     status: 401,
        //     message: "Unauthorized",
        //   });
        // }
        var logType = "";
        var logUserCode = "";
        logUserCode = req.query.usercode;
        logType = varconstant.portalLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: logUserCode, orginator: 'Resend Verification Link', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.body.registered_email != null && req.body.registered_email != "") {
            //var params = { "registered_email": req.query.registered_email };
            objOTP.VerificationMail(logparams, req.body.registered_email, "admin@jobanya.com", req.body.employercode,2, function (response) {
                ////console.log(response);
                if (response != null && response != 0) {
                    const msgparam = { "messagecode": varconstant.verifiedlinkcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            resendmail_json_result: {
                                varstatuscode: varconstant.verifiedlinkcode,
                                response: varconstant.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }
                        });
                    });
                }
                else {
                    const msgparam = { "messagecode": varconstant.invalidmailcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            resendmail_json_result: {
                                varstatuscode: varconstant.invalidmailcode,
                                response: varconstant.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }
                        });
                    });
                }
            });
        }
        else {
            const msgparam = { "messagecode": varconstant.notvalidcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                    resendmail_json_result: {
                        varstatuscode: varconstant.notvalidcode,
                        response: varconstant.successresponsecode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey
                    }
                });
            });
        }

    }
    catch (e) {
        logger.error("Error in Send OTP : Employer" + e);
    }
}

exports.EmployeeEmailVerification = async function (req, res) {
    try {
        // const decoded = await objUtilities.validateToken(req);
        // if (!decoded) {
        //   return res.status(200).json({
        //     status: 401,
        //     message: "Unauthorized",
        //   });
        // }
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        var logType = "";
        var logUserCode = "";
        if (req.query.employeecode != null) {
            logUserCode = req.query.employeecode;
            logType = varconstant.AppEmployerLogType;
        }
        else {
            logUserCode = req.query.registered_email;
            logType = varconstant.AppEmployerLogType;
        }
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: logUserCode, orginator: 'Send OTP', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objOTP.CheckEmployeeMailNameExists(logparams, req, function (validmail) {
            //console.log(validmail,"validmail");
            if (validmail != null) {
                var employeefullname = validmail.employeefullname;
                ////console.log(email);
                objUtilities.GetAdminMailId( varconstant.jobpakagemailcode ,function(mailid){
                objOTP.EmployeeEmailVerificationWithOTP(logparams, employeefullname, mailid, req, function (response) {
                    if (response != null && response != 0) {
                        var params = {
                            employeecode: Number(req.query.employeecode),
                            typecode: Number(req.query.typecode),
                            emailid: req.query.registered_email,
                            otpvalue: response,
                            createddate: milliseconds,
                            validitydate: milliseconds + varconstant.forgetpwdvalidity,
                        };
                        objOTP.InsertOTPDetails(logparams, params, function (insertresult) {
                            if (insertresult != null && insertresult > 0) {
                                const msgparam = { "messagecode": varconstant.sendotpcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        sendotp_json_result: {
                                            varstatuscode: varconstant.sendotpcode,
                                            response: varconstant.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        sendotp_json_result: {
                                            varstatuscode: varconstant.recordnotfoundcode,
                                            response: varconstant.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else {
                        const msgparam = { "messagecode": varconstant.invalidmailcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sendotp_json_result: {
                                    varstatuscode: varconstant.invalidmailcode,
                                    response: varconstant.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey
                                }
                            });
                        });
                    }
                });
            });
            }
            else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        sendotp_json_result: {
                            varstatuscode: varconstant.recordnotfoundcode,
                            response: varconstant.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey
                        }
                    });
                });
            }
        })

    }
    catch (e) {
        logger.error("Error in Send OTP : Employer" + e);
    }
}