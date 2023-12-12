'use strict';
var get_industry_details = require('../process/cp_industry_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
// const {notvalidcode,createcode,listcode, existcode,updatecode,deletecode, recordnotfoundcode, successresponsecode,usernotfoundcode } = require('../../config/constants');

const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.industry_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'industry form load list', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_industry_details.getIndutryFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                industry_json_result: {
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
                                industry_json_result: {
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
                        industry_json_result: {
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
        { logger.error("Error in Industry formload: " + e); }
    }
}
exports.insert_industry_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'industry Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    get_industry_details.checkIndustryNameExists(logparams, req, function (rescode) {
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_industry_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                            var varMaxCode = resp;
                                            const params = { industrycode: parseInt(varMaxCode), industry: req.body.industry, imageurl: req.body.imageurl, statuscode: 1, createddate: currenttime, updateddate: 0 };
                                            get_industry_details.InsertIndustryDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.createcode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            industry_insert_json_result: {
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
                                                            industry_insert_json_result: {
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
                                        industry_insert_json_result: {
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
                            industry_insert_json_result: {
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
                        industry_insert_json_result: {
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
        { logger.error("Error in Industry Insert: " + e); }
    }
}
exports.update_industry_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'industry update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.industrycode != null) {
                    if (req.body.statuscode != null && req.body.statuscode == objConstants.inactivestatus) {
                        const params = { industrycode: req.query.industrycode };
                        get_industry_details.checkIndustryCodeExistsInEmployer(logparams, params, function (employerresult) {
                            get_industry_details.checkIndustryCodeExistsInJobpost(logparams, params, function (jobpostresult) {
                                if ((employerresult == null || employerresult == 0) && (jobpostresult == null || jobpostresult == 0)) {
                                    get_industry_details.checkIndustryNameExistsByCode(logparams, req, function (resp) {
                                        if (resp != null) {
                                            var existscount = resp;
                                            if (existscount == 0) {
                                                get_industry_details.checkIndustryCodeExists(logparams, req, function (respo) {
                                                    if (respo != null) {
                                                        var codeexistscount = respo;
                                                        if (codeexistscount > 0) {
                                                            get_industry_details.getIndustrySingleRecordDetails(logparams, req, function (respon) {
                                                                if (respon != null) {
                                                                    const listdetails = respon;
                                                                    if (listdetails != null) {
                                                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                            const params = { industrycode: parseInt(req.query.industrycode), industry: req.body.industry, imageurl: req.body.imageurl, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                            get_industry_details.updateIndustryDetails(logparams, params, function (response) {
                                                                                if (response == true) {
                                                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                        return res.status(200).json({
                                                                                            industry_update_json_result: {
                                                                                                response: objConstants.successresponsecode,
                                                                                                varstatuscode: objConstants.updatecode,
                                                                                                responsestring: msgtext,
                                                                                                returncode: req.query.industrycode
                                                                                            }
                                                                                        });
                                                                                    });
                                                                                }
                                                                                else {
                                                                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                        return res.status(200).json({
                                                                                            industry_update_json_result: {
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
                                                                                industry_update_json_result: {
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
                                                                    industry_update_json_result: {
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
                                                        industry_update_json_result: {
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
                                            industry_update_json_result: {
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
                        get_industry_details.checkIndustryNameExistsByCode(logparams, req, function (resp) {
                            if (resp != null) {
                                var existscount = resp;
                                if (existscount == 0) {
                                    get_industry_details.checkIndustryCodeExists(logparams, req, function (respo) {
                                        if (respo != null) {
                                            var codeexistscount = respo;
                                            if (codeexistscount > 0) {
                                                get_industry_details.getIndustrySingleRecordDetails(logparams, req, function (respon) {
                                                    if (respon != null) {
                                                        const listdetails = respon;
                                                        if (listdetails != null) {
                                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                const params = { industrycode: parseInt(req.query.industrycode), industry: req.body.industry, imageurl: req.body.imageurl, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                get_industry_details.updateIndustryDetails(logparams, params, function (response) {
                                                                    if (response == true) {
                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                            return res.status(200).json({
                                                                                industry_update_json_result: {
                                                                                    response: objConstants.successresponsecode,
                                                                                    varstatuscode: objConstants.updatecode,
                                                                                    responsestring: msgtext,
                                                                                    returncode: req.query.industrycode
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                    else {
                                                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                            return res.status(200).json({
                                                                                industry_update_json_result: {
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
                                                                    industry_update_json_result: {
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
                                                        industry_update_json_result: {
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
                                            industry_update_json_result: {
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
                            industry_update_json_result: {
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
                        industry_update_json_result: {
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
        { logger.error("Error in Industry Update: " + e); }
    }
}
exports.update_industry_image_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'industry update image', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.industrycode != null) {
                    get_industry_details.checkIndustryCodeExists(logparams, req, function (respo) {
                        if (respo != null) {
                            var codeexistscount = respo;
                            if (codeexistscount > 0) {
                                get_industry_details.getIndustrySingleRecordDetails(logparams, req, function (respon) {
                                    if (respon != null) {
                                        const listdetails = respon;
                                        if (listdetails != null) {
                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                const params = { industrycode: parseInt(req.query.industrycode), industry: listdetails[0].industry, imageurl: req.body.imageurl, statuscode: listdetails[0].statuscode, updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                get_industry_details.updateIndustryDetails(logparams, params, function (response) {
                                                    if (response == true) {
                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                industry_update_json_result: {
                                                                    response: objConstants.successresponsecode,
                                                                    varstatuscode: objConstants.updatecode,
                                                                    responsestring: msgtext,
                                                                    returncode: req.query.industrycode
                                                                }
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                industry_update_json_result: {
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
                                                    industry_update_json_result: {
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
                                        industry_update_json_result: {
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
                            industry_update_json_result: {
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
                        industry_update_json_result: {
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
        { logger.error("Error in update industry image url: " + e); }
    }
}
exports.delete_industry_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'industry Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.industrycode != null) {
                    get_industry_details.checkIndustryCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { industrycode: req.query.industrycode };
                                get_industry_details.checkIndustryCodeExistsInEmployer(logparams, params, function (employerresult) {
                                    // //console.log(employerresult);
                                    get_industry_details.checkIndustryCodeExistsInJobpost(logparams, params, function (jobpostresult) {
                                        // //console.log(jobpostresult);
                                        if ((employerresult == null || employerresult == 0) && (jobpostresult == null || jobpostresult == 0)) {
                                            get_industry_details.deleteIndustryDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.deletecode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            industry_delete_json_result: {
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
                                                            industry_delete_json_result: {
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
                                                    industry_delete_json_result: {
                                                        varstatuscode: objConstants.alreadyinusecode,
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
                                        industry_delete_json_result: {
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
                            industry_delete_json_result: {
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
                        industry_delete_json_result: {
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
        { logger.error("Error in Industry Delete: " + e); }

    }
}
exports.industry_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Industry List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.industrycode != null) {
                    const params = { industrycode: req.query.industrycode };
                    get_industry_details.getIndustrySingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    industry_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        industrylist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    industry_list_json_result: {
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
                            industry_list_json_result: {
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
                        industry_list_json_result: {
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
        { logger.error("Error in Industry Edit Load: " + e); }
    }
}
exports.industry_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Industry List', logdate: new Date(), type: 'Employee' }
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
                            get_industry_details.getIndustryList(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.industrycount, function (respon) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                industry_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    tot_language_count: langresponse.length,
                                                    industryselfields: response,
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
                                            industry_list_json_result: {
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
                                    industry_list_json_result: {
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
                            industry_list_json_result: {
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
                        industry_list_json_result: {
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
        { logger.error("Error in Industry List " + e); }

    }
}