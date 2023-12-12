'use strict';
var get_taluk_details = require('../process/cp_taluka_process_controller');
const objUtilities = require('./utilities');  
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.taluk_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'taluk Form Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_taluk_details.getTalukFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                taluk_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    languagelist: response[0],
                                    statelist: response[1],
                                    districtlist: response[2]
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                taluk_json_result: {
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
                        taluk_json_result: {
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
        logger.error("Error in taluk Load: " + e);
    }
}
exports.insert_taluk_details = async function (req, res) {
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
               
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Taluk details Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) { 
                    get_taluk_details.checkTalukNameExists(logparams, req, function (rescode) {  
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_taluk_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        var varMaxCode = resp;
                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                            const params = { talukcode: parseInt(varMaxCode), districtcode: parseInt(req.body.districtcode), taluk: req.body.taluk, statuscode: 1, createddate: currenttime, updateddate: 0 };
                                            
                                            get_taluk_details.InsertTalukDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.createcode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            taluk_insert_json_result: {
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
                                                            taluk_insert_json_result: {
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
                                        taluk_insert_json_result: {
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
                            taluk_insert_json_result: {
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
                        taluk_insert_json_result: {
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
        logger.error("Error in taluk Save: " + e);
    }
}
exports.update_taluk_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'taluk details update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    if (req.query.talukcode != null) {
                        if (req.body.statuscode != null && req.body.statuscode == objConstants.inactivestatus) {
                            const params = { talukcode: req.query.talukcode };
                            get_taluk_details.checkTalukCodeExistsInEmployer(logparams, params, function (employerresult) {
                                ////console.log(employerresult);
                                get_taluk_details.checkTalukCodeExistsInEmployee(logparams, params, function (employeeresult) {
                                    ////console.log(employerresult);
                                    if ((employerresult == null || employerresult == 0) && (employeeresult == null || employeeresult == 0)) {
                                        get_taluk_details.checkDistrictCodeExistsInTaluk(logparams, params, function (result) {
                                            if (result[0].districtcode == req.body.districtcode) {
                                                get_taluk_details.checkTalukNameExistsByCode(logparams, req, function (resp) {
                                                    if (resp != null) {
                                                        var existscount = resp;
                                                        if (existscount == 0) {
                                                            get_taluk_details.checkTalukCodeExists(logparams, req, function (respo) {
                                                                if (respo != null) {
                                                                    var codeexistscount = respo;
                                                                    if (codeexistscount > 0) {
                                                                        get_taluk_details.getTalukSingleRecordDetails(logparams, req, function (respon) {
                                                                            if (respon != null) {
                                                                                const listdetails = respon;
                                                                                if (listdetails != null) {
                                                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                                        const params = { talukcode: parseInt(req.query.talukcode), districtcode: parseInt(req.body.districtcode), taluk: req.body.taluk, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                                        get_taluk_details.updateTalukDetails(logparams, params, function (response) {
                                                                                            if (response != null && response > 0) {
                                                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                                    return res.status(200).json({
                                                                                                        taluk_update_json_result: {
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
                                                                                                        taluk_update_json_result: {
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
                                                                                            taluk_update_json_result: {
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
                                                                                taluk_update_json_result: {
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
                                                                    taluk_update_json_result: {
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
                                                        taluk_update_json_result: {
                                                            varstatuscode: objConstants.alreadyinuseupdatecode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                        })

                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.alreadyinuseupdatecode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                taluk_update_json_result: {
                                                    varstatuscode: objConstants.alreadyinuseupdatecode,
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
                            const params = { talukcode: req.query.talukcode };
                            get_taluk_details.checkTalukNameExistsByCode(logparams, req, function (resp) {
                                if (resp != null) {
                                    var existscount = resp;
                                    if (existscount == 0) {
                                        get_taluk_details.checkTalukCodeExists(logparams, req, function (respo) {
                                            if (respo != null) {
                                                var codeexistscount = respo;
                                                if (codeexistscount > 0) {
                                                    get_taluk_details.getTalukSingleRecordDetails(logparams, req, function (respon) {
                                                        if (respon != null) {
                                                            const listdetails = respon;
                                                            if (listdetails != null) {
                                                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                    const params = { talukcode: parseInt(req.query.talukcode), statecode: parseInt(req.body.statecode), districtcode: parseInt(req.body.districtcode), taluk: req.body.taluk, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                    get_taluk_details.updateTalukDetails(logparams, params, function (response) {
                                                                        if (response != null && response > 0) {
                                                                            const msgparam = { "messagecode": objConstants.updatecode };
                                                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                return res.status(200).json({
                                                                                    taluk_update_json_result: {
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
                                                                                    taluk_update_json_result: {
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
                                                                        taluk_update_json_result: {
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
                                                            taluk_update_json_result: {
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
                                                taluk_update_json_result: {
                                                    varstatuscode: objConstants.existcode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgtext
                                                }
                                            });
                                        });
                                    }
                                }
                            });
                            /*get_taluk_details.checktalukCodeExistsInEmployer(logparams, params, function (employerresult) {
                                // //console.log(employerresult);
                                get_taluk_details.checktalukCodeExistsInEmployee(logparams, params, function (employeeresult) {
                                    ////console.log(employeeresult);
                                    if ((employerresult == null || employerresult == 0) && (employeeresult == null || employeeresult == 0)) {
                                        
                                    }
                                    else {
                                        get_taluk_details.checkDistrictCodeExistsIntaluk(logparams, params, function (result) {
                                            ////console.log(result[0].districtcode);
                                            if (result[0].districtcode == req.body.districtcode) {
                                                get_taluk_details.checktalukNameExistsByCode(logparams, req, function (resp) {
                                                    if (resp != null) {
                                                        var existscount = resp;
                                                        if (existscount == 0) {
                                                            get_taluk_details.checktalukCodeExists(logparams, req, function (respo) {
                                                                if (respo != null) {
                                                                    var codeexistscount = respo;
                                                                    if (codeexistscount > 0) {
                                                                        get_taluk_details.gettalukSingleRecordDetails(logparams, req, function (respon) {
                                                                            if (respon != null) {
                                                                                const listdetails = respon;
                                                                                if (listdetails != null) {
                                                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                                        const params = { talukcode: parseInt(req.query.talukcode), districtcode: parseInt(req.body.districtcode), taluk: req.body.taluk, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                                        get_taluk_details.updatetalukDetails(logparams, params, function (response) {
                                                                                            if (response != null && response > 0) {
                                                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                                    return res.status(200).json({
                                                                                                        taluk_update_json_result: {
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
                                                                                                        taluk_update_json_result: {
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
                                                                                            taluk_update_json_result: {
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
                                                                                taluk_update_json_result: {
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
                                                                    taluk_update_json_result: {
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
                                                        taluk_update_json_result: {
                                                            varstatuscode: objConstants.alreadyinuseupdatecode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });
                            });
*/
                        }

                    }
                    else {
                        const msgparam = { "messagecode": objConstants.notvalidcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                taluk_update_json_result: {
                                    varstatuscode: objConstants.notvalidcode,
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
                            taluk_update_json_result: {
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
                        taluk_update_json_result: {
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
        logger.error("Error in taluk Update: " + e);
    }
}
exports.delete_taluk_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'taluk details Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.talukcode != null) {
                    get_taluk_details.checkTalukCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { talukcode: req.query.talukcode };
                                get_taluk_details.checkTalukCodeExistsInEmployer(logparams, params, function (employerresult) {
                                    // //console.log(employerresult);
                                    get_taluk_details.checkTalukCodeExistsInEmployee(logparams, params, function (employeeresult) {
                                        // //console.log(employeeresult);
                                        if ((employerresult == null || employerresult == 0) && (employeeresult == null || employeeresult == 0)) {
                                            get_taluk_details.deleteTalukDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.deletecode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            taluk_delete_json_result: {
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
                                                            taluk_delete_json_result: {
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
                                                    taluk_delete_json_result: {
                                                        varstatuscode: objConstants.alreadyinusecode,
                                                        response: objConstants.successresponsecode,
                                                        responsestring: msgtext
                                                    }
                                                });
                                            });
                                        }
                                    });
                                })

                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        taluk_delete_json_result: {
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
                            taluk_delete_json_result: {
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
                        taluk_delete_json_result: {
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
        logger.error("Error in taluk Delete: " + e);
    }
}
exports.taluk_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'taluk List by Code', logdate: new Date(), type: 'Employee' }

                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.talukcode != null) {
                    const params = { talukcode: req.query.talukcode };
                    get_taluk_details.getTalukSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    taluk_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        taluklist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    taluk_list_json_result: {
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
                            taluk_list_json_result: {
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
                        taluk_list_json_result: {
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
        logger.error("Error in taluk List by Code: " + e);
    }
}
exports.taluk_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'taluk List', logdate: new Date(), type: 'Employee' }
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
                            get_taluk_details.getTalukList(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) { 
                                    objUtilities.findCount("Taluk", function (respon) { 
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                taluk_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    tot_language_count: langresponse.length,
                                                    talukselfields: response,
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
                                            taluk_list_json_result: {
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
                                    taluk_list_json_result: {
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
                            taluk_list_json_result: {
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
                        taluk_list_json_result: {
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
        logger.error("Error in taluk List: " + e);
    }
}