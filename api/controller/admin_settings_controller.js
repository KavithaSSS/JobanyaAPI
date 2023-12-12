'use strict';
var get_settings_details = require('../process/admin_settings_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
// const {notvalidcode,createcode,listcode, existcode,updatecode,deletecode, recordnotfoundcode, successresponsecode,usernotfoundcode } = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.update_settings_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'settings update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                // if (req.body != null) {
                //     if (req.query.settingcode != null) 
                if (req.body != null && req.query.settingcode != null) {
                    get_settings_details.checksettingcodeExists(logparams, req, function (response) {
                        ////console.log(response);
                        if (response != null && response != 0) {
                            ////console.log("entry");
                            get_settings_details.getSettingsSingleRecordDetails(logparams, req, function (respon) {
                                if (respon != null) {
                                    const listdetails = respon;
                                    ////console.log(listdetails);
                                    if (listdetails != null) {
                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                            const params = { settingcode: parseInt(req.query.settingcode), notifications: req.body.notifications, generalsettings: req.body.generalsettings, employeecheckout: req.body.employeecheckout, updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                            get_settings_details.updateSettingsDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) 
                                                {
                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            settings_update_json_result: {
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
                                                            settings_update_json_result: {
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
                                                settings_update_json_result: {
                                                    varstatuscode: objConstants.recordnotfoundcode,
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
                                            settings_update_json_result: {
                                                varstatuscode: objConstants.notvalidcode,
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
                                    settings_update_json_result: {
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        response: objConstants.recordnotfoundcode,
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
                            settings_update_json_result: {
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
                        settings_update_json_result: {
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
        { logger.error("Error in Update settings Details: " + e); }
    }
}
exports.settings_list_by_code = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Settings List by code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.settingcode != null) {
                    const params = { settingcode: req.query.settingcode };
                    get_settings_details.getSettingsSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    settings_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        settingslist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    settings_list_json_result: {
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
                            settings_list_json_result: {
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
                        settings_list_json_result: {
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
        { logger.error("Error in Settings List: " + e); }
    }
}
exports.ChangePassword = function (req, res) {
    try {
        // //console.log("Entry")
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Change password', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_settings_details.CheckDecryptPassword(logparams, req, function (validdecrypt) {
                    if (validdecrypt == true) {
                        get_settings_details.ChangeNewpassword(logparams, req, function (validpwd) {
                            if (validpwd != null && validpwd > 0) {
                                const msgparam = { "messagecode": objConstants.passwordchangesuccesscode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        change_password_json_result: {
                                            varstatuscode: objConstants.passwordchangesuccesscode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
                                        }
                                    });
                                });
                            }
                        })
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.oldpasswordincorrectcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                change_password_json_result: {
                                    varstatuscode: objConstants.oldpasswordincorrectcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey
                                }
                            });
                        });
                    }
                })
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        change_password_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in Change password : " + e); }
    }
}