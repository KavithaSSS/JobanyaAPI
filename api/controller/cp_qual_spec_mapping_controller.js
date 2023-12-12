var get_quali_spec_mapping_details = require('../process/cp_qual_spec_mapping_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs'); 
exports.insert_quali_mapping_details =async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Mapping Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var mapcode = { "mappingcode": Number(req.query.mappingcode) };
                var insertitem = [];
                if (Number(req.query.mappingcode == 1)) {
                    objUtilities.InsertLog(logparams, function (validlog) {
                        if (validlog != null && validlog != "") {
                            get_quali_spec_mapping_details.CheckSpecializationCode(logparams, req, function (validcode) {
                                if (validcode != null && validcode.length > 0) {
                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                        for (var i = 0; i <= validcode.length - 1; i++) {                                        
                                            var params = {
                                                educationcategorycode: req.body.educationcategorycode,
                                                specializationcode: req.body.specializationcode,
                                                qualificationcode: validcode[i],
                                                mappingcode: Number(req.query.mappingcode),
                                                createddate: currenttime,
                                                updateddate: 0,
                                                makerid: validlog
                                            };
                                            insertitem.push(params);
                                        }
                                    });
                                    
                                    // //console.log(insertitem);
                                    get_quali_spec_mapping_details.InsertSpeci_mappingDetails(logparams, insertitem, function (validinserteditem) {
                                        if (validinserteditem != null && validinserteditem > 0) {
                                            const msgparam = { "messagecode": objConstants.createcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    mapping_json_result: {
                                                        response: objConstants.successresponsecode,
                                                        varstatuscode: objConstants.createcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                    }
                                                });

                                            });
                                        }
                                        else{
                                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    mapping_json_result: {
                                                        response: objConstants.successresponsecode,
                                                        varstatuscode: objConstants.recordnotfoundcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                    }
                                                });

                                            });
                                        }
                                    });

                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.existcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            mapping_json_result: {
                                                response: objConstants.successresponsecode,
                                                varstatuscode: objConstants.existcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });

                                    });
                                }
                            })
                        }
                    })
                }
                else if (Number(req.query.mappingcode == 2)) {
                    objUtilities.InsertLog(logparams, function (validlog) {
                        if (validlog != null && validlog != "") {
                            get_quali_spec_mapping_details.CheckQualificationcode(logparams, req, function (validcode) {
                                if (validcode != null && validcode.length > 0) {
                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                        for (var i = 0; i <= validcode.length - 1; i++) {                                        
                                            var params = {
                                                educationcategorycode: req.body.educationcategorycode,
                                                qualificationcode: req.body.qualificationcode,
                                                specializationcode: validcode[i],
                                                mappingcode: Number(req.query.mappingcode),
                                                createddate: currenttime,
                                                updateddate: 0,
                                                makerid: validlog
                                            };
                                            insertitem.push(params);
                                        }
                                    });
                                    
                                    ////console.log(insertitem);
                                    get_quali_spec_mapping_details.InsertSpeci_mappingDetails(logparams, insertitem, function (validinserteditem) {
                                        if (validinserteditem != null && validinserteditem > 0) {
                                            const msgparam = { "messagecode": objConstants.createcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    mapping_json_result: {
                                                        response: objConstants.successresponsecode,
                                                        varstatuscode: objConstants.createcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                    }
                                                });

                                            });
                                        }
                                        else{
                                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                    mapping_json_result: {
                                                        response: objConstants.successresponsecode,
                                                        varstatuscode: objConstants.recordnotfoundcode,
                                                        responsestring: msgresult[0].messagetext,
                                                        responsekey: msgresult[0].messagekey,
                                                    }
                                                });

                                            });
                                        }
                                    });

                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.existcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            mapping_json_result: {
                                                response: objConstants.successresponsecode,
                                                varstatuscode: objConstants.existcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                            }
                                        });

                                    });
                                }
                            })
                        }
                    })
                }
                else {
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            mapping_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });

                    });
                }

            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        mapping_json_result: {
                            response: objConstants.successresponsecode,
                            varstatuscode: objConstants.createcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });

                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Insert Mapping details - Mapping" + e);
    }
}
exports.quali_sepc_mapping_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Mapping List Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_quali_spec_mapping_details.Quali_spec_mapping_FormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                mapping_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    edu_list: response.categorylist,
                                    qualification_list: response.qualificationlist,
                                    specialization_list: response.specializationlist,
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                mapping_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                }
                            });
                        });
                    }
                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        mapping_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in Qual_spec_mapping Load: " + e); }
}
exports.update_quali_mapping_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Mapping Updation', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var deleteitem = [];
                // var item = [];
                if (Number(req.query.mappingcode == 1)) {
                    get_quali_spec_mapping_details.GetSpecilaizationSingledetails(logparams, req, function (validrecord) {
                        // //console.log(validrecord.length)
                        if (validrecord != null && validrecord.length > 0) {
                            get_quali_spec_mapping_details.CheckQualificationExistsInEmployee(logparams, validrecord, req, function (employeeresult) {
                                // //console.log(employeeresult);
                                get_quali_spec_mapping_details.CheckQualificationExistsInJobpost(logparams, validrecord, req, function (jobpostresult) {
                                    // //console.log(jobpostresult)
                                    if (employeeresult != null && employeeresult.length > 0) {
                                        deleteitem = validrecord.filter(
                                            function (e) {
                                                return this.indexOf(e) >= 0;
                                            },
                                            employeeresult
                                        );
                                    }
                                    if (jobpostresult != null && jobpostresult.length > 0) {
                                        deleteitem = deleteitem.filter(
                                            function (e) {
                                                return this.indexOf(e) >= 0;
                                            },
                                            jobpostresult
                                        );

                                    }
                                    if (deleteitem != null && deleteitem.length > 0) {
                                        var params = { "educationcategorycode": req.body.educationcategorycode, "specializationcode": req.body.specializationcode, "qualificationcode": { $in: deleteitem } };
                                        get_quali_spec_mapping_details.deleteQualificationcodedetails(logparams, params, function (deletedresult) {
                                            if (deletedresult != null && deletedresult > 0) {
                                                // //console.log(deletedresult);
                                                var newlist = validrecord.filter(
                                                    function (e) {
                                                        return this.indexOf(e) < 0;
                                                    },
                                                    deleteitem
                                                );
                                                // //console.log("NewList", newlist);
                                                var  qualification = req.body. qualification;
                                                var insertarray = qualification.filter(
                                                    function (e) {
                                                        return this.indexOf(e) < 0;
                                                    },
                                                    newlist
                                                );
                                                
                                                
                                                // //console.log(insertarray);
                                                objUtilities.InsertLog(logparams, function (validlog) {
                                                    var insertitem = [];
                                                    if (validlog != null && validlog != "") {
                                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                            for (var i = 0; i <= insertarray.length - 1; i++) {
                                                               var params = {
                                                                    educationcategorycode: req.body.educationcategorycode,
                                                                    specializationcode: req.body.specializationcode,
                                                                    qualificationcode: insertarray[i],
                                                                    mappingcode: Number(req.query.mappingcode),
                                                                    createddate: currenttime,
                                                                    updateddate: currenttime,
                                                                    makerid: validlog
                                                                };
                                                                insertitem.push(params);
                                                            }
                                                        });
                                                        
                                                        // //console.log(insertitem);

                                                        get_quali_spec_mapping_details.InsertSpeci_mappingDetails(logparams, insertitem, function (validinserteditem) {
                                                            if (validinserteditem != null && validinserteditem > 0) {
                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        mapping_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.updatecode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
                                                                        }
                                                                    });

                                                                });
                                                            }
                                                            else {
                                                                const msgparam = { "messagecode": objConstants.notvalidcode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        mapping_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
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
                                        objUtilities.InsertLog(logparams, function (validlog) {
                                            // var specialization = req.body.specialization;
                                            var insertitem = [];
                                            if (validlog != null && validlog != "") {
                                                get_quali_spec_mapping_details.CheckSpecializationCode(logparams, req, function (validcode) {
                                                    if (validcode != null && validcode.length > 0) {
                                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                            for (var i = 0; i <= validcode.length - 1; i++) {                                                            
                                                                var params = {
                                                                    educationcategorycode: req.body.educationcategorycode,
                                                                    specializationcode: req.body.specializationcode,
                                                                    qualificationcode: validcode[i],
                                                                    mappingcode: Number(req.query.mappingcode),
                                                                    createddate: currenttime,
                                                                    updateddate: currenttime,
                                                                    makerid: validlog
                                                                };
                                                                insertitem.push(params);
                                                            }
                                                        });
                                                        
                                                        // //console.log(insertitem);

                                                        get_quali_spec_mapping_details.InsertSpeci_mappingDetails(logparams, insertitem, function (validinserteditem) {
                                                            if (validinserteditem != null && validinserteditem > 0) {
                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        mapping_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.updatecode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
                                                                        }
                                                                    });

                                                                });
                                                            }
                                                            else {
                                                                const msgparam = { "messagecode": objConstants.notvalidcode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        mapping_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.notvalidcode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
                                                                        }
                                                                    });

                                                                });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        const msgparam = { "messagecode": objConstants.alreadyinusecode };
                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                            return res.status(200).json({
                                                                mapping_json_result: {
                                                                    response: objConstants.successresponsecode,
                                                                    varstatuscode: objConstants.alreadyinusecode,
                                                                    responsestring: msgresult[0].messagetext,
                                                                    responsekey: msgresult[0].messagekey,
                                                                }
                                                            });

                                                        });
                                                    }
                                                });

                                            }
                                        });
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });

                            });
                        }
                    })
                }
                else if (Number(req.query.mappingcode == 2)) {
                    get_quali_spec_mapping_details.GetQualificationSingledetails(logparams, req, function (validrecord) {
                        // //console.log(validrecord.length)
                        if (validrecord != null && validrecord.length > 0) {
                            get_quali_spec_mapping_details.CheckSpecializationExistsInEmployee(logparams, validrecord, req, function (employeeresult) {
                                // //console.log("used employee table",employeeresult);
                                get_quali_spec_mapping_details.CheckSpecializationExistsInJobpost(logparams, validrecord, req, function (jobpostresult) {
                                    // //console.log("used jobpost table",jobpostresult)
                                    if (employeeresult != null && employeeresult.length > 0) {
                                        deleteitem = validrecord.filter(
                                            function (e) {
                                                return this.indexOf(e) >= 0;
                                            },
                                            employeeresult
                                        );
                                    }
                                    // //console.log(deleteitem);
                                    if (jobpostresult != null && jobpostresult.length > 0) {
                                        deleteitem = deleteitem.filter(
                                            function (e) {
                                                return this.indexOf(e) >= 0;
                                            },
                                            jobpostresult
                                        );
                                    }
                                    // //console.log("Item", deleteitem);
                                    if (deleteitem != null && deleteitem.length > 0) {
                                        var params = { "educationcategorycode": req.body.educationcategorycode, "qualificationcode": req.body.qualificationcode, "specializationcode": { $in: deleteitem } };
                                        get_quali_spec_mapping_details.deleteSpecializationcodedetails(logparams, params, function (deletedresult) {
                                            if (deletedresult != null && deletedresult > 0) {
                                                // //console.log(deletedresult);
                                                var newlist = validrecord.filter(
                                                    function (e) {
                                                        return this.indexOf(e) < 0;
                                                    },
                                                    deleteitem
                                                );
                                                // //console.log("NewList", newlist);
                                                var specialization = req.body.specialization;
                                                var insertarray = specialization.filter(
                                                    function (e) {
                                                        return this.indexOf(e) < 0;
                                                    },
                                                    newlist
                                                );
                                                // //console.log(insertarray);
                                                objUtilities.InsertLog(logparams, function (validlog) {
                                                    var insertitem = [];
                                                    if (validlog != null && validlog != "") {
                                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                            for (var i = 0; i <= insertarray.length - 1; i++) {                                                            
                                                                var params = {
                                                                    educationcategorycode: req.body.educationcategorycode,
                                                                    qualificationcode: req.body.qualificationcode,
                                                                    specializationcode: insertarray[i],
                                                                    mappingcode: Number(req.query.mappingcode),
                                                                    createddate: currenttime,
                                                                    updateddate: currenttime,
                                                                    makerid: validlog
                                                                };
                                                                insertitem.push(params);
                                                            }
                                                        });
                                                        
                                                        // //console.log(insertitem);

                                                        get_quali_spec_mapping_details.InsertSpeci_mappingDetails(logparams, insertitem, function (validinserteditem) {
                                                            if (validinserteditem != null && validinserteditem > 0) {
                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        mapping_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.updatecode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
                                                                        }
                                                                    });

                                                                });
                                                            }
                                                            else {
                                                                const msgparam = { "messagecode": objConstants.notvalidcode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        mapping_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
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
                                        objUtilities.InsertLog(logparams, function (validlog) {
                                            // var specialization = req.body.specialization;
                                            var insertitem = [];
                                            if (validlog != null && validlog != "") {
                                                get_quali_spec_mapping_details.CheckQualificationcode(logparams, req, function (validcode) {
                                                    if (validcode != null && validcode.length > 0) {
                                                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                            for (var i = 0; i <= validcode.length - 1; i++) {                                                            
                                                                var params = {
                                                                    educationcategorycode: req.body.educationcategorycode,
                                                                    qualificationcode: req.body.qualificationcode,
                                                                    specializationcode: validcode[i],
                                                                    mappingcode: Number(req.query.mappingcode),
                                                                    createddate: currenttime,
                                                                    updateddate: currenttime,
                                                                    makerid: validlog
                                                                };
                                                                insertitem.push(params);
                                                            }
                                                        });
                                                        
                                                        // //console.log(insertitem);

                                                        get_quali_spec_mapping_details.InsertSpeci_mappingDetails(logparams, insertitem, function (validinserteditem) {
                                                            if (validinserteditem != null && validinserteditem > 0) {
                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        mapping_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.updatecode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
                                                                        }
                                                                    });

                                                                });
                                                            }
                                                            else {
                                                                const msgparam = { "messagecode": objConstants.notvalidcode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        mapping_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.notvalidcode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
                                                                        }
                                                                    });

                                                                });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        const msgparam = { "messagecode": objConstants.alreadyinusecode };
                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                            return res.status(200).json({
                                                                mapping_json_result: {
                                                                    response: objConstants.successresponsecode,
                                                                    varstatuscode: objConstants.alreadyinusecode,
                                                                    responsestring: msgresult[0].messagetext,
                                                                    responsekey: msgresult[0].messagekey,
                                                                }
                                                            });

                                                        });
                                                    }
                                                });

                                            }
                                        });
                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });

                            });
                        }
                    });

                }
                else {
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            mapping_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });

                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        mapping_json_result: {
                            response: objConstants.usernotfoundcode,
                            varstatuscode: objConstants.createcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });

                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Mapping details - Mapping" + e);
    }
}
exports.delete_qual_spec_mapping = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Mapping Deletion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (Number(req.query.mappingcode == 1)) {
                    get_quali_spec_mapping_details.GetSpecilaizationSingledetails(logparams, req, function (validrecord) {
                        // //console.log(validrecord.length)
                        if (validrecord != null && validrecord.length > 0) {
                            get_quali_spec_mapping_details.CheckQualificationNotExistsInEmployee(logparams, validrecord, req, function (employeeresult) {
                                ////console.log("Empresult", employeeresult);
                                get_quali_spec_mapping_details.CheckQualificationNotExistsInJobpost(logparams, validrecord, req, function (jobpostresult) {
                                    ////console.log("Jopresult", jobpostresult);
                                    if ((employeeresult == null || employeeresult.length == 0) && (jobpostresult == null || jobpostresult.length == 0)) {
                                        var params = {
                                            "educationcategorycode": req.body.educationcategorycode,
                                            "specializationcode": req.body.specializationcode
                                        };
                                        get_quali_spec_mapping_details.deleteSpecializationcodedetails(logparams, params, function (deletedresult) {
                                            if (deletedresult != null && deletedresult > 0) {
                                                const msgparam = { "messagecode": objConstants.deletecode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        mapping_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.deletecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });

                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        mapping_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });

                                                });
                                            }
                                        })
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.alreadyinusecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                mapping_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.alreadyinusecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                }
                                            });

                                        });
                                    }
                                });
                            })
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });

                            });
                        }
                    });

                }
                else if (Number(req.query.mappingcode == 2)) {
                    get_quali_spec_mapping_details.GetQualificationSingledetails(logparams, req, function (validrecord) {
                        // //console.log(validrecord.length)
                        if (validrecord != null && validrecord.length > 0) {
                            get_quali_spec_mapping_details.CheckSpecializationNotExistsInEmployee(logparams, validrecord, req, function (employeeresult) {
                                ////console.log("Empresult", employeeresult);
                                get_quali_spec_mapping_details.CheckSpecializationNotExistsInJobpost(logparams, validrecord, req, function (jobpostresult) {
                                    ////console.log("Jopresult", jobpostresult);
                                    if ((employeeresult == null || employeeresult.length == 0) && (jobpostresult == null || jobpostresult.length == 0)) {
                                        var params = {
                                            "educationcategorycode": req.body.educationcategorycode,
                                            "qualificationcode": req.body.qualificationcode
                                        };
                                        get_quali_spec_mapping_details.deleteQualificationcodedetails(logparams, params, function (deletedresult) {
                                            if (deletedresult != null && deletedresult > 0) {
                                                const msgparam = { "messagecode": objConstants.deletecode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        mapping_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.deletecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });

                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        mapping_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });

                                                });
                                            }
                                        })
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.alreadyinusecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                mapping_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.alreadyinusecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                }
                                            });

                                        });
                                    }
                                });
                            })
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });

                            });
                        }
                    });

                }
                else {
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            mapping_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });

                    });
                }

            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        mapping_json_result: {
                            response: objConstants.successresponsecode,
                            varstatuscode: objConstants.createcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });

                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Delete Mapping details - Mapping" + e);
    }
}
exports.quali_spec_mapping_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Mapping List Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (Number(req.query.mappingcode == 1)) {
                    get_quali_spec_mapping_details.SpecializationList(logparams, function (validlist) {
                        if (validlist != null && validlist.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        mappinglist: validlist
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });

                            });
                        }
                    })

                }
                else if (Number(req.query.mappingcode == 2)) {
                    get_quali_spec_mapping_details.QualificationList(logparams, function (validlist) {
                        if (validlist != null && validlist.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        mappinglist: validlist
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });

                            });
                        }
                    })
                }
                else {
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            mapping_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });

                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        mapping_json_result: {
                            response: objConstants.usernotfoundcode,
                            varstatuscode: objConstants.createcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });

                });
            }
        });
    }
    catch (e) {
        logger.error("Error in List of Specialization & Qualification - Mapping" + e);
    }
}
exports.quali_sepc_spec_List_by_code = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Mapping List Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (Number(req.query.mappingcode == 1)) {
                    get_quali_spec_mapping_details.SpecilaizationEditLoad(logparams,req, function (validlist) {
                        if (validlist != null && validlist.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        mappinglist: validlist
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });

                            });
                        }
                    })

                }
                else if (Number(req.query.mappingcode == 2)) {
                    get_quali_spec_mapping_details.QualificationEditLoad(logparams,req, function (validlist) {
                        if (validlist != null && validlist.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        mappinglist: validlist
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    mapping_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });

                            });
                        }
                    })
                }
                else {
                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            mapping_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });

                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        mapping_json_result: {
                            response: objConstants.usernotfoundcode,
                            varstatuscode: objConstants.createcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });

                });
            }
        });
    }
    catch (e) {
        logger.error("Error in List of Specialization & Qualification - Mapping" + e);
    }
}