'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getSkillLoad = function (logparams, langparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Skill Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var jobfuncparams = { statuscode: objConstants.activestatus, 'jobfunction.languagecode': Number(langparams) };
        dbo.collection(MongoDB.JobFunctionCollectionName).aggregate([
            { $unwind: '$jobfunction' },
            { $match: jobfuncparams },
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
        ]).toArray(function (err, jobfunctionresult) {
            //Job Role Collection
            var jobroleparams = { statuscode: objConstants.activestatus, 'jobrole.languagecode': Number(langparams) };
            dbo.collection(MongoDB.JobRoleCollectionName).aggregate([
                { $unwind: '$jobrole' },
                { $match: jobroleparams },
                {
                    $sort: {
                        'jobrole.jobrolename': 1
                    }
                },
                {
                    $project: {
                        _id: 0, jobrolecode: 1, jobrolename: '$jobrole.jobrolename', jobfunctioncode: 1
                    }
                }
            ]).toArray(function (err, jobroleresult) {
                //Employement Type Collection
                var skillparams = { statuscode: objConstants.activestatus, 'skill.languagecode': Number(langparams) };
                dbo.collection(String(MongoDB.SkillsMappingCollectionName)).aggregate([
                    {
                        $lookup:
                        {
                            from: String(MongoDB.SkillCollectionName),
                            localField: 'skillcode',
                            foreignField: 'skillcode',
                            as: 'skillinfo'
                        }
                    },
                    { $unwind: '$skillinfo' },
                    { $unwind: '$skillinfo.skill' },
                    { $match: { "skillinfo.statuscode": objConstants.activestatus, "skillinfo.skill.languagecode": Number(langparams) } },
                    {
                        $sort: {
                            'skillinfo.skill.skillname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, skillcode: 1, skillname: '$skillinfo.skill.skillname', jobfunctioncode: 1, jobrolecode: 1
                        }
                    }
                ]).toArray(function (err, skilllist) {
                    dbo.collection(MongoDB.settingsCollectionName).aggregate([
                        { $unwind: { path: '$generalsettings', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 0, employee_skill_count: { $ifNull: ['$generalsettings.employee_skill_count', 0] },
                            }
                        }
                    ]).toArray(function (err, settingsresult) {
                        finalresult = {
                            "jobfunctionlist": jobfunctionresult,
                            "jobrolelist": jobroleresult,
                            "skilllist": skilllist,
                            "settingsresult": settingsresult,
                        }
                        return callback(finalresult);
                    });
                });
            });
        });
    }
    catch (e) {
        logger.error("Error in Skill Load: " + e);
    }

}

