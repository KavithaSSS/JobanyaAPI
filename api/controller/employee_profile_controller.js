'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/employee_profile_process_controller')
const objProfileView = require('../process/employee_profile_view_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')
const objGeneratePDF = require('../process/generate_employee_profile_pdf_process_controller')
const objSendSMS = require('../process/send_sms_process_controller')
const objNotification = require('../process/employee_notification_process_controller')

//Personal Info
exports.getPersonalinfoLoad = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Personal Info Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        objProfile.getPersonalInfoLoad(logparams, langparams, function (response) {
          ////console.log(response);
          ////console.log(response.length);
          if (response != null) {
            //return res.status(200).json({
            var prefparams = { employeecode: Number(req.query.employeecode) };
            objProfile.getEmpPersonalInfo(logparams, prefparams,Number(req.query.isleadtype), function (personalinforesult) {
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                if (personalinforesult != null && personalinforesult.length > 0) {
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      differentlyabled: varconstant.differentlyablecode,
                      languagelist: response.languagelist,
                      GenderLoad: response.genderlist,
                      MaritalStatus: response.maritallist,
                      personalinfo: personalinforesult[0].personalinfo,
                      resumeurl:personalinforesult[0].resumeurl,
                      generatedresumeurl:personalinforesult[0].generatedresumeurl
                    }
                  });
                }
                else {
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      differentlyabled: varconstant.differentlyablecode,
                      languagelist: response.languagelist,
                      GenderLoad: response.genderlist,
                      MaritalStatus: response.maritallist
                    }
                  });

                }

              });


            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey
                }

              });
            });
          }
        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
  catch (e) { logger.error("Error in Personal Info Load: " + e); }
}

