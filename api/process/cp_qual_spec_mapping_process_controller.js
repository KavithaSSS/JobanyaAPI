'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');

exports.CheckQualificationcode = function (logparams, req, callback) {
    logger.info("Log in checking Qualifiacation code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    ////console.log(req.body.specialization);
    CheckSpecialization(req.body.specialization, req.body.educationcategorycode, req.body.qualificationcode, function (err, specializationcount) {
        if (err) {
            return;
        }
        // //console.log(specializationcount)
        return callback(specializationcount);
    });
}
var async = require('async');
function CheckSpecialization(SpecializationListObj, EducationObj, QualiObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (specializationObj, done) {
            dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).find({ "specializationcode": specializationObj, "educationcategorycode": EducationObj, "qualificationcode": QualiObj }).count(function (err, result) {
                ////console.log(result);
                if (err) {
                    done(err);
                    return;
                }
                if (result == 0) {
                    finalresult.push(specializationObj);
                    // //console.log(finalresult);
                }
                done();
                return;
            });
        }
        var doneIteratingFcn = function (err) {
            ////console.log(finalresult)
            callback(err, finalresult);

        };
        async.forEach(SpecializationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Specialization name - Specialization Mapping" + e);
    }
}
// exports.MappingSpecializationcode = function (logparams, req, callback) {
//     logger.info("Log in checking specialization code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
//     CheckQualification(req.body.qualification, req.body.educationcategorycode, req.body.specializationcode, function (err, specializationcount) {
//         if (err) {
//             return;
//         }
//         ////console.log(specializationcount)
//         return callback(specializationcount);
//     });
// }
function CheckQualification(QualificationListObj, EducationObj, SpeciObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (qualificationObj, done) {
            dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).find({ "qualificationcode": qualificationObj, "educationcategorycode": EducationObj, "specializationcode": SpeciObj }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result == 0) {
                    finalresult.push(qualificationObj);
                    ////console.log(finalresult);
                }
                done();
                return;

            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, finalresult);
        };
        async.forEach(QualificationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Qualification name - Specialization Mapping" + e);
    }
}
exports.CheckSpecializationCode=function(logparams,req, callback){
    logger.info("Log in checking specialization code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    CheckQualification(req.body.qualification, req.body.educationcategorycode, req.body.specializationcode, function (err, specializationcount) {
        if (err) {
            return;
        }
        ////console.log(specializationcount)
        return callback(specializationcount);
    });
}
exports.InsertSpeci_mappingDetails = function (logparams, params, callback) {
    try {
        // //console.log("entry")
        logger.info("Log in specialization create by specialization Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).insertMany(params, function (err, res) {
            if (err)
                throw err;
            ////console.log(res.insertedCount);
            return callback(res.insertedCount);
        });
    }
    catch (e) { logger.error("Error in create - Mapping" + e); }
}
exports.Quali_spec_mapping_FormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { statuscode: parseInt(objConstants.activestatus) }
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
        ]).toArray(function (err, categoryresult) {
            dbo.collection(MongoDB.QualificationCollectionName).aggregate([
                {
                    $lookup: {
                        from: String(MongoDB.Quali_Spec_MappingCollectionName),
                        let: {
                            educationcode: "$educationcategorycode",
                            qualicode: "$qualificationcode"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$educationcategorycode",
                                                    "$$educationcode"
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    "$qualificationcode",
                                                    "$$qualicode"
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "result"
                    }
                },
                { $match: params },
                {
                    $sort: {
                        qualificationname: 1
                    }
                },
                {
                    $project: { _id: 0, qualificationcode: 1, qualificationname: 1, educationcategorycode: 1, qualificationcount: { "$size": "$result" } }
                }
            ]).toArray(function (err, qualifiresult) {
                dbo.collection(MongoDB.SpecializationCollectionName).aggregate([
                    { $unwind: '$specialization' },
                    {
                        $lookup: {
                            from: String(MongoDB.Quali_Spec_MappingCollectionName),
                            let: {
                                educationcode: "$educationcategorycode",
                                specicode: "$specializationcode"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$educationcategorycode",
                                                        "$$educationcode"
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        "$specializationcode",
                                                        "$$specicode"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "result"
                        }
                    },
                    { $match: { 'specialization.languagecode': parseInt(objConstants.defaultlanguagecode), statuscode: parseInt(objConstants.defaultstatuscode) } },
                    {
                        $sort: {
                            'specialization.specializationname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, specializationcode: 1, specializationname: '$specialization.specializationname', educationcategorycode: 1, specializationcount: { "$size": "$result" }
                        }
                    }
                ]).toArray(function (err, specializationresult) {

                    finalresult = {
                        "categorylist": categoryresult,
                        "qualificationlist": qualifiresult,
                        "specializationlist": specializationresult
                    }
                    return callback(finalresult);
                });
            });
        });
    }
    catch (e) { logger.error("Error in Form load - Quali_speci_mapping" + e); }
}

