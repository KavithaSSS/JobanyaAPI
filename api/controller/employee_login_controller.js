'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objLogin = require('../process/employee_login_process_controller')
const Logger = require('../services/logger_service');
const objProfile = require('../process/employee_profile_process_controller')
const objNotification = require('../process/employee_notification_process_controller');
const objProfile1 = require('../process/employee_profile_view_process_controller')
const objMail = require('../process/send_email_process_controller');
const logger = new Logger('logs')
exports.lead_registration = async function (req, res) {
  try {
    // const decoded = await objUtilities.validateToken(req);
    // if (!decoded) {
    //   return res.status(200).json({
    //     status: 401,
    //     message: "Unauthorized",
    //   });
    // }
    var objLogdetails;

    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = 0;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employee Registration', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    objLogin.checkEmployeeUserNameExists(logparams, req, 0, function (existresult) {
      // //console.log(existresult.mobilenocount); 
      // //console.log(existresult);

      if (existresult != null) {
        var usernameexistcount = existresult.usernamecount;
        var mobilenocount = existresult.mobilenocount;
        if (existresult.usernamecount == 0 && existresult.mobilenocount == 0) {
          objLogin.getLeadMaxcode(function (response) {
            ////console.log(response );
            if (response != null) {
              objUtilities.encryptpassword(logparams, req.body.password, function (passwordencrypt) {
                const registerparam = { "employeecode": response, "employeename": req.body.employeename, "registervia": req.body.registervia, "username": req.body.username, "mobileno": req.body.mobileno, "password": passwordencrypt, "statuscode": objconstants.activestatus, "createddate": Date.now(), "personalinfo": { "employeefullname": req.body.employeename, "knowabouttypecode": req.body.knowabouttypecode, "others": req.body.others, "usercode": req.body.usercode }, "contactinfo": { "mobileno": req.body.mobileno } }

                objLogin.leadregistration(registerparam, logparams, function (saveresponse) {
                  ////console.log(saveresponse);
                  if (saveresponse != null && saveresponse > 0) {
                    //return res.status(200).json({
                    const msgparam = { "messagecode": objconstants.registercode };
                    // objMail.SendMail(saveresponse, function (result) {
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      return res.status(200).json({
                        employee_json_result: {
                          varstatuscode: objconstants.registercode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: objconstants.successresponsecode,
                          employeecode: response,
                          isleadtype: 1
                          //employee_json_fields: saveresponse 
                        }
                      });

                    });

                    // objNotification.NotificationMaxcode(logparams, function (notificationresponse) {
                    //   var data = {"employeecode": response,"notificationcode": notificationresponse,"notificationtypecode": 1,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
                    //   objNotification.NotificationSaveInEmployee(logparams, data, function (validcode) {
                    //     var data1 = {"employeecode": response,"notificationcode": notificationresponse+1,"notificationtypecode": 2,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
                    //     objNotification.NotificationSaveInEmployee(logparams, data1, function (validcode) {
                    //       var data2 = {"employeecode": response,"notificationcode": notificationresponse+2,"notificationtypecode": 3,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
                    //       objNotification.NotificationSaveInEmployee(logparams, data2, function (validcode) {                            

                    //       });
                    //     });
                    //   });
                    // });
                    // });
                    ////console.log(objconstants.registercode);
                  }
                });
              });


            }
          });
        }
        else {
          var varstatuscode;
          if (usernameexistcount > 0) {

            varstatuscode = objconstants.usernameexistcode;
          }
          else if (mobilenocount > 0) {
            //const msgparam = {"messagecode": objconstants.mobilenoexistcode }; 
            varstatuscode = objconstants.mobilenoexistcode;
          }
          const msgparam = { "messagecode": varstatuscode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varstatuscode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
      }
    });


  }
  catch (e) { logger.error("Error in Employee Registration: " + e); }
}
exports.employee_registration = function (employeecode, res) {
  try {


    var objLogdetails;

    var logUserCode = "";
    var logType = "";
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employee Registration', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    objLogin.getMaxcode(function (response) {
      ////console.log(response );
      if (response != null) {
        objLogin.getLeadRecordDetails(logparams, employeecode, function (leaddetails) {
          if (leaddetails != null && leaddetails.length > 0) {
            leaddetails.employeecode = response;
            objLogin.registration(leaddetails, logparams, 0, function (saveresponse) {
              ////console.log(saveresponse);
              if (saveresponse != null && saveresponse > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": objconstants.registercode };
                var empparams = { "employeecode": leaddetails.employeecode };
                objProfile1.getEmployeeProfileView(logparams, empparams, objconstants.defaultlanguagecode, req, function (empdetails) {
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      employee_json_result: {
                        varstatuscode: objconstants.registercode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: objconstants.successresponsecode,
                        employeecode: response,
                        isleadtype: 0
                        //employee_json_fields: saveresponse 
                      }
                    });

                  });
                })
                // objMail.SendMail(saveresponse, function (result) {

              }
            });
          }
        });


      }
    });


  }
  catch (e) { logger.error("Error in Employee Registration: " + e); }
}
exports.employee_login = async function (req, res) {
  try {

    var objLogdetails;
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = 0;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employee Login', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    //var password = objUtilities.decryptpassword(logparams, req.query.password, function(passworddecrypt){

    objLogin.checkEmployeeLogin(logparams, req, function (empresponse) {
      const dbo = MongoDB.getDB();
      ////console.log(response);
      // console.log(empresponse);
      if (empresponse.result == true) {
        var empparams = { "employeecode": Number(empresponse.employeecode) };
        objUtilities.getcurrentmilliseconds(function (currenttime) {
          var empcollectionname = MongoDB.EmployeeCollectionName;
          if (Number(empresponse.isleadtype) == 0) {
            empcollectionname = MongoDB.EmployeeCollectionName
          }
          else {
            empcollectionname = MongoDB.LeadCollectionName
          }
          dbo.collection(empcollectionname).updateOne(empparams, { $set: { "lastlogindate": currenttime, "registervia": 2 } }, function (err, logres) {
            var prefparams = { employeecode: empresponse.employeecode };
            ////console.log(prefparams);        
            objProfile.CheckProfileStatus(logparams, prefparams, Number(empresponse.isleadtype), async function (profileinforesult) {


              var accessToken = await objUtilities.generateAccessToken({ user: req.query.registered_email });
              var refreshToken = await objUtilities.generateRefreshToken({ user: req.query.registered_email });

              // var prefstatus = false;
              // if (prefresult != null) {
              //     prefstatus = true;
              // }

              if (Number(empresponse.isleadtype) == 0) {
                var empparams1 = { "employeecode": empresponse.employeecode };
                objProfile1.getEmployeeProfileView(logparams, empparams1, objconstants.defaultlanguagecode, req, function (empdetails) {
                });
              }
              const msgparam = { "messagecode": objconstants.loginsuccesscode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  login_json_result: {
                    varstatuscode: objconstants.loginsuccesscode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: objconstants.successresponsecode,
                    employee_details: empresponse,
                    profilestatus: profileinforesult,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                  }
                });

              });


            });
          });
        });




      }
      else if (empresponse.statuscode == objconstants.inactivestatus) {
        const msgparam = { "messagecode": objconstants.deactivateaccountcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            login_json_result: {
              varstatuscode: objconstants.deactivateaccountcode,
              response: objconstants.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey,
              employee_details: empresponse
            }

          });
        });
      }
      else if (empresponse.statuscode == objconstants.blockstatus) {
        const msgparam = { "messagecode": objconstants.abusedcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            login_json_result: {
              varstatuscode: objconstants.abusedcode,
              response: objconstants.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey,
              employee_details: empresponse
            }

          });
        });
      }
      else {
        const msgparam = { "messagecode": objconstants.passwordincorrectcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            login_json_result: {
              varstatuscode: objconstants.passwordincorrectcode,
              response: objconstants.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey
            }

          });
        });
      }
    });
    //});

  }
  catch (e) { logger.error("Error in Employee Login: " + e); }
}

