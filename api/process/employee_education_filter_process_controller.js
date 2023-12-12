'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const objProfile = require('../process/employee_education_process_controller')
const { param } = require('../controller');

exports.getEducationFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Education Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };
        
        dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
			{ $unwind: '$educationcategory'},
            { $match: { "statuscode": parseInt(objConstants.activestatus), "educationcategory.languagecode": parseInt(params.languagecode) } },
            {
                $sort: {
                    ordervalue: 1
                }
            },
            {
                $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1 , ordervalue:1}
            }
        ]).toArray(function(err, educatresult) {
            objProfile.getSchoolingLoad(logparams, function (qualificationresult) {
                objProfile.getAfterSchoolingLoad(logparams, params.languagecode,function (specresult) {
                    finalresult ={
                        educationcategorylist: educatresult,
                        schoolinglist: qualificationresult,
                        afterschoolinglist: specresult
                    }
                    ////console.log("school");
                    ////console.log(finalresult);
                    return callback(finalresult);
                });
            });

           
        });
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Education Bind: " + e); }
  
  
}

exports.getProfileEducationFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        console.log(params.languagecode);
        console.log(Number(params.languagecode));
        logger.info("Log in Filter - Profile Education Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
			{ $unwind: '$educationcategory'},
            { $match: { "statuscode": parseInt(objConstants.activestatus), "educationcategory.languagecode":Number(params.languagecode) } },
            {
                $sort: {
                    ordervalue: 1
                }
            },
            {
                $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1 , ordervalue:1}
            }
        ]).toArray(function(err, educatresult) {
            dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                {$match:{ "employeecode": Number(params.employeecode), "statuscode":objConstants.activestatus }}, 
                {$unwind:"$schooling"},
                { "$lookup": {
                     "from":  String(MongoDB.QualificationCollectionName),
                     "localField": "schooling.qualificationcode",
                     "foreignField": "qualificationcode",
                     "as": "qualificationinfo"
                }},
                {$unwind:"$qualificationinfo"},
                { "$project": {
                   _id: 0,
                   educationcategorycode: '$qualificationinfo.educationcategorycode', qualificationcode: '$schooling.qualificationcode', qualificationname: '$qualificationinfo.qualificationname'}}
                ]).toArray(function(err, schoolresult){
                    dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                        {$match:{ "employeecode": Number(params.employeecode), "statuscode":objConstants.activestatus }}, 
                        {$unwind:"$afterschooling"},
                        { "$lookup": {
                             "from":  String(MongoDB.QualificationCollectionName),
                             "localField": "afterschooling.qualificationcode",
                             "foreignField": "qualificationcode",
                             "as": "qualificationinfo"
                        }},
                        {$unwind:"$qualificationinfo"},
                        
                        { "$project": {
                           _id: 0,
                           educationcategorycode: '$qualificationinfo.educationcategorycode',  qualificationcode: '$afterschooling.qualificationcode', qualificationname: '$qualificationinfo.qualificationname'}}
                ]).toArray(function(err, afterschoolqualresult) {
                    dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                        {$match:{ "employeecode": Number(params.employeecode), "statuscode":objConstants.activestatus }},
                        {$unwind:"$afterschooling"},
                        { "$lookup": {
                             "from": String(MongoDB.SpecializationCollectionName),
                             "localField": "afterschooling.specializationcode",
                             "foreignField": "specializationcode",
                             "as": "specializationinfo"
                        }},
                        {$unwind:"$specializationinfo"},
                        {$unwind:"$specializationinfo.specialization"},
                        //{$match:{"specializationinfo.specialization.languagecode":Number(params.languagecode)} },
                        { $match: {$and:[{"specializationinfo.statuscode": objConstants.activestatus},
            {$or:[{"specializationinfo.specialization.languagecode": Number(params.languagecode) }]}]}},
                { "$project": {
                           _id: 0, qualificationcode: '$afterschooling.qualificationcode',
                             specializationcode: '$afterschooling.specializationcode',languagecode:'$specializationinfo.specialization.languagecode', specializationname: '$specializationinfo.specialization.specializationname'}}
                ]).toArray(function(err, afterschoolspecresult) {

                    finalresult ={
                        educationcategorylist: educatresult,
                        schoolinglist: schoolresult,
                        afterschoolinglist: {
                            qualificationlist: afterschoolqualresult,
                            specializationlist: afterschoolspecresult
                        }
                    }
                    ////console.log("school");
                    ////console.log(finalresult);
                    return callback(finalresult);
                });

                    
                });
            });           
        });
    }
    catch (e) { logger.error("Error in Filter - Profile Education Bind: " + e); }
}

exports.getJobpostEducationFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Education Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            {$match:{ "jobcode": Number(params.jobcode)}},
           
            { "$project": {
                _id: 0, schooling: 1, afterschooling: 1
                }}
        ]).toArray(function(err, jobresult) {
            finalresult =jobresult
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);

        });
    }
    catch (e) { logger.error("Error in Filter - Profile Education Bind: " + e); }
}