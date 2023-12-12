'use strict';
var get_district_details = require('../process/cp_district_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
//const {objConstants.notvalidcode,objConstants.objConstants.objConstants.alreadyinusecode, objConstants.objConstants.createcode,objConstants.listcode, objConstants.existcode,objConstants.updatecode,objConstants.deletecode, objConstants.recordnotfoundcode, objConstants.successresponsecode,objConstants.usernotfoundcode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.district_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'District Form load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_district_details.getDistrictFormLoadList(logparams, function (response) {
                    ////console.log(response);
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                district_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    languagelist: response[0],
                                    statelist: response[1]
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                district_json_result: {
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
                        district_json_result: {
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
        { logger.error("Error in District formload : " + e); }
    }
}
exports.insert_district_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'district Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    get_district_details.checkDistricteNameExists(logparams, req, function (rescode) {
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_district_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        var varMaxCode = resp;
                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                            const params = { districtcode: parseInt(varMaxCode), statecode: req.body.statecode, district: req.body.district, statuscode: 1, createddate: currenttime, updateddate: 0, isshowwebsite: parseInt(req.body.isshowwebsite) };
                                            get_district_details.InsertDistrictDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.createcode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            district_json_result: {
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
                                                            district_json_result: {
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
                                        district_json_result: {
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
                            district_json_result: {
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
                        district_json_result: {
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
        { logger.error("Error in District insert : " + e); }
    }
}
exports.update_district_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'district update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.districtcode != null) {
                    if (req.body.statuscode != null && req.body.statuscode == objConstants.inactivestatus) {
                        const params = { districtcode: req.query.districtcode };
                        get_district_details.checkDistrictCodeExistsInEmployer(logparams, req, function (employerres) {
                            // //console.log(employerres);
                            get_district_details.checkDistrictCodeExistsInEmployee(logparams, params, function (employeeres) {
                                // //console.log(employerres);
                                get_district_details.checkDistrictCodeExistsInOthers(logparams, params, function (existsresponse) {
                                    if ((existsresponse == null || existsresponse == 0) && (employeeres == null || employeeres == 0) && ((employerres == null || employerres == 0))) {
                                        get_district_details.checkStateCodeExistsInDistrict(logparams, params, function (response) {
                                            if (response[0].statecode == req.body.statecode) {
                                                get_district_details.checkDistrictNameExistsByCode(logparams, req, function (resp) {
                                                    if (resp != null) {
                                                        var existscount = resp;
                                                        if (existscount == 0) {
                                                            get_district_details.checkDistrictCodeExists(logparams, req, function (respo) {
                                                                if (respo != null) {
                                                                    var codeexistscount = respo;
                                                                    if (codeexistscount > 0) {
                                                                        get_district_details.getDistrictSingleRecordDetails(logparams, req, function (respon) {
                                                                            if (respon != null) {
                                                                                const listdetails = respon;
                                                                                if (listdetails != null) {
                                                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                                        const params = { districtcode: parseInt(req.query.districtcode), statecode: parseInt(req.body.statecode), district: req.body.district, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate, isshowwebsite: parseInt(req.body.isshowwebsite) };
                                                                                        get_district_details.updateDistrictDetails(logparams, params, function (response) {
                                                                                            if (response != null && response > 0) {
                                                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                                    return res.status(200).json({
                                                                                                        district_json_result: {
                                                                                                            response: objConstants.successresponsecode,
                                                                                                            varstatuscode: objConstants.updatecode,
                                                                                                            responsestring: msgtext,
                                                                                                            returncode: req.query.districtcode
                                                                                                        }
                                                                                                    });
                                                                                                });
                                                                                            }
                                                                                            else {
                                                                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                                    return res.status(200).json({
                                                                                                        district_json_result: {
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
                                                                                            district_json_result: {
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
                                                                                district_json_result: {
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
                                                                    district_json_result: {
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
                                                        district_json_result: {
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
                                        const msgparam = { "messagecode": objConstants.alreadyinuseupdatecode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                district_json_result: {
                                                    varstatuscode: objConstants.alreadyinuseupdatecode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgtext
                                                }
                                            });
                                        });
                                    }
                                });
                            });
                        });

                    }
                    else {
                        const params = { districtcode: req.query.districtcode };
                        get_district_details.checkDistrictNameExistsByCode(logparams, req, function (resp) {
                            if (resp != null) {
                                var existscount = resp;
                                if (existscount == 0) {
                                    get_district_details.checkDistrictCodeExists(logparams, req, function (respo) {
                                        if (respo != null) {
                                            var codeexistscount = respo;
                                            if (codeexistscount > 0) {
                                                get_district_details.getDistrictSingleRecordDetails(logparams, req, function (respon) {
                                                    if (respon != null) {
                                                        const listdetails = respon;
                                                        if (listdetails != null) {
                                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                const params = { districtcode: parseInt(req.query.districtcode), statecode: parseInt(req.body.statecode), district: req.body.district, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate, isshowwebsite: parseInt(req.body.isshowwebsite) };
                                                                get_district_details.updateDistrictDetails(logparams, params, function (response) {
                                                                    if (response != null && response > 0) {
                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                            return res.status(200).json({
                                                                                district_json_result: {
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
                                                                                district_json_result: {
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
                                                                    district_json_result: {
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
                                                        district_json_result: {
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
                                            district_json_result: {
                                                varstatuscode: objConstants.existcode,
                                                response: objConstants.successresponsecode,
                                                responsestring: msgtext
                                            }
                                        });
                                    });
                                }
                            }
                        });
                        /*get_district_details.checkDistrictCodeExistsInEmployer(logparams, req, function (employerres) {
                            ////console.log(employerres);
                            get_district_details.checkDistrictCodeExistsInEmployee(logparams, params, function (employeeres) {
                                // //console.log(employeeres);
                                get_district_details.checkDistrictCodeExistsInOthers(logparams, params, function (existsresponse) {
                                    ////console.log(existsresponse);
                                    if ((existsresponse != null && existsresponse.length > 0) && (employeeres != null && employeeres == 0) && ((employerres != null && employerres == 0))) {
                                        



                                    }
                                    else {
                                        get_district_details.checkStateCodeExistsInDistrict(logparams, params, function (response) {
                                            ////console.log(response[0].statecode);
                                            if (response[0].statecode == req.body.statecode) {
                                                get_district_details.checkDistrictNameExistsByCode(logparams, req, function (resp) {
                                                    if (resp != null) {
                                                        var existscount = resp;
                                                        if (existscount == 0) {
                                                            get_district_details.checkDistrictCodeExists(logparams, req, function (respo) {
                                                                if (respo != null) {
                                                                    var codeexistscount = respo;
                                                                    if (codeexistscount > 0) {
                                                                        get_district_details.getDistrictSingleRecordDetails(logparams, req, function (respon) {
                                                                            if (respon != null) {
                                                                                const listdetails = respon;
                                                                                if (listdetails != null) {
                                                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                                        const params = { districtcode: parseInt(req.query.districtcode), statecode: parseInt(req.body.statecode), district: req.body.district, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                                        get_district_details.updateDistrictDetails(logparams, params, function (response) {
                                                                                            if (response != null && response > 0) {
                                                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                                    return res.status(200).json({
                                                                                                        district_json_result: {
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
                                                                                                        district_json_result: {
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
                                                                                            district_json_result: {
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
                                                                                district_json_result: {
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
                                                                    district_json_result: {
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
                                                        district_json_result: {
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
                        });*/
                    }

                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            district_json_result: {
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
                        district_json_result: {
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
        { logger.error("Error in District update : " + e); }
    }
}
exports.delete_district_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'district Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.districtcode != null) {
                    get_district_details.checkDistrictCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { districtcode: req.query.districtcode };
                                get_district_details.checkDistrictCodeExistsInOthers(logparams, params, function (existsresponse) {
                                    if (existsresponse != null) {
                                        if (existsresponse == 0) {
                                            get_district_details.deleteDistrictDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.deletecode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            district_json_result: {
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
                                                            district_json_result: {
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
                                                    district_json_result: {
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
                                                district_json_result: {
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
                                        district_json_result: {
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
                            district_json_result: {
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
                        district_json_result: {
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
        { logger.error("Error in District Delete : " + e); }
    }
}
exports.district_list_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Designation List by code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.districtcode != null) {
                    const params = { districtcode: req.query.districtcode };
                    get_district_details.getDistrictSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    district_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        districtlist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    district_list_json_result: {
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
                            district_list_json_result: {
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
                        district_list_json_result: {
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
        { logger.error("Error in District Edit load : " + e); }
    }
}
exports.district_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'district List', logdate: new Date(), type: 'Employee' }
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
                        console.log('lang==>', langresponse)
                        if (langresponse != null) {
                            get_district_details.getDistrictList(logparams, params, langresponse.length, function (response) {
                                console.log('response==>', response)
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.distcount, function (respon) {
                                        // //console.log(respon);
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                district_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    tot_language_count: langresponse.length,
                                                    districtselfields: response,
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
                                            district_list_json_result: {
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
                                    district_list_json_result: {
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
                            district_list_json_result: {
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
                        district_list_json_result: {
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
        console.log('err', e)
        { logger.error("Error in District List : " + e); }
    }
}

exports.update_district_imageurl_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'District Image URL update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.districtcode != null && req.body != null) {
                    get_district_details.checkDistrictCodeExists(logparams, req, function (respo) {
                        if (respo != null) {
                            var codeexistscount = respo;
                            if (codeexistscount > 0) {
                                get_district_details.getDistrictSingleRecordDetails(logparams, req, function (respon) {
                                    if (respon != null) {
                                        const listdetails = respon;
                                        if (listdetails != null) {
                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                //const params = { districtcode: parseInt(req.query.districtcode), jobfunction: listdetails[0].jobfunction, imageurl: req.body.imageurl, statuscode: listdetails[0].statuscode, updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate, isshowwebsite: parseInt(req.body.isshowwebsite) };
                                                const params = { districtcode: parseInt(req.query.districtcode), statecode: parseInt(listdetails[0].statecode), imageurl: req.body.imageurl, district: listdetails[0].district, statuscode: parseInt(listdetails[0].statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate, isshowwebsite: parseInt(listdetails[0].isshowwebsite) };

                                                get_district_details.updateDistrictDetails(logparams, params, function (response) {
                                                    if (response == true) {
                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                district_json_result: {
                                                                    response: objConstants.successresponsecode,
                                                                    varstatuscode: objConstants.updatecode,
                                                                    responsestring: msgtext,
                                                                    returncode: req.query.districtcode
                                                                }
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                            return res.status(200).json({
                                                                district_json_result: {
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
                                                    district_json_result: {
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
                                        district_json_result: {
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
                            district_json_result: {
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
                        district_json_result: {
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
        logger.error("Error in District Update Image URL: " + e);
    }
}