exports.getSkillInfo = function (logparams, empparams, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Getting Single Record for Skill Info on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, skills: 1 } }).toArray(function (err, empresult) {
            ////console.log("Reference");
            ////console.log(empresult);
            if (err) throw err;
            if (empresult != null) {
                finalresult = empresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Getting Skill Info: " + e);
    }

}

exports.getSkillInfo_Delete = function (logparams, empparams, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Getting Single Record of Skill for Skill Delete on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { "$match": { "employeecode": Number(empparams.employeecode) } },
            { $unwind: "$skills" },
            { "$match": { $or: [{ "skills.jobfunctioncode": { $ne: Number(empparams.jobfunctioncode) } }, { "skills.jobrolecode": { $ne: Number(empparams.jobrolecode) } }] } },
            { "$project": { _id: 0, "jobfunctioncode": "$skills.jobfunctioncode", "jobrolecode": "$skills.jobrolecode", "skillcode": "$skills.skillcode" } }
        ]).toArray(function (err, empresult) {
            ////console.log("Reference");
            ////console.log(empresult);
            if (err) throw err;
            if (empresult != null) {
                finalresult = empresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Getting Skill Info for Delete: " + e);
    }

}

exports.SkillSavefunc = function (params, employeecode, logparams, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).updateOne({ "employeecode": Number(employeecode) }, { $set: { "skills": params } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employee Skills Update: " + e); }
}

exports.getSkillsList = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Skills List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        //dbo.collection(String(MongoDB.EmployeeCollectionName)).find(empparams,{projection: { _id: 0, referenceinfo:1}}).toArray(function(err, empresult) {
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: "$skills" },
            { $match: { "employeecode": Number(empparams.employeecode) } },
            {
                $lookup: {
                    from: String(MongoDB.JobFunctionCollectionName),
                    localField: 'skills.jobfunctioncode',
                    foreignField: 'jobfunctioncode',
                    as: 'jobfunctioninfo'
                }
            },
            { $unwind: "$jobfunctioninfo" },
            { $unwind: "$jobfunctioninfo.jobfunction" },
            { $match: { "jobfunctioninfo.jobfunction.languagecode": Number(empparams.languagecode) } },
            {
                $lookup: {
                    from: String(MongoDB.JobRoleCollectionName),
                    localField: 'skills.jobrolecode',
                    foreignField: 'jobrolecode',
                    as: 'jobroleinfo'
                }
            },

            { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(empparams.languagecode) }] } },
            {
                $lookup: {
                    from: String(MongoDB.SkillCollectionName),
                    localField: 'skills.skillcode',
                    foreignField: 'skillcode',
                    as: 'skillinfo'
                }
            },
            { $unwind: { path: '$skillinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$skillinfo.skill', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "skillinfo.skill.languagecode": { $exists: false } }, { "skillinfo.skill.languagecode": "" }, { "skillinfo.skill.languagecode": Number(empparams.languagecode) }] } },
            // {
            //     $group: {
            //         "_id": {
            //             "jobfunctioncode": "$skills.jobfunctioncode", "jobfunctionname": "$jobfunctioninfo.jobfunction.jobfunctionname",
            //             "jobrolecode": "$skills.jobrolecode", "jobrolename": "$jobroleinfo.jobrole.jobrolename",
            //             "skillcode": "$skills.skillcode", "skillname": "$skillinfo.skill.skillname",
            //             "currentjobfunction": "$skills.currentjobfunction",
            //         }
            //     }
            // },
            // {
            //     "$group": {
            //         "_id": {
            //             "jobfunctioncode": "$_id.jobfunctioncode", "jobfunctionname": "$_id.jobfunctionname",
            //             "jobrolecode": "$_id.jobrolecode", "jobrolename": "$_id.jobrolename",
            //             "currentjobfunction": "$_id.currentjobfunction",
            //         },
            //         "skill": {
            //             "$addToSet": {
            //                 "skillcode": "$_id.skillcode",
            //                 "skillname": "$_id.skillname"
            //             },
            //         },
            //     }
            // },
            // {
            //     $group: {
            //         "_id": {
            //             "jobfunctioncode": "$skills.jobfunctioncode", "jobfunctionname": "$jobfunctioninfo.jobfunction.jobfunctionname",
            //             "jobrolecode": "$skills.jobrolecode", "jobrolename": "$jobroleinfo.jobrole.jobrolename",
            //             "skillcode": "$skills.skillcode", "skillname": "$skillinfo.skill.skillname",
            //             "currentjobfunction": "$skills.currentjobfunction",
            //         }
            //     }
            // },
            {
                "$group": {
                    "_id": {
                        "jobfunctioncode": "$skills.jobfunctioncode", "jobfunctionname": "$jobfunctioninfo.jobfunction.jobfunctionname",
                        "jobrolecode": "$skills.jobrolecode", "jobrolename": "$jobroleinfo.jobrole.jobrolename",
                        "currentjobfunction":  { $ifNull: ["$skills.currentjobfunction", 0] },
                    },
                    "skill": {
                        "$addToSet": {
                            "skillcode": "$skills.skillcode",
                            "skillname": "$skillinfo.skill.skillname"
                        },
                    },
                }
            },
            {
                $project: {
                    "_id": 0,
                    "jobfunctioncode": '$_id.jobfunctioncode', "jobfunctionname": '$_id.jobfunctionname',
                    "jobrolecode": '$_id.jobrolecode', "jobrolename": '$_id.jobrolename',
                    "skillname": '$skill.skillname', "skillcode": '$skill.skillcode',
                    "currentjobfunction": '$_id.currentjobfunction'
                    // '$_id.currentjobfunction',
                }
            }]).toArray(function (err, empresult) {
                ////console.log("Reference");
                //console.log(JSON.stringify(empresult, null, " "));
                if (err) throw err;
                if (empresult != null) {
                    finalresult = empresult;
                }
                return callback(finalresult);
            });
    }
    catch (e) { logger.error("Error in Employee Skill List: " + e); }

}

