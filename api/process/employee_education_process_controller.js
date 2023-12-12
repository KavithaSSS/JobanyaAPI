'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');


exports.getSchoolingLoad = function (logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Schooling Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var params = { "statuscode": objConstants.activestatus, "typecode": objConstants.schoolingtypecode };
        dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
			{ $unwind: '$educationcategory'},
            { $match: { "statuscode": parseInt(objConstants.activestatus), "educationcategory.languagecode": parseInt(objConstants.defaultlanguagecode) } },
            {
                $sort: {
                    ordervalue: 1
                }
            },
            {
                $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1 , ordervalue:1}
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log("school");
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Employee Schooling Load: " + e); }


}

exports.getYearList = function (callback) {
    try {
        const dbo = MongoDB.getDB();
        dbo.collection(String(MongoDB.ControlsCollectionName)).find({}, { projection: { _id: 0, startingyear: 1 } }).toArray(function (err, controlresult) {
            var startYear = controlresult[0].startingyear;
            var currentYear = new Date().getFullYear(), years = [];
            startYear = startYear || 1980;
            while (startYear <= currentYear) {
                var yearsadd = {
                    "year": startYear++
                }
                years.push(yearsadd);
            }
            // //console.log("years");
            // //console.log(years);
            return callback(years);

        });
    }
    catch (e) { logger.error("Error in Year Bind: " + e); }


}
exports.getSchoolingMaxcode = function (logparams, employeecode,isleadtype, callback) {
    try {

        logger.info("Log in Schooling getting max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var paramcheck = { "employeecode": Number(employeecode) };
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(paramcheck, { projection: { _id: 0, schooling: 1 } }).toArray((err, docs) => {
            var maxcode;
            ////console.log("Max code");
            ////console.log(docs);
            if (docs[0].schooling == null) {
                maxcode = 1;
            }
            else {
                const collection = docs[0].schooling;
                const list = [];
                if (collection.length == 0)
                    maxcode = 1;
                else {
                    for (var i = 0; i <= collection.length - 1; i++) {
                        list.push(collection[i].schoolingcode);
                    }
                    //collection.every(e => e.values.every(e2 => list.push(e2.referencecode)));
                    maxcode = Math.max.apply(null, list) + 1;
                }
            }
            ////console.log("finalmaxcode");
            ////console.log(maxcode);
            return callback(maxcode);
        });
    }
    catch (e) { logger.error("Error in Get Max Code - Schooling" + e); }
}

exports.SchoolingDuplicateCheck = function (logparams, empparams, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = false;

        logger.info("Log in Employee Schooling Duplicate Checking : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: '$schooling' },
            { $match: empparams },
            {
                $project: {
                    _id: 0, qualificationcode: '$schooling.qualificationcode'
                }
            }
        ]).toArray(function (err, result) {
            if (result[0] == null)
                finalresult = false;
            else
                finalresult = true
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Schooling Duplicate check: " + e); }


}

exports.getSchoolingInfo = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Getting Single Record for Schooling Info on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, schooling: 1 } }).toArray(function (err, empresult) {
            ////console.log("Reference");
            ////console.log(empresult);
            if (err) throw err;
            if (empresult != null) {
                finalresult = empresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Employee Schooling info: " + e); }

}

exports.Schoolingsave = function (params, employeecode, logparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).updateOne({ "employeecode": Number(employeecode) }, { $set: { "schooling": params } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
               // //console.log(finalresult);
               return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employee Schooling Info Update: " + e); }
}

exports.getSchoolingEditLoad = function (logparams, params,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Schooling Edit Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        //var referenceparams =  {"employeecode": Number(params.employeecode), 'experienceinfo.experiencecode': Number(params.experiencecode) };
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: '$schooling' },
            { $match: params },
            {
                $project: {
                    _id: 0, schoolingcode: '$schooling.schoolingcode',iscurrentlypursuing: '$schooling.iscurrentlypursuing', qualificationcode: '$schooling.qualificationcode', institution: '$schooling.institution',
                    location: '$schooling.location', percentage: '$schooling.percentage', yearofpassing: '$schooling.yearofpassing'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });

    }
    catch (e) { logger.error("Error in Employee Schooling Edit Load: " + e); }

}
//After Schooling
exports.getAfterSchoolingLoad = function (logparams, langparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in After Schooling Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var params = { "statuscode": objConstants.activestatus, "typecode": objConstants.afterschoolingtypecode };
        /* dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
            { $match: { statuscode: parseInt(objConstants.defaultstatuscode), typecode: parseInt(objConstants.afterschoolingtypecode) } },
            {
                $sort: {
                    ordervalue:1
                }
            },
            {
                $project: {
                    _id: 0, educationcategorycode: 1, educationcategoryname: 1,ordervalue:1
                }
            }
        ]). */
        dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
			{ $unwind: '$educationcategory'},
            { $match: { "statuscode": parseInt(objConstants.activestatus), "educationcategory.languagecode": parseInt(objConstants.defaultlanguagecode), "typecode": parseInt(objConstants.afterschoolingtypecode) } },
            {
                $sort: {
                    ordervalue: 1
                }
            },
            {
                $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1 , ordervalue:1}
            }
        ]).toArray(function (err, result) {
            dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
                { $match: params },
                {
                    $lookup:
                    {
                        from: String(MongoDB.QualificationCollectionName),
                        localField: 'educationcategorycode',
                        foreignField: 'educationcategorycode',
                        as: 'qualification'
                    }
                },
                { $unwind: '$qualification' },
                {
                    $sort: {
                        'qualification.qualificationname': 1
                    }
                },
                {
                    $project: {
                        _id: 0, educationcategorycode: '$qualification.educationcategorycode', qualificationcode: '$qualification.qualificationcode', qualificationname: '$qualification.qualificationname'
                    }
                }
            ]).toArray(function (err, qualresult) {
                dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
                    { $match: params },
                    {
                        $lookup:
                        {
                            from: String(MongoDB.SpecializationCollectionName),
                            localField: 'educationcategorycode',
                            foreignField: 'educationcategorycode',
                            as: 'specializationinfo'
                        }
                    },
                    { $unwind: '$specializationinfo' },
                    { $unwind: '$specializationinfo.specialization' },
                    //{ $match: { "specializationinfo.specialization.languagecode": Number(langparams) } },
                    { $match: {$and:[{"specializationinfo.statuscode": objConstants.activestatus},
            {$or:[{"specializationinfo.specialization.languagecode": Number(langparams) },{"specializationinfo.specialization.languagecode": objConstants.defaultlanguagecode }]}]}},
                {
                        $lookup:
                        {
                            from: String(MongoDB.Quali_Spec_MappingCollectionName),
                            localField: 'specializationinfo.specializationcode',
                            foreignField: 'specializationcode',
                            as: 'specinfo'
                        }
                    },
                    { $unwind: '$specinfo' },
                    {
                        $sort: {
                            'specializationinfo.specialization.specializationname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, educationcategorycode: '$specializationinfo.educationcategorycode', specializationcode: '$specializationinfo.specializationcode', specializationname: '$specializationinfo.specialization.specializationname',
                            languagecode:'$specializationinfo.specialization.languagecode', qualificationcode: '$specinfo.qualificationcode'
                        }
                    }
                ]).toArray(function (err, specialresult) {
                    // //console.log(result);
                    finalresult = {
                        educationcategorylist: result,
                        qualificationlist: qualresult,
                        specializationlist: specialresult
                    };
                    ////console.log("school");
                    ////console.log(finalresult);
                    return callback(finalresult);
                });


            });
        });


    }
    catch (e) { logger.error("Error in Employee After Schooling Load: " + e); }

}
exports.getAfterSchoolingMaxcode = function (logparams, employeecode,isleadtype, callback) {
    try {

        logger.info("Log in After Schooling getting max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var paramcheck = { "employeecode": Number(employeecode) };
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(paramcheck, { projection: { _id: 0, afterschooling: 1 } }).toArray((err, docs) => {
            var maxcode;
            ////console.log("Max code");
            ////console.log(docs);
            if (docs[0].afterschooling == null) {
                maxcode = 1;
            }
            else {
                const collection = docs[0].afterschooling;
                const list = [];
                if (collection.length == 0)
                    maxcode = 1;
                else {
                    for (var i = 0; i <= collection.length - 1; i++) {
                        list.push(collection[i].afterschoolingcode);
                    }
                    //collection.every(e => e.values.every(e2 => list.push(e2.referencecode)));
                    maxcode = Math.max.apply(null, list) + 1;
                }

            }
            ////console.log("finalmaxcode");
            ////console.log(maxcode);
            return callback(maxcode);
        });
    }
    catch (e) { logger.error("Error in Get Max Code - After Schooling" + e); }
}

exports.AfterSchoolingDuplicateCheck = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = false;

        logger.info("Log in Employee After Schooling Duplicate Checking : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: '$afterschooling' },
            { $match: empparams },
            {
                $project: {
                    _id: 0, qualificationcode: '$afterschooling.qualificationcode', specializationcode: '$afterschooling.specializationcode'
                }
            }
        ]).toArray(function (err, result) {
            if (result[0] == null)
                finalresult = false;
            else
                finalresult = true
            return callback(finalresult);
        });

    }
    catch (e) { logger.error("Error in Employee After Schooling Duplicate Check: " + e); }

}

