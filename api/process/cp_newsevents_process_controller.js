'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
// const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.newseventsCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dbnewscategorycollectionname = MongoDB.newscategoryCollectionName;
var dbnewstypecollectionname = MongoDB.newstypeCollectionName;
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['newscode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].newscode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - news " + e); }
}
exports.checkNewsCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking news code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "newscode": parseInt(req.query.newscode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking news name - news" + e); }
}
exports.InsertNewsDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in news create by news Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - news" + e); }
}
exports.updateNewsDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in news update by news Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "newscode": parseInt(params.newscode) },  { $set: params}, function (err, res) {
            if (err) throw err;
            finalresult = res.lastErrorObject.updatedExisting;
           // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in update - news" + e); }
}
exports.deleteNewsDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in news Delete by news Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "newscode": parseInt(params.newscode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - news" + e); }
}
exports.getNewsSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in news List by news Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "newscode": parseInt(params.query.newscode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - news" + e); }
}
exports.getNewsSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in news List by news Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        ////console.log(params);
        dbo.collection(String(dbcollectionname)).find({ "newscode": parseInt(params.newscode) }, { projection: { _id: 0, newscode: 1, categorycode: 1, newstypecode: 1,approveddate:1,remarks:1, link: 1, imageurl: 1, startdate: 1, enddate: 1, expirydate: 1, newsevents: 1, statuscode: 1 } }).toArray(function (err, result) {
            finalresult = result;
            ////console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - news" + e); }
}
exports.getNewsFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        objUtilities.getPortalLanguageDetails(logparams, function (lanresult) {
            dbo.collection(String(dbnewscategorycollectionname)).aggregate([
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
                dbo.collection(String(dbnewstypecollectionname)).aggregate([
                    { $match: { statuscode: parseInt(objConstants.activestatus) } },
                    {
                        $sort: {
                            newstypename: 1
                        }
                    },
                    {
                        $project: { _id: 0, newstypecode: 1, newstypename: 1 }
                    }
                ]).toArray(function (err, typeresult) {
                    finalresult.push(lanresult);
                    finalresult.push(categoryresult);
                    finalresult.push(typeresult);
                    return callback(finalresult);
                });
            });
        });
        
    }
    catch (e) { logger.error("Error in form List - news " + e); }
}
exports.getNewsList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in news List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        if (parseInt(params.statuscode) == 0) { var condition = { 'newsevents.languagecode': objConstants.defaultlanguagecode, statuscode: { $ne: objConstants.deletestatus } }; }
        else { var condition = { 'newsevents.languagecode': objConstants.defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selected_language_count: {
                        $size: "$newsevents"
                    },
                    language_count_status: { $toInt: { $eq: [{ $size: "$newsevents" }, langcount] } },
                }
            },
            { $unwind: '$newsevents' },
            { $match: condition },
            {
                $lookup:
                {
                    from: String(MongoDB.newscategoryCollectionName),
                    localField: 'categorycode',
                    foreignField: 'newscategorycode',
                    as: 'categoryinfo'
                }
            },
            { $unwind: '$categoryinfo' },
            {
                $lookup:
                {
                    from: String(MongoDB.newstypeCollectionName),
                    localField: 'newstypecode',
                    foreignField: 'newstypecode',
                    as: 'newstypeinfo'
                }
            },
            { $unwind: '$newstypeinfo' },
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
                    _id: 0, newscode: 1, statuscode: 1,approveddate:1,remarks:1, newstypecode: 1, newstypename: '$newstypeinfo.newstypename', categorycode: 1, categoryname: '$categoryinfo.newscategoryname', statusname: '$status.statusname', title: '$newsevents.title', startdate: 1, enddate: 1, expirydate: 1, language_count_status: 1, selected_language_count: 1//,newstype:'$newstype:newstypename',newscategory:'$newscategory.newscategoryname'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log(finalresult);
            return callback(finalresult);
        });
        // {
        //     $lookup:
        //     {
        //         from: String(dbnewscategorycollectionname),
        //         localField: 'newscategorycode',
        //         foreignField: 'newscategorycode',
        //         as: 'newscategory'
        //     }
        // },
        // {
        //     $lookup:
        //     {
        //         from: String(dbnewstypecollectionname),
        //         localField: 'newstypecode',
        //         foreignField: 'newstypecode',
        //         as: 'newstype'
        //     }
        // },

    }
    catch (e) { logger.error("Error in List - News Events " + e); }
}

