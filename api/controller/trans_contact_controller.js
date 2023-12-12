'use strict';
var objTransContactUs = require('../process/trans_contactdetails_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
//const {objConstants.notvalidcode, objConstants.alreadyinusecode, objConstants.createcode,objConstants.listcode, objConstants.existcode,objConstants.updatecode,objConstants.deletecode, objConstants.recordnotfoundcode, objConstants.successresponsecode,objConstants.usernotfoundcode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
const objMail = require('../process/send_email_process_controller');
var objSendNotification = require('../process/send_notification_process_controller');
const objProfile = require('../process/employee_profile_view_process_controller')

exports.getTransContactLoad = function (req, res) {
  try {
    var objLogdetails;
    //var langparams = req.query.languagecode;
    ////console.log(langparams);
    var logUserCode = "";
    var logType = "";
    if (req.query.appcode == null || req.query.appcode == 0) {
      logUserCode = req.query.employeecode;
      logType = objConstants.employeeLogType;
    }
    else if (req.query.appcode == 1) {
      logUserCode = req.query.employercode;
      logType = objConstants.portalEmployerLogType;
    }
    else {
      logUserCode = req.query.employercode;
      logType = objConstants.AppEmployerLogType;
    }
    // //console.log( req.query.employercode)
    var params = { "ipaddress": req.query.deviceip, usercode: logUserCode, "orginator": 'Transaction Contact Info Bind', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    if (req.query.appcode == null || req.query.appcode == 0) {
      objTransContactUs.adminContactInfoLoad(logparams, req, function (response) {
        if (response != null) {
          const msgparam = { "messagecode": objConstants.listcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              contactus_json_result: {
                varstatuscode: objConstants.listcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                response: objConstants.successresponsecode,
                admin_details: response.admincontactdetails,
                subject_details: response.subjectdetails,
                category_details: response.categorydetails
              }
            });
          });


          //});
        }
        else {
          const msgparam = { "messagecode": objConstants.recordnotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              contactus_json_result: {
                varstatuscode: objConstants.recordnotfoundcode,
                response: objConstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }

            });
          });
        }
      });
    }
    else if (req.query.appcode == 1) {
      // objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      //   if (validemp == true) {
      objTransContactUs.adminContactInfoLoad(logparams, req, function (response) {
        if (response != null) {
          const msgparam = { "messagecode": objConstants.listcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              contactus_json_result: {
                varstatuscode: objConstants.listcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                response: objConstants.successresponsecode,
                admin_details: response.admincontactdetails,
                subject_details: response.subjectdetails,
                category_details: response.categorydetails
              }
            });
          });


          //});
        }
        else {
          const msgparam = { "messagecode": objConstants.recordnotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              contactus_json_result: {
                varstatuscode: objConstants.recordnotfoundcode,
                response: objConstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }

            });
          });
        }
      });
    }






  }
  catch (e) { logger.error("Error in trans Contact Info Load: " + e); }
}