exports.personalinfoupdate = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Personal Info Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
      //   console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYY");
      //  console.log(req.query.isleadtype);
        if (req.query.isleadtype == null || req.query.isleadtype == "null" || req.query.isleadtype == undefined || req.query.isleadtype == NaN) {
        //  console.log("Hi");
          req.query.isleadtype = 0
        }
        var prefparams = { employeecode: Number(req.query.employeecode) };
        ////console.log("hi");
        ////console.log(prefparams);
       // console.log(req.query.isleadtype);
        objProfile.getPersonalInfo(logparams, prefparams,Number(req.query.isleadtype), function (empprofile) {
          // console.log(JSON.stringify(empprofile));
          const emppref = empprofile[0].personalinfo; 
          if(emppref.knowabouttypecode){
             req.body["knowabouttypecode"]=emppref.knowabouttypecode;
          }
          if(emppref.others){
            req.body["others"]=emppref.others;
           }
          if(emppref.usercode){
              req.body["usercode"]=emppref.usercode;
          }
         
          var prefsaveparams = req.body;
          objProfile.personalinfosave(prefsaveparams, req.query.employeecode, Number(req.query.isleadtype), logparams, function (profileresult) {

            if (profileresult != null && profileresult > 0) {
             
              const msgparam = { "messagecode": varconstant.updatecode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                if(Number(req.query.isleadtype) == 0){
                  //console.log("Employee Entry");
                  var empparams = {"employeecode": Number(req.query.employeecode)};
                  objProfileView.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                  });
                  objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
                    ////console.log(profileurl);     
                    if(profileurl!=null && profileurl!=0 && profileurl!=""){
                      logger.info("Updating generated Resume URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
                      const dbo = MongoDB.getDB();
                      dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "generatedresumeurl": profileurl } }, function (err, res) {
                         
                      }); 
                    }                 
                  });
                }
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.updatecode,
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
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
  catch (e) { logger.error("Error in Personal Info Save / Update: " + e); }
}
exports.personalinfoEdit = function (req, res) {
  try {
    if (req.query.employeecode == null || req.query.employeecode == 0) {
      const msgparam = { "messagecode": varconstant.notvalidcode };
      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
        return res.status(200).json({
          employee_json_result: {
            varstatuscode: varconstant.notvalidcode,
            response: varconstant.successresponsecode,
            responsestring: msgresult[0].messagetext,
            responsekey: msgresult[0].messagekey
          }
        });
      });
    }
    else {
      objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
        if (validemp == true) {
          var objLogdetails;
          //var langparams = req.query.languagecode;
          ////console.log(langparams);
          var logUserCode = "";
          var logType = "";
          if (req.query.usercode != null) {
            logUserCode = req.query.usercode;
            logType = varconstant.portalLogType;
          }
          else {
            logUserCode = req.query.employeecode;
            logType = varconstant.employeeLogType;
          }
          if (req.query.isleadtype == null) {
            req.query.isleadtype = 0
          }
          var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Personal Info Save', "type": logType };
          objUtilities.getLogDetails(params, function (logresponse) {
            objLogdetails = logresponse;
          });
          var logparams = objLogdetails;
          var prefparams = { employeecode: Number(req.query.employeecode) };
          ////console.log("hi");
          ////console.log(prefparams);
          objProfile.getPersonalInfo(logparams, prefparams,Number(req.query.isleadtype), function (empprofile) {
            ////console.log(empsinglepref);
            // const emppref = empprofile[0].personalinfo;
            // var prefsaveparams = req.body;
            objProfile.personalinfoEdit(req, req.query.employeecode,Number(req.query.isleadtype), logparams, function (profileresult) {

              if (profileresult != null && profileresult > 0) {
                const msgparam = { "messagecode": varconstant.updatecode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.updatecode,
                      response: varconstant.successresponsecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey
                    }
                  });
                });
                if(Number(req.query.isleadtype) == 0){
                  objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
                    ////console.log(profileurl);     
                    if(profileurl!=null && profileurl!=0 && profileurl!=""){
                      logger.info("Updating generated Resume URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
                      const dbo = MongoDB.getDB();
                      dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "generatedresumeurl": profileurl } }, function (err, res) {
                         
                      }); 
                    }                 
                  });
                }
                
              }
            });
          });
        }
        else {
          const msgparam = { "messagecode": varconstant.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
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
  catch (e) { logger.error("Error in Personal Info Save / Update: " + e); }
}

exports.getContactinfoLoad = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Contact Info Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        objProfile.getContactInfoLoad(logparams, langparams, function (response) {
          ////console.log(response);
          ////console.log(response.length);
          if (response != null) {
            //return res.status(200).json({
            var prefparams = { employeecode: Number(req.query.employeecode) };
            objProfileView.getContactinfo(prefparams, req.query.languagecode,Number(req.query.isleadtype), function (contactinforesult) {
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                //console.log(contactinforesult);
                if (contactinforesult != null) {
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      statelist: response.statelist,
                      taluklist: response.taluklist,
                      districtlist: response.districtlist,
                      contactinfo: contactinforesult
                    }
                  });
                }
                else {
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      statelist: response.statelist,
                      districtlist: response.districtlist,
                      taluklist: response.taluklist
                    }
                  });
                }
              });


            });
          }

        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
  catch (e) { logger.error("Error in Contact Info Load: " + e); }
}

exports.contactinfoupdate = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Contact Info Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var prefparams = { employeecode: Number(req.query.employeecode) };
        ////console.log("hi");
        ////console.log(prefparams);
        var prefsaveparams = req.body;
          objProfile.contactinfosave(prefsaveparams, req.query.employeecode, Number(req.query.isleadtype), logparams, function (profileresult) {

            if (profileresult != null && profileresult > 0) {
              if(Number(req.query.isleadtype) == 0){
                var empparams = {"employeecode": Number(req.query.employeecode)};
                objProfileView.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                });
              }
              const msgparam = { "messagecode": varconstant.updatecode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.updatecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                  }
                });
              });
              if(Number(req.query.isleadtype) == 0){
                objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
                  ////console.log(profileurl);     
                  if(profileurl!=null && profileurl!=0 && profileurl!=""){
                    logger.info("Updating generated Resume URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
                    const dbo = MongoDB.getDB();
                    dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "generatedresumeurl": profileurl } }, function (err, res) {
                       
                    }); 
                  }                 
                });
              }
              
            }



          });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
  catch (e) { logger.error("Error in Contact Info Save / Update: " + e); }
}

