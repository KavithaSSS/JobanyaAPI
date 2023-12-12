'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.JobRoleCollectionName;
var dbjobfunctioncollectionname = MongoDB.JobFunctionCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
//var dbskillcollectionname = MongoDB.SkillCollectionName;
var objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['jobrolecode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].jobrolecode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - job role " + e); }
}
exports.checkJobRoleNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job role name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({jobrole: req.body.jobrole[0].jobrolename}, {$exists: true}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkJobRoleName(req.body.jobrole, function (err, rolecount) {
            if (err) {
                return;
            }
            return callback(rolecount);
        });
    }
    catch (e) { logger.error("Error in checking job role name - job role" + e); }
}
exports.checkJobRoleCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job role code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "jobrolecode": parseInt(req.query.jobrolecode) }).toArray(function (err, doc) //find if a value exists
        {
            // //console.log(doc.length);
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking job role code - job role" + e); }
}
exports.checkJobRoleNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job role name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({jobrole: req.body.jobrole[0].jobrolename,jobrolecode:{$ne:req.query.jobrolecode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkJobRoleNameByCode(req.body.jobrole, req.query.jobrolecode, function (err, rolecount) {
            if (err) {
                return;
            }
            return callback(rolecount);
        });
    }
    catch (e) { logger.error("Error in checking job role name by code - job role" + e); }
}

exports.checkJobRoleCodeExistsInOthers = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job role in other tables: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(MongoDB.SkillsMappingCollectionName)).find({ "jobrolecode": parseInt(req.query.jobrolecode) }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            
            if(doc!=null && doc.length>0){
                ////console.log("doc",doc.length);
                return callback(doc.length);
            }
            else{
                dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                    {$unwind:"$preferences"},
                    {$unwind:"$preferences.jobrole"},
                    { "$lookup": {
                         "from": String((MongoDB.JobRoleCollectionName)),
                         "localField": "preferences.jobrole.jobrolecode",
                         "foreignField": "jobrolecode",
                         "as": "jobroleinfo"
                    }},
                    { $unwind: "$jobroleinfo" },
                    { $unwind: "$jobroleinfo.jobrole" },
                    { $match:  { "jobroleinfo.jobrole.jobrolecode": Number(req.query.jobrolecode) } },
                    {$group: {"_id": {"jobrolecode": '$preferences.jobrole.jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename'}}},
                    { "$project": {
                       _id: 0,
                       jobrolecode: '$_id.jobrolecode', jobrolename: '$_id.jobrolename'}}
                        ]).toArray(function(err, empjobroleresult) {
                            //console.log("empjobroleresult",empjobroleresult);
                            if(empjobroleresult!=null && empjobroleresult.length>0){
                                ////console.log("empjobroleresult",empjobroleresult.length);
                                return callback(empjobroleresult.length);
                            }
                            else{
                                dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                                    {$unwind:"$preferences"},
                                    {$unwind:"$preferences.jobrole"},
                                    { "$lookup": {
                                         "from": String((MongoDB.JobRoleCollectionName)),
                                         "localField": "preferences.jobrole.jobrolecode",
                                         "foreignField": "jobrolecode",
                                         "as": "jobroleinfo"
                                    }},
                                    { $unwind: "$jobroleinfo" },
                                    { $unwind: "$jobroleinfo.jobrole" },
                                    { $match: {  "jobroleinfo.jobrole.jobrolecode": Number(req.query.jobrolecode) } },
                                    {$group: {"_id": {"jobrolecode": '$preferences.jobrole.jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename'}}},
                                    { "$project": {
                                       _id: 0,
                                       jobrolecode: '$_id.jobrolecode', jobrolename: '$_id.jobrolename'}}
                                        ]).toArray(function(err, jobroleresult) {
                                            //return callback(jobroleresult.length);
                                            if(jobroleresult!=null && jobroleresult.length>0){
                                                ////console.log("jobroleresult",jobroleresult.length);
                                                return callback(jobroleresult.length);
                                            }
                                            else{
                                                return callback(0);
                                            }
                                        });
                            }
                        });
            }
            
        });
    }
    catch (e) { logger.error("Error in checking job role in other tables - job role" + e); }
}
exports.checkjobfunctioncodeExistsInJobrole = function (logparams, params, callback) {
    try {
        logger.info("Log in checking jobfunction code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "jobrolecode": parseInt(params.jobrolecode) }, { projection: { _id: 0, jobfunctioncode: 1 } }).toArray(function (err, result) //find if a value exists
        {
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) { logger.error("Error in checking jobfunction code in jobrole " + e); }
}
var async = require('async');
function checkJobRoleName(JobRoleListObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (JobRoleObj, done) {
            if (!JobRoleObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + JobRoleObj.jobrolename.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ jobrole: { $elemMatch: { languagecode: JobRoleObj.languagecode, jobrolename: { $regex: "^" + JobRoleObj.jobrolename + "$", $options: 'i' } } } }).count(function (err, res) {
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
        async.forEach(JobRoleListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking JobRole name - JobRole" + e); }
}
function checkJobRoleNameByCode(JobRoleListObj, jobrolecodeObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (JobRoleObj, done) {
            if (!JobRoleObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + JobRoleObj.jobrolename.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ jobrole: { $elemMatch: { languagecode: JobRoleObj.languagecode, jobrolename: { $regex: "^" + JobRoleObj.jobrolename + "$", $options: 'i' } } }, jobrolecode: { $ne: parseInt(jobrolecodeObj) } }).count(function (err, res) {
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
        async.forEach(JobRoleListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking JobRole name by code - JobRole" + e); }
}
exports.InsertJobRoleDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in job role create by job role Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - job role" + e); }
}
exports.updateJobRoleDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in job role update by job role Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "jobrolecode": parseInt(params.jobrolecode) }, { $set: params}, function (err, res) {
                if (err) throw err;
                finalresult = res.lastErrorObject.updatedExisting;
                ////console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - job role" + e); }
}
exports.deleteJobRoleDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in job role Delete by job role Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "jobrolecode": parseInt(params.jobrolecode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - job role" + e); }
}
exports.getJobRoleSingleRecordDetails = function (logparams, req, callback) {
    try {
        logger.info("Log in job role List by job role Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "jobrolecode": parseInt(req.query.jobrolecode) }).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - job role" + e); }
}
exports.getJobRoleSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in jobrolecode List by jobrolecode Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // //console.log(params);
        dbo.collection(String(dbcollectionname)).find({ "jobrolecode": parseInt(params.jobrolecode) }, { projection: { _id: 0, jobrolecode: 1, jobrole: 1, jobfunctioncode: 1, statuscode: 1 } }).toArray(function (err, result) {
            finalresult = result;
            // //console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - jobrolecode" + e); }
}
exports.getJobRoleFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            dbo.collection(String(dbjobfunctioncollectionname)).aggregate([
                { $unwind: '$jobfunction' },
                { $match: { 'jobfunction.languagecode': defaultlanguagecode, statuscode: parseInt(objConstants.activestatus) } },
                {
                    $sort: {
                        'jobfunction.jobfunctionname': 1
                    }
                },
                {
                    $project: {
                        _id: 0, jobfunctioncode: 1, jobfunctionname: '$jobfunction.jobfunctionname'
                    }
                }
            ]).toArray(function (err, result) {
                finalresult.push(languageresult);
                finalresult.push(result);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in form List - jobrolecode " + e); }
}

exports.getJobRoleList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in Job role List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // if (parseInt(params.statuscode) == 0) { var condition = { 'jobrole.languagecode': defaultlanguagecode, "statuscode": { $ne: objConstants.deletestatus } }; }
        // else { var condition = { 'jobrole.languagecode': defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstants.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"jobrole.languagecode": parseInt(params.languagecode) };
        }
        var langparams = { 'jobrole.languagecode': defaultlanguagecode };
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    skillscount:0,
                    selectedcount: { $size: "$jobrole" },
                    langstatus: { $toInt: { $eq: [{ $size: "$jobrole" }, langcount] } },
                }
            },
            { $unwind: '$jobrole' },
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
                    from: String(dbjobfunctioncollectionname),
                    let: { jobfunctioncode: "$jobfunctioncode" },
                    pipeline: [{ $unwind: '$jobfunction' },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$jobfunctioncode", "$$jobfunctioncode"] },
                                    { $eq: ["$jobfunction.languagecode", defaultlanguagecode] }
                                ]
                            }
                        }
                    }],
                    as: 'jobfunction'
                }
            },
            { $unwind: '$jobfunction' },
            // {
            //     $lookup:
            //     {
            //         from: String(MongoDB.SkillsMappingCollectionName),
            //         localField: 'jobrolecode',
            //         foreignField: 'jobrolecode',
            //         as: 'skill'
            //     }
            // },
            {
                $sort: {
                    createddate: -1
                }
            },
            //{ $group: { _id: { jobrolecode: "$jobrolecode", jobrolename: "$jobrole.jobrolename", statuscode: "$statuscode", statusname: '$status.statusname', jobfunctionname: '$jobfunction.jobfunction.jobfunctionname', language_count_status: "$langstatus", selected_language_count: "$selectedcount" }, 'skills_count': { $sum: 1 } } },
     
            //{ $project: { jobrolecode: "$_id.jobrolecode", jobrolename: "$_id.jobrolename", jobfunctionname: "$_id.jobfunctionname", statuscode: "$_id.statuscode", statusname: "$_id.statusname", "skills_count": 1, language_count_status: "$_id.language_count_status", selected_language_count: "$_id.selected_language_count", _id: 0 } }
            { $project: { jobrolecode:1, jobrolename:'$jobrole.jobrolename',languagecode: '$jobrole.languagecode', statuscode:1,  statusname: '$status.statusname', jobfunctionname: '$jobfunction.jobfunction.jobfunctionname', language_count_status: "$langstatus", selected_language_count: "$selectedcount" ,"skills_count": "$skillscount", _id: 0 } },
            {$skip:parseInt(params.skipvalue)},
                {$limit:parseInt(params.limitvalue)}
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - Job role " + e); }
}