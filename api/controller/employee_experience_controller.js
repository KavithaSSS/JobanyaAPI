'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/employee_experience_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const objProfileView = require('../process/employee_profile_view_process_controller')
const logger = new Logger('logs')
exports.ExperienceList = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Experience List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var prefparams = { employeecode: Number(req.query.employeecode), languagecode: Number(req.query.languagecode) };
        ////console.log("hi");
        ////console.log(prefparams);
        objProfile.getExperienceInfo(logparams, prefparams, Number(req.query.isleadtype),function (empprofile) {
          ////console.log(empsinglepref);

          ////console.log("initiate");
          ////console.log(empprofile);
          if (empprofile != null && empprofile.length > 0 && empprofile[0].experienceinfo != null) {
            ////console.log("Entry");
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              ////console.log("Hello");  
              ////console.log(prefresult);
              ////console.log("Hi");
              ////console.log(empprofile[0].experienceinfo[0].frommonth);
              if (empprofile[0].experienceinfo[0].frommonth != null) {
                ////console.log("entry");
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                    experienceinfo: empprofile[0].experienceinfo,
                    fresherstatus: empprofile[0].fresherstatus,
                    totalexperience: empprofile[0].totalexperience,
                    expmonth: empprofile[0].expmonth,
                    expyear: empprofile[0].expyear,
                    dateofbirth: empprofile[0].dateofbirth
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
                    fresherstatus: empprofile[0].fresherstatus,
                    totalexperience: empprofile[0].totalexperience,
                    expmonth: empprofile[0].expmonth,
                    expyear: empprofile[0].expyear,
                    dateofbirth: empprofile[0].dateofbirth
                  }
                });
              }

            });
          }
          else {
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
                  fresherstatus: varconstant.freshercode,
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
  catch (e) { logger.error("Error in Experience List: " + e); }
}

//Experience

