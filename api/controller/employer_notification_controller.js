'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objNotification = require('../process/employer_notification_process_controller');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')

exports.NotificationStatus = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Notification Load', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    objNotification.Notification(logparams, req, function (validnodification) {
                        if (validnodification != null) {
                            const msgparam = { "messagecode": objconstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employer_json_result: {
                                        varstatuscode: objconstants.listcode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        notificationtype: validnodification.notificationtype,
                                        notification: validnodification.notification
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
        { logger.error("Error in Employer Notification Load: " + e); }
    }
}
exports.NotificationSave = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Notification save', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.appcode == 1 || req.query.appcode == 2) {
                    objNotification.UpdateNotificationStatus(logparams, req, function (validstatus) {
                        if (validstatus == true) {
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
                            objUtilities.InsertLog(logparams, function (validlog) {
                                if (validlog != null && validlog != 0) {
                                    objNotification.GetMaxcode(logparams, function (validcode) {
                                        if (validcode != null && validcode != 0) {
                                            var params = {
                                                "employercode": Number(req.query.employercode),
                                                "notificationcode": validcode,
                                                "notificationtypecode": Number(req.query.notificationtypecode),
                                                "notificationtypestatus": Number(req.query.notificationtypestatus),
                                                "createdate": Date.now(),
                                                "statuscode": Number(objconstants.activestatus),
                                                "makerid": validlog,
                                                "updateddate": 0
                                            }
                                            objNotification.NotificationDetailsInsert(logparams, params, function (insertvalue) {
                                                if (insertvalue != null && insertvalue > 0) {
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
                                            })
                                        }
                                    })
                                }
                            })
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
        { logger.error("Error in Employer Notification Save: " + e); }
    }
}