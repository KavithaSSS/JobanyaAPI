'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');
var request = require('request')
const fetch = require('node-fetch');
const objZohoBook = require('./zohobook_razorpay_process_controller');

exports.getSubscriptionPackageLoad = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Subscription Load on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        
        dbo.collection(MongoDB.JobPackageCollectionName).aggregate([
            { "$match": {$or:[{$and:[{"plantypecode":1}, {"statuscode":objConstants.activestatus}]}, {$and:[{"plantypecode":2}, {"statuscode":objConstants.activestatus}, {"employer.employercode": Number(params.employercode)}]}]}},
	        { "$lookup": 
		        {
			        "from": String(MongoDB.planTypeCollectionName),
			        "localField": "plantypecode",
			        "foreignField": "plantypecode",
			        "as": "plantypeinfo"
		        }
	        },
            {
                "$lookup": {
                    "from": String(MongoDB.JobPackageSubscriptionCollectionName),
                    "let": { "packagecode": "$packagecode" },
                    "pipeline": [
                        { "$match": { "$expr": { $and: [{ "$eq": ["$packagecode", "$$packagecode"] }, { "$eq": ["$employercode", Number(params.employercode)] }] } } },
                    ],
                    "as": "subscriptioninfo"
                }
            },
            {$unwind:"$package"},
            {$match: {"package.languagecode": Number(params.languagecode)}},
            {$unwind:"$plantypeinfo"},	
            {$unwind: { path: '$subscriptioninfo', preserveNullAndEmptyArrays: true } },
            {$sort: {'createddate':-1}},	
    //     {"$project": {_id:0, packagecode:1, packagename:'$package.packagename', price:1, allowedposts:1, allowedvacancies:1, allowedprofiles_view: 1, 
    //     allowedprofiles_shortlist:1, allowedprofiles_applied: '$allowedcandidates_jobpost', allowedprofiles_invited: '$allowedcandidates_employer', jobvalidity:1, packagevalidity:1,timesavailed:1,
    //     plantypecode:1, plantypename: '$plantypeinfo.plantypename'//,"subscriptioncount": { "$size": "$subscriptioninfo" }
    //     }
    // }
    {
        "$group":
        {
            "_id": {
                packagecode: "$packagecode", "packagename": '$package.packagename', "price": '$price', "allowedposts": '$allowedposts', "allowedvacancies": '$allowedvacancies',
                "allowedprofiles_view": '$allowedprofiles_view', "allowedprofiles_shortlist": '$allowedprofiles_shortlist', "allowedprofiles_applied": '$allowedcandidates_jobpost',
                "allowedprofiles_invited": '$allowedcandidates_employer', "jobvalidity": '$jobvalidity', "packagevalidity": '$packagevalidity', "timesavailed": '$timesavailed',
                "plantypecode":'$plantypecode', "plantypename": '$plantypeinfo.plantypename'
            },
            "subscriptionlist": { $addToSet: "$subscriptioninfo.subscriptioncode" }
        }
    },
    {
        "$project":
        {
            "_id": 0, packagecode: "$_id.packagecode", packagename: "$_id.packagename", "price": '$_id.price', "allowedposts": '$_id.allowedposts', "allowedvacancies": '$_id.allowedvacancies',
            "allowedprofiles_view": '$_id.allowedprofiles_view', "allowedprofiles_shortlist": '$_id.allowedprofiles_shortlist', "allowedprofiles_applied": '$_id.allowedprofiles_applied', 
            "allowedprofiles_invited": '$_id.allowedprofiles_invited', "jobvalidity": '$_id.jobvalidity', "packagevalidity": '$_id.packagevalidity', "timesavailed": '$_id.timesavailed', 
            "plantypecode": '$_id.plantypecode', "plantypename": '$_id.plantypename', 
            "subscriptionlistcount": { "$size": "$subscriptionlist" }
        }
    },    
    { $sort: { 'price': 1 , 'packagename': 1 } }
]).toArray(function (err, subsresult) {
            if (subsresult != null && subsresult.length > 0)
            {
                finalresult = subsresult;
                return callback(finalresult);
            }
            else
                return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Subscription Package Load: " + e); }

}

exports.getSubscriptionCreate = function (logparams, insertparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        
        logger.info("Log in Subscription Create on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        
        dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
            insertparams.makerid = String(logres["ops"][0]["_id"]);
        dbo.collection(MongoDB.EmpRegisterCollectionName).insertOne(insertparams, function (err, res) {
            ////console.log(res);
            if (err) throw err;
                return callback(res.insertedCount);
        });
    });
    }
    catch (e) { logger.error("Error in Subscription Savve: " + e); }

}

exports.getSubscriptionUpdate = function (logparams, updateparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        
        logger.info("Log in Subscription update on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        
        dbo.collection(MongoDB.EmpRegisterCollectionName).findOneAndUpdate({ "subscriptioncode": parseInt(req.query.subscriptioncode) },{ $set: updateparams}, function (err, res) {
            if (err) throw err;
           // //console.log(res.lastErrorObject.updatedExisting);
            return callback(res.lastErrorObject.updatedExisting);
        });
    }
    catch (e) { logger.error("Error in getSubscriptionUpdate: " + e); }

}

exports.getSubscriptionDetails = function (razorpayorderid, statuscode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        
        logger.info("Log in Getting Subscription Details");
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        //console.log("rrrrrrrrrrrrrrrrrrrrtttttttttttttttrrr");
       //logger.info("RazorPayOrderId: Process: " + razorpayorderid);
        dbo.collection(MongoDB.EmpRegisterCollectionName).find({ "razorpayorderid": razorpayorderid }).toArray(function (err, result) {
            finalresult = result;
            // console.log("rrrrrrrrrrrrrrr");
            // console.log(finalresult);
            //logger.info("Registration details: Process :" + JSON.stringify(finalresult));
            return callback(finalresult);
        });
       
    }
    catch (e) { logger.error("Error in Getting Subscription Details: " + e); }

}

exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(MongoDB.EmpRegisterCollectionName)).find().sort([['subscriptioncode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].subscriptioncode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - subscription " + e); }
}



exports.getRazorPayOrderId = function (logparams,paraPrice, saveparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        
        logger.info("Log in getRazorPayOrderId : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        
        // var username=result[0].razorpay_id;
        // var password=result[0].razorpay_secret_key;
        var username=objConstants.razorpay_id;
        var password=objConstants.razorpay_secret_key;
        var varamount=Number(paraPrice)*100;
        ////console.log("varamount", varamount);
        var authorization = 'Basic ' +Buffer.from(username + ":" + password).toString('base64');
        
            fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
            Accept: "application/json",
            "Cache-Control": "no-cache",
            Host: "api.razorpay.com"
            },
            body: JSON.stringify({
            amount: varamount,
            currency: "INR",
            receipt: "receipt#1",
            payment_capture: 1,
            notes: {
                employeecode: saveparams.employeecode,
                deviceip: saveparams.deviceip
            }
            })
        })
            .then(response => response.json())
            .then(responseJson => {
            console.log("responseJson", responseJson);
            return callback(responseJson);
            });
        
    }
    catch (e) { logger.error("Error in getRazorPayOrderId: " + e); }

}


exports.getRazorPaymentOrderId = function (logparams, orderid, callback) {
    try {
        const dbo = MongoDB.getDB();
        
        logger.info("Log in getRazorPayOrderId : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        
        // var username=result[0].razorpay_id;
        // var password=result[0].razorpay_secret_key;
        var username=objConstants.razorpay_id;
        var password=objConstants.razorpay_secret_key;
        ////console.log("varamount", varamount);
        
        var authorization = 'Basic ' +Buffer.from(username + ":" + password).toString('base64');
        //logger.info(authorization, "")
            fetch("https://api.razorpay.com/v1/orders/" + orderid + "/payments", {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
            Accept: "application/json",
            "Cache-Control": "no-cache",
            Host: "api.razorpay.com"
            }
        })
            .then(response => response.json())
            .then(responseJson => { 
                //logger.info("responseJson123", "TEST");
                //var varjson = JSON.parse(JSON.stringify(responseJson).replace("data:", ""))

            // let mydata = responseJson?.replace('data','"data"');
            // // let assigndata = '{'+mydata+'}';
            console.log("responseJson");
            logger.info("responseJson123", responseJson);
            return callback(responseJson);
            });
        
    }
    catch (e) { 
        
        console.log("responseJson error  ",e);
        logger.error("Error in getRazorPamentOrderId: " + e); }

}


//Get zoho item id, contact id, customer id
exports.GetZohoDetails = function (logparams,employeecode, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var  empparam={ "employeecode": Number(employeecode)}; 
        dbo.collection(String(MongoDB.EmployeeCollectionName)).aggregate([{$unwind: {path:'$contactinfo',preserveNullAndEmptyArrays: true }  },
        {$match: empparam },            
        {"$project": {_id:0, zohocontactid:1, zohocontactpersonid:1,"emailid": '$contactinfo.emailid'}}])    
        .toArray(function (err, zohocontact) {   
            if(err)
            throw err;
            var finalresult = {
                "zohocontact":zohocontact
            }
            return callback(zohocontact);
                
    });
    } 
    catch (e) {console.log(e,'error'); logger.error("Error in Get Max Code - subscription " + e); }
}


//Create invocie for subscription package
exports.createzohobookInvoice= function (params, callback) {
    try { 
        objZohoBook.insertJobPackageSubscriptionInvoice(params, params.zohocode, function (zohoresponse) {  
            if(zohoresponse){   
                return callback(zohoresponse);
            } 
        });
    }
    catch (e) {
        logger.error("Error in PDF Generatoe : Employee" + e);
    }
}

exports.UpdateZohoinvoiceDetails = function (employeecode,invoicenumber,invoiceid,invoiceurl, callback) {
    try {
        const dbo = MongoDB.getDB(); 
        var params = {"invoicenumber":invoicenumber,"invoiceid":invoiceid,"invoiceurl":invoiceurl};
        dbo.collection(MongoDB.EmpRegisterCollectionName).findOneAndUpdate({ "employeecode": parseInt(employeecode) },{ $set: params}, function (err, res) {
            if (err) throw err; 
            return callback(res.lastErrorObject.updatedExisting);
        });
    }
    catch (e) { logger.error("Error in getSubscriptionUpdate: " + e); }

}

exports.getcheckoutLoad = function (logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
  
        logger.info("Log in checkout Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        dbo.collection(MongoDB.settingsCollectionName).aggregate([
        { $unwind: { path: '$employeecheckout', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 0, checkout_percentage: { $ifNull: ['$employeecheckout.checkout_percentage', 0] },
                checkout_price: { $ifNull: ['$employeecheckout.checkout_price', 0] },
                checkout_discount_price: { $ifNull: ['$employeecheckout.checkout_discount_price', 0] },
                enable_paynow_percentage: { $ifNull: ['$employeecheckout.enable_paynow_percentage', 0] },
            }
        }
        ]).toArray(function (err, settingsresult) {
            finalresult = {
                "settingsresult": settingsresult
            }
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Skill Load: " + e);
    }
  
  }