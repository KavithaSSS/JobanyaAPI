'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
const { defaultstatuscode, defaultlanguagecode } = require('../../config/constants');
var dbcollectionname = MongoDB.TalukCollectionName;
var dbstatecollectionname = MongoDB.StateCollectionName;
var dbdistrictcollectionname = MongoDB.DistrictCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['talukcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].talukcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - taluk " + e); }
}
exports.checkTalukNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking taluk name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({talukname: req.body.taluk[0].talukname}, {$exists: true}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
       
        checkTalukName(req.body.taluk, req.body.districtcode, function (err, stateCount) {
            if (err) {
                return;
            }
            return callback(stateCount);
        });
    }
    catch (e) { logger.error("Error in checking taluk name - taluk" + e); }
}
exports.checkTalukCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking taluk code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ talukcode: parseInt(req.query.talukcode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking taluk code - taluk" + e); }
}
exports.checkTalukNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking taluk name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({talukname: req.body.taluk[0].talukname,talukcode:{$ne:req.query.talukcode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkTalukNameByCode(req.body.taluk, req.query.talukcode, req.body.districtcode, function (err, stateCount) {
            if (err) {
                return;
            } 
            return callback(stateCount);
        });
    }
    catch (e) { logger.error("Error in checking taluk name by code - taluk" + e); }
}
var async = require('async');
function checkTalukName(talukListObj, districtcodeObj, callback) {
    try {
       
        var totalcount = 0;
        const dbo = MongoDB.getDB();  
        var iteratorFcn = function (talukObj, done) {  
            if (!talukObj.languagecode) {
                done();
                return;
            }
           dbo.collection(String(dbcollectionname)).find({ taluk: { $elemMatch: { languagecode: talukObj.languagecode, talukname: {$regex:"^"+talukObj.talukname.toLowerCase()+"$",$options:'i'} } }, districtcode: parseInt(districtcodeObj) }).count(function (err, res) {
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
        async.forEach(talukListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {logger.error("Error in checking taluk name - taluk" + e); }
}
function checkTalukNameByCode(talukListObj, talukcodeObj, districtcodeobj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (talukObj, done) {
            if (!talukObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + talukObj.talukname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ taluk: { $elemMatch: { languagecode: talukObj.languagecode, talukname: {$regex:"^"+talukObj.talukname.toLowerCase()+"$",$options:'i'} } }, districtcode: parseInt(districtcodeobj), talukcode: { $ne: parseInt(talukcodeObj) } }).count(function (err, res) {
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
        async.forEach(talukListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking taluk name By code - taluk" + e); }
}

exports.InsertTalukDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in taluk create by taluk Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - taluk" + e); }
}
exports.updateTalukDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in taluk update by taluk Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).replaceOne({ "talukcode": parseInt(params.talukcode) }, params, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - taluk" + e); }
}
exports.checkTalukCodeExistsInEmployer = function (logparams, params, callback) {
    try {
        logger.info("Log in checking taluk code in employer: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "contactinfo.talukcode": parseInt(params.talukcode) }, { $exists: true }).count(function (err, talukcount) //find if a value exists
        {
            // //console.log(talukcount);
            dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                { "$unwind": "$branch" },
                { $match: { "branch.talukcode": Number(params.talukcode) } },
            ]).toArray(function (err, talukcountbranch)
            {
                return callback(talukcount+talukcountbranch.length);
            });
            
        });
    }
    catch (e) { logger.error("Error in checking taluk code in employer  - taluk" + e); }
}
exports.checkTalukCodeExistsInEmployee = function (logparams, params, callback) {
    try {
        logger.info("Log in checking taluk code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "contactinfo.talukcode": parseInt(params.talukcode) }, { $exists: true }).count(function (err, talukcount) //find if a value exists
        {
            return callback(talukcount);
        });
    }
    catch (e) { logger.error("Error in checking taluk code in employee - taluk" + e); }
}
exports.checkDistrictCodeExistsInTaluk = function (logparams, params, callback) {
    try {
        logger.info("Log in checking taluk code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "talukcode": parseInt(params.talukcode) }, { projection: { _id: 0, districtcode: 1 } }).toArray(function (err, result) //find if a value exists
        {
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) { logger.error("Error in checking district code in  taluk" + e); }
}
exports.deleteTalukDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in taluk Delete by taluk Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "talukcode": parseInt(params.talukcode) }, function (err, res) {
            if (err)
                throw err;
            ////console.log(res.deletedCount);
            return callback(res.deletedCount);
        });
    }
    catch (e) { logger.error("Error in delete - taluk" + e); }
}
exports.getTalukSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in taluk List by taluk Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "talukcode": parseInt(params.query.talukcode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - taluk" + e); }
}
exports.getTalukSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in taluk List by taluk Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).aggregate([
            { $match: { "talukcode": parseInt(params.talukcode) } },
            {
                $lookup:
                {
                    from:  String(dbdistrictcollectionname),
                    localField: 'districtcode',
                    foreignField: 'districtcode',
                    as: 'districtinfo'
                }
            },
            { $unwind: '$districtinfo' },
            {
                $project: {
                    _id: 0, talukcode: 1, taluk: 1, statuscode: 1, districtcode: 1, statecode: "$districtinfo.statecode"
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - taluk" + e); }
}
exports.getTalukFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            dbo.collection(String(dbstatecollectionname)).aggregate([
                { $unwind: '$state' },
                { $match: { 'state.languagecode': parseInt(defaultlanguagecode), statuscode: parseInt(objConstants.activestatus) } },
                {
                    $sort: {
                        'state.statename': 1
                    }
                },
                {
                    $project: {
                        _id: 0, statecode: 1, statename: '$state.statename'
                    }
                }
            ]).toArray(function (err, resultnext) {
                dbo.collection(String(dbdistrictcollectionname)).aggregate([
                    { $unwind: '$district' },
                    { $match: { 'district.languagecode': parseInt(defaultlanguagecode), statuscode: parseInt(objConstants.activestatus) } },
                    {
                        $sort: {
                            'district.districtname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, districtcode: 1, districtname: '$district.districtname', statecode: 1
                        }
                    }
                ]).toArray(function (err, distrctresult) {
                    finalresult.push(languageresult);
                    finalresult.push(resultnext);
                    finalresult.push(distrctresult);
                    return callback(finalresult);
                });
            });
        });
    }
    catch (e) { logger.error("Error in Fom load - Taluk " + e); }
}
exports.getTalukList = function (logparams, params, langcount, callback) {
    try { 
        logger.info("Log in taluk List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // if (parseInt(params.statuscode) == 0) { var condition = { 'taluk.languagecode': defaultlanguagecode, "statuscode": { $ne: objConstants.deletestatus } }; }
        // else { var condition = { 'taluk.languagecode': defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstants.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"taluk.languagecode": parseInt(params.languagecode) };
        }
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selected_language_count: {
                        $size: "$taluk"
                    },
                    language_count_status: { $toInt: { $eq: [{ $size: "$taluk" }, langcount] } },
                }
            },
            { $unwind: '$taluk' },
            { $match: {$and:[statuscondition,languagecondition]} },
            {
                $lookup:
                {
                    from: String(dbdistrictcollectionname),
                    let: { districtcode: "$districtcode" },
                    pipeline: [{ $unwind: '$district' },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$districtcode", "$$districtcode"] },
                                    { $eq: ["$district.languagecode", defaultlanguagecode] }
                                ]
                            }
                        }
                    }],
                    as: 'district'
                }
            },
            { $unwind: '$district' },
            {
                $lookup:
                {
                    from:  String(dbstatecollectionname),
                    localField: 'district.statecode',
                    foreignField: 'statecode',
                    as: 'stateinfo'
                }
            },
            { $unwind: '$stateinfo' },
            { $unwind: '$stateinfo.state' },
            { $match: { 'stateinfo.state.languagecode': defaultlanguagecode, "stateinfo.statuscode": objConstants.activestatus } },
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
                    _id: 0, talukcode: 1, talukname: "$taluk.talukname",languagecode: '$taluk.languagecode', districtcode: 1, districtname: "$district.district.districtname", statecode: "$stateinfo.statecode", statename: "$stateinfo.state.statename", statuscode: 1, statusname: '$status.statusname', language_count_status: 1, selected_language_count: 1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result; 
            return callback(finalresult);
        });
    }
    catch (e) {  console.log(e); logger.error("Error in List - Taluk " + e); }
}