exports.getAfterSchoolingInfo = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Getting Single Record for After Schooling Info on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, afterschooling: 1 } }).toArray(function (err, empresult) {
            ////console.log("Reference");
            ////console.log(empresult);
            if (err) throw err;
            if (empresult != null && empresult.length > 0) {
                finalresult = empresult;
            }
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Employee After Schooling Info: " + e); }

}

exports.AfterSchoolingsave = function (params, employeecode, logparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).updateOne({ "employeecode": Number(employeecode) }, { $set: { "afterschooling": params } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employee Schooling Info Update: " + e); }
}

exports.getAfterSchoolingEditLoad = function (logparams, params,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in After Schooling Edit Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        //var referenceparams =  {"employeecode": Number(params.employeecode), 'experienceinfo.experiencecode': Number(params.experiencecode) };
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: '$afterschooling' },
            { $match: params },
            {
                $project: {
                    _id: 0, afterschoolingcode: '$afterschooling.afterschoolingcode',iscurrentlypursuing: '$afterschooling.iscurrentlypursuing', qualificationcode: '$afterschooling.qualificationcode', institution: '$afterschooling.institution',
                    location: '$afterschooling.location', percentage: '$afterschooling.percentage', yearofpassing: '$afterschooling.yearofpassing', specializationcode: '$afterschooling.specializationcode'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });

    }
    catch (e) { logger.error("Error in Employee After Schooling Edit Load: " + e); }

}

