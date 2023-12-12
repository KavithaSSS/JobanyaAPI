'use strict';
var get_city_details = require('../process/cp_city_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
//const {objConstants.notvalidcode,objConstants.createcode,objConstants.listcode, objConstants.existcode,objConstants.updatecode,deletecode, objConstants.recordnotfoundcode, objConstants.successresponsecode,objConstants.usernotfoundcode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.city_formload = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'City Form Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_city_details.getCityFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                city_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    languagelist: response[0],
                                    statelist: response[1],
                                    districtlist: response[2],
                                    taluklist: response[3]
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                city_json_result: {
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
                        city_json_result: {
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
        logger.error("Error in City Load: " + e);
    }
}
exports.insert_city_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'City details Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {

                    get_city_details.checkCityNameExists(logparams, req, function (rescode) {
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_city_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        var varMaxCode = resp;
                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                            const params = { citycode: parseInt(varMaxCode), districtcode: parseInt(req.body.districtcode), city: req.body.city, statuscode: 1, createddate: currenttime, updateddate: 0 };
                                            get_city_details.InsertCityDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.createcode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            city_insert_json_result: {
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
                                                            city_insert_json_result: {
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
                                        city_insert_json_result: {
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
                            city_insert_json_result: {
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
                        city_insert_json_result: {
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
        logger.error("Error in City Save: " + e);
    }
}
exports.update_city_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'city details update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    if (req.query.citycode != null) {
                        if (req.body.statuscode != null && req.body.statuscode == objConstants.inactivestatus) {
                            const params = { citycode: req.query.citycode };
                            get_city_details.checkCityCodeExistsInEmployer(logparams, params, function (employerresult) {
                                ////console.log(employerresult);
                                get_city_details.checkCityCodeExistsInEmployee(logparams, params, function (employeeresult) {
                                    ////console.log(employerresult);
                                    if ((employerresult == null || employerresult == 0) && (employeeresult == null || employeeresult == 0)) {
                                        get_city_details.checkDistrictCodeExistsInCity(logparams, params, function (result) {
                                            if (result[0].districtcode == req.body.districtcode) {
                                                get_city_details.checkCityNameExistsByCode(logparams, req, function (resp) {
                                                    if (resp != null) {
                                                        var existscount = resp;
                                                        if (existscount == 0) {
                                                            get_city_details.checkCityCodeExists(logparams, req, function (respo) {
                                                                if (respo != null) {
                                                                    var codeexistscount = respo;
                                                                    if (codeexistscount > 0) {
                                                                        get_city_details.getCitySingleRecordDetails(logparams, req, function (respon) {
                                                                            if (respon != null) {
                                                                                const listdetails = respon;
                                                                                if (listdetails != null) {
                                                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                                        const params = { citycode: parseInt(req.query.citycode), districtcode: parseInt(req.body.districtcode),talukcode: parseInt(req.body.talukcode), city: req.body.city, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                                        get_city_details.updateCityDetails(logparams, params, function (response) {
                                                                                            if (response != null && response > 0) {
                                                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                                    return res.status(200).json({
                                                                                                        city_update_json_result: {
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
                                                                                                        city_update_json_result: {
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
                                                                                            city_update_json_result: {
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
                                                                                city_update_json_result: {
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
                                                                    city_update_json_result: {
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
                                                        city_update_json_result: {
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
                                                city_update_json_result: {
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
                            const params = { citycode: req.query.citycode };
                            get_city_details.checkCityNameExistsByCode(logparams, req, function (resp) {
                                if (resp != null) {
                                    var existscount = resp;
                                    if (existscount == 0) {
                                        get_city_details.checkCityCodeExists(logparams, req, function (respo) {
                                            if (respo != null) {
                                                var codeexistscount = respo;
                                                if (codeexistscount > 0) {
                                                    get_city_details.getCitySingleRecordDetails(logparams, req, function (respon) {
                                                        if (respon != null) {
                                                            const listdetails = respon;
                                                            if (listdetails != null) {
                                                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                    const params = { citycode: parseInt(req.query.citycode), statecode: parseInt(req.body.statecode), districtcode: parseInt(req.body.districtcode),talukcode: parseInt(req.body.talukcode), city: req.body.city, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                    get_city_details.updateCityDetails(logparams, params, function (response) {
                                                                        if (response != null && response > 0) {
                                                                            const msgparam = { "messagecode": objConstants.updatecode };
                                                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                return res.status(200).json({
                                                                                    city_update_json_result: {
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
                                                                                    city_update_json_result: {
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
                                                                        city_update_json_result: {
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
                                                            city_update_json_result: {
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
                                                city_update_json_result: {
                                                    varstatuscode: objConstants.existcode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgtext
                                                }
                                            });
                                        });
                                    }
                                }
                            });
                            /*get_city_details.checkCityCodeExistsInEmployer(logparams, params, function (employerresult) {
                                // //console.log(employerresult);
                                get_city_details.checkCityCodeExistsInEmployee(logparams, params, function (employeeresult) {
                                    ////console.log(employeeresult);
                                    if ((employerresult == null || employerresult == 0) && (employeeresult == null || employeeresult == 0)) {
                                        
                                    }
                                    else {
                                        get_city_details.checkDistrictCodeExistsInCity(logparams, params, function (result) {
                                            ////console.log(result[0].districtcode);
                                            if (result[0].districtcode == req.body.districtcode) {
                                                get_city_details.checkCityNameExistsByCode(logparams, req, function (resp) {
                                                    if (resp != null) {
                                                        var existscount = resp;
                                                        if (existscount == 0) {
                                                            get_city_details.checkCityCodeExists(logparams, req, function (respo) {
                                                                if (respo != null) {
                                                                    var codeexistscount = respo;
                                                                    if (codeexistscount > 0) {
                                                                        get_city_details.getCitySingleRecordDetails(logparams, req, function (respon) {
                                                                            if (respon != null) {
                                                                                const listdetails = respon;
                                                                                if (listdetails != null) {
                                                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                                        const params = { citycode: parseInt(req.query.citycode), districtcode: parseInt(req.body.districtcode), city: req.body.city, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate };
                                                                                        get_city_details.updateCityDetails(logparams, params, function (response) {
                                                                                            if (response != null && response > 0) {
                                                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                                                    return res.status(200).json({
                                                                                                        city_update_json_result: {
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
                                                                                                        city_update_json_result: {
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
                                                                                            city_update_json_result: {
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
                                                                                city_update_json_result: {
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
                                                                    city_update_json_result: {
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
                                                        city_update_json_result: {
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
                                city_update_json_result: {
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
                            city_update_json_result: {
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
                        city_update_json_result: {
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
        logger.error("Error in City Update: " + e);
    }
}
exports.delete_city_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'City details Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.citycode != null) {
                    get_city_details.checkCityCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { citycode: req.query.citycode };
                                get_city_details.checkCityCodeExistsInEmployer(logparams, params, function (employerresult) {
                                    // //console.log(employerresult);
                                    get_city_details.checkCityCodeExistsInEmployee(logparams, params, function (employeeresult) {
                                        // //console.log(employeeresult);
                                        if ((employerresult == null || employerresult == 0) && (employeeresult == null || employeeresult == 0)) {
                                            get_city_details.deleteCityDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) {
                                                    const msgparam = { "messagecode": objConstants.deletecode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            city_delete_json_result: {
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
                                                            city_delete_json_result: {
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
                                                    city_delete_json_result: {
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
                                        city_delete_json_result: {
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
                            city_delete_json_result: {
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
                        city_delete_json_result: {
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
        logger.error("Error in City Delete: " + e);
    }
}
exports.city_list_by_code = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'City List by Code', logdate: new Date(), type: 'Employee' }

                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.citycode != null) {
                    const params = { citycode: req.query.citycode };
                    get_city_details.getCitySingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    city_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        citylist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    city_list_json_result: {
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
                            city_list_json_result: {
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
                        city_list_json_result: {
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
        logger.error("Error in City List by Code: " + e);
    }
}
exports.city_list = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'City List', logdate: new Date(), type: 'Employee' }
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
                            get_city_details.getCityList(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount("City", function (respon) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                city_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    tot_language_count: langresponse.length,
                                                    cityselfields: response,
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
                                            city_list_json_result: {
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
                                    city_list_json_result: {
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
                            city_list_json_result: {
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
                        city_list_json_result: {
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
        logger.error("Error in City List: " + e);
    }
}