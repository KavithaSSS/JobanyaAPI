'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
//const {notvalidcode,alreadyinusecode, createcode,listcode, existcode,updatecode,deletecode, recordnotfoundcode, successresponsecode,usernotfoundcode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const objDashboard = require('../process/employer_dashboard_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')


exports.employer_dashboard_load = function (req, res) {
    try {
        objUtilities.checkvalidemployer(req.query.employercode, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Dash board Load', logdate: new Date(), type: 'Employer Dashboard' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var empparams = {"employercode": req.query.employercode};
                
                objDashboard.getEmployerDashboardList(logparams,empparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                dashboard_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    dashboard_list: response
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                dashboard_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgtext
                                }
                            });
                        });
                    }
                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        dashboard_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Dashboard List: " + e);
    }
}