exports.employee_load = async function (req, res) {
  try {
    if (req.query.employeecode != -1) {
      const decoded = await objUtilities.validateToken(req);
      if (!decoded) {
        return res.status(200).json({
          status: 401,
          message: "Unauthorized",
        });
      }
    }
    var logType = objconstants.employeeLogType;
    var objLogdetails;
    const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employeecode, orginator: 'Employee load', logdate: new Date(), type: logType }

    objUtilities.getLogDetails(logvalues, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    if (req.query.appcode == 1) {
      objLogin.registerationload(logparams, req, function (employerresult) {
        if (employerresult != null) {
          const msgparam = { "messagecode": objconstants.listcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employer_json_result: {
                varstatuscode: objconstants.listcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                response: objconstants.successresponsecode,
                knowntypelist: employerresult.knowntypelist,
                userlist: employerresult.userlist,
              }
            });
          });
        }
        else {
          const msgparam = { "messagecode": objconstants.recordnotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employer_json_result: {
                varstatuscode: objconstants.recordnotfoundcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }

            });
          });
        }
      })
    }
  }
  catch (e) {
    logger.error("Error in Employer Load : " + e);
  }
}
exports.forgotpassword = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = req.query.mobileno;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Forgot Password for Mobile No ' + req.query.mobileno, "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {

      var logparams = logresponse;
      objUtilities.CheckOTPValueForSMS(logparams, req, objconstants.forgetpwdtypecode, function (validdata) {
        if (validdata != null && validdata.length > 0) {
          ////console.log("Fulllist:", validdata);
          var validdate = validdata[0].validitydate;
          // //console.log("date:",validdate)
          // //console.log(milliseconds)
          if (validdate > milliseconds) {
            objLogin.forgotpassword(logparams, req, function (empresponse) {
              ////console.log(response);
              ////console.log(empresponse.length);
              if (empresponse != null && empresponse > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": objconstants.passwordchangesuccesscode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {

                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: objconstants.passwordchangesuccesscode,
                      response: objconstants.successresponsecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      mobileno: req.query.mobileno
                      //employee_details: empresponse 
                    }
                  });

                });
              }
              else {
                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: objconstants.recordnotfoundcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: objconstants.successresponsecode

                    }

                  });
                });
              }
            });
          }
          else {
            const msgparam = { "messagecode": objconstants.expriedcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employer_json_result: {
                  varstatuscode: objconstants.expriedcode,
                  response: objconstants.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                }
              });
            });
          }
        }
        else {
          const msgparam = { "messagecode": objconstants.invalidotpcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employer_json_result: {
                varstatuscode: objconstants.invalidotpcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
              }
            });
          });
        }
      });
    });
  }
  catch (e) { logger.error("Error in Employee Forgot Password: " + e); }
}
exports.empCheckUserName = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }

    objLogin.checkUserNameExists(req, function (existresult) {
      ////console.log(existresult.usernamecount); 
      ////console.log(existresult);

      if (existresult != null) {
        //var usernameexistcount = existresult.usernamecount;
        //var mobilenocount = existresult.mobilenocount;
        if (existresult.usernamecount == 0) {
          const msgparam = { "messagecode": objconstants.newusernamecode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.newusernamecode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
        else {
          const msgparam = { "messagecode": objconstants.usernameexistcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.usernameexistcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
      }
    });


  }
  catch (e) { logger.error("Error in Employee Check User Name: " + e); }
}
exports.empCheckMobileNo = async function (req, res) {
  try {
    // const decoded = await objUtilities.validateToken(req);
    // if (!decoded) {
    //   return res.status(200).json({
    //     status: 401,
    //     message: "Unauthorized",
    //   });
    // }

    objLogin.checkMobileNoExists(req, function (existresult) {
      ////console.log(existresult.usernamecount); 
      ////console.log(existresult);

      if (existresult != null) {
        //var usernameexistcount = existresult.usernamecount;
        //var mobilenocount = existresult.mobilenocount;
        if (existresult.mobilenocount == 0) {
          const msgparam = { "messagecode": objconstants.newmobilenocode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.newmobilenocode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
        else {


          const msgparam = { "messagecode": objconstants.mobilenoexistcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.mobilenoexistcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                employeestatus: existresult.statuscode
              }
            });
          });
        }
      }
    });


  }
  catch (e) { logger.error("Error in Employee Check Mobile number: " + e); }
}
exports.empCheckEmailId = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }


    objLogin.checkEmailIdExists(req, function (existresult) {
      ////console.log(existresult.usernamecount); 
      ////console.log(existresult);

      if (existresult != null) {
        //var usernameexistcount = existresult.usernamecount;
        //var mobilenocount = existresult.mobilenocount;
        if (existresult.mobilenocount == 0) {
          const msgparam = { "messagecode": objconstants.newemailcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.newemailcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
        else {


          const msgparam = { "messagecode": objconstants.existcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.existcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                employeestatus: existresult.statuscode
              }
            });
          });
        }
      }
    });


  }
  catch (e) { logger.error("Error in Employee Check Mobile number: " + e); }
}
exports.empCheckAadhar = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }

    objLogin.checkAadharNoExists(req, function (existresult) {
      ////console.log(existresult.usernamecount); 
      ////console.log(existresult);

      if (existresult != null) {
        //var usernameexistcount = existresult.usernamecount;
        //var mobilenocount = existresult.mobilenocount;
        if (existresult.aadharnocount == 0) {
          const msgparam = { "messagecode": objconstants.newaadharcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.newaadharcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
        else {


          const msgparam = { "messagecode": objconstants.aadharnoexistcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.aadharnoexistcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                employeestatus: existresult.statuscode
              }
            });
          });
        }
      }
    });


  }
  catch (e) { logger.error("Error in Employee Check Mobile number: " + e); }
}

