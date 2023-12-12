'use strict';
var get_smstemplate_details = require('../process/cp_sms_template_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.insert_smstemplate_details = async function (req, res) {
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
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'smstemplate Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    var params = { $regex: "^" + req.body.templatename + "$", $options: 'i' };
                    get_smstemplate_details.duplicatechecknames(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            objUtilities.InsertLog(logparams, function (validlog) {
                                if (validlog != null) {
                                    get_smstemplate_details.getMaxcode(logparams, function (validcode) {
                                        if (validcode != null) {
                                            var insertitem = {
                                                "templatecode": validcode,
                                                "smstypecode": req.body.smstypecode,
                                                "templatename": req.body.templatename,
                                                "languagecode": req.body.languagecode,
                                                "message": req.body.message,
                                                "smscount": req.body.smscount,
                                                "statuscode": 1,
                                                "createddate": milliseconds,
                                                "updateddate": 0,
                                                "makerid": validlog
                                            }
                                            get_smstemplate_details.Insertsmstemplate(logparams, insertitem, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.createcode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            Smstemplate_json_result: {
                                                                response: objConstants.successresponsecode,
                                                                varstatuscode: objConstants.createcode,
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
                                                            Smstemplate_json_result: {
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
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.existcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    Smstemplate_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.existcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });

                            });
                        }
                    })

                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            Smstemplate_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.notvalidcode,
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
                        Smstemplate_json_result: {
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
        logger.error("Error in smstemplate insert: " + e);
    }
}
exports.update_smstemplate_details = async function (req, res) {
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
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'smstemplate update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.templatecode != null) {
                    if (req.body.statuscode != null && Number(req.body.statuscode == objConstants.inactivestatus)) {
                        var params = { "templatecode": Number(req.query.templatecode) };
                        get_smstemplate_details.checkTemplatecodeExistsInSendSms(logparams, params, function (templateresult) {
                            if (templateresult != null && templateresult == 0) {
                                //var params ={ $regex: "^" + req.body.templatename + "$", $options: 'i' };
                                var params = { "templatename": { $regex: "^" + req.body.templatename + "$", $options: 'i' }, "templatecode": { $ne: Number(req.query.templatecode) } };
                                // //console.log("entry")
                                get_smstemplate_details.duplicatecheck(logparams, params, function (response) {
                                    if (response != null && response.length > 0) {
                                        objUtilities.InsertLog(logparams, function (validlog) {
                                            if (validlog != null && validlog != "") {
                                                // //console.log("entry")
                                                var params = { "templatecode": Number(req.query.templatecode) };
                                                get_smstemplate_details.GetSmstemplateSingleDetails(logparams, params, function (validcode) {
                                                    // //console.log(params);
                                                    if (validcode != null && validlog.length > 0) {
                                                        var record = validcode;
                                                        var updateitem = {
                                                            "templatecode": Number(req.query.templatecode),
                                                            "smstypecode": req.body.smstypecode,
                                                            "languagecode": req.body.languagecode,
                                                            "templatename": req.body.templatename,
                                                            "message": req.body.message,
                                                            "statuscode": Number(req.body.statuscode),
                                                            "createddate": record[0].createddate,
                                                            "updateddate": milliseconds,
                                                            "makerid": validlog,
                                                            "smscount": req.body.smscount
                                                        }
                                                        // //console.log(updateitem);
                                                        get_smstemplate_details.Updatesmstemplate(logparams, updateitem, req, function (response) {
                                                            if (response != null && response > 0) {
                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        Smstemplate_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.updatecode,
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
                                                                        Smstemplate_json_result: {
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
                                                    else {
                                                        const msgparam = { "messagecode": objConstants.existcode };
                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                            return res.status(200).json({
                                                                Smstemplate_json_result: {
                                                                    response: objConstants.successresponsecode,
                                                                    varstatuscode: objConstants.existcode,
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
                                    else {
                                        const msgparam = { "messagecode": objConstants.existcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                Smstemplate_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.existcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                }
                                            });

                                        });
                                    }
                                })
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.alreadyinuseupdatecode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        Smstemplate_json_result: {
                                            response: objConstants.alreadyinuseupdatecode,
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
                        var params = { "templatecode": Number(req.query.templatecode) };
                        // //console.log(params);
                        ////console.log(templateresult);
                        var params = { "templatename": { $regex: "^" + req.body.templatename + "$", $options: 'i' }, "templatecode": { $ne: Number(req.query.templatecode) } };
                        get_smstemplate_details.duplicatecheck(logparams, params, function (response) {
                            if (response != null && response.length > 0) {
                                objUtilities.InsertLog(logparams, function (validlog) {
                                    if (validlog != null && validlog != "") {
                                        // //console.log("entry")
                                        var params = { "templatecode": Number(req.query.templatecode) };
                                        get_smstemplate_details.GetSmstemplateSingleDetails(logparams, params, function (validcode) {
                                            // //console.log(params);
                                            if (validcode != null && validlog.length > 0) {
                                                var record = validcode;
                                                var updateitem = {
                                                    "templatecode": Number(req.query.templatecode),
                                                    "smstypecode": req.body.smstypecode,
                                                    "languagecode": req.body.languagecode,
                                                    "templatename": req.body.templatename,
                                                    "message": req.body.message,
                                                    "statuscode": Number(req.body.statuscode),
                                                    "createddate": record[0].createddate,
                                                    "updateddate": milliseconds,
                                                    "makerid": validlog,
                                                    "smscount": req.body.smscount
                                                }
                                                // //console.log(updateitem);
                                                get_smstemplate_details.Updatesmstemplate(logparams, updateitem, req, function (response) {
                                                    if (response != null && response > 0) {
                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                            return res.status(200).json({
                                                                Smstemplate_json_result: {
                                                                    response: objConstants.successresponsecode,
                                                                    varstatuscode: objConstants.updatecode,
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
                                                                Smstemplate_json_result: {
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
                                            else {
                                                const msgparam = { "messagecode": objConstants.existcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        Smstemplate_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.existcode,
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
                            else {
                                const msgparam = { "messagecode": objConstants.existcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        Smstemplate_json_result: {
                                            response: objConstants.successresponsecode,
                                            varstatuscode: objConstants.existcode,
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
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            Smstemplate_json_result: {
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
                        Smstemplate_json_result: {
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
        logger.error("Error in smstemplate update: " + e);
    }
}
exports.delete_smstemplate_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'smstemplate delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.templatecode != null) {
                    var params = { "templatecode": Number(req.query.templatecode) };
                    get_smstemplate_details.checkTemplatecodeExistsInSendSms(logparams, params, function (templateresult) {
                        ////console.log(templateresult);
                        if (templateresult == null || templateresult == 0) {
                            get_smstemplate_details.Deletesmstemplate(logparams, params, function (response) {
                                if (response != null && response > 0) {
                                    const msgparam = { "messagecode": objConstants.deletecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            Smstemplate_json_result: {
                                                response: objConstants.successresponsecode,
                                                varstatuscode: objConstants.deletecode,
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
                                            Smstemplate_json_result: {
                                                response: objConstants.successresponsecode,
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
                            const msgparam = { "messagecode": objConstants.alreadyinusecode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    Smstemplate_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.alreadyinusecode,
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
                            Smstemplate_json_result: {
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
                        Smstemplate_json_result: {
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
        logger.error("Error in smstemplate delete: " + e);
    }
}
exports.smstemplate_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Sms template List by Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.templatecode != null) {
                    get_smstemplate_details.smstemplateeditload(logparams, req, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    smstemplate_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        smstemplate_list: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    smstemplate_json_result: {
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
                            smstemplate_json_result: {
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
                        smstemplate_json_result: {
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
        logger.error("Error in sms template List by Code: " + e);
    }
}
exports.smstemplate_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'smstemplate List Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_smstemplate_details.getFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                smstemplate_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    language_list: response.languagelist,
                                    smstype_list: response.smstypelist,
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                smstemplate_json_result: {
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
                        smstemplate_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in smstemplate Load: " + e); }
}
exports.smstemplate_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'smstemplate List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {
                    var params = { "statuscode": Number(req.query.statuscode) };
                    ////console.log(params);
                    get_smstemplate_details.smstemplatelist(logparams, params, function (response) {
                        // //console.log(response)
                        if (response != null && response.length > 0) {
                            objUtilities.findCount(objConstants.SmsTemplateCount, function (validcount) {
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        smstemplate_json_result: {
                                            response: objConstants.successresponsecode,
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            activecount: validcount[0],
                                            inactivecount: validcount[1],
                                            totcount: validcount[2],
                                            smstemplate_list: response
                                        }
                                    });

                                });
                            });

                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    smstemplate_json_result: {
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
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            smstemplate_json_result: {
                                varstatuscode: objConstants.notvalidcode,
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
                        smstemplate_json_result: {
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
        logger.error("Error in smstemplate list: " + e);
    }
}