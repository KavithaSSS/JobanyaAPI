'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.SkillsMappingCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dbjobfunctioncollectionname = MongoDB.JobFunctionCollectionName;
var dbjobrolecollectionname = MongoDB.JobRoleCollectionName;

exports.InsertSkillDetails = function (logparams, req, callback) {
    try {
        logger.info("Log in InsertSkillDetails: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            var makerid = String(logres["ops"][0]["_id"]);
            ////console.log(req.body);            
            dbo.collection(String(dbcollectionname)).insertMany(req.body.skilllist, function (err, res) {
                if (err) throw err;
                finalresult = res.insertedCount;
                if(finalresult!=null && finalresult>0){
                    var matchparams = { "jobfunctioncode":Number(req.body.jobfunctioncode),"jobrolecode":Number(req.body.jobrolecode)};
                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                        dbo.collection(String(dbcollectionname)).updateMany(matchparams, { $set: {"statuscode": objConstants.activestatus,"makerid": makerid,"createddate":currenttime,"updatedDate":currenttime} }, function (err, res) {
                            if (err) throw err;
                            ////console.log(finalresult);
                            return callback(finalresult);
                        });
                    });                    
                }
            });
        });
    }
    catch (e) { logger.error("Error in InsertSkillDetails" + e); }
}
exports.updateSkillDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in updateSkillDetails: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in updateSkillDetails" + e); }
}
exports.checkSkillCodeExistsInEmployee = function (logparams, req, params, callback) {
    try {
        logger.info("Log in checking skill code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([   
            { $unwind: '$skills' },
            { $match: {$and :[{ "skills.jobfunctioncode": Number(req.body.jobfunctioncode)},{ "skills.jobrolecode": Number(req.body.jobrolecode) },{ "skills.skillcode": {$in:params} }]} },
            {$project:{"_id":0,"skillcode":"$skills.skillcode"}}
        ]).toArray(function (err, empskillslist)
            //find({ "skills.skillcode": {$in:params} }).toArray(function (err, empskillslist) //find if a value exists
        {
            //console.log("empskillslist",empskillslist);  
            return callback(empskillslist);
        });
    }
    catch (e) { logger.error("Error in checking skill code in employee - skills" + e); }
}
exports.checkSkillCodeExistsInJobpost = function (logparams,req, params, callback) {
    try {
        logger.info("Log in checking skill code in jobpost : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([   
            { $unwind: '$skills' },
            { $match: {$and :[{ "jobfunctioncode": Number(req.body.jobfunctioncode)},{ "jobrolecode": Number(req.body.jobrolecode) },{ "skills.skillcode": {$in:params} }]} },
            {$project:{"_id":0,"skillcode":"$skills.skillcode"}}
        ]).toArray(function (err, jobskillslist)
        //dbo.collection(MongoDB.JobPostsCollectionName).find({ "skills.skillcode": {$in:params} }).toArray(function (err, jobskillslist) //find if a value exists
        {
            //console.log("jobskillslist",jobskillslist);  
            return callback(jobskillslist);
        });
    }
    catch (e) { logger.error("Error in checking skill code in jobpost - skills" + e); }
}
exports.deleteUnUsedSkillDetails = function (logparams,req, params, callback) {
    try {
        logger.info("Log in skill Delete by skill Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        ////console.log("params",params);
        if(params.length>0){var  condition = { "skillcode": {$nin:params},"jobfunctioncode":req.body.jobfunctioncode,"jobrolecode":req.body.jobrolecode};}
        else{var condition={"jobfunctioncode":req.body.jobfunctioncode,"jobrolecode":req.body.jobrolecode};}
        dbo.collection(String(dbcollectionname)).deleteMany(condition, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            //console.log("finalresult",finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - skill" + e); }
}
exports.getSkillFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        dbo.collection(String(MongoDB.SkillCollectionName)).aggregate([
            { $unwind: '$skill' },
            { $match: { 'skill.languagecode': defaultlanguagecode, statuscode: parseInt(objConstants.activestatus) } },
            {
                $sort: {
                    'skill.skillname': 1
                }
            },
            {
                $project: {
                    _id: 0, skillcode : 1, skillname: '$skill.skillname'
                }
            }
        ]).toArray(function (err, skillresult) {
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
            ]).toArray(function (err, resultfunction) {
                dbo.collection(String(dbjobrolecollectionname)).aggregate([
                    { $unwind: '$jobrole' },
                    { $match: { 'jobrole.languagecode': defaultlanguagecode, statuscode: parseInt(objConstants.activestatus) } },
                    {
                        $sort: {
                            'jobrole.jobrolename': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, jobrolecode: 1, jobfunctioncode: 1, jobrolename: '$jobrole.jobrolename'
                        }
                    }
                ]).toArray(function (err, result) {
                    finalresult.push(skillresult);
                    finalresult.push(resultfunction);
                    finalresult.push(result);
                    return callback(finalresult);
                });
            });
        });
    }
    catch (e) { logger.error("Error in form List - skill " + e); }
}
exports.getSkillList = function (logparams, params, callback) {
    try {
        logger.info("Log in skill List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        if (parseInt(params.statuscode) == 0) { var condition = { "statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { statuscode: parseInt(params.statuscode) }; }

        dbo.collection(String(dbcollectionname)).aggregate([            
            { $match: condition },
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
			{$match:{"skillinfo.skill.languagecode":objConstants.defaultlanguagecode}},
            {
                $lookup: {
                    from: String(dbjobfunctioncollectionname),
                    localField: 'jobfunctioncode',
                    foreignField: 'jobfunctioncode',
                    as: 'jobfunctioninfo'
                }
            },
            { $unwind: { path: '$jobfunctioninfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$jobfunctioninfo.jobfunction', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "jobfunctioninfo.jobfunction.languagecode": { $exists: false } }, 
            { "jobfunctioninfo.jobfunction.languagecode": "" }, { "jobfunctioninfo.jobfunction.languagecode": objConstants.defaultlanguagecode }] } },
			{
                $lookup: {
                    from: String(dbjobrolecollectionname),
                    localField: 'jobrolecode',
                    foreignField: 'jobrolecode',
                    as: 'jobroleinfo'
                }
            },
            { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, 
            { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": objConstants.defaultlanguagecode }] } },			
			
			{$group: {"_id": {"jobrolecode": { $ifNull: ['$jobroleinfo.jobrolecode', 0] },
            "jobrolename": { $ifNull: ['$jobroleinfo.jobrole.jobrolename', ''] }, 
            "jobfunctioncode": "$jobfunctioninfo.jobfunctioncode", 
            "jobfunctionname": "$jobfunctioninfo.jobfunction.jobfunctionname"},  
            "skilllist": {"$push": {"skillcode": '$skillcode',
			"skillname": "$skillinfo.skill.skillname"}}}},
			{ "$project": {
			   _id: 0,jobrolecode: "$_id.jobrolecode",
                    jobrolename: "$_id.jobrolename", jobfunctioncode: "$_id.jobfunctioncode", jobfunctionname: "$_id.jobfunctionname",
				 skilllist: '$skilllist'}}
			
			]).toArray(function (err, result) {
            finalresult = result;
            ////console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - skill" + e); }
}
exports.GetSkillMappingdetails = function (logparams, req, callback) {
    try {
        logger.info("Log in GetSkillMappingdetails: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult=[];
        var params = { "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode };
        dbo.collection(MongoDB.SkillsMappingCollectionName).aggregate(
            [
                { $match: params },
                {
                    $group:
                    {
                        _id: 0,
                        skillcode: { $addToSet: "$skillcode" },
                    }
                },
                {
                    $project: { _id: 0, skillcode: '$skillcode' }
                }
            ]).toArray(function (err, result) {
                // //console.log(result);
                if (err) throw err;
                if (result != null && result.length > 0) {
                    var skillcodelist = result[0].skillcode;
                    finalresult.skillcodelist = skillcodelist;
                    dbo.collection(MongoDB.SkillCollectionName).aggregate(
                    [
                        { $unwind: '$skill' },
                        { $match: {$and:[{"skillcode":{$in:skillcodelist}},{"skill.languagecode":objConstants.defaultlanguagecode}]} },
                        {
                            $project: {
                                _id: 0, skillcode: 1, skillname: "$skill.skillname"
                            }
                        }
                    ]).toArray(function (err, result) {
                         ////console.log("Finalresult", finalresult)
                        finalresult.skilllist = result;
                        ////console.log("Finalresult", finalresult)
                        return callback(finalresult);
                    });
                }
                else{
                    ////console.log("Finalresult", finalresult)
                    return callback(finalresult);
                }
                
            });
    }
    catch (e) { logger.error("Error in GetSkillMappingdetails : " + e); }
}
exports.checkMappingExists = function (logparams, req, callback) {
    try {
        ////console.log("checkMappingExists",req);
        logger.info("Log in checkMappingExists : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "jobfunctioncode": parseInt(req.body.jobfunctioncode) ,"jobrolecode": parseInt(req.body.jobrolecode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checkMappingExists - skill " + e); }
}

