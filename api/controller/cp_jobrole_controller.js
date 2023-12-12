'use strict';
var get_jobrole_details = require('../process/cp_jobrole_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
//const {objConstants.notvalidcode,objConstants.objConstants.createcode,objConstants.listcode, objConstants.existcode,objConstants.updatecode,objConstants.deletecode, objConstants.recordnotfoundcode, objConstants.successresponsecode,objConstants.usernotfoundcode } = require('../../config/constants');

exports.jobrole_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job Role Form Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_jobrole_details.getJobRoleFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                jobrole_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    languagelist: response[0],
                                    JobFunctionList: response[1]
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                jobrole_json_result: {
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
                        jobrole_json_result: {
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
        logger.error("Error in Job Role Load: " + e);
    }
}
exports.insert_jobrole_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'jobrole Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    get_jobrole_details.checkJobRoleNameExists(logparams, req, function (rescode) {
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_jobrole_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                            var varMaxCode = resp;
                                            const params = { jobrolecode: parseInt(varMaxCode), jobrole: req.body.jobrole, jobfunctioncode: parseInt(req.body.jobfunctioncode), statuscode: 1, createddate: currenttime, updateddate: 0 };
                                            get_jobrole_details.InsertJobRoleDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.createcode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            JobRole_insert_json_result: {
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
                                                            JobRole_insert_json_result: {
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
                                        JobRole_insert_json_result: {
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
                            JobRole_insert_json_result: {
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
                        JobRole_insert_json_result: {
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
        logger.error("Error in Job Role Create: " + e);
    }
}
exports.update_jobrole_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job Role update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.jobrolecode != null) {
                    if (req.body.statuscode != null && req.body.statuscode == objConstants.inactivestatus) {
                        get_jobrole_details.checkJobRoleCodeExistsInOthers(logparams, req, function (existsresponse) {
                            if (existsresponse != null && existsresponse == 0) {
                                var params = { "jobrolecode": Number(req.query.jobrolecode) };
                                get_jobrole_details.checkjobfunctioncodeExistsInJobrole(logparams, params, function (validcode) {
                                    if (validcode[0].jobfunctioncode == req.body.jobfunctioncode) {
                                        get_jobrole_details.checkJobRoleNameExistsByCode(logparams, req, function (resp) {
                                            if (resp != null) {
                                                var existscount = resp;
                                                if (existscount == 0) {
                                                    get_jobrole_details.checkJobRoleCodeExists(logparams, req, function (respo) {
                                                        if (respo != null) {
                                                            var codeexistscount = respo;
                                                            if (codeexistscount > 0) {
                                                                get_jobrole_details.getJobRoleSingleRecordDetails(logparams, req, function (respon) {
                                                                    if (respon != null) {
                                                                        const listdetails = respon;
                                                                        if (listdetails != null) {
                                                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                                const params = { jobrolecode: parseInt(req.query.jobrolecode), jobrole: req.body.jobrole, jobrole: req.body.jobrole, jobfunctioncode: parseInt(req.body.jobfunctioncode), statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                                get_jobrole_details.updateJobRoleDetails(logparams, params, function (response) {
                                                                                    if (response == true) {
                                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                            return res.status(200).json({
                                                                                                JobRole_update_json_result: {
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
                                                                                                JobRole_update_json_result: {
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
                                                                                    JobRole_update_json_result: {
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
                                                                        JobRole_update_json_result: {
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
                                                            JobRole_update_json_result: {
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
                                    /* const msgparam = { "messagecode": objConstants.alreadyinuseupdatecode };
                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                        return res.status(200).json({
                                            JobRole_update_json_result: {
                                                varstatuscode: objConstants.alreadyinuseupdatecode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgtext
                                            }
                                        });
                                    }); */
                                });

                            }
                            else {
                                const msgparam = { "messagecode": objConstants.alreadyinuseupdatecode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        JobRole_update_json_result: {
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
                        get_jobrole_details.checkJobRoleCodeExistsInOthers(logparams, req, function (existsresponse) {
                             //console.log(existsresponse);
                            if (existsresponse != null && existsresponse == 0) {
                                get_jobrole_details.checkJobRoleNameExistsByCode(logparams, req, function (resp) {
                                    if (resp != null) {
                                        var existscount = resp;
                                        if (existscount == 0) {
                                            get_jobrole_details.checkJobRoleCodeExists(logparams, req, function (respo) {
                                                if (respo != null) {
                                                    var codeexistscount = respo;
                                                    if (codeexistscount > 0) {
                                                        get_jobrole_details.getJobRoleSingleRecordDetails(logparams, req, function (respon) {
                                                            if (respon != null) {
                                                                const listdetails = respon;
                                                                if (listdetails != null) {
                                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                        const params = { jobrolecode: parseInt(req.query.jobrolecode), jobrole: req.body.jobrole, jobrole: req.body.jobrole, jobfunctioncode: parseInt(req.body.jobfunctioncode), statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                        get_jobrole_details.updateJobRoleDetails(logparams, params, function (response) {
                                                                            if (response == true) {
                                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                    return res.status(200).json({
                                                                                        JobRole_update_json_result: {
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
                                                                                        JobRole_update_json_result: {
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
                                                                            JobRole_update_json_result: {
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
                                                                JobRole_update_json_result: {
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
                                                    JobRole_update_json_result: {
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
                                var params = { "jobrolecode": Number(req.query.jobrolecode) };
                                get_jobrole_details.checkjobfunctioncodeExistsInJobrole(logparams, params, function (validcode) {
                                    ////console.log(validcode[0].jobfunctioncode);
                                    if (validcode[0].jobfunctioncode == req.body.jobfunctioncode) {
                                        get_jobrole_details.checkJobRoleNameExistsByCode(logparams, req, function (resp) {
                                            if (resp != null) {
                                                var existscount = resp;
                                                if (existscount == 0) {
                                                    get_jobrole_details.checkJobRoleCodeExists(logparams, req, function (respo) {
                                                        if (respo != null) {
                                                            var codeexistscount = respo;
                                                            if (codeexistscount > 0) {
                                                                get_jobrole_details.getJobRoleSingleRecordDetails(logparams, req, function (respon) {
                                                                    if (respon != null) {
                                                                        const listdetails = respon;
                                                                        if (listdetails != null) {
                                                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                                const params = { jobrolecode: parseInt(req.query.jobrolecode), jobrole: req.body.jobrole, jobrole: req.body.jobrole, jobfunctioncode: parseInt(req.body.jobfunctioncode), statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                                get_jobrole_details.updateJobRoleDetails(logparams, params, function (response) {
                                                                                    if (response == true) {
                                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                            return res.status(200).json({
                                                                                                JobRole_update_json_result: {
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
                                                                                                JobRole_update_json_result: {
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
                                                                                    JobRole_update_json_result: {
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
                                                                        JobRole_update_json_result: {
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
                                                            JobRole_update_json_result: {
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
                                                JobRole_update_json_result: {
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

                    }

                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            JobRole_update_json_result: {
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
                        JobRole_update_json_result: {
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
        logger.error("Error in Job Role Update: " + e);
    }
}
exports.delete_jobrole_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job Role Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.jobrolecode != null) {
                    get_jobrole_details.checkJobRoleCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { jobrolecode: req.query.jobrolecode };
                                get_jobrole_details.checkJobRoleCodeExistsInOthers(logparams, req, function (existsresponse) {
                                    ////console.log("existsresponse",existsresponse);
                                    if (existsresponse != null) {
                                        if (existsresponse == 0) {
                                            get_jobrole_details.deleteJobRoleDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.deletecode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            JobRole_delete_json_result: {
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
                                                            JobRole_delete_json_result: {
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
                                                    JobRole_delete_json_result: {
                                                        varstatuscode: objConstants.alreadyinusecode,
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
                                                JobRole_delete_json_result: {
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
                                        JobRole_delete_json_result: {
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
                            JobRole_delete_json_result: {
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
                        JobRole_delete_json_result: {
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
        logger.error("Error in Job Role Delete: " + e);
    }
}
exports.jobrole_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job Role List by Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.jobrolecode != null) {
                    const params = { jobrolecode: req.query.jobrolecode };
                    get_jobrole_details.getJobRoleSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    jobrole_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        jobrolelist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    jobrole_list_json_result: {
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
                            jobrole_list_json_result: {
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
                        jobrole_list_json_result: {
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
        logger.error("Error in Job Role List by Code: " + e);
    }
}
exports.jobrole_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'job role List', logdate: new Date(), type: 'Employee' }
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
                    const params = { statuscode: req.query.statuscode,languagecode: languagecode,skipvalue:req.query.skipvalue,limitvalue:req.query.limitvalue };
                    objUtilities.getPortalLanguageDetails(logparams, function (langresponse) {
                        if (langresponse != null) {
                            get_jobrole_details.getJobRoleList(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.jobrolecount, function (respon) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                jobrole_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    tot_language_count: langresponse.length,
                                                    jobrolelist: response,
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
                                            jobrole_list_json_result: {
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
                                    jobrole_list_json_result: {
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
                            jobrole_list_json_result: {
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
                        jobrole_list_json_result: {
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
        logger.error("Error in Job Role List: " + e);
    }
}