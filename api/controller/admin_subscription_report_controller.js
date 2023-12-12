'use strict';
var admin_subscription = require('../process/admin_subscription_report_process_controller');
var objEmployeeProfile = require('../process/employee_profile_process_controller');
const objEmployerManagement = require('../process/employer_management_process_controller');
const objUtilities = require('./utilities');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.SubscriptionList = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Sales Report', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = objConstants.defaultlanguagecode;
                objEmployeeProfile.EmpListLoad(logparams, languagecode, function (employeeresult) {
                    if (employeeresult != null) {
                        objEmployerManagement.EmployerFormLoad(logparams, languagecode, function (validresult) {
                            if (validresult != null) {
                                admin_subscription.SubscriptionList(logparams, req, function (listres) {
                                    const msgparam = { "messagecode": objConstants.listcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            subscription_report_json_result: {
                                                response: objConstants.successresponsecode,
                                                varstatuscode: objConstants.listcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                masterslist: employeeresult,
                                                facilitylist: validresult.facility,
                                                industrylist: validresult.industry,
                                                employerlist: listres
                                            }
                                        });

                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        subscription_report_json_result: {
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
                                subscription_report_json_result: {
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
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        subscription_report_json_result: {
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
        logger.error("Error in Sales - report " + e);
    }
}