exports.UpdateMobileNumber = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = req.query.employeecode;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Update Mobile No ', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      var logparams = logresponse;
      objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
        if (validemp == true) {
          // db.tbl_cp_employee.find({"mobileno": "9047788685","employeecode": { '$ne': 2 }})
          var empparams = { "mobileno": (req.query.mobileno), "employeecode": { $ne: Number(req.query.employeecode) } };
          objLogin.checkvalidMobileNo(empparams, function (validnum) {
            if (validnum == true) {
              const msgparam = { "messagecode": objconstants.mobilenoexistcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: objconstants.mobilenoexistcode,
                    response: objconstants.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }
                });
              });
            }
            else {
              objUtilities.CheckOTPValueForSMS(logparams, req, objconstants.changemobiletypecode, function (validdata) {
                if (validdata != null && validdata.length > 0) {
                  ////console.log("Fulllist:", validdata);
                  var validdate = validdata[0].validitydate;
                  if (validdate > milliseconds) {
                    objLogin.UpdateMobileNumber(logparams, req, function (empvalue) {
                      if (empvalue == true) {
                        const msgparam = { "messagecode": objconstants.updatecode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                            employee_json_result: {
                              response: objconstants.successresponsecode,
                              varstatuscode: objconstants.updatecode,
                              responsestring: msgresult[0].messagetext,
                              responsekey: msgresult[0].messagekey
                            }
                          });
                        });
                      }
                    });
                  }
                  else {
                    const msgparam = { "messagecode": objconstants.expriedcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      return res.status(200).json({
                        employer_json_result: {
                          varstatuscode: objconstants.expriedcode,
                          response: objconstants.successresponsecode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                        }
                      });
                    });
                  }
                }
                else {
                  const msgparam = { "messagecode": objconstants.invalidotpcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      employer_json_result: {
                        varstatuscode: objconstants.invalidotpcode,
                        response: objconstants.successresponsecode,
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
          const msgparam = { "messagecode": objconstants.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
      })
    });
  }
  catch (e) { logger.error("Error in Employee Change Mobile Number: " + e); }
}
exports.Changepassword = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = req.query.employeecode;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Change Password ', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      var logparams = logresponse;
      objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
        if (validemp == true) {
          objLogin.CheckDecryptPassword(logparams, req, function (validdecrypt) {
            if (validdecrypt == true) {
              objLogin.Changepassword(logparams, req, function (validpwd) {
                if (validpwd != null && validpwd > 0) {
                  const msgparam = { "messagecode": objconstants.passwordchangesuccesscode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      employee_json_result: {
                        varstatuscode: objconstants.passwordchangesuccesscode,
                        response: objconstants.successresponsecode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey
                      }
                    });
                  });
                }
              })
            }
            else {
              const msgparam = { "messagecode": objconstants.oldpasswordincorrectcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: objconstants.oldpasswordincorrectcode,
                    response: objconstants.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }
                });
              });
            }
          })
        }
        else {
          const msgparam = { "messagecode": objconstants.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
      });
    });
  }
  catch (e) {
    { logger.error("Error in Employee Change Password: " + e); }
  }
}
exports.DeactivateEmployee = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = req.query.employeecode;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Invisible Mode ', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      var logparams = logresponse;
      objUtilities.checkvalidemployee(req.query.employeecode, function (validuser) {
        if (validuser == true) {
          objLogin.DeactivateEmployee(logparams, req, function (validcode) {
            if (validcode != null && validcode > 0) {
              const msgparam = { "messagecode": objconstants.accinactivecode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: objconstants.accinactivecode,
                    response: objconstants.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }
                });
              });
              /*  var empparams = { "employeecode": Number(req.query.employeecode) };
               objUtilities.GetAdminMailId(objconstants.admincode,function(mailid){
                 objUtilities.FindEmployeeMailID(req.query.employeecode, function(employeemailid){
                   objProfile1.getProfileView(logparams, empparams, objconstants.defaultlanguagecode,req, function (prefresult) {
                     objMail.DeactivateEmployee(logparams,employeemailid, mailid, prefresult, function (validmail) {
                       });
                   });
                 });
               }); */
            }
          })
        }
        else {
          const msgparam = { "messagecode": objconstants.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
      });
    });
  }
  catch (e) {
    { logger.error("Error in Employee Invisible Mode: " + e); }
  }
}
exports.ActivateEmployee = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    var objLogdetails;
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = req.query.username;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Activate Employee', "type": logType };

    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    //var password = objUtilities.decryptpassword(logparams, req.query.password, function(passworddecrypt){
    objLogin.GetSingleUser(req.query.username, function (validuser) {
      ////console.log(validuser);
      if (validuser != null && validuser != 0) {
        objUtilities.CheckOTPValueForSMS(logparams, req, objconstants.invisiblemodetypecode, function (validdata) {
          if (validdata != null && validdata.length > 0) {
            ////console.log("Fulllist:", validdata);
            var validdate = validdata[0].validitydate;
            if (validdate > milliseconds) {
              objLogin.ActivateEmployee(logparams, req, function (empresponse) {
                ////console.log(response);
                ////console.log(empresponse.length);
                if (empresponse == true) {
                  //return res.status(200).json({
                  const msgparam = { "messagecode": objconstants.activatedcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      employee_json_result: {
                        varstatuscode: objconstants.activatedcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: objconstants.successresponsecode
                      }
                    });

                  });
                }
                else {
                  const msgparam = { "messagecode": objconstants.usernotfoundcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      login_json_result: {
                        varstatuscode: objconstants.usernotfoundcode,
                        response: objconstants.successresponsecode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey
                      }

                    });
                  });
                }
              });
            }

            else {
              const msgparam = { "messagecode": objconstants.expriedcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employer_json_result: {
                    varstatuscode: objconstants.expriedcode,
                    response: objconstants.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                  }
                });
              });
            }
          }
          else {
            const msgparam = { "messagecode": objconstants.invalidotpcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employer_json_result: {
                  varstatuscode: objconstants.invalidotpcode,
                  response: objconstants.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                }
              });
            });
          }
        });
      }
      else {
        const msgparam = { "messagecode": objconstants.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
              varstatuscode: objconstants.usernotfoundcode,
              response: objconstants.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey
            }
          });
        });
      }
    });
  }
  catch (e) { logger.error("Error in Activate Employee: " + e); }

}
exports.checkValidEmployee = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    const dbo = MongoDB.getDB();
    logger.info("Activate Employee User name and Mobile No : UserId: " + req.query.employeecode + ", Originator: 'Check Valid Employee', DeviceIP: " + req.query.deviceip + ", Logdate: " + Date.now() + ", Type: " + objconstants.employeeLogType);
    //var password = objUtilities.decryptpassword(logparams, req.query.password, function(passworddecrypt){
    var params = { "ipaddress": req.query.deviceip, "usercode": Number(req.query.employeecode), "orginator": 'Employee Login Check', "type": objconstants.employeeLogType, "logdate": Date.now() };
    var empparams = { "employeecode": Number(req.query.employeecode) };

    objUtilities.validateEmployee(req, function (validemp) {
      // //console.log(validemp)
      if (validemp != null && validemp.length > 0) {
        if (validemp[0].statuscode == objconstants.activestatus) {
          objUtilities.getcurrentmilliseconds(function (currenttime) {
            dbo.collection(MongoDB.EmployeeCollectionName).updateOne(empparams, { $set: { "lastlogindate": currenttime, "registervia": 2 } }, function (err, logres) {
              //return res.status(200).json({
              const msgparam = { "messagecode": objconstants.loginsuccesscode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: objconstants.loginsuccesscode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: objconstants.successresponsecode,
                    mobileno: validemp[0].mobileno,
                    gendercode: validemp[0].gendercode,
                    imageurl: validemp[0].imageurl,
                    isleadtype: validemp[0].isleadtype
                  }
                });

              });
            });
          });


        }
        else if (validemp[0].statuscode == objconstants.inactivestatus) {
          const msgparam = { "messagecode": objconstants.deactivateaccountcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.deactivateaccountcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                mobileno: validemp[0].mobileno
              }

            });
          });
        }
        else if (validemp[0].statuscode == objconstants.blockstatus) {
          const msgparam = { "messagecode": objconstants.abusedcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.abusedcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                mobileno: validemp[0].mobileno
              }

            });
          });
        }
        else {
          const msgparam = { "messagecode": objconstants.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }

            });
          });
        }
      }
      else {
        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
              varstatuscode: objconstants.recordnotfoundcode,
              response: objconstants.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey
            }

          });
        });
      }

    });

  }
  catch (e) { logger.error("Error in Check valid employee: " + e); }

}