exports.imageurl = function (req, res) {
  try {
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = varconstant.portalLogType;
    }
    else {
      logUserCode = req.query.employeecode;
      logType = varconstant.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Update Image URL ', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      var logparams = logresponse;
      objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
        if (validemp == true) {
          objProfile.UpdateImageurl(logparams, req, function (validurl) {
            if (validurl != null && validurl > 0) {
              const msgparam = { "messagecode": varconstant.updatecode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    response: varconstant.successresponsecode,
                    varstatuscode: varconstant.updatecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }
                });
              });
              if(Number(req.query.isleadtype)==0){
                objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
                  ////console.log(profileurl);     
                  if(profileurl!=null && profileurl!=0 && profileurl!=""){
                    logger.info("Updating generated Resume URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
                    const dbo = MongoDB.getDB();
                    dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "generatedresumeurl": profileurl } }, function (err, res) {
                       
                    }); 
                  }                
                });
              }
              
            }
          });
        }
        else {
          const msgparam = { "messagecode": varconstant.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
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
  catch (e) {
    { logger.error("Error in Image URl: " + e); }
  }
}

exports.resumeurl = function (req, res) {
  try {
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = varconstant.portalLogType;
    }
    else {
      logUserCode = req.query.employeecode;
      logType = varconstant.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Update Image URL ', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      var logparams = logresponse;
      objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
        if (validemp == true) {
          objProfile.UpdateResumeurl(logparams, req, function (validurl) {
            if (validurl != null && validurl > 0) {
              const msgparam = { "messagecode": varconstant.updatecode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    response: varconstant.successresponsecode,
                    varstatuscode: varconstant.updatecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }
                });
              });
            }
          });
        }
        else {
          const msgparam = { "messagecode": varconstant.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
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
  catch (e) {
    { logger.error("Error in Image URl: " + e); }
  }
}

exports.DeleteEmployee = function (req, res) {
  try {
      objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
          if (userresponse == true) {
              objUtilities.checkemployee(req.body.employeecode, Number(req.body.isleadtype),function (validemp) {
                  if (validemp == true) {
                      var objLogdetails;
                      const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update remarks', logdate: new Date(), type: 'Employee' }
                      objUtilities.getLogDetails(logvalues, function (logresponse) {
                          objLogdetails = logresponse;
                      });
                      var logparams = objLogdetails;
                      objProfile.DeleteEmployee(logparams, req, function (updateresult) {
                          if (updateresult != null && updateresult > 0) {
                              const msgparam = { "messagecode": varconstant.deletecode };
                              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                  return res.status(200).json({
                                      employermanagement_json_result: {
                                          varstatuscode: varconstant.deletecode,
                                          responsestring: msgresult[0].messagetext,
                                          responsekey: msgresult[0].messagekey,
                                          response: varconstant.successresponsecode,
                                      }
                                  });
                              });
                          }
                          else {
                              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                  return res.status(200).json({
                                      employermanagement_json_result: {
                                          varstatuscode: varconstant.recordnotfoundcode,
                                          responsestring: msgresult[0].messagetext,
                                          responsekey: msgresult[0].messagekey,
                                          response: varconstant.successresponsecode,
                                      }
                                  });
                              });
                          }
                      });
                  }
                  else {
                      const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                              employermanagement_json_result: {
                                  varstatuscode: varconstant.recordnotfoundcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: varconstant.successresponsecode,
                              }
                          });
                      });
                  }
              });

          }
          else {
              const msgparam = { "messagecode": varconstant.usernotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                      employermanagement_json_result: {
                          varstatuscode: varconstant.usernotfoundcode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: varconstant.successresponsecode,
                      }
                  });
              });
          }
      });
  }
  catch (e) {
      logger.error("Error in Delete Employee- Employee Management " + e);
  }
}


exports.employee_list = function (req, res) {
  try {
    objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
      if (userresponse) {
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employee List ', logdate: new Date(), type: 'Employee' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (Object.keys(req.body).length > 0) {
          // var params = { "statuscode": Number(req.query.statuscode), "languagecode": req.query.languagecode };
          // var langparams = req.query.languagecode;
          //objProfile.EmpListLoad(logparams, langparams, function (response) {
          objProfile.GetEmpList(logparams, req, function (resultlist) {
            if (resultlist != null && resultlist.length > 0) {
              // //console.log(response.length );
              //objUtilities.findCountByFilter(varconstant.Employeecount,req, function (employeecount) {
                objProfile.GetEmpListFilter(logparams, req, function (employeecount) {
                ////console.log(employeecount);
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employee_json_result: {
                      response: varconstant.successresponsecode,
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      activecount: employeecount[0],
                      inactivecount: employeecount[1],
                      blockcount: employeecount[2],
                      pendingcount: employeecount[3],
                      rejectedcount: employeecount[4],
                      totcount: employeecount[5],
                      employeelangcount: employeecount[8],
                      employeelist: resultlist,
                      //masterslist: response
                    }
                  });

                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                  }
                });
              });
            }
          });
          ////console.log(response);
          ////console.log("ListOer");

          //})
        }
        else {
          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varconstant.recordnotfoundcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
              }
            });
          });
        }

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
    logger.error("Error in Employee List : " + e);
  }
}


