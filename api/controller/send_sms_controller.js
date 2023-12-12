'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objsendsms = require('../process/send_sms_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')
const objOTP = require('../process/send_email_process_controller')
exports.SendOTP = function (req, res) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        var logType = "";
        var logUserCode = "";
        if (req.query.appcode == 1)
            logType = varconstant.portalLogType;
        else
            logType = varconstant.employeeLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.mobileno, orginator: 'Send OTP', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.typecode == varconstant.forgetpwdtypecode) {
            objsendsms.CheckMobileNumberExists(logparams, req, function (validmobileno) {
                if (validmobileno != null && validmobileno.length > 0) {
                    objsendsms.SendOTP(logparams, req.query.mobileno, req.query.typecode, validmobileno[0].employeename, function (response) {
                        if (response != null && response != 0) {
                            var params = {
                                employeecode: Number(req.query.employeecode),
                                typecode: Number(req.query.typecode),
                                mobileno: req.query.mobileno,
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
        else if (req.query.typecode == varconstant.changemobiletypecode) {
            // var params = { "oldmail": req.query.oldmail};
            objsendsms.CheckOldMobileNoExists(logparams, req, function (validoldmobileno) {
                ////console.log("validmobileno",validmobileno);
                if (validoldmobileno != null && validoldmobileno.length > 0) {
                    objsendsms.CheckValidMobileNoExists(logparams, req, function (validmobileno) {
                        if (validmobileno == null || validmobileno == 0) {
                            objsendsms.SendOTP(logparams, req.query.mobileno, req.query.typecode,validoldmobileno[0].employeename, function (response) {
                                if (response != null && response != 0) {
                                    var params = {
                                        employeecode: Number(req.query.employeecode),
                                        typecode: Number(req.query.typecode),
                                        mobileno: req.query.mobileno,
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
                                    const msgparam = { "messagecode": varconstant.invalidmobilenocode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            sendotp_json_result: {
                                                varstatuscode: varconstant.invalidmobilenocode,
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
            objsendsms.CheckValidMobileNoExists(logparams, req, function (validmobileno) {
                if (validmobileno != null && validmobileno.length > 0) {
                    objsendsms.SendOTP(logparams, req.query.mobileno, req.query.typecode,validmobileno[0].employeename, function (response) {
                        if (response != null && response != 0) {
                            var params = {
                                employeecode: Number(req.query.employeecode),
                                typecode: Number(req.query.typecode),
                                mobileno: req.query.mobileno,
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
                            const msgparam = { "messagecode": varconstant.invalidmobilenocode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendotp_json_result: {
                                        varstatuscode: varconstant.invalidmobilenocode,
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
        else if (req.query.typecode == varconstant.registration) {
            objsendsms.CheckMobileNumberExists(logparams, req, function (validmobileno) {
                if (validmobileno == null || validmobileno.length == 0) {
                    objsendsms.SendOTP(logparams, req.query.mobileno, req.query.typecode, req.query.employeename, function (response) {
                        if (response != null && response != 0) {
                            var params = {
                                employeecode: Number(req.query.employeecode),
                                typecode: Number(req.query.typecode),
                                mobileno: req.query.mobileno,
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
        else if (req.query.typecode == varconstant.verify_employee_mobile_search_typecode) {
            //objsendsms.CheckMobileNumberExists(logparams, req, function (validmobileno) {
                var validmobileno = null;
                if (validmobileno == null || validmobileno.length == 0) {
                    objsendsms.SendOTP(logparams, req.query.mobileno, req.query.typecode, "User", function (response) {
                        if (response != null && response != 0) {
                            var params = {
                                employeecode: Number(req.query.employeecode),
                                typecode: Number(req.query.typecode),
                                mobileno: req.query.mobileno,
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
            //});
        }
        else if (req.query.typecode == varconstant.verify_employee_mobile_register_typecode) {
            //console.log(req.query.typecode)
            objsendsms.CheckMobileNumberExists(logparams, req, function (validmobileno) {
                //var validmobileno = null;
                if (validmobileno == null || validmobileno.length == 0) {
                    objsendsms.SendOTP(logparams, req.query.mobileno, req.query.typecode, "User", function (response) {
                        if (response != null && response != 0) {
                            var params = {
                                employeecode: Number(req.query.employeecode),
                                typecode: Number(req.query.typecode),
                                mobileno: req.query.mobileno,
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
                    });
                }
                else {
                    const msgparam = { "messagecode": varconstant.mobilenoexistcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            sendotp_json_result: {
                                varstatuscode: varconstant.mobilenoexistcode,
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

exports.CheckOTP = function (req, res) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        var logType = "";
        if (req.query.appcode == 1)
            logType = varconstant.portalLogType;
        else
            logType = varconstant.employeeLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.mobileno, orginator: 'Check OTP', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objUtilities.CheckOTPValueForSMS(logparams, req, req.query.typecode, function (validdata) {
            if (validdata != null && validdata.length > 0) {
                ////console.log("Fulllist:", validdata);
                var validdate = validdata[0].validitydate;
                ////console.log("date:",validdate)
                ////console.log(milliseconds)
                if (validdate > milliseconds) {
                    {
                        var employeecode = -1, employeename = "", preferredlanguagecode = varconstant.tamillangcode;
                        if (Number(req.query.typecode) == 9)
                        {
                            objsendsms.CheckValidMobileNoExists(logparams, req, function (validmobileno) {
                                if (validmobileno != null && validmobileno.length > 0) {
                                    employeecode = validmobileno[0].employeecode;
                                    employeename = validmobileno[0].employeename;
                                    preferredlanguagecode = validmobileno[0].preferredlanguagecode;
                                // }
                                const msgparam = { "messagecode": varconstant.validotpcode};
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: varconstant.validotpcode,
                                            response: varconstant.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            employeecode: employeecode,
                                            employeename: employeename,
                                            preferredlanguagecode: preferredlanguagecode
                                        }
                                    });
                                });
                            }
                            });
                        }
                        else
                        {
                            const msgparam = { "messagecode": varconstant.validotpcode};
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: varconstant.validotpcode,
                                        response: varconstant.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        //employeecode: employeecode
                                    }
                                });
                            });
                        }
                        
                    }
                }
                else {
                    const msgparam = { "messagecode": varconstant.expriedcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: varconstant.expriedcode,
                                response: varconstant.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": varconstant.invalidotpcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: varconstant.invalidotpcode,
                            response: varconstant.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        })

    }
    catch (e) {
        logger.error("Error in Forgot password : Employer" + e);
    }
}

exports.SendSMS = function (req, res) {
    try {
        var logType = "";
        var logUserCode = "";
        if (req.query.appcode == 1)
            logType = varconstant.portalLogType;
        else
            logType = varconstant.employeeLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.mobileno, orginator: 'Send SMS', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.body.messagecontent != null) {
            objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
                if (userresponse == true) {
                    objsendsms.GetSMSCount(logparams,function (smscount) {
                        if(smscount!=null && smscount.length>1){
                            if(req.body.totalsmscount<=Number(smscount[1])){
                            //if(1==0){
                                ////console.log("send sms");
                                objsendsms.SendCommonSMS(logparams,req.body.messagecontent,req.body.numberlist,2,function(smsresponse){
                                    if (smsresponse != null && smsresponse != 0) {
                                        const msgparam = { "messagecode": varconstant.sentsmscode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                sms_json_result: {
                                                    varstatuscode: varconstant.sentsmscode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: varconstant.successresponsecode
                                                }
                                            });
                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": varconstant.notvalidcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                sms_json_result: {
                                                    varstatuscode: varconstant.notvalidcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: varconstant.successresponsecode
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                            else {
                                const msgparam = { "messagecode": varconstant.smscountexceedcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        sms_json_result: {
                                            varstatuscode: varconstant.smscountexceedcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: varconstant.successresponsecode
                                        }
                                    });
                                });
                            }
                        }
                        else{

                        }
                    });                    
                }
                else {
                    const msgparam = { "messagecode": varconstant.usernotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            sms_json_result: {
                                varstatuscode: varconstant.usernotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: varconstant.successresponsecode
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
                    sms_json_result: {
                        varstatuscode: varconstant.notvalidcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode
                    }
                });
            });
        }

    }
    catch (e) {
        logger.error("Error in Send SMS : " + e);
    }
}