'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objLogin = require('../process/employer_login_process_controller');
const objMail = require('../process/send_email_process_controller');
const Logger = require('../services/logger_service')
const objPreference = require('../process/employer_preference_process_controller')
const objSendNotification = require('../process/send_notification_process_controller');
const logger = new Logger('logs')

module.exports.refreshToken = async (req, res) => {
    try {

        const storedRefreshToken = await objUtilities.getStoredRefreshToken();
        var getToken = req.query.token;
        var response = {}
        if (getToken.trim("") === '') {
            response = { "message": "Refresh token not provided", "status": 498 };
            return res.status(200).json({
                tokenReult: response
            })
        }
        if (!storedRefreshToken.includes(getToken)) {
            response = { "message": "Invalid token", "status": 498 };
            return res.status(200).json({
                tokenReult: response
            })

        }
        else {
            objUtilities.refreshTokens = storedRefreshToken.filter((c) => c != getToken);
            //remove the old refreshToken from the refreshTokens list
            const accessToken = await objUtilities.generateAccessToken({ user: req.user });
            const refreshToken = await objUtilities.generateRefreshToken({ user: req.user });
            response = { "message": "Success", "status": 200, accessToken: accessToken, refreshToken: refreshToken };
            return res.status(200).json({
                tokenReult: response
            })

        }
    }
    catch (error) {
        // await errorLogService.errorlog(constants.ErrorlogMessage.PLAT_FORM_NAME,"New password", error, "ChangePasswordJwt");
        throw new Error(error);
    }
}

