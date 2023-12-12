const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
const varsmsconstant = require('../../config/sms_constants');
const objUtilities = require("../controller/utilities");
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const https = require('https');
const axios = require('axios');
const fetch = require('node-fetch');
const request = require('request-promise');
var zohobook_client_id = objConstants.zohobook_client_id;
var zohobook_client_secret_key = objConstants.zohobook_client_secret_key;
var zohobook_redirect_uri = objConstants.zohobook_redirect_uri;
var zohobook_grant_type = objConstants.zohobook_grant_type;
var zohobook_orgainsation = objConstants.zohobook_orgainsation;
var aws = require('aws-sdk');
exports.getZohobookRazorPayAuthToken = function (code, callback) {
    try {
        // console.log("code", code);
        var auth_token_url = "https://accounts.zoho.com/oauth/v2/token?" +
            "code=" + code + "&client_id=" + zohobook_client_id + "&client_secret=" +
            zohobook_client_secret_key + "&redirect_uri=" + zohobook_redirect_uri + "&grant_type=" + zohobook_grant_type;
        //console.log("auth_token_url", auth_token_url);
        fetch(auth_token_url, {
            method: "POST"
        })
            .then(response => response.json())
            .then(responseJson => {
                //console.log("MY auth resp", responseJson);
                return callback(responseJson);
            });

    }
    catch (e) { logger.error("Error in getZohobookRazorPayAuthToken: " + e); }

}
//Insert job package item 
exports.insertJobPackageAsItem = function (JobPackageParams, AuthCode, callback) {
    try {

        exports.getZohobookRazorPayAuthToken(AuthCode, function (tokenresponse) {
            if (tokenresponse != null && tokenresponse.access_token != null) {
                var authorization = 'Zoho-oauthtoken ' + tokenresponse.access_token;
                fetch("https://books.zoho.com/api/v3/items?organization_id=" + zohobook_orgainsation, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: authorization,
                        Accept: "application/json",
                        "Cache-Control": "no-cache"
                    },
                    body: JSON.stringify({
                        name: JobPackageParams.package,
                        rate: JobPackageParams.price
                    })
                })
                    .then(response => response.json())
                    .then(responseJson => {
                        console.log("itemresponseJson", responseJson);
                        return callback(responseJson);
                    });
            }
        });


    }
    catch (e) { logger.error("Error in insertJobPackageAsItem: " + e); }

}
//Update job package item 
exports.updateJobPackageAsItem = function (JobPackageParams, AuthCode, Zohoitemcode, callback) {
    try {

        exports.getZohobookRazorPayAuthToken(AuthCode, function (tokenresponse) {
            if (tokenresponse != null && tokenresponse.access_token != null) {
                var authorization = 'Zoho-oauthtoken ' + tokenresponse.access_token;
                var update_url = "https://books.zoho.com/api/v3/items/" + Zohoitemcode + "?organization_id=" + zohobook_orgainsation;
                // console.log("update_url", update_url);
                // console.log("authorization", authorization);
                // console.log("JobPackageParams",JobPackageParams); 

                var config = {
                    method: 'PUT',
                    url: update_url,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: authorization,
                        Accept: "application/json",
                        "Cache-Control": "no-cache"
                    },
                    data: {
                        name: JobPackageParams.package,
                        rate: JobPackageParams.price
                    }
                };

                axios(config).then(function (response) {
                    // console.log(response,'response')
                    return callback(response);
                }).catch(function (error) {
                    console.log(error, "error")
                });
            }
        });


    }
    catch (e) { logger.error("Error in insertJobPackageAsItem: " + e); }

}

//Insert customer and contact details
exports.insertCustomerAndContact = function (CutomerParams, AuthCode, callback) {
    try {
        exports.getZohobookRazorPayAuthToken(AuthCode, function (tokenresponse) {
            if (tokenresponse != null && tokenresponse.access_token != null) {
                console.log(tokenresponse, "tokenresponse")
                var authorization = 'Zoho-oauthtoken ' + tokenresponse.access_token;
                var inserturl = "https://books.zoho.com/api/v3/contacts?organization_id=" + zohobook_orgainsation;

                var config = {
                    method: 'POST',
                    url: inserturl,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: authorization,
                        Accept: "application/json",
                        "Cache-Control": "no-cache"
                    },
                    data: JSON.stringify({
                        "contact_name": CutomerParams.contact_name,
                        "company_name": CutomerParams.company_name,
                        "website": CutomerParams.website,
                        "contact_type": "customer",
                        "customer_sub_type": "business",
                        "contact_persons": [
                            {
                                "salutation": "",
                                "first_name": CutomerParams.first_name,
                                "last_name": "",
                                "email": CutomerParams.email,
                                "phone": CutomerParams.phone,
                                "mobile": CutomerParams.mobileno,
                                "designation": "",
                                "department": "",
                                "skype": "Zoho",
                                "is_primary_contact": true,
                                "enable_portal": true
                            }
                        ]
                    })
                };

                axios(config).then(function (response) {
                    //console.log(response.data.contact, "zohoresponse")
                    return callback(response);
                }).catch(function (error) {
                    console.log(error, "error")
                });
            }
            else {
                return callback(tokenresponse);
            }
        });


    }
    catch (e) { logger.error("Error in insertJobPackageAsItem: " + e); }

}