exports.getPortalSkillsList = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Skills List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        //dbo.collection(String(MongoDB.EmployeeCollectionName)).find(empparams,{projection: { _id: 0, referenceinfo:1}}).toArray(function(err, empresult) {
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: "$skills" },
            
            { $match: { "employeecode": Number(empparams.employeecode) } },
            {
                $lookup: {
                    from: String(MongoDB.JobFunctionCollectionName),
                    localField: 'skills.jobfunctioncode',
                    foreignField: 'jobfunctioncode',
                    as: 'jobfunctioninfo'
                }
            },
            { $unwind: "$jobfunctioninfo" },
            { $unwind: "$jobfunctioninfo.jobfunction" },
            { $match: { "jobfunctioninfo.jobfunction.languagecode": Number(empparams.languagecode) } },
            {
                $lookup: {
                    from: String(MongoDB.JobRoleCollectionName),
                    localField: 'skills.jobrolecode',
                    foreignField: 'jobrolecode',
                    as: 'jobroleinfo'
                }
            },

            { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(empparams.languagecode) }] } },
            {
                $lookup: {
                    from: String(MongoDB.SkillCollectionName),
                    localField: 'skills.skillcode',
                    foreignField: 'skillcode',
                    as: 'skillinfo'
                }
            },
            { $unwind: { path: '$skillinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$skillinfo.skill', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "skillinfo.skill.languagecode": { $exists: false } }, { "skillinfo.skill.languagecode": "" }, { "skillinfo.skill.languagecode": Number(empparams.languagecode) }] } },
            {
                "$lookup": {
                    "from": String(MongoDB.ExperienceCollectionName),
                    "localField": "experienceinfo.expid",
                    "foreignField": "experiencecode",
                    "as": "experienceinfo1"
                    // "let": { "expid": "$experienceinfo.expid", "designationname": "$experienceinfo.designationname", "jobrolename": "$jobroleinfo.jobrole.jobrolename" },
                    // "pipeline": [
                    //     {
                    //     $match: {
                    //         "$and": [{
                    //         "$expr": {
                    //             "$and": [{ $eq: ["$experiencecode", "$$expid"] },
                    //             {}]
                    //         }
                    //         }, { $eq: ["$$designationname", "$$jobrolename"] }]
                    //     }
                    //     }
                    //     //{$match:{"$and": [{ $eq: ["$packagecode", "$$packagecode"] },{"statuscode": { $exists: true } },{"statuscode":objConstants.activestatus},{"createddate":{$gte:fromdate}},{"createddate":{$lte:todate}}]}}
                    // ],
                    // "as": "experienceinfo1"
                }
            },
            // { $unwind: "$experienceinfo" },
            { $unwind: { path: '$experienceinfo1', preserveNullAndEmptyArrays: true } },
            {
                "$group": {
                    "_id": {
                        "jobfunctioncode": "$skills.jobfunctioncode", "jobfunctionname": "$jobfunctioninfo.jobfunction.jobfunctionname",
                        "jobrolecode": "$skills.jobrolecode", "jobrolename": "$jobroleinfo.jobrole.jobrolename",
                        "currentjobfunction":  { $ifNull: ["$skills.currentjobfunction", 0] }, "experienceinfo": "$experienceinfo", 
                        "expvalue": '$experienceinfo1.value'
                        //"expvalue": {"$cond": [{ "$eq": ["$experienceinfo.designationname", "$jobroleinfo.jobrole.jobrolename"] }, '$experienceinfo1.value', 0]}
                    },
                   
                    "skill": {
                        "$addToSet": {
                            "skillcode": "$skills.skillcode",
                            "skillname": "$skillinfo.skill.skillname"
                        },
                    },
                }
            },
            // {
            //     "$group": {
            //         "_id": {
            //             "jobfunctioncode": "$_id.jobfunctioncode", "jobfunctionname": "$_id.jobfunctionname",
            //             "jobrolecode": "$_id.jobrolecode", "jobrolename": "$_id.jobrolename",
            //             "currentjobfunction":  "$_id.currentjobfunction", 
            //             "expvalue": {"$cond": [{ "$eq": ["$_id.designationname", "$_id.jobrolename"] }, '$_id.expvalue', 0]}, 
            //             "skill": "$skill"
            //         },
            //         // "expvalue": { "$addToSet": {"$cond": [{ "$eq": ["$_id.designationname", "$_id.jobrolename"] }, '$_id.expvalue', 0]}},
            //     }
            // },
            {
                $sort: {
                    "$_id.jobfunctioncode": 1, '$_id.jobrolecode': 1
                }
            },
            {
                $project: {
                    "_id": 0,
                    "jobfunctioncode": '$_id.jobfunctioncode', "jobfunctionname": '$_id.jobfunctionname',
                    "jobrolecode": '$_id.jobrolecode', "jobrolename": '$_id.jobrolename',
                    "skillname": '$skill.skillname', "skillcode": '$skill.skillcode',
                    "currentjobfunction": '$_id.currentjobfunction',  "experienceinfo": "$_id.experienceinfo"
                    // '$_id.currentjobfunction',
                }
            }]).toArray(function (err, empresult) {
                ////console.log("Reference");
                //console.log(JSON.stringify(empresult, null, " "));
                if (err) throw err;
                if (empresult != null) {
                    finalresult = empresult;
                }
                return callback(finalresult);
            });
    }
    catch (e) { logger.error("Error in Employee Skill List: " + e); }

}


