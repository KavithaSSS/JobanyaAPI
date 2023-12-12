'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/employee_profile_view_process_controller')
const objSubscription = require('../process/employee_subscription_process_controller');
const Logger = require('../services/logger_service');
const e = require('connect-timeout');
const logger = new Logger('logs')

exports.getEmployeeProfileViewCount = function (req, res) {
  try {
      var objLogdetails;
      //console.log("Entry")
        var langparams = varconstant.defaultlanguagecode;
        ////console.log(langparams);
        //console.log("Entry2")
        var logUserCode = "";
        var status = 0;
        //var logType = varconstant.portalLogType;
        logUserCode = 1;
       // console.log("Entry2.1")
        //console.log(req.query.usercode);
        var logType = varconstant.portalLogType;
       // console.log("Entry3")
        var params = { "ipaddress": "Automatic_Update", "usercode": logUserCode, "orginator": 'Profile View', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
         // console.log("Entry4")
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        //console.log("Entry5")
        var validemp = true;
        if (validemp == true) {
          var jobcode = "0";
          var empparams = {};
          objProfile.FindAllEmployeeList(req, function(EmployeeResult) {
            //console.log(EmployeeResult);
            if (EmployeeResult != null && EmployeeResult.length > 0)
            {
              var varskip = 0;
              var varlimit = varconstant.defaultlimit;
              var arrayskipvalue = [];
              for (var i = 0; i <= EmployeeResult.length; i = i + varlimit)
              {
                //console.log(i);
                arrayskipvalue.push({skipvalue: i});
              }
              setTimeout(() => {
                exports.EmployeeAutoProfileUpdation(logparams, arrayskipvalue, function(result){
                  const msgparam = { "messagecode": varconstant.updatecode };
                  objUtilities.getMessageDetails(msgparam, function (msgtext) {
                      return res.status(200).json({
                          employee_list_json_result: {
                              response: varconstant.successresponsecode,
                              varstatuscode: varconstant.updatecode,
                              responsestring: msgtext
                          }
                      });
  
                  });
                })
              }, 2000);
              
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                  return res.status(200).json({
                      employee_list_json_result: {
                          response: varconstant.successresponsecode,
                          varstatuscode: varconstant.recordnotfoundcode,
                          responsestring: msgtext
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
  }
  catch (e) { logger.error("Error in Profile View: " + e); }
}



exports.EmployeeAutoProfileUpdation = function (logparams, skipresult, callback) {
  try {
      //console.log("EntryLevel1")
      UpdateAutoEmployeeProfile(logparams, skipresult, function (err, employeecount) {
         // console.log("EntryLevel1.1")
          if (err) {
              return;
          }
          return callback(employeecount);
      });
  }
  catch (e) { logger.error("Error in UpdateMatchingPercentage" + e); }
}



var async = require('async');
function UpdateAutoEmployeeProfile(logparams, skipresult, callback) {
  try {
      //console.log("EntryLevel2")
      var returnval;
      var iteratorFcn = function (skipvalue, done) {
          if (skipvalue == null) {
              done();
              return;
          }

          exports.getEmployeeAutoProfileView(logparams, skipvalue, function (response) {
              returnval = response;
              done();
              return;
          });
      };
      var doneIteratingFcn = function (err) {
          callback(err, returnval);
      };
      async.forEach(skipresult, iteratorFcn, doneIteratingFcn);
  }
  catch (e) { logger.error("Error in UpdateMatchingPercentageToEmployee" + e); }
}


exports.getEmployeeAutoProfileView = function (logparams, skipvalue, callback) {
  try {
      var objLogdetails;
      //console.log("Entry")
        //var langparams = req.query.languagecode;
        ////console.log(langparams);
        //console.log("Entry2")
        //console.log(skipvalue.skipvalue, "Kavitha");
        var logUserCode = "";
        var status = 0;
        //var logType = varconstant.portalLogType;
        logUserCode = logparams.usercode;
       // console.log("Entry2.1")
        //console.log(req.query.usercode);
        var logType = varconstant.portalLogType;
       // console.log("Entry3")
        var params = { "ipaddress": logparams.deviceip, "usercode": logUserCode, "orginator": 'Auto Profile View', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
         // console.log("Entry4")
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        //console.log("Entry5")
    //objUtilities.CheckvalidEmployee_View(req, logType, function (validemp) {
     // console.log(validemp);
     var validemp = true;
      if (validemp == true) {
        var jobcode = "0";
        var empparams = {};
        var skipparams = {
          query: {
            skipvalue: skipvalue.skipvalue,
            limitvalue: varconstant.defaultlimit,
            isleadtype: 0
          }
        }
        objProfile.FindEmployeeList(skipparams, function(EmployeeResult) {
          //console.log(EmployeeResult);
          if (EmployeeResult != null && EmployeeResult.length > 0)
          {
            objProfile.EmployeeProfileUpdation(logparams, EmployeeResult, varconstant.defaultlanguagecode, skipparams, function (prefresult) {
              const msgparam = { "messagecode": varconstant.updatecode };
                                  objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                      return callback({
                                          employee_list_json_result: {
                                              response: varconstant.successresponsecode,
                                              varstatuscode: varconstant.updatecode,
                                              responsestring: msgtext
                                          }
                                      });
  
                                  });
    
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.updatecode };
            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                return callback({
                    employee_list_json_result: {
                        response: varconstant.successresponsecode,
                        varstatuscode: varconstant.updatecode,
                        responsestring: msgtext
                    }
                });

            });
        }
          
        });
        
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return callback({
            employee_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              response: varconstant.successresponsecode,
              responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
            }

          });
        });
      }
    //});

  }
  catch (e) { logger.error("Error in Profile View: " + e); }
}


exports.getEmployeeProfileView = function (req, res) {
  try {
      var objLogdetails;
      //console.log("Entry")
        var langparams = req.query.languagecode;
        ////console.log(langparams);
        //console.log("Entry2")
        var logUserCode = "";
        var status = 0;
        //var logType = varconstant.portalLogType;
        logUserCode = req.query.usercode;
       // console.log("Entry2.1")
        //console.log(req.query.usercode);
        var logType = varconstant.portalLogType;
       // console.log("Entry3")
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Profile View', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
         // console.log("Entry4")
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        //console.log("Entry5")
    objUtilities.CheckvalidEmployee_View(req, logType, function (validemp) {
     // console.log(validemp);
      if (validemp == true) {
        var jobcode = "0";
        var empparams = {};
        objProfile.FindEmployeeList(req, function(EmployeeResult) {
          //console.log(EmployeeResult);
          if (EmployeeResult != null && EmployeeResult.length > 0)
          {
            objProfile.EmployeeProfileUpdation(logparams, EmployeeResult, req.query.languagecode,req, function (prefresult) {
              const msgparam = { "messagecode": varconstant.updatecode };
                                  objUtilities.getMessageDetails(msgparam, function (msgtext) {
                                      return res.status(200).json({
                                          employee_list_json_result: {
                                              response: varconstant.successresponsecode,
                                              varstatuscode: varconstant.updatecode,
                                              responsestring: msgtext
                                          }
                                      });
  
                                  });
    
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.updatecode };
            objUtilities.getMessageDetails(msgparam, function (msgtext) {
                return res.status(200).json({
                    employee_list_json_result: {
                        response: varconstant.successresponsecode,
                        varstatuscode: varconstant.updatecode,
                        responsestring: msgtext
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
  catch (e) { logger.error("Error in Profile View: " + e); }
}


exports.getProfileView = function (req, res) {
  try {
      var objLogdetails;
        var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if(req.query.usercode != null){
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else{
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Profile View', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
    objUtilities.CheckvalidEmployee_View(req, logType, function (validemp) {
      if (validemp == true) {
        var jobcode = "0";
        var empparams = {};
        if(req.query.jobcode!=null){
          jobcode = req.query.jobcode;
          empparams = { "employeecode": Number(req.query.employeecode),"jobcode": jobcode};
        }
        else{
          empparams = { "employeecode": Number(req.query.employeecode)};
        }
      
        ////console.log(empparams);
        objProfile.getProfileView(logparams, empparams, req.query.languagecode,req, function (prefresult) {
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
                personalinfo: prefresult.personalinfo,
                contactinfo: prefresult.contactinfo,
                references: prefresult.references,
                experience: prefresult.experience,
                totalexperience: prefresult.totalexperience,
                expmonth: prefresult.expmonth,
                expyear: prefresult.expyear,
                fresherstatus: prefresult.fresherstatus,
                schooling: prefresult.schooling,
                afterschooling: prefresult.afterschooling,
                preferences: prefresult.preferences,
                skilllist: prefresult.skilllist,
                invitedshortliststatus: prefresult.invitedshortliststatus,
                invitedshortlistdate: prefresult.totalshortlistdate,
                appliedstatus: prefresult.appliedstatus,
                applieddate: prefresult.applieddate,
                invitedstatus: prefresult.invitedstatus,
                inviteddate: prefresult.inviteddate,
                appliedshortliststatus: prefresult.appliedshortliststatus,
                appshortlistdate: prefresult.appshortlistdate,
                wishliststatus: prefresult.wishliststatus,
                wishlistdate: prefresult.wishlistdate,
                abusestatus: prefresult.abusestatus,
                profilestatus: prefresult.profilestatus
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
  catch (e) { logger.error("Error in Profile View: " + e); }
}

exports.getPortalProfileView = function (req, res) {
  try {
      var objLogdetails;
        var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if(req.query.usercode != null){
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else{
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Profile View', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
    objUtilities.CheckvalidEmployee_View(req, logType, function (validemp) {
      if (validemp == true) {
        var jobcode = "0";
        var empparams = {};
        if(req.query.jobcode!=null){
          jobcode = req.query.jobcode;
          empparams = { "employeecode": Number(req.query.employeecode),"jobcode": jobcode};
        }
        else{
          empparams = { "employeecode": Number(req.query.employeecode)};
        }
      
        ////console.log(empparams);
        objProfile.getPortalProfileView(logparams, empparams, req.query.languagecode,req, function (prefresult) {
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
                personalinfo: prefresult.personalinfo,
                contactinfo: prefresult.contactinfo,
                references: prefresult.references,
                experience: prefresult.experience,
                totalexperience: prefresult.totalexperience,
                expmonth: prefresult.expmonth,
                expyear: prefresult.expyear,
                fresherstatus: prefresult.fresherstatus,
                schooling: prefresult.schooling,
                afterschooling: prefresult.afterschooling,
                preferences: prefresult.preferences,
                skilllist: prefresult.skilllist,
                invitedshortliststatus: prefresult.invitedshortliststatus,
                invitedshortlistdate: prefresult.totalshortlistdate,
                appliedstatus: prefresult.appliedstatus,
                applieddate: prefresult.applieddate,
                invitedstatus: prefresult.invitedstatus,
                inviteddate: prefresult.inviteddate,
                appliedshortliststatus: prefresult.appliedshortliststatus,
                appshortlistdate: prefresult.appshortlistdate,
                wishliststatus: prefresult.wishliststatus,
                wishlistdate: prefresult.wishlistdate,
                abusestatus: prefresult.abusestatus,
                profilestatus: prefresult.profilestatus
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
  catch (e) { logger.error("Error in Profile View: " + e); }
}

//Insert customer and contact details
exports.InsertZohoCustomerContactDetails = function (req, res) {
  try {
      objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
          if (userresponse == true) {
            objUtilities.CheckvalidEmployee_View(req, varconstant.employeeLogType, function (validemp) {
                  if (validemp == true) {
                      var objLogdetails;
                      const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update remarks', logdate: new Date(), type: 'Employee' }
                      objUtilities.getLogDetails(logvalues, function (logresponse) {
                          objLogdetails = logresponse;
                      });
                      var logparams = objLogdetails; 
                      objProfile.getProfileDetails(logparams,req.query.languagecode,req, function (prefresult) {
                        if (prefresult) {
                            const insertparams = {
                                contact_name: prefresult.personalinfo.employeefullname,
                                email: prefresult.contactinfo.emailid,
                                phone: prefresult.contactinfo.mobileno, mobileno: prefresult.contactinfo.mobileno,
                                first_name: prefresult.personalinfo.employeefullname, zohocode: req.body.zohocode
                            };
                            //Add Customer and contact information in zoho book customer
                            objProfile.createzohobookcustomercontact(insertparams, function (zohoresponse) {
                              
                                if (zohoresponse) {
                                    if (zohoresponse.data!= null && zohoresponse.data.contact !=null) {
                                        // console.log(zohoresponse.data.contact.contact_id,'zohoresponse.data.contact.contact_id')
                                        if (zohoresponse.data.contact.contact_id) {
                                            var contactpersonid = "";
                                            var contactid = zohoresponse.data.contact.contact_id;
                                            if (zohoresponse.data.contact.contact_persons) {
                                                if (zohoresponse.data.contact.contact_persons[0].contact_person_id) {
                                                    contactpersonid = zohoresponse.data.contact.contact_persons[0].contact_person_id;
                                                }
                                            }
                                            objProfile.UpdateEmployeeZohoContactID(parseInt(req.query.employeecode),
                                                contactid, contactpersonid, function (updateresponse) {
                                                    // console.log(updateresponse,'jobpackage insert result');
                                                    const msgparam = { "messagecode": varconstant.updatecode };
                                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                        return res.status(200).json({
                                                            employee_json_result: {
                                                                varstatuscode: varconstant.updatecode,
                                                                responsestring: msgresult[0].messagetext,
                                                                responsekey: msgresult[0].messagekey,
                                                                response: varconstant.successresponsecode,
                                                            }
                                                        });
                                                    });
                                                });
                                                

                                        }
                                    }
                                    else{
                                      const msgparam = { "messagecode": varconstant.updatecode };
                                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                          return res.status(200).json({
                                              employee_json_result: {
                                                  varstatuscode: varconstant.updatecode,
                                                  responsestring: "Ensure valid zoho details",
                                                  responsekey: msgresult[0].messagekey,
                                                  response: varconstant.successresponsecode,
                                              }
                                          });
                                      });
                                    }
                                }
                                else{
                                  const msgparam = { "messagecode": varconstant.updatecode };
                                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                      return res.status(200).json({
                                          employee_json_result: {
                                              varstatuscode: varconstant.updatecode,
                                              responsestring: "Ensure valid zoho details",
                                              responsekey: msgresult[0].messagekey,
                                              response: varconstant.successresponsecode,
                                          }
                                      });
                                  });
                                }
                            });
                        }
                    });


                    


                  }
                  else {
                      const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                              employermanagement_json_result: {
                                  varstatuscode: objconstants.recordnotfoundcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: objconstants.successresponsecode,
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
                      employermanagement_json_result: {
                          varstatuscode: objconstants.usernotfoundcode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: objconstants.successresponsecode,
                      }
                  });
              });
          }
      });
  }
  catch (e) {
      logger.error("Error in Update Remarks- Employer Management " + e);
  }
}