exports.getTransContactSave = function (req, res) {
  try {
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    var objLogdetails;
    var logUserCode = "";
    var logType = "";
    var appcode;
    if (req.query.apptypecode == null || req.query.apptypecode == 0 || req.query.apptypecode == 1) {
      logUserCode = req.query.employeecode;
      logType = objConstants.employeeLogType;
      appcode = 0;
    }
    else {
      logUserCode = req.query.employercode;
      logType = objConstants.AppEmployerLogType;
      appcode = Number(req.query.apptypecode);
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Transaction Contact Us Info Save', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    objTransContactUs.getMaxcode(logparams, function (maxcoderesult) {
      var saveparams = { "subjectcode": Number(req.body.subjectcode), "message": req.body.message, "createddate": milliseconds, "contactuscode": maxcoderesult, "usercode": Number(logUserCode), "apptypecode": Number(req.query.apptypecode) };
      if (req.query.apptypecode == null || req.query.apptypecode == 1) {
        objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
          if (validemp == true) {
            objTransContactUs.transContactUsSave(saveparams, logparams, function (response) {
              if (response != null && response != "") {
                objTransContactUs.ContactDetails(logparams,maxcoderesult,function(contactresult){
                  objUtilities.FindEmployeeMailID(req.query.employeecode, function (result) {
                    //var empparams = { "employeecode": Number(req.query.employeecode) };
                    saveparams.apptypecode = 1
                 
                    objUtilities.GetAdminMailId(objConstants.contactusmailcode, function (mailid) {
                      var registered_email = result;
                      const msgparam = { "messagecode": objConstants.savedcode };
                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                          contactus_json_result: {
                            varstatuscode: objConstants.savedcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objConstants.successresponsecode,
      
                          }
                        });
                      });
                     
                      //var adminmailid = mailid;
                        var empparams = { "employeecode": Number(req.query.employeecode) };
                        objProfile.getProfileView(logparams, empparams, objConstants.defaultlanguagecode,req, function (employeedetails) {
                          if(registered_email!=null && registered_email!=""){
                            // objMail.ContactUsEmployee(logparams, registered_email, mailid, employeedetails,function (validmail) {
                            // });
                            objSendNotification.SendContactUsForEmployeeNotification(logparams,employeedetails,contactresult, saveparams,function(result){
                             
                            });
                          }
                          

                        });
                        
                       
                  });
                    //objProfile.getProfileView(logparams, empparams, varconstant.defaultlanguagecode, function (prefresult) {
                   
  
                  });
                  /*objSendNotification.SendContactUsNotification(logparams,contactresult,function(result){
                  });*/
                });
               
                
                
              }
              else {
                const msgparam = { "messagecode": objConstants.notvalidcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    contactus_json_result: {
                      varstatuscode: objConstants.notvalidcode,
                      response: objConstants.successresponsecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey
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
                contactus_json_result: {
                  varstatuscode: objConstants.usernotfoundcode,
                  response: objConstants.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey
                }

              });
            });
          }
        });
      }
      else if (req.query.apptypecode == 2) {
        ////console.log("Entry");
        objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
          if (validemp == true) {
            objTransContactUs.transContactUsSave(saveparams, logparams, function (response) {
              if (response != null && response != "") {
                objTransContactUs.ContactDetails(logparams,maxcoderesult,function(contactresult){               
                  //var empparams = { "employeecode": Number(req.query.employeecode) };
                  saveparams.apptypecode = 2
                  saveparams.makerid = response;
                    objUtilities.GetAdminMailId(objConstants.contactusmailcode, function (mailid) {
                      
                      //var adminmailid = mailid;
                      const msgparam = { "messagecode": objConstants.savedcode };
                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                          contactus_json_result: {
                            varstatuscode: objConstants.savedcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objConstants.successresponsecode,
      
                          }
                        });
                      });
                      objMail.ContactUsEmployer(logparams, req.query.employercode, mailid, function (validmail) {
                      });
                      //});
                      objSendNotification.SendContactUsForEmployerNotification(logparams,req.query.employercode,contactresult, saveparams,function(result){
                             
                      });
                  });
                  //objProfile.getProfileView(logparams, empparams, varconstant.defaultlanguagecode, function (prefresult) {
                  });

                
                
              }
              else {
                const msgparam = { "messagecode": objConstants.notvalidcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    contactus_json_result: {
                      varstatuscode: objConstants.notvalidcode,
                      response: objConstants.successresponsecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey
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
                contactus_json_result: {
                  varstatuscode: objConstants.usernotfoundcode,
                  response: objConstants.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey
                }

              });
            });
          }
        });
      }

    });




  }
  catch (e) { logger.error("Error in trans Contact Info save: " + e); }
}
exports.getTransContactList = function (req, res) {
  try {
    objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
      if (userresponse == true) {
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Contact List', logdate: new Date(), type: 'Employee' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var listparams=req.body;
        objTransContactUs.ContactList(logparams, listparams, function (validdata) {
          if (validdata != null) {
            const msgparam = { "messagecode": objConstants.listcode};
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                contactus_json_result: {
                  varstatuscode: objConstants.recordnotfoundcode,
                  response: objConstants.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  contact_list :validdata[0]
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                contactus_json_result: {
                  varstatuscode: objConstants.recordnotfoundcode,
                  response: objConstants.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey
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
            contactus_json_result: {
              varstatuscode: objConstants.usernotfoundcode,
              response: objConstants.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey
            }
          });
        });
      }
    });
  }
  catch (e) {
    logger.error("Error in Contact List : " + e);
  }
}