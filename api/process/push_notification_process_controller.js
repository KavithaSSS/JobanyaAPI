'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.pushnotificationCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['notificationcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].notificationcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - notification " + e); }
}

exports.checkNotificationCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking notification code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "notificationcode": parseInt(req.query.notificationcode) }).toArray(function (err, doc) //find if a value exists
        {
            ////console.log(doc.length);
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking notification code - notification" + e); }
}

exports.InsertNotificationDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in InsertNotificationDetails: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).insertOne(params, function (err, res) {
                if (err) throw err;
                finalresult = res.insertedCount;
                ////console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in create - getNotificationList" + e); }
}
exports.updateNotificationDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in updateNotificationDetails: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "notificationcode": parseInt(params.notificationcode) }, { $set: params}, function (err, res) {
                if (err) throw err;
                finalresult = res.lastErrorObject.updatedExisting;
                 ////console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - notification" + e); }
}

exports.deleteNotificationDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in deleteNotificationDetails: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "notificationcode": parseInt(params.notificationcode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
           // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in deleteNotificationDetails" + e); }
}

exports.getNotificationSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in getNotificationSingleRecordDetails: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "notificationcode": parseInt(params.query.notificationcode) }).toArray(function (err, result) {
            finalresult = result;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - notification" + e); }
}
exports.getNotificationSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in getNotificationSingleRecordDetails_Edit: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "notificationcode": parseInt(params.notificationcode) }, { projection: { _id: 0, notificationcode: 1, notificationdetails: 1, profilecategory: 1, percentagefrom:1, percentageto:1, employeecount:1, statuscode: 1, sentdate:1 } }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - notification" + e); }
}