exports.checkValidEmployeeorLead = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    const dbo = MongoDB.getDB();
    logger.info("Activate Employee User name and Mobile No : UserId: " + req.query.employeecode + ", Originator: 'Check Valid Employee', DeviceIP: " + req.query.deviceip + ", Logdate: " + Date.now() + ", Type: " + objconstants.employeeLogType);
    //var password = objUtilities.decryptpassword(logparams, req.query.password, function(passworddecrypt){
    var params = { "ipaddress": req.query.deviceip, "usercode": Number(req.query.employeecode), "orginator": 'Employee Login Check', "type": objconstants.employeeLogType, "logdate": Date.now() };
    var empparams = { "employeecode": Number(req.query.employeecode) };

    objUtilities.validateEmployeeorLead(req, function (validemp) {
      // //console.log(validemp)
      if (validemp != null && validemp.length > 0) {
        if (validemp[0].statuscode == objconstants.activestatus) {
          objUtilities.getcurrentmilliseconds(function (currenttime) {
            dbo.collection(MongoDB.EmployeeCollectionName).updateOne(empparams, { $set: { "lastlogindate": currenttime, "registervia": 2 } }, function (err, logres) {
              //return res.status(200).json({
              const msgparam = { "messagecode": objconstants.loginsuccesscode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: objconstants.loginsuccesscode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: objconstants.successresponsecode,
                    mobileno: validemp[0].mobileno,
                    gendercode: validemp[0].gendercode,
                    imageurl: validemp[0].imageurl,
                    isleadtype: validemp[0].isleadtype
                  }
                });

              });
            });
          });


        }
        else if (validemp[0].statuscode == objconstants.inactivestatus) {
          const msgparam = { "messagecode": objconstants.deactivateaccountcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.deactivateaccountcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                mobileno: validemp[0].mobileno
              }

            });
          });
        }
        else if (validemp[0].statuscode == objconstants.blockstatus) {
          const msgparam = { "messagecode": objconstants.abusedcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.abusedcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                mobileno: validemp[0].mobileno
              }

            });
          });
        }
        else {
          const msgparam = { "messagecode": objconstants.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }

            });
          });
        }
      }
      else {
        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
              varstatuscode: objconstants.recordnotfoundcode,
              response: objconstants.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey
            }

          });
        });
      }

    });

  }
  catch (e) { logger.error("Error in Check valid employee: " + e); }

}

