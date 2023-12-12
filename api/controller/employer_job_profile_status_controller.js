"use strict";
const objUtilities = require("./utilities");
const mongoose = require("mongoose");
const MongoDB = require("../../config/database");
const objconstants = require("../../config/constants");
const objJobstatus = require("../process/employer_job_profile_status_process_controller");
const objInvitedList = require("../process/employee_invited_process_controller");
const objJobView = require("../process/employee_job_view_process_controller");
const objSendNotification = require("../process/send_notification_process_controller");
const objProfile = require("../process/employee_profile_view_process_controller");
const Logger = require("../services/logger_service");
const logger = new Logger("logs");
exports.WishListSave = async function (req, res) {
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
    objUtilities.checkvalidemployer(
      req.query.employercode,
      function (validemp) {
        if (validemp == true) {
          var logType = "";
          if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
          else logType = objconstants.AppEmployerLogType;
          var objLogdetails;
          const logvalues = {
            ipaddress: req.query.ipaddress,
            usercode: req.query.employercode,
            orginator: "Job status wishlist save",
            logdate: new Date(),
            type: logType,
          };
          objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
          });
          var logparams = objLogdetails;
          if (req.query.appcode == 1 || req.query.appcode == 2) {
            var params = {
              employercode: Number(req.query.employercode),
              jobcode: Number(req.body.jobcode),
              employeecode: Number(req.body.employeecode),
            };
            objJobstatus.FindSingleRecord(
              logparams,
              params,
              function (validrecord) {
                console.log(validrecord);
                if (validrecord != null && validrecord.length > 0) {
                  objJobstatus.UpdateRecord(
                    logparams,
                    req,
                    function (updateresult) {
                      if (updateresult != null && updateresult > 0) {
                        if (
                          Number(req.body.statuscode) ==
                          objconstants.wishlistedstatus
                        ) {
                          const msgparam = {
                            messagecode: objconstants.employerwishedcode,
                          };
                          objUtilities.getMessageDetailWithkeys(
                            msgparam,
                            function (msgresult) {
                              return res.status(200).json({
                                employer_json_result: {
                                  varstatuscode:
                                    objconstants.employerwishedcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: objconstants.successresponsecode,
                                },
                              });
                            }
                          );
                        } else {
                          const msgparam = {
                            messagecode: objconstants.employerunwishedcode,
                          };
                          objUtilities.getMessageDetailWithkeys(
                            msgparam,
                            function (msgresult) {
                              return res.status(200).json({
                                employer_json_result: {
                                  varstatuscode:
                                    objconstants.employerunwishedcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: objconstants.successresponsecode,
                                },
                              });
                            }
                          );
                        }
                      }
                    }
                  );
                } else {
                  objUtilities.InsertLog(logparams, function (validlog) {
                    if (validlog != null) {
                      objUtilities.getcurrentmilliseconds(function (
                        currenttime
                      ) {
                        var saveparams = {
                          employeecode: Number(req.body.employeecode),
                          jobcode: Number(req.body.jobcode),
                          employercode: Number(req.query.employercode),
                          statuscode: Number(req.body.statuscode),
                          makerid: validlog,
                          createddate: currenttime,
                          updateddate: 0,
                          remarks: req.body.remarks,
                        };
                        objJobstatus.WishListCreate(
                          logparams,
                          saveparams,
                          function (insertresult) {
                            if (insertresult != null && insertresult > 0) {
                              if (
                                Number(req.body.statuscode) ==
                                objconstants.wishlistedstatus
                              ) {
                                const msgparam = {
                                  messagecode: objconstants.employerwishedcode,
                                };
                                objUtilities.getMessageDetailWithkeys(
                                  msgparam,
                                  function (msgresult) {
                                    return res.status(200).json({
                                      employer_json_result: {
                                        varstatuscode:
                                          objconstants.employerwishedcode,
                                        responsestring:
                                          msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response:
                                          objconstants.successresponsecode,
                                      },
                                    });
                                  }
                                );
                              } else {
                                const msgparam = {
                                  messagecode:
                                    objconstants.employerunwishedcode,
                                };
                                objUtilities.getMessageDetailWithkeys(
                                  msgparam,
                                  function (msgresult) {
                                    return res.status(200).json({
                                      employer_json_result: {
                                        varstatuscode:
                                          objconstants.employerunwishedcode,
                                        responsestring:
                                          msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response:
                                          objconstants.successresponsecode,
                                      },
                                    });
                                  }
                                );
                              }
                            }
                          }
                        );
                      });
                    }
                  });
                }
              }
            );
          }
        } else {
          const msgparam = { messagecode: objconstants.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employer_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                response: objconstants.successresponsecode,
              },
            });
          });
        }
      }
    );
  } catch (e) {
    logger.error("Error in Job status Save - employer: " + e);
  }
};
exports.InviteEmployee = async function (req, res) {
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
    objUtilities.checkvalidemployer(
      req.query.employercode,
      function (validemp) {
        if (validemp == true) {
          // //console.log("Entry");
          var logType = "";
          if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
          else logType = objconstants.AppEmployerLogType;
          var objLogdetails;
          const logvalues = {
            ipaddress: req.query.ipaddress,
            usercode: req.query.employercode,
            orginator: "Invite Count",
            logdate: new Date(),
            type: logType,
          };
          objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
          });
          var logparams = objLogdetails;
          if (req.query.appcode == 1 || req.query.appcode == 2) {
            // //console.log("Entry");
            objJobstatus.InvitedTotalCount(logparams, req, function (jobcount) {
              ////console.log(jobcount);
              if (jobcount == 0 || jobcount > 0) {
                objJobstatus.InvitedCount(
                  logparams,
                  req,
                  function (employercount) {
                    // //console.log(employercount);
                    //if (employercount != 0 && employercount > 0) {
                    var totalcount = Number(jobcount - employercount);
                    // //console.log(totalcount);
                    if (totalcount > 0 || jobcount == 0) {
                      objJobstatus.appliedchecking(
                        logparams,
                        req,
                        function (applieddata) {
                          if (applieddata == 0) {
                            objJobstatus.DuplicateCheck(
                              logparams,
                              req,
                              function (validdata) {
                                if (validdata == 0) {
                                  objUtilities.InsertLog(
                                    logparams,
                                    function (validlog) {
                                      objUtilities.getcurrentmilliseconds(
                                        function (currenttime) {
                                          var insertitem = {
                                            employercode: Number(
                                              req.query.employercode
                                            ),
                                            employeecode: Number(
                                              req.query.employeecode
                                            ),
                                            jobcode: Number(req.query.jobcode),
                                            statuscode:
                                              objconstants.invitedstatus,
                                            createddate: currenttime,
                                            updateddate: 0,
                                            makerid: validlog,
                                            shortliststatus: 0,
                                            issimilarsearch: Number(
                                              req.query.issimilarsearch
                                            ),
                                          };
                                          var makerid = validlog;
                                          objJobstatus.InsertInvite(
                                            logparams,
                                            insertitem,
                                            function (insertresult) {
                                              if (insertresult == "invite") {
                                                var empparams = {
                                                  employercode: Number(
                                                    req.query.employercode
                                                  ),
                                                  jobcode: req.query.jobcode,
                                                  employeecode: 0,
                                                  languagecode:
                                                    objconstants.defaultlanguagecode,
                                                  statuscode: [0],
                                                };
                                                objJobView.getJobViewProcess(
                                                  logparams,
                                                  empparams,
                                                  function (jobviewresult) {
                                                    // console.log('getJobViewProcess')
                                                    // console.log(jobviewresult)
                                                    var employeecodeparams = {
                                                      employeecode: Number(
                                                        req.query.employeecode
                                                      ),
                                                    };
                                                    objProfile.getProfileView(
                                                      logparams,
                                                      employeecodeparams,
                                                      objconstants.defaultlanguagecode,
                                                      req,
                                                      function (
                                                        employeedetails
                                                      ) {
                                                        // console.log('employeedetails')
                                                        // console.log(employeedetails)
                                                        jobviewresult.makerid =
                                                          makerid;
                                                        const msgparam = {
                                                          messagecode:
                                                            objconstants.Invitecode,
                                                        };
                                                        objUtilities.getMessageDetailWithkeys(
                                                          msgparam,
                                                          function (msgresult) {
                                                            return res
                                                              .status(200)
                                                              .json({
                                                                employer_json_result:
                                                                  {
                                                                    varstatuscode:
                                                                      objconstants.Invitecode,
                                                                    responsestring:
                                                                      msgresult[0]
                                                                        .messagetext,
                                                                    responsekey:
                                                                      msgresult[0]
                                                                        .messagekey,
                                                                    response:
                                                                      objconstants.successresponsecode,
                                                                  },
                                                              });
                                                          }
                                                        );

                                                        objSendNotification.SendInvitedNotification(
                                                          logparams,
                                                          req,
                                                          req.query
                                                            .employercode,
                                                          jobviewresult[0],
                                                          employeedetails,
                                                          function (result) {}
                                                        );
                                                      }
                                                    );
                                                  }
                                                );
                                                // objSendNotification.SendGNJobPostNotification(insertitem,req,function(result){
                                                // });
                                              } else if (
                                                insertresult == "applied"
                                              ) {
                                                const msgparam = {
                                                  messagecode:
                                                    objconstants.unselectedcode,
                                                };
                                                objUtilities.getMessageDetailWithkeys(
                                                  msgparam,
                                                  function (msgresult) {
                                                    ////console.log("Hello");
                                                    ////console.log(prefresult);
                                                    ////console.log("Hi");
                                                    return res
                                                      .status(200)
                                                      .json({
                                                        employer_json_result: {
                                                          varstatuscode:
                                                            objconstants.unselectedcode,
                                                          responsestring:
                                                            msgresult[0]
                                                              .messagetext,
                                                          responsekey:
                                                            msgresult[0]
                                                              .messagekey,
                                                          response:
                                                            objconstants.successresponsecode,
                                                          //job_list: jobresult
                                                        },
                                                      });
                                                  }
                                                );
                                              } else {
                                                const msgparam = {
                                                  messagecode:
                                                    objconstants.alreadyrejectedcode,
                                                };
                                                objUtilities.getMessageDetailWithkeys(
                                                  msgparam,
                                                  function (msgresult) {
                                                    ////console.log("Hello");
                                                    ////console.log(prefresult);
                                                    ////console.log("Hi");
                                                    return res
                                                      .status(200)
                                                      .json({
                                                        employer_json_result: {
                                                          varstatuscode:
                                                            objconstants.alreadyrejectedcode,
                                                          responsestring:
                                                            msgresult[0]
                                                              .messagetext,
                                                          responsekey:
                                                            msgresult[0]
                                                              .messagekey,
                                                          response:
                                                            objconstants.successresponsecode,
                                                          //job_list: jobresult
                                                        },
                                                      });
                                                  }
                                                );
                                              }
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                } else {
                                  const msgparam = {
                                    messagecode: objconstants.existcode,
                                  };
                                  objUtilities.getMessageDetailWithkeys(
                                    msgparam,
                                    function (msgresult) {
                                      return res.status(200).json({
                                        employer_json_result: {
                                          varstatuscode: objconstants.existcode,
                                          responsestring:
                                            msgresult[0].messagetext,
                                          responsekey: msgresult[0].messagekey,
                                          response:
                                            objconstants.successresponsecode,
                                        },
                                      });
                                    }
                                  );
                                }
                              }
                            );
                          } else {
                            const msgparam = {
                              messagecode: objconstants.appliedcode,
                            };
                            objUtilities.getMessageDetailWithkeys(
                              msgparam,
                              function (msgresult) {
                                return res.status(200).json({
                                  employer_json_result: {
                                    varstatuscode: objconstants.appliedcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                  },
                                });
                              }
                            );
                          }
                        }
                      );
                    } else {
                      const msgparam = {
                        messagecode: objconstants.InviteExceedcode,
                      };
                      objUtilities.getMessageDetailWithkeys(
                        msgparam,
                        function (msgresult) {
                          return res.status(200).json({
                            employer_json_result: {
                              varstatuscode: objconstants.InviteExceedcode,
                              responsestring: msgresult[0].messagetext,
                              responsekey: msgresult[0].messagekey,
                              response: objconstants.successresponsecode,
                            },
                          });
                        }
                      );
                    }
                    /* }
                                else {
                                    const msgparam = { "messagecode": objconstants.notvalidcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employer_json_result: {
                                                varstatuscode: objconstants.notvalidcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objconstants.successresponsecode,
                                            }
                                        });
                                    });
                                } */
                  }
                );
              } else {
                const msgparam = { messagecode: objconstants.notvalidcode };
                objUtilities.getMessageDetailWithkeys(
                  msgparam,
                  function (msgresult) {
                    return res.status(200).json({
                      employer_json_result: {
                        varstatuscode: objconstants.notvalidcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: objconstants.successresponsecode,
                      },
                    });
                  }
                );
              }
            });
          }
        } else {
          const msgparam = { messagecode: objconstants.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employer_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                response: objconstants.successresponsecode,
              },
            });
          });
        }
      }
    );
  } catch (e) {
    logger.error("Error in Invite Count - employer: " + e);
  }
};
exports.ShortliststatusUpdate = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    objUtilities.checkvalidemployer(
      req.query.employercode,
      function (validemp) {
        if (validemp == true) {
          // //console.log("Entry");
          var logType = "";
          if (req.query.appcode == 1)
            logType = objconstants.portalEmployerLogType;
          else logType = objconstants.AppEmployerLogType;
          var objLogdetails;
          const logvalues = {
            ipaddress: req.query.ipaddress,
            usercode: req.query.employercode,
            orginator: "Shortlist status updated",
            logdate: new Date(),
            type: logType,
          };
          objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
          });
          var logparams = objLogdetails;
          if (req.query.appcode == 1 || req.query.appcode == 2) {
            objInvitedList.ShortlistTotalCount(
              logparams,
              req,
              2,
              function (jobcount) {
                ////console.log(jobcount);
                if (jobcount <= 0 || jobcount > 0) {
                  objInvitedList.ShortlistCount(
                    logparams,
                    req,
                    2,
                    function (employercount) {
                      var totalcount = Number(jobcount - employercount);
                      ////console.log(totalcount);
                      if (
                        Number(req.body.shortliststatus) ==
                        objconstants.shortlistedstatus
                      ) {
                        if (totalcount > 0 || jobcount == 0) {
                          objJobstatus.checkAppliedStatus(
                            logparams,
                            req,
                            function (applieddata) {
                              ////console.log("applieddata",applieddata);
                              if (applieddata == 0) {
                                ////console.log("-1");
                                objJobstatus.UpdateShortList(
                                  logparams,
                                  req,
                                  function (validdata) {
                                    ////console.log("0");
                                    ////console.log(validdata);
                                    if (validdata != null && validdata != "") {
                                      ////console.log("1");
                                      if (
                                        Number(req.body.shortliststatus) ==
                                        objconstants.shortlistedstatus
                                      ) {
                                        var empparams = {
                                          employercode: Number(
                                            req.query.employercode
                                          ),
                                          jobcode: req.body.jobcode,
                                          employeecode: 0,
                                          languagecode:
                                            objconstants.defaultlanguagecode,
                                          statuscode: [0],
                                        };
                                        objJobView.getJobViewProcess(
                                          logparams,
                                          empparams,
                                          function (jobviewresult) {
                                            jobviewresult.makerid = validdata;
                                            const msgparam = {
                                              messagecode:
                                                objconstants.applicationaccepted,
                                            };
                                            objUtilities.getMessageDetailWithkeys(
                                              msgparam,
                                              function (msgresult) {
                                                return res.status(200).json({
                                                  employer_json_result: {
                                                    varstatuscode:
                                                      objconstants.applicationaccepted,
                                                    responsestring:
                                                      msgresult[0].messagetext,
                                                    responsekey:
                                                      msgresult[0].messagekey,
                                                    response:
                                                      objconstants.successresponsecode,
                                                  },
                                                });
                                              }
                                            );
                                            var empparams = {
                                              employeecode: Number(
                                                req.query.employeecode
                                              ),
                                            };
                                            objProfile.getProfileView(
                                              logparams,
                                              empparams,
                                              objconstants.defaultlanguagecode,
                                              req,
                                              function (prefresult) {
                                                objSendNotification.SendAppliedAcceptedNotification(
                                                  prefresult,
                                                  logparams,
                                                  req.query.employercode,
                                                  req,
                                                  jobviewresult[0],
                                                  function (result) {}
                                                );
                                              }
                                            );
                                          }
                                        );
                                      } else {
                                        const msgparam = {
                                          messagecode:
                                            objconstants.applicationrejected,
                                        };
                                        objUtilities.getMessageDetailWithkeys(
                                          msgparam,
                                          function (msgresult) {
                                            return res.status(200).json({
                                              employer_json_result: {
                                                varstatuscode:
                                                  objconstants.applicationrejected,
                                                responsestring:
                                                  msgresult[0].messagetext,
                                                responsekey:
                                                  msgresult[0].messagekey,
                                                response:
                                                  objconstants.successresponsecode,
                                              },
                                            });
                                          }
                                        );
                                      }
                                    } else {
                                      //console.log("2");
                                      const msgparam = {
                                        messagecode:
                                          objconstants.recordnotfoundcode,
                                      };
                                      objUtilities.getMessageDetailWithkeys(
                                        msgparam,
                                        function (msgresult) {
                                          return res.status(200).json({
                                            employer_json_result: {
                                              varstatuscode:
                                                objconstants.recordnotfoundcode,
                                              responsestring:
                                                msgresult[0].messagetext,
                                              responsekey:
                                                msgresult[0].messagekey,
                                              response:
                                                objconstants.successresponsecode,
                                            },
                                          });
                                        }
                                      );
                                    }
                                  }
                                );
                              } else {
                                if (
                                  applieddata == objconstants.shortlistedstatus
                                ) {
                                  const msgparam = {
                                    messagecode: objconstants.alreadyaccepted,
                                  };
                                  objUtilities.getMessageDetailWithkeys(
                                    msgparam,
                                    function (msgresult) {
                                      return res.status(200).json({
                                        employer_json_result: {
                                          varstatuscode:
                                            objconstants.alreadyaccepted,
                                          responsestring:
                                            msgresult[0].messagetext,
                                          responsekey: msgresult[0].messagekey,
                                          response:
                                            objconstants.successresponsecode,
                                        },
                                      });
                                    }
                                  );
                                } else {
                                  const msgparam = {
                                    messagecode: objconstants.alreadyrejected,
                                  };
                                  objUtilities.getMessageDetailWithkeys(
                                    msgparam,
                                    function (msgresult) {
                                      return res.status(200).json({
                                        employer_json_result: {
                                          varstatuscode:
                                            objconstants.alreadyrejected,
                                          responsestring:
                                            msgresult[0].messagetext,
                                          responsekey: msgresult[0].messagekey,
                                          response:
                                            objconstants.successresponsecode,
                                        },
                                      });
                                    }
                                  );
                                }
                              }
                            }
                          );
                        } else {
                          const msgparam = {
                            messagecode: objconstants.shortlistexceedcode,
                          };
                          objUtilities.getMessageDetailWithkeys(
                            msgparam,
                            function (msgresult) {
                              return res.status(200).json({
                                employer_json_result: {
                                  varstatuscode:
                                    objconstants.shortlistexceedcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: objconstants.successresponsecode,
                                },
                              });
                            }
                          );
                        }
                      } else {
                        objJobstatus.checkAppliedStatus(
                          logparams,
                          req,
                          function (applieddata) {
                            ////console.log("applieddata",applieddata);
                            if (applieddata == 0) {
                              objJobstatus.UpdateShortList(
                                logparams,
                                req,
                                function (validdata) {
                                  if (validdata != null && validdata != "") {
                                    if (
                                      Number(req.body.shortliststatus) ==
                                      objconstants.shortlistedstatus
                                    ) {
                                      const msgparam = {
                                        messagecode:
                                          objconstants.applicationaccepted,
                                      };
                                      objUtilities.getMessageDetailWithkeys(
                                        msgparam,
                                        function (msgresult) {
                                          return res.status(200).json({
                                            employer_json_result: {
                                              varstatuscode:
                                                objconstants.applicationaccepted,
                                              responsestring:
                                                msgresult[0].messagetext,
                                              responsekey:
                                                msgresult[0].messagekey,
                                              response:
                                                objconstants.successresponsecode,
                                            },
                                          });
                                        }
                                      );
                                    } else {
                                      const msgparam = {
                                        messagecode:
                                          objconstants.applicationrejected,
                                      };
                                      objUtilities.getMessageDetailWithkeys(
                                        msgparam,
                                        function (msgresult) {
                                          return res.status(200).json({
                                            employer_json_result: {
                                              varstatuscode:
                                                objconstants.applicationrejected,
                                              responsestring:
                                                msgresult[0].messagetext,
                                              responsekey:
                                                msgresult[0].messagekey,
                                              response:
                                                objconstants.successresponsecode,
                                            },
                                          });
                                        }
                                      );
                                    }
                                  } else {
                                    const msgparam = {
                                      messagecode:
                                        objconstants.recordnotfoundcode,
                                    };
                                    objUtilities.getMessageDetailWithkeys(
                                      msgparam,
                                      function (msgresult) {
                                        return res.status(200).json({
                                          employer_json_result: {
                                            varstatuscode:
                                              objconstants.recordnotfoundcode,
                                            responsestring:
                                              msgresult[0].messagetext,
                                            responsekey:
                                              msgresult[0].messagekey,
                                            response:
                                              objconstants.successresponsecode,
                                          },
                                        });
                                      }
                                    );
                                  }
                                }
                              );
                            } else {
                              if (
                                applieddata == objconstants.shortlistedstatus
                              ) {
                                const msgparam = {
                                  messagecode: objconstants.alreadyaccepted,
                                };
                                objUtilities.getMessageDetailWithkeys(
                                  msgparam,
                                  function (msgresult) {
                                    return res.status(200).json({
                                      employer_json_result: {
                                        varstatuscode:
                                          objconstants.alreadyaccepted,
                                        responsestring:
                                          msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response:
                                          objconstants.successresponsecode,
                                      },
                                    });
                                  }
                                );
                              } else {
                                const msgparam = {
                                  messagecode: objconstants.alreadyrejected,
                                };
                                objUtilities.getMessageDetailWithkeys(
                                  msgparam,
                                  function (msgresult) {
                                    return res.status(200).json({
                                      employer_json_result: {
                                        varstatuscode:
                                          objconstants.alreadyrejected,
                                        responsestring:
                                          msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response:
                                          objconstants.successresponsecode,
                                      },
                                    });
                                  }
                                );
                              }
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  const msgparam = { messagecode: objconstants.notvalidcode };
                  objUtilities.getMessageDetailWithkeys(
                    msgparam,
                    function (msgresult) {
                      return res.status(200).json({
                        employer_json_result: {
                          varstatuscode: objconstants.notvalidcode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: objconstants.successresponsecode,
                        },
                      });
                    }
                  );
                }
              }
            );
          }
        } else {
          const msgparam = { messagecode: objconstants.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employer_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                response: objconstants.successresponsecode,
              },
            });
          });
        }
      }
    );
  } catch (e) {
    logger.error("Error in Shortlist status updated - employer: " + e);
  }
};