exports.employee_excel_list = function (req, res) {
  try {
    objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
      if (userresponse) {
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employee List ', logdate: new Date(), type: 'Employee' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (Object.keys(req.body).length > 0) {
          // var params = { "statuscode": Number(req.query.statuscode), "languagecode": req.query.languagecode };
          // var langparams = req.query.languagecode;
          //objProfile.EmpListLoad(logparams, langparams, function (response) {
          objProfile.GetEmpExcelList(logparams, req, function (resultlist) {
            if (resultlist != null && resultlist.length > 0) {
              // //console.log(response.length );
              //objUtilities.findCountByFilter(varconstant.Employeecount,req, function (employeecount) {
                //objProfile.GetEmpListFilter(logparams, req, function (employeecount) {
                ////console.log(employeecount);
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employee_json_result: {
                      response: varconstant.successresponsecode,
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                     
                      employeelist: resultlist,
                      //masterslist: response
                    }
                  });

                });
              //});
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                  }
                });
              });
            }
          });
          ////console.log(response);
          ////console.log("ListOer");

          //})
        }
        else {
          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varconstant.recordnotfoundcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
              }
            });
          });
        }

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
    logger.error("Error in Employee List : " + e);
  }
}

exports.lead_list = function (req, res) {
  try {
    objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
      if (userresponse) {
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employee List ', logdate: new Date(), type: 'Employee' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (Object.keys(req.body).length > 0) {
          // var params = { "statuscode": Number(req.query.statuscode), "languagecode": req.query.languagecode };
          // var langparams = req.query.languagecode;
          //objProfile.EmpListLoad(logparams, langparams, function (response) {
          objProfile.GetEmpList(logparams, req, function (resultlist) {
            if (resultlist != null && resultlist.length > 0) {
              // //console.log(response.length );
              //objUtilities.findCountByFilter(varconstant.Employeecount,req, function (employeecount) {
                objProfile.GetEmpListFilter(logparams, req, function (employeecount) {
                ////console.log(employeecount);
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employee_json_result: {
                      response: varconstant.successresponsecode,
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      activecount: employeecount[0],
                      inactivecount: employeecount[1],
                      blockcount: employeecount[2],
                      pendingcount: employeecount[3],
                      rejectedcount: employeecount[4],
                      totcount: employeecount[5],
                      employeelist: resultlist,
                      //masterslist: response
                    }
                  });

                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                  }
                });
              });
            }
          });
          ////console.log(response);
          ////console.log("ListOer");

          //})
        }
        else {
          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varconstant.recordnotfoundcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
              }
            });
          });
        }

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
    logger.error("Error in Employee List : " + e);
  }
}