exports.ExperienceUpdateStatus = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Experience Update Status', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { employeecode: Number(req.query.employeecode) };
        ////console.log("hi");
        ////console.log(prefparams);
        var updateparams;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        if (req.query.type.toLowerCase() == "fresher") {
          updateparams = { "totalexperience": 0,"expmonth": 0,"expyear": 0, "fresherstatus": req.body.fresherstatus };
        }
        else {
          updateparams = { "totalexperience": req.body.totalexperience,"expmonth": req.body.expmonth,"expyear": req.body.expyear, "fresherstatus": 0 };
        }
        objProfile.updateExperiencestatus(updateparams, req.query.employeecode, logparams,Number(req.query.isleadtype), function (profileresult) {

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
  catch (e) { logger.error("Error in Experience Update Status: " + e); }
}


exports.ExperienceSave = async function (req, res) {
  try {
     const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Experience Info Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        ////console.log(Number(req.body.frommonth), '01', Number(req.body.fromyear));
        var fromdate = Number(req.body.frommonth) + '/01/' + Number(req.body.fromyear);
        var todate = Number(req.body.tomonth) + '/01/' + Number(req.body.toyear);
        //var fromdate = new Date(fromdatestr);
        //var todate = new Date(todatestr);
        var dateparams = { "fromdate": fromdate, "todate": todate };
        var empparams = { "employeecode": Number(req.query.employeecode), "languagecode": Number(req.query.languagecode) };
        ////console.log("Date compare");
        ////console.log(empparams);
        ////console.log(dateparams);
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        objProfile.ExperienceDuplicateCheck(logparams, dateparams, empparams, Number(req.query.isleadtype),function (dateresult) {
          if (dateresult == false) {
            objProfile.getExperienceDetails(logparams, empparams,Number(req.query.isleadtype), function (empprofile) {
              ////console.log(empsinglepref);
              var empexplist = [];
              ////console.log("initiate");
              // //console.log(empprofile[0].referenceinfo);
              if (empprofile != null && empprofile[0].experienceinfo != null) {
                ////console.log("Entry");
                empexplist = empprofile[0].experienceinfo;
              }
              objProfile.getExperienceMaxcode(logparams, req.query.employeecode, Number(req.query.isleadtype),function (maxrefcode) {
                req.body.experiencecode = maxrefcode;
                //req.body.frommonth = Number(req.body.frommonth);
                //req.body.tomonth = Number(req.body.tomonth);
                //req.body.experiencecode = maxrefcode;
                //req.body.experiencecode = maxrefcode;
                ////console.log("hello");
                ////console.log(maxrefcode);
                ////console.log(req.body);
                ////console.log(empreferencelist);
                empexplist.push(req.body);

                objProfile.experiencesave(empexplist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {

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
                    objProfile.updateTotalExperience(req.query.employeecode, req.query.isleadtype,function (profileresult) {

                    });
                  }



                });
              });

            });
          }
          else {
            const msgparam = { "messagecode": varconstant.existcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.existcode,
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
  catch (e) { logger.error("Error in Experience Save: " + e); }
}

exports.ExperienceUpdate = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Experience Info Update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        ////console.log(Number(req.body.frommonth), '01', Number(req.body.fromyear));
        var fromdate = Number(req.body.frommonth) + '/01/' + Number(req.body.fromyear);
        var todate = Number(req.body.tomonth) + '/01/' + Number(req.body.toyear);
        //var fromdate = new Date(fromdatestr);
        //var todate = new Date(todatestr);
        var dateparams = { "fromdate": fromdate, "todate": todate };
        var empparams = { "employeecode": Number(req.query.employeecode) };
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        ////console.log("Date compare");
        ////console.log(empparams);
        ////console.log(dateparams);
        objProfile.ExperienceDuplicateCheckEdit(logparams, dateparams, empparams, req.query.experiencecode,Number(req.query.isleadtype), function (dateresult) {
          if (dateresult == false) {
            objProfile.getExperienceDetails(logparams, empparams,Number(req.query.isleadtype), function (empprofile) {
              ////console.log(empsinglepref);
              var empexplist = [];
              ////console.log("initiate");
              // //console.log(empprofile[0].referenceinfo);
              if (empprofile != null && empprofile[0].experienceinfo != null) {
                ////console.log("Entry");
                empexplist = empprofile[0].experienceinfo;
              }
              for (var i = 0; i <= empexplist.length - 1; i++) {
                if (req.query.experiencecode == empexplist[i].experiencecode) {
                  req.body.experiencecode = Number(req.query.experiencecode);
                  empexplist[i] = req.body;
                }
              }

              objProfile.experiencesave(empexplist, req.query.employeecode, logparams,Number(req.query.isleadtype), function (profileresult) {
                if (Number(req.query.isleadtype) == 0)
                {
                  var empparams = {"employeecode": Number(req.query.employeecode)};
                  objProfileView.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                  });
                }
                if (profileresult == true) {
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
                  objProfile.updateTotalExperience(req.query.employeecode, req.query.isleadtype,function (profileresult) {

                  });
                }



              });

            });
          }
          else {
            const msgparam = { "messagecode": varconstant.existcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.existcode,
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
  catch (e) { logger.error("Error in Experience Update: " + e); }
}

exports.ExperienceDelete = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Experience Info Delete', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var empparams = { "employeecode": Number(req.query.employeecode) };
        objProfile.getExperienceDetails(logparams, empparams,Number(req.query.isleadtype), function (empprofile) {
          ////console.log(empsinglepref);
          var empexplist = [];
          var empfinallist = [];
          var Deleteflag;
          if (empprofile != null && empprofile[0].experienceinfo != null) {
            ////console.log("Entry");
            empexplist = empprofile[0].experienceinfo;
          }
          for (var i = 0; i <= empexplist.length - 1; i++) {
            if (req.query.experiencecode != empexplist[i].experiencecode) {
              empfinallist.push(empexplist[i]);
            }
            else {
              ////console.log("entry")
              Deleteflag = 1;
            }
          }
          if (Deleteflag == 1) {
            objProfile.experiencesave(empfinallist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {
              if (profileresult == true) {
                if (Number(req.query.isleadtype) == 0)
                {
                  var empparams = {"employeecode": Number(req.query.employeecode)};
                  objProfileView.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                  });
                }
                const msgparam = { "messagecode": varconstant.deletecode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.deletecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                    }
                  });
                });
                objProfile.updateTotalExperience(req.query.employeecode, req.query.isleadtype,function (profileresult) {

                });
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
  catch (e) { logger.error("Error in Experience Delete: " + e); }
}

exports.getExperienceEditLoad = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Experience Edit Load Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var editparams = { "employeecode": req.query.employeecode, "experiencecode": req.query.experiencecode }
        objProfile.getExperienceEditLoad(logparams, editparams, Number(req.query.isleadtype),function (editresult) {
          if (editresult.length > 0) {
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  experienceinfo: editresult[0].experienceinfo
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
  catch (e) { logger.error("Error in Experience Load: " + e); }
}
exports.getExperienceFormload = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Experience Form Load Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        objProfile.getMonthinfo(logparams,req.query.employeecode, Number(req.query.isleadtype),function (result) {
          if (result != null) {
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  monthlist: result.monthlist,
                  dateofbirth: result.dateofbirth
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
  catch (e) { logger.error("Error in Experience Load: " + e); }
}

exports.UpdateTotalExperience = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    var prefparams = { employeecode: Number(req.query.employeecode), languagecode: 2 };
    objProfile.updateTotalExperience(req.query.employeecode,Number(req.query.isleadtype), function (empprofile) {
      if (empprofile != null) {
        const msgparam = { "messagecode": varconstant.listcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
              varstatuscode: varconstant.listcode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey,
              response: varconstant.successresponsecode,
              empprofile: empprofile
            }
          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Experience List: " + e); }
}