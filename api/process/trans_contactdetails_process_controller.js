'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");

exports.getMaxcode = function (logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Get Max Code on Contact Us : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.TransContactsCollectionName).find().sort([['contactuscode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].contactuscode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Transaction Contact Us Getting Max Code: " + e); }
}

exports.adminContactInfoLoad = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Admin Contact Info Load : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var params = Number(req.query.languagecode);
        dbo.collection(MongoDB.AdminContactCollectionName).find({ "statuscode": objConstants.activestatus }, { projection: { _id: 0, emailid: 1, website: 1, contactno: 1 } }).toArray(function (err, adminresult) {
            dbo.collection(MongoDB.SubjectCollectionName).aggregate([
                { $unwind: '$subject' },
                { $match: { "statuscode": objConstants.activestatus, 'subject.languagecode': params } },
                {
                    $sort: {
                        'subject.subjectname': 1
                    }
                },
                {
                    $project: { _id: 0, subjectcode: 1, subjectname: '$subject.subjectname' }
                }
            ]).toArray(function (err, subjectresult) {
                dbo.collection(MongoDB.newscategoryCollectionName).aggregate([
                    { $match: { statuscode: parseInt(objConstants.activestatus) } },
                    {
                        $sort: {
                            newscategoryname: 1
                        }
                    },
                    {
                        $project: { _id: 0, newscategorycode: 1, newscategoryname: 1 }
                    }
                ]).toArray(function (err, categoryresult) {
                    ////console.log(doc.length);
                    ////console.log(mobdoc.length);
                    finalresult = {
                        "admincontactdetails": adminresult,
                        "subjectdetails": subjectresult,
                        "categorydetails": categoryresult
                    }
                    ////console.log(finalresult);
                    return callback(finalresult);
                });
                
            });
        });
    }
    catch (e) { logger.error("Error in Admin Contact Info Load: " + e); }
}

exports.transContactUsSave = function (params, logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            var dbcollectionname = dbo.collection(MongoDB.TransContactsCollectionName);
            dbcollectionname.insertOne(params, function (err, res) {
                if (err) throw err;
                ////console.log("Document inserted");
                if (res.insertedCount > 0)
                finalresult = params.makerid ;
                else
                    finalresult = "";
                // //console.log(finalresult);
                return callback(finalresult);
            });
        });



    }
    catch (e) { logger.error("Error in Trans Contact Us Save: " + e); }
}
// exports.GetEmployeeProfileInfo = function (logparams, req, callback) {
//     try {
//         const dbo = MongoDB.getDB();
//         var finalresult;
//         logger.info("Log in Employee Profile : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
//         dbo.collection(MongoDB.EmployeeCollectionName).find({ apptypecode: objConstants.defaultstatuscode }).toArray(function (err,result) //find if a value exists
//         {
//             finalresult = result;
//             return callback(finalresult);
//         });