exports.getEducationInfo = function (logparams, empparams, languagecode,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var schoolresult;
        var afterschoolresult;

        logger.info("Log in Employee Getting Education List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        var schoolparams = { "employeecode": Number(empparams.employeecode) };
        ////console.log(schoolparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $match: schoolparams },
            { $unwind: "$schooling" },
            {
                $lookup: {
                    from: String(MongoDB.EduCategoryCollectionName),
                    localField: 'schooling.qualificationcode',
                    foreignField: 'educationcategorycode',
                    as: 'schoolingInfo'
                }
            },
            { $unwind: "$schoolingInfo" },
            { $unwind: '$schoolingInfo.educationcategory' },
            { $match: { "schoolingInfo.educationcategory.languagecode": objConstants.defaultlanguagecode } },	
            {
                $project: {
                    "_id": 0,
                    "iscurrentlypursuing": '$schooling.iscurrentlypursuing',"schoolingcode": '$schooling.schoolingcode', "qualificationcode": '$schoolingInfo.educationcategorycode', "qualificationname": '$schoolingInfo.educationcategory.educationcategoryname', "institution": '$schooling.institution', "location": '$schooling.location', "percentage": '$schooling.percentage', "yearofpassing": '$schooling.yearofpassing'
                }
            }]).toArray(function (err, result) {
                ////console.log("Reference");

                if (err) {

                }
                else {
                    ////console.log( JSON.stringify( result, undefined, 2 ) );
                    schoolresult = result;
                    var afterschoolparams = { "employeecode": Number(empparams.employeecode) };
                    var afterspec = { "employeecode": Number(empparams.employeecode), "specialization.languagecode": 1 };
                    dbo.collection(String(dbCollectionName)).aggregate([

                        { $unwind: "$afterschooling" },


                        { $match: afterschoolparams },
                        {
                            $lookup: {
                                from: String(MongoDB.QualificationCollectionName),

                                localField: 'afterschooling.qualificationcode',
                                foreignField: 'qualificationcode',
                                as: 'afterschoolingInfo'
                            }
                        },
                        { $unwind: "$afterschoolingInfo" },


                        //{ $addFields: { othercond: { $cond: [ { $eq: [ "specialization.languagecode", 1 ] }, 'afterschooling.specializationcode' ] } } },

                        {
                            $lookup:
                            {

                                from: String(MongoDB.SpecializationCollectionName),
                                localField: 'afterschooling.specializationcode',
                                foreignField: 'specializationcode',
                                as: 'specializationInfo'
                            }
                        },
                        { $unwind: "$specializationInfo" },
                        { $unwind: "$specializationInfo.specialization" },
                        { $match: { "specializationInfo.specialization.languagecode": Number(languagecode) } },
                        {
                            $project: {
                                "_id": 0,
                                "iscurrentlypursuing": '$afterschooling.iscurrentlypursuing',"afterschoolingcode": '$afterschooling.afterschoolingcode', "qualificationcode": '$afterschoolingInfo.qualificationcode', "qualificationname": '$afterschoolingInfo.qualificationname', "institution": '$afterschooling.institution', "location": '$afterschooling.location', "percentage": '$afterschooling.percentage', "yearofpassing": '$afterschooling.yearofpassing', "specializationcode": '$specializationInfo.specializationcode', "specializationname": '$specializationInfo.specialization.specializationname'
                            }
                        }]).toArray(function (err, afterschoolresult) {
                            ////console.log("Reference");

                            if (err) {

                            }
                            else {
                                ////console.log( JSON.stringify( afterschoolresult, undefined, 2 ) );
                                finalresult = {
                                    schoollist: schoolresult,
                                    afterschoollist: afterschoolresult
                                }
                                return callback(finalresult);
                                ////console.log( finalresult);
                            }
                        });
                }


            });


    }
    catch (e) { logger.error("Error in Employee Education List: " + e); }

}
exports.getPortalEducationInfo = function (logparams, empparams, languagecode,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var schoolresult;
        var afterschoolresult;

        logger.info("Log in Employee Getting Education List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        var schoolparams = { "employeecode": Number(empparams.employeecode) };
        ////console.log(schoolparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $match: schoolparams },
            { $unwind: "$schooling" },
            {
                $lookup: {
                    from: String(MongoDB.EduCategoryCollectionName),
                    localField: 'schooling.qualificationcode',
                    foreignField: 'educationcategorycode',
                    as: 'schoolingInfo'
                }
            },
            { $unwind: "$schoolingInfo" },
            { $unwind: '$schoolingInfo.educationcategory' },
            { $match: { "schoolingInfo.educationcategory.languagecode": objConstants.defaultlanguagecode } },	
            {
                "$addFields": {
                  "typecode": 1
                }
              },
            {
                $project: {
                    "_id": 0,typecode: 1,
                    "iscurrentlypursuing": '$schooling.iscurrentlypursuing',"schoolingcode": '$schooling.schoolingcode', "qualificationcode": '$schoolingInfo.educationcategorycode', "qualificationname": '$schoolingInfo.educationcategory.educationcategoryname', "institution": '$schooling.institution', "location": '$schooling.location', "percentage": '$schooling.percentage', "yearofpassing": '$schooling.yearofpassing'
                }
            }]).toArray(function (err, result) {
                ////console.log("Reference");

                if (err) {

                }
                else {
                    ////console.log( JSON.stringify( result, undefined, 2 ) );
                    schoolresult = result;
                    var afterschoolparams = { "employeecode": Number(empparams.employeecode) };
                    var afterspec = { "employeecode": Number(empparams.employeecode), "specialization.languagecode": 1 };
                    dbo.collection(String(dbCollectionName)).aggregate([

                        { $unwind: "$afterschooling" },


                        { $match: afterschoolparams },
                        {
                            $lookup: {
                                from: String(MongoDB.EduCategoryCollectionName),

                                localField: 'afterschooling.educationcategorycode',
                                foreignField: 'educationcategorycode',
                                as: 'afterschoolingInfo'
                            }
                        },
                        { $unwind: "$afterschoolingInfo" },
                        {
                            "$addFields": {
                              "typecode": 2
                            }
                          },
                        // //{ $addFields: { othercond: { $cond: [ { $eq: [ "specialization.languagecode", 1 ] }, 'afterschooling.specializationcode' ] } } },
                        // {
                        //     $lookup:
                        //     {
                        //         from: String(MongoDB.SpecializationCollectionName),
                        //         localField: 'afterschooling.specializationcode',
                        //         foreignField: 'specializationcode',
                        //         as: 'specializationInfo'
                        //     }
                        // },
                        // {$unwind: {path:'$specializationInfo',preserveNullAndEmptyArrays: true }},
                        // {$unwind: {path:'$specializationInfo.specialization',preserveNullAndEmptyArrays: true }},
                        // {$unwind: {path:'$specializationInfo.specialization.languagecode',preserveNullAndEmptyArrays: true }},
                        // { $unwind: "$specializationInfo" },
                        // { $unwind: "$specializationInfo.specialization" },
                        // { $match: { $or: [{ "specializationInfo.specialization.languagecode": { $exists: false } }, { "specializationInfo.specialization.languagecode": "" }, { "specializationInfo.specialization.languagecode": Number(languagecode) }] } },
                        // { $match: { "specializationInfo.specialization.languagecode": Number(languagecode) } },
                        {
                            $project: {
                                "_id": 0,typecode: 1,
                                "afterschoolingcode": '$afterschooling.afterschoolingcode', "qualificationcode": '$afterschoolingInfo.educationcategorycode'
                                // "qualificationcode": '$afterschoolingInfo.qualificationcode', "qualificationname": '$afterschoolingInfo.qualificationname', "institution": '$afterschooling.institution', "location": '$afterschooling.location', "percentage": '$afterschooling.percentage', "yearofpassing": '$afterschooling.yearofpassing', "specializationcode": '$specializationInfo.specializationcode', "specializationname": '$specializationInfo.specialization.specializationname'
                            }
                        }]).toArray(function (err, afterschoolresult) {
                            ////console.log("Reference");

                            if (err) {

                            }
                            else {
                                ////console.log( JSON.stringify( afterschoolresult, undefined, 2 ) );
                                finalresult = {
                                    schoollist: schoolresult,
                                    afterschoollist: afterschoolresult
                                }
                                return callback(finalresult);
                                ////console.log( finalresult);
                            }
                        });
                }


            });


    }
    catch (e) { logger.error("Error in Employee Education List: " + e); }

}