exports.employerlogin = async function (req, res) {
    try {


        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;

        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Employer Login', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            var params = { "registered_email": { $regex: "^" + req.query.registered_email + "$", $options: 'i' } };

            objLogin.checkEmployerLogin(logparams, params, req, function (empresponse) {
                console.log(empresponse)
                if (empresponse.result == true) {
                    const dbo = MongoDB.getDB();
                    var empparams = { "employercode": empresponse.employercode };

                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                        dbo.collection(MongoDB.EmployerCollectionName).updateOne(empparams, { $set: { "lastlogindate": currenttime } }, function (err, logres) {
                            var loginactivityparams = { "employercode": empresponse.employercode, "employeecode": 0, "usercode": 2, "apptype": Number(req.query.appcode), "createdtime": currenttime }
                            objLogin.insertLoginActivity(logparams, loginactivityparams, function (activityres) {
                                var prefparams = { employercode: empresponse.employercode };
                                objPreference.GetSinglePreferenceDetails(logparams, prefparams, async function (prefresult) {
                                    var accessToken = await objUtilities.generateAccessToken({ user: req.query.registered_email });
                                    var refreshToken = await objUtilities.generateRefreshToken({ user: req.query.registered_email });

                                    var prefstatus = false;
                                    if (prefresult != null) {
                                        prefstatus = true;
                                    }
                                    objLogin.GetAllActiveJobs(empresponse.employercode, function (jobresult) {
                                        var jobcount = 0;
                                        if (jobresult != null && jobresult.length > 0) {
                                            jobcount = jobresult.length;
                                        }
                                        const msgparam = { "messagecode": objconstants.loginsuccesscode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, async function (msgresult) {

                                            // var dataString = From=${req.from}&&To=${req.to}&&CallerId=${result.exotelCallerID};
                                            const axios = require("axios");

                                            let Result_1 = ''
                                            // const response1 = await axios.post('https://gu98zm4vyg.execute-api.us-east-2.amazonaws.com/S3Upload/getPreSignedURL', {

                                            // }).then(async function (response1) {
                                            //   console.log(response1,'response')})

                                            fetch("https://gu98zm4vyg.execute-api.us-east-2.amazonaws.com/S3Upload/getPreSignedURL", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",

                                                    Accept: "application/json",
                                                    "Cache-Control": "no-cache"
                                                },

                                            })
                                                .then(response => response.json())
                                                .then(responseJson => {
                                                    console.log("itemresponseJson", responseJson);
                                                    return res.status(200).json({
                                                        login_json_result: {
                                                            varstatuscode: objconstants.loginsuccesscode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                            response: objconstants.successresponsecode,
                                                            employee_details: empresponse,
                                                            preferencestatus: prefstatus,
                                                            jobcount: jobcount,
                                                            accessToken: accessToken,
                                                            refreshToken: refreshToken,
                                                            urlResp: responseJson
                                                        }
                                                    });
                                                });




                                            // return res.status(200).json({
                                            //     login_json_result: {
                                            //         varstatuscode: objconstants.loginsuccesscode,
                                            //         responsestring: msgresult[0].messagetext,
                                            //         responsekey: msgresult[0].messagekey,
                                            //         response: objconstants.successresponsecode,
                                            //         employee_details: empresponse,
                                            //         preferencestatus: prefstatus,
                                            //         jobcount: jobcount,
                                            //         accessToken:accessToken,
                                            //         refreshToken:refreshToken,
                                            //         urlResp:response1
                                            //     }
                                            // });

                                        });
                                    })

                                });
                            });
                        });
                    });
                }
                else if (empresponse.statuscode == objconstants.inactivestatus) {
                    const msgparam = { "messagecode": objconstants.deactivateaccountcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            login_json_result: {
                                varstatuscode: objconstants.deactivateaccountcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }

                        });
                    });
                }
                else if (empresponse.statuscode == objconstants.blockstatus) {
                    const msgparam = { "messagecode": objconstants.abusedcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            login_json_result: {
                                varstatuscode: objconstants.abusedcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }

                        });
                    });
                }
                else if (empresponse.verificationstatus == objconstants.verificationstatus) {
                    const msgparam = { "messagecode": objconstants.verificationpendingcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            login_json_result: {
                                varstatuscode: objconstants.verificationpendingcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }

                        });
                    });
                }
                else if (empresponse.statuscode == objconstants.pendingstatus) {
                    const msgparam = { "messagecode": objconstants.pendingcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            login_json_result: {
                                varstatuscode: objconstants.pendingcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }

                        });
                    });
                }

                else {
                    const msgparam = { "messagecode": objconstants.passwordincorrectcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            login_json_result: {
                                varstatuscode: objconstants.passwordincorrectcode,
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
    catch (e) {
        logger.error("Error in Employer login : " + e);
    }
}
exports.forgotpassword = async function (req, res) {
    try {

        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.registered_email, orginator: 'Forgot password', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objUtilities.CheckOTPValue(logparams, req, objconstants.forgetpwdtypecode, function (validdata) {
                if (validdata != null && validdata.length > 0) {
                    ////console.log("Fulllist:", validdata);
                    var validdate = validdata[0].validitydate;
                    // //console.log("date:",validdate)
                    // //console.log(milliseconds)
                    if (validdate > milliseconds) {
                        objLogin.forgotpassword(logparams, req, function (empresponse) {
                            if (empresponse == true) {
                                const msgparam = { "messagecode": objconstants.passwordchangesuccesscode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.passwordchangesuccesscode,
                                            response: objconstants.successresponsecode,
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
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                        }
                                    });
                                });
                            }
                        })
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.expriedcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.expriedcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                }
                else {
                    const msgparam = { "messagecode": objconstants.invalidotpcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.invalidotpcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });
                    });
                }
            })

        }

    }
    catch (e) {
        logger.error("Error in Forgot password : Employer" + e);
    }
}