//     }
//     catch (e) { logger.error("Error in Trans Contact Us Save: " + e); }
// }
exports.ContactList = function (logparams, listparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Admin Contact List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

        //var empcreateddate = { $and: [{ "createddate": { $gte: req.query.fromdate } }, { "createddate": { $lte: req.query.todate } }] }
        // //console.log(req.query.fromdate);
        // //console.log(req.query.todate);
        var apptypecode = {}, empcreateddate = {},subjectcode={};
            empcreateddate = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
        
            apptypecode = { 'apptypecode': 1};
        if (listparams.subjectcode != 0)
        subjectcode = { 'subjectcode': listparams.subjectcode};

        var matchparams = { $and: [empcreateddate,apptypecode,subjectcode]};
        dbo.collection(MongoDB.TransContactsCollectionName).aggregate([

            { $match: matchparams},
            
            {
                $lookup: {
                    from: String(MongoDB.EmployeeCollectionName),
                    localField: 'usercode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: { path: '$employeeinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employeeinfo.contactinfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: String(MongoDB.SubjectCollectionName),
                    localField: 'subjectcode',
                    foreignField: 'subjectcode',
                    as: 'subjectinfo'
                }
            },
            { $unwind: '$subjectinfo' },
            { $unwind: '$subjectinfo.subject' },
            { $match: { "subjectinfo.subject.languagecode": objConstants.defaultlanguagecode } },
            {$sort:{createddate:-1}},
            {
                "$project":
                {
                    "_id": 0,contactuscode:1, usercode: 1, subjectcode: 1, apptypecode: 1,createddate:1,statuscode:1, "message": 1, "subjectname": '$subjectinfo.subject.subjectname',
                    "employeename": "$employeeinfo.employeename","mobileno": "$employeeinfo.contactinfo.mobileno","emailid": "$employeeinfo.contactinfo.emailid"
                }
            }
        ]).toArray(function (err, result) {
            ////console.log(result);
            //if (listparams.apptypecode == 0)
                apptypecode = { 'apptypecode': 2};
            
            var matchparams = { $and: [empcreateddate,apptypecode,subjectcode]};
            dbo.collection(MongoDB.TransContactsCollectionName).aggregate([

                { $match: matchparams},
                {
                    $lookup: {
                        from: String(MongoDB.EmployerCollectionName),
                        localField: 'usercode',
                        foreignField: 'employercode',
                        as: 'employerinfo'
                    }
                },
                { $unwind: { path: '$employerinfo', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$employerinfo.contactinfo', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: String(MongoDB.SubjectCollectionName),
                        localField: 'subjectcode',
                        foreignField: 'subjectcode',
                        as: 'subjectinfo'
                    }
                },
                { $unwind: '$subjectinfo' },
                { $unwind: '$subjectinfo.subject' },
                { $match: { "subjectinfo.subject.languagecode": objConstants.defaultlanguagecode } },
                {$sort:{createddate:-1}},
                {
                    "$project":
                    {
                        "_id": 0,contactuscode:1, usercode: 1, subjectcode: 1, apptypecode: 1,createddate:1,statuscode:1, remarks:1, "message": 1, "subjectname": '$subjectinfo.subject.subjectname',
                        "registeredname": "$employerinfo.registeredname", "mobileno": "$employerinfo.contactinfo.mobileno", "emailid": "$employerinfo.registered_email"
                    }
                }
            ]).toArray(function (err, result1) {
                ////console.log(result);
                var finalresult = [];
                if (listparams.apptypecode ==1 )
                {
                    finalresult.push(result);
                     //return callback(result);
                }
                if (listparams.apptypecode ==2 )
                {
                    finalresult.push(result1);
                    //return callback(result1);
                }
                if (listparams.apptypecode ==  0)
                {
                    finalresult.push(result);
                    finalresult[0].push.apply(finalresult[0], result1);
                    //result.push(result1);
                    
                }
                //finalresult.push(result1);
                return callback(finalresult);
            });
        });
        
   
    }
    catch (e) { logger.error("Error in Trans Contact Us Save: " + e); }
}

exports.ContactDetails = function (logparams, contactuscode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Admin Contact List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

        //var empcreateddate = { $and: [{ "createddate": { $gte: req.query.fromdate } }, { "createddate": { $lte: req.query.todate } }] }
        // //console.log(req.query.fromdate);
        // //console.log(req.query.todate);
       
        dbo.collection(MongoDB.TransContactsCollectionName).aggregate([

            { $match: { 'contactuscode': contactuscode}},
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'usercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: { path: '$employerinfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: String(MongoDB.EmployeeCollectionName),
                    localField: 'usercode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: { path: '$employeeinfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: String(MongoDB.SubjectCollectionName),
                    localField: 'subjectcode',
                    foreignField: 'subjectcode',
                    as: 'subjectinfo'
                }
            },
            { $unwind: '$subjectinfo' },
            { $unwind: '$subjectinfo.subject' },
            { $match: { "subjectinfo.subject.languagecode": objConstants.defaultlanguagecode } },
            {
                "$project":
                {
                    "_id": 0, contactuscode: 1, usercode: 1, subjectcode: 1, apptypecode: 1, "message": 1, "subjectname": '$subjectinfo.subject.subjectname',
                    "employeename": "$employeeinfo.employeename", "registeredname": "$employerinfo.registeredname"
                }
            }
        ]).toArray(function (err, result) {
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) { logger.error("Error in Trans Contact Us Save: " + e); }
}