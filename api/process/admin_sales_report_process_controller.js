'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');

exports.SalesReportLoad = function (logparams, callback) {
    try {
        logger.info("Log in Admin Sales Report : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var langparams = objConstants.defaultlanguagecode;
        dbo.collection(MongoDB.CompanyTypeCollectionName).aggregate([
            { $unwind: '$companytype' },
            { $match: { 'companytype.languagecode': langparams, statuscode: parseInt(objConstants.activestatus) } },
            {
                $sort: {
                    'ordervalue': 1
                }
            },
            {
                $project: { _id: 0, companytypecode: 1, companytypename: '$companytype.companytypename', ordervalue: 1 }
            }
        ]).toArray(function (err, companyresult) {
            dbo.collection(MongoDB.JobPackageCollectionName).aggregate([
                { $unwind: '$package' },
                { $match: { 'package.languagecode': langparams, statuscode: parseInt(objConstants.activestatus) } },
                {
                    $sort: {
                        'package.packagename': 1
                    }
                },
                {
                    $project: { _id: 0, packagecode: 1, packagename: '$package.packagename' }
                }
            ]).toArray(function (err, packageresult) {
                dbo.collection(MongoDB.UserCollectionName).aggregate([
                    { $match: { statuscode: parseInt(objConstants.activestatus) } },
                    {
                        $sort: {
                            username: 1
                        }
                    },
                    {
                        $project: { _id: 0, usercode: 1, username: 1, nameoftheuser: 1, designationcode: 1, userrolecode: 1 }
                    }
                ]).toArray(function (err, userresult) {
                    dbo.collection(MongoDB.LoginActivityCollectionName).aggregate([
                        { $match: { statuscode: parseInt(objConstants.activestatus) } },
                        {
                            $sort: {
                                activitycode: 1
                            }
                        },
                        {
                            $project: { _id: 0, activitycode: 1, activityname: 1, value: 1 }
                        }
                    ]).toArray(function (err, activityresult) {
                        finalresult = {
                            companylist: companyresult,
                            packagelist: packageresult,
                            userlist: userresult,
                            activitylist: activityresult
                        }
                        ////console.log(finalresult);
                        return callback(finalresult);
                    });
                });
            });
        });
    }
    catch (e) {
        logger.error("Error in Sales - report " + e);
    }
}
exports.EmployerList = function (logparams, req, callback) {
    try {
        logger.info("Log in EmployerList: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        if (Number(req.query.statuscode) == 0) { var condition = { "statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { statuscode: Number(req.query.statuscode) }; }
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: String(MongoDB.JobPackageSubscriptionCollectionName),
                    let: {
                        empcode: "$employercode"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$employercode",
                                                "$$empcode"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "result"
                }
            },
            {
                "$project": {
                    _id: 0, employercode: 1, registeredname: 1, companytypecode: 1, employertypecode: 1, industrycode: 1, registered_email: 1, contactinfo: 1, website: 1, knowabouttypecode: 1, gstn: 1, gstnurl: 1, pan: 1,
                    panurl: 1, aadhaarno: 1, aadhaarnourl: 1, documentdetails: 1, facilities_offered: 1, preferences: 1, aboutcompany: 1, preferences: 1, turnoverslabcode: 1, noofemployees: 1, gallery: 1, statuscode: 1, profileurl: 1, password: 1, remarks: 1,
                    "subscriptioncount": { "$size": "$result" }
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in EmployerList - Employer Management" + e); }
}
exports.SalesEditLoad = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Sales Edit Load By code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var listparams = req.body;
        var subscription = {}, subcreateddate = {}, empcreateddate = {}, companytypecode = {}, inactivedays = {}, activedays = {}, employertypecode = {}, locationcode = {}, jobfunctioncode = {}, industrycode = {}, statecode = {}, knowabouttypecode = {}, usercode = {}, packagecode = {};
        var statuscode = {};
        if (listparams.issubscription == 0)
            subscription = { subscriptioncount: { $gte: 0 } };
        else
            subscription = { subscriptioncount: { $gte: 1 } };
        if (listparams.reportcode == 3 && listparams.fromdate != 0 && listparams.todate != 0) {
            subcreateddate = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            // subcreateddate = { $and: [{ "$$subsinfo.createddate": { $gte: listparams.fromdate } }, { "$$subsinfo.createddate": { $lte: listparams.todate } }] }
            // //console.log(subcreateddate)
        }
        else if (listparams.fromdate != 0 && listparams.todate != 0) {
            empcreateddate = { $and: [{ "employerinfo.createddate": { $gte: listparams.fromdate } }, { "employerinfo.createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { 'employerinfo.lastlogindate': { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { 'employerinfo.lastlogindate': { $gte: milliseconds } };
            ////console.log(activedays);
        }
        if (listparams.employertypecode.length > 0)
            employertypecode = { 'employerinfo.employertypecode': { $in: listparams.employertypecode } };
        if (listparams.knowabouttypecode.length > 0)
            knowabouttypecode = { 'employerinfo.knowabouttypecode': { $in: listparams.knowabouttypecode } };
        if (listparams.usercode.length > 0)
            usercode = { 'employerinfo.usercode': { $in: listparams.usercode } };
        if (listparams.companytypecode.length > 0)
            companytypecode = { 'employerinfo.companytypecode': { $in: listparams.companytypecode } };
        if (listparams.industrycode.length > 0)
            industrycode = { 'employerinfo.industrycode': { $in: listparams.industrycode } };
        if (listparams.locationcode.length > 0)
            locationcode = { 'employerinfo.preferences.location.locationcode': { $in: listparams.locationcode } };
        if (listparams.jobfunctioncode.length > 0)
            jobfunctioncode = { 'employerinfo.preferences.jobfunction.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.statecode.length > 0)
            statecode = { 'employerinfo.contactinfo.statecode': { $in: listparams.statecode } };
        if (listparams.packagecode.length > 0) {
            packagecode = { $and: [{ "packageinfo.package.languagecode": objConstants.defaultlanguagecode }, { 'packageinfo.packagecode': { $in: listparams.packagecode } }] };
            // //console.log(packagecode)
        }
        else {
            packagecode = { "packageinfo.package.languagecode": objConstants.defaultlanguagecode };
        }
        if ((listparams.statuscode) == 0) { statuscode = { 'employerinfo.statuscode': { $ne: objConstants.deletestatus } }; }
        else if ((listparams.statuscode) == -1) { statuscode = { $or: [{ 'employerinfo.statuscode': objConstants.pendingstatus }, { 'employerinfo.statuscode': objConstants.rejectedstatus }] }; }
        else if ((listparams.statuscode) == -2) { statuscode = { 'employerinfo.statuscode': { $nin: [objConstants.pendingstatus, objConstants.rejectedstatus] } }; }
        else { statuscode = { 'employerinfo.statuscode': parseInt(listparams.statuscode) }; }

        var employercode = {};
        if (listparams.employercode.length > 0) {
            employercode = { "employerinfo.employercode": { $in: listparams.employercode } };
        }
        var matchparams = { $and: [inactivedays, employertypecode, employercode, industrycode, companytypecode, statuscode, activedays, locationcode, jobfunctioncode, statecode, knowabouttypecode, usercode, empcreateddate] };
        ////console.log(matchparams)
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).aggregate([
            { $match: subcreateddate },
            {
                $lookup: {
                    from: String(MongoDB.JobPackageCollectionName),
                    localField: 'packagecode',
                    foreignField: 'packagecode',
                    as: 'packageinfo'
                }
            },
            { $unwind: "$packageinfo" },
            { $unwind: "$packageinfo.package" },
            { $match: packagecode },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: "$employerinfo" },
            { $match: matchparams },
            {
                $project: {
                    _id: 0, employerinfo: 1, packagecode: 1, packagename: "$packageinfo.package.packagename", packagevalidity: 1, price: 1, allowedposts: 1, jobvalidity: 1, allowedvacancies: 1, allowedprofiles_view: 1,
                    allowedprofiles_shortlist: 1, plantypecode: 1, allowedprofiles_applied: 1, allowedprofiles_invited: 1, statuscode: 1, subscriptioncode: 1, createddate: 1, expirydate: 1, orderid: 1, razorpayorderid: 1, razorpay_order_id: 1, razorpay_payment_id: 1, razorpay_signature: 1
                }
            }

        ]).toArray(function (err, result) {
            if (err) throw err;
            return callback(result);
        })
    }
    catch (e) {
        logger.error("Error in Sales Edit Load - report " + e);
    }
}
exports.LoginActivityList = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        logger.info("Login Activity List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var listparams = req.body;
        var subcreateddate = {};
        var statuscode = {};

        if (listparams.fromdate != 0 && listparams.todate != 0) {
            subcreateddate = { $and: [{ "createdtime": { $gte: listparams.fromdate } }, { "createdtime": { $lte: listparams.todate } }] }
        }
        console.log(JSON.stringify(subcreateddate))
        dbo.collection(MongoDB.LoginActivity).aggregate([
            { $match: subcreateddate },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: '$employerinfo' },
            {
                $group:
                {
                    _id: {
                        employercode: "$employerinfo.employercode",
                        employername: "$employerinfo.registeredname"
                    },
                    // apptype: { "$push": '$apptype' },
                    apptype: {
                        "$push":
                        {
                            "$cond": [
                                { $eq: ["$apptype", 2] },
                                1,
                                0
                            ]
                        }
                    },
                    portaltype: {
                        "$push":
                        {
                            "$cond": [
                                { $eq: ["$apptype", 1] },
                                1,
                                0
                            ]
                        }
                    },
                }
            },
            { $sort: { '_id.employercode': -1 } },
            {
                $project: {
                    _id: 0, "employercode": '$_id.employercode',
                    "employername": '$_id.employername',
                    // "apptype": '$apptype',
                    // "portaltype": '$portaltype',
                    "appcount": { "$sum": "$apptype" },
                    "portalcount": { "$sum": "$portaltype" }
                }
            }
        ]).toArray(function (err, result) {
            if (err) throw err;
            return callback(result);
        })
    }
    catch (e) {
        logger.error("Error in Sales Edit Load - report " + e);
    }
}
exports.LoginActivityEditload = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        logger.info("Login Activity List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var listparams = req.body;
        var subcreateddate = {};
        var statuscode = {};

        if (listparams.fromdate != 0 && listparams.todate != 0) {
            subcreateddate = { $and: [{ "employercode": { $eq: listparams.employercode } }, { "createdtime": { $gte: listparams.fromdate } }, { "createdtime": { $lte: listparams.todate } }] }
        }
        console.log(JSON.stringify(subcreateddate))
        dbo.collection(MongoDB.LoginActivity).aggregate([
            { $match: subcreateddate },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: '$employerinfo' },
            {
                $group:
                {
                    _id: {
                        employercode: "$employerinfo.employercode",
                        employername: "$employerinfo.registeredname"
                    },
                    apptype: {
                        "$push":
                        {
                            "$cond": [
                                { $eq: ["$apptype", 2] },
                                { createdtime: "$createdtime" },
                                { createdtime: 0 }
                            ]
                        }
                    },
                    portaltype: {
                        "$push":
                        {
                            "$cond": [
                                { $eq: ["$apptype", 1] },
                                { createdtime: "$createdtime" },
                                { createdtime: 0 }
                            ]
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0, "employercode": '$_id.employercode',
                    "employername": '$_id.employername',
                    "applogintimes": '$apptype',
                    "portallogintimes": '$portaltype',
                    // "appcount": { "$sum": "$apptype" },
                    // "portalcount": { "$sum": "$portaltype" }
                }
            }
        ]).toArray(function (err, result) {
            if (err) throw err;
            return callback(result);
        })
    }
    catch (e) {
        logger.error("Error in Sales Edit Load - report " + e);
    }
}
exports.EmpSubscriptionList = function (logparams, req, callback) {
    try {
        
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Sales Edit Load By code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var listparams = req.body;
        var subscription = {}, subcreateddate = {}, empcreateddate = {}, companytypecode = {}, inactivedays = {}, activedays = {}, employertypecode = {}, locationcode = {}, jobfunctioncode = {}, industrycode = {}, statecode = {}, knowabouttypecode = {}, usercode = {}, packagecode = {};
        var statuscode = {}, subscriptionstatuscode = {};
        if (listparams.issubscription == 0)
            subscription = { subscriptioncount: { $gte: 0 } };
        else
            subscription = { subscriptioncount: { $gte: 1 } };
        if (listparams.reportcode == 3 && listparams.fromdate != 0 && listparams.todate != 0) {
            subcreateddate = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            // subcreateddate = { $and: [{ "$$subsinfo.createddate": { $gte: listparams.fromdate } }, { "$$subsinfo.createddate": { $lte: listparams.todate } }] }
            // //console.log(subcreateddate)
        }
        else if (listparams.fromdate != 0 && listparams.todate != 0) {
            empcreateddate = { $and: [{ "employeeinfo.createddate": { $gte: listparams.fromdate } }, { "employeeinfo.createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        
        
        if ((listparams.statuscode) == 0) { statuscode = { 'employeeinfo.statuscode': { $ne: objConstants.deletestatus } }; }
        else if ((listparams.statuscode) == -1) { statuscode = { $or: [{ 'employeeinfo.statuscode': objConstants.pendingstatus }, { 'employeeinfo.statuscode': objConstants.rejectedstatus }] }; }
        else if ((listparams.statuscode) == -2) { statuscode = { 'employeeinfo.statuscode': { $nin: [objConstants.pendingstatus, objConstants.rejectedstatus] } }; }
        else { statuscode = { 'employeeinfo.statuscode': parseInt(listparams.statuscode) }; }
        subscriptionstatuscode = { $or :[{ $and: [{statuscode: 2}, {employeecode: "leadinfo.employeecode"}]}, {$and: [{statuscode: 2}, {employeecode: "employeeinfo.employeecode"}]}]}
        var employeecode = {};
        if (listparams.employeecode.length > 0) {
            employeecode = { "employeeinfo.employeecode": { $in: listparams.employeecode } };
        }
        var matchparams = { $and: [inactivedays, employertypecode, employeecode, industrycode, companytypecode, statuscode, activedays, locationcode, jobfunctioncode, statecode, knowabouttypecode, usercode, empcreateddate] };
        // dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
        //     dbo.collection(MongoDB.EmpRegisterCollectionName).aggregate([
        //         { $match: subcreateddate },            
        //         {
        //             $lookup: {
        //                 from: String(MongoDB.EmployeeCollectionName),
        //                 localField: 'employeecode',
        //                 foreignField: 'leadcode',
        //                 as: 'employeeinfo'
        //             }
        //         },
        //         { $unwind: "$employeeinfo" },
        //         { $match: matchparams },
        //         {
        //             $addFields: {
        //                 packagecode: result[0].zohoitemid,
        //                 packagename: result[0].zohoitemname
        //             }
        //         },
        //         {
        //             $project: {
        //                 _id: 0, employeeinfo: 1, packagecode: 1, packagename: 1,price: 1,
        //                  statuscode: 1, subscriptioncode: 1, createddate: 1, orderid: 1, razorpayorderid: 1, razorpay_order_id: 1, razorpay_payment_id: 1, razorpay_signature: 1
        //             }
        //         }
    
        //     ]).toArray(function (err, result) {
        //         if (err) throw err;
        //         return callback(result);
        //     })
        // });
       logger.info("Condition1", subcreateddate)
       logger.info("Condition2", matchparams)
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            dbo.collection(MongoDB.EmpRegisterCollectionName).aggregate([
                { $match: subcreateddate },            
                {
                    $lookup: {
                        from: String(MongoDB.EmployeeCollectionName),
                        let: {"empcode": "$empcode", "statuscode": "$statuscode"},
						"pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$$statuscode", objConstants.activestatus] },  {"$eq": ["$employeecode", "$$empcode"] }] } }},
                            ],
                        as: 'employeeinfo'
                    }
                },
                { $unwind: { path: '$employeeinfo', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: String(MongoDB.LeadCollectionName),
                        let: {"statuscode": {$ifNull:["$statuscode",objConstants.inactivestatus]}, "employeecode": "$employeecode"},
                        "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$$statuscode", objConstants.inactivestatus] },  {"$eq": ["$employeecode", "$$employeecode"] }] } }},
                            ],
                        as: 'leadinfo'
                    }
                },
				{ $unwind: { path: '$leadinfo', preserveNullAndEmptyArrays: true } }, 
                { $match: matchparams },
                {
                    $addFields: {
                        packagecode: result[0].zohoitemid,
                        packagename: result[0].zohoitemname
                    }
                },
                {
                    $project: {
                        _id: 0, employeeinfo: { $ifNull: ['$employeeinfo', '$leadinfo'] }, packagecode: 1, packagename: 1,price: 1,
                         statuscode: 1, subscriptioncode: 1, createddate: 1, orderid: 1, razorpayorderid: 1, razorpay_order_id: 1, razorpay_payment_id: 1, razorpay_signature: 1
                    }
                }
    
            ]).toArray(function (err, result) {
                if (err) throw err;
                return callback(result);
            })
        });
        
    }
    catch (e) {
        logger.error("Error in Sales Edit Load - report " + e);
    }
}