exports.deleteQualificationcodedetails = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        // var finalresult;
        logger.info("Log in delete mappping details: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).deleteMany(params, function (err, res) {
            if (err)
                throw err;
            ////console.log(res.deletedCount);
            return callback(res.deletedCount);
        });
    }
    catch (e) {
        logger.error("Error in delete - Mapping" + e);
    }
}
exports.deleteSpecializationcodedetails = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        // var finalresult;
        logger.info("Log in delete mappping details: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).deleteMany(params, function (err, res) {
            if (err)
                throw err;
            ////console.log(res.deletedCount);
            return callback(res.deletedCount);
        });
    }
    catch (e) {
        logger.error("Error in delete - Mapping" + e);
    }
}
exports.CheckSpecializationExistsInEmployee = function (logparams, specialization, req, callback) {

    logger.info("Log in checking Specialization & Qualification In Employee details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    Checkemployeedetails(req.body.qualificationcode, specialization, function (err, finalcount) {
        // //console.log(specialization)
        if (err) {
            return;
        }
        // //console.log(finalcount)
        return callback(finalcount);
    });

}

function Checkemployeedetails(qualifiobj, specializationListObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        // //console.log(specializationListObj)
        var iteratorFcn = function (singleObj, done) {
            // //console.log(singleObj);
            dbo.collection(MongoDB.EmployeeCollectionName).find({ afterschooling: { $elemMatch: { specializationcode: singleObj, qualificationcode: Number(qualifiobj) } } }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result == 0) {
                    finalresult.push(singleObj);
                    // //console.log(finalresult);
                }
                done();
                return;

            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, finalresult);
        };
        async.forEach(specializationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Specialization & Qualification - Employee" + e);
    }
}
exports.CheckSpecializationExistsInJobpost = function (logparams, specialization, req, callback) {

    logger.info("Log in checking Specialization & Qualification In Jobpost details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    Checkjobpostdetails(req.body.qualificationcode, specialization, function (err, finalcount) {
        // //console.log(specialization)
        if (err) {
            return;
        }
        ////console.log("Inpost", finalcount)
        return callback(finalcount);
    });

}

function Checkjobpostdetails(qualifiobj, specializationListObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (singleObj, done) {
            // //console.log(singleObj);
            dbo.collection(MongoDB.JobPostsCollectionName).find({ afterschooling: { $elemMatch: { specializationcode: singleObj, qualificationcode: Number(qualifiobj) } } }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result == 0) {
                    finalresult.push(singleObj);
                    // //console.log(finalresult)
                }
                done();
                return;

            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, finalresult);
        };
        async.forEach(specializationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Specialization & Qualification - Job posts" + e);
    }
}