exports.employee_registration_portal = function (req, res) {
  try {
    // const decoded = await objUtilities.validateToken(req);
    // if (!decoded) {
    //   return res.status(200).json({
    //     status: 401,
    //     message: "Unauthorized",
    //   });
    // }

    var objLogdetails;
    const dbo = MongoDB.getDB();
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = 0;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employee Registration_portal', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    objLogin.checkPortalEmployeeUserNameExists(logparams, req, 0, function (existresult) {
      // //console.log(existresult.mobilenocount); 
      // //console.log(existresult);

      if (existresult != null) {
        var usernameexistcount = existresult.usernamecount;
        var mobilenocount = existresult.mobilenocount;
        if (existresult.usernamecount == 0 && existresult.mobilenocount == 0) {
          objLogin.getMaxcode(function (response) {
            ////console.log(response );
            if (response != null) {
              //objUtilities.encryptpassword(logparams, req.body.password, function (passwordencrypt) {
                // let schooling = [], afterschooling = [], locationcode_array = [];
                
                // let schooling_json = {
                //   "qualificationcode": req.body.schoolingqualificationcode,
                //   "schoolingcode": 1
                // }
                // schooling.push(schooling_json);
                // let afterschooling_json = {
                //   "afterschoolingcode": 1,
                //   "educationcategorycode": req.body.afterschoolingcode
                // }
                // let locationcode_json = {
                //   "locationcode": req.body.locationcode
                // }
                // locationcode_array.push(locationcode_json);
                // afterschooling.push(afterschooling_json);
                const registerparam = 
                { 
                  "employeecode": response, 
                  "employeename": req.body.employeename, 
                  "registervia": req.body.registervia, 
                  "username": req.body.username, 
                  "mobileno": req.body.mobileno, 
                  "password": "", 
                  "statuscode": objconstants.activestatus, 
                  "createddate": Date.now(), 
                  "preferredlanguagecode": req.body.preferredlanguagecode,
                  "personalinfo": 
                    { 
                      "employeefullname": req.body.employeename,
                      "gender": req.body.gender,
                      "dateofbirth": req.body.dateofbirth
                    }, 
                  "contactinfo": 
                    { 
                      "mobileno": req.body.mobileno,
                      "statecode": req.body.statecode,
                      "districtcode": req.body.districtcode 
                    },
                    "schooling": req.body.schooling,
                    "afterschooling": req.body.afterschooling,
                    "fresherstatus": req.body.fresherstatus,
                    "totalexperience": req.body.totalexp,
                    "expyear": req.body.totalexp,
                    "preferences": req.body.preferences,
                    "experienceinfo": req.body.experienceinfo,
                    "skills": req.body.skills,

              }
              //objLogin.registration(leaddetails, logparams, 0, function (saveresponse) {318
              objLogin.registration(registerparam, logparams, 0, function (saveresponse) {
                ////console.log(saveresponse);
                if (saveresponse != null && saveresponse > 0) {
                  var empparams = { "employeecode": response };
                  objUtilities.getcurrentmilliseconds(function (currenttime) {
                    dbo.collection(MongoDB.EmployeeCollectionName).updateOne(empparams, { $set: { "lastlogindate": currenttime, "registervia": 2 } }, function (err, logres) {
                      // var prefparams = { employeecode: response };
                      ////console.log(prefparams);        

                      const msgparam = { "messagecode": objconstants.registercode };
                      var empparams1 = { "employeecode": response };
                      objProfile1.getEmployeeProfileView(logparams, empparams1, objconstants.defaultlanguagecode, req, function (empdetails) {
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                            employee_json_result: {
                              varstatuscode: objconstants.registercode,
                              responsestring: msgresult[0].messagetext,
                              responsekey: msgresult[0].messagekey,
                              response: objconstants.successresponsecode,
                              employeecode: response
                              //employee_json_fields: saveresponse 
                            }
                          });

                        });
                      });
                      // objMail.SendMail(saveresponse, function (result) {



                      // });
                    });
                  });
                  //return res.status(200).json({


                  // objNotification.NotificationMaxcode(logparams, function (notificationresponse) {
                  //   var data = {"employeecode": response,"notificationcode": notificationresponse,"notificationtypecode": 1,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
                  //   objNotification.NotificationSaveInEmployee(logparams, data, function (validcode) {
                  //     var data1 = {"employeecode": response,"notificationcode": notificationresponse+1,"notificationtypecode": 2,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
                  //     objNotification.NotificationSaveInEmployee(logparams, data1, function (validcode) {
                  //       var data2 = {"employeecode": response,"notificationcode": notificationresponse+2,"notificationtypecode": 3,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
                  //       objNotification.NotificationSaveInEmployee(logparams, data2, function (validcode) {                            

                  //       });
                  //     });
                  //   });
                  // });
                  // });
                  ////console.log(objconstants.registercode);
                }
              });
              //});


            }
          });
        }
        else {
          var varstatuscode;
          if (usernameexistcount > 0) {

            varstatuscode = objconstants.usernameexistcode;
          }
          else if (mobilenocount > 0) {
            //const msgparam = {"messagecode": objconstants.mobilenoexistcode }; 
            varstatuscode = objconstants.mobilenoexistcode;
          }
          const msgparam = { "messagecode": varstatuscode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varstatuscode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
      }
    });


  }
  catch (e) { logger.error("Error in Employee Registration: " + e); }
}