exports.NewsBind = function (logparams, req, callback) {
    try {
        logger.info("Binding News field : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            var dbcollectionname = dbo.collection(MongoDB.newseventsCollectionName);
            var langparams = Number(req.query.languagecode);
            // //console.log(langparams);
            dbcollectionname.aggregate([
                { $unwind: '$newsevents' },
                { $match: {'newsevents.languagecode':langparams, "newstypecode": Number(objConstants.newstypecode), $or:[{"categorycode": Number(objConstants.eventscategorycode)},{"categorycode": Number(objConstants.BothCategorycode)}],statuscode: parseInt(objConstants.approvedstatus),expirydate: {$gte: currenttime } }},
                {
                    $project: {
                        _id: 0, title: '$newsevents.title', venue: '$newsevents.venue', description: '$newsevents.description', "newscode": 1,"newstypecode":1, "imageurl": 1, "link": 1, "startdate": 1, "enddate": 1, "expirydate": 1
                    }
                }
            ]).toArray(function (err, result) {

                // //console.log(result);
                return callback(result);
            });
        });
        
    }
    catch (ex) {
        logger.error("Error in Binding news field - News Events " + e);
    }
    finally {
    }
}
exports.EventsBind = function (logparams, req, callback) {
    try {
        logger.info("Binding events field : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            var dbcollectionname = dbo.collection(MongoDB.newseventsCollectionName);
            var langparams = { "newstypecode": Number(objConstants.eventstypecode), $or:[{"categorycode": Number(objConstants.eventscategorycode)},{"categorycode": Number(objConstants.BothCategorycode)}] , "newsevents.languagecode": Number(req.query.languagecode), statuscode: parseInt(objConstants.approvedstatus),expirydate: {$gte: currenttime } };
        
            dbcollectionname.aggregate([

                { $unwind: '$newsevents' },
                { $match: langparams },
                {
                    $project: {
                        _id: 0, title: '$newsevents.title', venue: '$newsevents.venue', description: '$newsevents.description', "newscode": 1,"newstypecode":1, "imageurl": 1, "link": 1, "startdate": 1, "enddate": 1, "expirydate": 1
                    }
                }
            ]).toArray(function (err, result) {

                ////console.log(result);
                return callback(result);
            });
        });
        
    }
    catch (ex) {
        logger.error("Error in Binding events field - News Events " + e);
    }
    finally {
    }

}

exports.NewsDetails = function (logparams, req, callback) {
    try {
        logger.info("View News field : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        var dbcollectionname = dbo.collection(MongoDB.newseventsCollectionName);
        var langparams = Number(req.query.languagecode);
        // //console.log(langparams);
        dbcollectionname.aggregate([
            { $unwind: '$newsevents' },
            { $match: {'newsevents.languagecode':langparams,"newscode": Number(req.query.newscode), "newstypecode": Number(objConstants.newstypecode), statuscode: parseInt(objConstants.approvedstatus) }},
            {
                $project: {
                    _id: 0, title: '$newsevents.title', venue: '$newsevents.venue', description: '$newsevents.description', "newscode": 1, "newstypecode":1,"imageurl": 1, "link": 1, "startdate": 1, "enddate": 1, "expirydate": 1
                }
            }
        ]).toArray(function (err, result) {

            // //console.log(result);
            return callback(result);
        });
    }
    catch (ex) {
        logger.error("Error in View news field - News Events " + e);
    }
    finally {
    }
}
exports.EventsDetails = function (logparams, req, callback) {
    try {
        logger.info("View events field : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var dbcollectionname = dbo.collection(MongoDB.newseventsCollectionName);
        var langparams = { "newstypecode": Number(objConstants.eventstypecode),"newscode": Number(req.query.eventcode), "newsevents.languagecode": Number(req.query.languagecode), statuscode: parseInt(objConstants.approvedstatus) };
      
        dbcollectionname.aggregate([

            { $unwind: '$newsevents' },
            { $match: langparams },
            {
                $project: {
                    _id: 0, title: '$newsevents.title', venue: '$newsevents.venue', description: '$newsevents.description', "newscode": 1,"newstypecode":1, "imageurl": 1, "link": 1, "startdate": 1, "enddate": 1, "expirydate": 1
                }
            }
        ]).toArray(function (err, result) {

            ////console.log(result);
            return callback(result);
        });
    }
    catch (ex) {
        logger.error("Error in View events field - News Events " + e);
    }
    finally {
    }

}

exports.checkValidCode = function (logparams, req, callback) {
    try {
        logger.info("View events field : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var dbcollectionname = dbo.collection(MongoDB.newseventsCollectionName);
        var langparams = { "newscode": Number(req.query.newscode) };
      
        dbcollectionname.aggregate([

            { $unwind: '$newsevents' },
            { $match: langparams },
            {
                $project: {
                    _id: 0, languagecode: '$newsevents.languagecode',title: '$newsevents.title', venue: '$newsevents.venue', description: '$newsevents.description', "newscode": 1,"newstypecode":1, "imageurl": 1, "link": 1, "startdate": 1, "enddate": 1, "expirydate": 1,"newstypecode":1,"makerid":1,"categorycode":1
                }
            }
        ]).toArray(function (err, result) {

            ////console.log(result);
            return callback(result);
        });
    }
    catch (ex) {
        logger.error("Error in View events field - News Events " + e);
    }
    finally {
    }

}

exports.UpdateStatuscodeInNewsEvents = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        const dbo = MongoDB.getDB();
        logger.info("Log in News or Events Update Active Statuscode : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        objUtilities.InsertLog(logparams, function (validlog) {
            if (validlog != null && validlog != 0) {
                dbo.collection(MongoDB.newseventsCollectionName).updateOne({ "newscode": Number(req.query.newscode)}, { $set: {  "statuscode": Number(req.query.statuscode),  updateddate: milliseconds, checkerid: validlog } }, function (err, result) {
                    if (err)
                        throw err;
                    // //console.log(result.modifiedCount);
                     return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
                });
            }

        });

    }
    catch (e) {
        logger.error("Error in UpdateApprovedStatuscodeInNewsEvents :  " + e);
    }

}

exports.UpdateImageurl = function (logparams, req, callback) {
    try {
        logger.info("Updating Image URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.newseventsCollectionName).updateOne({ "newscode": parseInt(req.query.newscode) }, { $set: { "imageurl": req.body.imageurl } }, function (err, res) {
            if (err) throw err;
            finalresult = res.modifiedCount;
            ////console.log(finalresult);
            return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
        });

    }
    catch (e) { logger.error("Error in Image File URL: " + e); }
}