exports.GetSpecilaizationSingledetails = function (logparams, req, callback) {
    try {
        logger.info("Log in Specialization Single Record: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "educationcategorycode": req.body.educationcategorycode, "specializationcode": req.body.specializationcode };
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).aggregate(
            [
                { $match: params },
                {
                    $group:
                    {
                        _id: 0,
                        qualificationcode: { $addToSet: "$qualificationcode" },
                    }
                },
                {
                    $project: { _id: 0, qualificationcode: '$qualificationcode' }
                }
            ]).toArray(function (err, result) {
                // //console.log(result);
                if (err) throw err;
                if (result != null && result.length > 0) {
                    finalresult = result[0].qualificationcode;
                }

                // //console.log("Finalresult", finalresult)
                return callback(finalresult);
            });
    }
    catch (e) { logger.error("Error in single record details -Specialization" + e); }
}
exports.GetQualificationSingledetails = function (logparams, req, callback) {
    try {
        logger.info("Log in Qualification Single Record: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "educationcategorycode": req.body.educationcategorycode, "qualificationcode": req.body.qualificationcode };
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).aggregate(
            [
                { $match: params },
                {
                    $group:
                    {
                        _id: 0,
                        specializationcode: { $addToSet: "$specializationcode" },
                    }
                },
                {
                    $project: { _id: 0, specializationcode: '$specializationcode' }
                }
            ]).toArray(function (err, result) {
                // //console.log(result);
                if (err) throw err;
                if (result != null && result.length > 0) {
                    finalresult = result[0].specializationcode;
                }
                // //console.log("Finalresult", finalresult)
                return callback(finalresult);
            });
    }
    catch (e) { logger.error("Error in single record details -qualification" + e); }
}

exports.CheckQualificationExistsInEmployee = function (logparams, qualification, req, callback) {

    logger.info("Log in checking Specialization & Qualification In Employee details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    CheckemployeeQualification(req.body.specializationcode, qualification, function (err, finalcount) {
        // //console.log(specialization)
        if (err) {
            return;
        }
        // //console.log(finalcount)
        return callback(finalcount);
    });

}

function CheckemployeeQualification(specialiObj, qualificationListObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        // //console.log(specializationListObj)
        var iteratorFcn = function (singleObj, done) {
            // //console.log(singleObj);
            dbo.collection(MongoDB.EmployeeCollectionName).find({ afterschooling: { $elemMatch: { qualificationcode: singleObj, specializationcode: Number(specialiObj) } } }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result == 0) {
                    finalresult.push(singleObj);
                    // //console.log(finalresult);
                }
                done();
                return;

            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, finalresult);
        };
        async.forEach(qualificationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Specialization & Qualification - Employee" + e);
    }
}
exports.CheckQualificationExistsInJobpost = function (logparams, qualification, req, callback) {

    logger.info("Log in checking Specialization & Qualification In Jobpost details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    CheckeJobpostQualification(req.body.specializationcode, qualification, function (err, finalcount) {
        // //console.log(specialization)
        if (err) {
            return;
        }
        ////console.log("Inpost", finalcount)
        return callback(finalcount);
    });

}

function CheckeJobpostQualification(specialiObj, qualificationListObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (singleObj, done) {
            // //console.log(singleObj);
            dbo.collection(MongoDB.JobPostsCollectionName).find({ afterschooling: { $elemMatch: { qualificationcode: singleObj, specializationcode: Number(specialiObj) } } }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result == 0) {
                    finalresult.push(singleObj);
                    // //console.log(finalresult)
                }
                done();
                return;

            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, finalresult);
        };
        async.forEach(qualificationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Specialization & Qualification - Job posts" + e);
    }
}
exports.CheckSpecializationNotExistsInEmployee = function (logparams, specialization, req, callback) {

    logger.info("Log in checking Specialization & Qualification In Employee details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    CheckemployeeDeleteddetails(req.body.qualificationcode, specialization, function (err, finalcount) {
        // //console.log(specialization)
        if (err) {
            return;
        }
        // //console.log(finalcount)
        return callback(finalcount);
    });

}

