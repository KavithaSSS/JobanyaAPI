'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objSubscription = require('../process/employee_subscription_process_controller');
const objEmployerSubscriptionController = require('../controller/employer_subscription_controller');
const objEmployerSubscription = require('../process/employer_subscription_process_controller');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objMail = require('../process/send_email_process_controller');
const objLogin = require('../process/employee_login_process_controller')
const objProfile1 = require('../process/employee_profile_view_process_controller')
exports.paymentwebhook = async function(req, res){
  try{
    var params = req.body;
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }

    if (params.payload.order.entity.status != undefined && params.payload.order.entity.status != null && params.payload.order.entity.status == "paid")
    {
      
      objSubscription.getSubscriptionDetails(params.payload.payment.entity.order_id, 2, function(resultemployeesubscription) {
        
        objEmployerSubscription.getSubscriptionDetails(params.payload.payment.entity.order_id, function(resultemployersubscription) {
          
          if (resultemployeesubscription != null && resultemployeesubscription.length > 0)
          {
            
            Employeepaymentwebhook(req, function(result){
              
              return res.status(200).json(result);
            });
          }
          else if (resultemployersubscription != null && resultemployersubscription.length > 0)
          {
            
            objEmployerSubscriptionController.Employerpaymentwebhook(req, function(result){
              
              return res.status(200).json(result);
            });
          }
          else
          {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                              subscription_json_result: {
                                    varstatuscode: varconstant.recordnotfoundcode,
                                    response: varconstant.successresponsecode,
                                    responsestring: msgtext
                                }
                            });
                        });
          }
        });
        
      });
    }
    else
    {
      
      const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                  objUtilities.getMessageDetails(msgparam, function (msgtext) {
                      return res.status(200).json({
                        subscription_json_result: {
                              varstatuscode: varconstant.recordnotfoundcode,
                              response: varconstant.successresponsecode,
                              responsestring: msgtext
                          }
                      });
                  });
    }
  }
  catch (e) { logger.error("Error in Payment webhook: " + e); }
}

