const get_newsevents_details = require('../process/employer_newsandevents_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')

exports.NewsBind = async function (req, res) {
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
                    logType = objConstants.portalEmployerLogType;
                else
                    logType = objConstants.AppEmployerLogType;
                // //console.log( req.query.ipaddress)
                var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.employercode, "orginator": 'News Bind', "type": logType };
                objUtilities.getLogDetails(params, function (logresponse) {
                    var logparams = logresponse;
                    if (req.query.appcode == 1 || req.query.appcode == 2) {
                        get_newsevents_details.NewsBind(logparams, req, function (bindnews) {
                            if (bindnews.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        news_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext,
                                            newslistbind: bindnews
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        news_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        news_json_result: {
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
        { logger.error("Error in Employer News bind: " + e); }
    }
}

exports.NewsDetails = async function (req, res) {
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
                    logType = objConstants.portalEmployerLogType;
                else
                    logType = objConstants.AppEmployerLogType;
                // //console.log( req.query.ipaddress)
                var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.employercode, "orginator": 'News Bind', "type": logType };
                objUtilities.getLogDetails(params, function (logresponse) {
                    var logparams = logresponse;
                    if (req.query.appcode == 1 || req.query.appcode == 2) {
                        get_newsevents_details.NewsDetails(logparams, req, function (bindnews) {
                            if (bindnews.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        news_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext,
                                            newsdetails: bindnews
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        news_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        news_json_result: {
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
        { logger.error("Error in Employer News Details: " + e); }
    }
}

exports.EventsBind = async function (req, res) {
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
                    logType = objConstants.portalEmployerLogType;
                else
                    logType = objConstants.AppEmployerLogType;
                var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.employercode, "orginator": 'Events Bind ', "type": logType };
                objUtilities.getLogDetails(params, function (logresponse) {
                    var logparams = logresponse;

                    if (req.query.appcode == 1 || req.query.appcode == 2) {
                        get_newsevents_details.EventsBind(logparams, req, function (bindevents) {
                            if (bindevents.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        events_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext,
                                            eventslistbind: bindevents
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        events_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        events_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgtext,
                        }
                    });
                });
            }
        });

    }
    catch (e) { logger.error("Error in Employer Events bind: " + e); }

}

exports.EventsDetails = async function (req, res) {
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
                    logType = objConstants.portalEmployerLogType;
                else
                    logType = objConstants.AppEmployerLogType;
                var params = { "ipaddress": req.query.ipaddress, "usercode": req.query.employercode, "orginator": 'Events Bind ', "type": logType };
                objUtilities.getLogDetails(params, function (logresponse) {
                    var logparams = logresponse;

                    if (req.query.appcode == 1 || req.query.appcode == 2) {
                        get_newsevents_details.EventsDetails(logparams, req, function (bindevents) {
                            if (bindevents.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        events_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext,
                                            eventsdetails: bindevents
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        events_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        events_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgtext,
                        }
                    });
                });
            }
        });

    }
    catch (e) { logger.error("Error in Employer Events bind: " + e); }

}