exports.employee_update_portal = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }

    var objLogdetails;
    const dbo = MongoDB.getDB();
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = 0;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employee Registration_portal', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    let employeecode = Number(req.query.employeecode);
    objLogin.checkPortalEmployeeUserNameExists(logparams, req, 0, function (existresult) {
      // //console.log(existresult.mobilenocount); 
      console.log(existresult);

      if (existresult != null) {
        // console.log("Entry")
        var usernameexistcount = existresult.usernamecount;
        var mobilenocount = existresult.mobilenocount;
        if (existresult.usernamecount > 0 || existresult.mobilenocount > 0) {
          /// objLogin.getMaxcode(function (response) {
          ////console.log(response );
          // if (response != null) {

          const registerparam = req.body;
          // { 
          //   "employeename": req.body.employeename,  
          //   "personalinfo": 
          //     { 
          //       "employeefullname": req.body.employeename,
          //       "gender": req.body.gender,
          //       "dateofbirth": req.body.dateofbirth
          //     }, 
          //   "contactinfo": 
          //     { 
          //       "mobileno": req.body.mobileno 
          //     },
          //     "fresherstatus": req.body.fresherstatus,
          //     "preferences": req.body.preferences,
          //   }
          //objLogin.registration(leaddetails, logparams, 0, function (saveresponse) {318
          objProfile.employee_update_portal(registerparam, employeecode, logparams, function (saveresponse) {
            ////console.log(saveresponse);
            if (saveresponse != null && saveresponse > 0) {
              var empparams = { "employeecode": employeecode };
              objUtilities.getcurrentmilliseconds(function (currenttime) {
                dbo.collection(MongoDB.EmployeeCollectionName).updateOne(empparams, { $set: { "lastlogindate": currenttime } }, function (err, logres) {
                  // var prefparams = { employeecode: response };
                  ////console.log(prefparams);        

                  const msgparam = { "messagecode": objconstants.updatecode };
                  var empparams1 = { "employeecode": employeecode };
                  objProfile1.getEmployeeProfileView(logparams, empparams1, objconstants.defaultlanguagecode, req, function (empdetails) {
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      return res.status(200).json({
                        employee_json_result: {
                          varstatuscode: objconstants.updatecode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: objconstants.successresponsecode,
                          // employeecode: response
                          //employee_json_fields: saveresponse 
                        }
                      });

                    });
                  });
                  // objMail.SendMail(saveresponse, function (result) {



                  // });
                });
              });
              //return res.status(200).json({


              // objNotification.NotificationMaxcode(logparams, function (notificationresponse) {
              //   var data = {"employeecode": response,"notificationcode": notificationresponse,"notificationtypecode": 1,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
              //   objNotification.NotificationSaveInEmployee(logparams, data, function (validcode) {
              //     var data1 = {"employeecode": response,"notificationcode": notificationresponse+1,"notificationtypecode": 2,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
              //     objNotification.NotificationSaveInEmployee(logparams, data1, function (validcode) {
              //       var data2 = {"employeecode": response,"notificationcode": notificationresponse+2,"notificationtypecode": 3,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
              //       objNotification.NotificationSaveInEmployee(logparams, data2, function (validcode) {                            

              //       });
              //     });
              //   });
              // });
              // });
              ////console.log(objconstants.registercode);
            }
          });
          //});


          //}
          //});
        }
        else {
          var varstatuscode;
          if (usernameexistcount == 0) {

            varstatuscode = objconstants.usernotfoundcode;
          }
          else if (mobilenocount == 0) {
            //const msgparam = {"messagecode": objconstants.mobilenoexistcode }; 
            varstatuscode = objconstants.usernotfoundcode;
          }
          const msgparam = { "messagecode": varstatuscode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varstatuscode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
      }
    });


  }
  catch (e) { logger.error("Error in Employee Registration: " + e); }
}