exports.CheckOTP = async function (req, res) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.registered_email, orginator: 'Check OTP', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objUtilities.CheckOTPValue(logparams, req, req.query.typecode, function (validdata) {
                if (validdata != null && validdata.length > 0) {
                    ////console.log("Fulllist:", validdata);
                    var validdate = validdata[0].validitydate;
                    //console.log("date:",validdate)
                    //console.log(milliseconds)
                    if (validdate > milliseconds) {
                        {
                            const msgparam = { "messagecode": objconstants.validotpcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.validotpcode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });
                            });
                        }
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.expriedcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.expriedcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                }
                else {
                    const msgparam = { "messagecode": objconstants.invalidotpcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.invalidotpcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });
                    });
                }
            })

        }

    }
    catch (e) {
        logger.error("Error in Forgot password : Employer" + e);
    }
}
exports.employerload = async function (req, res) {
    try {
        // const decoded = await objUtilities.validateToken(req);
        // if (!decoded) {
        //   return res.status(200).json({
        //     status: 401,
        //     message: "Unauthorized",
        //   });
        // }
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Employer load', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objLogin.registerationload(logparams, req, function (employerresult) {
                if (employerresult != null) {
                    const msgparam = { "messagecode": objconstants.listcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.listcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: objconstants.successresponsecode,
                                statelist: employerresult.statelist,
                                districtlist: employerresult.districtlist,
                                taluklist: employerresult.taluklist,
                                companytypelist: employerresult.companytypelist,
                                employertypelist: employerresult.employertypelist,
                                industrylist: employerresult.industrylist,
                                facilitylist: employerresult.facilitylist,
                                knowntypelist: employerresult.knowntypelist,
                                userlist: employerresult.userlist,
                                activitytypelist: employerresult.activitytypelist,
                                turnoverslabresult: employerresult.turnoverslabresult,
                                documenttypelist: employerresult.documenttypelist
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
            })
        }
    }
    catch (e) {
        logger.error("Error in Employer Load : " + e);
    }
}
exports.registeration = async function (req, res) {
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
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Registeration form', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var insertparams = req.body;
        // //console.log(insertparams);
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objUtilities.checkEmailIdExists(logparams, req.body.registered_email, function (validmail) {
                if (validmail == null || validmail == 0) {
                    objUtilities.checkGSTINExists(logparams, req.body.gstn, 0, function (validgstn) {
                        if (validgstn == null || validgstn == 0 || insertparams.companytypecode == 3 || insertparams.companytypecode == 4) {
                            objUtilities.InsertLog(logparams, function (validlog) {
                                if (validlog != null && validlog != "") {
                                    objLogin.getMaxcode(function (validcode) {
                                        if (validcode != null && validcode != 0) {
                                            objUtilities.encryptpassword(logparams, req.body.password, function (passwordencrypt) {
                                                insertparams.employercode = validcode;
                                                insertparams.branch[0].branchcode = 1;
                                                insertparams.makerid = validlog;
                                                insertparams.password = passwordencrypt;
                                                insertparams.createddate = milliseconds;
                                                insertparams.statuscode = objconstants.pendingstatus;
                                                insertparams.verificationstatus = objconstants.verificationstatus;
                                                insertparams.registervia = Number(req.query.appcode);
                                                // //console.log(validcode);
                                                objLogin.InsertEmployer(logparams, insertparams, function (insertvalue) {
                                                    if (insertvalue != null && insertvalue > 0) {
                                                        var registered_email = req.body.registered_email;
                                                        // //console.log(registered_email);
                                                        objUtilities.GetAdminMailId(objconstants.admincode, function (mailid) {


                                                            const msgparam = { "messagecode": objconstants.registercode };
                                                            objUtilities.getMessageDetailWithkeys(msgparam, async function (msgresult) {
                                                                var accessToken = await objUtilities.generateAccessToken({ user: req.query.registered_email });
                                                                var refreshToken = await objUtilities.generateRefreshToken({ user: req.query.registered_email });

                                                                return res.status(200).json({
                                                                    employer_json_result: {
                                                                        varstatuscode: objconstants.registercode,
                                                                        response: objconstants.successresponsecode,
                                                                        responsestring: msgresult[0].messagetext,
                                                                        responsekey: msgresult[0].messagekey,
                                                                        returncode: validcode,
                                                                        accessToken: accessToken,
                                                                        refreshToken: refreshToken
                                                                    }

                                                                });
                                                            });
                                                            objMail.RegistrationMail(logparams, registered_email, mailid, validcode, function (validmail) {
                                                            });
                                                            objSendNotification.SendEmployerRegistrationNotification(logparams, insertparams, function (result) {
                                                            });
                                                            objMail.VerificationMail(logparams, registered_email, mailid, validcode, 1, function (validmail) {

                                                            });

                                                        });


                                                    }
                                                    else {
                                                        const msgparam = { "messagecode": objconstants.notvalidcode };
                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                            return res.status(200).json({
                                                                employer_json_result: {
                                                                    varstatuscode: objconstants.notvalidcode,
                                                                    response: objconstants.successresponsecode,
                                                                    responsestring: msgresult[0].messagetext,
                                                                    responsekey: msgresult[0].messagekey
                                                                }

                                                            });
                                                        });
                                                    }
                                                })
                                            });
                                        }
                                    })
                                }
                            });
                        } else {
                            const msgparam = { "messagecode": objconstants.gstinexistcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.gstinexistcode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey
                                    }

                                });
                            });
                        }
                    })
                }
                else {
                    const msgparam = { "messagecode": objconstants.existcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.existcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }

                        });
                    });
                }
            })
        }

    }
    catch (e) {
        logger.error("Error in Registeration form : " + e);
    }
}
exports.changepassword = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
            return res.status(200).json({
                status: 401,
                message: "Unauthorized",
            });
        }
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else

                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Change password', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                // var params = { "employercode": Number(req.query.employercode) };
                objLogin.CheckMailNameExists(logparams, req, function (existresult) {
                    if (existresult != null) {
                        if (existresult.emailcount > 0) {
                            if (req.query.appcode == 1 || req.query.appcode == 2) {
                                objLogin.CheckDecryptPassword(logparams, req, function (validdecrypt) {
                                    console.log('encrypt', validdecrypt)
                                    if (validdecrypt == true) {
                                        console.log('------------------->')
                                        objLogin.ChangeNewpassword(logparams, req, function (validpwd) {
                                            if (validpwd != null && validpwd > 0) {
                                                const msgparam = { "messagecode": objconstants.passwordchangesuccesscode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        employer_json_result: {
                                                            varstatuscode: objconstants.passwordchangesuccesscode,
                                                            response: objconstants.successresponsecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey
                                                        }
                                                    });
                                                });
                                            }
                                        })
                                    }
                                    else {
                                        console.log('================>')
                                        const msgparam = { "messagecode": objconstants.oldpasswordincorrectcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                employer_json_result: {
                                                    varstatuscode: objconstants.oldpasswordincorrectcode,
                                                    response: objconstants.successresponsecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey
                                                }
                                            });
                                        });
                                    }
                                })
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
        logger.error("Error in Employer Change password : " + e);
    }
}
exports.CheckRegisterEmailname = async function (req, res) {
    try {
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Check Email ID', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objLogin.CheckMailNameExists(logparams, req, function (existresult) {
                if (existresult != null) {
                    if (existresult.emailcount == 0) {
                        const msgparam = { "messagecode": objconstants.newemailcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.newemailcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.existcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.existcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    employeestatus: existresult.statuscode
                                }
                            });
                        });
                    }
                }
                else {
                    const msgparam = { "messagecode": objconstants.newemailcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.newemailcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                employeestatus: existresult.statuscode
                            }
                        });
                    });
                }
            });
        }
    }
    catch (e) { logger.error("Error in Check valid email id - employer: " + e); }
}
exports.CheckRegisterMobile = async function (req, res) {
    try {
        // const decoded = await objUtilities.validateToken(req);
        // if (!decoded) {
        //     return res.status(200).json({
        //         status: 401,
        //         message: "Unauthorized",
        //     });
        // }
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Check Email ID', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objLogin.CheckmobileNoExists(logparams, req, function (existresult) {
                if (existresult != null) {
                    if (existresult.emailcount == 0) {
                        const msgparam = { "messagecode": objconstants.newmobilenocode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.newmobilenocode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.existcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.existcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    employeestatus: existresult.statuscode
                                }
                            });
                        });
                    }
                }
                else {
                    const msgparam = { "messagecode": objconstants.newmobilenocode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.newmobilenocode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                employeestatus: existresult.statuscode
                            }
                        });
                    });
                }
            });
        }
    }
    catch (e) { logger.error("Error in Check valid email id - employer: " + e); }
}

