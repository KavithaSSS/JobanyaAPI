'use strict';
var get_user_details = require('../process/cp_user_process_controller');
var objConstants = require('../../config/constants');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
// const {notvalidcode,loginsuccesscode, passwordincorrectcode, createcode,listcode, existcode,updatecode,deletecode, recordnotfoundcode, successresponsecode,usernotfoundcode } = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.insert_user_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'User Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    get_user_details.checkUserNameExists(logparams, req, function (rescode) {
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_user_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        var varMaxCode = resp;
                                        objUtilities.encryptpassword(logparams, req.body.password, function (respo) {
                                            var encryptedpwd = respo;
                                            const params = { usercode: parseInt(varMaxCode), nameoftheuser: req.body.nameoftheuser, designationcode: parseInt(req.body.designationcode), username: req.body.username, password: encryptedpwd, userrolecode: parseInt(req.body.userrolecode), statuscode: 1, createddate: milliseconds };
                                            get_user_details.InsertUserDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.createcode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            user_json_result: {
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
                                                            user_json_result: {
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
                                        user_json_result: {
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
                            user_json_result: {
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
                        user_json_result: {
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
        logger.error("Error in User Save: " + e);
    }
}
exports.update_user_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'user update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.editusercode != null) {
                    get_user_details.checkUserNameExistsByCode(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount == 0) {
                                get_user_details.checkUserCodeExists(logparams, req, function (respo) {
                                    if (respo != null) {
                                        var usercodeexistscount = respo;
                                        if (usercodeexistscount > 0) {
                                            get_user_details.getUserSingleRecordDetails(logparams, req, function (respon) {
                                                if (respon != null) {
                                                    const listuserdetails = respon;
                                                    if (listuserdetails != null) {
                                                        objUtilities.encryptpassword(logparams, req.body.password, function (respo) {
                                                            var encryptedpwd = respo;
                                                            const params = { usercode: parseInt(req.query.editusercode), nameoftheuser: req.body.nameoftheuser, designationcode: parseInt(req.body.designationcode), username: req.body.username, password: encryptedpwd, userrolecode: parseInt(req.body.userrolecode), statuscode: parseInt(req.body.statuscode), updateddate: milliseconds, makerid: listuserdetails[0].makerid, createddate: listuserdetails[0].createddate };
                                                            get_user_details.updateUserDetails(logparams, params, function (response) {
                                                                if (response == true) {
                                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                        return res.status(200).json({
                                                                            user_json_result: {
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
                                                                            user_json_result: {
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
                                                                user_json_result: {
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
                                                    user_json_result: {
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
                                        user_json_result: {
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
                            user_json_result: {
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
                        user_json_result: {
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
        logger.error("Error in User Update: " + e);
    }
}
exports.delete_user_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'user Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.editusercode != null) {
                    var varusercode = req.query.editusercode;
                    get_user_details.checkUserCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { usercode: varusercode };
                                get_user_details.deleteUserDetails(logparams, params, function (response) {
                                    // //console.log("Entry");
                                    if (response != null && response > 0) {
                                        const msgparam = { "messagecode": objConstants.deletecode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                user_json_result: {
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
                                                user_json_result: {
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
                                        user_json_result: {
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
                            user_json_result: {
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
                        user_json_result: {
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
        logger.error("Error in User Delete: " + e);
    }
}
exports.user_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'user List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.editusercode != null) {
                    const params = { usercode: req.query.editusercode };
                    get_user_details.getUserSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0 && response != "") {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    user_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        getuserlist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    user_json_result: {
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
                            user_json_result: {
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
                        user_json_result: {
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
        logger.error("Error in User List by Code: " + e);
    }
}
exports.user_login_details = async function (req, res) {
    try {
      
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.username, orginator: 'user Login', logdate: new Date(), type: 'Employee' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objUtilities.encryptpassword(logparams, req.query.password, function (respo) {
            var encryptedpwd = respo;
            const params = { username: { $regex: "^" + req.query.username + "$", $options: 'i' }, actpwd: req.query.password, password: encryptedpwd };
            get_user_details.getUserSingleRecordDetails_Login(logparams, params, function (response) {
                if (response != null && response.length != 0) {
                    if (response[0].statuscode == objConstants.activestatus) {
                        const dbo = MongoDB.getDB();
                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                            ////console.log(currenttime);
                            dbo.collection(MongoDB.UserCollectionName).updateOne({ "usercode": response[0].usercode }, { $set: { "lastlogindate": currenttime } }, async function (err, logres) {
                                //  var prefstatus = false;
                                // if (prefresult != null) {
                                //     prefstatus = true;
                                // }
                                var accessToken =  await objUtilities.generateAccessToken({user: req.query.username});
                                var refreshToken =  await objUtilities.generateRefreshToken({user: req.query.username}); 
                              
                                const msgparam = { "messagecode": objConstants.loginsuccesscode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    
                                    return res.status(200).json({
                                        login_json_result: {
                                            response: objConstants.successresponsecode,
                                            varstatuscode: objConstants.loginsuccesscode,
                                            responsestring: msgtext,
                                            getuserlist: response,
                                            currenttime: currenttime,
                                            accessToken:accessToken,
                                            refreshToken:refreshToken
                                        }
                                    });
        
                                });
                            });    
                        });                                            
                    }
                    else if (response[0].statuscode == objConstants.inactivestatus) {
                        const msgparam = { "messagecode": objConstants.userinactivecode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                login_json_result: {
                                    varstatuscode: objConstants.userinactivecode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }

                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.passwordincorrectcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                login_json_result: {
                                    varstatuscode: objConstants.passwordincorrectcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgtext
                                }
                            });
                        });
                    }
                }
                else {
                    const msgparam = { "messagecode": objConstants.passwordincorrectcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            login_json_result: {
                                varstatuscode: objConstants.passwordincorrectcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }
            });
        });
    }
    catch (e) {
        logger.error("Error in User Login: " + e);
    }
}
exports.user_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'user form load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_user_details.getFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                user_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    designationselfields: response[0],
                                    userrolefields: response[1]
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                user_json_result: {
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
                        user_json_result: {
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
        logger.error("Error in User Load: " + e);
    }
}
exports.user_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'user List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {
                    const params = { statuscode: req.query.statuscode };
                    get_user_details.getUserList(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            objUtilities.findCount(objConstants.usercount, function (respon) {
                                ////console.log(respon);
                                const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        user_json_result: {
                                            response: objConstants.successresponsecode,
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgtext,
                                            activecount: respon[0],
                                            inactivecount: respon[1],
                                            totcount: respon[2],
                                            getuserlist: response
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
                                    user_json_result: {
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
                            user_json_result: {
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
                        user_json_result: {
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
        logger.error("Error in User List: " + e);
    }
}