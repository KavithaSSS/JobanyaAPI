'use strict';
var admin_shortlist = require('../process/admin_shortlist_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
var objEmployeeProfile = require('../process/employee_profile_process_controller');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.ShortListReport = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Shortlist report', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = objConstants.defaultlanguagecode;
                objEmployeeProfile.EmpListLoad(logparams, languagecode, function (employeeresult) {
                    admin_shortlist.ShortListInvitedList(logparams, req, function (invitedres) {
                        var finallist = [];
                        if(invitedres != null && invitedres.length > 0)
                        {
                            ////console.log(invitedres.length);
                            ////console.log(invitedres);
                            finallist.push.apply(finallist, invitedres);
                            //finallist.push(invitedres);
                        }
                        admin_shortlist.ShortListAppliedList(logparams, req, function (appliedres) {
                            if (appliedres != null && appliedres.length > 0) {
                                finallist.push.apply(finallist, appliedres);
                                //finallist.push(appliedres);
                            }
                            if (finallist != null && finallist.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        shortlist_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                            masterlist: employeeresult,
                                            shortlist: finallist
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        shortlist_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode
                                        }
                                    });
                                });
                            }
                        })
                    });
                });

            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        shortlist_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
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
        logger.error("Error in ShortList - report " + e);
    }
}

exports.AppliedReport = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Applied report', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = objConstants.defaultlanguagecode;
                        var finallist = [];
                        var recommendedcountlist = [];
                        var empcode = [];
                        admin_shortlist.AppliedList(logparams, req, function (appliedres) {
                            if (appliedres != null && appliedres.length > 0) {
                                finallist.push.apply(finallist, appliedres);
                                //finallist.push(appliedres);
                            }
                            if (req.query.isnew == 1)
                            {
                                for(var i = 0; i< appliedres.length; i++){
                                    empcode.push(appliedres[i].employeeinfo.employeecode)
                                }
                                admin_shortlist.GetRecommendedJobCount(logparams, empcode, function (jobcountres) {
                                    recommendedcountlist = jobcountres;
                                    if (finallist != null && finallist.length > 0) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                applied_json_result: {
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode,
                                                    appliedlist: finallist,
                                                    recommendedcountlist: recommendedcountlist
                                                }
                                            });
                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                applied_json_result: {
                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objConstants.successresponsecode
                                                }
                                            });
                                        });
                                    }

                                });
                                
                            }
                            else
                            {
                                recommendedcountlist = [];
                                if (finallist != null && finallist.length > 0) {
                                    const msgparam = { "messagecode": objConstants.listcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            applied_json_result: {
                                                varstatuscode: objConstants.listcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objConstants.successresponsecode,
                                                appliedlist: finallist,
                                                recommendedcountlist: recommendedcountlist
                                            }
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            applied_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objConstants.successresponsecode
                                            }
                                        });
                                    });
                                }
                            }
                            
                        })
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        applied_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
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
        logger.error("Error in Applied - report " + e);
    }
}

exports.InvitedReport = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Applied report', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = objConstants.defaultlanguagecode;
                        var finallist = [];
                        
                        admin_shortlist.InvitedList(logparams, req, function (appliedres) {
                            if (appliedres != null && appliedres.length > 0) {
                                finallist.push.apply(finallist, appliedres);
                                //finallist.push(appliedres);
                            }
                            if (finallist != null && finallist.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        invited_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                            invitedlist: finallist
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        invited_json_result: {
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
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        invited_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
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
        logger.error("Error in Applied - report " + e);
    }
}


exports.ExcelAppliedReport =async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Applied report', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = objConstants.defaultlanguagecode;
                        var finallist = [];
                        
                        admin_shortlist.AppliedListExcel(logparams, req, function (appliedres) {
                            if (appliedres != null && appliedres.length > 0) {
                                finallist.push.apply(finallist, appliedres);
                                //finallist.push(appliedres);
                            }
                            if (finallist != null && finallist.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        applied_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                            appliedlist: finallist
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        applied_json_result: {
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
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        applied_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
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
        logger.error("Error in Applied - report " + e);
    }
}

exports.ExcelInvitedReport = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Applied report', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = objConstants.defaultlanguagecode;
                        var finallist = [];
                        
                        admin_shortlist.InvitedListExcel(logparams, req, function (appliedres) {
                            if (appliedres != null && appliedres.length > 0) {
                                finallist.push.apply(finallist, appliedres);
                                //finallist.push(appliedres);
                            }
                            if (finallist != null && finallist.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        invited_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                            invitedlist: finallist
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        invited_json_result: {
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
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        invited_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
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
        logger.error("Error in Applied - report " + e);
    }
}

exports.NotAppliedReport = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Applied report', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = objConstants.defaultlanguagecode;
                        var finallist = [];
                        var recommendedcountlist = [];
                        var empcode = [];
                        admin_shortlist.NotAppliedList(logparams, req, function (appliedres) {
                            if (appliedres != null && appliedres.length > 0) {
                                finallist.push.apply(finallist, appliedres);
                                //finallist.push(appliedres);
                            }
                            if (finallist != null && finallist.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        applied_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                            appliedlist: finallist
                                            //recommendedcountlist: recommendedcountlist
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        applied_json_result: {
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
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        applied_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
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
        logger.error("Error in Applied - report " + e);
    }
}

exports.NotAppliedReportDetails = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Applied report', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = objConstants.defaultlanguagecode;
                        var finallist = [];
                        var recommendedcountlist = [];
                        var empcode = [];
                        admin_shortlist.NotAppliedListDetails(logparams, req, function (appliedres) {
                            if (appliedres != null && appliedres.length > 0) {
                                finallist.push.apply(finallist, appliedres);
                                //finallist.push(appliedres);
                            }
                            if (finallist != null && finallist.length > 0) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        applied_json_result: {
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objConstants.successresponsecode,
                                            appliedlist: finallist
                                            //recommendedcountlist: recommendedcountlist
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        applied_json_result: {
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
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        applied_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
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
        logger.error("Error in Applied - report " + e);
    }
}
