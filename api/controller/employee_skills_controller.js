'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/employee_skills_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')
const objGeneratePDF = require('../process/generate_employee_profile_pdf_process_controller')
const objProfileView = require('../process/employee_profile_view_process_controller')

exports.getSkillLoad = function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Skill Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getSkillLoad(logparams, langparams, function (response) {
          // console.log(response);
          // //console.log(response.length);
          if (response != null && response.jobfunctionlist.length > 0 && response.jobrolelist.length > 0 && response.skilllist.length > 0) {
            //return res.status(200).json({
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                skills_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  jobfunctionlist: response.jobfunctionlist,
                  jobrolelist: response.jobrolelist,
                  skills: response.skilllist,
                  maxskillcount: response.settingsresult[0].employee_skill_count
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                skills_json_result: {
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
            skills_json_result: {
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
  catch (e) { logger.error("Error in Skill Load: " + e); }
}

exports.SkillsProfileDelete = function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Skills Delete', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var prefparams = { "employeecode": req.query.employeecode, "jobfunctioncode": req.query.jobfunctioncode, "jobrolecode": req.query.jobrolecode };
        ////console.log("hi");
        ////console.log(prefparams);
        objProfile.getSkillInfo_Delete(logparams, prefparams,Number(req.query.isleadtype), function (empprofile) {
          ////console.log(empsinglepref);
          //var empreferencelist =[];
          var empfinallist = [];
          ////console.log("initiate");
          // //console.log(empprofile[0].referenceinfo);
          empfinallist = empprofile;
          //empreferencelist.push(req.body);

          objProfile.SkillSavefunc(empfinallist, req.query.employeecode, logparams,Number(req.query.isleadtype), function (profileresult) {

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
                  skills_json_result: {
                    varstatuscode: varconstant.deletecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                  }
                });
              });
              if(Number(req.query.isleadtype)==0){
                objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
                  ////console.log(profileurl);     
                  if (profileurl != null && profileurl != 0 && profileurl != "") {
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
            skills_json_result: {
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
  catch (e) { logger.error("Error in Delete skills: " + e); }
}
exports.SkillsProfileList = function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Skill List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var prefparams = { "employeecode": req.query.employeecode, "languagecode": req.query.languagecode };
        ////console.log("hi");
        ////console.log(prefparams);
        objProfile.getSkillsList(logparams, prefparams, Number(req.query.isleadtype),function (empprofile) {
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
                skills_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  skilllist: empprofile
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
                skills_json_result: {
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
            skills_json_result: {
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
  catch (e) { logger.error("Error in Skill list: " + e); }
}

exports.SkillSave = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Skill Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var empcodeparams = { "employeecode": Number(req.query.employeecode) };
        objProfile.getSkillInfo(logparams, empcodeparams,Number(req.query.isleadtype), function (empprofile) {
          var empskilllist = [];
          var empskillinsertlist = [];
          var empparams = { "employeecode": Number(req.query.employeecode), "jobrolecode": Number(req.body.jobrolecode), "jobfunctioncode": Number(req.body.jobfunctioncode) };

          if (empprofile != null && empprofile.length > 0 && empprofile[0].skills != null) {
            empskilllist = empprofile[0].skills;
            ////console.log("emp",empskilllist);
            //empskillinsertlist=empskilllist;
            var empskillinsertlist = empskilllist.filter(function (empskill) {
              return Number(req.body.jobrolecode) != Number(empskill.jobrolecode) ||
                Number(req.body.jobfunctioncode) != Number(empskill.jobfunctioncode);
            });
            ////console.log("filterList",empskillinsertlist);
            if (req.query.typecode == 1) {
              for (var i = 0; i <= req.body.skillcode.length - 1; i++) {
                var skilladd = {
                  "jobfunctioncode": req.body.jobfunctioncode,
                  "jobrolecode": req.body.jobrolecode,
                  "skillcode": req.body.skillcode[i],
                  "currentjobfunction": req.body.currentjobfunction
                }
                empskillinsertlist.push(skilladd);
              }
            }
            else {
              var empskillinsert = empskilllist.filter(function (empskill) {
                return Number(req.body.jobrolecode) == Number(empskill.jobrolecode) &&
                  Number(req.body.jobfunctioncode) == Number(empskill.jobfunctioncode);
              });
              var skillcode = req.body.skillcode;
              // //console.log(empskillinsert);
              var Newskillitem = skillcode.filter(
                function (e) {
                  // //console.log(e);
                  return this.indexOf(e) < 0;
                },
                empskillinsert
              );
              ////console.log(Newskillitem);
              var NewskillcodeList = [];
              for (var i = 0; i <= Newskillitem.length - 1; i++) {
                var skilladd = {
                  "skillcode": Newskillitem[i]
                }
                NewskillcodeList.push(skilladd);
              }
              for (var i = 0; i <= empskillinsert.length - 1; i++) {
                // //console.log( empskillinsert[i].skillcode);
                var skilladd = {
                  "skillcode": empskillinsert[i].skillcode
                }
                NewskillcodeList.push(skilladd);
              }
              var unique = [...new Set(NewskillcodeList.map(a => a.skillcode))];
              ////console.log(unique);
              // var insertitem = [];
              for (var i = 0; i <= unique.length - 1; i++) {
                var skilladd = {
                  "jobfunctioncode": req.body.jobfunctioncode,
                  "jobrolecode": req.body.jobrolecode,
                  "skillcode": unique[i],
                  "currentjobfunction": req.body.currentjobfunction
                }
                empskillinsertlist.push(skilladd);
              }
            }
            // const unique = Array.from(new Set(empskillinsertlist));

            // //console.log(insertitem);
            if (empskillinsertlist != null && empskillinsertlist.length > 0) {
              objProfile.SkillSavefunc(empskillinsertlist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {
                if (profileresult != null && profileresult > 0) {
                  if (Number(req.query.isleadtype) == 0)
                    {
                      var empparams = {"employeecode": Number(req.query.employeecode)};
                      objProfileView.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                      });
                    }
                  const msgparam = { "messagecode": varconstant.savedcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      skills_json_result: {
                        varstatuscode: varconstant.savedcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                      }
                    });
                  });
                  if(Number(req.query.isleadtype)==0){
                    objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
                      ////console.log(profileurl);     
                      if (profileurl != null && profileurl != 0 && profileurl != "") {
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
          }
          else {
            var empskill = req.body.skillcode;
            if (empskill.length > 0) {
              for (var i = 0; i <= empskill.length - 1; i++) {
                var skilladd = {
                  "jobfunctioncode": req.body.jobfunctioncode,
                  "jobrolecode": req.body.jobrolecode,
                  "skillcode": empskill[i],
                  "currentjobfunction": req.body.currentjobfunction
                }
                empskilllist.push(skilladd);
              }
              ////console.log(empskilllist);
              objProfile.SkillSavefunc(empskilllist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {
                if (profileresult != null && profileresult > 0) {
                  const msgparam = { "messagecode": varconstant.savedcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      skills_json_result: {
                        varstatuscode: varconstant.savedcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                      }
                    });
                  });
                  if(Number(req.query.isleadtype)==0){
                    objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
                      ////console.log(profileurl);     
                      if (profileurl != null && profileurl != 0 && profileurl != "") {
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
          }
        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            skills_json_result: {
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
  catch (e) { logger.error("Error in Skill Save: " + e); }
}

exports.getSkillEditLoad = function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Skill Edit Load', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        // objProfile.getSkillLoad(logparams, langparams, function (response) {
        ////console.log(response);
        ////console.log(response.length);
        // if (response != null) {
        // //console.log("Entry Main");
        var empparams = { "employeecode": req.query.employeecode, "jobfunctioncode": req.query.jobfunctioncode, "jobrolecode": req.query.jobrolecode };
        objProfile.SkillEditLoad(logparams, empparams,Number(req.query.isleadtype), function (skilleditresult) {
          if (skilleditresult != null && skilleditresult.length > 0) {
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              ////console.log("Hello");  
              ////console.log(prefresult);
              ////console.log("Hi");
              return res.status(200).json({
                skills_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  // jobfunctionlist: response.jobfunctionlist,
                  // jobrolelist: response.jobrolelist,
                  // skills: response.skilllist,
                  skill_list: skilleditresult
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                skills_json_result: {
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
        //     return res.status(200).json({
        //       skills_json_result: {
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
            skills_json_result: {
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
  catch (e) { logger.error("Error in Skill Load: " + e); }
}