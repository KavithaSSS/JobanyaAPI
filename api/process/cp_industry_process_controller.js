'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
// const {defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.IndustryCollectionName; 
var dblogcollectionname = MongoDB.LogCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['industrycode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].industrycode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - industry " + e); }
}
exports.checkIndustryNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking Industry name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({industry: req.body.industry[0].industryname}, {$exists: true}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkIndustryName(req.body.industry, function (err, industrycount) {
            if (err) {
                return;
            }
            return callback(industrycount);
        });
    }
    catch (e) { logger.error("Error in checking name - Industry" + e); }
}
exports.checkIndustryCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking Industry code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "industrycode": parseInt(req.query.industrycode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking Industry code - Industry" + e); }
}
exports.checkIndustryNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking Industry name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({industry: req.body.industry[0].industryname,industrycode:{$ne:req.query.industrycode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkIndustryNameByCode(req.body.industry, req.query.industrycode, function (err, industrycount) {
            if (err) {
                return;
            }
            return callback(industrycount);
        });
    }
    catch (e) { logger.error("Error in checking Industry name by code - Industry" + e); }
}
var async = require('async');
function checkIndustryName(IndustryListObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (IndustryObj, done) {
            if (!IndustryObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + IndustryObj.industryname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ industry: { $elemMatch: { languagecode: IndustryObj.languagecode, industryname:{$regex:"^"+IndustryObj.industryname.toLowerCase()+"$",$options:'i'} } } }).count(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                totalcount = totalcount + res;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, totalcount);
        };
        async.forEach(IndustryListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking IndustryObj name - Industry" + e); }
}
function checkIndustryNameByCode(IndustryListObj, industrycodeObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (IndustryObj, done) {
            if (!IndustryObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + IndustryObj.industryname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ industry: { $elemMatch: { languagecode: IndustryObj.languagecode, industryname: {$regex:"^"+IndustryObj.industryname.toLowerCase()+"$",$options:'i'} } }, industrycode: { $ne: parseInt(industrycodeObj) } }).count(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                totalcount = totalcount + res;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, totalcount);
        };
        async.forEach(IndustryListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking industry name - industry" + e); }
}
exports.InsertIndustryDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in Industry create by Industry Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - Industry" + e); }
}
exports.updateIndustryDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in Industry update by Industry Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "industrycode": parseInt(params.industrycode) },{ $set: params}, function (err, res) {
                if (err) throw err;
                finalresult = res.lastErrorObject.updatedExisting;
               // //console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - Industry" + e); }
}
exports.checkIndustryCodeExistsInEmployer = function (logparams, params, callback) {
    try {
        logger.info("Log in checking Industry code in employer: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "industrycode": parseInt(params.industrycode) }, { $exists: true }).count(function (err, industrycount) //find if a value exists
        {
            // //console.log(doc.length);
            return callback(industrycount);
        });
    }
    catch (e) { logger.error("Error in checking industry code in employer  - industry" + e); }
}
exports.checkIndustryCodeExistsInJobpost = function (logparams, params, callback) {
    try {
        logger.info("Log in checking industry code in jobpost : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.JobPostsCollectionName).find({ "industrycode": parseInt(params.industrycode) }, { $exists: true }).count(function (err, industrycount) //find if a value exists
        {
            return callback(industrycount);
        });
    }
    catch (e) { logger.error("Error in checking industry code in jobpost - industry" + e); }
}
exports.deleteIndustryDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in Industry Delete by Industry Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "industrycode": parseInt(params.industrycode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - Industry" + e); }
}
exports.getIndustrySingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in Industry List by Industry Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "industrycode": parseInt(params.query.industrycode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - Industry" + e); }
}
exports.getIndustrySingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in Industry List by Industry Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // //console.log(params);
        dbo.collection(String(dbcollectionname)).find({ "industrycode": parseInt(params.industrycode) }, { projection: { _id: 0, industrycode: 1, industry: 1, imageurl: 1, statuscode: 1 } }).toArray(function (err, result) {
            finalresult = result;
            // //console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - Industry" + e); }
}
exports.getIndustryList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in Industry List by Industry Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
       
        const dbo = MongoDB.getDB();
        var finalresult;
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstants.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"industry.languagecode": parseInt(params.languagecode) };
        }
        dbo.collection(String(dbcollectionname)).aggregate([

            {
                $addFields: {
                    selected_language_count: {
                        $size: "$industry"
                    },
                    language_count_status: { $toInt: { $eq: [{ $size: "$industry" }, langcount] } }
                }
            },
            { $unwind: '$industry' },
            { $match: {$and:[statuscondition,languagecondition]} },
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

            {
                $project: {
                    // _id: 0,industrycode:1,totalcount:{$size:"$industry"},industryname:'$industry.industryname', imageurl:1,statuscode:1,statusname:'$status.statusname'
                    _id: 0, industrycode: 1, imageurl: 1,languagecode: '$industry.languagecode',  statuscode: 1, statusname: '$status.statusname', language_count_status: 1, selected_language_count: 1,
                    // totalcount:{$size:"$industry"},
                    industryname: '$industry.industryname'
                }
            }
            //,{$group:{_id:"$tbl_cp_industry", count:{$sum:"$totalcount"}}}
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
        
    }
    catch (e) { logger.error("Error in List - industry" + e); }
}
exports.getIndutryFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            return callback(languageresult);
        });
    }
    catch (e) { logger.error("Error in form List - industry " + e); }
}