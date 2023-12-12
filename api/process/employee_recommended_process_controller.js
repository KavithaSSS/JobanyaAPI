'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getAllProfileConditions = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Profile Conditions Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        ////console.log(listparams);
        ////console.log(listparams.industrycode);
        //var exp = Number(listparams.experiencecode);
        //Skill
        var industrycode = [];
        var companytypecode = [];
        var employertypecode = [];
        var skillcode = [];
        var schoolqualcode = [];
        var afterschoolqualcode = [];
        var afterschoolspeccode = [];
        var afterschoolcatecode = [];
        var maritalcode = [];
        var gendercode = [];
        var jobtypecode = [];
        var locationcode = [];
        var totexp = [];
        var jobfunctioncodelist = [];
        var jobrolecodelist = [], isanystate = 'false', isanydistrict = 'false', isanytaluk = 'false';
        var salaryfrom = 0, salaryto = 0, differentlyabled = 0, age = 0;
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
            { $unwind: "$skills" },
            //{$group: {"_id": {"jobfunctioncode":'$skills.jobfunctioncode', "jobrolecode": '$skills.jobrolecode'}, "skill": {"$push": {"skillcode":  '$skills.skillcode'}}}},
            { $group: { "_id": {}, "skill": { "$push": { "skillcode": '$skills.skillcode' } } } },
            {
                "$project": {
                    _id: 0,
                    skillcode: '$skill.skillcode'
                }
            }
        ]).toArray(function (err, skillresult) {
            ////console.log("Skill");
            if (skillresult != null && skillresult.length > 0)
                skillcode = skillresult[0].skillcode;
            dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
                { $unwind: "$preferences" },
                { $unwind: "$preferences.location" },
                { $group: { "_id": { "employeecode": '$employeecode', "minsalary": '$preferences.minsalary', "maxsalary": '$preferences.maxsalary', "isanystate": '$preferences.isanystate', "isanydistrict": '$preferences.isanydistrict', "isanytaluk": '$preferences.isanytaluk' }, "location": { "$push": { "locationcode": '$preferences.location.locationcode' } } } },
                {
                    "$project": {
                        _id: 0, salaryfrom: '$_id.minsalary', salaryto: '$_id.maxsalary',
                        locationcode: '$location.locationcode',
                        isanystate: '$_id.isanystate',
                        isanydistrict: '$_id.isanydistrict',
                        isanytaluk: '$_id.isanytaluk'
                    }
                }
            ]).toArray(function (err, locationresult) {
                // //console.log("Location");
                if (locationresult != null && locationresult.length > 0) {
                    locationcode = locationresult[0].locationcode;
                    salaryto = locationresult[0].salaryto;
                    salaryfrom = locationresult[0].salaryfrom;
                    isanystate = isanystate;
                    isanydistrict = isanydistrict;
                    isanytaluk = isanytaluk;
                }

                dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
                    { $unwind: "$schooling" },
                    { $group: { "_id": { "employeecode": '$employeecode' }, "qualification": { "$push": { "qualificationcode": '$schooling.qualificationcode' } } } },
                    {
                        "$project": {
                            _id: 0,
                            qualificationcode: '$qualification.qualificationcode'
                        }
                    }
                ]).toArray(function (err, schoolresult) {
                    ////console.log("School");
                    if (schoolresult != null && schoolresult.length > 0)
                        schoolqualcode = schoolresult[0].qualificationcode;
                    dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                        { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
                        { $unwind: "$afterschooling" },
                        { $group: { "_id": { "employeecode": '$employeecode' }, "qualification": { "$push": { "educationcategorycode": '$afterschooling.educationcategorycode', "qualificationcode": '$afterschooling.qualificationcode', "specializationcode": '$afterschooling.specializationcode' } } } },
                        {
                            "$project": {
                                _id: 0, educationcategorycode: '$qualification.educationcategorycode',
                                qualificationcode: '$qualification.qualificationcode', specializationcode: '$qualification.specializationcode'
                            }
                        }
                    ]).toArray(function (err, afterschoolresult) {
                        //console.log(afterschoolresult);
                        if (afterschoolresult != null && afterschoolresult.length > 0) {
                            afterschoolqualcode = afterschoolresult[0].qualificationcode;
                            afterschoolspeccode = afterschoolresult[0].specializationcode;
                            afterschoolcatecode = afterschoolresult[0].educationcategorycode;
                        }

                        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                            { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
                            { $unwind: "$personalinfo" },
                            {
                                "$project": {
                                    _id: 0,
                                    totalexperience: 1, maritalstatus: '$personalinfo.maritalstatus', gender: '$personalinfo.gender',
                                    differentlyabled: '$personalinfo.differentlyabled', empage: {
                                        $divide: [{ $subtract: [milliseconds, "$personalinfo.dateofbirth"] },
                                        (365 * 24 * 60 * 60 * 1000)]
                                    }
                                }
                            }
                        ]).toArray(function (err, experienceresult) {
                            // //console.log("exp");
                            if (experienceresult != null && experienceresult.length > 0) {
                                ////console.log(experienceresult[0].empage);
                                if (experienceresult[0].maritalstatus != null)
                                    maritalcode.push(experienceresult[0].maritalstatus);
                                if (experienceresult[0].gender != null)
                                    gendercode.push(experienceresult[0].gender);
                                if (experienceresult[0].totalexperience != null)
                                    totexp.push(experienceresult[0].totalexperience);
                                if (experienceresult[0].empage != null)
                                    age = parseInt(experienceresult[0].empage);
                                if (experienceresult[0].differentlyabled != null)
                                    differentlyabled = experienceresult[0].differentlyabled;
                            }
                            dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
                                { $unwind: "$preferences" },
                                { $unwind: "$preferences.employementtype" },
                                { $group: { "_id": { "employeecode": '$employeecode' }, "jobtype": { "$push": { "jobtypecode": '$preferences.employementtype.employementtypecode' } } } },
                                {
                                    "$project": {
                                        _id: 0,
                                        jobtypecode: '$jobtype.jobtypecode'
                                    }
                                }
                            ]).toArray(function (err, jobtyperesult) {
                                // //console.log("jobtype");
                                // //console.log(jobtyperesult);
                                if (jobtyperesult != null && jobtyperesult.length > 0 && jobtyperesult[0].jobtypecode != null)
                                    jobtypecode = jobtyperesult[0].jobtypecode;
                                dbo.collection(MongoDB.EmployeeCollectionName).find({ "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus }, { _id: 0, skills: 1 }).toArray(function (err, empresult) {
                                    // if (empresult[0].skills != null && empresult[0].skills.length > 0) {
                                    dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                                        { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
                                        { $unwind: "$skills" },
                                        {
                                            $group: {
                                                "_id": { "employeecode": '$employeecode' }, "jobfunctioncode": { $addToSet: '$skills.jobfunctioncode' },
                                                "jobrolecode": { $addToSet: '$skills.jobrolecode' }
                                            }
                                        },
                                        {
                                            "$project": {
                                                _id: 0,
                                                jobfunctioncode: '$jobfunctioncode', jobrolecode: '$jobrolecode'
                                            }
                                        }
                                    ]).toArray(function (err, jobfunctionresult) {
                                        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                                            { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
                                            { $unwind: "$preferences" },
                                            //{ $unwind: "$preferences.jobfunction" },
                                            // {
                                            //     $group: {
                                            //         "_id": { "employeecode": '$employeecode' }, "jobfunctioncode": { $addToSet: '$preferences.jobfunction.jobfunctioncode' },
                                            //         "jobrolecode": { $addToSet: '$preferences.jobrole.jobrolecode' }
                                            //     }
                                            // },
                                            {
                                                "$project": {
                                                    _id: 0,
                                                    jobfunctioncode: '$preferences.jobfunction.jobfunctioncode', jobrolecode: '$preferences.jobrole.jobrolecode'
                                                }
                                            }
                                        ]).toArray(function (err, Preferencesjobfunctionresult) {

                                            if (Preferencesjobfunctionresult != null && Preferencesjobfunctionresult.length > 0 && Preferencesjobfunctionresult[0].jobfunctioncode != null)
                                                jobfunctioncodelist=(Preferencesjobfunctionresult[0].jobfunctioncode)
                                            if (Preferencesjobfunctionresult != null && Preferencesjobfunctionresult.length > 0 && Preferencesjobfunctionresult[0].jobrolecode != null)
                                                jobrolecodelist = (Preferencesjobfunctionresult[0].jobrolecode)
                                           

                                            if (jobfunctionresult != null && jobfunctionresult.length > 0 && jobfunctionresult[0].jobfunctioncode != null)
                                                jobfunctioncodelist = jobfunctioncodelist.concat(jobfunctionresult[0].jobfunctioncode)
                                                //jobfunctioncode.push(jobfunctionresult[0].jobfunctioncode)// = jobfunctioncode.concat(jobfunctionresult[0].jobfunctioncode)
                                            if (jobfunctionresult != null && jobfunctionresult.length > 0 && jobfunctionresult[0].jobrolecode != null)
                                                 jobrolecodelist = jobrolecodelist.concat(jobfunctionresult[0].jobrolecode)
                                                //jobrolecode.push(jobfunctionresult[0].jobrolecode)
                                               
                                            finalresult = {
                                                skillcode: skillcode,
                                                locationcode: locationcode,
                                                jobfunctioncode: jobfunctioncodelist,
                                                jobrolecode: jobrolecodelist,
                                                schoolqualcode: schoolqualcode,
                                                afterschoolqualcode: afterschoolqualcode,
                                                afterschoolspeccode: afterschoolspeccode,
                                                afterschoolcatecode: afterschoolcatecode,
                                                experiencecode: totexp,
                                                maritalcode: maritalcode,
                                                gendercode: gendercode,
                                                jobtypecode: jobtypecode,
                                                industrycode: industrycode,
                                                companytypecode: companytypecode,
                                                employertypecode: employertypecode,
                                                salaryfrom: salaryfrom,
                                                salaryto: salaryto,
                                                isanystate: isanystate,
                                                isanydistrict: isanydistrict,
                                                isanytaluk: isanytaluk,
                                                differentlyabled: differentlyabled,
                                                agefrom: age,
                                                afterschool: afterschoolresult.length,
                                                ageto: age
                                            }
                                            ////console.log("Profile Filter2");
                                            ////console.log(finalresult);
                                            return callback(finalresult);
                                        });

                                    });
                                    // }
                                    // else {
                                    //     dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                                    //         { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
                                    //         { $unwind: "$preferences" },
                                    //         { $unwind: "$preferences.jobfunction" },
                                    //         {
                                    //             $group: {
                                    //                 "_id": { "employeecode": '$employeecode' }, "jobfunctioncode": { $addToSet: '$preferences.jobfunction.jobfunctioncode' },
                                    //                 "jobrolecode": { $addToSet: '$preferences.jobrole.jobrolecode' }
                                    //             }
                                    //         },
                                    //         {
                                    //             "$project": {
                                    //                 _id: 0,
                                    //                 jobfunctioncode: '$jobfunctioncode', jobrolecode: '$jobrolecode'
                                    //             }
                                    //         }
                                    //     ]).toArray(function (err, jobfunctionresult) {
                                    //         ////console.log(maritalcode);
                                    //         if (jobfunctionresult != null && jobfunctionresult.length > 0 && jobfunctionresult[0].jobfunctioncode != null)
                                    //             jobfunctioncode = jobfunctionresult[0].jobfunctioncode
                                    //         if (jobfunctionresult != null && jobfunctionresult.length > 0 && jobfunctionresult[0].jobrolecode != null)
                                    //             jobrolecode = jobfunctionresult[0].jobrolecode
                                    //         finalresult = {
                                    //             skillcode: skillcode,
                                    //             locationcode: locationcode,
                                    //             jobfunctioncode: jobfunctioncode,
                                    //             jobrolecode: jobrolecode,
                                    //             schoolqualcode: schoolqualcode,
                                    //             afterschoolqualcode: afterschoolqualcode,
                                    //             afterschoolspeccode: afterschoolspeccode,
                                    //             afterschoolcatecode: afterschoolcatecode,
                                    //             experiencecode: totexp,
                                    //             maritalcode: maritalcode,
                                    //             gendercode: gendercode,
                                    //             jobtypecode: jobtypecode,
                                    //             industrycode: industrycode,
                                    //             companytypecode: companytypecode,
                                    //             employertypecode: employertypecode,
                                    //             salaryfrom: salaryfrom,
                                    //             salaryto: salaryto,
                                    //             isanystate: isanystate,
                                    //             isanydistrict: isanydistrict,
                                    //             isanytaluk: isanytaluk,
                                    //             differentlyabled: differentlyabled,
                                    //             agefrom: age,
                                    //             afterschool: afterschoolresult.length,
                                    //             ageto: age
                                    //         }
                                    //         ////console.log("Profile Filter2");
                                    //         ////console.log(finalresult);
                                    //         return callback(finalresult);
                                    //     });
                                    // }
                                });
                            });

                        });
                    });
                });
            });
        });

        //finalresult = result;
        ////console.log("school");
        ////console.log(result);
        //return callback(finalresult);
    }
    catch (e) { logger.error("Error in Getting Job List: " + e); }


}