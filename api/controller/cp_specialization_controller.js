'use strict';
var get_specializtion_details = require('../process/cp_specialization_process_controller');
const objUtilities = require('./utilities');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.insert_specialization_details = function (req, res) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Specialization Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    // //console.log("Entry")
                    get_specializtion_details.checkSpecializationNameExists(logparams, req, function (validname) {
                        // //console.log(validname)
                        if (validname != null && validname.length > 0) {
                            get_specializtion_details.InsertGroupLog(logparams, function (validgroupcode) {
                                if (validgroupcode != null && validgroupcode != "") {
                                    var groupmaxcode = validgroupcode;
                                    objUtilities.InsertLog(logparams, function (validlog) {
                                        if (validlog != null && validlog != "") {
                                            get_specializtion_details.getMaxcode(logparams, function (validmaxcode) {
                                                if (validmaxcode != null && validmaxcode != 0) {
                                                    var insertarray = [];
                                                    var educationcategorycode = req.body.educationcategorycode;
                                                    ////console.log(varMaxCode)
                                                    for (var i = 0; i <= educationcategorycode.length - 1; i++) {
                                                        var varMaxCode = validmaxcode + i;
                                                        var insertobject = {
                                                            "specializationcode": varMaxCode,
                                                            "educationcategorycode": educationcategorycode[i],
                                                            "specialization": req.body.specialization,
                                                            "statuscode": 1,
                                                            "createddate": milliseconds,
                                                            "updateddate": 0,
                                                            "groupcode": groupmaxcode,
                                                            "makerid": validlog
                                                        }
                                                        ////console.log(insertobject)
                                                        insertarray.push(insertobject);
                                                    }
                                                    get_specializtion_details.InsertSpecializationDetails(logparams, insertarray, function (response) {
                                                        if (response != null && response > 0) {
                                                            const msgparam = { "messagecode": objConstants.createcode };
                                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                return res.status(200).json({
                                                                    Specialization_json_result: {
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
                                            });
                                        }

                                    })
                                }
                            })
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.existcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    Specialization_json_result: {
                                        varstatuscode: objConstants.existcode,
                                        response: objConstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });
                            });
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            Specialization_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
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
                        Specialization_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in specialization insert : " + e); }
    }
}
exports.delete_specialization_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Specialization Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_specializtion_details.FindGroupcode(logparams, req, function (validcode) {
                    if (validcode != null) {
                        var code = validcode;
                        get_specializtion_details.Findspecializationcode(logparams, code, function (validcount) {
                            if (validcount != null && validcount.length > 0) {
                                get_specializtion_details.DeleteSpecialization(logparams, validcount, function (response) {
                                    if (response == true) {
                                        const msgparam = { "messagecode": objConstants.deletecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                Specialization_json_result: {
                                                    varstatuscode: objConstants.deletecode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                }
                                            });
                                        });
                                    }
                                })
                            }
                            else {
                                const msgparam = { "messagecode": objConstants.existcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        Specialization_json_result: {
                                            varstatuscode: objConstants.existcode,
                                            response: objConstants.successresponsecode,
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
                                Specialization_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
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
                        Specialization_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in Specialization Delete : " + e); }
    }
}
exports.specialization_formload = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'specialization List Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_specializtion_details.SpecializationFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                Specialization_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    language_list: response.languagelist,
                                    education_category_list: response.categorylist,
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                Specialization_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    response: objConstants.successresponsecode,
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
                        Specialization_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in Specialization Form Load: " + e); }
}
exports.specialization_list_by_code = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Specialization List by Code', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body.groupcode != null) {
                    get_specializtion_details.SpecializationEditload(logparams, req, function (response) {
                        ////console.log(response);
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    Specialization_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        specializationList: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    Specialization_json_result: {
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        response: objConstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });
                            });
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            Specialization_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
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
                        Specialization_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) { logger.error("Error in Specialization List by Code: " + e); }
}
exports.specialization_list = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Specialization List', logdate: new Date(), type: 'Employee' }
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
                            get_specializtion_details.SpecializationList(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.specializationcount, function (specialicount) {
                                        ////console.log(specialicount);
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                Specialization_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    activecount: specialicount[0],
                                                    inactivecount: specialicount[1],
                                                    totcount: specialicount[2],
                                                    tot_language_count: langresponse.length,
                                                    specializationlist: response,
                                                    languageslist:langresponse
                                                }
                                            });

                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            Specialization_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                response: objConstants.successresponsecode,
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
                                    Specialization_json_result: {
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        response: objConstants.successresponsecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                    }
                                });
                            });
                        }
                    });
                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            Specialization_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
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
                        Specialization_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in Specialization List : " + e); }
    }
}
exports.update_specialization_details = function (req, res) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Specialization Update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body.groupcode != null && req.body.groupcode.length>0) {
                    if (req.body.statuscode != null && req.body.statuscode == objConstants.inactivestatus) {
                        get_specializtion_details.FindGroupcode(logparams, req, function (validcode) {
                            if (validcode != null) {
                                var code = validcode;
                                get_specializtion_details.SpecializationcodeExistsInMapping(logparams, code, function (validcount) {
                                    if (validcount == null ||  validcount == 0) {
                                        get_specializtion_details.GetSpecializationSingleDetails(logparams, req, function (validrecord) {

                                            if (validrecord != null && validrecord.length > 0) {
                                                var categorycode = validrecord[0].educationcategorycode;
                                                var newcategorycode = req.body.educationcategorycode;

                                                // //console.log(categorycode);
                                                // //console.log(newcategorycode)
                                                get_specializtion_details.Duplicatecheck(logparams, req, function (duplicatecheck) {
                                                    // //console.log(duplicatecheck)
                                                    if (duplicatecheck > 0) {
                                                        const msgparam = { "messagecode": objConstants.existcode };
                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                            return res.status(200).json({
                                                                Specialization_json_result: {
                                                                    varstatuscode: objConstants.existcode,
                                                                    response: objConstants.successresponsecode,
                                                                    responsestring: msgresult[0].messagetext,
                                                                    responsekey: msgresult[0].messagekey,
                                                                }
                                                            });
                                                        });
                                                    }

                                                    else {
                                                        var deletedcategorylist = categorycode.filter(
                                                            function (e) {
                                                                return this.indexOf(e) < 0;
                                                            },
                                                            newcategorycode
                                                        );
                                                        // //console.log("Deleteditem", deletedcategorylist);
                                                        var insertedcategorylist = newcategorycode.filter(
                                                            function (e) {
                                                                return this.indexOf(e) < 0;
                                                            },
                                                            categorycode
                                                        );
                                                        // //console.log("Inserteditem", insertedcategorylist);
                                                        var insertitem = [];
                                                        if (deletedcategorylist != null && deletedcategorylist.length > 0) {
                                                            get_specializtion_details.CheckspecializationExitingMapping(logparams, req, deletedcategorylist, function (response) {
                                                                // //console.log("Mapping", response);
                                                                if (response != null && response.length > 0) {
                                                                    var params = { "groupcode": {$in:req.body.groupcode}, specializationcode: { $in: response } };
                                                                    get_specializtion_details.DeleteSpecializationCode(logparams, params, function (deletevalue) {
                                                                        // //console.log("deletevalue",deletevalue);
                                                                        if (deletevalue != null && deletevalue > 0) {
                                                                            // //console.log("Entry")
                                                                            if (insertedcategorylist != null && insertedcategorylist.length > 0) {
                                                                                objUtilities.InsertLog(logparams, function (validlog) {
                                                                                    // //console.log(validlog);
                                                                                    if (validlog != null && validlog != "") {
                                                                                        get_specializtion_details.getMaxcode(logparams, function (validmax) {
                                                                                            // //console.log(validmax);
                                                                                            if (validmax != null && validmax != 0) {
                                                                                                var groupobj = req.body.groupcode;
                                                                                                for (var i = 0; i <= insertedcategorylist.length - 1; i++) {
                                                                                                    var maxcode = validmax + i;
                                                                                                    var Specializationlist = {
                                                                                                        "specializationcode": maxcode,
                                                                                                        "specialization": req.body.specialization,
                                                                                                        "educationcategorycode": insertedcategorylist[i],
                                                                                                        "statuscode": parseInt(req.body.statuscode),
                                                                                                        "createddate": milliseconds,
                                                                                                        "updateddate": 0,
                                                                                                        "groupcode": Number(groupobj[0]),
                                                                                                        "makerid": validlog
                                                                                                    }
                                                                                                    insertitem.push(Specializationlist);
                                                                                                    // //console.log(insertitem);
                                                                                                }

                                                                                                get_specializtion_details.InsertSpecializationDetails(logparams, insertitem, function (response) {
                                                                                                    // //console.log(response);
                                                                                                    if (response != null && response > 0) {
                                                                                                        var params = { "groupcode": {$in:req.body.groupcode} };
                                                                                                        var updateitem = [];
                                                                                                        get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                                                            if (validrecord != null && validrecord.length > 0) {
                                                                                                                var groupobj = req.body.groupcode;
                                                                                                                for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                                                    var params = {
                                                                                                                        specializationcode: validrecord[i].specializationcode,
                                                                                                                        groupcode: Number(groupobj[0]),
                                                                                                                        specialization: req.body.specialization,
                                                                                                                        statuscode: parseInt(req.body.statuscode),
                                                                                                                        educationcategorycode: validrecord[i].educationcategorycode,
                                                                                                                        updateddate: milliseconds,
                                                                                                                        makerid: validlog,
                                                                                                                        createddate: validrecord[i].createddate
                                                                                                                    };
                                                                                                                    updateitem.push(params);
                                                                                                                }

                                                                                                                get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                                                    if (validdata != null && validdata > 0) {
                                                                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                                                            return res.status(200).json({
                                                                                                                                Specialization_json_result: {
                                                                                                                                    varstatuscode: objConstants.updatecode,
                                                                                                                                    response: objConstants.successresponsecode,
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
                                                                                                                                Specialization_json_result: {
                                                                                                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                                                                                                    response: objConstants.successresponsecode,
                                                                                                                                    responsestring: msgresult[0].messagetext,
                                                                                                                                    responsekey: msgresult[0].messagekey,
                                                                                                                                }
                                                                                                                            });
                                                                                                                        });
                                                                                                                    }
                                                                                                                });
                                                                                                            }
                                                                                                        })


                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                            else {
                                                                                // //console.log("Entry");
                                                                                objUtilities.InsertLog(logparams, function (validlog) {
                                                                                    if (validlog != null && validlog != "") {
                                                                                        var params = { "groupcode": {$in:req.body.groupcode} };
                                                                                        var updateitem = [];
                                                                                        get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                                            if (validrecord != null && validrecord.length > 0) {
                                                                                                var groupobj = req.body.groupcode;
                                                                                                for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                                    var params = {
                                                                                                        specializationcode: validrecord[i].specializationcode,
                                                                                                        groupcode: Number(groupobj[0]),
                                                                                                        specialization: req.body.specialization,
                                                                                                        statuscode: parseInt(req.body.statuscode),
                                                                                                        educationcategorycode: validrecord[i].educationcategorycode,
                                                                                                        updateddate: milliseconds,
                                                                                                        makerid: validlog,
                                                                                                        createddate: validrecord[i].createddate
                                                                                                    };
                                                                                                    updateitem.push(params);
                                                                                                }
                                                                                                get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                                    if (validdata != null && validdata > 0) {
                                                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                                            return res.status(200).json({
                                                                                                                Specialization_json_result: {
                                                                                                                    varstatuscode: objConstants.updatecode,
                                                                                                                    response: objConstants.successresponsecode,
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
                                                                                                                Specialization_json_result: {
                                                                                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                                                                                    response: objConstants.successresponsecode,
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
                                                                        }

                                                                    });
                                                                }
                                                                else if (insertedcategorylist != null && insertedcategorylist.length > 0) {
                                                                    // //console.log("Entry");
                                                                    objUtilities.InsertLog(logparams, function (validlog) {
                                                                        // //console.log(validlog);
                                                                        if (validlog != null && validlog != "") {
                                                                            get_specializtion_details.getMaxcode(logparams, function (validmax) {
                                                                                // //console.log(validmax);
                                                                                if (validmax != null && validmax != 0) {
                                                                                    var groupobj = req.body.groupcode;
                                                                                    for (var i = 0; i <= insertedcategorylist.length - 1; i++) {
                                                                                        var maxcode = validmax + i;
                                                                                        var Specializationlist = {
                                                                                            "specializationcode": maxcode,
                                                                                            "specialization": req.body.specialization,
                                                                                            "educationcategorycode": insertedcategorylist[i],
                                                                                            "statuscode": parseInt(req.body.statuscode),
                                                                                            "createddate": milliseconds,
                                                                                            "groupcode": Number(groupobj[0]),
                                                                                            "updateddate": 0,
                                                                                            "makerid": validlog
                                                                                        }
                                                                                        // //console.log(Specializationlist)
                                                                                        insertitem.push(Specializationlist);
                                                                                    }
                                                                                    // //console.log(insertitem);
                                                                                    get_specializtion_details.InsertSpecializationDetails(logparams, insertitem, function (response) {
                                                                                        if (response != null && response > 0) {
                                                                                            // //console.log("InsertedItem", response);
                                                                                            var params = { "groupcode": {$in:req.body.groupcode} };
                                                                                            var updateitem = [];
                                                                                            get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                                                if (validrecord != null && validrecord.length > 0) {
                                                                                                    var groupobj = req.body.groupcode;
                                                                                                    for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                                        var params = {
                                                                                                            specializationcode: validrecord[i].specializationcode,
                                                                                                            groupcode: Number(groupobj[0]),
                                                                                                            specialization: req.body.specialization,
                                                                                                            statuscode: parseInt(req.body.statuscode),
                                                                                                            educationcategorycode: validrecord[i].educationcategorycode,
                                                                                                            updateddate: milliseconds,
                                                                                                            makerid: validlog,
                                                                                                            createddate: validrecord[i].createddate
                                                                                                        };
                                                                                                        updateitem.push(params);
                                                                                                    }


                                                                                                    get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                                        if (validdata != null && validdata > 0) {
                                                                                                            const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                                                return res.status(200).json({
                                                                                                                    Specialization_json_result: {
                                                                                                                        varstatuscode: objConstants.updatecode,
                                                                                                                        response: objConstants.successresponsecode,
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
                                                                                                                    Specialization_json_result: {
                                                                                                                        varstatuscode: objConstants.recordnotfoundcode,
                                                                                                                        response: objConstants.successresponsecode,
                                                                                                                        responsestring: msgresult[0].messagetext,
                                                                                                                        responsekey: msgresult[0].messagekey,
                                                                                                                    }
                                                                                                                });
                                                                                                            });
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            })

                                                                                        }
                                                                                    });

                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    // //console.log("Entry");
                                                                    objUtilities.InsertLog(logparams, function (validlog) {
                                                                        if (validlog != null && validlog != "") {
                                                                            var params = { "groupcode": {$in:req.body.groupcode} };
                                                                            var updateitem = [];
                                                                            get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                                if (validrecord != null && validrecord.length > 0) {
                                                                                    var groupobj = req.body.groupcode;
                                                                                    for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                        var params = {
                                                                                            specializationcode: validrecord[i].specializationcode,
                                                                                            groupcode: Number(groupobj[0]),
                                                                                            specialization: req.body.specialization,
                                                                                            statuscode: parseInt(req.body.statuscode),
                                                                                            educationcategorycode: validrecord[i].educationcategorycode,
                                                                                            updateddate: milliseconds,
                                                                                            makerid: validlog,
                                                                                            createddate: validrecord[i].createddate
                                                                                        };
                                                                                        updateitem.push(params);
                                                                                    }

                                                                                    get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                        if (validdata != null && validdata > 0) {
                                                                                            const msgparam = { "messagecode": objConstants.updatecode };
                                                                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                                return res.status(200).json({
                                                                                                    Specialization_json_result: {
                                                                                                        varstatuscode: objConstants.updatecode,
                                                                                                        response: objConstants.successresponsecode,
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
                                                                                                    Specialization_json_result: {
                                                                                                        varstatuscode: objConstants.recordnotfoundcode,
                                                                                                        response: objConstants.successresponsecode,
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

                                                            });
                                                        }
                                                        else if (insertedcategorylist != null && insertedcategorylist.length > 0) {
                                                            // //console.log("Entry");
                                                            objUtilities.InsertLog(logparams, function (validlog) {
                                                                // //console.log(validlog);
                                                                if (validlog != null && validlog != "") {
                                                                    get_specializtion_details.getMaxcode(logparams, function (validmax) {
                                                                        // //console.log(validmax);
                                                                        if (validmax != null && validmax != 0) {
                                                                            var groupobj = req.body.groupcode;
                                                                            for (var i = 0; i <= insertedcategorylist.length - 1; i++) {
                                                                                var maxcode = validmax + i;
                                                                                var Specializationlist = {
                                                                                    "specializationcode": maxcode,
                                                                                    "specialization": req.body.specialization,
                                                                                    "educationcategorycode": insertedcategorylist[i],
                                                                                    "statuscode": parseInt(req.body.statuscode),
                                                                                    "createddate": milliseconds,
                                                                                    "groupcode": Number(groupobj[0]),
                                                                                    "updateddate": 0,
                                                                                    "makerid": validlog
                                                                                }
                                                                                // //console.log(Specializationlist)
                                                                                insertitem.push(Specializationlist);
                                                                            }
                                                                            // //console.log(insertitem);
                                                                            get_specializtion_details.InsertSpecializationDetails(logparams, insertitem, function (response) {
                                                                                if (response != null && response > 0) {
                                                                                    // //console.log(response)

                                                                                    var params = { "groupcode":  {$in:req.body.groupcode}};
                                                                                    var updateitem = [];
                                                                                    get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                                        if (validrecord != null && validrecord.length > 0) {
                                                                                            var groupobj = req.body.groupcode;
                                                                                            for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                                var params = {
                                                                                                    specializationcode: validrecord[i].specializationcode,
                                                                                                    groupcode: Number(groupobj[0]),
                                                                                                    specialization: req.body.specialization,
                                                                                                    statuscode: parseInt(req.body.statuscode),
                                                                                                    educationcategorycode: validrecord[i].educationcategorycode,
                                                                                                    updateddate: milliseconds,
                                                                                                    makerid: validlog,
                                                                                                    createddate: validrecord[i].createddate
                                                                                                };
                                                                                                updateitem.push(params);
                                                                                            }
                                                                                            // //console.log(updateitem);


                                                                                            get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                                if (validdata != null && validdata > 0) {
                                                                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                                        return res.status(200).json({
                                                                                                            Specialization_json_result: {
                                                                                                                varstatuscode: objConstants.updatecode,
                                                                                                                response: objConstants.successresponsecode,
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
                                                                                                            Specialization_json_result: {
                                                                                                                varstatuscode: objConstants.recordnotfoundcode,
                                                                                                                response: objConstants.successresponsecode,
                                                                                                                responsestring: msgresult[0].messagetext,
                                                                                                                responsekey: msgresult[0].messagekey,
                                                                                                            }
                                                                                                        });
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    })

                                                                                }
                                                                            });

                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            // //console.log("Entry");
                                                            objUtilities.InsertLog(logparams, function (validlog) {
                                                                if (validlog != null && validlog != "") {
                                                                    var params = { "groupcode": {$in:req.body.groupcode} };
                                                                    var updateitem = [];
                                                                    get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                        if (validrecord != null && validrecord.length > 0) {
                                                                            var groupobj = req.body.groupcode;
                                                                            for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                var params = {
                                                                                    specializationcode: validrecord[i].specializationcode,
                                                                                    groupcode: Number(groupobj[0]),
                                                                                    specialization: req.body.specialization,
                                                                                    statuscode: parseInt(req.body.statuscode),
                                                                                    educationcategorycode: validrecord[i].educationcategorycode,
                                                                                    updateddate: milliseconds,
                                                                                    makerid: validlog,
                                                                                    createddate: validrecord[i].createddate
                                                                                };
                                                                                updateitem.push(params);
                                                                            }
                                                                            get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                if (validdata != null && validdata > 0) {
                                                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                        return res.status(200).json({
                                                                                            Specialization_json_result: {
                                                                                                varstatuscode: objConstants.updatecode,
                                                                                                response: objConstants.successresponsecode,
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
                                                                                            Specialization_json_result: {
                                                                                                varstatuscode: objConstants.recordnotfoundcode,
                                                                                                response: objConstants.successresponsecode,
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
                                                    }
                                                });

                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                    return res.status(200).json({
                                                        Specialization_json_result: {
                                                            varstatuscode: objConstants.recordnotfoundcode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgresult[0].messagetext,
                                                            responsekey: msgresult[0].messagekey,
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.alreadyinuseupdatecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                Specialization_json_result: {
                                                    varstatuscode: objConstants.alreadyinuseupdatecode,
                                                    response: objConstants.successresponsecode,
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
                    else {
                        get_specializtion_details.GetSpecializationSingleDetails(logparams, req, function (validrecord) {

                            if (validrecord != null && validrecord.length > 0) {
                                var categorycode = validrecord[0].educationcategorycode;
                                var newcategorycode = req.body.educationcategorycode;

                                // //console.log(categorycode);
                                // //console.log(newcategorycode)
                                get_specializtion_details.Duplicatecheck(logparams, req, function (duplicatecheck) {
                                    //console.log(duplicatecheck)
                                    if (duplicatecheck > 0) {
                                        const msgparam = { "messagecode": objConstants.existcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                Specialization_json_result: {
                                                    varstatuscode: objConstants.existcode,
                                                    response: objConstants.successresponsecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                }
                                            });
                                        });
                                    }

                                    else {
                                        var deletedcategorylist = categorycode.filter(
                                            function (e) {
                                                return this.indexOf(e) < 0;
                                            },
                                            newcategorycode
                                        );
                                        // //console.log("Deleteditem", deletedcategorylist);
                                        var insertedcategorylist = newcategorycode.filter(
                                            function (e) {
                                                return this.indexOf(e) < 0;
                                            },
                                            categorycode
                                        );
                                        // //console.log("Inserteditem", insertedcategorylist);
                                        var insertitem = [];
                                        if (deletedcategorylist != null && deletedcategorylist.length > 0) {
                                            get_specializtion_details.CheckspecializationExitingMapping(logparams, req, deletedcategorylist, function (response) {
                                                // //console.log("Mapping", response);
                                                if (response != null && response.length > 0) {
                                                    var params = { "groupcode": {$in:req.body.groupcode}, specializationcode: { $in: response } };
                                                    get_specializtion_details.DeleteSpecializationCode(logparams, params, function (deletevalue) {
                                                        // //console.log("deletevalue",deletevalue);
                                                        if (deletevalue != null && deletevalue > 0) {
                                                            // //console.log("Entry")
                                                            if (insertedcategorylist != null && insertedcategorylist.length > 0) {
                                                                objUtilities.InsertLog(logparams, function (validlog) {
                                                                    // //console.log(validlog);
                                                                    if (validlog != null && validlog != "") {
                                                                        get_specializtion_details.getMaxcode(logparams, function (validmax) {
                                                                            // //console.log(validmax);
                                                                            if (validmax != null && validmax != 0) {
                                                                                var groupobj = req.body.groupcode;
                                                                                for (var i = 0; i <= insertedcategorylist.length - 1; i++) {
                                                                                    var maxcode = validmax + i;
                                                                                    var Specializationlist = {
                                                                                        "specializationcode": maxcode,
                                                                                        "specialization": req.body.specialization,
                                                                                        "educationcategorycode": insertedcategorylist[i],
                                                                                        "statuscode": parseInt(req.body.statuscode),
                                                                                        "createddate": milliseconds,
                                                                                        "updateddate": 0,
                                                                                        "groupcode": Number(groupobj[0]),
                                                                                        "makerid": validlog
                                                                                    }
                                                                                    insertitem.push(Specializationlist);
                                                                                    // //console.log(insertitem);
                                                                                }

                                                                                get_specializtion_details.InsertSpecializationDetails(logparams, insertitem, function (response) {
                                                                                    // //console.log(response);
                                                                                    if (response != null && response > 0) {
                                                                                        var params = { "groupcode":  {$in:req.body.groupcode}};
                                                                                        var updateitem = [];
                                                                                        get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                                            if (validrecord != null && validrecord.length > 0) {
                                                                                                var groupobj = req.body.groupcode;
                                                                                                for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                                    var params = {
                                                                                                        specializationcode: validrecord[i].specializationcode,
                                                                                                        groupcode: Number(groupobj[0]),
                                                                                                        specialization: req.body.specialization,
                                                                                                        statuscode: parseInt(req.body.statuscode),
                                                                                                        educationcategorycode: validrecord[i].educationcategorycode,
                                                                                                        updateddate: milliseconds,
                                                                                                        makerid: validlog,
                                                                                                        createddate: validrecord[i].createddate
                                                                                                    };
                                                                                                    updateitem.push(params);
                                                                                                }

                                                                                                get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                                    if (validdata != null && validdata > 0) {
                                                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                                            return res.status(200).json({
                                                                                                                Specialization_json_result: {
                                                                                                                    varstatuscode: objConstants.updatecode,
                                                                                                                    response: objConstants.successresponsecode,
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
                                                                                                                Specialization_json_result: {
                                                                                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                                                                                    response: objConstants.successresponsecode,
                                                                                                                    responsestring: msgresult[0].messagetext,
                                                                                                                    responsekey: msgresult[0].messagekey,
                                                                                                                }
                                                                                                            });
                                                                                                        });
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        })


                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                            else {
                                                                // //console.log("Entry");
                                                                objUtilities.InsertLog(logparams, function (validlog) {
                                                                    if (validlog != null && validlog != "") {
                                                                        var params = { "groupcode":  {$in:req.body.groupcode} };
                                                                        var updateitem = [];
                                                                        get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                            if (validrecord != null && validrecord.length > 0) {
                                                                                var groupobj = req.body.groupcode;
                                                                                for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                    var params = {
                                                                                        specializationcode: validrecord[i].specializationcode,
                                                                                        groupcode: Number(groupobj[0]),
                                                                                        specialization: req.body.specialization,
                                                                                        statuscode: parseInt(req.body.statuscode),
                                                                                        educationcategorycode: validrecord[i].educationcategorycode,
                                                                                        updateddate: milliseconds,
                                                                                        makerid: validlog,
                                                                                        createddate: validrecord[i].createddate
                                                                                    };
                                                                                    updateitem.push(params);
                                                                                }
                                                                                get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                    if (validdata != null && validdata > 0) {
                                                                                        const msgparam = { "messagecode": objConstants.updatecode };
                                                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                            return res.status(200).json({
                                                                                                Specialization_json_result: {
                                                                                                    varstatuscode: objConstants.updatecode,
                                                                                                    response: objConstants.successresponsecode,
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
                                                                                                Specialization_json_result: {
                                                                                                    varstatuscode: objConstants.recordnotfoundcode,
                                                                                                    response: objConstants.successresponsecode,
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
                                                        }

                                                    });
                                                }
                                                else if (insertedcategorylist != null && insertedcategorylist.length > 0) {
                                                    // //console.log("Entry");
                                                    objUtilities.InsertLog(logparams, function (validlog) {
                                                        // //console.log(validlog);
                                                        if (validlog != null && validlog != "") {
                                                            get_specializtion_details.getMaxcode(logparams, function (validmax) {
                                                                // //console.log(validmax);
                                                                if (validmax != null && validmax != 0) {
                                                                    var groupobj = req.body.groupcode;
                                                                    for (var i = 0; i <= insertedcategorylist.length - 1; i++) {
                                                                        var maxcode = validmax + i;
                                                                        var Specializationlist = {
                                                                            "specializationcode": maxcode,
                                                                            "specialization": req.body.specialization,
                                                                            "educationcategorycode": insertedcategorylist[i],
                                                                            "statuscode": parseInt(req.body.statuscode),
                                                                            "createddate": milliseconds,
                                                                            "groupcode": Number(groupobj[0]),
                                                                            "updateddate": 0,
                                                                            "makerid": validlog
                                                                        }
                                                                        // //console.log(Specializationlist)
                                                                        insertitem.push(Specializationlist);
                                                                    }
                                                                    // //console.log(insertitem);
                                                                    get_specializtion_details.InsertSpecializationDetails(logparams, insertitem, function (response) {
                                                                        if (response != null && response > 0) {
                                                                            // //console.log("InsertedItem", response);
                                                                            var params = { "groupcode":  {$in:req.body.groupcode} };
                                                                            var updateitem = [];
                                                                            get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                                if (validrecord != null && validrecord.length > 0) {
                                                                                    var groupobj = req.body.groupcode;
                                                                                    for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                        var params = {
                                                                                            specializationcode: validrecord[i].specializationcode,
                                                                                            groupcode: Number(groupobj[0]),
                                                                                            specialization: req.body.specialization,
                                                                                            statuscode: parseInt(req.body.statuscode),
                                                                                            educationcategorycode: validrecord[i].educationcategorycode,
                                                                                            updateddate: milliseconds,
                                                                                            makerid: validlog,
                                                                                            createddate: validrecord[i].createddate
                                                                                        };
                                                                                        updateitem.push(params);
                                                                                    }


                                                                                    get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                        if (validdata != null && validdata > 0) {
                                                                                            const msgparam = { "messagecode": objConstants.updatecode };
                                                                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                                return res.status(200).json({
                                                                                                    Specialization_json_result: {
                                                                                                        varstatuscode: objConstants.updatecode,
                                                                                                        response: objConstants.successresponsecode,
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
                                                                                                    Specialization_json_result: {
                                                                                                        varstatuscode: objConstants.recordnotfoundcode,
                                                                                                        response: objConstants.successresponsecode,
                                                                                                        responsestring: msgresult[0].messagetext,
                                                                                                        responsekey: msgresult[0].messagekey,
                                                                                                    }
                                                                                                });
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            })

                                                                        }
                                                                    });

                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                                else {
                                                    // //console.log("Entry");
                                                    objUtilities.InsertLog(logparams, function (validlog) {
                                                        if (validlog != null && validlog != "") {
                                                            var params = { "groupcode": {$in:req.body.groupcode} };
                                                            var updateitem = [];
                                                            get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                if (validrecord != null && validrecord.length > 0) {
                                                                    var groupobj = req.body.groupcode;
                                                                    for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                        var params = {
                                                                            specializationcode: validrecord[i].specializationcode,
                                                                            groupcode: Number(groupobj[0]),
                                                                            specialization: req.body.specialization,
                                                                            statuscode: parseInt(req.body.statuscode),
                                                                            educationcategorycode: validrecord[i].educationcategorycode,
                                                                            updateddate: milliseconds,
                                                                            makerid: validlog,
                                                                            createddate: validrecord[i].createddate
                                                                        };
                                                                        updateitem.push(params);
                                                                    }

                                                                    get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                        if (validdata != null && validdata > 0) {
                                                                            const msgparam = { "messagecode": objConstants.updatecode };
                                                                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                return res.status(200).json({
                                                                                    Specialization_json_result: {
                                                                                        varstatuscode: objConstants.updatecode,
                                                                                        response: objConstants.successresponsecode,
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
                                                                                    Specialization_json_result: {
                                                                                        varstatuscode: objConstants.recordnotfoundcode,
                                                                                        response: objConstants.successresponsecode,
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

                                            });
                                        }
                                        else if (insertedcategorylist != null && insertedcategorylist.length > 0) {
                                            // //console.log("Entry");
                                            objUtilities.InsertLog(logparams, function (validlog) {
                                                // //console.log(validlog);
                                                if (validlog != null && validlog != "") {
                                                    get_specializtion_details.getMaxcode(logparams, function (validmax) {
                                                        // //console.log(validmax);
                                                        if (validmax != null && validmax != 0) {
                                                            var groupobj = req.body.groupcode;
                                                            for (var i = 0; i <= insertedcategorylist.length - 1; i++) {
                                                                var maxcode = validmax + i;
                                                                var Specializationlist = {
                                                                    "specializationcode": maxcode,
                                                                    "specialization": req.body.specialization,
                                                                    "educationcategorycode": insertedcategorylist[i],
                                                                    "statuscode": parseInt(req.body.statuscode),
                                                                    "createddate": milliseconds,
                                                                    "groupcode": Number(groupobj[0]),
                                                                    "updateddate": 0,
                                                                    "makerid": validlog
                                                                }
                                                                // //console.log(Specializationlist)
                                                                insertitem.push(Specializationlist);
                                                            }
                                                            // //console.log(insertitem);
                                                            get_specializtion_details.InsertSpecializationDetails(logparams, insertitem, function (response) {
                                                                if (response != null && response > 0) {
                                                                    // //console.log(response)

                                                                    var params = { "groupcode": {$in:req.body.groupcode}};
                                                                    var updateitem = [];
                                                                    get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                                        if (validrecord != null && validrecord.length > 0) {
                                                                            var groupobj = req.body.groupcode;
                                                                            for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                                var params = {
                                                                                    specializationcode: validrecord[i].specializationcode,
                                                                                    groupcode: Number(groupobj[0]),
                                                                                    specialization: req.body.specialization,
                                                                                    statuscode: parseInt(req.body.statuscode),
                                                                                    educationcategorycode: validrecord[i].educationcategorycode,
                                                                                    updateddate: milliseconds,
                                                                                    makerid: validlog,
                                                                                    createddate: validrecord[i].createddate
                                                                                };
                                                                                updateitem.push(params);
                                                                            }
                                                                            // //console.log(updateitem);


                                                                            get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                                if (validdata != null && validdata > 0) {
                                                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                                        return res.status(200).json({
                                                                                            Specialization_json_result: {
                                                                                                varstatuscode: objConstants.updatecode,
                                                                                                response: objConstants.successresponsecode,
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
                                                                                            Specialization_json_result: {
                                                                                                varstatuscode: objConstants.recordnotfoundcode,
                                                                                                response: objConstants.successresponsecode,
                                                                                                responsestring: msgresult[0].messagetext,
                                                                                                responsekey: msgresult[0].messagekey,
                                                                                            }
                                                                                        });
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    })

                                                                }
                                                            });

                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        else {
                                            // //console.log("Entry");
                                            objUtilities.InsertLog(logparams, function (validlog) {
                                                if (validlog != null && validlog != "") {
                                                    var params = { "groupcode": {$in:req.body.groupcode} };
                                                    var updateitem = [];
                                                    get_specializtion_details.getSpecializationSingleRecordDetails_Edit(logparams, params, function (validrecord) {
                                                        if (validrecord != null && validrecord.length > 0) {
                                                            var groupobj = req.body.groupcode;
                                                            for (var i = 0; i <= validrecord.length - 1; i++) {
                                                                var params = {
                                                                    specializationcode: validrecord[i].specializationcode,
                                                                    groupcode: Number(groupobj[0]),
                                                                    specialization: req.body.specialization,
                                                                    statuscode: parseInt(req.body.statuscode),
                                                                    educationcategorycode: validrecord[i].educationcategorycode,
                                                                    updateddate: milliseconds,
                                                                    makerid: validlog,
                                                                    createddate: validrecord[i].createddate
                                                                };
                                                                updateitem.push(params);
                                                            }
                                                            //console.log("Entry",updateitem);
                                                            get_specializtion_details.UpdateSpecialization(logparams, updateitem, req, function (validdata) {
                                                                if (validdata != null && validdata > 0) {
                                                                    const msgparam = { "messagecode": objConstants.updatecode };
                                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                        return res.status(200).json({
                                                                            Specialization_json_result: {
                                                                                varstatuscode: objConstants.updatecode,
                                                                                response: objConstants.successresponsecode,
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
                                                                            Specialization_json_result: {
                                                                                varstatuscode: objConstants.recordnotfoundcode,
                                                                                response: objConstants.successresponsecode,
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
                                    }
                                });

                            }
                            else {
                                const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        Specialization_json_result: {
                                            varstatuscode: objConstants.recordnotfoundcode,
                                            response: objConstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                        }
                                    });
                                });
                            }
                        });
                    }

                }
                else {
                    const msgparam = { "messagecode": objConstants.notvalidcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            Specialization_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                response: objConstants.successresponsecode,
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
                        Specialization_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        { logger.error("Error in specialization update : " + e); }
    }
}