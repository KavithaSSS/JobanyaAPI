'use strict';
var get_state_details = require('../process/cp_state_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
//const {objConstants.notvalidcode, objConstants.alreadyinusecode, objConstants.createcode,objConstants.listcode, objConstants.existcode,objConstants.updatecode,objConstants.deletecode, objConstants.recordnotfoundcode, objConstants.successresponsecode,objConstants.usernotfoundcode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.insert_state_details = async function (req, res) {
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
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'State Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    get_state_details.checkStateNameExists(logparams, req, function (rescode) {
                        ////console.log(rescode);
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_state_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        var varMaxCode = resp;
                                        const params = { statecode: parseInt(varMaxCode), state: req.body.state, statuscode: 1, createddate: milliseconds, updateddate: 0 };
                                        get_state_details.InsertStateDetails(logparams, params, function (response) {
                                            if (response != null && response > 0) {
                                                const msgparam = { "messagecode": objConstants.createcode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        state_insert_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.createcode,
                                                            responsestring: msgtext
                                                        }
                                                    });

                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        state_insert_json_result: {
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
                                const msgparam = { "messagecode": objConstants.existcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        state_insert_json_result: {
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
                            state_insert_json_result: {
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
                        state_insert_json_result: {
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
        logger.error("Error in State Save: " + e);
    }
}
exports.update_state_details = async function (req, res) {
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
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'state update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statecode != null) {
                    if (req.body.statuscode != null && req.body.statuscode == objConstants.inactivestatus) {
                        get_state_details.checkStateCodeExistsInOthers(logparams, req, function (existsresponse) {
                            if (existsresponse != null && existsresponse == 0) {
                                get_state_details.checkStateNameExistsByCode(logparams, req, function (resp) {
                                    if (resp != null) {
                                        var existscount = resp;
                                        if (existscount == 0) {
                                            get_state_details.checkStateCodeExists(logparams, req, function (respo) {
                                                if (respo != null) {
                                                    var designationcodeexistscount = respo;
                                                    if (designationcodeexistscount > 0) {
                                                        get_state_details.getStateSingleRecordDetails(logparams, req, function (respon) {
                                                            if (respon != null) {
                                                                const listdesignationdetails = respon;
                                                                if (listdesignationdetails != null) {
                                                                    const params = { statecode: parseInt(req.query.statecode), state: req.body.state, statuscode: parseInt(req.body.statuscode), updateddate: milliseconds, makerid: listdesignationdetails[0].makerid, createddate: listdesignationdetails[0].createddate };
                                                                    get_state_details.updateStateDetails(logparams, params, function (response) {
                                                                        if (response == true) {
                                                                            const msgparam = { "messagecode": objConstants.updatecode };
                                                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                return res.status(200).json({
                                                                                    state_update_json_result: {
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
                                                                                    state_update_json_result: {
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
                                                                            state_update_json_result: {
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
                                                                state_update_json_result: {
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
                                                    state_update_json_result: {
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
                                        state_update_json_result: {
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
                        get_state_details.checkStateNameExistsByCode(logparams, req, function (resp) {
                            if (resp != null) {
                                var existscount = resp;
                                if (existscount == 0) {
                                    get_state_details.checkStateCodeExists(logparams, req, function (respo) {
                                        if (respo != null) {
                                            var designationcodeexistscount = respo;
                                            if (designationcodeexistscount > 0) {
                                                get_state_details.getStateSingleRecordDetails(logparams, req, function (respon) {
                                                    if (respon != null) {
                                                        const listdesignationdetails = respon;
                                                        if (listdesignationdetails != null) {
                                                            const params = { statecode: parseInt(req.query.statecode), state: req.body.state, statuscode: parseInt(req.body.statuscode), updateddate: milliseconds, makerid: listdesignationdetails[0].makerid, createddate: listdesignationdetails[0].createddate };
                                                            get_state_details.updateStateDetails(logparams, params, function (response) {
                                                                if (response == true) {
                                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                        return res.status(200).json({
                                                                            state_update_json_result: {
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
                                                                            state_update_json_result: {
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
                                                                    state_update_json_result: {
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
                                                        state_update_json_result: {
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
                                            state_update_json_result: {
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
                            state_update_json_result: {
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
                        state_update_json_result: {
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
        logger.error("Error in State Update: " + e);
    }
}
exports.delete_state_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'State Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statecode != null) {
                    var varstatecode = req.query.statecode;
                    if (Number(req.query.statecode) != objConstants.defaultstatecode) {
                        get_state_details.checkStateCodeExists(logparams, req, function (resp) {
                            if (resp != null) {
                                var existscount = resp;
                                if (existscount > 0) {
                                    const params = { statecode: varstatecode };
                                    get_state_details.checkStateCodeExistsInOthers(logparams, req, function (existsresponse) {
                                        if (existsresponse != null) {
                                            if (existsresponse == 0) {
                                                get_state_details.deleteStateDetails(logparams, params, function (response) {
                                                    if (response != null && response > 0) {
                                                        const msgparam = { "messagecode": objConstants.deletecode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                state_delete_json_result: {
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
                                                                state_delete_json_result: {
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
                                                        state_delete_json_result: {
                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                        else {
                                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                return res.status(200).json({
                                                    state_delete_json_result: {
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
                                            state_delete_json_result: {
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
                        const msgparam = { "messagecode": objConstants.statecode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                state_delete_json_result: {
                                    varstatuscode: objConstants.statecode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgtext
                                }
                            });
                        });
                    }

                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            state_delete_json_result: {
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
                        state_delete_json_result: {
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
        logger.error("Error in State Delete: " + e);
    }
}
exports.state_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'State List by Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statecode != null) {
                    const params = { statecode: parseInt(req.query.statecode) };
                    get_state_details.getStateSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    state_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        statelist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    state_list_json_result: {
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
                            state_list_json_result: {
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
                        state_list_json_result: {
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
        logger.error("Error in State List by Code: " + e);
    }
}
exports.state_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'State Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_state_details.getStateFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                state_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    languagelist: response
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                state_json_result: {
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
                        state_json_result: {
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
        logger.error("Error in State Load: " + e);
    }
}
exports.state_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'State List', logdate: new Date(), type: 'Employee' }
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
                            get_state_details.getStateList(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.statecount, function (respon) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                state_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    tot_language_count: langresponse.length,
                                                    stateselfields: response,
                                                    languageslist:langresponse
                                                }
                                            });

                                        });
                                    }
                                    );
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                        return res.status(200).json({
                                            state_list_json_result: {
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
                                    state_list_json_result: {
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
                            state_list_json_result: {
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
                        state_list_json_result: {
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
        logger.error("Error in State List: " + e);
    }
}