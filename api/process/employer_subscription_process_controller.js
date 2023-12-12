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
const objZohoBook = require('../process/zohobook_razorpay_process_controller');

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
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).insertOne(insertparams, function (err, res) {
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
        
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).findOneAndUpdate({ "subscriptioncode": parseInt(req.query.subscriptioncode) },{ $set: updateparams}, function (err, res) {
            if (err) throw err;
           // //console.log(res.lastErrorObject.updatedExisting);
            return callback(res.lastErrorObject.updatedExisting);
        });
    }
    catch (e) { logger.error("Error in getSubscriptionUpdate: " + e); }

}

exports.getSubscriptionDetails = function (razorpayorderid, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        
        logger.info("Log in Getting Subscription Details");
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
       
       //logger.info("RazorPayOrderId: Process: " + razorpayorderid);
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).find({ "razorpayorderid": razorpayorderid }).toArray(function (err, result) {
            finalresult = result;
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
        dbo.collection(String(MongoDB.JobPackageSubscriptionCollectionName)).find().sort([['subscriptioncode', -1]]).limit(1)
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


exports.getSubscriptionPackageList = function (logparams, params,countparam,req, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Subscription List on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        //{$and:[{"employercode":1}, {"statuscode":1}, {'expirydate': {$gte: ISODate().getTime() }}]}
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        var availedParam = {$expr: {$lt: ["$postedcount", "$activeinfo.timesavailed"]}};
        var matchparams = {$and:[countparam]}
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).aggregate([
            { "$match": params },
                { "$lookup": 
                    {
                        "from": String(MongoDB.planTypeCollectionName),
                        "localField": "plantypecode",
                        "foreignField": "plantypecode",
                        "as": "plantypeinfo"
                    }
                },
                { "$lookup": 
                    {
                        "from": String(MongoDB.JobPackageCollectionName),
                        "localField": "packagecode",
                        "foreignField": "packagecode",
                        "as": "packageinfo"
                    }
                },
                { "$lookup": 
		            {
			            "from":  String(MongoDB.JobPostsCollectionName),
			            "localField": "subscriptioncode",
			            "foreignField": "subscriptiondetails.subscriptioncode",
			            "as": "activeinfo"
		            }
	            },
                //{$set: {"jobcount": {"$size": '$activeinfo'}}},
	            
	            {
                    "$addFields": {
                    "postedinfo": {
                    "$filter": {
                        "input": "$activeinfo",
                        "as": "filterpostedinfo",
                        "cond": {"$ne": [ "$$filterpostedinfo.statuscode",objConstants.rejectedstatus]}
                    
                            }
                        }
                    }
                },
                {
                    "$addFields": {
                    "activeinfo": {
                    "$filter": {
                        "input": "$activeinfo",
                        "as": "filteractiveinfo",
                        "cond": { "$and": [{"$gte": [ "$$filteractiveinfo.validitydate", milliseconds]},
                                    {"$eq": [ "$$filteractiveinfo.statuscode",objConstants.approvedstatus]}]
                    
                                }
                            }
                        }
                    }
                },
            {$unwind:"$packageinfo"},
            //{$unwind:"$packageinfo.package"},
            //{$match: {"packageinfo.package.languagecode": Number(languagecode)}},
            {$unwind:"$plantypeinfo"},	
            {$sort: {'expirydate':1}},	
            {"$project": {_id:0, packagecode:1, packageinfo:'$packageinfo.package', price:1, allowedposts:1, allowedvacancies:1, allowedprofiles_view: 1, 
            allowedprofiles_shortlist:1, allowedprofiles_applied: 1, allowedprofiles_invited: 1, jobvalidity:1, packagevalidity:1, createddate:1,timesavailed:'$packageinfo.timesavailed',
            plantypecode:1, plantypename: '$plantypeinfo.plantypename', expirydate:1, subscriptioncode:1, postedcount: {"$size":'$postedinfo' } , activecount: {"$size":'$activeinfo' } 
            }},
            {$match:matchparams}
            ]).toArray(function (err, subsresult) {
                if (Number(req.query.type) == 2) {
                    var date = new Date();
                    var milliseconds = date.getTime();
                    params = { $and: [{ "employercode": Number(req.query.employercode) }, { "statuscode": objConstants.activestatus }, { 'expirydate': { $gte: milliseconds } }] }
                    countparam = {$expr: {$eq: ["$postedcount", "$activeinfo"]}};
                    dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).aggregate([
                        { "$match": params },
                            { "$lookup": 
                                {
                                    "from": String(MongoDB.planTypeCollectionName),
                                    "localField": "plantypecode",
                                    "foreignField": "plantypecode",
                                    "as": "plantypeinfo"
                                }
                            },
                            { "$lookup": 
                                {
                                    "from": String(MongoDB.JobPackageCollectionName),
                                    "localField": "packagecode",
                                    "foreignField": "packagecode",
                                    "as": "packageinfo"
                                }
                            },
                            { "$lookup": 
                                {
                                    "from":  String(MongoDB.JobPostsCollectionName),
                                    "localField": "subscriptioncode",
                                    "foreignField": "subscriptiondetails.subscriptioncode",
                                    "as": "activeinfo"
                                }
                            },
                            //{$set: {"jobcount": {"$size": '$activeinfo'}}},
	            
                            {
                                "$addFields": {
                                "postedinfo": {
                                "$filter": {
                                    "input": "$activeinfo",
                                    "as": "filterpostedinfo",
                                    "cond": {"$ne": [ "$$filterpostedinfo.statuscode",objConstants.rejectedstatus]}
                                
                                        }
                                    }
                                }
                            },
                            {
                                "$addFields": {
                                "activeinfo": {
                                "$filter": {
                                    "input": "$activeinfo",
                                    "as": "filteractiveinfo",
                                    "cond": { "$and": [{"$gte": [ "$$filteractiveinfo.validitydate", milliseconds]},
                                                {"$eq": [ "$$filteractiveinfo.statuscode",objConstants.approvedstatus]}]
                                
                                }
                            }
                        }
                    }
                },
                        {$unwind:"$packageinfo"},
                        //{$unwind:"$packageinfo.package"},
                        //{$match: {"packageinfo.package.languagecode": Number(languagecode)}},
                        {$unwind:"$plantypeinfo"},	
                        {$sort: {'expirydate':1}},	
                        {"$project": {_id:0, packagecode:1, packageinfo:'$packageinfo.package', price:1, allowedposts:1, allowedvacancies:1, allowedprofiles_view: 1, 
                        allowedprofiles_shortlist:1, allowedprofiles_applied: 1, allowedprofiles_invited: 1, jobvalidity:1, packagevalidity:1, createddate:1,timesavailed:'$packageinfo.timesavailed',
                        plantypecode:1, plantypename: '$plantypeinfo.plantypename', expirydate:1, subscriptioncode:1, postedcount: {"$size":'$postedinfo' }, activecount: {"$size":'$activeinfo' } 
                        }},
                        {$match:countparam}
                        ]).toArray(function (err, subsactiveresult) {                            
                            var finallist = [];                            
                            if (subsactiveresult != null && subsactiveresult.length > 0) {
                                finallist.push(subsactiveresult[0]);
                            }
                            if (subsresult != null && subsresult.length > 0)
                            {
                                finallist.push(subsresult[0]);
                            }
                            if (finallist != null && finallist.length > 0)
                            {
                                finalresult = finallist;
                                return callback(finalresult);
                            }
                            else
                                return callback(finalresult);
                        });
                }
                else{
                    if (subsresult != null && subsresult.length > 0)
                    {
                        finalresult = subsresult;
                        return callback(finalresult);
                    }
                    else
                        return callback(finalresult);
                }
        });
    }
    catch (e) { logger.error("Error in Subscription Package Load: " + e); }

}

