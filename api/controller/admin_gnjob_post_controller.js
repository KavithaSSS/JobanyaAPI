'use strict';
var get_gnjobpost_details = require('../process/admin_gnjob_post_process_controller');
var objSendNotification = require('../process/send_notification_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.insert_gnjobpost_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnjobpost Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                objUtilities.InsertLog(logparams, function (validlog) {
                    if (validlog != null && validlog != "") {
                        get_gnjobpost_details.getMaxcode(logparams, function (validcode) {
                            if (validcode != null && validcode != 0) {
                                // //console.log(validcode);
                                var maxcode = validcode;
                                var prefixcode = objConstants.prefixcode + maxcode;
                                // //console.log(prefixcode)
                                // get_gnjobpost_details.getprofixcode(logparams, maxcode, function (validprefix) {
                                //     var prefixcode = validprefix;
                                //     //console.log(prefixcode);
                                //     if (validprefix != null) {
                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                    var insertitems = {
                                        "gnjobcode": Number(maxcode),
                                        "gnjobid": prefixcode,
                                        "gnjob": req.body.gnjob,
                                        "link": req.body.link,
                                        "expirationdate": req.body.expirationdate,
                                        "noofvacancies":req.body.noofvacancies,
                                        "gnorganisationcode": req.body.gnorganisationcode,
                                        "statuscode": objConstants.pendingstatus,
                                        "createddate": currenttime,
                                        "updateddate": 0,
                                        "makerid": validlog
                                    };
                                    get_gnjobpost_details.Insertgnjobpost(logparams, insertitems, function (response) {
                                        if (response != null && response > 0) {
                                            const msgparam = { "messagecode": objConstants.createcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    gnjobpost_create_json_result: {
                                                        response: objConstants.successresponsecode,
                                                        varstatuscode: objConstants.createcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                        returnmaxcode: maxcode,
                                                        returnprefixcode: prefixcode
                                                    }
                                                });
    
                                            });
                                        }
                                        else {
                                            const msgparam = { "messagecode": objConstants.existcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    gnjobpost_create_json_result: {
                                                        response: objConstants.successresponsecode,
                                                        varstatuscode: objConstants.existcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                    }
                                                });
    
                                            });
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
                        gnjobpost_create_json_result: {
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
        { logger.error("Error in gnjobpost insert: " + e); }
    }
}
exports.gnjobpost_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'gnjobpost List Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_gnjobpost_details.getGnjobpostFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                gnjobpost_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    language_list: response.languagelist,
                                    govermenttype_list: response.govermentlist,
                                    state_list: response.statelist,
                                    gnorganisation_list: response.gnorganisationlist,
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                gnjobpost_json_result: {
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
                        gnjobpost_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in gnjobpost Load: " + e); }
}
exports.gnjob_list_by_code =async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnjobpost List by Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.gnjobcode != null) {
                    get_gnjobpost_details.Gnjobposteditload(logparams, req, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    gnjobpost_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        gnjobpost_list: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    gnjobpost_json_result: {
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
                            gnjobpost_json_result: {
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
                        gnjobpost_json_result: {
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
        logger.error("Error in gnjob List by Code: " + e);
    }
}
exports.gnjobpost_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnjobpost List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {
                    objUtilities.getPortalLanguageDetails(logparams, function (langresponse) {
                        if (langresponse != null) {
                            get_gnjobpost_details.Getgnjobpostlist(logparams, req, langresponse.length, function (response) {
                                // //console.log("entry")
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.gnOrganisationcount, function (validcount) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                gnjobpost_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    activecount: validcount[0],
                                                    inactivecount: validcount[1],
                                                    totcount: validcount[2],
                                                    total_language_count: langresponse.length,
                                                    gnjobpostfields: response
                                                }
                                            });

                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            gnjobpost_json_result: {
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
                                    gnjobpost_json_result: {
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
                            gnjobpost_json_result: {
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
                        gnjobpost_json_result: {
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
        logger.error("Error in gnjob List : " + e);
    }
}
exports.uploads_files = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnjobpost upload files', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.gnjobcode != null) {
                    get_gnjobpost_details.UpdateUploads(logparams, req, function (response) {
                        ////console.log(response);
                        if (response != null && response == true) {
                            const msgparam = { "messagecode": objConstants.updatecode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    gnjobpost_json_result: {
                                        varstatuscode: objConstants.updatecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.notvalidcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    gnjobpost_json_result: {
                                        varstatuscode: objConstants.notvalidcode,
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
                            gnjobpost_json_result: {
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
                        gnjobpost_json_result: {
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
        logger.error("Error in gnjob upload files : " + e);
    }
}
exports.delete_gnjobpost_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnjobpost Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var params = { "gnjobcode": Number(req.query.gnjobcode) };
                if (req.query.gnjobcode != null) {
                    get_gnjobpost_details.deletegnjobpost(logparams, params, function (response) {
                        if (response != null && response > 0) {
                            const msgparam = { "messagecode": objConstants.deletecode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    gnjobpost_json_result: {
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
                                    gnjobpost_json_result: {
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
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            gnjobpost_json_result: {
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
                        gnjobpost_json_result: {
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
        logger.error("Error in gnjobpost delete: " + e);
    }
}
exports.update_gnjobpost_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnjobpost Update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.gnjobcode != null) {
                    var params = { "gnjobcode": Number(req.query.gnjobcode) };
                    objUtilities.InsertLog(logparams, function (validlog) {
                        if (validlog != null && validlog != "") {
                            get_gnjobpost_details.GetGnjobSingleDetails(logparams, params, function (validrecord) {
                                if (validrecord != null && validrecord.length > 0) {
                                    var record = validrecord;
                                    var params = {};
                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                        if(Number(req.body.statuscode)==4){
                                            params = {
                                                gnjobcode: parseInt(req.query.gnjobcode),
                                                gnjobid: record[0].gnjobid,
                                                uploads: req.body.uploads,
                                                gnjob: req.body.gnjob,
                                                link: req.body.link,
                                                expirationdate: req.body.expirationdate,
                                                noofvacancies:req.body.noofvacancies,
                                                statuscode: parseInt(req.body.statuscode),
                                                gnorganisationcode: req.body.gnorganisationcode,
                                                updateddate: currenttime,
                                                makerid: validlog,
                                                createddate: record[0].createddate
                                            };
                                        }
                                        else{
                                            params = {
                                                gnjobcode: parseInt(req.query.gnjobcode),
                                                gnjobid: record[0].gnjobid,
                                                uploads: req.body.uploads,
                                                gnjob: req.body.gnjob,
                                                link: req.body.link,
                                                expirationdate: req.body.expirationdate,
                                                statuscode: parseInt(req.body.statuscode),
                                                gnorganisationcode: req.body.gnorganisationcode,
                                                updateddate: currenttime,
                                                makerid: record[0].makerid,
                                                createddate: record[0].createddate,
                                                remarks: req.body.remarks, 
                                                checkerid: validlog, 
                                                approveddate: currenttime
                                            };
                                        } 
                                        get_gnjobpost_details.updategnjobspost(logparams, req, params, function (response) {
                                            ////console.log(response);
                                            if (response != null && response == true) {
                                                if ((Number(req.body.statuscode) == 5)) {
                                                    const msgparam = { "messagecode": objConstants.gnjobapprovedcode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            gnjobpost_json_result: {
                                                                varstatuscode: objConstants.gnjobapprovedcode,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey,
                                                                response: objConstants.successresponsecode,
                                                            }
                                                        });
                                                    });
                                                    // var matchparams = { "gnjobcode": Number(req.query.gnjobcode) };
                                                    // get_gnjobpost_details.Getgnjobpostdetails(logparams, matchparams, function (gnjobrecord) {
                                                    //     // objSendNotification.SendGNJobPostNotification(gnjobrecord,req,function(result){
                                                    //     // });
                                                    // });
                                                    
                                                }
                                                else if ((Number(req.body.statuscode) == 9)) {
                                                    const msgparam = { "messagecode": objConstants.gnjobrejectedcode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            gnjobpost_json_result: {
                                                                varstatuscode: objConstants.gnjobrejectedcode,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey,
                                                                response: objConstants.successresponsecode,
                                                            }
                                                        });
                                                    });
                                                }
                                                else{
                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            gnjobpost_json_result: {
                                                                response: objConstants.successresponsecode,
                                                                varstatuscode: objConstants.updatecode,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey,
                                                            }
                                                        });
                                                    });
                                                }
                                            }
                                        })
                                    });                                    
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            gnjobpost_json_result: {
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
                            gnjobpost_json_result: {
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
                        gnjobpost_json_result: {
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
        logger.error("Error in gnjobpost update: " + e);
    }
}
exports.UpdateStatuscode = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnjobpost Update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var params = { "gnjobcode": Number(req.body.gnjobcode) };
                if (req.body.gnjobcode != null && req.body.statuscode != null) {
                    get_gnjobpost_details.GetGnjobSingleDetails(logparams, params, function (validrecord) {
                        if (validrecord != null && validrecord.length > 0) {
                            get_gnjobpost_details.UpdateStatuscodeInGnjobpost(logparams, req, function (updateresult) {
                                if (updateresult != 0 && updateresult > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            newsevent_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objConstants.successresponsecode,
                                            }
                                        });
                                    });
                                    
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            gnjobpost_json_result: {
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
                                    gnjobpost_json_result: {
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
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            gnjobpost_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: objConstants.successresponsecode,
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        gnjobpost_json_result: {
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
        logger.error("Error in Update Statuscode jobpost: " + e);
    }
}