function CheckemployeeDeleteddetails(qualifiobj, specializationListObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        // //console.log(specializationListObj)
        var iteratorFcn = function (singleObj, done) {
            // //console.log(singleObj);
            dbo.collection(MongoDB.EmployeeCollectionName).find({ afterschooling: { $elemMatch: { specializationcode: singleObj, qualificationcode: Number(qualifiobj) } } }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result != 0) {
                    finalresult.push(singleObj);
                    // //console.log(finalresult);
                }
                done();
                return;

            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, finalresult);
        };
        async.forEach(specializationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Specialization & Qualification - Employee" + e);
    }
}
exports.CheckSpecializationNotExistsInJobpost = function (logparams, specialization, req, callback) {

    logger.info("Log in checking Specialization & Qualification In Jobpost details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    Checkjobpostdeleteddetails(req.body.qualificationcode, specialization, function (err, finalcount) {
        // //console.log(specialization)
        if (err) {
            return;
        }
        // //console.log("Inpost", finalcount)
        return callback(finalcount);
    });

}

function Checkjobpostdeleteddetails(qualifiobj, specializationListObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (singleObj, done) {
            // //console.log(singleObj);
            dbo.collection(MongoDB.JobPostsCollectionName).find({ afterschooling: { $elemMatch: { specializationcode: singleObj, qualificationcode: Number(qualifiobj) } } }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result != 0) {
                    finalresult.push(singleObj);
                    // //console.log(finalresult)
                }
                done();
                return;

            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, finalresult);
        };
        async.forEach(specializationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Specialization & Qualification - Job posts" + e);
    }
}
exports.CheckQualificationNotExistsInEmployee = function (logparams, qualification, req, callback) {

    logger.info("Log in checking Specialization & Qualification In Employee details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    CheckemployeeDeletedQualification(req.body.specializationcode, qualification, function (err, finalcount) {
        // //console.log(specialization)
        if (err) {
            return;
        }
        // //console.log(finalcount)
        return callback(finalcount);
    });

}

function CheckemployeeDeletedQualification(specialiObj, qualificationListObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        ////console.log(specialiObj);
        ////console.log(qualificationListObj);
        var iteratorFcn = function (singleObj, done) {

            dbo.collection(MongoDB.EmployeeCollectionName).find({ afterschooling: { $elemMatch: { qualificationcode: singleObj, specializationcode: Number(specialiObj) } } }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result != 0) {
                    finalresult.push(singleObj);
                    // //console.log(finalresult);
                }
                done();
                return;

            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, finalresult);
        };
        async.forEach(qualificationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Specialization & Qualification - Employee" + e);
    }
}
exports.CheckQualificationNotExistsInJobpost = function (logparams, qualification, req, callback) {

    logger.info("Log in checking Specialization & Qualification In Jobpost details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    CheckeJobpostdeletedQualification(req.body.specializationcode, qualification, function (err, finalcount) {
        // //console.log(specialization)
        if (err) {
            return;
        }
        // //console.log("Inpost", finalcount)
        return callback(finalcount);
    });

}

