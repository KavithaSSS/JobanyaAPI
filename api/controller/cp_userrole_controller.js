'use strict';
var get_userrole_details = require('../process/cp_userrole_process_controller');
var get_user_details = require('../process/cp_user_process_controller');
const objUtilities = require('./utilities');
//const {notvalidcode, objConstants.alreadyinusecode,objConstants.createcode,objConstants.listcode, objConstants.existcode,objConstants.updatecode,objConstants.deletecode, objConstants.recordnotfoundcode, objConstants.successresponsecode,objConstants.usernotfoundcode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.insert_userrole_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'userrole Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    get_userrole_details.checkUserRoleNameExists(logparams, req, function (rescode) {
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_userrole_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        var varMaxCode = resp;
                                        const params = { userrolecode: parseInt(varMaxCode), userrolename: req.body.userrolename, statuscode: 1, createddate: milliseconds, menuid: req.body.menuid, updateddate: 0 };
                                        get_userrole_details.InsertUserRoleDetails(logparams, params, function (response) {
                                            if (response != null && response > 0) {
                                                const msgparam = { "messagecode": objConstants.createcode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        user_role_insert_json_result: {
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
                                                        user_role_insert_json_result: {
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
                                        user_role_insert_json_result: {
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
                            user_role_insert_json_result: {
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
                        user_role_insert_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in User Role Save: " + e); }
}
exports.update_userrole_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'userrole update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.userrolecode != null) {
                    if (req.body.statuscode != null && req.body.statuscode == objConstants.inactivestatus) {
                        get_userrole_details.checkUserRoleCodeExistsInOthers(logparams, req, function (respo) {
                            if (respo == null || respo == 0) {
                                get_userrole_details.checkUserRoleNameExistsByCode(logparams, req, function (resp) {
                                    if (resp != null) {
                                        var existscount = resp;
                                        if (existscount == 0) {
                                            get_userrole_details.checkUserRoleCodeExists(logparams, req, function (respo) {
                                                if (respo != null) {
                                                    var userrolecodeexistscount = respo;
                                                    if (userrolecodeexistscount > 0) {
                                                        get_userrole_details.getUserRoleSingleRecordDetails(logparams, req, function (respon) {
                                                            if (respon != null) {
                                                                const listuserroledetails = respon;
                                                                if (listuserroledetails != null) {
                                                                    const params = { userrolecode: parseInt(req.query.userrolecode), userrolename: req.body.userrolename, statuscode: (req.body.statuscode), updateddate: milliseconds, makerid: listuserroledetails[0].makerid, createddate: listuserroledetails[0].createddate, menuid: req.body.menuid };
                                                                    get_userrole_details.updateUserRoleDetails(logparams, params, function (response) {
                                                                        if (response == true) {
                                                                            const msgparam = { "messagecode": objConstants.updatecode };
                                                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                return res.status(200).json({
                                                                                    user_role_update_json_result: {
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
                                                                                    user_role_update_json_result: {
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
                                                                            user_role_update_json_result: {
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
                                                                user_role_update_json_result: {
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
                                                    user_role_update_json_result: {
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
                                        user_role_update_json_result: {
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
                        get_userrole_details.checkUserRoleNameExistsByCode(logparams, req, function (resp) {
                            if (resp != null) {
                                var existscount = resp;
                                if (existscount == 0) {
                                    get_userrole_details.checkUserRoleCodeExists(logparams, req, function (respo) {
                                        if (respo != null) {
                                            var userrolecodeexistscount = respo;
                                            if (userrolecodeexistscount > 0) {
                                                get_userrole_details.getUserRoleSingleRecordDetails(logparams, req, function (respon) {
                                                    if (respon != null) {
                                                        const listuserroledetails = respon;
                                                        if (listuserroledetails != null) {
                                                            const params = { userrolecode: parseInt(req.query.userrolecode), userrolename: req.body.userrolename, statuscode: (req.body.statuscode), updateddate: milliseconds, makerid: listuserroledetails[0].makerid, createddate: listuserroledetails[0].createddate, menuid: req.body.menuid };
                                                            get_userrole_details.updateUserRoleDetails(logparams, params, function (response) {
                                                                if (response == true) {
                                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                        return res.status(200).json({
                                                                            user_role_update_json_result: {
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
                                                                            user_role_update_json_result: {
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
                                                                    user_role_update_json_result: {
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
                                                        user_role_update_json_result: {
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
                                            user_role_update_json_result: {
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
                            user_role_update_json_result: {
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
                        user_role_update_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in User Role Update: " + e); }

}
exports.delete_userrole_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'userrole Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.userrolecode != null) {
                    get_userrole_details.checkUserRoleCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                get_userrole_details.checkUserRoleCodeExistsInOthers(logparams, req, function (respo) {
                                    if (respo != null) {
                                        var othersexistscount = respo;
                                        if (othersexistscount == 0) {
                                            const params = { userrolecode: req.query.userrolecode };
                                            get_userrole_details.deleteUserRoleDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                const msgparam = { "messagecode": objConstants.deletecode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        user_role_delete_json_result: {
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
                                                        user_role_delete_json_result: {
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
                                        user_role_delete_json_result: {
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
                                    user_role_delete_json_result: {
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
                            user_role_delete_json_result: {
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
                        user_role_delete_json_result: {
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
                user_role_delete_json_result: {
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
            user_role_delete_json_result: {
                varstatuscode: objConstants.usernotfoundcode,
                response: objConstants.successresponsecode,
                responsestring: msgtext
            }
        });
    });
}
        });
    }
    catch (e) { logger.error("Error in User Role Delete: " + e); }
}
exports.userrole_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'userrole List by Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.userrolecode != null) {
                    get_userrole_details.getUserRoleSingleRecordDetails_Edit(logparams, req, function (response) {
                        ////console.log(response);
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    user_role_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        userrolelist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    user_role_list_json_result: {
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
                            user_role_list_json_result: {
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
                        user_role_list_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in User Role List by Code: " + e); }
}
exports.userrole_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'user role List Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_userrole_details.getUserRoleFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                userrole_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    userrole_list: response.userrolelist,
                                    menu_list: response.menulist,
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                userrole_json_result: {
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
                        userrole_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in User Role Load: " + e); }
}
exports.userrole_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'user role List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {

                    const params = { statuscode: req.query.statuscode };
                    get_userrole_details.getUserRoleList(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            objUtilities.findCount(objConstants.userrolecount, function (respon) {
                                ////console.log(respon);
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        user_role_list_json_result: {
                                            response: objConstants.successresponsecode,
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgtext,
                                            activecount: respon[0],
                                            inactivecount: respon[1],
                                            totalcount: respon[2],
                                            userroleselfields: response
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
                                    user_role_list_json_result: {
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
                            user_role_list_json_result: {
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
                        user_role_list_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in User Role List: " + e); }
}