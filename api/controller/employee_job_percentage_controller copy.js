'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
var objemployee = require('../process/employee_job_percentage_process_controller');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
const objRecommended = require('../process/employer_recommended_process_controller');
exports.employee_job_percentage = function (req, res) {
    try {
        objUtilities.GetJobPercentage(function (jobpercentage) {
            objUtilities.GetAllActiveJobs(req, function (activejobcodelist) {
                if (activejobcodelist && activejobcodelist.length > 0) {
                    objUtilities.FindAllActiveEmployeeWithLimit(req, objConstants.defaultlanguagecode, function (employeelist) {
                        if (employeelist && employeelist.length > 0) {
                            // activejobcodelist = [{ jobcode: 901 }];
                            // employeelist = [{ employeecode: 2 }];
                            exports.GetJobDetails(activejobcodelist, employeelist, jobpercentage, function (response) {
                                const msgparam = { "messagecode": objConstants.updatecode };
                                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                    return res.status(200).json({
                                        employee_list_json_result: {
                                            response: objConstants.successresponsecode,
                                            varstatuscode: objConstants.updatecode,
                                            responsestring: msgtext
                                        }
                                    });

                                });
                            });
                        }
                        else {
                            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                return res.status(200).json({
                                    employee_list_json_result: {
                                        response: objConstants.successresponsecode,
                                        varstatuscode: objConstants.updatecode,
                                        responsestring: msgtext
                                    }
                                });

                            });
                        }

                    });

                }
                else {
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            employee_list_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.updatecode,
                                responsestring: msgtext
                            }
                        });

                    });
                }
            });
        });

    }
    catch (e) {
        logger.error("Error in notification List by Code: " + e);
    }
}

exports.GetJobDetails = function (activejobcodelist, employeelist, jobpercentage, callback) {
    try {

        GetJobDetailsJobCode(activejobcodelist, employeelist, jobpercentage, function (err, jobresult) {
            if (err) {
                return;
            }
            return callback(jobresult);
        });
    }
    catch (e) { logger.error("Error in GetJobDetails" + e); }
}


var async = require('async');
function GetJobDetailsJobCode(activejobcodelist, employeelist, jobpercentage, callback) {
    try {
        var returnval;
        var iteratorFcn = function (jobcode, done) {
            if (jobcode == null) {
                done();
                return;
            }

            exports.GetJobDetails_JobCode(jobcode, employeelist, jobpercentage, function (response) {
                returnval = response;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(activejobcodelist, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in GetJobDetailsJobCode" + e); }
}

exports.GetJobDetails_JobCode = function (jobcodevalue, employeelist, jobpercentage, callback) {
    try {
        var empparams = { "jobcode": jobcodevalue.jobcode };
        objRecommended.getJobProfileConditions({}, empparams, function (jobresult) {
            if (jobresult && jobresult.length > 0) {
                if (employeelist && employeelist.length > 0) {
                    objemployee.UpdateMatchingPercentage(jobresult, employeelist, jobpercentage, function (result) {
                        return callback(result);
                    });
                }
            }
        });
    }
    catch (e) {
        logger.error("Error in GetJobDetails_JobCode " + e);
    }
}

exports.employee_active_job = function (req, res) {
    try {
        objUtilities.GetAllActiveJobs(req, function (activejobcodelist) {
                if (activejobcodelist && activejobcodelist.length > 0) {
                    const msgparam = { "messagecode": objConstants.listcode };
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            employee_list_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.listcode,
                                responsestring: msgtext,
                                activejobcodelist: activejobcodelist
                            }
                        });

                    });

                }
                else {
                    objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                            employee_list_json_result: {
                                response: objConstants.successresponsecode,
                                varstatuscode: objConstants.updatecode,
                                responsestring: msgtext
                            }
                        });

                    });
                }
            });
     

    }
    catch (e) {
        logger.error("Error in notification List by Code: " + e);
    }
}