function CheckeJobpostdeletedQualification(specialiObj, qualificationListObj, callback) {
    try {
        var finalresult = [];
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (singleObj, done) {
            // //console.log(singleObj);
            dbo.collection(MongoDB.JobPostsCollectionName).find({ afterschooling: { $elemMatch: { qualificationcode: singleObj, specializationcode: Number(specialiObj) } } }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result != 0) {
                    finalresult.push(singleObj);
                    // //console.log(finalresult)
                }
                done();
                return;

            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, finalresult);
        };
        async.forEach(qualificationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in checking Specialization & Qualification - Job posts" + e);
    }
}
exports.SpecializationList = function (logparams, callback) {
    try {
        logger.info("Log in checking Specialization List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).aggregate([
            {
                $lookup:
                {
                    from: String(MongoDB.SpecializationCollectionName),
                    localField: 'specializationcode',
                    foreignField: 'specializationcode',
                    as: 'specializationlist'
                }
            },
            { $unwind: '$specializationlist' },
            { $unwind: '$specializationlist.specialization' },
            { $match: { "specializationlist.specialization.languagecode": objConstants.defaultlanguagecode } },
            {
                $lookup:
                {
                    from: String(MongoDB.QualificationCollectionName),
                    localField: 'qualificationcode',
                    foreignField: 'qualificationcode',
                    as: 'qualificationlist'
                }
            },
            { $unwind: '$qualificationlist' },
            {
                $lookup:
                {
                    from: String(MongoDB.EduCategoryCollectionName),
                    localField: 'educationcategorycode',
                    foreignField: 'educationcategorycode',
                    as: 'categorylist'
                }
            },
            { $unwind: '$categorylist' },
            { $unwind: '$categorylist.educationcategory' },
            { $match: { "categorylist.educationcategory.languagecode": objConstants.defaultlanguagecode } },
            {
                $group:
                {
                    _id: {
                        educationcategorycode: "$educationcategorycode", specializationcode: "$specializationcode",
                        specializationname: "$specializationlist.specialization.specializationname", educationcategoryname: "$categorylist.educationcategory.educationcategoryname"
                    },
                    qualificationname: { $addToSet: "$qualificationlist.qualificationname" },
                }
            },
            {
                $sort: {
                    createddate: -1
                }
            },
            {
                $project: {
                    _id: 0, specializationcode: "$_id.specializationcode", educationcategorycode: '$_id.educationcategorycode',
                    specializationname: '$_id.specializationname', educationcategoryname: '$_id.educationcategoryname', qualificationname: '$qualificationname'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Specialization list- Mapping" + e);
    }
}

exports.QualificationList = function (logparams, callback) {
    try {
        logger.info("Log in checking Qualification List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).aggregate([
            {
                $lookup:
                {
                    from: String(MongoDB.SpecializationCollectionName),
                    localField: 'specializationcode',
                    foreignField: 'specializationcode',
                    as: 'specializationlist'
                }
            },
            { $unwind: '$specializationlist' },
            { $unwind: '$specializationlist.specialization' },
            { $match: { "specializationlist.specialization.languagecode": objConstants.defaultlanguagecode } },
            {
                $lookup:
                {
                    from: String(MongoDB.QualificationCollectionName),
                    localField: 'qualificationcode',
                    foreignField: 'qualificationcode',
                    as: 'qualificationlist'
                }
            },
            { $unwind: '$qualificationlist' },
            {
                $lookup:
                {
                    from: String(MongoDB.EduCategoryCollectionName),
                    localField: 'educationcategorycode',
                    foreignField: 'educationcategorycode',
                    as: 'categorylist'
                }
            },
            { $unwind: '$categorylist' },
            { $unwind: '$categorylist.educationcategory' },
            { $match: { "categorylist.educationcategory.languagecode": objConstants.defaultlanguagecode } },
            {
                $group:
                {
                    _id: {
                        educationcategorycode: "$educationcategorycode", qualificationcode: "$qualificationcode",
                        qualificationname: "$qualificationlist.qualificationname" , educationcategoryname: "$categorylist.educationcategory.educationcategoryname"
                    },
                    specializationname: { $addToSet: "$specializationlist.specialization.specializationname" },
                }
            },
            {
                $sort: {
                    createddate: -1
                }
            },
            {
                $project: {
                    _id: 0, qualificationcode: "$_id.qualificationcode", educationcategorycode: '$_id.educationcategorycode', specializationcode: '$_id.specializationcode',
                    qualificationname: '$_id.qualificationname', educationcategoryname: '$_id.educationcategoryname', specializationname: '$specializationname'
                }
            }]).toArray(function (err, result) {
                finalresult = result;
                ////console.log(result);
                return callback(finalresult);
            });

    }
    catch (e) {
        logger.error("Error in Qualification list- Mapping" + e);
    }
}

exports.SpecilaizationEditLoad = function (logparams,req, callback) {
    try {
        logger.info("Log in checking Specialization Edit load : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "specializationcode": Number(req.body.specializationcode), "educationcategorycode":Number(req.body.educationcategorycode)};
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).aggregate([
            { $match: params },
            {
                $lookup:
                {
                    from: String(MongoDB.SpecializationCollectionName),
                    localField: 'specializationcode',
                    foreignField: 'specializationcode',
                    as: 'specializationlist'
                }
            },
            { $unwind: '$specializationlist' },
            { $unwind: '$specializationlist.specialization' },
            { $match: { "specializationlist.specialization.languagecode": objConstants.defaultlanguagecode } },
            {
                $lookup:
                {
                    from: String(MongoDB.EduCategoryCollectionName),
                    localField: 'educationcategorycode',
                    foreignField: 'educationcategorycode',
                    as: 'categorylist'
                }
            },
            { $unwind: '$categorylist' },
            { $unwind: '$categorylist.educationcategory' },
            { $match: { "categorylist.educationcategory.languagecode": objConstants.defaultlanguagecode } },
            {
                $group:
                {
                    _id: {
                        educationcategorycode: "$educationcategorycode", specializationcode: "$specializationcode",
                        specializationname: "$specializationlist.specialization.specializationname", educationcategoryname: "$categorylist.educationcategory.educationcategoryname"
                    },
                    qualificationcode: { $addToSet: "$qualificationcode" },
                }
            },
            {
                $project: {
                    _id: 0, specializationcode: "$_id.specializationcode", educationcategorycode: '$_id.educationcategorycode',
                    specializationname: '$_id.specializationname', educationcategoryname: '$_id.educationcategoryname', qualificationcode: '$qualificationcode'
                }
            }]).toArray(function (err, result) {
                finalresult = result;
                ////console.log(result);
                return callback(finalresult);
            });

    }
    catch (e) {
        logger.error("Error in Specialization Edit load- Mapping" + e);
    }
}
exports.QualificationEditLoad = function (logparams,req, callback) {
    try {
        logger.info("Log in checking Qulification Edit load: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "qualificationcode": Number(req.body.qualificationcode), "educationcategorycode":Number(req.body.educationcategorycode)};
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).aggregate([
            { $match: params },
            {
                $lookup:
                {
                    from: String(MongoDB.QualificationCollectionName),
                    localField: 'qualificationcode',
                    foreignField: 'qualificationcode',
                    as: 'qualificationlist'
                }
            },
            { $unwind: '$qualificationlist' },
            {
                $lookup:
                {
                    from: String(MongoDB.EduCategoryCollectionName),
                    localField: 'educationcategorycode',
                    foreignField: 'educationcategorycode',
                    as: 'categorylist'
                }
            },
            { $unwind: '$categorylist' },
            { $unwind: '$categorylist.educationcategory' },
            { $match: { "categorylist.educationcategory.languagecode": objConstants.defaultlanguagecode } },
            {
                $group:
                {
                    _id: {
                        educationcategorycode: "$educationcategorycode", qualificationcode: "$qualificationcode",
                        qualificationname: "$qualificationlist.qualificationname", educationcategoryname: "$categorylist.educationcategory.educationcategoryname"
                    },
                    specializationcode: { $addToSet: "$specializationcode" },
                }
            },
            {
                $project: {
                    _id: 0, qualificationcode: "$_id.qualificationcode", educationcategorycode: '$_id.educationcategorycode',
                    qualificationname: '$_id.qualificationname', educationcategoryname: '$_id.educationcategoryname', specializationcode: '$specializationcode'
                }
            }]).toArray(function (err, result) {
                finalresult = result;
                ////console.log(result);
                return callback(finalresult);
            });

    }
    catch (e) {
        logger.error("Error in Qualification Edit load- Mapping" + e);
    }
}