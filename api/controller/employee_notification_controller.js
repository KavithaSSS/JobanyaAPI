'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objNotification = require('../process/employee_notification_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')

exports.NotificationStatus = function (req, res) {
  try {
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = req.query.employeecode;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employeecode, "orginator": 'Notification Load', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      var logparams = logresponse;
      objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
        if (validemp == true) {
          objNotification.Notification(logparams, req, function (validnodification) {
            if (validnodification != null) {
              const msgparam = { "messagecode": objconstants.listcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                return res.status(200).json({
                  notification_json_result: {
                    varstatuscode: objconstants.listcode,
                    response: objconstants.successresponsecode,
                    responsestring: msgtext,
                    notificationtype: validnodification.notificationtype,
                    notification: validnodification.notification
                  }
                });
              });
            }
          })
        }
        else {
          const msgparam = { "messagecode": objconstants.usernotfoundcode };
          objUtilities.getMessageDetails(msgparam, function (msgtext) {
            return res.status(200).json({
              notification_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                response: objconstants.successresponsecode,
                responsestring: msgtext,
              }
            });
          });
        }
      })
    })
  }
  catch (e) {
    { logger.error("Error in Employee Notification status: " + e); }
  }
}
exports.NotificationSave = function (req, res) {
  try {
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = req.query.employeecode;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Update Notification Status ', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      var logparams = logresponse;
      objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
        if (validemp == true) {
          objNotification.FindNotificationStatus(req, function (validstatus) {
            ////console.log(validstatus);
            if (validstatus == true) {
              objNotification.UpdateNotificationStatus(req, function (updatestatus) {
                if (updatestatus != 0 && updatestatus > 0) {
                  const msgparam = { "messagecode": objconstants.updatecode };
                  objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                      notification_json_result: {
                        varstatuscode: objconstants.updatecode,
                        response: objconstants.successresponsecode,
                        responsestring: msgtext
                      }
                    });
                  });
                }

              })
            }
            else {
              objNotification.NotificationMaxcode(logparams, function (response) {
                var data = {
                  "employeecode": Number(req.query.employeecode),
                  "notificationcode": response,
                  "notificationtypecode": Number(req.query.notificationtypecode),
                  "notificationtypestatus": Number(req.query.notificationtypestatus),
                  "statuscode": Number(objconstants.activestatus),
                  "createddate": Date.now(),
                }
                objNotification.NotificationSave(logparams, data, function (validcode) {
                  if (validcode != null && validcode > 0) {
                    const msgparam = { "messagecode": objconstants.updatecode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                      return res.status(200).json({
                        notification_json_result: {
                          varstatuscode: objconstants.updatecode,
                          response: objconstants.successresponsecode,
                          responsestring: msgtext
                        }
                      });
                    });
                  }
                });
              });
            }
          });
        }
        else {
          const msgparam = { "messagecode": objconstants.usernotfoundcode };
          objUtilities.getMessageDetails(msgparam, function (msgtext) {
            return res.status(200).json({
              notification_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                response: objconstants.successresponsecode,
                responsestring: msgtext,
              }
            });
          });
        }
      });
    });
  }
  catch (e) {
    { logger.error("Error in Employee Notification status: " + e); }
  }
}
