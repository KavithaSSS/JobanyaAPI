'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objSubscription = require('../process/employer_subscription_process_controller');
const objEmployeeSubscription = require('../process/employee_subscription_process_controller');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objMail = require('../process/send_email_process_controller');

exports.Employerpaymentwebhook = function (req, callback) {
  try {
   
    var params = req.body;
    if (params.payload.order.entity.status != undefined && params.payload.order.entity.status != null && params.payload.order.entity.status == "paid")
    {
      //logger.info("Razor Success")
      //logger.info("Order Id: " + params.payload.payment.entity.order_id)
      objSubscription.getSubscriptionDetails(params.payload.payment.entity.order_id, function(resultsubscription) {
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
            logUserCode = resultsubscription[0].employercode;
            logType = varconstant.portalEmployerLogType;
            ////console.log(langparams);
            //logger.info("K1");
            var deviceip = params.payload.payment.entity.notes.deviceip;
            var languagecode = varconstant.defaultlanguagecode;
            var subscriptioncode = resultsubscription[0].subscriptioncode;
            var lparams = { "ipaddress": deviceip, "usercode": logUserCode, "orginator": 'Employer Razor pay Subscription Save', "type": logType };
            objUtilities.getLogDetails(lparams, function (logresponse) {
              objLogdetails = logresponse;
            });
            var logparams = objLogdetails;
            var updateparams = {
              statuscode: 1,
              razorpay_payment_id: params.payload.payment.entity.id,
              razorpay_order_id: params.payload.payment.entity.order_id,
              updateFrom: "Razor Pay webhook for Employer"
            };
              var date = new Date();
              var milliseconds = date.getTime();
              updateparams.updateddate = milliseconds;
              var employercode = resultsubscription[0].employercode;
              var reqparams = {
                query: {
                  deviceip: deviceip,
                  employercode: employercode,
                  languagecode: languagecode,
                  subscriptioncode: subscriptioncode
                  //employee_json_fields: saveresponse 
                }
              };
              objSubscription.getSubscriptionUpdate(logparams, updateparams, reqparams,function (response) { 
                ////console.log(response);
                ////console.log(response.length);
                if (response != null && response == true) { 
                  //return res.status(200).json({
                    if(Number(updateparams.statuscode) == varconstant.activestatus){ 
                      //Get employer contact and customer and item details
                      objSubscription.GetZohoDetails(logparams,reqparams.query.subscriptioncode, function (zohores) {
                        if(zohores){
                          // console.log(zohores,'zohores')
                          var packname = zohores.zohoitem[0].package.filter(t=>t.languagecode==varconstant.defaultlanguagecode);
                          var getpackagename = packname[0].packagename;
                          const insertparams = {customeremailid:zohores.zohocontact[0].registered_email, zohocustomerid: zohores.zohocontact[0].zohocontactid , 
                            zohocontactid:  zohores.zohocontact[0].zohocontactpersonid, 
                              zohoitemid:zohores.zohoitem[0].zohoitemcode,zohocode:req.body.zohocode,packagename:getpackagename};
                                // console.log(insertparams,'zohores')
                                //Add Customer and contact information in zoho book customer
                                objSubscription.createzohobookInvoice(insertparams, function (zohoresponse) {
                                      if(zohoresponse){
                                        // console.log(zohoresponse,'zohoresponse')
                                        if(zohoresponse.data.invoice){
                                            // console.log(zohoresponse.data.contact.contact_id,'zohoresponse.data.contact.contact_id')
                                            if(zohoresponse.data.invoice.invoice_id){  
                                                var invoicenumber = zohoresponse.data.invoice.invoice_number;
                                                var invoiceid= zohoresponse.data.invoice.invoice_id; 
                                                var invoiceurl = zohoresponse.data.invoice.invoice_url; 
                                                objSubscription.UpdateZohoinvoiceDetails(parseInt(reqparams.query.subscriptioncode),
                                                invoicenumber,invoiceid,invoiceurl,function (updateresponse) {
                                                    // console.log(updateresponse,'jobpackage insert result');
                                                });
                                            }
                                        }
                                    }
                                });
                        }
                    });
                    }
                    if(Number(updateparams.statuscode)==varconstant.inactivestatus){  
                      const msgparam = { "messagecode": varconstant.subscribefailedcode };
                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        ////console.log("Hello");  
                        ////console.log(prefresult);
                        ////console.log("Hi");
                        return callback({
                          employer_json_result: {
                            varstatuscode: varconstant.subscribefailedcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: varconstant.successresponsecode
                          }
                        });
                      });
                    }
                    else{
                      const msgparam = { "messagecode": varconstant.subscribecode };
                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        ////console.log("Hello");  
                        ////console.log(prefresult);
                        ////console.log("Hi");
                        return callback({
                          employer_json_result: {
                            varstatuscode: varconstant.subscribecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: varconstant.successresponsecode
                          }
                        });
                      });
                    }
                  
                  objUtilities.FindEmployerMailID(reqparams.query.employercode, function (result) {
                    //var empparams = { "employeecode": Number(req.query.employeecode) };
                    //objProfile.getProfileView(logparams, empparams, varconstant.defaultla, function (prefresult) {
                      objUtilities.GetAdminMailId( varconstant.jobpakagemailcode ,function(mailid){
                        //var registered_email = result[0].registered_email;
                        ////console.log(mailid);
                        //var adminmailid = mailid;
                        var params = { $and: [{ "employercode": Number(reqparams.query.employercode) }, { "subscriptioncode": Number(reqparams.query.subscriptioncode) }] }
                        objSubscription.getSubscriptionDetailsByCode(logparams, params,function (response) {
                          ////console.log(response);
                          if (response != null) {
                            if(Number(updateparams.statuscode) == varconstant.activestatus){
                              objMail.SubscriptionSuccess(logparams, result[0].registered_email, mailid, reqparams.query.employercode,response[0],function (validmail) {
                              });                                                
                            }
                            else{
                              objMail.SubscriptionFailure(logparams, result[0].registered_email, mailid, reqparams.query.employercode,response[0],function (validmail) {
                              });
                            }
                          }
                        });
                        
                      });
                    //});
                    
                  });
                }
                else {
                  const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return callback({
                      employer_json_result: {
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
                    employer_json_result: {
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
                        employer_json_result: {
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


exports.getSubscriptionLoad = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Subscription Package Load', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var params = { "employercode": req.query.employercode, "languagecode": req.query.languagecode };
        objSubscription.getSubscriptionPackageLoad(logparams, params, function (response) {
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
                employer_json_result: {
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
                employer_json_result: {
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
            employer_json_result: {
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
  catch (e) { logger.error("Error in Employer Subscription Package Load: " + e); }
}

exports.getSubscriptionSave = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Subscription Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.body.packagecode != null) {
          var saveparams = req.body;
          saveparams.employercode = Number(req.query.employercode);
          //saveparams.statuscode = varconstant.activestatus;
          var date = new Date();
          var milliseconds = date.getTime();
          saveparams.createddate = milliseconds;
          date.setDate(date.getDate() + Number(saveparams.packagevalidity));
          saveparams.expirydate = date.getTime();
          // //console.log("price", req.body.price);
          // //console.log("price", req.body);
          objSubscription.getSubscriptionCount(Number(req.query.employercode), function(countresult)
          {
            //console.log("countresult", countresult)
            if(Number(req.body.price)>0){
              objSubscription.getRazorPayOrderId(logparams,req.body.price,function(orderresponse){
                ////console.log(orderresponse);
                if(orderresponse!=null && orderresponse.id !=null){
                  objSubscription.getMaxcode(logparams, function (maxcode) {
                    saveparams.subscriptioncode = maxcode;
                    
                    var varOrderId=varconstant.subscriptionprefix + maxcode;
                    var razorpayorderid =orderresponse.id;
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
                            employer_json_result: {
                              varstatuscode: varconstant.subscribecode,
                              responsestring: msgresult[0].messagetext,
                              responsekey: msgresult[0].messagekey,
                              response: varconstant.successresponsecode,
                              orderid: varOrderId,
                              subscriptioncode: maxcode,
                              razorpayorderid : razorpayorderid,
                              packagecount: countresult
                            }
                          });
                        });
                        
                      }
                      else {
                        const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                            employer_json_result: {
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
            else{
              objSubscription.getMaxcode(logparams, function (maxcode) {
                saveparams.subscriptioncode = maxcode;
                
                var varOrderId=varconstant.subscriptionprefix + maxcode;
                var razorpayorderid ="";
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
                        employer_json_result: {
                          varstatuscode: varconstant.subscribecode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: varconstant.successresponsecode,
                          orderid: varOrderId,
                          subscriptioncode: maxcode,
                          razorpayorderid : razorpayorderid,
                          packagecount: countresult
                        }
                      });
                    });
                    
                  }
                  else {
                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      return res.status(200).json({
                        employer_json_result: {
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
        else {
          const msgparam = { "messagecode": varconstant.notvalidcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employer_json_result: {
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
            employer_json_result: {
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

exports.EmployerPaymentUpdate = function (req, res) {
  try {
    var varorderId = req.query.orderid;
   // logger.info ("Entry in Payment Update")
    objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        logUserCode = req.query.usercode;
        logType = varconstant.portalEmployerLogType;
        ////console.log(langparams);
        var params = { "ipaddress": req.query.ipaddress, "usercode": logUserCode, "orginator": 'Employer Payment Subscription Manual Update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objEmployeeSubscription.getRazorPaymentOrderId(logparams, varorderId, function(resultpaymentdetails){
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
                objSubscription.getSubscriptionDetails(varorderId, function(resultsubscription) {
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
                      logUserCode = resultsubscription[0].employercode;
                      logType = varconstant.portalEmployerLogType;
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
                        var employercode = resultsubscription[0].employrecode;
                        var reqparams = {
                          query: {
                            deviceip: deviceip,
                            employercode: employercode,
                            languagecode: languagecode,
                            subscriptioncode: subscriptioncode
                            //employee_json_fields: saveresponse 
                          } 
                        };
                        objSubscription.getSubscriptionUpdate(logparams, updateparams, reqparams,function (response) { 
                          ////console.log(response);
                          ////console.log(response.length);
                          if (response != null && response == true) { 
                            //return res.status(200).json({
                              if(Number(updateparams.statuscode) == varconstant.activestatus){ 
                                //Get employer contact and customer and item details
                                objSubscription.GetZohoDetails(logparams,reqparams.query.subscriptioncode, function (zohores) {
                                  if(zohores){
                                    // console.log(zohores,'zohores')
                                    var packname = zohores.zohoitem[0].package.filter(t=>t.languagecode==varconstant.defaultlanguagecode);
                                    var getpackagename = packname[0].packagename;
                                    const insertparams = {customeremailid:zohores.zohocontact[0].registered_email, zohocustomerid: zohores.zohocontact[0].zohocontactid , 
                                      zohocontactid:  zohores.zohocontact[0].zohocontactpersonid, 
                                        zohoitemid:zohores.zohoitem[0].zohoitemcode,zohocode:req.body.zohocode,packagename:getpackagename};
                                          // console.log(insertparams,'zohores')
                                          //Add Customer and contact information in zoho book customer
                                          objSubscription.createzohobookInvoice(insertparams, function (zohoresponse) {
                                                if(zohoresponse){
                                                  // console.log(zohoresponse,'zohoresponse')
                                                  if(zohoresponse.data.invoice){
                                                      // console.log(zohoresponse.data.contact.contact_id,'zohoresponse.data.contact.contact_id')
                                                      if(zohoresponse.data.invoice.invoice_id){  
                                                          var invoicenumber = zohoresponse.data.invoice.invoice_number;
                                                          var invoiceid= zohoresponse.data.invoice.invoice_id; 
                                                          var invoiceurl = zohoresponse.data.invoice.invoice_url; 
                                                          objSubscription.UpdateZohoinvoiceDetails(parseInt(reqparams.query.subscriptioncode),
                                                          invoicenumber,invoiceid,invoiceurl,function (updateresponse) {
                                                              // console.log(updateresponse,'jobpackage insert result');
                                                          });
                                                      }
                                                  }
                                              }
                                          });
                                  }
                              });
                              }
                              if(Number(updateparams.statuscode)==varconstant.inactivestatus){  
                                const msgparam = { "messagecode": varconstant.subscribefailedcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                  ////console.log("Hello");  
                                  ////console.log(prefresult);
                                  ////console.log("Hi");
                                  return res.status(200).json({
                                    employer_json_result: {
                                      varstatuscode: varconstant.subscribefailedcode,
                                      responsestring: msgresult[0].messagetext,
                                      responsekey: msgresult[0].messagekey,
                                      response: varconstant.successresponsecode
                                    }
                                  });
                                });
                              }
                              else{
                                const msgparam = { "messagecode": varconstant.subscribecode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                  ////console.log("Hello");  
                                  ////console.log(prefresult);
                                  ////console.log("Hi");
                                  return res.status(200).json({
                                    employer_json_result: {
                                      varstatuscode: varconstant.subscribecode,
                                      responsestring: msgresult[0].messagetext,
                                      responsekey: msgresult[0].messagekey,
                                      response: varconstant.successresponsecode
                                    }
                                  });
                                });
                              }
                            
                            objUtilities.FindEmployerMailID(reqparams.query.employercode, function (result) {
                              //var empparams = { "employeecode": Number(req.query.employeecode) };
                              //objProfile.getProfileView(logparams, empparams, varconstant.defaultla, function (prefresult) {
                                objUtilities.GetAdminMailId( varconstant.jobpakagemailcode ,function(mailid){
                                  //var registered_email = result[0].registered_email;
                                  ////console.log(mailid);
                                  //var adminmailid = mailid;
                                  var params = { $and: [{ "employercode": Number(reqparams.query.employercode) }, { "subscriptioncode": Number(reqparams.query.subscriptioncode) }] }
                                  objSubscription.getSubscriptionDetailsByCode(logparams, params,function (response) {
                                    ////console.log(response);
                                    if (response != null) {
                                      if(Number(updateparams.statuscode) == varconstant.activestatus){
                                        objMail.SubscriptionSuccess(logparams, result[0].registered_email, mailid, reqparams.query.employercode,response[0],function (validmail) {
                                        });                                                
                                      }
                                      else{
                                        objMail.SubscriptionFailure(logparams, result[0].registered_email, mailid, reqparams.query.employercode,response[0],function (validmail) {
                                        });
                                      }
                                    }
                                  });
                                  
                                });
                              //});
                              
                            });
                          }
                          else {
                            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              return res.status(200).json({
                                employer_json_result: {
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
                              employer_json_result: {
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
                                  employer_json_result: {
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
                employer_json_result: {
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


exports.getSubscriptionStatusUpdate = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
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
          objSubscription.getSubscriptionUpdate(logparams, updateparams, req,function (response) { 
            ////console.log(response);
            ////console.log(response.length);
            if (response != null && response == true) { 
              //return res.status(200).json({
                if(Number(req.body.statuscode) == varconstant.activestatus){ 
                  //Get employer contact and customer and item details
                  objSubscription.GetZohoDetails(logparams,req.query.subscriptioncode, function (zohores) {
                    if(zohores){
                      // console.log(zohores,'zohores')
                      var packname = zohores.zohoitem[0].package.filter(t=>t.languagecode==varconstant.defaultlanguagecode);
                      var getpackagename = packname[0].packagename;
                      const insertparams = {customeremailid:zohores.zohocontact[0].registered_email, zohocustomerid: zohores.zohocontact[0].zohocontactid , 
                        zohocontactid:  zohores.zohocontact[0].zohocontactpersonid, 
                          zohoitemid:zohores.zohoitem[0].zohoitemcode,zohocode:req.body.zohocode,packagename:getpackagename};
                            // console.log(insertparams,'zohores')
                            //Add Customer and contact information in zoho book customer
                            // objSubscription.createzohobookInvoice(insertparams, function (zohoresponse) {
                            //       if(zohoresponse){
                            //         // console.log(zohoresponse,'zohoresponse')
                            //         if(zohoresponse.data.invoice){
                            //             // console.log(zohoresponse.data.contact.contact_id,'zohoresponse.data.contact.contact_id')
                            //             if(zohoresponse.data.invoice.invoice_id){  
                            //                 var invoicenumber = zohoresponse.data.invoice.invoice_number;
                            //                 var invoiceid= zohoresponse.data.invoice.invoice_id; 
                            //                 var invoiceurl = zohoresponse.data.invoice.invoice_url; 
                            //                 objSubscription.UpdateZohoinvoiceDetails(parseInt(req.query.subscriptioncode),
                            //                 invoicenumber,invoiceid,invoiceurl,function (updateresponse) {
                            //                     // console.log(updateresponse,'jobpackage insert result');
                            //                 });
                            //             }
                            //         }
                            //     }
                            // });
                    }
                });
                }
                if(Number(req.body.statuscode)==varconstant.inactivestatus){  
                  const msgparam = { "messagecode": varconstant.subscribefailedcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    ////console.log("Hello");  
                    ////console.log(prefresult);
                    ////console.log("Hi");
                    return res.status(200).json({
                      employer_json_result: {
                        varstatuscode: varconstant.subscribefailedcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode
                      }
                    });
                  });
                }
                else{
                  const msgparam = { "messagecode": varconstant.subscribecode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    ////console.log("Hello");  
                    ////console.log(prefresult);
                    ////console.log("Hi");
                    return res.status(200).json({
                      employer_json_result: {
                        varstatuscode: varconstant.subscribecode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode
                      }
                    });
                  });
                }
              
              objUtilities.FindEmployerMailID(req.query.employercode, function (result) {
                //var empparams = { "employeecode": Number(req.query.employeecode) };
                //objProfile.getProfileView(logparams, empparams, varconstant.defaultla, function (prefresult) {
                  objUtilities.GetAdminMailId( varconstant.jobpakagemailcode ,function(mailid){
                    //var registered_email = result[0].registered_email;
                    ////console.log(mailid);
                    //var adminmailid = mailid;
                    var params = { $and: [{ "employercode": Number(req.query.employercode) }, { "subscriptioncode": Number(req.query.subscriptioncode) }] }
                    objSubscription.getSubscriptionDetailsByCode(logparams, params,function (response) {
                      ////console.log(response);
                      if (response != null) {
                        if(Number(req.body.statuscode) == varconstant.activestatus){
                          objMail.SubscriptionSuccess(logparams, result[0].registered_email, mailid, req.query.employercode,response[0],function (validmail) {
                          });                                                
                        }
                        else{
                          objMail.SubscriptionFailure(logparams, result[0].registered_email, mailid, req.query.employercode,response[0],function (validmail) {
                          });
                        }
                      }
                    });
                    
                  });
                //});
                
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employer_json_result: {
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
              employer_json_result: {
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
            employer_json_result: {
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

exports.createzohobookInvoice = function (req, res) {
  try {
  
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
          logUserCode = req.query.employercode;
          logType = varconstant.AppEmployerLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Subscription zoho invoice', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.body.subscriptioncode != null) {
          var updateparams = req.body;
          var date = new Date();
          var milliseconds = date.getTime();
          updateparams.updateddate = milliseconds;
          objSubscription.GetZohoDetails(logparams,req.body.subscriptioncode, function (zohores) {
            if(zohores){
              var packname = zohores.zohoitem[0].package.filter(t=>t.languagecode==varconstant.defaultlanguagecode);
              var getpackagename = packname[0].packagename;
              const insertparams = { customeremailid:zohores.zohocontact[0].registered_email,zohocustomerid: zohores.zohocontact[0].zohocontactid , 
                zohocontactid:  zohores.zohocontact[0].zohocontactpersonid, 
                  zohoitemid:zohores.zohoitem[0].zohoitemcode,zohocode:req.body.zohocode,packagename:getpackagename};
                  //  console.log(getpackagename,'zohores')
                    //Add Customer and contact information in zoho book customer
                    objSubscription.createzohobookInvoice(insertparams, function (zohoresponse) {
                          if(zohoresponse){
                            // console.log(zohoresponse,'zohoresponse')
                            if(zohoresponse.data.invoice){
                                // console.log(zohoresponse.data.contact.contact_id,'zohoresponse.data.contact.contact_id')
                                if(zohoresponse.data.invoice.invoice_id){  
                                    var invoicenumber = zohoresponse.data.invoice.invoice_number;
                                    var invoiceid= zohoresponse.data.invoice.invoice_id; 
                                    var invoiceurl = zohoresponse.data.invoice.invoice_url; 
                                    objSubscription.UpdateZohoinvoiceDetails(parseInt(req.body.subscriptioncode),
                                    invoicenumber,invoiceid,invoiceurl,function (updateresponse) {
                                        // console.log(updateresponse,'jobpackage insert result');
                                        const msgparam = { "messagecode": varconstant.updatecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                          return res.status(200).json({
                                            employer_json_result: {
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
            employer_json_result: {
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

exports.getSubscriptionList = function (req, res) {
  try {
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
        var params,countparam = {};
        //{$and:[{"employercode":1}, {"statuscode":1}, {'expirydate': {$gte: ISODate().getTime() }}]}
        var date = new Date();
        var milliseconds = date.getTime();
        if (Number(req.query.type) == 1) {
          ////console.log("Active");
          params = { $and: [{ "employercode": Number(req.query.employercode) }, { "statuscode": varconstant.activestatus }, { 'expirydate': { $gte: milliseconds } }] }
          countparam = {$expr: {$ne: ["$postedcount", "$activeinfo"]}};
        }
        else if (Number(req.query.type) == 2) {
          ////console.log("History");
          params = { $and: [{ "employercode": Number(req.query.employercode) }, { "statuscode": varconstant.activestatus }, { 'expirydate': { $lt: milliseconds } }] }
        }
        else if (Number(req.query.type) == 3) {
          ////console.log("all");
          params = { $and: [{ "employercode": Number(req.query.employercode) }, { "statuscode": varconstant.activestatus }] }
        }
        objSubscription.getSubscriptionPackageList(logparams, params,countparam,req, req.query.languagecode, function (response) {
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
                employer_json_result: {
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
                employer_json_result: {
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
            employer_json_result: {
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