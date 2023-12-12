'use strict';
var get_skills_details = require('../process/cp_skills_mapping_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
//const {objConstants.notvalidcode,objConstants.createcode,objConstants.listcode, objConstants.existcode,objConstants.updatecode,objConstants.deletecode, objConstants.recordnotfoundcode, objConstants.successresponsecode,objConstants.usernotfoundcode } = require('../../config/constants');
var date = new Date(); // some mock date
var milliseconds = date.getTime();
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
exports.skill_mapping_formload = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Skills Form Load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_skills_details.getSkillFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                skills_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    skilllist: response[0],
                                    JobFunctionList: response[1],
                                    JobRoleList: response[2]

                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                skills_json_result: {
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
                        skills_json_result: {
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
        logger.error("Error in Skill Load: " + e);
    }
}
exports.insert_skill_mapping_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Skills Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {

                    get_skills_details.checkMappingExists(logparams, req, function (rescode) {
                        if (rescode != null) {
                            var existscount = rescode;
                            if (existscount == 0) {
                                get_skills_details.InsertSkillDetails(logparams, req, function (response) {
                                    if (response != null && response > 0) {
                                        const msgparam = { "messagecode": objConstants.savedcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                Skills_insert_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.savedcode,
                                                    responsestring: msgtext
                                                }
                                            });

                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                Skills_insert_json_result: {
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
                                const msgparam = { "messagecode": objConstants.existcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        Skills_insert_json_result: {
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
                            Skills_insert_json_result: {
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
                        Skills_insert_json_result: {
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
        logger.error("Error in Skill Save: " + e);
    }
}
exports.update_skill_mapping_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Skills Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body.jobfunctioncode != null && req.body.jobrolecode != null && req.body.skilllist != null) {
                    var newSkillCodeList = req.body.skilllist.map(item => item.skillcode);
                    get_skills_details.GetSkillMappingdetails(logparams, req, function (response) {                        
                        if (response != null) {     
                            //console.log("Finalresult", response.skilllist);          
                            var existingSkillList = response.skilllist;     
                            var existingSkillCodeList = existingSkillList.map(item => item.skillcode); 
                            var toBedeletedlist = existingSkillCodeList.filter(
                                function (e) {
                                    return this.indexOf(e) < 0;
                                },
                                newSkillCodeList
                            );     
                            //console.log("toBedeletedlist",toBedeletedlist);  
                            get_skills_details.checkSkillCodeExistsInEmployee(logparams,req, toBedeletedlist, function (employeeresult) {
                                get_skills_details.checkSkillCodeExistsInJobpost(logparams,req, toBedeletedlist, function (jobpostresult) {
                                    //console.log("employeeresult",employeeresult); 
                                    //console.log("jobpostresult",jobpostresult); 
                                    var usedlist = [];
                                    if(employeeresult != null && employeeresult.length > 0)
                                    {                                        
                                        var employeeSkillcode = employeeresult.map(item => item.skillcode); 
                                        usedlist.push.apply(usedlist, employeeSkillcode);
                                    }
                                    if(jobpostresult != null && jobpostresult.length > 0)
                                    {
                                        var jobPostSkillcode = jobpostresult.map(item => item.skillcode); 
                                        usedlist.push.apply(usedlist, jobPostSkillcode);
                                    }
                                    ////console.log("usedlist",usedlist);  
                                    var filterUsedList = toBedeletedlist.filter(
                                        function (e) {
                                            return this.indexOf(e) >= 0;
                                        },
                                        usedlist
                                    );   
                                    //console.log("filterUsedList",filterUsedList); 
                                    get_skills_details.deleteUnUsedSkillDetails(logparams, req, filterUsedList, function (response) {
                                        get_skills_details.InsertSkillDetails(logparams, req, function (response) {
                                            if (response != null && response > 0) {
                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        Skills_update_json_result: {
                                                            response: objConstants.successresponsecode,
                                                            varstatuscode: objConstants.updatecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
    
                                                });
                                            }
                                            else {
                                                const msgparam = { "messagecode": objConstants.notvalidcode };
                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                    return res.status(200).json({
                                                        Skills_update_json_result: {
                                                            varstatuscode: objConstants.notvalidcode,
                                                            response: objConstants.successresponsecode,
                                                            responsestring: msgtext
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    });
                                });
                                
                            });       
                            
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    Skills_update_json_result: {
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
                            Skills_update_json_result: {
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
                        Skills_update_json_result: {
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
        logger.error("Error in Skill Save: " + e);
    }
}
exports.delete_skill_mapping_details = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Skills Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body.jobfunctioncode != null && req.body.jobrolecode != null) {
                    get_skills_details.GetSkillMappingdetails(logparams, req, function (response) {
                        //console.log("Finalresult", response);
                        if (response != null && response.skillcodelist != null) {     
                            //console.log("Finalresult", response);          
                            var existingSkillCodeList = response.skillcodelist;   
                            //console.log("skillcodelist", existingSkillCodeList); 
                            //var existingSkillCodeList = existingSkillList.map(item => item.skillcode); 
                            var toBedeletedlist = existingSkillCodeList;     
                            //console.log(toBedeletedlist);  
                            get_skills_details.checkSkillCodeExistsInEmployee(logparams,req, toBedeletedlist, function (employeeresult) {
                                get_skills_details.checkSkillCodeExistsInJobpost(logparams,req, toBedeletedlist, function (jobpostresult) {
                                    var usedlist = [];
                                    if(employeeresult != null && employeeresult.length > 0)
                                    {                                        
                                        var employeeSkillcode = employeeresult.map(item => item.skillcode); 
                                        usedlist.push.apply(usedlist, employeeSkillcode);
                                    }
                                    if(jobpostresult != null && jobpostresult.length > 0)
                                    {
                                        var jobPostSkillcode = jobpostresult.map(item => item.skillcode); 
                                        usedlist.push.apply(usedlist, jobPostSkillcode);
                                    }
                                   // console.log("usedlist",usedlist);  
                                    var filterUsedList = [];
                                    if(usedlist != null && usedlist.length>0){
                                        filterUsedList = toBedeletedlist.filter(
                                            function (e) {
                                                return this.indexOf(e) >= 0;
                                            },
                                            usedlist
                                        );   
                                    }
                                    
                                    //console.log("filterUsedList",filterUsedList); 
                                    get_skills_details.deleteUnUsedSkillDetails(logparams, req, filterUsedList, function (response) {
                                        if (response != null && response > 0) {
                                            const msgparam = { "messagecode": objConstants.deletecode };
                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                return res.status(200).json({
                                                    Skills_delete_json_result: {
                                                        response: objConstants.successresponsecode,
                                                        varstatuscode: objConstants.deletecode,
                                                        responsestring: msgtext
                                                    }
                                                });

                                            });
                                        }
                                        else {
                                            const msgparam = { "messagecode": objConstants.alreadyinusecode };
                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                return res.status(200).json({
                                                    Skills_delete_json_result: {
                                                        varstatuscode: objConstants.alreadyinusecode,
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
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    Skills_delete_json_result: {
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
                            Skills_delete_json_result: {
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
                        Skills_delete_json_result: {
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
        logger.error("Error in Skill Save: " + e);
    }
}
exports.skill_mapping_list = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'skill List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {

                    const params = { statuscode: req.query.statuscode };
                    get_skills_details.getSkillList(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    skills_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        skillslist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    skills_list_json_result: {
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
                            skills_list_json_result: {
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
                        skills_list_json_result: {
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
        logger.error("Error in Skill List: " + e);
    }
}
exports.GetSkillMappingdetails = async function (req, res) {
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
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'skill List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body.jobfunctioncode != null && req.body.jobrolecode != null) {
                    get_skills_details.GetSkillMappingdetails(logparams, req, function (response) {
                        ////console.log("Finalresult", response.skilllist);
                        if (response != null && response.skilllist != null) {              
                            const msgparam = { "messagecode": objConstants.listcode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        skills_list_json_result: {
                                            response: objConstants.successresponsecode,
                                            varstatuscode: objConstants.listcode,
                                            responsestring: msgtext,
                                            skillslist: response.skilllist
                                        }
                                    });

                                });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    skills_list_json_result: {
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
                            skills_list_json_result: {
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
                        skills_list_json_result: {
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
        logger.error("Error in Skill List: " + e);
    }
}