'use strict';
var get_gnorg_details = require('../process/cp_govtorganization_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
//const {notvalidcode,objConstants.objConstants.objConstants.createcode,objConstants.objConstants.listcode, objConstants.existcode,objConstants.updatecode,deletecode, recordnotfoundcode, objConstants.successresponsecode,objConstants.usernotfoundcode } = require('../../config/constants');
const objConstants = require('../../config/constants');
exports.gnorg_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'gnorganisation Form load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_gnorg_details.getgnorganisationFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                gnOrganisation_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    languagelist: response[0],
                                    statelist: response[1],
                                    govttype: response[2]
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                gnOrganisation_json_result: {
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
                        gnOrganisation_json_result: {
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
        logger.error("Error in Gnorganisation formload: " + e);
    }
}
exports.insert_gnorg_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'gnorganisation Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    get_gnorg_details.checkgnorganisationNameExists(logparams, req, function (rescode) {
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_gnorg_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                            var varMaxCode = resp;
                                            const params = { gnorganisationcode: parseInt(varMaxCode), gnorganisation: req.body.gnorganisation, logourl: req.body.logourl, governmenttypecode: parseInt(req.body.governmenttypecode), statecode: parseInt(req.body.statecode), statuscode: 1, createddate: currenttime, updateddate: 0 };
                                            get_gnorg_details.InsertgnorganisationDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.createcode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            gnOrganisation_insert_json_result: {
                                                                response: objConstants.successresponsecode,
                                                                varstatuscode: objConstants.createcode,
                                                                responsestring: msgtext,
                                                                returncode: varMaxCode
                                                            }
                                                        });

                                                    });
                                                }
                                                else {
                                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            gnOrganisation_insert_json_result: {
                                                                varstatuscode: objConstants.recordnotfoundcode,
                                                                response: objConstants.successresponsecode,
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
                                const msgparam = { "messagecode": objConstants.existcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        gnOrganisation_insert_json_result: {
                                            varstatuscode: objConstants.existcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            gnOrganisation_insert_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        gnOrganisation_insert_json_result: {
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
        logger.error("Error in Gnorganisation Insert: " + e);
    }
}
exports.update_gnorg_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'gnorganisation update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.gnorganisationcode != null) {
                    if (req.body.statuscode != null && req.body.statuscode == objConstants.inactivestatus) {
                        const params = { gnorganisationcode: req.query.gnorganisationcode };
                        get_gnorg_details.checkGnorganisationExistsInGnpost(logparams, params, function (gnorganisationresult) {
                            if (gnorganisationresult == null || gnorganisationresult == 0) {
                                get_gnorg_details.checkgnorganisationNameExistsByCode(logparams, req, function (resp) {
                                    if (resp != null) {
                                        var existscount = resp;
                                        if (existscount == 0) {
                                            get_gnorg_details.checkgnorganisationCodeExists(logparams, req, function (respo) {
                                                if (respo != null) {
                                                    var codeexistscount = respo;
                                                    if (codeexistscount > 0) {
                                                        get_gnorg_details.getgnorganisationSingleRecordDetails(logparams, req, function (respon) {
                                                            if (respon != null) {
                                                                const listdetails = respon;
                                                                if (listdetails != null) {
                                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                        const params = { gnorganisationcode: parseInt(req.query.gnorganisationcode), gnorganisation: req.body.gnorganisation, logourl: req.body.logourl, governmenttypecode: parseInt(req.body.governmenttypecode), statecode: parseInt(req.body.statecode), statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                        get_gnorg_details.updategnorganisationDetails(logparams, params, function (response) {
                                                                            if (response == true) {
                                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                    return res.status(200).json({
                                                                                        gnOrganisation_update_json_result: {
                                                                                            response: objConstants.successresponsecode,
                                                                                            varstatuscode: objConstants.updatecode,
                                                                                            responsestring: msgtext
                                                                                        }
                                                                                    });
                                                                                });
                                                                            }
                                                                            else {
                                                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                    return res.status(200).json({
                                                                                        gnOrganisation_update_json_result: {
                                                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                                                            response: objConstants.successresponsecode,
                                                                                            responsestring: msgtext
                                                                                        }
                                                                                    });
                                                                                });
                                                                            }
                                                                        });
                                                                    });
                                                                    
                                                                }
                                                                else {
                                                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                        return res.status(200).json({
                                                                            gnOrganisation_update_json_result: {
                                                                                varstatuscode: objConstants.recordnotfoundcode,
                                                                                response: objConstants.successresponsecode,
                                                                                responsestring: msgtext
                                                                            }
                                                                        });
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                gnOrganisation_update_json_result: {
                                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                                    response: objConstants.successresponsecode,
                                                                    responsestring: msgtext
                                                                }
                                                            });
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            const msgparam = { "messagecode": objConstants.existcode };
                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                return res.status(200).json({
                                                    gnOrganisation_update_json_result: {
                                                        varstatuscode: objConstants.existcode,
                                                        response: objConstants.successresponsecode,
                                                        responsestring: msgtext
                                                    }
                                                });
                                            });
                                        }
                                    }
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.alreadyinuseupdatecode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        gnOrganisation_update_json_result: {
                                            varstatuscode: objConstants.alreadyinuseupdatecode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else {
                        get_gnorg_details.checkgnorganisationNameExistsByCode(logparams, req, function (resp) {
                            if (resp != null) {
                                var existscount = resp;
                                if (existscount == 0) {
                                    get_gnorg_details.checkgnorganisationCodeExists(logparams, req, function (respo) {
                                        if (respo != null) {
                                            var codeexistscount = respo;
                                            if (codeexistscount > 0) {
                                                get_gnorg_details.getgnorganisationSingleRecordDetails(logparams, req, function (respon) {
                                                    if (respon != null) {
                                                        const listdetails = respon;
                                                        if (listdetails != null) {
                                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                const params = { gnorganisationcode: parseInt(req.query.gnorganisationcode), gnorganisation: req.body.gnorganisation, logourl: req.body.logourl, governmenttypecode: parseInt(req.body.governmenttypecode), statecode: parseInt(req.body.statecode), statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                get_gnorg_details.updategnorganisationDetails(logparams, params, function (response) {
                                                                    if (response == true) {
                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                            return res.status(200).json({
                                                                                gnOrganisation_update_json_result: {
                                                                                    response: objConstants.successresponsecode,
                                                                                    varstatuscode: objConstants.updatecode,
                                                                                    responsestring: msgtext
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                    else {
                                                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                            return res.status(200).json({
                                                                                gnOrganisation_update_json_result: {
                                                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                                                    response: objConstants.successresponsecode,
                                                                                    responsestring: msgtext
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                            
                                                        }
                                                        else {
                                                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                return res.status(200).json({
                                                                    gnOrganisation_update_json_result: {
                                                                        varstatuscode: objConstants.recordnotfoundcode,
                                                                        response: objConstants.successresponsecode,
                                                                        responsestring: msgtext
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        gnOrganisation_update_json_result: {
                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.existcode };
                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                        return res.status(200).json({
                                            gnOrganisation_update_json_result: {
                                                varstatuscode: objConstants.existcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgtext
                                            }
                                        });
                                    });
                                }
                            }
                        });
                    }

                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            gnOrganisation_update_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        gnOrganisation_update_json_result: {
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
        logger.error("Error in Gnorganisation Update: " + e);
    }
}
exports.delete_gnorganisation_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnorganisation Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.gnorganisationcode != null) {

                    get_gnorg_details.checkgnorganisationCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { gnorganisationcode: req.query.gnorganisationcode };
                                get_gnorg_details.checkGnorganisationExistsInGnpost(logparams, params, function (gnorganisationresult) {
                                    // //console.log(gnorganisationresult);
                                    if (gnorganisationresult == null || gnorganisationresult == 0) {
                                        get_gnorg_details.deletegnorganisationDetails(logparams, params, function (response) {
                                            if (response != null && response > 0) {
                                                const msgparam = { "messagecode": objConstants.deletecode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        gnOrganisation_delete_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.deletecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        gnOrganisation_delete_json_result: {
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
                                        const msgparam = { "messagecode": objConstants.alreadyinusecode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                gnOrganisation_delete_json_result: {
                                                    varstatuscode: objConstants.alreadyinusecode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgtext
                                                }
                                            });
                                        });
                                    }
                                });

                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        gnOrganisation_delete_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            gnOrganisation_delete_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        gnOrganisation_delete_json_result: {
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
        logger.error("Error in Gnorganisation Delete: " + e);
    }
}
exports.gnorganisation_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnorganisation List by code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.gnorganisationcode != null) {
                    const params = { gnorganisationcode: parseInt(req.query.gnorganisationcode) };
                    get_gnorg_details.getgnorganisationSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    gnOrganisation_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        gnOrganisationList: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    gnOrganisation_list_json_result: {
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
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            gnOrganisation_list_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        gnOrganisation_list_json_result: {
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
        logger.error("Error in Gnorganisation Edit Load: " + e);
    }
}
exports.gnorganisation_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Gnorganisation List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {
                    var languagecode;
                    if (req.query.languagecode != null) {
                        languagecode=req.query.languagecode;
                    }
                    else{
                        languagecode=objConstants.defaultlanguagecode;
                    }
                    const params = { statuscode: req.query.statuscode,languagecode: languagecode };
                    objUtilities.getPortalLanguageDetails(logparams, function (langresponse) {
                        if (langresponse != null) {
                            get_gnorg_details.getgnorganisationList(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.gnOrganisationcount, function (respon) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                gnOrganisation_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    total_language_count: langresponse.length,
                                                    gnOrganisationselfields: response,
                                                    languageslist:langresponse
                                                }
                                            });

                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                        return res.status(200).json({
                                            gnOrganisation_list_json_result: {
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
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    gnOrganisation_list_json_result: {
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
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            gnOrganisation_list_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }

            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        gnOrganisation_list_json_result: {
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
        logger.error("Error in Gnorganisation List: " + e);
    }
}
exports.update_imageurl = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job Function Image URL update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.gnorganisationcode != null && req.body.logourl != null) {
                    get_gnorg_details.checkgnorganisationCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var codeexistscount = resp;
                            if (codeexistscount > 0) {
                                get_gnorg_details.UpdateLogourl(logparams, req, function (validurl) {
                                    if (validurl != null && validurl > 0) {
                                      const msgparam = { "messagecode": objConstants.updatecode };
                                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                          gnorganisation_json_result: {
                                            response: objConstants.successresponsecode,
                                            varstatuscode: objConstants.updatecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
                                          }
                                        });
                                      });
                                    }
                                  });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        gnorganisation_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            gnorganisation_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        gnorganisation_json_result: {
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
        logger.error("Error in GN Organisation Update Logo URL: " + e);
    }
}