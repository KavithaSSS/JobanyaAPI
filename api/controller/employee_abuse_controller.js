'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objAbuse = require('../process/employee_abuse_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')
const objSendNotification = require('../process/send_notification_process_controller');
const objMail = require('../process/send_email_process_controller');
const objProfile = require('../process/employee_profile_view_process_controller')
const objJobView = require('../process/employee_job_view_process_controller')

exports.AbuseSave = function (req, res) {
  try {
    var objLogdetails;
    var logUserCode = "";
    var logType = "";
    if (req.query.apptypecode == 1) {
      logUserCode = req.query.employeecode;
      logType = varconstant.employeeLogType;
    }
    else {
      logUserCode = req.query.employercode;
      logType = varconstant.AppEmployerLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Abuse Employer Save', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    if (req.query.apptypecode == 1) {
      objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
        if (validemp == true) {
          objAbuse.CheckAbuseDetails(logparams, req, function (empresult) {
            if (empresult == 0) {
              objAbuse.getMaxcode(logparams, function (validmaxcode) {
                if (validmaxcode != null && validmaxcode != 0) {
                  objUtilities.InsertLog(logparams, function (validcode) {
                    if (validcode != null && validcode != 0) {
                      objUtilities.getcurrentmilliseconds(function (currenttime) {
                        var saveparams = {
                          "abusecode": validmaxcode,
                          "apptypecode": Number(req.query.apptypecode),
                          "employeecode": Number(req.query.employeecode),
                          "employercode": Number(req.query.employercode),
                          "jobcode": Number(req.query.jobcode),
                          "createddate": currenttime,
                          "updateddate": 0,
                          "statuscode": varconstant.pendingstatus,
                          "makerid": validcode
                        };
                        objAbuse.AbuseEmployeeCreate(logparams, saveparams, function (jobresult) {
                          if (jobresult != null && jobresult > 0) {
                           
                            const msgparam = { "messagecode": varconstant.savedcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              return res.status(200).json({
                                abuse_json_result: {
                                  varstatuscode: varconstant.savedcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: varconstant.successresponsecode,
                                }
                              });
                            });
                            
                            var params = { "employercode": Number(req.query.employercode), "jobcode": Number(req.query.jobcode), employeecode: 0, languagecode: varconstant.defaultlanguagecode, statuscode: [0] };
                            objJobView.getJobViewProcess(logparams, params, function (jobviewresult) {
                              var empparams = { "employeecode": Number(req.query.employeecode) };
                              objProfile.getProfileView(logparams, empparams, varconstant.defaultlanguagecode,req, function (employeedetails) {
                                ////console.log("2");
                                objUtilities.GetAdminMailId(varconstant.abuseemployeemailcode,function(tomailid){
                                  objUtilities.GetAdminMailId(varconstant.admincode,function(mailid){
                                    objMail.AbuseEmployee(tomailid,Number(req.query.employercode), logparams, mailid, jobviewresult[0], employeedetails, function (validmail) {
                                    });
                                    
                                  });
                                });
                                objSendNotification.SendAbuseEmployeeNotification(logparams,Number(req.query.employercode),jobviewresult[0], employeedetails,saveparams, function(result){
                                });
                              });
                            });
                          }
                          else {
                            const msgparam = { "messagecode": varconstant.employernotfound };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              return res.status(200).json({
                                abuse_json_result: {
                                  varstatuscode: varconstant.employernotfound,
                                  response: varconstant.successresponsecode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey
                                }
  
                              });
                            });
                          }
                        });
                      });
                      
                    }
                  })
                }
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.alreadyabusedcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  abuse_json_result: {
                    varstatuscode: varconstant.alreadyabusedcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }

                });
              });
            }
          })
        }
        else {
          const msgparam = { "messagecode": varconstant.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              abuse_json_result: {
                varstatuscode: varconstant.usernotfoundcode,
                response: varconstant.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }

            });
          });
        }
      });
    }
    else if (req.query.apptypecode == 2) {
      objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
        if (validemp == true) {
          objAbuse.CheckAbuseDetails(logparams, req, function (empresult) {
            if (empresult == 0) {
              objAbuse.getMaxcode(logparams, function (validmaxcode) {
                if (validmaxcode != null && validmaxcode != 0) {
                  objUtilities.InsertLog(logparams, function (validcode) {
                    if (validcode != null && validcode != 0) {
                      objUtilities.getcurrentmilliseconds(function (currenttime) {
                        var saveparams = {
                          "abusecode": validmaxcode,
                          "apptypecode": Number(req.query.apptypecode),
                          "employeecode": Number(req.query.employeecode),
                          "employercode": Number(req.query.employercode),
                          "jobcode": Number(req.query.jobcode),
                          "createddate": currenttime,
                          "updateddate": 0,
                          "statuscode": varconstant.pendingstatus,
                          "makerid": validcode
                        };
                        objAbuse.AbuseEmployerCreate(logparams, saveparams, function (jobresult) {
                          if (jobresult != null && jobresult > 0) {
                           
                            const msgparam = { "messagecode": varconstant.savedcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              return res.status(200).json({
                                abuse_json_result: {
                                  varstatuscode: varconstant.savedcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: varconstant.successresponsecode,
                                }
                              });
                            });
                            
                            var empparams = { "employeecode": Number(req.query.employeecode) };
                              objProfile.getProfileView(logparams, empparams, varconstant.defaultlanguagecode,req, function (employeedetails) {
                                ////console.log("2");
                                objUtilities.GetAdminMailId(varconstant.abuseemployermailcode,function(tomailid){
                                  objUtilities.GetAdminMailId(varconstant.admincode,function(mailid){
                                    objMail.AbuseEmployer(tomailid,Number(req.query.employercode), logparams, mailid,  employeedetails, function (validmail) {
                                      objMail.AbuseEmployerReply(Number(req.query.employercode), logparams, mailid,  employeedetails, function (validmail) {
                                      });
                                    });
                                  });
                                  objSendNotification.SendAbuseEmployerNotification(logparams,req.query.employercode,employeedetails,saveparams,function(result){
                                  });
                                });
                              });
                          }
                          else {
                            const msgparam = { "messagecode": varconstant.usernotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              return res.status(200).json({
                                abuse_json_result: {
                                  varstatuscode: varconstant.usernotfoundcode,
                                  response: varconstant.successresponsecode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey
                                }
  
                              });
                            });
                          }
                        });
                      });
                      
                    }
                  })
                }
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.alreadyabusedcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  abuse_json_result: {
                    varstatuscode: varconstant.alreadyabusedcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }

                });
              });
            }
          })
        }
        else {
          const msgparam = { "messagecode": varconstant.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              abuse_json_result: {
                varstatuscode: varconstant.usernotfoundcode,
                response: varconstant.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }

            });
          });
        }
      });
    }
  }
  catch (e) { logger.error("Error in Abuse Employer Save: " + e); }
}