exports.employee_jobrole_update_portal = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }

    var objLogdetails;
    const dbo = MongoDB.getDB();
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = objconstants.portalLogType;
    }
    else {
      logUserCode = 0;
      logType = objconstants.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employee Registration_portal', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    let employeecode = Number(req.query.employeecode);
    objLogin.checkPortalEmployeeUserNameExists(logparams, req, 0, function (existresult) {
      // //console.log(existresult.mobilenocount); 
      console.log(existresult);

      if (existresult != null) {
        // console.log("Entry")
        var usernameexistcount = existresult.usernamecount;
        var mobilenocount = existresult.mobilenocount;
        if (existresult.usernamecount > 0 || existresult.mobilenocount > 0) {
          /// objLogin.getMaxcode(function (response) {
          ////console.log(response );
          // if (response != null) {

          const registerparam = req.body;
          // { 
          //   "employeename": req.body.employeename,  
          //   "personalinfo": 
          //     { 
          //       "employeefullname": req.body.employeename,
          //       "gender": req.body.gender,
          //       "dateofbirth": req.body.dateofbirth
          //     }, 
          //   "contactinfo": 
          //     { 
          //       "mobileno": req.body.mobileno 
          //     },
          //     "fresherstatus": req.body.fresherstatus,
          //     "preferences": req.body.preferences,
          //   }
          //objLogin.registration(leaddetails, logparams, 0, function (saveresponse) {318
          objProfile.employee_jobrole_update_portal(registerparam, employeecode, logparams, function (saveresponse) {
            ////console.log(saveresponse);
            if (saveresponse != null && saveresponse > 0) {
              var empparams = { "employeecode": employeecode };
              objUtilities.getcurrentmilliseconds(function (currenttime) {
                dbo.collection(MongoDB.EmployeeCollectionName).updateOne(empparams, { $set: { "lastlogindate": currenttime } }, function (err, logres) {
                  // var prefparams = { employeecode: response };
                  ////console.log(prefparams);        

                  const msgparam = { "messagecode": objconstants.updatecode };
                  var empparams1 = { "employeecode": employeecode };
                  objProfile1.getEmployeeProfileView(logparams, empparams1, objconstants.defaultlanguagecode, req, function (empdetails) {
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      return res.status(200).json({
                        employee_json_result: {
                          varstatuscode: objconstants.updatecode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: objconstants.successresponsecode,
                          // employeecode: response
                          //employee_json_fields: saveresponse 
                        }
                      });

                    });
                  });
                  // objMail.SendMail(saveresponse, function (result) {



                  // });
                });
              });
              //return res.status(200).json({


              // objNotification.NotificationMaxcode(logparams, function (notificationresponse) {
              //   var data = {"employeecode": response,"notificationcode": notificationresponse,"notificationtypecode": 1,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
              //   objNotification.NotificationSaveInEmployee(logparams, data, function (validcode) {
              //     var data1 = {"employeecode": response,"notificationcode": notificationresponse+1,"notificationtypecode": 2,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
              //     objNotification.NotificationSaveInEmployee(logparams, data1, function (validcode) {
              //       var data2 = {"employeecode": response,"notificationcode": notificationresponse+2,"notificationtypecode": 3,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now(),"makerid":validlog}
              //       objNotification.NotificationSaveInEmployee(logparams, data2, function (validcode) {                            

              //       });
              //     });
              //   });
              // });
              // });
              ////console.log(objconstants.registercode);
            }
          });
          //});


          //}
          //});
        }
        else {
          var varstatuscode;
          if (usernameexistcount == 0) {

            varstatuscode = objconstants.usernotfoundcode;
          }
          else if (mobilenocount == 0) {
            //const msgparam = {"messagecode": objconstants.mobilenoexistcode }; 
            varstatuscode = objconstants.usernotfoundcode;
          }
          const msgparam = { "messagecode": varstatuscode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varstatuscode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
            });
          });
        }
      }
    });


  }
  catch (e) { logger.error("Error in Employee Registration: " + e); }
}



