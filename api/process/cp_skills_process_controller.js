'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.SkillCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dbjobfunctioncollectionname = MongoDB.JobFunctionCollectionName;
var dbjobrolecollectionname = MongoDB.JobRoleCollectionName;
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['skillcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].skillcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - skill " + e); }
}
exports.checkSkillNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking skill name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        
        checkSkillName(req.body.skill, function (err, skillcount) {
            if (err) {
                return;
            }
            return callback(skillcount);
        });
    }
    catch (e) { logger.error("Error in checking skill name - skill" + e); }
}
exports.checkSkillCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking skill code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "skillcode": parseInt(req.query.skillcode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking skill code - skill" + e); }
}
exports.checkSkillNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking skill name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({skill: req.body.skill[0].skillname,skillcode:{$ne:req.query.skillcode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkSkillNameByCode(req.body.skill, req.query.skillcode, function (err, skillcount) {
            if (err) {
                return;
            }
            return callback(skillcount);
        });
    }
    catch (e) { logger.error("Error in checking Skill name by code - Skill" + e); }
}
var async = require('async');
function checkSkillName(SkillListObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (SkillObj, done) {
            if (!SkillObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + SkillObj.skillname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ skill: { $elemMatch: { languagecode: SkillObj.languagecode, skillname: { $regex: "^" + SkillObj.skillname + "$", $options: 'i' } } } }).count(function (err, res) {
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
        async.forEach(SkillListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking Skill name - Skill" + e); }
}
function checkSkillNameByCode(SkillListObj, skillcodeObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (SkillObj, done) {
            if (!SkillObj.languagecode) {
                done();
                return;
            }
            // var regex = new RegExp("^" + SkillObj.skillname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ skill: { $elemMatch: { languagecode: SkillObj.languagecode, skillname: { $regex: "^" + SkillObj.skillname + "$", $options: 'i' } } }, skillcode: { $ne: parseInt(skillcodeObj) } }).count(function (err, res) {
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
        async.forEach(SkillListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking Skill name by code - Skill" + e); }
}
exports.InsertSkillDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in skill create by skill Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - skill" + e); }
}
exports.updateSkillDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in skill update by skill Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "skillcode": parseInt(params.skillcode) },{ $set: params}, function (err, res) {
                if (err) throw err;
                finalresult = res.lastErrorObject.updatedExisting;
                ////console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - skill" + e); }
}
exports.checkSkillCodeExistsInMapping = function (logparams, params, callback) {
    try {
        logger.info("Log in checking skill code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.SkillsMappingCollectionName).find({ "skillcode": parseInt(params.skillcode) }, { $exists: true }).count(function (err, skillscount) //find if a value exists
        {
            // //console.log(doc.length);
            return callback(skillscount);
        });
    }
    catch (e) { logger.error("Error in checking skill code in employee - skills" + e); }
}
exports.checkSkillCodeExistsInEmployee = function (logparams, params, callback) {
    try {
        logger.info("Log in checking skill code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "skills.skillcode": parseInt(params.skillcode) }, { $exists: true }).count(function (err, skillscount) //find if a value exists
        {
            // //console.log(doc.length);
            return callback(skillscount);
        });
    }
    catch (e) { logger.error("Error in checking skill code in employee - skills" + e); }
}
exports.checkSkillCodeExistsInJobpost = function (logparams, params, callback) {
    try {
        logger.info("Log in checking skill code in jobpost : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.JobPostsCollectionName).find({ "skills.skillcode": parseInt(params.skillcode) }, { $exists: true }).count(function (err, skillscount) //find if a value exists
        {
            return callback(skillscount);
        });
    }
    catch (e) { logger.error("Error in checking skill code in jobpost - skills" + e); }
}
exports.checkJobfunctionCodeExistsInSkill = function (logparams, params, callback) {
    try {
        logger.info("Log in checking jobfunction code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.SkillCollectionName).find({ "skillcode": parseInt(params.skillcode) }, { projection: { _id: 0, jobfunctioncode: 1 } }).toArray(function (err, result) //find if a value exists
        {
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) { logger.error("Error in checking jobfunction code in skill" + e); }
}
exports.checkJobroleCodeExistsInSkill = function (logparams, params, callback) {
    try {
        logger.info("Log in checking jobfunction code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.SkillCollectionName).find({ "skillcode": parseInt(params.skillcode) }, { projection: { _id: 0, jobrolecode: 1 } }).toArray(function (err, result) //find if a value exists
        {
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) { logger.error("Error in checking jobrole code in skill" + e); }
}
exports.deleteSkillDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in skill Delete by skill Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "skillcode": parseInt(params.skillcode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - skill" + e); }
}
exports.getSkillSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in Skill List by skill Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "skillcode": parseInt(params.query.skillcode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - skill" + e); }
}
exports.getSkillSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in skill List by skill Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        ////console.log(params);
        dbo.collection(String(dbcollectionname)).find({ "skillcode": parseInt(params.skillcode) }, { projection: { _id: 0, skillcode: 1, skill: 1, statuscode: 1 } }).toArray(function (err, result) {
            finalresult = result;
            ////console.log("result",finalresult);
            return callback(finalresult);
        });

    }
    catch (e) { logger.error("Error in single record details for edit - skill" + e); }
}
exports.getSkillFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            finalresult.push(languageresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in form List - skill " + e); }
}
exports.getSkillList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in skill List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // if (parseInt(params.statuscode) == 0) { var condition = { 'skill.languagecode': defaultlanguagecode, "statuscode": { $ne: objConstants.deletestatus } }; }
        // else { var condition = { 'skill.languagecode': defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstants.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"skill.languagecode": parseInt(params.languagecode) };
        }
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selected_language_count: {
                        $size: "$skill"
                    },
                    language_count_status: { $toInt: { $eq: [{ $size: "$skill" }, langcount] } },
                }
            },
            { $unwind: '$skill' },
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
                    _id: 0, skillcode: 1, skillname: "$skill.skillname", languagecode: '$skill.languagecode',
                    statuscode: 1, statusname: "$status.statusname",
                    language_count_status: 1, selected_language_count: 1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - skill" + e); }
}