'use strict';
var admin_sales = require('../process/admin_sales_report_process_controller');
var objEmployeeProfile = require('../process/employee_profile_process_controller');
const objEmployerManagement = require('../process/employer_management_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')

exports.SalesReportLoad = async function (req, res) {
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
                //var params = { "languagecode": Number(req.query.languagecode) };
                admin_sales.SalesReportLoad(logparams, function (loadresult) {
                    if (loadresult != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sales_json_result: {
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objConstants.successresponsecode,
                                    CompanytypeList: loadresult.companylist,
                                    PackageList: loadresult.packagelist,
                                    UserList: loadresult.userlist,
                                    LoginActivityList: loadresult.activitylist
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sales_json_result: {
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
                        sales_json_result: {
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
        logger.error("Error in Sales - report " + e);
    }
}
exports.SalesReportList = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Sales List Report', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = objConstants.defaultlanguagecode;
                objEmployeeProfile.EmpListLoad(logparams, languagecode, function (employeeresult) {
                    if (employeeresult != null) {
                        objEmployerManagement.EmployerFormLoad(logparams, languagecode, function (validresult) {
                            if (validresult != null) {
                                admin_sales.SalesReportLoad(logparams, function (loadresult) {
                                    if (loadresult != null) {
                                        admin_sales.EmployerList(logparams, req, function (empresult) {
                                            if (empresult != null && empresult.length > 0) {
                                                const msgparam = { "messagecode": objConstants.listcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        sales_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.listcode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                            masterslist: employeeresult,
                                                            facilitylist: validresult.facility,
                                                            industrylist: validresult.industry,
                                                            employerlist: empresult
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        sales_json_result: {
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
                                });


                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        sales_json_result: {
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
                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        sales_json_result: {
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
        logger.error("Error in Sales List - report " + e);
    }
}
exports.SalesReportFilter = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Sales Filter List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails
                objEmployerManagement.EmployerList(logparams, req, function (validresult) {
                    if (validresult != null && validresult.length > 0) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sales_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    employerlist: validresult
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sales_json_result: {
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
                        sales_json_result: {
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
        logger.error("Error in Sales Filter List - report " + e);
    }
}
exports.Sales_SubscriptionList = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Sales Edit Load By Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                admin_sales.SalesEditLoad(logparams, req, function (listresult) {
                    if (listresult != null && listresult.length > 0) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sales_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    saleslist: listresult,
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sales_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objConstants.successresponsecode,
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
                        sales_json_result: {
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
        logger.error("Error in Sales Edit Load By Code - report " + e);
    }
}
exports.LoginActivityReportList = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Login Activity Report List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                admin_sales.LoginActivityList(logparams, req, function (listresult) {
                    if (listresult != null && listresult.length > 0) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                loginactivity_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    loginactivitylist: listresult,
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                loginactivity_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objConstants.successresponsecode,
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
                        loginactivity_json_result: {
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
        logger.error("Error in Sales Edit Load By Code - report " + e);
    }
}
exports.LoginActivityReportEditload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Login Activity Report List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                admin_sales.LoginActivityEditload(logparams, req, function (listresult) {
                    if (listresult != null && listresult.length > 0) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                loginactivity_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    loginactivitylist: listresult,
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                loginactivity_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objConstants.successresponsecode,
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
                        loginactivity_json_result: {
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
        logger.error("Error in Sales Edit Load By Code - report " + e);
    }
}

exports.Employeee_SubscriptionList = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Sales Edit Load By Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                admin_sales.EmpSubscriptionList(logparams, req, function (listresult) {
                    if (listresult != null && listresult.length > 0) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sales_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    saleslist: listresult,
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sales_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objConstants.successresponsecode,
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
                        sales_json_result: {
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
        logger.error("Error in Sales Edit Load By Code - report " + e);
    }
}