exports.duplicateCheck = function (SkillArrayObj, params, isleadtype,callback) {
    try {
        // logger.info("Log in checking state name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);     
        skillduplicateCheck(SkillArrayObj, params, isleadtype,function (err, tempskilllist) {
            if (err) {
                return;
            }
            return callback(tempskilllist);
        });
    }
    catch (e) { logger.error("Error in checking skill code - skills" + e); }
}

var async = require('async');
function skillduplicateCheck(SkillArrayObj, params, isleadtype,callback) {
    try {
        // //console.log(SkillArrayObj);
        var tempskilllist = [];
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (SkillObj, done) {
            // //console.log(SkillObj);
            // //console.log(params);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).find({ $and: [{ employeecode: params.employeecode }, { skills: { $elemMatch: { skillcode: SkillObj, jobrolecode: params.jobrolecode, jobfunctioncode: params.jobfunctioncode } } }] }).count(function (err, res) {
                if (err) {
                    ////console.log(err);
                    done(err);
                    return;
                }
                // //console.log(res);
                if (res == 0) {
                    var skilladd = {
                        "jobfunctioncode": params.jobfunctioncode,
                        "jobrolecode": params.jobrolecode,
                        "skillcode": SkillObj
                    }
                    tempskilllist.push(skilladd);
                    // //console.log(skilladd);
                    totalcount = tempskilllist.length;
                }
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            ////console.log(totalcount);
            callback(err, tempskilllist);
        };
        async.forEach(SkillArrayObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking Duplicate - Skills" + e); }
}

exports.SkillEditLoad = function (logparams, params, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Skills Edit Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        //dbo.collection(String(MongoDB.EmployeeCollectionName)).find(empparams,{projection: { _id: 0, referenceinfo:1}}).toArray(function(err, empresult) {
        ////console.log("Entry");
        ////console.log(params);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: "$skills" },
            { $match: { "employeecode": Number(params.employeecode), "skills.jobfunctioncode": Number(params.jobfunctioncode), "skills.jobrolecode": Number(params.jobrolecode) } },
            {
                "$group": {
                    "_id": {
                        "jobfunctioncode": "$skills.jobfunctioncode",
                        "jobrolecode": "$skills.jobrolecode",
                        "skillcode": "$skills.skillcode",
                        "currentjobfunction": "$skills.currentjobfunction",
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "jobfunctioncode": "$_id.jobfunctioncode",
                        "jobrolecode": "$_id.jobrolecode",
                        "currentjobfunction": "$_id.currentjobfunction",
                    },
                    "skill": {
                        "$push": {
                            "skillcode": "$_id.skillcode"

                        },
                    },
                }
            },

            {
                $project: {
                    "_id": 0,
                    "jobfunctioncode": '$_id.jobfunctioncode',
                    "jobrolecode": '$_id.jobrolecode',
                    "currentjobfunction": '$_id.currentjobfunction',
                    "skillcode": '$skill.skillcode'
                }
            }]).toArray(function (err, empresult) {
                ////console.log("Reference");
                ////console.log(empresult);
                if (err) throw err;
                if (empresult != null) {
                    finalresult = empresult;
                }
                ////console.log(finalresult);
                return callback(finalresult);
            });
    }
    catch (e) { logger.error("Error in Employee Skill Edit Load: " + e); }

}