//Insert job package subscription Zoho invoice   
exports.insertJobPackageSubscriptionInvoice = function (CutomerParams, AuthCode, callback) {
    try {
        exports.getZohobookRazorPayAuthToken(AuthCode, function (tokenresponse) {
            if (tokenresponse != null && tokenresponse.access_token != null) {
                var authorization = 'Zoho-oauthtoken ' + tokenresponse.access_token;
                var inserturl = "https://books.zoho.com/api/v3/invoices?organization_id=" + zohobook_orgainsation;
                var getcustomerid = (CutomerParams.zohocustomerid);
                var getcontactid = (CutomerParams.zohocontactid);
                var getitemid = CutomerParams.zohoitemid;
                var packagename = CutomerParams.packagename;
                // console.log(CutomerParams,'CutomerParams');
                // console.log(getcustomerid,'getcustomerid');
                // console.log(getcontactid,'getcontactid');
                // console.log(getitemid,'getitemid');
                var config = {
                    method: 'POST',
                    url: inserturl,
                    headers: {
                        "Content-Type": "application/json;charset=UTF-8",
                        Authorization: authorization,
                        Accept: "application/json",
                        "Cache-Control": "no-cache"
                    },
                    data: JSON.stringify({
                        "customer_id": getcustomerid,
                        "contact_persons": [
                            getcontactid
                        ],
                        "line_items": [
                            {
                                "item_id": getitemid,
                                "description": packagename,
                                "item_order": 1
                            }]
                    })
                };

                axios(config).then(function (response) {
                    //console.log(response.data.invoice, "response")
                    exports.UploadInvoice(response.data.invoice.invoice_url, response.data.invoice.invoice_id, function (res) {
                        //console.log(res, "upload res")
                    });
                    //console.log(CutomerParams.customeremailid, "customeremailid")
                    exports.SendInvoiceToEmail(CutomerParams.customeremailid,response.data.invoice,response.data.invoice.invoice_id, tokenresponse.access_token,function(emailresponse){ 
                        return callback(response);    
                    });                                          
                }).catch(function (error) {
                    console.log(error, "error")
                });
            }
            else {
                return callback(tokenresponse);
            }
        });


    }
    catch (e) { logger.error("Error in insertJobPackageAsItem: " + e); }

}

//Upload Invocie File in S3 Bucket
exports.UploadInvoice = async function (keypath, invoiceid, callback) {
    var AWS = require('aws-sdk');
    const dbo = MongoDB.getDB();
    dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
        if (err) throw err;
        // //console.log("entry");
        // The name of the bucket that you have created

        // const ID = 'AKIAIEVUKMCDILAPAARQ';
        // const SECRET = '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';
        const options = {
            uri: keypath,
            encoding: null
        };
        (async () => {
            let body = await request(options);
            // Setting up S3 upload parameters
            const params = {
                Bucket: objConstants.s3_bucketname,
                Key: "invoices/" + invoiceid, // File name you want to save as in S3
                Body: body,
                isBase64Encoded: true,
                ContentType: 'application/pdf;charset=utf-8',
            };
            //S3 Access and Secret Key
            const s3pdf = new aws.S3({
                accessKeyId: result[0].accessKeyId,
                secretAccessKey: result[0].secretAccessKey,
                region: result[0].region
            });
            const uploads3 = await s3pdf.upload(params, function (err, data) {
                if (err) {
                    throw err;
                }
            }).promise();

            return callback(uploads3.Location);
        });

    });


}
//Send invoice to email 
exports.SendInvoiceToEmail = function (emailid, invoiceparams, invoiceid, AuthCode, callback) {
    try {
        // exports.getZohobookRazorPayAuthToken(AuthCode,function(tokenresponse){ 
        //     if(tokenresponse!=null && tokenresponse.access_token!=null){ 
        var authorization = 'Zoho-oauthtoken ' + AuthCode;
        var zohoinvoiceid = invoiceid;
        var inserturl = "https://books.zoho.com/api/v3/invoices/" + zohoinvoiceid + "/email?organization_id=" + zohobook_orgainsation;
        var invoiceurl = invoiceparams.invoice_url;
        var invoicenumber = invoiceparams.invoice_number;
        var config = {
            method: 'POST',
            url: inserturl,
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: authorization,
                Accept: "application/json",
                "Cache-Control": "no-cache"
            },
            data: JSON.stringify({
                "send_from_org_email_id": true,
                "to_mail_ids": [
                    emailid
                ],
                // "cc_mail_ids": [
                //     "malashri@shivasoftwares.com"
                // ],
                "subject": "Invoice from Vinmeen (Invoice#:" + invoicenumber + ")",
                "body": "Dear Customer,         <br><br><br><br>Thanks for your business.<br><br><br>" +
                    "<br>The invoice " + invoicenumber + " is attached with this email. You can choose the easy way out and " +
                    "<a href= " + invoiceurl + " >pay online for this invoice.</a>" +
                    " <br><br>Here's an overview of the invoice for your reference.         <br><br><br>" +
                    "<br>Invoice Overview:         <br><br>Invoice  : " + invoicenumber + "         <br>" +
                    "<br>Date : " + invoiceparams.date + "         <br><br>Amount : " + invoiceparams.currency_symbol + " " + invoiceparams.line_items[0].rate + "<br><br><br>" +
                    "<br>It was great working with you. Looking forward to working with you again.<br>" +
                    "<br><br>Regards<br>JOBANYA<br>",
            })
        };
        axios(config).then(function (response) {
            return callback(response);
        }).catch(function (error) {
            console.log(error, "error")
        });
    }
    catch (e) { logger.error("Error in insertJobPackageAsItem: " + e); }

}