function Employeepaymentwebhook(req, callback) {
  try {
    //console.log("Webhook console starts")
    
    // logger.info("Webhook console starts: " + req.data); 
    // logger.info("Webhook console starts1: " + req.headers); 
    // logger.info("Webhook console starts2: " + req.body); 
    // logger.info("Webhook console starts3: " + req.query); 
    // logger.info(JSON.stringify(req.body))
    // logger.info(JSON.stringify(req.data))
    // console.log(req)
    // logger.info("Webhook console Ends "); 
    // console.log("Webhook console Ends")
    var params = req.body;
    if (params.payload.order.entity.status != undefined && params.payload.order.entity.status != null && params.payload.order.entity.status == "paid")
    {
      //logger.info("Razor Success")
      //logger.info("Order Id: " + params.payload.payment.entity.order_id)
      objSubscription.getSubscriptionDetails(params.payload.payment.entity.order_id, 2, function(resultsubscription) {
        if (resultsubscription != null && resultsubscription.length > 0)
        {
          //logger.info("Getting subscription")
          //logger.info("subscription JSON", + JSON.stringify(resultsubscription[0]))
          if (resultsubscription[0] != null && (resultsubscription[0].statuscode == undefined || resultsubscription[0].statuscode == null || resultsubscription[0].statuscode == 2))
          {
            //logger.info("Razor subscribed")
            //logger.info(JSON.stringify(resultsubscription))
            var objLogdetails;
            //var langparams = req.query.languagecode;
            var logUserCode = "";
            var logType = "";
            logUserCode = resultsubscription[0].employeecode;
            logType = varconstant.employeeLogType;
            ////console.log(langparams);
            //logger.info("K1");
            var deviceip = params.payload.payment.entity.notes.deviceip;
            var languagecode = varconstant.defaultlanguagecode;
            var subscriptioncode = resultsubscription[0].subscriptioncode;
            var lparams = { "ipaddress": deviceip, "usercode": logUserCode, "orginator": 'Razor pay Subscription Save', "type": logType };
            objUtilities.getLogDetails(lparams, function (logresponse) {
              objLogdetails = logresponse;
            });
            var logparams = objLogdetails;
            var updateparams = {
              statuscode: 1,
              razorpay_payment_id: params.payload.payment.entity.id,
              razorpay_order_id: params.payload.payment.entity.order_id,
              updateFrom: "Razor Pay webhook"
            };
              var date = new Date();
              var milliseconds = date.getTime();
              updateparams.updateddate = milliseconds;
              var employeecode = resultsubscription[0].employeecode;
              var reqparams = {
                query: {
                  deviceip: deviceip,
                  employeecode: employeecode,
                  languagecode: languagecode,
                  subscriptioncode: subscriptioncode
                  //employee_json_fields: saveresponse 
                }
              };
            objSubscription.getSubscriptionUpdate(logparams, updateparams, reqparams, function (response) {
              ////console.log(response);
              ////console.log(response.length);
              if (response != null && response == true) {
                //return res.status(200).json({
                if (Number(updateparams.statuscode) == varconstant.activestatus) {
                  objLogin.getMaxcode(function (response) {
                    //console.log(response );
                    if (response != null) {
                      objLogin.getLeadRecordDetails(logparams, employeecode, function (leaddetails) {
                        //console.log(leaddetails );
                        if (leaddetails != null && leaddetails.length > 0) {
                          leaddetails[0].leadcode = leaddetails[0].employeecode;
                          leaddetails[0].employeecode = response;
                          //console.log(leaddetails[0] );
                          objLogin.registration(leaddetails[0], logparams, 1, function (saveresponse) {
                            //console.log(saveresponse);
                            if (saveresponse != null && saveresponse > 0) {
                              //return res.status(200).json({
                                var empparams = {"employeecode": leaddetails[0].employeecode};
                                objProfile1.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                                });
                                objLogin.deleteLeadRecordDetails(logparams, employeecode, function (saveresponse) {
                                });
                              const msgparam = { "messagecode": varconstant.subscribecode };
                              // objMail.SendMail(saveresponse, function (result) {
                              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return callback({
                                  employee_json_result: {
                                    varstatuscode: varconstant.subscribecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: varconstant.successresponsecode,
                                    employeecode: response,
                                    isleadtype: 0
                                    //employee_json_fields: saveresponse 
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
                else if (Number(req.body.statuscode) == varconstant.inactivestatus) {
                  const msgparam = { "messagecode": varconstant.subscribefailedcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    ////console.log("Hello");  
                    ////console.log(prefresult);                    
                    ////console.log("Hi");
                    return callback({
                      employee_json_result: {
                        varstatuscode: varconstant.subscribefailedcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode
                      }
                    });
                  });
                }
                else {
                  const msgparam = { "messagecode": varconstant.subscribecode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    ////console.log("Hello");  
                    ////console.log(prefresult);
                    ////console.log("Hi");
                    return callback({
                      employee_json_result: {
                        varstatuscode: varconstant.subscribecode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode
                      }
                    });
                  });
                }
    
    
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return callback({
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
          else{
            //objSubscription.getSubscriptionDetails(params.payload.payment.entity.order_id, 1, function(resultsubscription1) {
             
            if (resultsubscription[0] != null && resultsubscription[0].statuscode != undefined && resultsubscription[0].statuscode != null && resultsubscription[0].statuscode == 1)
              {
                logger.info("Already subscribed")
                //logger.info(JSON.stringify(resultsubscription))
                const msgparam = { "messagecode": varconstant.alreadysubscribed};
             
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);                    
                  ////console.log("Hi");
                  return callback({
                    employee_json_result: {
                      varstatuscode: varconstant.alreadysubscribed,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode
                    }
                  });
                });
              }
              else
              {
                logger.info("Subscription failed")
                //logger.info(JSON.stringify(resultsubscription))
                const msgparam = { "messagecode": varconstant.subscribefailedcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      ////console.log("Hello");  
                      ////console.log(prefresult);                    
                      ////console.log("Hi");
                      return callback({
                        employee_json_result: {
                          varstatuscode: varconstant.subscribefailedcode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: varconstant.successresponsecode
                        }
                      });
                    });
              }
            
             
           // });
          }
        }
        
      });
    }
    
    
  }
  catch (e) { logger.error("Error in Payment webhook: " + e); }
}


exports.getRazorPayOrderId = async function (req, res) {
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
        var logUserCode = "";
        var logType = "";

        logUserCode = req.query.employeecode;
        logType = varconstant.employeeLogType;
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'registration Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var saveparams = req.body;
        saveparams.employeecode = Number(req.query.employeecode);
        //saveparams.statuscode = varconstant.activestatus;
        var date = new Date();
        var milliseconds = date.getTime();
        saveparams.createddate = milliseconds;
        saveparams.deviceip = req.query.deviceip;
        // //console.log("price", req.body.price);
        // //console.log("price", req.body);
        if (Number(req.body.price) > 0) {
          objSubscription.getRazorPayOrderId(logparams, req.body.price, saveparams, function (orderresponse) {
            ////console.log(orderresponse);
            if (orderresponse != null && orderresponse.id != null) {
              objSubscription.getMaxcode(logparams, function (maxcode) {
                saveparams.subscriptioncode = maxcode;

                var varOrderId = varconstant.subscriptionprefix + maxcode;
                var razorpayorderid = orderresponse.id;
                saveparams.orderid = varOrderId;
                saveparams.razorpayorderid = razorpayorderid;
                ////console.log(saveparams);
                objSubscription.getSubscriptionCreate(logparams, saveparams, function (response) {
                  ////console.log(response);
                  ////console.log(response.length);
                  if (response != null && response > 0) {
                    //return res.status(200).json({
                    const msgparam = { "messagecode": varconstant.subscribecode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      ////console.log("Hello");  
                      ////console.log(prefresult);
                      ////console.log("Hi");
                      return res.status(200).json({
                        employee_json_result: {
                          varstatuscode: varconstant.subscribecode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: varconstant.successresponsecode,
                          orderid: varOrderId,
                          subscriptioncode: maxcode,
                          razorpayorderid: razorpayorderid
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
              });
            }

          });
        }
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
  catch (e) { logger.error("Error in Subscribe Save: " + e); }
}


exports.EmployeePaymentUpdate = async function (req, res) {
  try {
    var varorderId = req.query.orderid;
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
   // logger.info ("Entry in Payment Update")
    objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        logUserCode = req.query.usercode;
        logType = varconstant.employeeLogType;
        ////console.log(langparams);
        var params = { "ipaddress": req.query.ipaddress, "usercode": logUserCode, "orginator": 'Payment Subscription Update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objSubscription.getRazorPaymentOrderId(logparams, varorderId, function(resultpaymentdetails){
          //logger.info("subscription JSON1", + JSON.stringify(resultpaymentdetails))
         // logger.info("subscription JSON1", + resultpaymentdetails)
          if (resultpaymentdetails != null && resultpaymentdetails.items != null && resultpaymentdetails.items.length > 0)
          {
           
             var params = resultpaymentdetails;
             //logger.info("subscription JSON", + JSON.stringify(params))
             //console.log("resultpaymentdetails11111", params.items.length);
             let itemsdata = params.items;
             //console.log("resultpaymentdetails111112", Object.keys(itemsdata).length);
             for (var i = 0; i <= itemsdata.length - 1; i++)
             {
              //console.log("itemsdata", itemsdata[i]);
              let inneritemdata = itemsdata[i];
              if (itemsdata[i].status != undefined && itemsdata[i].status != null && itemsdata[i].status == "captured")
              {
                //logger.info("Razor Success")
                //logger.info("Order Id: " + params.payload.payment.entity.order_id)
                objSubscription.getSubscriptionDetails(varorderId, 2, function(resultsubscription) {
                  if (resultsubscription != null && resultsubscription.length > 0)
                  {
                    //logger.info("Getting subscription")
                    //logger.info("subscription JSON", + JSON.stringify(resultsubscription[0]))
                    if (resultsubscription[0] != null && (resultsubscription[0].statuscode == undefined || resultsubscription[0].statuscode == null || resultsubscription[0].statuscode == 2))
                    {
                      //logger.info("Razor subscribed")
                      //logger.info(JSON.stringify(resultsubscription))
                      var objLogdetails;
                      //var langparams = req.query.languagecode;
                      var logUserCode = "";
                      var logType = "";
                      logUserCode = resultsubscription[0].employeecode;
                      logType = varconstant.employeeLogType;
                      ////console.log(langparams);
                      //logger.info("K1");
                      //console.log("TTTTTTTTeeeeecount", inneritemdata);
                      var deviceip = inneritemdata.notes.deviceip;
                      var languagecode = varconstant.defaultlanguagecode;
                      var subscriptioncode = resultsubscription[0].subscriptioncode;
                      
                      var updateparams = {
                        statuscode: 1,
                        razorpay_payment_id: inneritemdata.id,
                        razorpay_order_id: varorderId,
                        updateFrom: "Razor Pay webhook Manual"
                      };
                        var date = new Date();
                        var milliseconds = date.getTime();
                        updateparams.updateddate = milliseconds;
                        var employeecode = resultsubscription[0].employeecode;
                        var reqparams = {
                          query: {
                            deviceip: deviceip,
                            employeecode: employeecode,
                            languagecode: languagecode,
                            subscriptioncode: subscriptioncode
                            //employee_json_fields: saveresponse 
                          } 
                        };
                      objSubscription.getSubscriptionUpdate(logparams, updateparams, reqparams, function (response) {
                        ////console.log(response);
                        ////console.log(response.length);
                        if (response != null && response == true) {
                          //return res.status(200).json({
                          if (Number(updateparams.statuscode) == varconstant.activestatus) {
                            objLogin.getMaxcode(function (response) {
                              //console.log(response );
                              if (response != null) {
                                objLogin.getLeadRecordDetails(logparams, employeecode, function (leaddetails) {
                                  //console.log(leaddetails );
                                  if (leaddetails != null && leaddetails.length > 0) {
                                    leaddetails[0].leadcode = leaddetails[0].employeecode;
                                    leaddetails[0].employeecode = response;
                                    //console.log(leaddetails[0] );
                                    objLogin.registration(leaddetails[0], logparams, 1, function (saveresponse) {
                                      //console.log(saveresponse);
                                      if (saveresponse != null && saveresponse > 0) {
                                        //return res.status(200).json({
                                          objLogin.deleteLeadRecordDetails(logparams, employeecode, function (saveresponse) {
                                          });
                                          var empparams = {"employeecode": leaddetails[0].employeecode};
                                          objProfile1.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                                          });
                                          var empupdateparams = {
                                            empcode: response
                                          }
                                          objSubscription.getSubscriptionUpdate(logparams, empupdateparams, reqparams, function (empresponse) {
                                            if (empresponse != null && empresponse == true)
                                            {
                                              const msgparam = { "messagecode": varconstant.subscribecode };
                                              // objMail.SendMail(saveresponse, function (result) {
                                              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                return res.status(200).json({
                                                  employee_json_result: {
                                                    varstatuscode: varconstant.subscribecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: varconstant.successresponsecode,
                                                    employeecode: response,
                                                    isleadtype: 0
                                                    //employee_json_fields: saveresponse 
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
                            });
                          }
                          else if (Number(req.body.statuscode) == varconstant.inactivestatus) {
                            const msgparam = { "messagecode": varconstant.subscribefailedcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              ////console.log("Hello");  
                              ////console.log(prefresult);                    
                              ////console.log("Hi");
                              return res.status(200).json({
                                employee_json_result: {
                                  varstatuscode: varconstant.subscribefailedcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: varconstant.successresponsecode
                                }
                              });
                            });
                          }
                          else {
                            const msgparam = { "messagecode": varconstant.subscribecode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              ////console.log("Hello");  
                              ////console.log(prefresult);
                              ////console.log("Hi");
                              return res.status(200).json({
                                employee_json_result: {
                                  varstatuscode: varconstant.subscribecode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: varconstant.successresponsecode
                                }
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
                      //objSubscription.getSubscriptionDetails(params.payload.payment.entity.order_id, 1, function(resultsubscription1) {
                      
                      if (resultsubscription[0] != null && resultsubscription[0].statuscode != undefined && resultsubscription[0].statuscode != null && resultsubscription[0].statuscode == 1)
                        {
                          logger.info("Already subscribed")
                          //logger.info(JSON.stringify(resultsubscription))
                          const msgparam = { "messagecode": varconstant.alreadysubscribed};
                      
                          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            ////console.log("Hello");  
                            ////console.log(prefresult);                    
                            ////console.log("Hi");
                            return res.status(200).json({
                              employee_json_result: {
                                varstatuscode: varconstant.alreadysubscribed,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: varconstant.successresponsecode
                              }
                            });
                          });
                        }
                        else
                        {
                          logger.info("Subscription failed")
                          //logger.info(JSON.stringify(resultsubscription))
                          const msgparam = { "messagecode": varconstant.subscribefailedcode };
                              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                ////console.log("Hello");  
                                ////console.log(prefresult);                    
                                ////console.log("Hi");
                                return res.status(200).json({
                                  employee_json_result: {
                                    varstatuscode: varconstant.subscribefailedcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: varconstant.successresponsecode
                                  }
                                });
                              });
                        }
                      
                      
                    // });
                    }
                  }
                  
                });
              }
              
             }
           


          }
          else
          {
            const msgparam = { "messagecode": varconstant.paymentnotdone };
            // objMail.SendMail(saveresponse, function (result) {
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.paymentnotdone,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode
                }
              });

            });
          }

        });
      }
    });



   
    
  }
  catch (e) { logger.error("Error in Payment webhook: " + e); }
}


exports.getSubscriptionStatusUpdate = async function (req, res) {
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
        var logUserCode = "";
        var logType = "";
        logUserCode = req.query.employeecode;
        logType = varconstant.employeeLogType;
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Subscription Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.subscriptioncode != null) {
          var updateparams = req.body;
          var date = new Date();
          var milliseconds = date.getTime();
          updateparams.updateddate = milliseconds;
          var employeecode = req.query.employeecode;
          objSubscription.getSubscriptionUpdate(logparams, updateparams, req, function (response) {
            ////console.log(response);
            ////console.log(response.length);
            if (response != null && response == true) {
              //return res.status(200).json({
              if (Number(req.body.statuscode) == varconstant.activestatus) {
                objLogin.getMaxcode(function (response) {
                  //console.log(response );
                  if (response != null) {
                    objLogin.getLeadRecordDetails(logparams, employeecode, function (leaddetails) {
                      //console.log(leaddetails );
                      if (leaddetails != null && leaddetails.length > 0) {
                        leaddetails[0].leadcode = leaddetails[0].employeecode;
                        leaddetails[0].employeecode = response;
                        //console.log(leaddetails[0] );
                        objLogin.registration(leaddetails[0], logparams, 1, function (saveresponse) {
                          //console.log(saveresponse);
                          if (saveresponse != null && saveresponse > 0) {
                            //return res.status(200).json({
                              var empparams = {"employeecode": leaddetails[0].employeecode};
                                          objProfile1.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                                          });
                              var empupdateparams = {
                                empcode: response
                              }
                              objSubscription.getSubscriptionUpdate(logparams, empupdateparams, req, function (empresponse) {
                                if (empresponse != null && empresponse == true)
                                {
                                  const msgparam = { "messagecode": varconstant.subscribecode };
                                  // objMail.SendMail(saveresponse, function (result) {
                                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                      employee_json_result: {
                                        varstatuscode: varconstant.subscribecode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: varconstant.successresponsecode,
                                        employeecode: response,
                                        isleadtype: 0
                                        //employee_json_fields: saveresponse 
                                      }
                                    });
        
                                  });
                                }
                              });
                            
                            objLogin.deleteLeadRecordDetails(logparams, employeecode, function (saveresponse) {
                            });
                          }
                        });
                        
                      }
                    });


                  }
                });
              }
              else if (Number(req.body.statuscode) == varconstant.inactivestatus) {
                const msgparam = { "messagecode": varconstant.subscribefailedcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);                    
                  ////console.log("Hi");
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.subscribefailedcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.subscribecode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    employee_json_result: {
                      varstatuscode: varconstant.subscribecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode
                    }
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
  catch (e) { logger.error("Error in Subscribe Save: " + e); }
}


exports.AutomaticEmployeeRegistration = async function (req, res) {
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
        var logUserCode = "";
        var logType = "";
        logUserCode = req.query.employeecode;
        logType = varconstant.employeeLogType;
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Automatic employee Registration', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var date = new Date();
          var milliseconds = date.getTime();
          //updateparams.updateddate = milliseconds;
          var employeecode = req.query.employeecode;
        if (Number(req.query.statuscode) == varconstant.activestatus) {
          objLogin.getMaxcode(function (response) {
            //console.log(response );
            if (response != null) {
              objLogin.getLeadRecordDetails(logparams, employeecode, function (leaddetails) {
                //console.log(leaddetails );
                if (leaddetails != null && leaddetails.length > 0) {
                  leaddetails[0].leadcode = leaddetails[0].employeecode;
                  leaddetails[0].employeecode = response;
                  //console.log(leaddetails[0] );
                  objLogin.registration(leaddetails[0], logparams, 1, function (saveresponse) {
                    //console.log(saveresponse);
                    if (saveresponse != null && saveresponse > 0) {
                      //return res.status(200).json({
                        var empparams = {"employeecode": leaddetails[0].employeecode};
                        objProfile1.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                        });
                        const msgparam = { "messagecode": varconstant.registercode };
                        // objMail.SendMail(saveresponse, function (result) {
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                            employee_json_result: {
                              varstatuscode: varconstant.registercode,
                              responsestring: msgresult[0].messagetext,
                              responsekey: msgresult[0].messagekey,
                              response: varconstant.successresponsecode,
                              employeecode: response,
                              isleadtype: 0
                              //employee_json_fields: saveresponse 
                            }
                          });

                        });

                      
                      objLogin.deleteLeadRecordDetails(logparams, employeecode, function (saveresponse) {
                      });
                    }
                  });
                  
                }
              });


            }
          });
        }
        else //if (Number(req.body.statuscode) == varconstant.inactivestatus) 
        {
          const msgparam = { "messagecode": varconstant.subscribefailedcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            ////console.log("Hello");  
            ////console.log(prefresult);                    
            ////console.log("Hi");
            return res.status(200).json({
              employee_json_result: {
                varstatuscode: varconstant.subscribefailedcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                response: varconstant.successresponsecode
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
              response: varconstant.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Subscribe Save: " + e); }
}


exports.createzohobookInvoice = async function (req, res) {
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
        //var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1) {
          logUserCode = req.query.employercode;
          logType = varconstant.portalEmployerLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = varconstant.AppEmployerLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Subscription zoho invoice', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.employeecode != null) {
          var updateparams = req.body;
          var date = new Date();
          var milliseconds = date.getTime();
          updateparams.updateddate = milliseconds;

          objSubscription.GetZohoDetails(logparams, req.query.employeecode, function (zohores) {
            console.log(zohores, 'zohores')
            if (zohores) {
              if (zohores[0].zohocontactid && zohores[0].zohocontactid != "") {
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                  var getpackagename = result[0].zohoitemname;
                const insertparams = {
                  customeremailid: zohores[0].emailid, zohocustomerid: zohores[0].zohocontactid,
                  zohocontactid: zohores[0].zohocontactpersonid,
                  zohoitemid: result[0].zohoitemid, zohocode: req.body.zohocode, packagename: getpackagename
                };
                //  console.log(getpackagename,'zohores')
                //Add Customer and contact information in zoho book customer
                objSubscription.createzohobookInvoice(insertparams, function (zohoresponse) {
                  
                    // console.log(zohoresponse,'zohoresponse')
                    if (zohoresponse && zohoresponse.data!= null && zohoresponse.data.invoice !=null) {
                      // console.log(zohoresponse.data.contact.contact_id,'zohoresponse.data.contact.contact_id')
                      if (zohoresponse.data.invoice.invoice_id) {
                        var invoicenumber = zohoresponse.data.invoice.invoice_number;
                        var invoiceid = zohoresponse.data.invoice.invoice_id;
                        var invoiceurl = zohoresponse.data.invoice.invoice_url;
                        objSubscription.UpdateZohoinvoiceDetails(parseInt(req.query.employeecode),
                          invoicenumber, invoiceid, invoiceurl, function (updateresponse) {
                            // console.log(updateresponse,'jobpackage insert result');
                            const msgparam = { "messagecode": varconstant.updatecode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              return res.status(200).json({
                                employee_json_result: {
                                  varstatuscode: varconstant.updatecode,
                                  response: varconstant.successresponsecode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey
                                }

                              });
                            });
                          });
                      }
                    }
                  
                  else {
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
            else {
              const msgparam = { "messagecode": varconstant.notvalidcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employee_json_result: {
                    varstatuscode: varconstant.updatecode,
                    response: varconstant.notvalidcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }

                });
              });
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
  catch (e) { logger.error("Error in Subscribe Save: " + e); }
}

exports.getSubscriptionList = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    objUtilities.Checkvalidfilteraccessuser(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1) {
          logUserCode = req.query.employercode;
          logType = varconstant.portalEmployerLogType;
        }
        else {
          logUserCode = req.query.employercode;
          logType = varconstant.AppEmployerLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Subscription Package List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var params, countparam = {};
        //{$and:[{"employercode":1}, {"statuscode":1}, {'expirydate': {$gte: ISODate().getTime() }}]}
        var date = new Date();
        var milliseconds = date.getTime();
        if (Number(req.query.type) == 1) {
          ////console.log("Active");
          params = { $and: [{ "employercode": Number(req.query.employercode) }, { "statuscode": varconstant.activestatus }, { 'expirydate': { $gte: milliseconds } }] }
          countparam = { $expr: { $ne: ["$postedcount", "$activeinfo"] } };
        }
        else if (Number(req.query.type) == 2) {
          ////console.log("History");
          params = { $and: [{ "employercode": Number(req.query.employercode) }, { "statuscode": varconstant.activestatus }, { 'expirydate': { $lt: milliseconds } }] }
        }
        else if (Number(req.query.type) == 3) {
          ////console.log("all");
          params = { $and: [{ "employercode": Number(req.query.employercode) }, { "statuscode": varconstant.activestatus }] }
        }
        objSubscription.getSubscriptionPackageList(logparams, params, countparam, req, req.query.languagecode, function (response) {
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
                  subscriptionlist: response
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
  catch (e) { logger.error("Error in Employer Subscription Package List: " + e); }
}
exports.getcheckoutLoad = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    //objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      var validemp = true;
   // objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
    var validemp = true;
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";

        logUserCode = req.query.employeecode;
        logType = varconstant.employeeLogType;
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employee Checkout', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objSubscription.getcheckoutLoad(logparams, function (response) {
          ////console.log(orderresponse);
          if (response != null) {
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                checkout_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  checkoutsetting: response.settingsresult[0]
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                checkout_json_result: {
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
    //});

  }
  catch (e) { logger.error("Error in Subscribe Save: " + e); }
}

