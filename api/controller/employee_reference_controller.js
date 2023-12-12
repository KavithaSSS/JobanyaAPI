'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/employee_reference_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')
const objGeneratePDF = require('../process/generate_employee_profile_pdf_process_controller')
const objProfileView = require('../process/employee_profile_view_process_controller')
//Reference
exports.getReferenceLoad = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;

        var langparams = varconstant.defaultlanguagecode;
        if (req.query.languagecode != null)
        {
          langparams = req.query.languagecode;
        }
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Reference Load', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getReferenceLoad(logparams, langparams, function (response) {
          ////console.log(response);
          ////console.log(response.length);
          if (response != null) {
            //return res.status(200).json({
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
                  relationship: response,

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
  catch (e) { logger.error("Error in Reeference Load: " + e); }
}

exports.getReferenceEditLoad = function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Reference Edit Load Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        // objProfile.getReferenceLoad(logparams, function (response) {
        ////console.log(response);
        ////console.log(response.length);
        // if (response != null) {
        var editparams = { "employeecode": req.query.employeecode, "referencecode": req.query.referencecode }
        objProfile.getReferenceEditLoad(logparams, editparams, Number(req.query.isleadtype), function (editresult) {
          if (editresult.length > 0) {
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
                  // relationship: response,
                  referenceinfo: editresult
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              ////console.log("Hello");  
              ////console.log(prefresult);
              ////console.log("Hi");
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                }
              });
            });
          }
        });
        //return res.status(200).json({

        // }
        // else {
        //   const msgparam = { "messagecode": varconstant.recordnotfoundcode };
        //   objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
        //     ////console.log("Hello");  
        //     ////console.log(prefresult);
        //     ////console.log("Hi");
        //     return res.status(200).json({
        //       employee_json_result: {
        //         varstatuscode: varconstant.recordnotfoundcode,
        //         responsestring: msgresult[0].messagetext,
        //         responsekey: msgresult[0].messagekey,
        //         response: varconstant.successresponsecode,
        //       }
        //     });
        //   });
        // }
        // });
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
  catch (e) { logger.error("Error in Reference Load: " + e); }
}

exports.referenceSave = function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Reference Info Save', "type": logType };
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
        objProfile.getReferenceInfo(logparams, prefparams,Number(req.query.isleadtype), function (empprofile) {
          ////console.log(empsinglepref);
          var empreferencelist = [];
          ////console.log("initiate");
          // //console.log(empprofile[0].referenceinfo);
          if (empprofile[0].referenceinfo != null) {
            ////console.log("Entry");
            empreferencelist = empprofile[0].referenceinfo;
          }
          objProfile.getReferenceMaxcode(logparams, req.query.employeecode,Number(req.query.isleadtype), function (maxrefcode) {
            req.body.referencecode = maxrefcode;
            ////console.log("hello");
            ////console.log(maxrefcode);
            ////console.log(req.body);
            ////console.log(empreferencelist);
            empreferencelist.push(req.body);

            objProfile.referencesave(empreferencelist, req.query.employeecode, Number(req.query.isleadtype),logparams, function (profileresult) {

              if (profileresult != null && profileresult > 0) {
                if (Number(req.query.isleadtype) == 0)
                      {
                        var empparams = {"employeecode": Number(req.query.employeecode)};
                        objProfileView.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                        });
                      }
                const msgparam = { "messagecode": varconstant.createcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.createcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                    }
                  });
                });
                if(Number(req.query.isleadtype)==0){
                  //console.log("Entry1")
                  objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
                    //console.log(profileurl);     
                    if(profileurl!=null && profileurl!=0 && profileurl!=""){
                      //console.log("Entry3")
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
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Reference Save / Update: " + e); }
}

exports.referenceUpdate = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var updateflag;
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Reference Info Update', "type": logType };
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
        objProfile.getReferenceInfo(logparams, prefparams,Number(req.query.isleadtype), function (empprofile) {
          ////console.log(empsinglepref);
          var empreferencelist = [];
          ////console.log("initiate");
          // //console.log(empprofile[0].referenceinfo);
          if (empprofile[0].referenceinfo != null) {
            ////console.log("Entry");
            empreferencelist = empprofile[0].referenceinfo;
          }
          for (var i = 0; i <= empreferencelist.length - 1; i++) {
            if (empreferencelist[i].referencecode == Number(req.query.referencecode)) {
              req.body.referencecode = Number(req.query.referencecode);
              empreferencelist[i] = req.body;
              updateflag = 0;
              break;
            }
            else {
              updateflag = 1;
            }
          }
          //empreferencelist.push(req.body);
          if (updateflag == 1) {

            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                }

              });
            });
          }
          else {
            objProfile.referencesave(empreferencelist, req.query.employeecode, Number(req.query.isleadtype),logparams, function (profileresult) {

              if (profileresult != null && profileresult > 0) {
                if (Number(req.query.isleadtype) == 0)
                      {
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
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Reference Save / Update: " + e); }
}

exports.referenceDelete = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var deleteflag;
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Reference Info Delete', "type": logType };
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
        objProfile.getReferenceInfo(logparams, prefparams,Number(req.query.isleadtype), function (empprofile) {
          ////console.log(empsinglepref);
          var empreferencelist = [];
          var empfinallist = [];
          ////console.log("initiate");
          // //console.log(empprofile[0].referenceinfo);
          if (empprofile[0].referenceinfo != null) {
            ////console.log("Entry");
            empreferencelist = empprofile[0].referenceinfo;
          }
          for (var i = 0; i <= empreferencelist.length - 1; i++) {
            if (empreferencelist[i].referencecode != Number(req.query.referencecode)) {
              //req.body.referencecode = Number(req.query.referencecode);
              empfinallist.push(empreferencelist[i]);
            }
            else {
              deleteflag = 1;
            }
          }
          //empreferencelist.push(req.body);
          if (deleteflag == 1) {
            objProfile.referencesave(empfinallist, req.query.employeecode, Number(req.query.isleadtype),logparams, function (profileresult) {

              if (profileresult != null && profileresult > 0) {
                if (Number(req.query.isleadtype) == 0)
                      {
                        var empparams = {"employeecode": Number(req.query.employeecode)};
                        objProfileView.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                        });
                      }
                const msgparam = { "messagecode": varconstant.deletecode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.deletecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                    }
                  });
                });
                if(Number(req.query.isleadtype)==0){
                  objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode,  req, function (profileurl) {
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
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
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
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Reference Delete: " + e); }
}
exports.referenceList = function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Reference Info List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { employeecode: Number(req.query.employeecode) };
        ////console.log("hi");
        ////console.log(prefparams);
        var languagecode = varconstant.defaultlanguagecode;
        if (req.query.languagecode != null)
        {
          languagecode = req.query.languagecode;
        }
        objProfile.getReferenceList(logparams, prefparams, languagecode,Number(req.query.isleadtype), function (empprofile) {
          ////console.log(empsinglepref);

          ////console.log("initiate");
          // //console.log(empprofile[0].referenceinfo);
          if (empprofile.length > 0) {
            ////console.log("Entry");
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
                  referenceinfo: empprofile
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              ////console.log("Hello");  
              ////console.log(prefresult);
              ////console.log("Hi");
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
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Reference List: " + e); }
}
