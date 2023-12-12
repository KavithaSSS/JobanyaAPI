'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getEmployerProfileConditions = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Getting Employer Profile Conditions on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        //{$and:[{"employercode":1}, {"statuscode":1}, {'expirydate': {$gte: ISODate().getTime() }}]}
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { "$match": { $and: [{ "employercode": Number(params.employercode) }, { "statuscode": objConstants.activestatus }] } },
            { $unwind: { path: '$preferences', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$preferences.location', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$preferences.jobfunction', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$preferences.jobrole', preserveNullAndEmptyArrays: true } },
            {
                "$group":
                {
                    "_id": { employercode: "$employercode" },
                    "isanystate": { $addToSet: "$preferences.isanystate" },
                    "isanydistrict": { $addToSet: "$preferences.isanydistrict" },
                    "isanytaluk": { $addToSet: "$preferences.isanytaluk" },
                    "locationcode": { $addToSet: "$preferences.location.locationcode" }, "jobfunctioncode": { $addToSet: "$preferences.jobfunction.jobfunctioncode" },
                    "jobrolecode": { $addToSet: "$preferences.jobrole.jobrolecode" }
                }
            },
            {
                "$project":
                {
                    "_id": 0, employercode: "$_id.employercode", "jobfunctioncode": '$jobfunctioncode', "locationcode": '$locationcode', "jobrolecode": '$jobrolecode',
                    "isanystate": '$isanystate',
                    "isanydistrict": '$isanydistrict',
                    "isanytaluk": '$isanytaluk'
                }
            }
        ]).toArray(function (err, proflist) {
            ////console.log("Pro", proflist);
            if (proflist != null && proflist.length > 0) {
                finalresult = proflist;
                return callback(finalresult);
            }
            else
                return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Getting Employer Profile Conditions: " + e); }

}

exports.getJobProfileConditions = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        ////console.log(params);
        logger.info("Log in Getting Job Profile Conditions on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        //{$and:[{"employercode":1}, {"statuscode":1}, {'expirydate': {$gte: ISODate().getTime() }}]}
        var jobcodeConditions = {};
        if (Number(params.jobcode) == 0 && (params.activejobcode && params.activejobcode.length > 0)) {
            jobcodeConditions = { $match: { "jobcode": { $in: params.activejobcode } } }
        } else {
            jobcodeConditions = { $match: { "jobcode": Number(params.jobcode) } }
        }
        dbo.collection(String(MongoDB.JobPostsCollectionName)).aggregate([
            { $unwind: '$skills' },
            { $unwind: { path: '$schooling', preserveNullAndEmptyArrays: true } },
            { $unwind: '$afterschooling' },
            { $unwind: { path: '$afterschooling.categorylist', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$afterschooling.qualificationlist', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$afterschooling.afterschoolinglist', preserveNullAndEmptyArrays: true } },
            { $unwind: '$maritalstatus' },
            { $unwind: { path: '$maritalstatus.maritallist', preserveNullAndEmptyArrays: true } },
            { $unwind: '$gender' },
            { $unwind: { path: '$gender.genderlist', preserveNullAndEmptyArrays: true } },
            { $unwind: '$salaryrange' },
            { $unwind: '$agecriteria' },
            { $unwind: '$experience' },
            { $unwind: '$preferredlocation' },
            { $unwind: '$jobtypes' },
            { $unwind: '$preferredjoblocation' },
            { $unwind: { path: '$preferredlocation.locationlist', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$preferredlocation.taluklist', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$preferredjoblocation.locationlist', preserveNullAndEmptyArrays: true } },
            jobcodeConditions,
            {
                $group: {
                    _id: {
                        "jobcode": '$jobcode', "differentlyabled": '$differentlyabled', "salaryfrom": '$salaryrange.min', "salaryto": '$salaryrange.max', "anyage": '$agecriteria.isany',
                        "agefrom": '$agecriteria.from', "ageto": '$agecriteria.to', "isfresher": '$experience.isfresher', "experiencefrom": '$experience.from', "experienceto": '$experience.to', "locationany": '$preferredlocation.isany',"anytaluk": '$preferredlocation.isanytaluk', 
                        "anydegree": '$afterschooling.isanydegree',"anyqualification": '$afterschooling.isany',"anyspec": '$afterschooling.isanyspec',"languagesknown": '$languagesknown'
                    },
                    "jobfunctioncode": { $addToSet: '$jobfunctioncode' }, "skillcode": { $addToSet: '$skills.skillcode' }, "locationcode": { $addToSet: '$preferredlocation.locationlist.locationcode' },"talukcode": { $addToSet: '$preferredlocation.taluklist.talukcode' },
                    "jobrolecode": { $addToSet: '$jobrolecode' }, "jobtypecode": { $addToSet: '$jobtypes.jobtypecode' }, "schoolqualcode": { $addToSet: '$schooling.qualificationcode' },
                    "afterschoolcatecode": { $addToSet: '$afterschooling.categorylist.educationcategorycode' }, "afterschoolqualcode": { $addToSet: '$afterschooling.qualificationlist.qualificationcode' }, "afterschoolspeccode": { $addToSet: '$afterschooling.afterschoolinglist.specializationcode' },
                    "maritalcode": { $addToSet: '$maritalstatus.maritallist.maritalcode' }, "gendercode": { $addToSet: '$gender.genderlist.gendercode' },"joblocationcode": { $addToSet: '$preferredjoblocation.locationlist.locationcode' }
                }
            },
            {
                "$project": {
                    _id: 0,
                    "jobcode": '$_id.jobcode', jobfunctioncode: '$jobfunctioncode', skillcode: '$skillcode', jobrolecode: '$jobrolecode', jobtypecode: '$jobtypecode', schoolqualcode: '$schoolqualcode',
                    afterschoolcatecode: '$afterschoolcatecode', afterschoolqualcode: '$afterschoolqualcode', afterschoolspeccode: '$afterschoolspeccode', maritalcode: '$maritalcode', gendercode: '$gendercode', differentlyabled: '$_id.differentlyabled',
                    salaryfrom: '$_id.salaryfrom', salaryto: '$_id.salaryto', anyage: '$_id.anyage', agefrom: '$_id.agefrom', ageto: '$_id.ageto', isfresher: '$_id.isfresher', expfrom: '$_id.experiencefrom', expto: '$_id.experienceto',
                    locationany: '$_id.locationany', locationcode: '$locationcode',anytaluk: '$_id.anytaluk',talukcode: '$talukcode', joblocationcode: '$joblocationcode',anydegree: '$_id.anydegree',anyqualification: '$_id.anyqualification',anyspec: '$_id.anyspec',languagesknown: '$_id.languagesknown',
                }
            }
        ]).toArray(function (err, proflist) {
            ////console.log("p", proflist);
            if (proflist != null && proflist.length > 0) {
                finalresult = proflist;
                var experiencecode = [];
                ////console.log("A", finalresult[0].isfresher);
                if (finalresult[0].isfresher == "true") {
                    experiencecode.push(0);
                }
                experiencecode.push(finalresult[0].expfrom);
                experiencecode.push(finalresult[0].expto);
                ////console.log("A", experiencecode);
                finalresult[0].experiencecode = experiencecode;
                return callback(finalresult);
            }
            else
                return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Getting Job Profile Conditions: " + e); }

}