exports.getNotificationList = function (logparams, params,  callback) {
    try {
        logger.info("Log in getNotificationList: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var statuscondition = {}; 
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {};
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        
        dbo.collection(String(dbcollectionname)).aggregate([            
            { $unwind: '$notificationdetails' },
            { $match: {$and:[statuscondition,{'notificationdetails.languagecode':objConstants.defaultlanguagecode}]} },
            
            {
                $lookup:
                {
                    from: String(dbstatuscollectionname),
                    localField: 'statuscode',
                    foreignField: 'statuscode',
                    as: 'status'
                }
            },
            { $unwind: '$status' },
            {
                $sort: {
                    createddate: -1
                }
            },
           { $project: { notificationcode:1, createddate:1, pusheddate:1, notificationtitle:'$notificationdetails.notificationtitle', employeecount:'$employeecount', statuscode:1,  statusname: '$status.statusname',   _id: 0 } }
        ]).toArray(function (err, result) {
            finalresult = result;
            //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - getNotificationList " + e); }
}

exports.GetNotificationdetails = function (logparams, params, callback) {
    try {
        logger.info("Log in GetNotificationdetails: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        //console.log(params);
        dbo.collection(MongoDB.pushnotificationCollectionName).aggregate([
            
            { $unwind: '$notificationdetails' },
            { $match: params },
            
            {
                $lookup:
                {
                    from: String(MongoDB.StatusCollectionName),
                    localField: 'statuscode',
                    foreignField: 'statuscode',
                    as: 'status'
                }
            },
            { $unwind: '$status' },
            {
                $project: {
                    _id: 0, notificationtitle: '$notificationdetails.notificationtitle', messagecontent: '$notificationdetails.messagecontent',imageurl: '$notificationdetails.imageurl', notificationcode: 1, makerid:1, statuscode: 1, statusname: '$status.statusname',
                    profilecategory:'$profilecategory',percentagefrom:'$percentagefrom',percentageto:'$percentageto',
					languagecode:'$notificationdetails.languagecode'
					
                }
            } ]).toArray(function (err, result) {
                if(result!=null && result.length>0){
                    exports.GetEmpList(logparams,result[0],function(notifylist){
                        finalresult = {
                            notificationlist: result,
                            employeelist: notifylist
                        }; 
                        // console.log("emplist",notifylist.length)
                        return callback(finalresult);
                    });
                    
                }
                
            });
    }
    catch (e) {
        logger.error("Error in List - GetNotificationdetails " + e);
    }
}

exports.GetEmpList = function (logparams, listparams, callback) {
    try {
        logger.info("Employee List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        var profilepercentage = {},personalinfo = {},contactinfo = {},preference = {},education = {},
        referenceinfo = {},experience = {},skills = {},photo = {},profileparams={};
        var date = new Date();
        //console.log("listparams",listparams)
        if (Number(listparams.percentagefrom) > 0 || Number(listparams.percentageto) > 0) {            
            profilepercentage = {$and :[{ totalpercentage: { $gte: Number(listparams.percentagefrom) } },{ totalpercentage: { $lte: Number(listparams.percentageto) } }]};
        }
        if (listparams.profilecategory!=null && listparams.profilecategory.length > 0) {     
            if(listparams.profilecategory.includes(1))
                personalinfo = {personalinfopercentage:{$eq:0}};
            // else
            //     personalinfo = {personalinfopercentage:{$eq:0}};
            if(listparams.profilecategory.includes(2))
                contactinfo = {contactinfopercentage:{$eq:0}};
            // else
            //     contactinfo = {contactinfopercentage:{$eq:0}};
            if(listparams.profilecategory.includes(6))
                preference = {preferencepercentage:{$eq:0}};
            // else   
            //     preference = {preferencepercentage:{$eq:0}};
            if(listparams.profilecategory.includes(3))
                education = {educationpercentage:{$eq:0}};
            // else
            //     education = {educationpercentage:{$eq:0}};
            if(listparams.profilecategory.includes(5))
                referenceinfo = {referenceinfopercentage:{$eq:0}};
            // else    
            //     referenceinfo = {referenceinfopercentage:{$eq:0}};
            if(listparams.profilecategory.includes(4))
                experience = {experiencepercentage:{$eq:0}};
            // else
            //     experience = {experiencepercentage:{$eq:0}};
            if(listparams.profilecategory.includes(7))
                skills = {skillspercentage:{$eq:0}};
            // else
            //     skills = {skillspercentage:{$eq:0}};
            if(listparams.profilecategory.includes(8))
                photo = {photopercentage:{$eq:0}};
            // else
            //     photo = {photopercentage:{$eq:0}};
        }
        profileparams = {$and:[profilepercentage,personalinfo,contactinfo,preference,education,referenceinfo,experience,skills,photo]};

       
        if (profileparams != "") {
            var personalinfopercentage = 0, contactinfopercentage = 0, preferencepercentage = 0, educationpercentage = 0, 
            referenceinfopercentage = 0, experiencepercentage = 0, skillspercentage = 0, photopercentage = 0;
            objUtilities.GetProfilePercentage(function (profilepercentageresult) {
                personalinfopercentage = profilepercentageresult.filter(t=>t.profilecode==1);
                contactinfopercentage = profilepercentageresult.filter(t=>t.profilecode==2);
                preferencepercentage = profilepercentageresult.filter(t=>t.profilecode==6);
                educationpercentage = profilepercentageresult.filter(t=>t.profilecode==3);
                referenceinfopercentage = profilepercentageresult.filter(t=>t.profilecode==5);
                experiencepercentage = profilepercentageresult.filter(t=>t.profilecode==4);
                skillspercentage = profilepercentageresult.filter(t=>t.profilecode==7);
                photopercentage = profilepercentageresult.filter(t=>t.profilecode==8);
                dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                    { $match: {statuscode:objConstants.activestatus} },
                    
                    {
                        "$project": {
                            _id: 0,
                            "employeecode": 1, preferredlanguagecode:{ $ifNull:[ '$preferredlanguagecode',objConstants.defaultlanguagecode]},personalinfopercentage: {
                                $cond: [{$and:[{$ifNull: ['$personalinfo', false]},{$ifNull: ['$personalinfo.dateofbirth', false]},{ $gt: [{ $type: '$personalinfo.dateofbirth' }, 0],}]}, 
                                contactinfopercentage[0].profilepercentage,   0  
                                ]
                                // $cond: {
                                //   if: {
                                //     $gt: [{ $type: '$personalinfo.dateofbirth' }, 0],
                                //   },
                                //   then: personalinfopercentage[0].profilepercentage,
                                // else: 0,
                                // },
                              },
                              contactinfopercentage: {
                                $cond: [{$and:[{$ifNull: ['$contactinfo', false]},{$ifNull: ['$contactinfo.talukcode', false]},{ $gt: [{ $type: '$contactinfo.talukcode' }, 0],}]}, 
                                contactinfopercentage[0].profilepercentage,   0  
                                ]
                                // $cond: {
                                //   if: {
                                //     $gt: [{ $type: '$contactinfo.talukcode' }, 0],
                                //   },
                                //   then: contactinfopercentage[0].profilepercentage,
                                // else: 0,
                                // },
                              },
                              preferencepercentage: {
                                $cond: [{$ifNull: ['$preferences', false]},  
                                preferencepercentage[0].profilepercentage,   0  
                                ]
                              },
                              educationpercentage: {
                                $cond: [{$and:[{$ifNull: ['$schooling', false]},{ $gt: [ { $size: "$schooling"} , 0 ] }]}, 
                                educationpercentage[0].profilepercentage,   0  
                                ]
                              },
                              referenceinfopercentage: {
                                $cond: [{$and:[{$ifNull: ['$referenceinfo', false]},{ $gt: [ { $size: "$referenceinfo"} , 0 ] }]}, 
                                referenceinfopercentage[0].profilepercentage,   0  
                                ]
                              },
                              experiencepercentage: {
                                $cond: [{$or:[{$and:[{$ifNull: ['$totalexperience', false]},{ $gt: [{ $type: '$totalexperience' }, 0]}]},{$and:[{$ifNull: ['$fresherstatus', false]},{ $gt: [{ $type: '$fresherstatus' }, 0]}]}]},  
                                experiencepercentage[0].profilepercentage,   0  
                                ]
                              },
                              skillspercentage: {
                                $cond: [{$and:[{$ifNull: ['$skills', false]},{ $gt: [ { $size: "$skills"} , 0 ] }]}, 
                                skillspercentage[0].profilepercentage,   0  
                                ]
                              },                              
                              photopercentage: {
                                $cond: [{$and:[{$ifNull: ['$imageurl', false]},{ $ne: [{ $type: '$imageurl' }, '']}]}, 
                                photopercentage[0].profilepercentage,   photopercentage[0].profilepercentage
                                ]
                              }   
                                                   
                        },
                    },
                    {
                        $addFields: { totalpercentage:
                            { $add: [ "$photopercentage", "$skillspercentage", "$experiencepercentage","$referenceinfopercentage", 
                            "$educationpercentage", "$preferencepercentage","$contactinfopercentage", "$personalinfopercentage"] } }
                    },
                    {$match: profileparams}                    
                ]).toArray(function (err, emplist) {
                    return callback(emplist);
                });
            });
            
        }
        else {
            return callback(finalresult);
        }

    }
    catch (e) {
        logger.error("Error in Employee List: " + e);
    }
}

exports.UpdateEmployeeCount = function ( notificationcode,employeecount,currenttime, callback) {
    try { 
         
        const dbo = MongoDB.getDB();
    
        if (notificationcode != null && notificationcode != "") {
            var matchparam={}; 
        //     console.log("notificationrecord",notificationcode)
        // console.log("employeelist",employeecount)
            matchparam={ "notificationcode": Number(notificationcode)}; 
            dbo.collection(MongoDB.pushnotificationCollectionName).updateOne(matchparam, 
                { $set: { "employeecount": employeecount,"statuscode":objConstants.sentstatus ,"pusheddate":currenttime } }, function (err, res) {
                if (err){ 
                    console.log(err)
                    throw (err)
                }
                    //  console.log(res)
                return callback(res);

            });
        }

    }
    catch (e) { 
        logger.error("Error in UpdateEmployeeCount " + e);
    }
}