exports.getProfileSchoolingLoad = function (logparams, employeecode,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Profile Schooling Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var params = { "statuscode": objConstants.activestatus, "typecode": objConstants.schoolingtypecode };
        
        dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
			{ $unwind: '$educationcategory'},
            { $match: { "statuscode": parseInt(objConstants.activestatus), "educationcategory.languagecode": parseInt(objConstants.defaultlanguagecode), "typecode": objConstants.schoolingtypecode } },
            {
                $sort: {
                    ordervalue: 1
                }
            },
            {
                $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1 , ordervalue:1}
            }
        ]).toArray(function (err, result) {
            //dbo.collection(MongoDB.EmployeeCollectionName).find({"employeecode": Number(employeecode)}, {projection: {_id:0, dateofbirth: '$person'}})
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).aggregate([
                {$unwind: {path:'$personalinfo',preserveNullAndEmptyArrays: true }},
                { $match: { 'employeecode': Number(employeecode) } },
                {$project: {_id:0, dateofbirth: { $ifNull:[ '$personalinfo.dateofbirth','']}}}
                ]).toArray(function (err, empresult) {
                    finalresult = {
                            category: result,
                            dateofbirth: empresult[0].dateofbirth
                    } 
            // //console.log("school");
            // //console.log(finalresult);
            return callback(finalresult);
                });
            
        });
    }
    catch (e) { logger.error("Error in Profile Employee Schooling Load: " + e); }


}

