const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
var objConstant = require('../../config/constants');
var dblogcollectionname = MongoDB.LogCollectionName;
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.SpecializationCollectionName).find().sort([['specializationcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].specializationcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - Specialization " + e); }
}
exports.checkSpecializationNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking specialization name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        checkSpecializationName(req.body.specialization, req.body.educationcategorycode, function (err, specializationcount) {
            if (err) {
                return;
            }
            return callback(specializationcount);
        });
    }
    catch (e) { logger.error("Error in checking specialization name - specialization" + e); }
}
var async = require('async');
function checkSpecializationName(specializationListObj, educationcodeobj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var temparray = [];
        // var params={"groupcode":Number(req.body.groupcode)};
        var iteratorFcn = function (specializationObj, done) {
            // //console.log(educationcodeobj);
            if (!specializationObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + specializationObj.specializationname.toLowerCase(), "i");
            dbo.collection(MongoDB.SpecializationCollectionName).find({ specialization: { $elemMatch: { languagecode: specializationObj.languagecode, specializationname: { $regex: "^" + specializationObj.specializationname + "$", $options: 'i' } } }, educationcategorycode: { $in: educationcodeobj } }).count(function (err, res) {
                // //console.log(res)
                if (err) {
                    done(err);
                    return;
                }
                if (res == 0) {
                    var Specializationname = specializationObj.specializationname;
                    temparray.push(Specializationname);
                }
                // //console.log(Specializationname);
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, temparray);
        };
        async.forEach(specializationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking specialization name - specialization" + e); }
}
exports.InsertSpecializationDetails = function (logparams, params, callback) {
    try {
        ////console.log("entry")
        logger.info("Log in specialization create by specialization Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.SpecializationCollectionName).insertMany(params, function (err, res) {
            if (err)
                throw err;
            ////console.log(res.insertedCount);
            return callback(res.insertedCount);
        });
    }
    catch (e) { logger.error("Error in create - specialization" + e); }
}
exports.InsertGroupLog = function (logparams, callback) {
    try {
        logger.info("Log in get Group Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.SpecializationCollectionName).find().sort([['groupcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].groupcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Group Code - specialization " + e); }
}
exports.FindGroupcode = function (logparams, req, callback) {
    try {
        logger.info("Log in get Group Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.SpecializationCollectionName).find({ "groupcode": {$in:req.body.groupcode} }, { projection: { _id: 0, specializationcode: 1 } }).toArray(function (err, result) {
            var specialization = [];
            var code = result;
            if (code != null && code.length > 0) {
                for (var i = 0; i <= code.length - 1; i++) {
                    specialization.push(code[i].specializationcode);
                }
            }
            ////console.log(specialization);
            return callback(specialization);
        });

    }
    catch (e) {
        { logger.error("Error in Find Group Code - specialization " + e); }
    }
}
exports.SpecializationcodeExistsInMapping = function (logparams, specialization, callback) {
    try {
        logger.info("Log in get Specialization Code Exists In mapping : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        checkSpecializationInmapping(specialization, function (err, specializationcount) {
            if (err) {
                return;
            }
            ////console.log(specializationcount)
            return callback(specializationcount);
        })
    }
    catch (e) {
        { logger.error("Error in Specialization Code Exists In mapping- specialization " + e); }
    }
}
function checkSpecializationInmapping(specializationcodeobj, callback) {
    try {
        var finalresult = 0;
        const dbo = MongoDB.getDB();
        var dbmappingcollectionname = MongoDB.Quali_Spec_MappingCollectionName;
        var iteratorFcn = function (specializationObj, done) {
            dbo.collection(dbmappingcollectionname).find({ "specializationcode": specializationObj }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                finalresult = finalresult + result;
                done();
                return;
            });
        }
        var doneIteratingFcn = function (err) {
            ////console.log(finalresult);
            callback(err, finalresult);
        };
        async.forEach(specializationcodeobj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking specialization code - specialization" + e); }
}
exports.Findspecializationcode = function (logparams, specialization, callback) {
    try {
        logger.info("Log in get Specialization Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        checkSpecializationCode(specialization, function (err, specializationcount) {
            if (err) {
                return;
            }
            ////console.log(specializationcount)
            return callback(specializationcount);
        })
    }
    catch (e) {
        { logger.error("Error in Find Specialization Code - specialization " + e); }
    }
}
function checkSpecializationCode(specializationcodeobj, callback) {
    try {
        var finalresult = [];
        var deletecode;
        const dbo = MongoDB.getDB();
        var dbmappingcollectionname = MongoDB.Quali_Spec_MappingCollectionName;
        var iteratorFcn = function (specializationObj, done) {
            // //console.log(specializationObj);
            dbo.collection(dbmappingcollectionname).find({ "specializationcode": specializationObj }).count(function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                if (result == 0) {
                    deletecode = specializationObj;
                    finalresult.push(deletecode);
                }
                done();
                return;
            });
        }
        var doneIteratingFcn = function (err) {
            ////console.log(finalresult);
            callback(err, finalresult);
        };
        async.forEach(specializationcodeobj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking specialization code - specialization" + e); }
}
exports.DeleteSpecialization = function (logparams, params, callback) {
    try {
        logger.info("Log in Delete specialization: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        ////console.log(params)
        // db.tbl_cp_specialization.remove( { _id : { $in: ['specializationcode':5,'specializationcode':6] } } );
        dbo.collection(MongoDB.SpecializationCollectionName).remove({ specializationcode: { $in: params } }, function (err, res) {
            if (err) {
                finalresult = false;
                throw err;
            }
            else {
                finalresult = true;
            }
            return callback(finalresult);
        });
    }
    catch (e) {
        { logger.error("Error in Delete Specialization - specialization " + e); }
    }
}
exports.SpecializationFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { statuscode: parseInt(objConstant.activestatus) }
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
                { $unwind: '$educationcategory'},
                { $match: { "statuscode": parseInt(objConstant.activestatus), "educationcategory.languagecode": parseInt(objConstant.defaultlanguagecode) } },
                {
                    $sort: {
                        ordervalue: 1
                    }
                },
                {
                    $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1 , ordervalue:1}
                }
            ]).toArray(function (err, educationresult) {

                finalresult = {
                    "languagelist": languageresult,
                    "categorylist": educationresult
                }
                return callback(finalresult);
            });
        });
        
    }
    catch (e) { logger.error("Error in form load list - Specialization " + e); }
}
exports.SpecializationEditload = function (logparams, req, callback) {
    try {
        logger.info("Log in Edit Load: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { groupcode:{$in:req.body.groupcode} };
        dbo.collection(MongoDB.SpecializationCollectionName).aggregate(
            [
                { $match: params },
                {
                    $group:
                    {
                        _id: { specialization: "$specialization", statuscode: '$statuscode' },
                        specializationcode: { $addToSet: "$specializationcode" },
                        educationcategorycode: { $addToSet: "$educationcategorycode" },
                        groupcode: { $addToSet: "$groupcode" }
                    }
                },
                {
                    $project: { _id: 0, groupcode: "$groupcode", specialization: "$_id.specialization", statuscode: '$_id.statuscode', specializationcode: '$specializationcode', educationcategorycode: '$educationcategorycode' }
                }
            ]).toArray(function (err, result) {
                ////console.log(result);
                if (err) throw err;
                if (result != null) {
                    finalresult = result;
                }
                ////console.log(finalresult);
                return callback(finalresult);
            });
    }
    catch (e) { logger.error("Error in Edit load list - Specialization " + e); }
}
exports.SpecializationList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in specialization List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // if (parseInt(params.statuscode) == 0) { var condition = { 'specialization.languagecode': objConstant.defaultlanguagecode, "statuscode": { $ne: objConstant.deletestatus } }; }
        // else { var condition = { 'specialization.languagecode': objConstant.defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstant.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"specialization.languagecode": parseInt(params.languagecode) };
        }
        dbo.collection(MongoDB.SpecializationCollectionName).aggregate([

            {
                $addFields: {
                    selectedcount: {
                        $size: "$specialization"
                    },
                    langstatus: { $toInt: { $eq: [{ $size: "$specialization" }, langcount] } },
                }
            },
            { $unwind: '$specialization' },
            { $match: {$and:[statuscondition,languagecondition]} },
            {
                $lookup:
                {
                    from: String(MongoDB.EduCategoryCollectionName),
                    localField: 'educationcategorycode',
                    foreignField: 'educationcategorycode',
                    as: 'categorycode'
                }
            },
            { $unwind: '$categorycode' },
            { $unwind: '$categorycode.educationcategory' },
            { $match: { "categorycode.educationcategory.languagecode": objConstant.defaultlanguagecode } },
            {
                $lookup:
                {
                    from: String(MongoDB.StatusCollectionName),
                    localField: 'statuscode',
                    foreignField: 'statuscode',
                    as: 'status'
                }
            },
            { $unwind: '$status' },
            {
                $sort: {
                    createddate: -1,specializationcode:1
                }
            },
            {
                $group:
                {
                    _id: {specializationname: "$specialization.specializationname",languagecode: '$specialization.languagecode', statuscode: '$statuscode', statusname: "$status.statusname", language_count_status: "$langstatus", selected_language_count: "$selectedcount" },
                    educationcategoryname: { $addToSet: "$categorycode.educationcategory.educationcategoryname" },
                    groupcode: { $addToSet: "$groupcode" },specializationcode: { $addToSet: "$specializationcode" }
                }
            },
            {
                $project: {
                    _id: 0, groupcode: "$groupcode", statuscode: '$_id.statuscode', statusname: '$_id.statusname', educationcategoryname: '$educationcategoryname',
                    specializationname: '$_id.specializationname',specializationcode: '$specializationcode',languagecode: '$_id.languagecode', language_count_status: "$_id.language_count_status", selected_language_count: "$_id.selected_language_count"
                }
            }]).toArray(function (err, result) {
                finalresult = result;
                ////console.log(result);
                return callback(finalresult);
            });
    }
    catch (e) {
        { logger.error("Error in list - Specialization " + e); }
    }

}
exports.Duplicatecheck = function (logparams, req, callback) {
    try {
        logger.info("Log in Duplicate check : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        SpeclializationDuplicate(req.body.specialization, req.body.groupcode, function (err, specializationcount) {
            if (err) {
                return;
            }
            return callback(specializationcount);
        });
    }
    catch (e) { logger.error("Error in Duplicate check - specialization" + e); }
}
function SpeclializationDuplicate(specializationListobj, groupobj, callback) {
    try {
        var totalcount = 0;
        // var templist;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (specializationObj, done) {
            // //console.log(specializationObj.specializationname);
            //console.log(groupobj);
            if (!specializationObj.languagecode) {
                done();
                return;
            }
            // var regex = new RegExp("^" + specializationObj.specializationname.toLowerCase(), "i");
            dbo.collection(MongoDB.SpecializationCollectionName).find({ specialization: { $elemMatch: { specializationname: { $regex: "^" + specializationObj.specializationname + "$", $options: 'i' }, languagecode: specializationObj.languagecode } }, groupcode: { $nin: groupobj} }).count(function (err, result) {
                //console.log("specialization",result);
                if (err) {
                    done(err);
                    return;
                }
                totalcount = totalcount + result;
                // //console.log(totalcount);
                done();
                return;
            });
        }
        var doneIteratingFcn = function (err) {
            // //console.log(totalcount);
            callback(err, totalcount);
        };
        async.forEach(specializationListobj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in specialization duplicate check - specialization" + e); }
}
exports.UpdateSpecialization = function (logparams, updateitem, req, callback) {
    try {
        ////console.log(updateitem);
        logger.info("Log in Update specialization : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        SingleRecordCheck(updateitem, req, function (err, updatedCount) {
            if (err)
                throw err;
            // //console.log(updatedCount);
            return callback(updatedCount);
        });
    }
    catch (e) { logger.error("Error in Update - specialization" + e); }
}
function SingleRecordCheck(updateitem, req, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (SingleObj, done) {
            // //console.log("Code",SingleObj);
            var groupobj = req.body.groupcode;

            dbo.collection(MongoDB.SpecializationCollectionName).updateOne({ "groupcode": {$in:req.body.groupcode}, "specializationcode": Number(SingleObj.specializationcode) }, { $set: SingleObj }, function (err, result) {
                if (err) {
                    done(err);
                    return;
                }
                // //console.log(result);
                if (result != null) {
                    totalcount = totalcount + (result.modifiedCount==0?result.matchedCount:result.modifiedCount);
                    // //console.log("count",totalcount);
                }
                done();
                return;
            });
        }
        var doneIteratingFcn = function (err) {
            callback(err, totalcount);
        };
        async.forEach(updateitem, iteratorFcn, doneIteratingFcn);

    }
    catch (e) { logger.error("Error in Single Record Check - specialization" + e); }
}

