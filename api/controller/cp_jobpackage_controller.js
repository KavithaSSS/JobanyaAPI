'use strict';
var get_jobpackage_details = require('../process/cp_jobpackage_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
// const {notvalidcode,createcode,listcode, existcode,updatecode,deletecode, recordnotfoundcode, successresponsecode,usernotfoundcode } = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.jobpackage_formload = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'jobpackage Form load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_jobpackage_details.getJobPackageFormLoadList(logparams, function (response) {
                    ////console.log(response);
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                jobpackage_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    languagelist: response[0],
                                    plantypelist: response[1],
                                    employerlist: response[2]
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                jobpackage_json_result: {
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
                        jobpackage_json_result: {
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
        { logger.error("Error in jobpackage formload: " + e); }
    }
}

function bigIntSerializer(num){
    return {
      type: "BigInt",
      value: num.toString()
    };
  }
exports.insert_jobpackage_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'jobpackage Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    get_jobpackage_details.checkJobPackageExists(logparams, req, function (rescode) {
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_jobpackage_details.getMaxcode(logparams, function (resp) {
                                    if (resp != null) {
                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                            var varMaxCode = resp;
                                            const params = { packagecode: parseInt(varMaxCode), employer: req.body.employer, packagevalidity: parseInt(req.body.packagevalidity), price: parseInt(req.body.price), allowedposts: parseInt(req.body.allowedposts), jobvalidity: parseInt(req.body.jobvalidity), allowedvacancies: parseInt(req.body.allowedvacancies), allowedprofiles_view: parseInt(req.body.allowedprofiles_view), allowedprofiles_shortlist: parseInt(req.body.allowedprofiles_shortlist), allowedcandidates_jobpost: parseInt(req.body.allowedcandidates_jobpost), allowedcandidates_employer: parseInt(req.body.allowedcandidates_employer),timesavailed: parseInt(req.body.timesavailed), plantypecode: parseInt(req.body.plantypecode), package: req.body.package, statuscode: 1, createddate: currenttime, updateddate: 0 };
                                            get_jobpackage_details.InsertJobPackageDetails(logparams, params, function (response) {
                                                if (response != null && response > 0) { 
                                                    if(req.body.package.length>0){
                                                        var packname = req.body.package.filter(t=>t.languagecode==2);
                                                        var getpackagename = packname[0].packagename;
                                                        var insertparams = {price: parseInt(req.body.price),package:getpackagename,
                                                            zohocode:req.body.zohocode };
                                                            console.log(req.body.zohocode,'zohocode');
                                                        //Add job package in zoho book item
                                                        get_jobpackage_details.createzohobookitem(insertparams, function (zohoresponse) {
                                                            if(zohoresponse){
                                                                if(zohoresponse.item){
                                                                    if(zohoresponse.item.item_id){ 
                                                                        console.log(zohoresponse.item.item_id,'jobpackage insert result');
                                                                        // var itemid =zohoresponse.item.item_id;
                                                                        // let expire = BigInt(itemid);
                                                                        // let newDoc = {
                                                                        //     expiry: bigIntSerializer(expire)
                                                                        // };
                                                                       
                                                                        // var updateparams=newDoc;
                                                                        var updateparams={zohoitemcode: zohoresponse.item.item_id};
                                                                        console.log(updateparams,'updateparams');
                                                                        get_jobpackage_details.updateJobPackageZohoItemCode(updateparams,parseInt(varMaxCode),function (updateresponse) {
                                                                            // console.log(updateresponse,'jobpackage insert result');
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                    const msgparam = { "messagecode": objConstants.createcode };
                                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                        return res.status(200).json({
                                                            jobpackage_insert_json_result: {
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
                                                            jobpackage_insert_json_result: {
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
                                        jobpackage_insert_json_result: {
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
                            jobpackage_insert_json_result: {
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
                        jobpackage_insert_json_result: {
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
        { logger.error("Error in Jobpackage insert: " + e); }
    }
}  
exports.update_jobpackage_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job package update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    if (req.query.packagecode != null) {
                        // get_jobpackage_details.checkJobPackageExistsByCode(logparams, req, function (resp) {
                        //     if (resp != null) {
                        //         var existscount = resp;
                        //         if (existscount == 0) {
                        get_jobpackage_details.checkpackagecodeExists(logparams, req, function (respo) {
                            if (respo != null) {
                                var codeexistscount = respo;
                                if (codeexistscount > 0) {
                                    get_jobpackage_details.checkJobPackageExistsByCode(logparams, req, function (resp) {
                                        if (resp != null) {
                                            var existscount = resp;
                                            if (existscount == 0) {
                                                get_jobpackage_details.getJobPackageSingleRecordDetails(logparams, req, function (respon) {
                                                    ////console.log(respon);
                                                    if (respon != null) {
                                                        const listdetails = respon;
                                                        // //console.log(listdetails);
                                                        if (listdetails != null) {
                                                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                                const params = { packagecode: parseInt(req.query.packagecode), 
                                                                    packagevalidity: parseInt(req.body.packagevalidity), 
                                                                    price: parseInt(req.body.price), allowedposts: parseInt(req.body.allowedposts), 
                                                                    jobvalidity: parseInt(req.body.jobvalidity), 
                                                                    allowedvacancies: parseInt(req.body.allowedvacancies), 
                                                                    allowedprofiles_view: parseInt(req.body.allowedprofiles_view), 
                                                                    allowedprofiles_shortlist: parseInt(req.body.allowedprofiles_shortlist), 
                                                                    allowedcandidates_jobpost: parseInt(req.body.allowedcandidates_jobpost), 
                                                                    allowedcandidates_employer: parseInt(req.body.allowedcandidates_employer), 
                                                                    plantypecode: parseInt(req.body.plantypecode),
                                                                    timesavailed: parseInt(req.body.timesavailed), package: req.body.package, 
                                                                    employer: req.body.employer, statuscode: parseInt(req.body.statuscode), updateddate: currenttime, makerid: listdetails[0].makerid, createddate: listdetails[0].createddate,zohoitemcode:listdetails[0].zohoitemcode };
                                                            	    get_jobpackage_details.updateJobPackageDetails(logparams, params, function (response) {
                                                                    if (response == true) {
                                                                       if(listdetails[0].zohoitemcode){
                                                                           console.log(listdetails[0].zohoitemcode,'listdetails[0].zohoitemcode')
                                                                        if(req.body.package.length>0){
                                                                            var packname = req.body.package.filter(t=>t.languagecode==2);
                                                                            var getpackagename = packname[0].packagename;
                                                                             var insertparams = {price: parseInt(req.body.price),package: getpackagename,
                                                                                zohocode:req.body.zohocode,zohoitemcode:listdetails[0].zohoitemcode };
                                                                                //Update job package in zoho book item
                                                                                get_jobpackage_details.updatezohobookitem(insertparams, function (zohoresponse) {
                                                                                    
                                                                                });
                                                                            }
                                                                       }else{
                                                                           if(req.body.package.length>0){
                                                                               var packname = req.body.package.filter(t=>t.languagecode==2);
                                                                               var getpackagename = packname[0].packagename;
                                                                               var insertparams = {price: parseInt(req.body.price),package:getpackagename,
                                                                                zohocode:req.body.zohocode };
                                                                                //Add job package in zoho book item
                                                                                get_jobpackage_details.createzohobookitem(insertparams, function (zohoresponse) {
                                                                                    if(zohoresponse){
                                                                                        if(zohoresponse.item){
                                                                                            if(zohoresponse.item.item_id){ 
                                                                                                var updateparams={zohoitemcode: zohoresponse.item.item_id};
                                                                                                get_jobpackage_details.updateJobPackageZohoItemCode(updateparams,parseInt(req.query.packagecode),function (updateresponse) {
                                                                                                    // console.log(updateresponse,'jobpackage insert result');
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                });
                                                                           }
                                                                            
                                                                         }

                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                            return res.status(200).json({
                                                                                jobpackage_update_json_result: {
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
                                                                                jobpackage_update_json_result: {
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
                                                                    jobpackage_update_json_result: {
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
                                                        jobpackage_update_json_result: {
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
                                            jobpackage_update_json_result: {
                                                varstatuscode: objConstants.notvalidcode,
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
                                jobpackage_update_json_result: {
                                    varstatuscode: objConstants.existcode,
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
                            jobpackage_update_json_result: {
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
                        jobpackage_update_json_result: {
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
        { logger.error("Error in Jobpackage Update: " + e); }
    }
}
exports.delete_jobpackage_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'jobpackage Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.packagecode != null) {
                    get_jobpackage_details.checkpackagecodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { packagecode: parseInt(req.query.packagecode) };
                                get_jobpackage_details.deleteJobPackageDetails(logparams, params, function (response) {
                                    if (response != null && response > 0) {
                                        const msgparam = { "messagecode": objConstants.deletecode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                jobpackage_delete_json_result: {
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
                                                jobpackage_delete_json_result: {
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
                                        jobpackage_delete_json_result: {
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
                            jobpackage_delete_json_result: {
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
                        jobpackage_delete_json_result: {
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
        { logger.error("Error in Delete Jobpackage: " + e); }
    }
}
exports.jobpackage_list_by_code = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'jobpackage List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.packagecode != null) {
                    const params = { packagecode: req.query.packagecode };
                    get_jobpackage_details.getJobPackageSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    jobpackage_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        jobpackagelist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    jobpackage_list_json_result: {
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
                            jobpackage_list_json_result: {
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
                        jobpackage_list_json_result: {
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
        { logger.error("Error in Jobpackage list by code: " + e); }
    }
}
exports.jobpackage_list = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Jobpackage List', logdate: new Date(), type: 'Employee' }
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
                            get_jobpackage_details.getJobPackageList(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.JobPackageCount, function (respon) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                jobpackage_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    tot_language_count: langresponse.length,
                                                    jobpackagelist: response,
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
                                            jobpackage_list_json_result: {
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
                                    jobpackage_list_json_result: {
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
                            jobpackage_list_json_result: {
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
                        jobpackage_list_json_result: {
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
        { logger.error("Error in Jobpackage List: " + e); }
    }
}

exports.insert_jobpackage_zohoitem_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'jobpackage Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                }); 
                if (req.body != null) {   
                    if(req.body.package.length>0){
                        var packname = req.body.package.filter(t=>t.languagecode==2);
                        var getpackagename = packname[0].packagename;
                        var insertparams = {price: parseInt(req.body.price),package:getpackagename,
                            zohocode:req.body.zohocode };
                        //Add job package in zoho book item
                        get_jobpackage_details.createzohobookitem(insertparams, function (zohoresponse) {
                            if(zohoresponse){
                                if(zohoresponse.item){
                                    if(zohoresponse.item.item_id){ 
                                        var updateparams={zohoitemcode: zohoresponse.item.item_id};
                                        get_jobpackage_details.updateJobPackageZohoItemCode(updateparams,parseInt(req.body.packagecode),function (updateresponse) {
                                            // console.log(updateresponse,'jobpackage insert result');
                                        });
                                    }
                                }
                            }
                        });
                    }
                    const msgparam = { "messagecode": objConstants.createcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            jobpackage_insert_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.createcode,
                                responsestring: msgtext
                            }
                        });
                        
                    });
                                       
                 }
                else {
                    const msgparam = { "messagecode": objConstants.existcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            jobpackage_insert_json_result: {
                                varstatuscode: objConstants.existcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext
                            }
                        });
                    });
                }     
            } else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        jobpackage_insert_json_result: {
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
        { logger.error("Error in Jobpackage insert: " + e); }
    }
}  