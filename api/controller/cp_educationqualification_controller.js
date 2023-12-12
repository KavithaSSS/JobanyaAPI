'use strict';
var get_qualification_details = require('../process/cp_educationalqualification_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
// const {notvalidcode,createcode,listcode, existcode,updatecode,deletecode, recordnotfoundcode, successresponsecode,usernotfoundcode } = require('../../config/constants');
exports.qualification_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Qualification form load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_qualification_details.getQualificationFormLoadList(logparams, function (response) {
                    ////console.log(response);
                    if (response != null) {
                        const msgparam = { "messagecode": objconstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                qualification_json_result: {
                                    response: objconstants.successresponsecode,
                                    varstatuscode: objconstants.listcode,
                                    responsestring: msgtext,
                                    education_category_list: response
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                qualification_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgtext
                                }
                            });
                        });
                    }
                });
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        qualification_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            response: objconstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in qualification formload: " + e); }
    }
}
exports.insert_qualification_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'qualification Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var params = req.body.qualificationname;
                var qualification = [];
                get_qualification_details.DulicateCheckQualification(logparams, params, req, function (response) {
                    // //console.log(response);
                    if (response != null && response.length > 0) {
                        get_qualification_details.InsertQualificationLog(logparams, function (validlog) {
                            if (validlog != null && validlog != "") {
                                get_qualification_details.getMaxcode(logparams, function (validmax) {
                                    // //console.log(validmax);
                                    if (validmax != null && validmax != 0) {
                                        for (var i = 0; i <= response.length - 1; i++) {
                                            var maxcode = validmax + i;
                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                var Employeeinfo = {
                                                    "qualificationcode": maxcode,
                                                    "qualificationname": response[i],
                                                    "educationcategorycode": req.body.educationcategorycode,
                                                    "statuscode": objconstants.activestatus,
                                                    "createddate": currenttime,
                                                    "updateddate": 0,
                                                    "makerid": validlog
                                                }
                                                qualification.push(Employeeinfo);
                                            });                                            
                                        }
                                        get_qualification_details.SaveSingleQualification(logparams, qualification, function (result) {
                                            if (result != null && result > 0) {
                                                const msgparam = { "messagecode": objconstants.createcode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        qualification_json_result: {
                                                            response: objconstants.successresponsecode,
                                                            varstatuscode: objconstants.createcode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                    else {
                        const msgparam = { "messagecode": objconstants.existcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                qualification_json_result: {
                                    varstatuscode: objconstants.existcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgtext
                                }
                            });
                        });
                    }
                });

            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        qualification_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            response: objconstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in Qualification insert: " + e); }
    }
}
exports.update_qualification_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Qualification update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.qualificationcode != null) {
                    if (req.body.statuscode != null && req.body.statuscode == objconstants.inactivestatus) {
                        const params = { qualificationcode: req.query.qualificationcode };
                        get_qualification_details.checkQualificationCodeExistsInMapping(logparams, params, function (result) {
                            if (result == null || result == 0) {
                                get_qualification_details.checkQualificationNameExistsByCode(logparams, req, function (resp) {
                                    if (resp != null) {
                                        var existscount = resp;
                                        if (existscount == 0) {
                                            get_qualification_details.checkQualificationCodeExists(logparams, req, function (respo) {
                                                if (respo != null) {
                                                    var codeexistscount = respo;
                                                    if (codeexistscount > 0) {
                                                        get_qualification_details.getQualificationSingleRecordDetails(logparams, req, function (respon) {
                                                            if (respon != null) {
                                                                const listdetails = respon;
                                                                if (listdetails != null) {
                                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                        const params = { qualificationcode: parseInt(req.query.qualificationcode), educationcategorycode: parseInt(req.body.educationcategorycode), qualificationname: req.body.qualificationname, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                        get_qualification_details.updateQualificationDetails(logparams, params, function (response) {
                                                                            if (response != null && response > 0) {
                                                                                const msgparam = { "messagecode": objconstants.updatecode };
                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                    return res.status(200).json({
                                                                                        qualification_json_result: {
                                                                                            response: objconstants.successresponsecode,
                                                                                            varstatuscode: objconstants.updatecode,
                                                                                            responsestring: msgtext
                                                                                        }
                                                                                    });
                                                                                });
                                                                            }
                                                                            else {
                                                                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                    return res.status(200).json({
                                                                                        qualification_json_result: {
                                                                                            varstatuscode: objconstants.recordnotfoundcode,
                                                                                            response: objconstants.successresponsecode,
                                                                                            responsestring: msgtext
                                                                                        }
                                                                                    });
                                                                                });
                                                                            }
                                                                        });
                                                                    });
                                                                    
                                                                }
                                                                else {
                                                                    const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                        return res.status(200).json({
                                                                            qualification_json_result: {
                                                                                varstatuscode: objconstants.recordnotfoundcode,
                                                                                response: objconstants.successresponsecode,
                                                                                responsestring: msgtext
                                                                            }
                                                                        });
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                qualification_json_result: {
                                                                    varstatuscode: objconstants.recordnotfoundcode,
                                                                    response: objconstants.successresponsecode,
                                                                    responsestring: msgtext
                                                                }
                                                            });
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            const msgparam = { "messagecode": objconstants.existcode };
                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                return res.status(200).json({
                                                    qualification_json_result: {
                                                        varstatuscode: objconstants.existcode,
                                                        response: objconstants.successresponsecode,
                                                        responsestring: msgtext
                                                    }
                                                });
                                            });
                                        }
                                    }
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.alreadyinuseupdatecode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        qualification_json_result: {
                                            varstatuscode: objconstants.alreadyinuseupdatecode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        });

                    }
                    else {
                        get_qualification_details.checkQualificationNameExistsByCode(logparams, req, function (resp) {
                            if (resp != null) {
                                var existscount = resp;
                                if (existscount == 0) {
                                    get_qualification_details.checkQualificationCodeExists(logparams, req, function (respo) {
                                        if (respo != null) {
                                            var codeexistscount = respo;
                                            if (codeexistscount > 0) {
                                                get_qualification_details.getQualificationSingleRecordDetails(logparams, req, function (respon) {
                                                    if (respon != null) {
                                                        const listdetails = respon;
                                                        if (listdetails != null) {
                                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                const params = { qualificationcode: parseInt(req.query.qualificationcode), educationcategorycode: parseInt(req.body.educationcategorycode), qualificationname: req.body.qualificationname, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                get_qualification_details.updateQualificationDetails(logparams, params, function (response) {
                                                                    if (response != null && response > 0) {
                                                                        const msgparam = { "messagecode": objconstants.updatecode };
                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                            return res.status(200).json({
                                                                                qualification_json_result: {
                                                                                    response: objconstants.successresponsecode,
                                                                                    varstatuscode: objconstants.updatecode,
                                                                                    responsestring: msgtext
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                    else {
                                                                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                            return res.status(200).json({
                                                                                qualification_json_result: {
                                                                                    varstatuscode: objconstants.recordnotfoundcode,
                                                                                    response: objconstants.successresponsecode,
                                                                                    responsestring: msgtext
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                            
                                                        }
                                                        else {
                                                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                return res.status(200).json({
                                                                    qualification_json_result: {
                                                                        varstatuscode: objconstants.recordnotfoundcode,
                                                                        response: objconstants.successresponsecode,
                                                                        responsestring: msgtext
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        qualification_json_result: {
                                                            varstatuscode: objconstants.recordnotfoundcode,
                                                            response: objconstants.successresponsecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objconstants.existcode };
                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                        return res.status(200).json({
                                            qualification_json_result: {
                                                varstatuscode: objconstants.existcode,
                                                response: objconstants.successresponsecode,
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
                    const msgparam = { "messagecode": objconstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            qualification_json_result: {
                                varstatuscode: objconstants.notvalidcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        qualification_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            response: objconstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in Qualification Update: " + e); }
    }
}
exports.delete_qualification_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'qualification Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.qualificationcode != null) {
                    get_qualification_details.checkQualificationCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { qualificationcode: req.query.qualificationcode };
                                get_qualification_details.checkQualificationCodeExistsInMapping(logparams, params, function (result) {
                                    // //console.log(result);
                                    if (result == null || result == 0) {
                                        get_qualification_details.deleteQualificationDetails(logparams, params, function (response) {
                                            if (response != null && response > 0) {
                                                const msgparam = { "messagecode": objconstants.deletecode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        qualification_json_result: {
                                                            response: objconstants.successresponsecode,
                                                            varstatuscode: objconstants.deletecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        qualification_json_result: {
                                                            varstatuscode: objconstants.recordnotfoundcode,
                                                            response: objconstants.successresponsecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": objconstants.alreadyinusecode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                qualification_json_result: {
                                                    varstatuscode: objconstants.alreadyinusecode,
                                                    response: objconstants.successresponsecode,
                                                    responsestring: msgtext
                                                }
                                            });
                                        });
                                    }
                                });

                            }
                            else {
                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        qualification_json_result: {
                                            varstatuscode: objconstants.recordnotfoundcode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgtext
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objconstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            qualification_json_result: {
                                varstatuscode: objconstants.notvalidcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        qualification_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            response: objconstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in Qualification delete: " + e); }
    }
}
exports.qualification_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'qualification Edit load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.qualificationcode != null) {
                    const params = { qualificationcode: req.query.qualificationcode };
                    get_qualification_details.getQualificationSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objconstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    qualification_json_result: {
                                        response: objconstants.successresponsecode,
                                        varstatuscode: objconstants.listcode,
                                        responsestring: msgtext,
                                        educationqualification: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    qualification_json_result: {
                                        varstatuscode: objconstants.recordnotfoundcode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgtext
                                    }
                                });
                            });
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objconstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            qualification_json_result: {
                                varstatuscode: objconstants.notvalidcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        qualification_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            response: objconstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in Qualification Edit load: " + e); }
    }
}
exports.qualification_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'qualification List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {
                    const params = { statuscode: req.query.statuscode };
                    get_qualification_details.getQualificationList(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            objUtilities.findCount(objconstants.qualificationcount, function (respon) {
                                const msgparam = { "messagecode": objconstants.listcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        qualification_list_json_result: {
                                            response: objconstants.successresponsecode,
                                            varstatuscode: objconstants.listcode,
                                            responsestring: msgtext,
                                            activecount: respon[0],
                                            inactivecount: respon[1],
                                            totcount: respon[2],
                                            education_sel_fields: response
                                        }
                                    });

                                });
                            }
                            );
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    qualification_list_json_result: {
                                        varstatuscode: objconstants.recordnotfoundcode,
                                        response: objconstants.successresponsecode,
                                        responsestring: msgtext
                                    }
                                });
                            });
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objconstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            qualification_list_json_result: {
                                varstatuscode: objconstants.notvalidcode,
                                response: objconstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        qualification_list_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            response: objconstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in Qualification list: " + e); }
    }
}