exports.GetSpecializationSingleDetails = function (logparams, req, callback) {
    try {
        logger.info("Log in Specialization Single Record: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "groupcode": {$in:req.body.groupcode} };
        dbo.collection(MongoDB.SpecializationCollectionName).aggregate(
            [
                { $match: params },
                {
                    $group:
                    {
                        _id: 0,
                        specializationcode: { $addToSet: "$specializationcode" },
                        educationcategorycode: { $addToSet: "$educationcategorycode" }
                    }
                },
                {
                    $project: { _id: 0, specializationcode: '$specializationcode', educationcategorycode: '$educationcategorycode' }
                }
            ]).toArray(function (err, result) {
                //console.log("specializationcode",result);
                if (err) throw err;
                if (result != null) {
                    finalresult = result;
                }
                return callback(finalresult);
            });
    }
    catch (e) { logger.error("Error in single record details -Specialization" + e); }
}
exports.CheckspecializationExitingMapping = function (logparams, req, filtered, callback) {
    try {
        logger.info("Log in Specialization Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        Speclializationmapping(req.body.groupcode, filtered, function (err, totalcount) {
            if (err) {
                return;
            }
            return callback(totalcount);
        });

    }
    catch (e) { logger.error("Error in Code -Specialization" + e); }
}
function Speclializationmapping(groupobj, filterListobj, callback) {
    try {
        // var totalcount = 0;
        var templist = [];
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (filterObj, done) {
            dbo.collection(MongoDB.SpecializationCollectionName).aggregate([
                { $match: { "groupcode": {$in:groupobj}, "educationcategorycode": filterObj } },
                {
                    $lookup: {
                        from: String(MongoDB.Quali_Spec_MappingCollectionName),
                        localField: 'specializationcode',
                        foreignField: 'specializationcode',
                        as: 'code'
                    }
                },

                { $project: { _id: 0, specializationcode: 1, "count": { "$size": "$code" } } }
            ]).toArray(function (err, result) {
                finalresult = result;
                // //console.log(result);
                if (err) {
                    done(err);
                    return;
                }
                if (finalresult[0].count == 0) {
                    var specialicode = finalresult[0].specializationcode;
                    templist.push(specialicode);
                    // //console.log(templist);
                }
                done();
                return;
            });

        }
        var doneIteratingFcn = function (err) {
            // //console.log(templist);
            callback(err, templist);
        };
        async.forEach(filterListobj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in specialization Mapping checking - specialization" + e); }
}
exports.DeleteSpecializationCode = function (logparams, params, callback) {
    try {
        // //console.log("entry")
        logger.info("Log in Delete specialization: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        // //console.log(params);
        // db.tbl_cp_specialization.remove( { _id : { $in: ['specializationcode':5,'specializationcode':6] } } );
        dbo.collection(MongoDB.SpecializationCollectionName).deleteMany(params, function (err, res) {
            if (err)
                throw err;
            // //console.log(res.deletedCount);
            return callback(res.deletedCount);
        });
    }
    catch (e) {
        { logger.error("Error in Delete Specialization - specialization " + e); }
    }
}
exports.getSpecializationSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in Get single record: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.SpecializationCollectionName).find(params, { projection: { _id: 0, educationcategorycode: 1, specializationcode: 1, specialization: 1, statuscode: 1, createddate: 1 } }).toArray(function (err, result) {
            finalresult = result;
            //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - specialization" + e); }
}