'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const varconstant = require('../../config/constants');
const objcontact = require('../process/employer_subscription_contact_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
var objSendNotification = require('../process/send_notification_process_controller');
const objMail = require('../process/send_email_process_controller');
exports.ContactusSave = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    var date = new Date();
    var milliseconds = date.getTime(); 
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var logType = "";
        if (req.query.appcode == 1)
          logType = varconstant.portalEmployerLogType;
        else
          logType = varconstant.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'subscription contact save', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.appcode == 1 || req.query.appcode == 2) {
          if (req.body.noofposts != null) {
            objUtilities.InsertLog(logparams, function (validlog) {
              if (validlog != null && validlog != "") {
                objcontact.getMaxcode(logparams, function (validmax) {
                  if (validmax != null && validmax != 0) {
                    var params = {
                      contactcode: Number(validmax),
                      noofposts: Number(req.body.noofposts),
                      noofprofile: Number(req.body.noofprofile),
                      noofvacancies: Number(req.body.noofvacancies),
                      description: req.body.description,
                      statuscode: varconstant.activestatus,
                      createddate: milliseconds,
                      employercode: Number(req.query.employercode),
                      updateddate: 0,
                      makerid: validlog
                    }
                    ////console.log(params);
                    objcontact.ContactUsSave(logparams, params, function (response) {
                      if (response != 0 && response > 0) {
                        objUtilities.FindEmployerMailID(req.query.employercode, function (result) {
                          //var empparams = { "employeecode": Number(req.query.employeecode) };
                          //params.apptypecode = 1
                          objUtilities.GetAdminMailId(varconstant.subcontactusmailcode, function (sub_mailid) {
                            objUtilities.GetAdminMailId(varconstant.contactusmailcode, function (mailid) {
                              var registered_email = result[0].registered_email;
                             // //console.log(registered_email);
                          const msgparam = { "messagecode": varconstant.submitcode };
                          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                              employer_json_result: {
                                varstatuscode: varconstant.submitcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                              }
                            });
                          });
                          
                          objMail.SubscriptionContactusMail(req.query.employercode,registered_email, mailid,sub_mailid, params,logparams,function (validmail) {
                          });
                          objSendNotification.SendSubscriptionContactUsNotification(logparams,req.query.employercode, params,function(result){
                          });
                        });
                          });
                          
                    });
                      }
                      else {
                        const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                            employer_json_result: {
                              varstatuscode: varconstant.recordnotfoundcode,
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
            const msgparam = { "messagecode": varconstant.notvalidcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employer_json_result: {
                  varstatuscode: varconstant.notvalidcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                }
              });
            });
          }

        }

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employer_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey,
            }
          });
        });
      }
    });
  }
  catch (e) {
    logger.error("Error in subscription Contact us save: " + e);
  }

}



exports.getsubsContactList =async function (req, res) {
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
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Contact List', logdate: new Date(), type: 'Employer' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var listparams=req.body;
        objcontact.ContactList(logparams, listparams, function (validdata) {
          if (validdata != null) {
            const msgparam = { "messagecode": varconstant.listcode};
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                contactus_json_result: {
                  varstatuscode: varconstant.listcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  contact_list :validdata
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                contactus_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
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
            contactus_json_result: {
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
  catch (e) {
    logger.error("Error in Contact List : " + e);
  }
}


exports.ContactUsUpdate = async function (req, res) {
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
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Contact Us Update', logdate: new Date(), type: 'Employer' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.type == 1)
        {
          //var listparams=req.body;
          objcontact.UpdateTransContactUs(logparams, req, function (validdata) {
            if (validdata != null) {
              const msgparam = { "messagecode": varconstant.updatecode};
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  contactus_json_result: {
                    varstatuscode: varconstant.updatecode,
                    response: varconstant.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    //contact_list :validdata
                  }
                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  contactus_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }
                });
              });
            }
          })
        }
       else
       {
        //var listparams=req.body;
        objcontact.UpdateContactUs(logparams, req, function (validdata) {
          if (validdata != null) {
            const msgparam = { "messagecode": varconstant.updatecode};
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                contactus_json_result: {
                  varstatuscode: varconstant.updatecode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  //contact_list :validdata
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                contactus_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey
                }
              });
            });
          }
        })
      }
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            contactus_json_result: {
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
  catch (e) {
    logger.error("Error in Contact List : " + e);
  }
}