exports.getProfileStatus = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Profile Status Check', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var prefparams = { employeecode: Number(req.query.employeecode), statuscode: varconstant.activestatus };
        objProfile.CheckProfileStatus(logparams, prefparams, Number(req.query.isleadtype),function (profileinforesult) {
          const msgparam = { "messagecode": varconstant.listcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            ////console.log("Hello");  
            ////console.log(prefresult);
            ////console.log("Hi");
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varconstant.listcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                response: varconstant.successresponsecode,
                profilestatus: profileinforesult
              }
            });
          });


        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
  catch (e) { logger.error("Error in Contact Info Load: " + e); }
}
exports.personalinfoinsert = function (req, res) {
  try {

    var objLogdetails;
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = varconstant.portalLogType;
    }
    else {
      logUserCode = 0;
      logType = varconstant.employeeLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employee save', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    if (req.query.isleadtype == null) {
      req.query.isleadtype = 0
    }
    if (req.body.personalinfo != null) {
      // //console.log(req.body.personalinfo);
      var params = req.body.contactinfo.mobileno;
      objProfile.checkEmployeeUserNameExists(logparams, params, function (existresult) {
        if (existresult != null) {
          var usernameexistcount = existresult.usernamecount;
          var mobilenocount = existresult.mobilenocount;
          if (existresult.usernamecount == 0 && existresult.mobilenocount == 0) {
            objUtilities.InsertLog(logparams, function (validlog) {
              if (validlog != null) {
                objProfile.getMaxcode(Number(req.query.isleadtype),function (validmax) {
                  if (validmax != null) {
                    const pwd = varconstant.Bestjobpassword + validmax;
                    objUtilities.encryptpassword(logparams, pwd, function (passwordencrypt) {
                      const registerparam = {
                        "employeecode": validmax,
                        "employeename": req.body.personalinfo.employeefullname,
                        "username": req.body.contactinfo.mobileno,
                        "mobileno": req.body.contactinfo.mobileno,
                        "password": passwordencrypt,
                        "statuscode": req.body.statuscode,
                        "registervia": req.body.registervia,
                        "createddate": Date.now(),
                        "makerid": validlog,
                        "personalinfo": req.body.personalinfo,
                        "contactinfo": req.body.contactinfo
                      };
                      // //console.log(registerparam);
                      objProfile.InsertEmployeedetails(logparams, registerparam, Number(req.query.isleadtype),function (insertesult) {
                        if (insertesult != 0 && insertesult > 0) {
                          const msgparam = { "messagecode": varconstant.savedcode };
                          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                              employee_json_result: {
                                varstatuscode: varconstant.savedcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: varconstant.successresponsecode,
                                employeecode: validmax
                              }
                            });
                          });

                          if(Number(req.query.isleadtype) == 1){
                            objSendSMS.SendSMSForNewRegistration(logparams,req.body.contactinfo.mobileno,pwd,req.body.personalinfo.employeefullname, function (response){
                            });
                          }
                          else{
                            objNotification.NotificationMaxcode(logparams, function (notificationresponse) {
                              var data = {"employeecode": validmax,"notificationcode": notificationresponse,"notificationtypecode": 1,"notificationtypestatus": varconstant.defaultstatuscode,"statuscode": Number(varconstant.activestatus),"createddate": Date.now(),"makerid":validlog}
                              objNotification.NotificationSaveInEmployee(logparams, data, function (validcode) {
                                var data1 = {"employeecode": validmax,"notificationcode": notificationresponse+1,"notificationtypecode": 2,"notificationtypestatus": varconstant.defaultstatuscode,"statuscode": Number(varconstant.activestatus),"createddate": Date.now(),"makerid":validlog}
                                objNotification.NotificationSaveInEmployee(logparams, data1, function (validcode) {
                                  var data2 = {"employeecode": validmax,"notificationcode": notificationresponse+2,"notificationtypecode": 3,"notificationtypestatus": varconstant.defaultstatuscode,"statuscode": Number(varconstant.activestatus),"createddate": Date.now(),"makerid":validlog}
                                  objNotification.NotificationSaveInEmployee(logparams, data2, function (validcode) {                            
                                    objSendSMS.SendSMSForNewRegistration(logparams,req.body.contactinfo.mobileno,pwd,req.body.personalinfo.employeefullname, function (response){
                                      objGeneratePDF.generateEmployeeProfilePDF(logparams, validmax, req, function (profileurl) {
                                        if(profileurl!=null && profileurl!=0 && profileurl!=""){
                                          logger.info("Updating generated Resume URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
                                          const dbo = MongoDB.getDB();
                                          dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": validmax}, { $set: { "generatedresumeurl": profileurl } }, function (err, res) {
                                             ////console.log(res);
                                          }); 
                                        }                  
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          }
                        }
                        else {
                          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                              employee_json_result: {
                                varstatuscode: varconstant.recordnotfoundcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: varconstant.successresponsecode
                              }
                            });
                          });
                        }
                      })
                    });
                  }
                });
              }
            })

          }
          else {
            /*var varstatuscode;
            if (usernameexistcount > 0) {
              varstatuscode = varconstant.usernameexistcode;
            }
            else if (mobilenocount > 0) {
              //const msgparam = {"messagecode": objconstants.mobilenoexistcode }; 
              varstatuscode = varconstant.mobilenoexistcode;
            }*/
            const msgparam = { "messagecode": varconstant.mobilenoexistcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.mobilenoexistcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey
                }
              });
            });
          }
        }

      });
    }
    else {
      const msgparam = { "messagecode": varconstant.notvalidcode };
      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
        return res.status(200).json({
          employee_json_result: {
            varstatuscode: varconstant.notvalidcode,
            response: varconstant.successresponsecode,
            responsestring: msgresult[0].messagetext,
            responsekey: msgresult[0].messagekey
          }
        });
      });
    }

  }
  catch (e) {
    logger.error("Error in Employee save: " + e);
  }
}

