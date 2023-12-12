'use strict';
var objEmployeeNotification = require('../process/notification_process_controller');
var objSendNotification = require('../process/send_notification_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
var date = new Date(); // some mock date
var milliseconds = date.getTime();
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.NotificationTotalCount = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var logType = "";
        if (req.query.apptypecode == 1)
            logType = objConstants.employeeLogType;
        else if (req.query.apptypecode == 2)
            logType = objConstants.AppEmployerLogType;
        else
            logType = objConstants.portalLogType;
        var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.usercode, "orginator": 'Notification Count', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            if (req.query.apptypecode == 1) {
                objUtilities.checkvalidemployee(req.query.usercode, function (validemp) {
                    if (validemp == true) {
                        objEmployeeNotification.NewNotificationCount(logparams, req, function (newnotification) {
                            // //console.log(newnotification);
                            objEmployeeNotification.InvitedNotificationCount(logparams, req, function (invitenodification) {
                                // //console.log(invitenodification)
                                if ((newnotification != null && newnotification > 0) || (invitenodification != null && invitenodification > 0)) {
                                    const msgparam = { "messagecode": objConstants.listcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employee_notification_json_result: {
                                                varstatuscode: objConstants.listcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                overall_count: newnotification,
                                                invited_count: invitenodification
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employee_notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                            })
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employee_notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                })
            }
            else if (req.query.apptypecode == 2) {
                objUtilities.checkvalidemployer(req.query.usercode, function (validemployer) {
                    if (validemployer == true) {
                        objEmployeeNotification.NewNotificationCount(logparams, req, function (newnotification) {
                            // //console.log(newnotification);
                            if (newnotification != null && newnotification > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            overall_count: newnotification
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
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
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                })
            }
            else if (req.query.apptypecode == 3) {
                objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validuser) {
                    if (validuser == true) {
                        objEmployeeNotification.NewNotificationCount(logparams, req, function (newnotification) {
                            // //console.log(newnotification);
                            if (newnotification != null && newnotification > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            overall_count: newnotification
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
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
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                })
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        notification_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Notification count: " + e);
    }
}
exports.NotificationStatusUpdate = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var logType = "";
        ////console.log(req.query.usercode);
        if (req.query.apptypecode == 1)
            logType = objConstants.employeeLogType;
        else if (req.query.apptypecode == 2)
            logType = objConstants.AppEmployerLogType;
        else
            logType = objConstants.portalLogType;
        var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.usercode, "orginator": 'Notification Statuscode update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            if (req.query.apptypecode == 1) {
                objUtilities.checkvalidemployee(req.query.usercode, function (validemp) {
                    // //console.log(req.query.usercode);
                    if (validemp == true) {
                        if (req.query.typecode == 1) {
                            objEmployeeNotification.UpdateOverallStatus(logparams, req, function (updateres) {
                                objEmployeeNotification.NotificationtypeCount(logparams, req, function (countres) {
                                    if (countres != null) {
                                        const msgparam = { "messagecode": objConstants.updatecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                notification_json_result: {
                                                    varstatuscode: objConstants.updatecode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    count_list: countres
                                                }
                                            });
                                        });
                                    }
                                });
                            });
                        }
                        else {
                            objEmployeeNotification.UpdateShortliststatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
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
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 2) {
                objUtilities.checkvalidemployer(req.query.usercode, function (validemployer) {
                    if (validemployer == true) {
                        if (req.query.typecode == 1) {
                            objEmployeeNotification.UpdateOverallStatus(logparams, req, function (updateres) {
                                objEmployeeNotification.NotificationtypeCount(logparams, req, function (countres) {
                                    if (countres != null) {
                                        const msgparam = { "messagecode": objConstants.updatecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                notification_json_result: {
                                                    varstatuscode: objConstants.updatecode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    count_list: countres
                                                }
                                            });
                                        });
                                    }
                                });
                            })
                        }
                        else {
                            objEmployeeNotification.UpdateShortliststatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
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
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 3) {
                objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validuser) {
                    if (validuser == true) {
                        if (req.query.typecode == 1) {
                            objEmployeeNotification.UpdateOverallStatus(logparams, req, function (updateres) {
                                objEmployeeNotification.NotificationtypeCount(logparams, req, function (countres) {
                                    if (countres != null) {
                                        const msgparam = { "messagecode": objConstants.updatecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                notification_json_result: {
                                                    varstatuscode: objConstants.updatecode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    count_list: countres
                                                }
                                            });
                                        });
                                    }
                                });
                            })
                        }
                        else {
                            objEmployeeNotification.UpdateShortliststatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
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
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Notification Statuscode update : " + e);
    }
}
exports.UpdateDismissStatus = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var logType = "";
        ////console.log(req.query.usercode);
        if (req.query.apptypecode == 1)
            logType = objConstants.employeeLogType;
        else if (req.query.apptypecode == 2)
            logType = objConstants.AppEmployerLogType;
        else
            logType = objConstants.portalLogType;
        var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.usercode, "orginator": 'Dismiss Notification', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            if (req.query.apptypecode == 1) {
                objUtilities.checkvalidemployee(req.query.usercode, function (validemp) {
                    if (validemp == true) {
                        if (req.query.typecode == 1) {
                            objEmployeeNotification.UpdateDismissStatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            objEmployeeNotification.UpdateDismissAllStatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
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
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 2) {
                objUtilities.checkvalidemployer(req.query.usercode, function (validemployer) {
                    if (validemployer == true) {
                        if (req.query.typecode == 1) {
                            objEmployeeNotification.UpdateDismissStatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            objEmployeeNotification.UpdateDismissAllStatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
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
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 3) {
                objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validuser) {
                    if (validuser == true) {
                        if (req.query.typecode == 1) {
                            objEmployeeNotification.UpdateDismissStatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            objEmployeeNotification.UpdateDismissAllStatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
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
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Dismiss Notification : " + e);
    }
}
exports.NotificationList = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var logType = "";
        ////console.log(req.query.usercode);
        if (req.query.usercode != null) {
            logType = objConstants.employeeLogType;
        }
        var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.usercode, "orginator": 'Notification List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            if (req.query.apptypecode == 1) {
                objUtilities.checkvalidemployee(req.query.usercode, function (validemp) {
                    if (validemp == true) {
                        objEmployeeNotification.NodificationList(logparams, req, function (validdata) {
                            if (validdata != null && validdata.length > 0) {
                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                    const msgparam = { "messagecode": objConstants.listcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.listcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                nodification_list: validdata,
                                                currenttime: currenttime
                                            }
                                        });
                                    });
                                });                                
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                        }
                                    });
                                });
                            }
                        })
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 2) {
                objUtilities.checkvalidemployer(req.query.usercode, function (validemployer) {
                    if (validemployer == true) {
                        objEmployeeNotification.NodificationList(logparams, req, function (validdata) {
                            if (validdata != null && validdata.length > 0) {
                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                    const msgparam = { "messagecode": objConstants.listcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.listcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                nodification_list: validdata,
                                                currenttime: currenttime
                                            }
                                        });
                                    });
                                });                                
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                        }
                                    });
                                });
                            }
                        })
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 3) {
                objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validuser) {
                    if (validuser == true) {
                        objEmployeeNotification.NodificationList(logparams, req, function (validdata) {
                            if (validdata != null && validdata.length > 0) {
                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                    const msgparam = { "messagecode": objConstants.listcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.listcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                nodification_list: validdata,
                                                currenttime: currenttime
                                            }
                                        });
                                    });
                                });                                
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                        }
                                    });
                                });
                            }
                        })
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in  Notification List : " + e);
    }
}
exports.DeviceTokenEntry = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var logType = "";
        ////console.log(req.query.usercode);
        if (Number(req.query.apptypecode)==1) {
            logType = objConstants.employeeLogType;
        }
        else{
            logType = objConstants.AppEmployerLogType;
        }
        var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.usercode, "orginator": 'Token Entry', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            if (req.query.apptypecode == 1) {
                objUtilities.checkvalidemployee(req.query.usercode, function (validemp) {
                    if (validemp == true) {
                        objEmployeeNotification.UpdatePreferredLanguage(logparams, req, function (result) {
                            objEmployeeNotification.DisableDevice(logparams, req, function (result) {
                                //objSendNotification.CreateEndPointARN(logparams, req, function (arnresult) {
                                    ////console.log(arnresult);
                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                        var insertitem = {
                                            usercode: Number(req.query.usercode),
                                            apptypecode: Number(req.query.apptypecode),
                                            deviceid: req.query.deviceid,
                                            devicetoken: req.body.devicetoken,
                                            languagecode: Number(req.body.languagecode),                                        
                                            statuscode: objConstants.activestatus,
                                            createddate: currenttime
                                        }
                                        objEmployeeNotification.InsertDeviceDetails(logparams, insertitem, function (insertres) {
                                            if (insertres != null && insertres > 0) {
                                                const msgparam = { "messagecode": objConstants.savedcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        notification_json_result: {
                                                            varstatuscode: objConstants.savedcode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        notification_json_result: {
                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    });
                                    
                                //});                            
                            })
                        });
                        
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 2) {
                objUtilities.checkvalidemployer(req.query.usercode, function (validemployer) {
                    if (validemployer == true) {
                        objEmployeeNotification.UpdatePreferredLanguage(logparams, req, function (result) {
                            objEmployeeNotification.DisableDevice(logparams, req, function (result) {
                                //objSendNotification.CreateEndPointARN(logparams, req, function (arnresult) {
                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                        var insertitem = {
                                            usercode: Number(req.query.usercode),
                                            apptypecode: Number(req.query.apptypecode),
                                            deviceid: req.query.deviceid,
                                            devicetoken: req.body.devicetoken,
                                            statuscode: objConstants.activestatus,
                                            createddate: currenttime
                                        }
                                        objEmployeeNotification.InsertDeviceDetails(logparams, insertitem, function (insertres) {
                                            if (insertres != null && insertres > 0) {
                                                const msgparam = { "messagecode": objConstants.savedcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        notification_json_result: {
                                                            varstatuscode: objConstants.savedcode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        notification_json_result: {
                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    });
                                    
                                //});
                                
                            });
                        });
                        
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in  Token Entry : " + e);
    }
}
exports.DeviceTokenDisable = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var logType = "";
        ////console.log(req.query.usercode);
        if (req.query.usercode != null) {
            logType = objConstants.employeeLogType;
        }
        var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.usercode, "orginator": 'Logout device', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            if (req.query.apptypecode == 1) {
                objUtilities.checkvalidemployee(req.query.usercode, function (validemp) {
                    if (validemp == true) {
                        objEmployeeNotification.DeviceTokenDisable(logparams, req, function (result) {
                            if (result != null && result > 0) {
                                const msgparam = { "messagecode": objConstants.logoutcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.logoutcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
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
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 2) {
                objUtilities.checkvalidemployer(req.query.usercode, function (validemployer) {
                    if (validemployer == true) {
                        objEmployeeNotification.DeviceTokenDisable(logparams, req, function (result) {
                            if (result != null && result > 0) {
                                const msgparam = { "messagecode": objConstants.logoutcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.logoutcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        notification_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
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
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in  Logout device : " + e);
    }
}
exports.UpdateViewedStatus = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var logType = "";
        ////console.log(req.query.usercode);
        if (req.query.apptypecode == 1)
            logType = objConstants.employeeLogType;
        else if (req.query.apptypecode == 2)
            logType = objConstants.AppEmployerLogType;
        else
            logType = objConstants.portalLogType;
        var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.usercode, "orginator": 'Viewed Notification', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            if (req.query.apptypecode == 1) {
                objUtilities.checkvalidemployee(req.query.usercode, function (validemp) {
                    if (validemp == true) {
                        objEmployeeNotification.UpdateViewedNotificationStatus(logparams, req, function (updateres) {
                            objEmployeeNotification.NotificationtypeCount(logparams, req, function (countres) {
                                if (countres != null) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                count_list: countres,
                                            }
                                        });
                                    });
                                }

                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 2) {
                objUtilities.checkvalidemployer(req.query.usercode, function (validemployer) {
                    if (validemployer == true) {
                        objEmployeeNotification.UpdateViewedNotificationStatus(logparams, req, function (updateres) {
                            objEmployeeNotification.NotificationtypeCount(logparams, req, function (countres) {
                                if (countres != null) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                count_list: countres,
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else if (req.query.apptypecode == 3) {
                objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validuser) {
                    if (validuser == true) {
                        objEmployeeNotification.UpdateViewedNotificationStatus(logparams, req, function (updateres) {
                            objEmployeeNotification.NotificationtypeCount(logparams, req, function (countres) {
                                if (countres != null) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                count_list: countres,
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Viewed Notification : " + e);
    }
}


exports.NotificationRemarksUpdate = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var logType = "";
        ////console.log(req.query.usercode);
        if (req.query.apptypecode == 1)
            logType = objConstants.employeeLogType;
        else if (req.query.apptypecode == 2)
            logType = objConstants.AppEmployerLogType;
        else
            logType = objConstants.portalLogType;
        var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.usercode, "orginator": 'Notification Statuscode update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
           
           
            if (req.query.apptypecode == 3) {
                objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validuser) {
                    if (validuser == true) {
                       
                        //else {
                            objEmployeeNotification.UpdateRemarksstatus(logparams, req, function (updateres) {
                                if (updateres != null && updateres > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            notification_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                            });
                        //}
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.usernotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                notification_json_result: {
                                    varstatuscode: objConstants.usernotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Notification Remarks Statuscode update : " + e);
    }
}

