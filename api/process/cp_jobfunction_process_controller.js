'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.JobFunctionCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbjobrolecollectionname = MongoDB.JobRoleCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['jobfunctioncode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].jobfunctioncode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - job function " + e); }
}
exports.checkJobFunctionNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job function name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({jobfunction: req.body.jobfunction[0].jobfunctionname}, {$exists: true}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkJobFunctionName(req.body.jobfunction, function (err, facilitycount) {
            if (err) {
                return;
            }
            return callback(facilitycount);
        });
    }
    catch (e) { logger.error("Error in checking job function name - job function" + e); }
}
exports.checkJobFunctionCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job function code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "jobfunctioncode": parseInt(req.query.jobfunctioncode) }).toArray(function (err, doc) //find if a value exists
        {
            ////console.log(doc.length);
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking job function code - job function" + e); }
}
exports.checkJobFucntionNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job function name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({jobfunction: req.body.jobfunction[0].jobfunctionname,jobfunctioncode:{$ne:req.query.jobfunctioncode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkJobFunctionNameByCode(req.body.jobfunction, req.query.jobfunctioncode, function (err, facilitycount) {
            if (err) {
                return;
            }
            return callback(facilitycount);
        });
    }
    catch (e) { logger.error("Error in checking job function name by code - job function" + e); }
}
var async = require('async');
function checkJobFunctionName(JobFunctionListObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (JobFunctionObj, done) {
            if (!JobFunctionObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + JobFunctionObj.jobfunctionname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ jobfunction: { $elemMatch: { languagecode: JobFunctionObj.languagecode, jobfunctionname: { $regex: "^" + JobFunctionObj.jobfunctionname.toLowerCase() + "$", $options: 'i' } } } }).count(function (err, res) {
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
        async.forEach(JobFunctionListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking job function name - job function" + e); }
}
function checkJobFunctionNameByCode(JobFunctionListObj, jobfunctioncodeObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (JobFunctionObj, done) {
            if (!JobFunctionObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + JobFunctionObj.jobfunctionname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ jobfunction: { $elemMatch: { languagecode: JobFunctionObj.languagecode, jobfunctionname: { $regex: "^" + JobFunctionObj.jobfunctionname.toLowerCase() + "$", $options: 'i' } } }, jobfunctioncode: { $ne: parseInt(jobfunctioncodeObj) } }).count(function (err, res) {
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
        async.forEach(JobFunctionListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking Job function name by code - Job function" + e); }
}
exports.InsertJobFunctionDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in job function create by job function Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - job function" + e); }
}
exports.updateJobFunctionDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in job function update by job function Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "jobfunctioncode": parseInt(params.jobfunctioncode) }, { $set: params }, function (err, res) {
                if (err) throw err;
                finalresult = res.lastErrorObject.updatedExisting;
                ////console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - job function" + e); }
}
exports.deleteJobFunctionDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in job function Delete by job function Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "jobfunctioncode": parseInt(params.jobfunctioncode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - job function" + e); }
}
exports.checkJobFunctionCodeExistsInJobRole = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job function in other tables: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbjobrolecollectionname)).find({ "jobfunctioncode": parseInt(req.query.jobfunctioncode) }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            ////console.log(doc.length);
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking job function in other tables - job function" + e); }
}
exports.checkJobFunctionCodeExistsInSkills = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job function in other tables: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.SkillsMappingCollectionName).find({ "jobfunctioncode": parseInt(req.query.jobfunctioncode) }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            if (doc != null && doc.length > 0) {
                return callback(doc.length);
            }
            else {
                dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                    { $unwind: "$preferences" },
                    { $unwind: "$preferences.jobfunction" },
                    {
                        "$lookup": {
                            "from": String((MongoDB.JobFunctionCollectionName)),
                            "localField": "preferences.jobfunction.jobfunctioncode",
                            "foreignField": "jobfunctioncode",
                            "as": "jobfunctioninfo"
                        }
                    },
                    { $unwind: "$jobfunctioninfo" },
                    { $unwind: "$jobfunctioninfo.jobfunction" },
                    { $match: { "jobfunctioninfo.jobfunction.jobfunctioncode": Number(req.query.jobfunctioncode) } },
                    { $group: { "_id": { "jobfunctioncode": '$preferences.jobfunction.jobfunctioncode', "jobfunctionname": '$jobfunctioninfo.jobfunctioncode.jobfunctionname' } } },
                    {
                        "$project": {
                            _id: 0,
                            jobfunctioncode: '$_id.jobfunctioncode', jobfunctionname: '$_id.jobfunctionname'
                        }
                    }
                ]).toArray(function (err, empjobfunresult) {
                    if (empjobfunresult != null && empjobfunresult.length > 0) {
                        return callback(empjobfunresult.length);
                    }
                    else {
                        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                            { $unwind: "$preferences" },
                            { $unwind: "$preferences.jobfunction" },
                            {
                                "$lookup": {
                                    "from": String((MongoDB.JobFunctionCollectionName)),
                                    "localField": "preferences.jobfunctioncode.jobfunctioncode",
                                    "foreignField": "jobfunctioncode",
                                    "as": "jobfunctioninfo"
                                }
                            },
                            { $unwind: "$jobfunctioninfo" },
                            { $unwind: "$jobfunctioninfo.jobfunction" },
                            { $match: { "jobfunctioninfo.jobfunction.jobfunctioncode": Number(req.query.jobfunctioncode) } },
                            { $group: { "_id": { "jobfunctioncode": '$preferences.jobfunctioncode.jobfunctioncode', "jobfunctioncodename": '$jobfunctioninfo.jobfunctioncode.jobfunctionname' } } },
                            {
                                "$project": {
                                    _id: 0,
                                    jobfunctioncode: '$_id.jobfunctioncode', jobfunctionname: '$_id.jobfunctionname'
                                }
                            }
                        ]).toArray(function (err, jobfunresult) {
                            if (jobfunresult != null && jobfunresult.length > 0) {
                                return callback(jobfunresult.length);
                            }
                            else {
                                return callback(0);
                            }

                        });
                    }
                });
            }
        });
    }
    catch (e) { logger.error("Error in checking job function in other tables - job function" + e); }
}
exports.getJobFunctionSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in job function List by job function Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "jobfunctioncode": parseInt(params.query.jobfunctioncode) }).toArray(function (err, result) {
            finalresult = result;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - job function" + e); }
}
exports.getJobFunctionSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in job function List by job function Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "jobfunctioncode": parseInt(params.jobfunctioncode) }, { projection: { _id: 0, jobfunctioncode: 1, jobfunction: 1, imageurl: 1, statuscode: 1, isshowwebsite: 1 } }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - job function" + e); }
}
exports.getJobFunctionFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            return callback(languageresult);
        });
    }
    catch (e) { logger.error("Error in List - job function " + e); }
}
exports.getJobFunctionList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in JobFunction List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = { "statuscode": { $ne: objConstants.deletestatus } };
        }
        else {
            statuscondition = { "statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode != null && parseInt(params.languagecode) != 0) {
            languagecondition = { "jobfunction.languagecode": parseInt(params.languagecode) };
        }
        // if (parseInt(params.statuscode) == 0) { var condition = { 'jobfunction.languagecode': defaultlanguagecode, "statuscode": { $ne: objConstants.deletestatus } }; }
        // else { var condition = { 'jobfunction.languagecode': defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selectedcount: {
                        $size: "$jobfunction"
                    },
                    langstatus: { $toInt: { $eq: [{ $size: "$jobfunction" }, langcount] } },
                    // jobrolecount:{ $count: "$jobrole"}  
                }
            },
            { $unwind: '$jobfunction' },
            { $match: { $and: [statuscondition, languagecondition] } },
            {
                $lookup:
                {
                    from: String(dbjobrolecollectionname),
                    localField: 'jobfunctioncode',
                    foreignField: 'jobfunctioncode',
                    as: 'jobrole'
                }
            },
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
            //{ $group: { _id: { jobfunctioncode: "$jobfunctioncode", statuscode: "$statuscode", statusname: '$status.statusname', jobfunctionname: '$jobfunction.jobfunctionname', language_count_status: "$langstatus", selected_language_count: "$selectedcount" }, 'jobrolecount': { $sum: 1 } } }

            // , { $project: { jobfunctioncode: "$_id.jobfunctioncode", jobfunctionname: "$_id.jobfunctionname", statuscode: "$_id.statuscode", statusname: "$_id.statusname", "jobrolecount": 1, language_count_status: "$_id.language_count_status", selected_language_count: "$_id.selected_language_count", _id: 0 } }
            { $project: { jobfunctioncode: 1, jobfunctionname: '$jobfunction.jobfunctionname', logourl: '$imageurl', languagecode: '$jobfunction.languagecode', statuscode: 1, statusname: '$status.statusname', language_count_status: "$langstatus", selected_language_count: "$selectedcount", "jobrolecount": { "$size": "$jobrole" }, _id: 0 } }
        ]).toArray(function (err, result) {
            finalresult = result;
            // console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - Job function " + e); }
}