exports.getProfileAfterSchoolingLoad = function (logparams, langparams, employeecode ,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Profile After Schooling Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var params = { "statuscode": objConstants.activestatus, "typecode": objConstants.afterschoolingtypecode };
        /* dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
            { $match: { statuscode: parseInt(objConstants.defaultstatuscode), typecode: parseInt(objConstants.afterschoolingtypecode) } },
            {
                $sort: {
                    ordervalue:1
                }
            },
            {
                $project: {
                    _id: 0, educationcategorycode: 1, educationcategoryname: 1,ordervalue:1
                }
            }
        ]) */
        dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
			{ $unwind: '$educationcategory'},
            { $match: { "statuscode": parseInt(objConstants.activestatus), "educationcategory.languagecode": parseInt(objConstants.defaultlanguagecode), typecode: parseInt(objConstants.afterschoolingtypecode) } },
            {
                $sort: {
                    ordervalue: 1
                }
            },
            {
                $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1 , ordervalue:1}
            }
        ]).toArray(function (err, result) {
            dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
                { $match: params },
                {
                    $lookup:
                    {
                        from: String(MongoDB.QualificationCollectionName),
                        localField: 'educationcategorycode',
                        foreignField: 'educationcategorycode',
                        as: 'qualification'
                    }
                },
                { $unwind: '$qualification' },
                {
                    $sort: {
                        'qualification.qualificationname': 1
                    }
                },
                {
                    $project: {
                        _id: 0, educationcategorycode: '$qualification.educationcategorycode', qualificationcode: '$qualification.qualificationcode', qualificationname: '$qualification.qualificationname'
                    }
                }
            ]).toArray(function (err, qualresult) {
                dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
                    { $match: params },
                    {
                        $lookup:
                        {
                            from: String(MongoDB.SpecializationCollectionName),
                            localField: 'educationcategorycode',
                            foreignField: 'educationcategorycode',
                            as: 'specializationinfo'
                        }
                    },
                    { $unwind: '$specializationinfo' },
                    { $unwind: '$specializationinfo.specialization' },
                    { $match: { "specializationinfo.specialization.languagecode": Number(langparams) } },
                    {
                        $lookup:
                        {
                            from: String(MongoDB.Quali_Spec_MappingCollectionName),
                            localField: 'specializationinfo.specializationcode',
                            foreignField: 'specializationcode',
                            as: 'specinfo'
                        }
                    },
                    { $unwind: '$specinfo' },
                    {
                        $sort: {
                            'specializationinfo.specialization.specializationname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, educationcategorycode: '$specializationinfo.educationcategorycode', specializationcode: '$specializationinfo.specializationcode', specializationname: '$specializationinfo.specialization.specializationname', qualificationcode: '$specinfo.qualificationcode'
                        }
                    }
                ]).toArray(function (err, specialresult) {
                    var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
                    dbo.collection(String(dbCollectionName)).aggregate([
                        {$unwind: {path:'$personalinfo',preserveNullAndEmptyArrays: true }},
                        { $match: { 'employeecode': Number(employeecode) } },
                        {$project: {_id:0, dateofbirth: { $ifNull:[ '$personalinfo.dateofbirth','']}}}
                        ]).toArray(function (err, empresult) {
                            finalresult = {
                                educationcategorylist: result,
                                qualificationlist: qualresult,
                                specializationlist: specialresult,
                                //dateofbirth: empresult[0].dateofbirth
                            };
                            if(empresult !=null && empresult.length>0){
                                finalresult.dateofbirth = empresult[0].dateofbirth;
                            }
                            else{
                                finalresult.dateofbirth ="";
                            }
                            ////console.log("school");
                            ////console.log(finalresult);
                            return callback(finalresult);
                        });
                    // //console.log(result);
                    
                });


            });
        });


    }
    catch (e) { logger.error("Error in Employee Profile After Schooling Load: " + e); }

}

