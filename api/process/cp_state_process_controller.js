'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
//const { objConstants.objConstants.defaultstatuscode,objConstants.defaultlanguagecode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
var dbcollectionname = MongoDB.StateCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbdistrictcollectionname = MongoDB.DistrictCollectionName;
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['statecode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].statecode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - state " + e); }
}
// exports.checkStateNameExists = function(logparams,req,callback) {
//     try{     
//         logger.info("Log in checking state name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);     
//         const dbo = MongoDB.getDB();
//         var totalcount=0;
//         for(var i=0;i<req.body.state.length;i++){            
//             dbo.collection(String(dbcollectionname)).find({state: {$elemMatch: {languagecode:req.body.state[i].languagecode, statename:req.body.state[i].statename}}}).count(function (err, res) {
//                 totalcount=totalcount+res;
//             });
//         }
//         return callback(totalcount);
//         // dbo.collection(String(dbcollectionname)).find({statename: req.body.statename}, {$exists: true}).toArray(function(err, doc) //find if a value exists
//         // {  
//         //     return callback(doc.length);
//         // });
//     }
//     catch(e){logger.error("Error in checking state name - state"+e);}
// }

exports.checkStateNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking state name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        checkStateName(req.body.state, function (err, stateCount) {
            if (err) {
                return;
            }
            return callback(stateCount);
        });
    }
    catch (e) { logger.error("Error in checking state name - state" + e); }
}
var async = require('async');
function checkStateName(stateListObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (stateObj, done) {
            if (!stateObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + stateObj.statename.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ state: { $elemMatch: { languagecode: stateObj.languagecode, statename: { $regex: "^" + stateObj.statename + "$", $options: 'i' } } } }).count(function (err, res) {
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
        async.forEach(stateListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking state name - state" + e); }
}
exports.checkStateCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking state code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "statecode": parseInt(req.query.statecode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking state code - state" + e); }
}
exports.checkStateNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking state name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        checkStateNameByCode(req.body.state, req.query.statecode, function (err, stateCount) {
            if (err) {
                return;
            }
            return callback(stateCount);
        });
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({statename: req.body.state[0].statename,statecode:{$ne:req.query.statecode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     //console.log(doc.length);
        //     return callback(doc.length);
        // });
    }
    catch (e) { logger.error("Error in checking state name by code - state" + e); }
}
function checkStateNameByCode(stateListObj, statecodeObj, callback) {
    try {
        // //console.log(statecodeObj);
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (stateObj, done) {
            if (!stateObj.languagecode) {
                done();
                return;
            }
           //var regex = new RegExp("^" + stateObj.statename.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ state: { $elemMatch: { languagecode: stateObj.languagecode, statename: { $regex: "^" + stateObj.statename + "$", $options: 'i' } } }, statecode: { $ne: parseInt(statecodeObj) } }).count(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                // //console.log(res);
                totalcount = totalcount + res;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, totalcount);
        };
        async.forEach(stateListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking state name by code - state" + e); }
}

exports.checkStateCodeExistsInOthers = function (logparams, req, callback) {
    try {
        logger.info("Log in checking state in other tables: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbdistrictcollectionname)).find({ "statecode": parseInt(req.query.statecode) }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking state in other tables - state" + e); }
}
exports.InsertStateDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in state create by state Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - state" + e); }
}
exports.updateStateDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in state update by state Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "statecode": params.statecode }, { $set: params}, function (err, res) {
                if (err) throw err;
                finalresult = res.lastErrorObject.updatedExisting;
               // //console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - state" + e); }
}
exports.deleteStateDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in state Delete by state Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "statecode": parseInt(params.statecode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
           ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - state" + e); }
}
exports.getStateSingleRecordDetails = function (logparams, req, callback) {
    try {
        logger.info("Log in state List by state Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "statecode": parseInt(req.query.statecode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - state" + e); }
}
exports.getStateSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in state List by state Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // //console.log(params.statecode);
        dbo.collection(String(dbcollectionname)).find({ "statecode": parseInt(params.statecode) }, { projection: { _id: 0, statecode: 1, state: 1, statuscode: 1 } }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - state" + e); }
}
exports.getStateFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            return callback(languageresult);
        });
    }
    catch (e) { logger.error("Error in List - state" + e); }
}
exports.getStateList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in state List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
            languagecondition = {"state.languagecode": parseInt(params.languagecode) };
        }
        /*if (parseInt(params.statuscode) == 0) {
            var condition = { 'state.languagecode': objConstants.defaultlanguagecode, "statuscode": { $ne: objConstants.deletestatus } };
        }
        else {
            var condition = { 'state.languagecode': objConstants.defaultlanguagecode, statuscode: parseInt(params.statuscode) };
        }*/
       
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selectedcount: {
                        $size: "$state"
                    },
                    langstatus: { $toInt: { $eq: [{ $size: "$state" }, langcount] } },
                }
            },
            { $unwind: '$state' },
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
                $lookup:
                {
                    from: String(dbdistrictcollectionname),
                    localField: 'statecode',
                    foreignField: 'statecode',
                    as: 'district'
                }
            },
            {
                $sort:{
                    createddate:-1
                }
            },
            { $project: { statecode: 1, statename: '$state.statename',languagecode: '$state.languagecode', statuscode: 1, statusname: '$status.statusname', "district_count": { "$size": "$district" }, language_count_status:  "$langstatus", selected_language_count: "$selectedcount", defaultstatestatus: {$ifNull:[ '$isdefault',0]}, _id: 0 } }
            //{ $group: { _id: { statecode: "$statecode", statuscode: "$statuscode", statusname: '$status.statusname', statename: '$state.statename', language_count_status: "$langstatus", selected_language_count: "$selectedcount", defaultstatestatus: {$ifNull:[ '$isdefault',0]} }, 'district_count': { $sum: 1 } } }
            // , { $project: { statecode: "$_id.statecode", statename: "$_id.statename", statuscode: "$_id.statuscode", statusname: "$_id.statusname", "district_count": 1, language_count_status: "$_id.language_count_status", selected_language_count: "$_id.selected_language_count", defaultstatestatus: '$_id.defaultstatestatus', _id: 0 } }
            
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - state" + e); }
}