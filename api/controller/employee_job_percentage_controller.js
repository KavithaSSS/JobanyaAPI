'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
var objemployee = require('../process/employee_job_percentage_process_controller');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')

exports.employee_job_percentage = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.GetJobPercentage(function (jobpercentage) {
            objUtilities.GetAllActiveJobs(req, function (activejobcodelist) {
                if (activejobcodelist && activejobcodelist.length > 0) {
                    objUtilities.FindAllActiveEmployeeWithLimit(req, objConstants.defaultlanguagecode, function (employeelist) {
                        if (employeelist && employeelist.length > 0) {
                            // activejobcodelist = [{ jobcode: 901 }];
                            // employeelist = [{ employeecode: 2 }];
                            exports.GetEmpDetails(activejobcodelist, employeelist, jobpercentage, function (response) {
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


exports.active_employee_job_percentage = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.GetJobPercentage(function (jobpercentage) {
            objUtilities.GetAllActiveJobs(req, function (activejobcodelist) {
                if (activejobcodelist && activejobcodelist.length > 0) {
                    objUtilities.FindAllCurrentActiveEmployeeWithLimit(req, objConstants.defaultlanguagecode, function (employeelist) {
                        if (employeelist && employeelist.length > 0) {
                            // activejobcodelist = [{ jobcode: 901 }];
                            // employeelist = [{ employeecode: 2 }];
                            exports.GetEmpDetails(activejobcodelist, employeelist, jobpercentage, function (response) {
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


exports.GetEmpDetails =  async function (activejobcodelist, employeelist, jobpercentage, callback) {
    try {
     
        //console.log(activejobcodelist.length,"activejobcodelist")
        //console.log(employeelist.length,"employeelist")
        GetEmpDetailsJobCode(activejobcodelist, employeelist, jobpercentage, function (err, jobresult) {
            if (err) {
                return;
            }
            return callback(jobresult);
        });
    }
    catch (e) { logger.error("Error in GetJobDetails" + e); }
}


var async = require('async');
function GetEmpDetailsJobCode(activejobcodelist, employeelist, jobpercentage, callback) {
    try {
        var returnval;
        var iteratorFcn = function (employeecode, done) {
           // console.log("employeecode",employeecode)
            if (employeecode == null) {
                done();
                return;
            }

            exports.GetEmpDetails_EmpCode(employeecode, activejobcodelist, jobpercentage, function (response) {
                returnval = response;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(employeelist, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in GetJobDetailsJobCode" + e); }
}

exports.GetEmpDetails_EmpCode = async function (Empcodevalue, activejobcodelist, jobpercentage, callback) {
    try {
       
        //console.log(Empcodevalue.employeecode,"Empcodevalue")
        objUtilities.getemployeedetails(Empcodevalue.employeecode, function (employee) {
           // console.log(employee,"employee")
            if (employee != null && employee.length > 0) {      
                if (activejobcodelist && activejobcodelist.length > 0) {
                    objemployee.UpdateMatchingPercentage(employee, activejobcodelist, jobpercentage, function (result) {
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

exports.employee_active_job = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
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