exports.getAfterSchoolingCount = function (logparams, employeecode, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Getting Single Record for After Schooling Count on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find({ employeecode: Number(employeecode), "afterschooling": { $exists: true, $ne: null }, "afterschooling.afterschoolingcode": { $exists: true } }).count(function (err, totalcount) { //find if a value exists
            //dbo.collection(String(MongoDB.EmployeeCollectionName)).find(empparams, { projection: { _id: 0, afterschooling: 1 } }).toArray(function (err, empresult) {
            ////console.log("Reference");
            ////console.log(empresult);

            ////console.log("totalcount", totalcount);
            return callback(totalcount);
        });
    }
    catch (e) { logger.error("Error in Employee After Schooling Count: " + e); }

}


exports.getSchoolingCount = function (logparams, employeecode,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Getting Single Record for Schooling Count on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find({ employeecode: Number(employeecode), "schooling": { $exists: true, $ne: null } }).count(function (err, totalcount) { //find if a value exists
            //dbo.collection(String(MongoDB.EmployeeCollectionName)).find(empparams, { projection: { _id: 0, afterschooling: 1 } }).toArray(function (err, empresult) {
            ////console.log("Reference");
            ////console.log(empresult);

            ////console.log(finalresult);
            return callback(totalcount);
        });
    }
    catch (e) { logger.error("Error in Employee Schooling Count: " + e); }

}

exports.getYearMaxValue = function (logparams, employeecode, year, isleadtype,callback) {
    try {

        logger.info("Log in Schooling getting max Code for Year: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var paramcheck = { "employeecode": Number(employeecode) };
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(paramcheck, { projection: { _id: 0, schooling: 1 } }).toArray((err, docs) => {
            var maxcode;
            ////console.log("Max code");
            ////console.log(docs);
            if (docs[0].schooling == null) {
                maxcode = false;
            }
            else {
                const collection = docs[0].schooling;
                const list = [];
                if (collection.length == 0)
                    maxcode = false;
                else {
                    for (var i = 0; i <= collection.length - 1; i++) {
                        list.push(collection[i].yearofpassing);
                    }
                    //collection.every(e => e.values.every(e2 => list.push(e2.referencecode)));
                    var maxyear = Math.max.apply(null, list);
                    if (maxyear >= year)
                        maxcode = false;
                    else
                        maxcode = true;
                }
            }
            ////console.log("finalmaxcode");
            ////console.log(maxcode);
            return callback(maxcode);
        });
    }
    catch (e) { logger.error("Error in Year Max Code - After Schooling" + e); }
}