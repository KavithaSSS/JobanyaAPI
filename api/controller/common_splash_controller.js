'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
//const {notvalidcode,alreadyinusecode, createcode,listcode, existcode,updatecode,deletecode, recordnotfoundcode, successresponsecode,usernotfoundcode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const objSplash = require('../process/common_splash_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
exports.splash_formload = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Splash form load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                objSplash.getSplashFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                splash_json_result: {
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
                                splash_json_result: {
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
                        splash_json_result: {
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
        logger.error("Error in Splash Load: " + e);
    }
}
exports.insert_splash_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'splash Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    // objSplash.checkSplashExists(logparams, req, function (rescode) {
                    //     if (rescode != null) {
                    //         var existscount = rescode;
                    //         if (existscount == 0) {

                    //         }
                    //         else {
                    //             const msgparam = { "messagecode": objConstants.existcode };
                    //             objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    //                 return res.status(200).json({
                    //                     splash_insert_json_result: {
                    //                         varstatuscode: objConstants.existcode,
                    //                         response: objConstants.successresponsecode,
                    //                         responsestring: msgtext
                    //                     }
                    //                 });
                    //             });
                    //         }
                    //     }
                    // });
                    objSplash.getMaxcode(logparams, function (resp) {
                        if (resp != null) {
                            var varMaxCode = resp;
                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                const params = { splashcode: parseInt(varMaxCode), splash: req.body.splash, categorycode: parseInt(req.body.categorycode), statuscode: 1, createddate: currenttime, updateddate: 0 };
                                objSplash.InsertSplashDetails(logparams, params, function (response) {
                                    if (response != null && response > 0) {
                                        const msgparam = { "messagecode": objConstants.createcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                splash_insert_json_result: {
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
                                                splash_insert_json_result: {
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
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            splash_insert_json_result: {
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
                        splash_insert_json_result: {
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
        logger.error("Error in Splash Save: " + e);
    }
}
exports.update_splash_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Splash update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.splashcode != null) {
                    // objSplash.checkSplashExistsByCode(logparams, req, function (resp) {
                    //     if (resp != null) {
                    //         var existscount = resp;
                    //         if (existscount == 0) {

                    //         }
                    //         else {
                    //             const msgparam = { "messagecode": objConstants.existcode };
                    //             objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    //                 return res.status(200).json({
                    //                     splash_update_json_result: {
                    //                         varstatuscode: objConstants.existcode,
                    //                         response: objConstants.successresponsecode,
                    //                         responsestring: msgtext
                    //                     }
                    //                 });
                    //             });
                    //         }
                    //     }
                    // });
                    objSplash.checkSplashCodeExists(logparams, req, function (respo) {
                        if (respo != null) {
                            var codeexistscount = respo;
                            if (codeexistscount > 0) {
                                objSplash.getSplashSingleRecordDetails(logparams, req, function (respon) {
                                    if (respon != null) {
                                        const listdetails = respon;
                                        if (listdetails != null) {
                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                const params = { splashcode: parseInt(req.query.splashcode), splash: req.body.splash, categorycode: parseInt(req.body.categorycode), statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                objSplash.updateSplashDetails(logparams, params, function (response) {
                                                    if (response != null && response > 0) {
                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                splash_update_json_result: {
                                                                    response: objConstants.successresponsecode,
                                                                    varstatuscode: objConstants.updatecode,
                                                                    responsestring: msgtext,
                                                                    returncode: req.query.jobfunctioncode
                                                                }
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                splash_update_json_result: {
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
                                                    splash_update_json_result: {
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
                                        splash_update_json_result: {
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
                            splash_update_json_result: {
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
                        splash_update_json_result: {
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
        logger.error("Error in Splash Update: " + e);
    }
}
exports.update_splash_imageurl_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Splash Image URL update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.splashcode != null && req.body != null) {
                    objSplash.checkSplashCodeExists(logparams, req, function (respo) {
                        if (respo != null) {
                            var codeexistscount = respo;
                            if (codeexistscount > 0) {
                                objSplash.getSplashSingleRecordDetails(logparams, req, function (respon) {
                                    if (respon != null) {
                                        const listdetails = respon;
                                        if (listdetails != null) {
                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                const params = { splashcode: parseInt(req.query.splashcode), splash: listdetails[0].splash, imageurl: req.body.imageurl, statuscode: listdetails[0].statuscode, categorycode: listdetails[0].categorycode, updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                objSplash.updateSplashDetails(logparams, params, function (response) {
                                                    if (response != null && response > 0) {
                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                splash_update_json_result: {
                                                                    response: objConstants.successresponsecode,
                                                                    varstatuscode: objConstants.updatecode,
                                                                    responsestring: msgtext,
                                                                    returncode: req.query.jobfunctioncode
                                                                }
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                splash_update_json_result: {
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
                                                    splash_update_json_result: {
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
                                        splash_update_json_result: {
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
                            splash_update_json_result: {
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
                        splash_update_json_result: {
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
        logger.error("Error in Splash Image URL: " + e);
    }
}
exports.delete_splash_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Splash Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.splashcode != null) {
                    objSplash.checkSplashCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { splashcode: parseInt(req.query.splashcode) };
                                //  objSplash.checkJobFunctionCodeExistsInOthers(logparams,req, function(existsresponse){
                                //  if(existsresponse != null){
                                //if(existsresponse == 0){
                                ////console.log("Entry-afterdelete");
                                objSplash.deleteSplashDetails(logparams, params, function (response) {
                                    if (response != null && response > 0) {
                                        // //console.log("Entry-afterdelete");
                                        const msgparam = { "messagecode": objConstants.deletecode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                splash_delete_json_result: {
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
                                                splash_delete_json_result: {
                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgtext
                                                }
                                            });
                                        });
                                    }
                                });
                                //       }
                                // else{
                                //     const msgparam = {"messagecode": alreadyinusecode }; 
                                //     objUtilities.getMessageDetails(msgparam, function(msgtext){
                                //     return res.status(200).json({
                                //       splash_delete_json_result: {
                                //     varstatuscode: recordnotfoundcode,
                                //     response: successresponsecode,
                                //     responsestring: msgtext }});   });
                                // }
                                // }
                                // else{
                                //     const msgparam = {"messagecode": recordnotfoundcode }; 
                                //     objUtilities.getMessageDetails(msgparam, function(msgtext){
                                //     return res.status(200).json({
                                //       splash_delete_json_result: {
                                //     varstatuscode: recordnotfoundcode,
                                //     response: successresponsecode,
                                //     responsestring: msgtext }});   });
                                // }
                                //  });
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        splash_delete_json_result: {
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
                            splash_delete_json_result: {
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
                        splash_delete_json_result: {
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
        logger.error("Error in Splash Delete: " + e);
    }
}
exports.splash_list_by_code = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Splash List by Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.splashcode != null) {
                    const params = { splashcode: parseInt(req.query.splashcode) };
                    objSplash.getSplashSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    splash_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        splashlist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    splash_list_json_result: {
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
                            splash_list_json_result: {
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
                        splash_list_json_result: {
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
        logger.error("Error in Splash List by Code: " + e);
    }
}
exports.getWebSplashList = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Web Splash List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {
                    var languagecode;
                    if (req.query.languagecode != null) {
                        languagecode = req.query.languagecode;
                    }
                    else {
                        languagecode = objConstants.defaultlanguagecode;
                    }
                    const params = { statuscode: req.query.statuscode, languagecode: languagecode };
                    objUtilities.getPortalLanguageDetails(logparams, function (langresponse) {
                        if (langresponse != null) {
                            objSplash.getSplashList_web(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.splashcount, function (respon) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                splash_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    tot_language_count: langresponse.length,
                                                    splashselfields: response,
                                                    languageslist: langresponse
                                                }
                                            });

                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                        return res.status(200).json({
                                            splash_list_json_result: {
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
                                    splash_list_json_result: {
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
                            splash_list_json_result: {
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
                        splash_list_json_result: {
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
        logger.error("Error in Web Splash List: " + e);
    }
}
exports.getSplashList = function (req, res) {
    try {

        var objLogdetails;
        var langparams = { statuscode: objConstants.activestatus, 'splash.languagecode': Number(req.query.languagecode) };
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": 0, "orginator": 'Splash Bind', "type": 'Employee' };
        objUtilities.getLogDetails(params, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objSplash.getSplashList(logparams, langparams, function (response) {
            ////console.log(response);
            ////console.log(response.length);
            if (response.length > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": objConstants.listcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {

                    return res.status(200).json({
                        splash_list_json_result: {
                            varstatuscode: objConstants.listcode,
                            responsestring: msgtext,
                            response: objConstants.successresponsecode,
                            splashselfields: response,
                            slideinterval: 2000
                        }
                    });

                });
            }
            else {
                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        varstatuscode: objConstants.recordnotfoundcode,
                        response: objConstants.successresponsecode,
                        responsestring: msgtext,


                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in Employee Splash List: " + e); }
}

exports.welcome_screen_update = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Splash form load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                objSplash.getWelcomeScreenURL(logparams, function (response) {
                    if (response != null && response.length > 0) {
                        objSplash.UpdateScreenImageurl(logparams, req, function (response) {
                            if (response != null && response > 0) {
                                const msgparam = { "messagecode": objConstants.updatecode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        welcome_screen_json_result: {
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
                                        welcome_screen_json_result: {
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
                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                            const params = { welcomescreencode: 1, employeescreenurl: req.body.employeescreenurl, employerscreenurl: req.body.employerscreenurl, createddate: currenttime, updateddate: 0 };
                            objSplash.InsertScreenImageurl(logparams, params, function (response) {
                                if (response != null && response > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                        return res.status(200).json({
                                            welcome_screen_json_result: {
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
                                            welcome_screen_json_result: {
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
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        welcome_screen_json_result: {
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
        logger.error("Error in Splash Load: " + e);
    }
}

exports.welcome_screen_load = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Welcome Screen load', logdate: new Date(), type: 'Portal' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                objSplash.getWelcomeScreenURL(logparams, function (response) {
                    if (response != null && response.length > 0) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                welcome_screen_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    employeescreenurl: response[0].employeescreenurl,
                                    employerscreenurl: response[0].employerscreenurl,
                                    commonscreenurl: response[0].commonscreenurl
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                welcome_screen_json_result: {
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
                        welcome_screen_json_result: {
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
        logger.error("Error in Splash Load: " + e);
    }
}

exports.welcome_screen_app = function (req, res) {
    try {
        var objLogdetails;
        const dbo = MongoDB.getDB();
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Splash form load', logdate: new Date(), type: 'Employee' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objSplash.getWelcomeScreenURL(logparams, function (response) {
            dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                if (err) throw err;
                if (result != null && result.length > 0) {
                    var pc_eng = result[0].pc_eng
                    var pc_tam = result[0].pc_tam
                    if (response != null && response.length > 0) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                welcome_screen_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    employeescreenurl: response[0].employeescreenurl,
                                    employerscreenurl: response[0].employerscreenurl,
                                    commonscreenurl: response[0].commonscreenurl,
                                    pc_eng: pc_eng,
                                    pc_tam: pc_tam,
                                }
                            });
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                welcome_screen_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgtext
                                }
                            });
                        });
                    }

                }
            });

        });
    }
    catch (e) {
        logger.error("Error in Splash Load: " + e);
    }
}