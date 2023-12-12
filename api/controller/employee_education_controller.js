'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/employee_education_process_controller')
const objProfileView = require('../process/employee_profile_view_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')

//Schooling

exports.getSchoolingLoad = async function (req, res) {
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
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Schooling Load', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getProfileSchoolingLoad(logparams, req.query.employeecode,Number(req.query.isleadtype), function (response) {
          objProfile.getYearList(function (yearlist) {
            // objProfile.getMonthinfo(function (monthlist) {
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
                    qualification: response.category,
                    startingyears: yearlist,
                    dateofbirth: response.dateofbirth
                    // monthlist:monthlist
                  }
                });

              });
            }
            // });
          });
          ////console.log(response);
          ////console.log(response.length);


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
  catch (e) { logger.error("Error in Schooling Load: " + e); }
}

exports.SchoolingSave = async function (req, res) {
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
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Schooling Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        ////console.log(Number(req.body.frommonth), '01', Number(req.body.fromyear));

        var empparams = { "employeecode": Number(req.query.employeecode), "schooling.qualificationcode": Number(req.body.qualificationcode) };
        ////console.log("Date compare");
        ////console.log(empparams);
        ////console.log(dateparams);
        objProfile.SchoolingDuplicateCheck(logparams, empparams,Number(req.query.isleadtype), function (dateresult) {
          if (dateresult == false) {
            var empcodeparams = { "employeecode": Number(req.query.employeecode) };

            objProfile.getSchoolingInfo(logparams, empcodeparams, Number(req.query.isleadtype),function (empprofile) {
              ////console.log(empsinglepref);
              var empschoollist = [];
              ////console.log("initiate");
              // //console.log(empprofile[0].referenceinfo);
              if (empprofile[0].schooling != null) {
                ////console.log("Entry");
                empschoollist = empprofile[0].schooling;
              }
              var belowsslcstatus = false;
              if (empschoollist.length > 0) {
                if (Number(req.body.qualificationcode) == varconstant.belowsslccode) {
                  belowsslcstatus = true;
                }
                for (var i = 0; i <= empschoollist.length - 1; i++) {
                  if (empschoollist[i].qualificationcode == varconstant.belowsslccode) {
                    belowsslcstatus = true;
                    ////console.log("b", belowsslcstatus);
                  }
                }
              }
              ////console.log(belowsslcstatus);
              if (belowsslcstatus == false) {
                objProfile.getSchoolingMaxcode(logparams, req.query.employeecode, Number(req.query.isleadtype),function (maxrefcode) {
                  req.body.schoolingcode = maxrefcode;
                  ////console.log("hello");
                  ////console.log(maxrefcode);
                  ////console.log(req.body);
                  ////console.log(empreferencelist);
                  empschoollist.push(req.body);

                  objProfile.Schoolingsave(empschoollist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {

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
                    }



                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.schoolqualerrorcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.schoolqualerrorcode,
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
  catch (e) { logger.error("Error in Schooling Save: " + e); }
}

exports.SchoolingUpdate = async function (req, res) {
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
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Schooling Update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        ////console.log(Number(req.body.frommonth), '01', Number(req.body.fromyear));

        var empparams = { "employeecode": Number(req.query.employeecode), "schooling.qualificationcode": Number(req.body.qualificationcode), "schooling.schoolingcode": { $ne: Number(req.query.schoolingcode) } };
        ////console.log("Date compare");
        ////console.log(empparams);
        ////console.log(dateparams);
        objProfile.SchoolingDuplicateCheck(logparams, empparams, Number(req.query.isleadtype),function (dateresult) {
          if (dateresult == false) {
            var empcodeparams = { "employeecode": Number(req.query.employeecode) };

            objProfile.getSchoolingInfo(logparams, empcodeparams, Number(req.query.isleadtype),function (empprofile) {
              ////console.log(empsinglepref);
              var empschoollist = [];
              ////console.log("initiate");
              // //console.log(empprofile[0].referenceinfo);
              if (empprofile[0].schooling != null) {
                ////console.log("Entry");
                ////console.log(empprofile[0].schooling);
                empschoollist = empprofile[0].schooling;
              }
              var tempschoollist = empschoollist;
              var belowsslcstatus = false;

              for (var i = 0; i <= empschoollist.length - 1; i++) {
                if (Number(req.body.qualificationcode) == varconstant.belowsslccode && empschoollist[i].schoolingcode != Number(req.query.schoolingcode)) {
                  belowsslcstatus = true;
                }
                for (var j = 0; j <= tempschoollist.length - 1; j++) {
                  if (tempschoollist[j].qualificationcode == varconstant.belowsslccode && tempschoollist[j].schoolingcode != Number(req.query.schoolingcode)) {
                    belowsslcstatus = true;
                  }
                }
                if (Number(empschoollist[i].schoolingcode) == Number(req.query.schoolingcode)) {
                  ////console.log("Hi entry")
                  req.body.schoolingcode = Number(req.query.schoolingcode);
                  empschoollist[i] = req.body;
                }
              }
              if (belowsslcstatus == false) {
                objProfile.Schoolingsave(empschoollist, req.query.employeecode, logparams,Number(req.query.isleadtype), function (profileresult) {

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
                const msgparam = { "messagecode": varconstant.schoolqualerrorcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.schoolqualerrorcode,
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
  catch (e) { logger.error("Error in Schooling Update: " + e); }
}

exports.SchoolingDelete = async function (req, res) {
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
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Schooling Delete', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var empparams = { "employeecode": Number(req.query.employeecode), "schooling.qualificationcode": Number(req.body.qualificationcode), "schooling.schoolingcode": { $ne: req.query.schoolingcode } };
        var empcodeparams = { "employeecode": Number(req.query.employeecode) };

        objProfile.getSchoolingInfo(logparams, empcodeparams,Number(req.query.isleadtype), function (empprofile) {
          var empschoollist = [];
          var finalschoollist = [];
          var deleteflag;
          if (empprofile[0].schooling != null) {
            empschoollist = empprofile[0].schooling;
          }
          objProfile.getAfterSchoolingCount(logparams, req.query.employeecode,Number(req.query.isleadtype), function (afterschoolresult) {
            ////console.log(empschoollist.length);
            ////console.log(afterschoolresult);
            ////console.log(afterschoolresult.length);
            ////console.log(afterschoolresult[0].afterschoolingcode);
            ////console.log(req.query.schoolingcode);
            if (empschoollist.length == 1 && afterschoolresult == 1) {
              const msgparam = { "messagecode": varconstant.alreadyinusecode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.alreadyinusecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                  }
                });
              });
            }
            else {
              for (var i = 0; i <= empschoollist.length - 1; i++) {
                if (empschoollist[i].schoolingcode != req.query.schoolingcode) {
                  finalschoollist.push(empschoollist[i]);
                }
                else {
                  deleteflag = 1;
                }
              }
              if (deleteflag == 1) {
                objProfile.Schoolingsave(finalschoollist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {
                  if (profileresult != null && profileresult > 0) {
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
  catch (e) { logger.error("Error in Schooling Delete: " + e); }
}

exports.getSchoolingEditLoad = async function (req, res) {
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
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Schooling Edit Load', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        // objProfile.getProfileSchoolingLoad(logparams, function (response) {
        //   objProfile.getYearList(function (yearlist) {
        //     if (response != null) {
        //return res.status(200).json({
        var editparams = { "employeecode": Number(req.query.employeecode), "schooling.schoolingcode": Number(req.query.schoolingcode) };
        ////console.log(editparams);
        objProfile.getSchoolingEditLoad(logparams, editparams,Number(req.query.isleadtype), function (editresult) {
          if (editresult.length > 0) {
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  // qualification: response,
                  // startingyears: yearlist,
                  schoolinfo: editresult
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

        // }
        // });
        ////console.log(response);
        ////console.log(response.length);


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
  catch (e) { logger.error("Error in schooling edit Load: " + e); }
}

//AfterSchooling

exports.getAfterSchoolingLoad = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'After Schooling Load', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var logparams = objLogdetails;
        objProfile.getProfileAfterSchoolingLoad(logparams, langparams, req.query.employeecode,Number(req.query.isleadtype), function (response) {
          objProfile.getYearList(function (yearlist) {
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
                    educationcategory: response.educationcategorylist,
                    qualification: response.qualificationlist,
                    specialization: response.specializationlist,
                    startingyears: yearlist,
                    dateofbirth: response.dateofbirth

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
  catch (e) { logger.error("Error in After Schooling Load: " + e); }
}

exports.AfterSchoolingSave = async function (req, res) {
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

        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'After Schooling Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        ////console.log(Number(req.body.frommonth), '01', Number(req.body.fromyear));

        var empparams = { "employeecode": Number(req.query.employeecode), "afterschooling.qualificationcode": Number(req.body.qualificationcode), "afterschooling.specializationcode": Number(req.body.specializationcode) };
        ////console.log("Date compare");
        ////console.log(empparams);
        ////console.log(dateparams);
        objProfile.getSchoolingCount(logparams, req.query.employeecode,Number(req.query.isleadtype), function (schoolcount) {
          if (schoolcount > 0) {
            objProfile.AfterSchoolingDuplicateCheck(logparams, empparams,Number(req.query.isleadtype), function (dateresult) {
              if (dateresult == false) {
                var empcodeparams = { "employeecode": Number(req.query.employeecode) };

                if(Number(req.body.iscurrentlypursuing)==0){
                  objProfile.getYearMaxValue(logparams, req.query.employeecode, Number(req.body.yearofpassing), Number(req.query.isleadtype),function (yearresult) {
                    if (yearresult == true) {
                      objProfile.getAfterSchoolingInfo(logparams, empcodeparams,Number(req.query.isleadtype), function (empprofile) {
                        ////console.log(empsinglepref);
                        var empschoollist = [];
                        ////console.log("initiate");
                        // //console.log(empprofile[0].referenceinfo);
                        if (empprofile[0].afterschooling != null) {
                          ////console.log("Entry");
                          empschoollist = empprofile[0].afterschooling;
                        }
                        objProfile.getAfterSchoolingMaxcode(logparams, req.query.employeecode, Number(req.query.isleadtype),function (maxrefcode) {
                          req.body.afterschoolingcode = maxrefcode;
                          ////console.log("hello");
                          ////console.log(maxrefcode);
                          ////console.log(req.body);
                          ////console.log(empreferencelist);
                          empschoollist.push(req.body);
  
                          objProfile.AfterSchoolingsave(empschoollist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {
  
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
                            }
  
  
  
                          });
                        });
  
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
                  });
                }
                else{
                  objProfile.getAfterSchoolingInfo(logparams, empcodeparams, Number(req.query.isleadtype),function (empprofile) {
                    ////console.log(empsinglepref);
                    var empschoollist = [];
                    ////console.log("initiate");
                    // //console.log(empprofile[0].referenceinfo);
                    if (empprofile[0].afterschooling != null) {
                      ////console.log("Entry");
                      empschoollist = empprofile[0].afterschooling;
                    }
                    objProfile.getAfterSchoolingMaxcode(logparams, req.query.employeecode, Number(req.query.isleadtype),function (maxrefcode) {
                      req.body.afterschoolingcode = maxrefcode;
                      ////console.log("hello");
                      ////console.log(maxrefcode);
                      ////console.log(req.body);
                      ////console.log(empreferencelist);
                      empschoollist.push(req.body);

                      objProfile.AfterSchoolingsave(empschoollist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {

                        if (profileresult != null && profileresult > 0) {
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
                        }



                      });
                    });

                  });
                }

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
            const msgparam = { "messagecode": varconstant.updateschoolingcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.updateschoolingcode,
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
  catch (e) { logger.error("Error in After Schooling Save: " + e); }
}

exports.AfterSchoolingUpdate = async function (req, res) {
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
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'After Schooling Update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        ////console.log(Number(req.body.frommonth), '01', Number(req.body.fromyear));

        var empparams = { "employeecode": Number(req.query.employeecode), "schooling.qualificationcode": Number(req.body.qualificationcode), "schooling.specializationcode": Number(req.body.specializationcode), "afterschooling.afterschoolingcode": { $ne: Number(req.query.schoolingcode) } };
        ////console.log("Date compare");
        ////console.log(empparams);
        ////console.log(dateparams);
        objProfile.AfterSchoolingDuplicateCheck(logparams, empparams,Number(req.query.isleadtype), function (dateresult) {
          if (dateresult == false) {
            var empcodeparams = { "employeecode": Number(req.query.employeecode) };

            objProfile.getAfterSchoolingInfo(logparams, empcodeparams,Number(req.query.isleadtype),function (empprofile) {
              ////console.log(empsinglepref);
              var empschoollist = [];
              ////console.log("initiate");
              // //console.log(empprofile[0].referenceinfo);
              if (empprofile[0].afterschooling != null) {
                ////console.log("Entry");
                ////console.log(empprofile[0].schooling);
                empschoollist = empprofile[0].afterschooling;
              }
              for (var i = 0; i <= empschoollist.length - 1; i++) {
                if (Number(empschoollist[i].afterschoolingcode) == Number(req.query.afterschoolingcode)) {
                  ////console.log("Hi entry")
                  req.body.afterschoolingcode = Number(req.query.afterschoolingcode);
                  empschoollist[i] = req.body;
                }
              }
              ////console.log(empschoollist);
              objProfile.AfterSchoolingsave(empschoollist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {

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
  catch (e) { logger.error("Error in After Schooling Update: " + e); }
}

exports.AfterSchoolingDelete = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'After Schooling Delete', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        ////console.log(Number(req.body.frommonth), '01', Number(req.body.fromyear));

        // var empparams ={"employeecode": Number(req.query.employeecode), "schooling.qualificationcode": Number(req.body.qualificationcode), "schooling.schoolingcode":{$ne:req.query.schoolingcode}};
        ////console.log("Date compare");
        ////console.log(empparams);
        ////console.log(dateparams);
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        var empcodeparams = { "employeecode": Number(req.query.employeecode) };

        objProfile.getAfterSchoolingInfo(logparams, empcodeparams, Number(req.query.isleadtype),function (empprofile) {
          ////console.log(empsinglepref);
          var empafterschoollist = [];
          var finalafterschoollist = [];
          ////console.log("initiate");
          // //console.log(empprofile[0].referenceinfo);
          if (empprofile[0].afterschooling != null) {
            ////console.log("Entry");
            empafterschoollist = empprofile[0].afterschooling;
          }
          for (var i = 0; i <= empafterschoollist.length - 1; i++) {
            if (empafterschoollist[i].afterschoolingcode != req.query.afterschoolingcode) {
              //req.body.schoolingcode =Number(req.query.schoolingcode);
              finalafterschoollist.push(empafterschoollist[i]);
            }
          }
          objProfile.AfterSchoolingsave(finalafterschoollist, req.query.employeecode, logparams, Number(req.query.isleadtype),function (profileresult) {

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
  catch (e) { logger.error("Error in After Schooling Delete: " + e); }
}

exports.getAfterSchoolingEditLoad = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'After Schooling Edit Load', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        // objProfile.getProfileAfterSchoolingLoad(logparams,langparams, function (response) {
        //   objProfile.getYearList(function (yearlist) {
        //     if (response != null) {
        //return res.status(200).json({
          if (req.query.isleadtype == null) {
            req.query.isleadtype = 0
          }
        var editparams = { "employeecode": Number(req.query.employeecode), "afterschooling.afterschoolingcode": Number(req.query.afterschoolingcode) };
        ////console.log(editparams);
        objProfile.getAfterSchoolingEditLoad(logparams, editparams, Number(req.query.isleadtype),function (editresult) {
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
                  // educationcategory: response.educationcategorylist,
                  // qualification: response.qualificationlist,
                  // specialization: response.specializationlist,
                  // startingyears: yearlist,
                  afterschooling: editresult
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
                  responsekey: msgresult[0].messagekey,
                }

              });
            });
          }

        });

        //   }
        // });
        ////console.log(response);
        ////console.log(response.length);


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
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in After schooling Load: " + e); }
}

exports.EducationList = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Education List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { employeecode: Number(req.query.employeecode) };
        objProfile.getEducationInfo(logparams, prefparams, req.query.languagecode, Number(req.query.isleadtype),function (empprofile) {
          if (empprofile != null) {
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  schooling: empprofile.schoollist,
                  afterschooling: empprofile.afterschoollist
                }
              });
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
  catch (e) { logger.error("Error in Education List: " + e); }
}