exports.getRazorPayOrderId = function (logparams,paraPrice, callback) {
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
            payment_capture: 1
            })
        })
            .then(response => response.json())
            .then(responseJson => {
            //console.log("responseJson", responseJson);
            return callback(responseJson);
            });
        
    }
    catch (e) { logger.error("Error in getRazorPayOrderId: " + e); }

}

exports.getSubscriptionDetailsByCode = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Subscription List on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        //{$and:[{"employercode":1}, {"statuscode":1}, {'expirydate': {$gte: ISODate().getTime() }}]}
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        //console.log(params);
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).aggregate([
            { "$match": params },
                { "$lookup": 
                    {
                        "from": String(MongoDB.planTypeCollectionName),
                        "localField": "plantypecode",
                        "foreignField": "plantypecode",
                        "as": "plantypeinfo"
                    }
                },
                { "$lookup": 
                    {
                        "from": String(MongoDB.JobPackageCollectionName),
                        "localField": "packagecode",
                        "foreignField": "packagecode",
                        "as": "packageinfo"
                    }
                },
                
            {$unwind:"$packageinfo"},
            {$unwind:"$packageinfo.package"},
            {$match: {"packageinfo.package.languagecode": Number(objConstants.defaultlanguagecode)}},
            {$unwind:"$plantypeinfo"},		
            {"$project": {_id:0, packagecode:1, packagename:'$packageinfo.package.packagename', price:1, allowedposts:1, allowedvacancies:1, allowedprofiles_view: 1, 
            allowedprofiles_shortlist:1, allowedprofiles_applied: 1, allowedprofiles_invited: 1, jobvalidity:1, packagevalidity:1, createddate:1,timesavailed:'$packageinfo.timesavailed',
            plantypecode:1, plantypename: '$plantypeinfo.plantypename', expirydate:1, subscriptioncode:1,razorpay_payment_id:1,razorpay_order_id:1
            }}
            ]).toArray(function (err, subsresult) {
               // //console.log(subsresult);
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
//Get zoho item id, contact id, customer id
exports.GetZohoDetails = function (logparams,subscriptioncode, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var  matchparam={ "subscriptioncode": Number(subscriptioncode)}; 
        dbo.collection(String(MongoDB.JobPackageSubscriptionCollectionName)).find((matchparam) ,
        { projection: { _id: 0, employercode: 1,packagecode:1 } }).toArray(function (err, result) { 
            if(err)
           throw err;
                if (result) {
                     var employercode = result[0].employercode;
                     var packagecode = result[0].packagecode;
                     var  empparam={ "employercode": Number(employercode)}; 
                     dbo.collection(String(MongoDB.EmployerCollectionName)).aggregate([{$match: empparam },{$addFields: {"zohocontactid": "$zohocontactid" }},
                     {$addFields: {"zohocontactpersonid": "$zohocontactpersonid" }},
                     {"$project": {_id:0, zohocontactid:1, zohocontactpersonid:1,registered_email:1}}])    
                        .toArray(function (err, zohocontact) {   
                            if(err)
                           throw err;
                            var  jobparam={ "packagecode": Number(packagecode)}; 
                            dbo.collection(String(MongoDB.JobPackageCollectionName)).aggregate([{$match: jobparam },{$addFields: {"zohoitemcode": "$zohoitemcode" }},
                             {"$project": {_id:0, zohoitemcode:1,package:1}}])     
                                .toArray(function (err, zohoitem) { 
                                    if(err)
                                     throw err;
                                            var finalresult = {
                                                "zohocontact":zohocontact,
                                                "zohoitem":zohoitem
                                            }
                                            return callback(finalresult);
                            });
                                
                    });
                }else{
                    var emptyres = {};
                    return callback(emptyres);
                } 
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

exports.UpdateZohoinvoiceDetails = function (subscriptioncode,invoicenumber,invoiceid,invoiceurl, callback) {
    try {
        const dbo = MongoDB.getDB(); 
        var params = {"invoicenumber":invoicenumber,"invoiceid":invoiceid,"invoiceurl":invoiceurl};
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).findOneAndUpdate({ "subscriptioncode": parseInt(subscriptioncode) },{ $set: params}, function (err, res) {
            if (err) throw err; 
            return callback(res.lastErrorObject.updatedExisting);
        });
    }
    catch (e) { logger.error("Error in getSubscriptionUpdate: " + e); }

}


exports.getSubscriptionCount = function (employercode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = 0;
        
        logger.info("Log in Getting Subscription count");
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
       
       //logger.info("RazorPayOrderId: Process: " + razorpayorderid);
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).find({ "employercode": employercode }).toArray(function (err, result) {
            if (result != null && result.length > 0)
            {
                console.log(result.length);
                finalresult = result.length;
            }
            
            //logger.info("Registration details: Process :" + JSON.stringify(finalresult));
            return callback(finalresult);
        });
       
    }
    catch (e) { logger.error("Error in Getting Subscription Details: " + e); }

}