exports.CheckGSTIN = async function (req, res) {
    try {

        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Check GSTIN', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objUtilities.checkGSTINExists(logparams, req.query.gstn, req.query.employercode, function (validgstn) {
                if (validgstn == null || validgstn == 0) {
                    const msgparam = { "messagecode": objconstants.newgstincode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.newgstincode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }
                        });
                    });
                }
                else {
                    const msgparam = { "messagecode": objconstants.existcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.gstinexistcode,
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
    catch (e) { logger.error("Error in Check valid gstn - employer: " + e); }
}
exports.CheckPAN = async function (req, res) {
    try {

        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Check GSTIN', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objUtilities.checkPANExists(logparams, req.query.panno, req.query.employercode, function (validpan) {
                if (validpan == null || validpan == 0) {
                    const msgparam = { "messagecode": objconstants.newpancode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.newpancode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }
                        });
                    });
                }
                else {
                    const msgparam = { "messagecode": objconstants.existcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.existcode,
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
    catch (e) { logger.error("Error in Check valid gstn - employer: " + e); }
}
exports.CheckAadhar = async function (req, res) {
    try {

        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Check GSTIN', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objUtilities.checkAadharExists(logparams, req.query.aadhaarno, req.query.employercode, function (validaadhar) {
                if (validaadhar == null || validaadhar == 0) {
                    const msgparam = { "messagecode": objconstants.newaadharcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.newaadharcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey
                            }
                        });
                    });
                }
                else {
                    const msgparam = { "messagecode": objconstants.existcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.existcode,
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
    catch (e) { logger.error("Error in Check valid gstn - employer: " + e); }
}
exports.EmployerLanguageList = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
            return res.status(200).json({
                status: 401,
                message: "Unauthorized",
            });
        }
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Employer language List', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    objLogin.LanguageDeatils(logparams, function (response) {
                        if (response != null) {
                            const msgparam = { "messagecode": objconstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.listcode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        language_list: response
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
                    })
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
        logger.error("Error in Language List - employer: " + e);
    }
}
exports.ProfileImageUpload = async function (req, res) {
    try {
        // if (Number(req.query.typecode != 2)) {
        //     const decoded = await objUtilities.validateToken(req);
        //     if (!decoded) {
        //         return res.status(200).json({
        //             status: 401,
        //             message: "Unauthorized",
        //         });
        //     }
        // }
        objUtilities.checkemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Employer Update image', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    if (Number(req.query.typecode == 1)) {
                        objLogin.UpdateImage(logparams, req, function (response) {
                            if (response != null && response > 0) {
                                const msgparam = { "messagecode": objconstants.updatecode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.updatecode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
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
                    else if (Number(req.query.typecode == 2)) {
                        objLogin.UpdateGstn(logparams, req, function (response) {
                            if (response != null && response > 0) {
                                const msgparam = { "messagecode": objconstants.updatecode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.updatecode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
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
                    else if (Number(req.query.typecode == 3)) {
                        objLogin.UpdatePan(logparams, req, function (response) {
                            if (response != null && response > 0) {
                                const msgparam = { "messagecode": objconstants.updatecode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.updatecode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
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
                    else if (Number(req.query.typecode == 4)) {
                        objLogin.UpdateAadhar(logparams, req, function (response) {
                            if (response != null && response > 0) {
                                const msgparam = { "messagecode": objconstants.updatecode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.updatecode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
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
                    else if (Number(req.query.typecode == 5)) {
                        objLogin.Updatedocumentdetails(logparams, req, function (response) {
                            if (response != null && response > 0) {
                                const msgparam = { "messagecode": objconstants.updatecode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.updatecode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
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
                    else {
                        const msgparam = { "messagecode": objconstants.notvalidcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.notvalidcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey
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
        logger.error("Error in Upload image - employer: " + e);
    }
}
exports.DeactiveEmployer = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
            return res.status(200).json({
                status: 401,
                message: "Unauthorized",
            });
        }
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Employer statuscode update', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    objLogin.DeactiveEmployer(logparams, req, function (response) {
                        if (response != null && response > 0) {
                            const msgparam = { "messagecode": objconstants.accinactivecode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.accinactivecode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey
                                    }
                                });
                            });
                            /* objUtilities.GetAdminMailId(objconstants.admincode,function(mailid){
                                objUtilities.FindEmployerMailID(req.query.employercode, function(employermailid){
                                  //objProfile1.getProfileView(logparams, empparams, objconstants.defaultlanguagecode,req, function (prefresult) {
                                    objMail.DeactivateEmployer(req.query.employercode, employermailid, mailid, logparams ,function (validmail) {
                                      });
                                  //});
                                });
                              }); */


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
        logger.error("Error in Update statuscode - employer: " + e);
    }
}
exports.ActiveEmployer = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
            return res.status(200).json({
                status: 401,
                message: "Unauthorized",
            });
        }
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Employer statuscode update', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objUtilities.CheckOTPValue(logparams, req, objconstants.invisiblemodetypecode, function (validdata) {
                if (validdata != null && validdata.length > 0) {
                    ////console.log("Fulllist:", validdata);
                    var validdate = validdata[0].validitydate;
                    if (validdate > milliseconds) {
                        objLogin.ActiveEmployer(logparams, req, function (validresult) {
                            if (validresult == true) {
                                const msgparam = { "messagecode": objconstants.activatedcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.activatedcode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
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

                    else {
                        const msgparam = { "messagecode": objconstants.expriedcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.expriedcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                }
                else {
                    const msgparam = { "messagecode": objconstants.invalidotpcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employer_json_result: {
                                varstatuscode: objconstants.invalidotpcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });
                    });
                }
            });

        }
    }
    catch (e) {
        logger.error("Error in Update statuscode - employer: " + e);
    }
}
exports.ChangeEmailId = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
            return res.status(200).json({
                status: 401,
                message: "Unauthorized",
            });
        }
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Change Email ID', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    objLogin.CheckOldMailNameExists(logparams, req, function (validmail) {
                        if (validmail != null && validmail > 0) {
                            ////console.log(validmail)
                            objUtilities.CheckOTPValue(logparams, req, objconstants.changeemailtypecode, function (validdata) {
                                if (validdata != null && validdata.length > 0) {
                                    ////console.log("Fulllist:", validdata);
                                    var validdate = validdata[0].validitydate;
                                    if (validdate > milliseconds) {
                                        objLogin.CheckMailNameExists(logparams, req, function (existresult) {
                                            if (existresult != null) {
                                                if (existresult.emailcount == 0) {
                                                    objLogin.UpdateEmail(logparams, req, function (validid) {
                                                        if (validid != null && validid > 0) {
                                                            const msgparam = { "messagecode": objconstants.updatecode };
                                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                return res.status(200).json({
                                                                    employer_json_result: {
                                                                        varstatuscode: objconstants.updatecode,
                                                                        response: objconstants.successresponsecode,
                                                                        responsestring: msgresult[0].messagetext,
                                                                        responsekey: msgresult[0].messagekey
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
                                                else {
                                                    const msgparam = { "messagecode": objconstants.existcode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            employer_json_result: {
                                                                varstatuscode: objconstants.existcode,
                                                                response: objconstants.successresponsecode,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey
                                                            }
                                                        });
                                                    });
                                                }
                                            }
                                            else {
                                                objLogin.UpdateEmail(logparams, req, function (validid) {
                                                    if (validid != null && validid > 0) {
                                                        const msgparam = { "messagecode": objconstants.updatecode };
                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                            return res.status(200).json({
                                                                employer_json_result: {
                                                                    varstatuscode: objconstants.updatecode,
                                                                    response: objconstants.successresponsecode,
                                                                    responsestring: msgresult[0].messagetext,
                                                                    responsekey: msgresult[0].messagekey
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
                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": objconstants.expriedcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                employer_json_result: {
                                                    varstatuscode: objconstants.expriedcode,
                                                    response: objconstants.successresponsecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                }
                                            });
                                        });
                                    }
                                }
                                else {
                                    const msgparam = { "messagecode": objconstants.invalidotpcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employer_json_result: {
                                                varstatuscode: objconstants.invalidotpcode,
                                                response: objconstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                            })
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
    catch (e) { logger.error("Error in Change email id - employer: " + e); }
}
exports.checkValidEmployer = async function (req, res) {
    try {
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        logger.info("Activate Employer User name and Mobile No : UserId: " + req.query.employercode + ", Originator: 'Check Valid Employer', DeviceIP: " + req.query.ipaddress + ", Logdate: " + Date.now() + ", Type: " + logType);
        var params = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Employer Login Check', logdate: new Date(), type: logType }
        const dbo = MongoDB.getDB();
        var preference = 0;
        var empparams = { "employercode": Number(req.query.employercode) };
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            dbo.collection(MongoDB.EmployerCollectionName).updateOne(empparams, { $set: { "lastlogindate": currenttime } }, function (err, logres) {
                objUtilities.validateEmployer(req, function (validemp) {
                    // var preference=validemp[0].preference;
                    // if (validemp[0].preferences != null) {
                    //     preference = 1;
                    // }
                    if (validemp != null && validemp.length > 0) {
                        if (validemp[0].statuscode == objconstants.activestatus) {
                            //return res.status(200).json({
                            const msgparam = { "messagecode": objconstants.loginsuccesscode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.loginsuccesscode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                        registered_email: validemp[0].registered_email//,
                                        //preference_count: preference
                                    }
                                });

                            });
                        }
                        else if (validemp[0].statuscode == objconstants.inactivestatus) {
                            const msgparam = { "messagecode": objconstants.deactivateaccountcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.deactivateaccountcode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        registered_email: validemp[0].registered_email
                                    }

                                });
                            });
                        }
                        else if (validemp[0].statuscode == objconstants.blockstatus) {
                            const msgparam = { "messagecode": objconstants.abusedcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.abusedcode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        registered_email: validemp[0].registered_email
                                    }

                                });
                            });
                        }
                        else if (validemp[0].statuscode == objconstants.pendingstatus) {
                            const msgparam = { "messagecode": objconstants.pendingcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.pendingcode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        registered_email: validemp[0].registered_email
                                    }

                                });
                            });
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
            });
        });


    }
    catch (e) { logger.error("Error in Check valid employer: " + e); }

}
exports.VerificationUpdate = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
            return res.status(200).json({
                status: 401,
                message: "Unauthorized",
            });
        }
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, orginator: 'Verification Update', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        //var insertparams = req.body;
        // //console.log(insertparams);
        if (req.query.appcode == 1 || req.query.appcode == 2) {
            objUtilities.decryptemployerdetails(logparams, req.query.employerdetails, function (decryptemployerdetails) {
                ////console.log(decryptemployerdetails);
                var employerdetails = decryptemployerdetails;
                const employerarray = employerdetails.split("~");
                var employercode = employerarray[0];
                var employermailid = employerarray[1];
                var checkparams = { "employercode": employercode };
                ////console.log(employercode);
                objLogin.checkEmployerCode(logparams, checkparams, function (validemployer) {
                    if (validemployer != null && validemployer > 0) {
                        ////console.log(validemployer);
                        objUtilities.checkVerifyEmailIdExists(logparams, employermailid, function (validmail) {
                            var isValidEmail = 0;
                            // if(req.query.typecode==1){
                            //     if (validmail != null && validmail != 0) {
                            //         isValidEmail = 1;
                            //     }
                            // }
                            // else{
                            //     if (validmail == null || validmail == 0) {
                            //         isValidEmail = 1;
                            //     }
                            // }
                            if (validmail != null && validmail != 0) {
                                isValidEmail = 1;
                            }
                            if (isValidEmail) {
                                // if (1==1) {
                                objUtilities.InsertLog(logparams, function (validlog) {
                                    if (validlog != null && validlog != "") {
                                        var params = { "employercode": employercode };
                                        var updateparams = {};
                                        if (req.query.typecode == 1) {
                                            updateparams = { "verificationstatus": objconstants.verifiedstatus }
                                        }
                                        else {
                                            updateparams = { "verificationstatus": objconstants.verifiedstatus, "registered_email": employermailid, "changed_email": "" }
                                        }
                                        objLogin.UpdateVerificationStatus(logparams, params, updateparams, function (updatevalue) {
                                            if (updatevalue == true) {
                                                const msgparam = { "messagecode": objconstants.verifiedcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        employer_json_result: {
                                                            varstatuscode: objconstants.verifiedcode,
                                                            response: objconstants.successresponsecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                            //  returncode: validcode
                                                        }

                                                    });
                                                });
                                                /*  var registered_email = req.body.registered_email;
                                                    // //console.log(registered_email);
                                                    objMail.RegistrationMail(logparams, registered_email, function (validmail) {
                                                    }); */
                                            }
                                            else {
                                                const msgparam = { "messagecode": objconstants.notvalidcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        employer_json_result: {
                                                            varstatuscode: objconstants.notvalidcode,
                                                            response: objconstants.successresponsecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey
                                                        }

                                                    });
                                                });
                                            }
                                        })
                                    }
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.existcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employer_json_result: {
                                            varstatuscode: objconstants.existcode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
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
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey
                                }

                            });
                        });
                    }
                });


            });

        }

    }
    catch (e) {
        logger.error("Error in Update Verification Status : " + e);
    }
}

exports.CheckVersion = async function (req, res) {
    try {
        // const decoded = await objUtilities.validateToken(req);
        // if (!decoded) {
        //     return res.status(200).json({
        //         status: 401,
        //         message: "Unauthorized",
        //     });
        // }
        var logType = "";
        if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
        else
            logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.registered_email, orginator: 'Check Version', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (Number(req.query.appcode) == 1) {
            objLogin.CheckVersion(logparams, function (validdata) {
                ////console.log(validdata);
                var employeeversion = validdata[0].employeeappversion;
                ////console.log(employeeversion);
                if (validdata != null) {
                    if (Number(req.query.versioncode) >= Number(employeeversion)) {
                        ////console.log("entry");
                        const msgparam = { "messagecode": objconstants.oldversioncode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employee_json_result: {
                                    varstatuscode: objconstants.oldversioncode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    force_to_update: validdata[0].isemployeeforceupdate,
                                }

                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.newversioncode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employee_json_result: {
                                    varstatuscode: objconstants.newversioncode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    force_to_update: validdata[0].isemployeeforceupdate,
                                }

                            });
                        });
                    }
                }


            });

        }
        else if (Number(req.query.appcode) == 2) {
            objLogin.CheckVersion(logparams, function (validdata) {
                var employerversion = validdata[0].employerappversion;
                if (validdata != null) {
                    if (Number(req.query.versioncode) >= Number(employerversion)) {
                        const msgparam = { "messagecode": objconstants.oldversioncode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.oldversioncode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    force_to_update: validdata[0].isemployerforceupdate,
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.newversioncode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employer_json_result: {
                                    varstatuscode: objconstants.newversioncode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    force_to_update: validdata[0].isemployerforceupdate,
                                }

                            });
                        });
                    }
                }


            });

        }

    }
    catch (e) {
        logger.error("Error in Check Version" + e);
    }
}