exports.get_employee_list = function (req, res) {
  try {
    objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
      if (userresponse) {
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employee List ', logdate: new Date(), type: 'Employee' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (Number(req.query.statuscode) != null) {
          // var params = { "statuscode": Number(req.query.statuscode), "languagecode": req.query.languagecode };
          // var langparams = req.query.languagecode;
          //objProfile.EmpListLoad(logparams, langparams, function (response) {
          objProfile.EmpList(logparams, req, function (resultlist) {
            if (resultlist != null && resultlist.length > 0) {
              // //console.log(response.length );
              objUtilities.findCount(varconstant.Employeecount, function (employeecount) {
                ////console.log(employeecount);
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employee_json_result: {
                      response: varconstant.successresponsecode,
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      activecount: employeecount[0],
                      inactivecount: employeecount[1],
                      totcount: employeecount[2],
                      employeelist: resultlist,
                      //masterslist: response
                    }
                  });

                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                  }
                });
              });
            }
          });
          ////console.log(response);
          ////console.log("ListOer");

          //})
        }
        else {
          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varconstant.recordnotfoundcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
              }
            });
          });
        }

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
    logger.error("Error in Employee List : " + e);
  }
}

exports.get_employee_load = function (req, res) {
  try {
    objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
      if (userresponse) {
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employee List ', logdate: new Date(), type: 'Employee' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (Number(req.query.statuscode) != null) {
          var params = { "statuscode": Number(req.query.statuscode), "languagecode": req.query.languagecode };
          var langparams = req.query.languagecode;
          objProfile.EmpListLoad(logparams, langparams, function (response) {
            //objProfile.EmpList(logparams, params, function(resultlist){
            if (response != null) {
              // //console.log(response.length );
              objUtilities.findCount(varconstant.Employeecount, function (employeecount) {
                // //console.log(employeecount);
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employee_json_result: {
                      response: varconstant.successresponsecode,
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      activecount: employeecount[0],
                      inactivecount: employeecount[1],
                      totcount: employeecount[2],
                      //employeelist: resultlist,
                      masterslist: response
                    }
                  });

                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                  }
                });
              });
            }
          });
          ////console.log(response);
          ////console.log("ListOer");

          //})
        }
        else {
          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varconstant.recordnotfoundcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
              }
            });
          });
        }

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
    logger.error("Error in Employee List : " + e);
  }
}

exports.getEmployeeProfileImage = function (req, res) {
  try {
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Preference Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getEmployeeProfileImage(logparams, req, function (response) {
          //console.log(response);
          ////console.log(response.length);
          if (response != null) {
            const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                    imageurl: response.imageurl,
                    jobrolename: response.currentjobrolename
                  }
                });
              });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey
                }

              });
            });
          }
        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
  catch (e) { logger.error("Error in getEmployeeProfileImage: " + e); }
}



exports.downloadResumePDF = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Personal Info Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
      //   console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYY");
      //  console.log(req.query.isleadtype);
        if (req.query.isleadtype == null || req.query.isleadtype == "null" || req.query.isleadtype == undefined || req.query.isleadtype == NaN) {
        //  console.log("Hi");
          req.query.isleadtype = 0
        }
        //console.log("Entry1")
       objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
        //console.log("Entry2")
       // console.log(profileurl);     
        if(profileurl!=null && profileurl!=0 && profileurl!=""){
          logger.info("Updating generated Resume URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
          const dbo = MongoDB.getDB();
          dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "generatedresumeurl": profileurl } }, function (err, res1) {
            const msgparam = { "messagecode": varconstant.listcode };
           objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
              varstatuscode: varconstant.listcode,
              response: varconstant.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey,
              resumeurl: profileurl
            }

          });
        });
          }); 
        }                 
      });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
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
  catch (e) { logger.error("Error in Personal Info Save / Update: " + e); }
}