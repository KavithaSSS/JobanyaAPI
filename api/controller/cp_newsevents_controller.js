'use strict';
var get_newsevents_details = require('../process/cp_newsevents_process_controller');
var objSendNotification = require('../process/send_notification_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
// const {notvalidcode,createcode,listcode, existcode,updatecode,deletecode, recordnotfoundcode, successresponsecode,usernotfoundcode } = require('../../config/constants');

exports.newsevents_formload = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'newsevents form load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                get_newsevents_details.getNewsFormLoadList(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                newsevents_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    languagelist: response[0],
                                    NewsCategoryList: response[1],
                                    NewsTypeList: response[2]
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                newsevents_json_result: {
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
                        newsevents_json_result: {
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
        { logger.error("Error in News and events formload: " + e); }
    }
}
exports.insert_newsevents_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'News and events Insertion', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null) {
                    get_newsevents_details.getMaxcode(logparams, function (resp) {
                        if (resp != null) {
                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                var varMaxCode = resp;
                                const params = { newscode: parseInt(varMaxCode), newsevents: req.body.newsevents, categorycode: parseInt(req.body.categorycode), newstypecode: parseInt(req.body.newstypecode), link: req.body.link, imageurl: req.body.imageurl, startdate: req.body.startdate, enddate: req.body.enddate, expirydate: req.body.expirydate, statuscode: objConstants.pendingstatus, createddate: currenttime, updateddate: 0 };
                                get_newsevents_details.InsertNewsDetails(logparams, params, function (response) {
                                    if (response != null && response > 0) {
                                        const msgparam = { "messagecode": objConstants.createcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                newsevents_insert_json_result: {
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
                                                newsevents_insert_json_result: {
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
                            newsevents_insert_json_result: {
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
                        newsevents_insert_json_result: {
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
        { logger.error("Error in News and Events insert: " + e); }
    }
}
exports.update_newsevents_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'News and events update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body != null && req.query.newscode != null) {

                    get_newsevents_details.checkNewsCodeExists(logparams, req, function (respo) {
                        if (respo != null) {
                            var codeexistscount = respo;
                            if (codeexistscount > 0) {
                                get_newsevents_details.getNewsSingleRecordDetails(logparams, req, function (respon) {
                                    if (respon != null) {
                                        const listdetails = respon;
                                        if (listdetails != null) {
                                            objUtilities.InsertLog(logparams, function (validlog) {
                                                if (validlog != null && validlog != "") {
                                                    var params = {};
                                                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                                                        if(Number(req.body.statuscode)==4){
                                                            params = { 
                                                                newscode: parseInt(req.query.newscode), 
                                                                newsevents: req.body.newsevents, 
                                                                categorycode: parseInt(req.body.categorycode), 
                                                                newstypecode: parseInt(req.body.newstypecode), 
                                                                link: req.body.link, 
                                                                imageurl: req.body.imageurl, 
                                                                startdate: req.body.startdate, 
                                                                enddate: req.body.enddate, 
                                                                expirydate: req.body.expirydate, 
                                                                statuscode: parseInt(req.body.statuscode),
                                                                makerid: validlog, 
                                                                createddate: listdetails[0].createddate, 
                                                                updateddate: currenttime };
                                                        }
                                                        else{
                                                            params = { 
                                                                newscode: parseInt(req.query.newscode), 
                                                                newsevents: req.body.newsevents, 
                                                                categorycode: parseInt(req.body.categorycode), 
                                                                newstypecode: parseInt(req.body.newstypecode), 
                                                                link: req.body.link, 
                                                                imageurl: req.body.imageurl, 
                                                                startdate: req.body.startdate, 
                                                                enddate: req.body.enddate, 
                                                                expirydate: req.body.expirydate, 
                                                                makerid: listdetails[0].makerid, 
                                                                createddate: listdetails[0].createddate, 
                                                                updateddate: currenttime,
                                                                remarks: req.body.remarks, 
                                                                updateddate: currenttime, 
                                                                statuscode: parseInt(req.body.statuscode),
                                                                checkerid: validlog, 
                                                                approveddate: currenttime };
                                                        } 
                                                    });
                                                    
                                                    get_newsevents_details.updateNewsDetails(logparams, params, function (response) {
                                                        if (response == true) {
                                                            if ((Number(req.body.statuscode) == 5)) {
                                                                const msgparam = { "messagecode": objConstants.newsapprovedcode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        NewsEvents_update_json_result: {
                                                                            varstatuscode: objConstants.newsapprovedcode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
                                                                            response: objConstants.successresponsecode,
                                                                        }
                                                                    });
                                                                });
                                                                ////console.log(response);
                                                                get_newsevents_details.checkValidCode(logparams, req, function (validrecord) {
                                                                    ////console.log(validrecord);
                                                                    if (validrecord != null && validrecord.length > 0) {
                                                                        objSendNotification.SendNewsEventsNotification(validrecord,req,function(result){
                                                                        });
                                                                    }                                                                    
                                                                });
                                                                
                                                            }
                                                            else if ((Number(req.body.statuscode) == 9)) {
                                                                const msgparam = { "messagecode": objConstants.newsrejectedcode };
                                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                                    return res.status(200).json({
                                                                        NewsEvents_update_json_result: {
                                                                            varstatuscode: objConstants.newsrejectedcode,
                                                                            responsestring: msgresult[0].messagetext,
                                                                            responsekey: msgresult[0].messagekey,
                                                                            response: objConstants.successresponsecode,
                                                                        }
                                                                    });
                                                                });
                                                            }
                                                            else{
                                                                const msgparam = { "messagecode": objConstants.updatecode };
                                                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                                    return res.status(200).json({
                                                                        NewsEvents_update_json_result: {
                                                                            response: objConstants.successresponsecode,
                                                                            varstatuscode: objConstants.updatecode,
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
                                                                    NewsEvents_update_json_result: {
                                                                        varstatuscode: objConstants.recordnotfoundcode,
                                                                        response: objConstants.successresponsecode,
                                                                        responsestring: msgtext
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    });
                                                }
                                            });                                            
                                        }
                                        else {
                                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                                return res.status(200).json({
                                                    NewsEvents_update_json_result: {
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
                                        NewsEvents_update_json_result: {
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
                            NewsEvents_update_json_result: {
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
                        NewsEvents_update_json_result: {
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
        { logger.error("Error in News and Events update: " + e); }
    }
}
exports.delete_newsevents_details = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'newsevents Delete', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.newscode != null) {

                    get_newsevents_details.checkNewsCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var existscount = resp;
                            if (existscount > 0) {
                                const params = { newscode: req.query.newscode };
                                get_newsevents_details.deleteNewsDetails(logparams, params, function (response) {
                                    if (response != null && response > 0) {
                                        const msgparam = { "messagecode": objConstants.deletecode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                newsevents_delete_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.deletecode,
                                                    responsestring: msgtext,
                                                    returncode: req.query.newscode
                                                }
                                            });
                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                newsevents_delete_json_result: {
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
                                        newsevents_delete_json_result: {
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
                            newsevents_delete_json_result: {
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
                        newsevents_delete_json_result: {
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
        { logger.error("Error in News and Events delete: " + e); }
    }
}
exports.newsevents_list_by_code = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'News and events List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.newscode != null) {
                    const params = { newscode: req.query.newscode };
                    get_newsevents_details.getNewsSingleRecordDetails_Edit(logparams, params, function (response) {
                        if (response != null && response.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    newsevents_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.listcode,
                                        responsestring: msgtext,
                                        newseventslist: response
                                    }
                                });

                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    newsevents_list_json_result: {
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
                            newsevents_list_json_result: {
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
                        newsevents_list_json_result: {
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
        { logger.error("Error in News and Events Edit Load: " + e); }
    }
}
exports.newsevents_list = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'news and events List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.statuscode != null) {

                    const params = { statuscode: req.query.statuscode };
                    objUtilities.getPortalLanguageDetails(logparams, function (langresponse) {
                        if (langresponse != null) {
                            get_newsevents_details.getNewsList(logparams, params, langresponse.length, function (response) {
                                if (response != null && response.length > 0) {
                                    objUtilities.findCount(objConstants.newseventscount, function (respon) {
                                        const msgparam = { "messagecode": objConstants.listcode };
                                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                            return res.status(200).json({
                                                newsevents_list_json_result: {
                                                    response: objConstants.successresponsecode,
                                                    varstatuscode: objConstants.listcode,
                                                    responsestring: msgtext,
                                                    activecount: respon[0],
                                                    inactivecount: respon[1],
                                                    totcount: respon[2],
                                                    tot_language_count: langresponse.length,
                                                    newseventslist: response
                                                }
                                            });

                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                        return res.status(200).json({
                                            newsevents_list_json_result: {
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
                                    newsevents_list_json_result: {
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
                            newsevents_list_json_result: {
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
                        newsevents_list_json_result: {
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
        { logger.error("Error in News and Events list: " + e); }
    }
}

exports.NewsBind = function (req, res) {
    try {
        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employeecode, "orginator": 'News Bind', "type": 'Employee' };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
                if (validemp == true) {
                    get_newsevents_details.NewsBind(logparams, req, function (bindnews) {
                        if (bindnews.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    news_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        response: objConstants.successresponsecode,
                                        responsestring: msgtext,
                                        newslistbind: bindnews
                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    news_json_result: {
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
                            news_json_result: {
                                varstatuscode: objConstants.usernotfoundcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext,
                            }
                        });
                    });
                }
            });
        });

    }
    catch (e) {
        { logger.error("Error in Employee News bind: " + e); }
    }
}

exports.EventsBind = function (req, res) {
    try {
        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employeecode, "orginator": 'Events Bind ', "type": 'Employee' };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
                if (validemp == true) {
                    get_newsevents_details.EventsBind(logparams, req, function (bindevents) {
                        if (bindevents.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    events_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        response: objConstants.successresponsecode,
                                        responsestring: msgtext,
                                        eventslistbind: bindevents
                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    events_json_result: {
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
                            events_json_result: {
                                varstatuscode: objConstants.usernotfoundcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext,
                            }
                        });
                    });
                }
            });
        });

    }
    catch (e) { logger.error("Error in Employee Events bind: " + e); }

}

exports.NewsDetails = function (req, res) {
    try {
        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employeecode, "orginator": 'News Bind', "type": 'Employee' };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
                if (validemp == true) {
                    get_newsevents_details.NewsDetails(logparams, req, function (bindnews) {
                        if (bindnews.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    news_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        response: objConstants.successresponsecode,
                                        responsestring: msgtext,
                                        newslistbind: bindnews
                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    news_json_result: {
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
                            news_json_result: {
                                varstatuscode: objConstants.usernotfoundcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext,
                            }
                        });
                    });
                }
            });
        });

    }
    catch (e) {
        { logger.error("Error in Employee News View: " + e); }
    }
}

exports.EventsDetails = function (req, res) {
    try {
        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employeecode, "orginator": 'Events Bind ', "type": 'Employee' };
        objUtilities.getLogDetails(params, function (logresponse) {
            var logparams = logresponse;
            objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
                if (validemp == true) {
                    get_newsevents_details.EventsDetails(logparams, req, function (bindevents) {
                        if (bindevents.length > 0) {
                            const msgparam = { "messagecode": objConstants.listcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    events_json_result: {
                                        varstatuscode: objConstants.listcode,
                                        response: objConstants.successresponsecode,
                                        responsestring: msgtext,
                                        eventslistbind: bindevents
                                    }
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    events_json_result: {
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
                            events_json_result: {
                                varstatuscode: objConstants.usernotfoundcode,
                                response: objConstants.successresponsecode,
                                responsestring: msgtext,
                            }
                        });
                    });
                }
            });
        });

    }
    catch (e) { logger.error("Error in Employee Events View: " + e); }

}

exports.UpdateStatuscode = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'News Event Update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.newscode != null && req.query.statuscode != null) {
                    get_newsevents_details.checkValidCode(logparams, req, function (validrecord) {
                        ////console.log(validrecord);
                        if (validrecord != null && validrecord.length > 0) {
                            get_newsevents_details.UpdateStatuscodeInNewsEvents(logparams, req, function (updateresult) {
                                if (updateresult != 0 && updateresult > 0) {
                                    const msgparam = { "messagecode": objConstants.updatecode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            newsevent_json_result: {
                                                varstatuscode: objConstants.updatecode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objConstants.successresponsecode,
                                            }
                                        });
                                    });
                                    
                                }
                                else {
                                    const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            newsevent_json_result: {
                                                varstatuscode: objConstants.recordnotfoundcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objConstants.successresponsecode,
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
                                    newsevent_json_result: {
                                        varstatuscode: objConstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objConstants.successresponsecode,
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
                            newsevent_json_result: {
                                varstatuscode: objConstants.notvalidcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: objConstants.successresponsecode,
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        newsevent_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objConstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Statuscode jobpost: " + e);
    }
}

exports.update_imageurl = function (req, res) {
    try {
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Job Function Image URL update', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.query.newscode != null && req.body.imageurl != null) {
                    get_newsevents_details.checkNewsCodeExists(logparams, req, function (resp) {
                        if (resp != null) {
                            var codeexistscount = resp;
                            if (codeexistscount > 0) {
                                get_newsevents_details.UpdateImageurl(logparams, req, function (validurl) {
                                    if (validurl != null && validurl > 0) {
                                      const msgparam = { "messagecode": objConstants.updatecode };
                                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            newsevents_json_result: {
                                            response: objConstants.successresponsecode,
                                            varstatuscode: objConstants.updatecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
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
                                        newsevents_json_result: {
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
                            newsevents_json_result: {
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
                        newsevents_json_result: {
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
        logger.error("Error in Job Function Update Image URL: " + e);
    }
}