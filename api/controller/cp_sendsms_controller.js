'use strict';
var get_sendsms_details = require('../process/cp_sendsms_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.sendsms_formload = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'send sms List Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_sendsms_details.getFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sendsms_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    language_list: response.languagelist,
                                    smstype_list: response.smstypelist,
                                    smstemplate_list: response.smstypelist,
                                    recipientcriteria_list: response.criterialist,
                                    smscount:response.smscount,
                                    characterscount:response.characterscount,
                                    unicodecharacterscount:response.unicodecharacterscount
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                sendsms_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
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
                        sendsms_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in send sms Load: " + e); }
}
exports.insert_sendsms_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'sendsms Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                objUtilities.InsertLog(logparams, function (validlog) {
                    if (validlog != null && validlog != "") {
                        get_sendsms_details.getMaxcode(logparams, function (validcode) {
                            if (validcode != null && validcode != 0) {
                                // //console.log(validcode);
                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                    var maxcode = validcode;
                                    var insertitems = {
                                        "smscode": maxcode,
                                        "criteriacode": Number(req.body.criteriacode),
                                        "inactivedays": req.body.inactivedays,
                                        "smstypecode": req.body.smstypecode,
                                        "languagecode": req.body.languagecode,
                                        "templatecode": req.body.templatecode,
                                        "message": req.body.message,
                                        "recipients": req.body.recipients,
                                        "statuscode": req.body.statuscode,
                                        "singlesmscount": req.body.singlesmscount,
                                        "totalsmscount": req.body.totalsmscount,
                                        "createddate": currenttime,
                                        "updateddate": 0,
                                        "makerid": validlog
                                    };
                                    get_sendsms_details.Insertsendsms(logparams, insertitems, function (response) {
                                        if (response != null && response > 0) {
                                            if(Number(req.body.statuscode)==objConstants.pendingstatus){
                                                const msgparam = { "messagecode": objConstants.savedcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        sendsms_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.savedcode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });
        
                                                });
                                            }
                                            else{
                                                const msgparam = { "messagecode": objConstants.sendsmscode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        sendsms_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.sendsmscode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });
        
                                                });
                                            }
                                            
                                        }
                                        else {
                                            const msgparam = { "messagecode": objConstants.existcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    sendsms_json_result: {
                                                        response: objConstants.successresponsecode,
                                                        varstatuscode: objConstants.existcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                    }
                                                });
    
                                            });
                                        }
                                    })
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
                        sendsms_json_result: {
                            response: objConstants.successresponsecode,
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });

                });
            }
        });

    }
    catch (e) {
        { logger.error("Error in sendsms insert: " + e); }
    }
}
exports.sendsms_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'sendsms Before checking list', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (Number(req.query.criteriacode) == 1 && req.query.inactivedays != null) {
                    get_sendsms_details.FindAllEmployee(logparams, req, function (employeeresult) {
                        if (employeeresult != null && employeeresult.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objConstants.successresponsecode,
                                        sendsms_list: employeeresult

                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
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
                else if (Number(req.query.criteriacode) == 2 && req.query.inactivedays != null) {
                    get_sendsms_details.FindAllEmployer(logparams, function (employerresult) {
                        if (employerresult != null && employerresult.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objConstants.successresponsecode,
                                        sendsms_list: employerresult

                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
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
                else if (Number(req.query.criteriacode) == 3 && req.query.inactivedays != null) {
                    get_sendsms_details.FindEmployeeInactive(logparams, function (employeeresult) {
                        if (employeeresult != null && employeeresult.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objConstants.successresponsecode,
                                        sendsms_list: employeeresult

                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
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
                else if (Number(req.query.criteriacode) == 4 && req.query.inactivedays != null) {
                    get_sendsms_details.FindEmployerInactive(logparams, function (employerresult) {
                        if (employerresult != null && employerresult.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objConstants.successresponsecode,
                                        sendsms_list: employerresult

                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
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

            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        sendsms_json_result: {
                            response: objConstants.successresponsecode,
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });

                });
            }
        });
    }
    catch (e) {
        logger.error("Error in sendsms Before checking list: " + e);
    }
}
exports.update_sendsms_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Sendsms Update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.smscode != null) {
                    var params = { "smscode": Number(req.query.smscode) };
                    objUtilities.InsertLog(logparams, function (validlog) {
                        if (validlog != null && validlog != "") {
                            get_sendsms_details.GetSendsmsSingleDetails(logparams, params, function (validrecord) {
                                if (validrecord != null && validrecord.length > 0) {
                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                        var record = validrecord;
                                        var insertitems = {
                                            "smscode": Number(req.body.smscode),
                                            "criteriacode": Number(req.body.criteriacode),
                                            "inactivedays": req.body.inactivedays,
                                            "smstypecode": req.body.smstypecode,
                                            "languagecode": req.body.languagecode,
                                            "message": req.body.message,
                                            "templatecode": req.body.templatecode,
                                            "recipients": req.body.recipients,
                                            "statuscode": req.body.statuscode,
                                            "singlesmscount": req.body.singlesmscount,
                                            "totalsmscount": req.body.totalsmscount,
                                            "createddate": record[0].createddate,
                                            "updateddate": currenttime,
                                            "makerid": validlog
                                        };
                                        get_sendsms_details.updateSendsms(logparams, req, insertitems, function (response) {
                                            if (response != null && response > 0) {
                                                if(Number(req.body.statuscode)==objConstants.pendingstatus){
                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            sendsms_json_result: {
                                                                response: objConstants.successresponsecode,
                                                                varstatuscode: objConstants.updatecode,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey,
                                                            }
                                                        });
                                                    });
                                                }
                                                else{
                                                    const msgparam = { "messagecode": objConstants.sendsmscode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            sendsms_json_result: {
                                                                response: objConstants.successresponsecode,
                                                                varstatuscode: objConstants.sendsmscode,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey,
                                                            }
                                                        });
            
                                                    });
                                                }
                                            }
                                        });
                                    });
                                    
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            sendsms_json_result: {
                                                response: objConstants.successresponsecode,
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });
                                    });
                                }
                            })
                        }
                    });

                }
                else {
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            sendsms_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        sendsms_json_result: {
                            response: objConstants.successresponsecode,
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });

                });
            }
        });
    }
    catch (e) {
        logger.error("Error in sendsms update: " + e);
    }
}
exports.sendsms_list_by_code = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Sendsms List by Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.smscode != null) {
                    get_sendsms_details.SendSmseditload(logparams, req, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        sendsms_list: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
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
                            sendsms_json_result: {
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        sendsms_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in sendsms List by Code: " + e);
    }
}
exports.sendsms_totallist = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Sendsms List ', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {
                    get_sendsms_details.Sendsmstotallist(logparams, req, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        sendsms_list: response
                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    sendsms_json_result: {
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
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
                            sendsms_json_result: {
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        sendsms_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in sendsms List : " + e);
    }
}