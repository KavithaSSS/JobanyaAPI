'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
const objZohoBook = require('../process/zohobook_razorpay_process_controller');
// const { defaultstatuscode ,defaultlanguagecode} = require('../../config/constants');
var dbcollectionname = MongoDB.JobPackageCollectionName;
var dbplantypecollectionname = MongoDB.planTypeCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbemployercollectionname = MongoDB.EmployerCollectionName;
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['packagecode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].packagecode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - jobpackage " + e); }
}
var async = require('async');
function checkJobPackageName(jobPackageListObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (jobpackageObj, done) {
            if (!jobpackageObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + jobpackageObj.packagename.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ package: { $elemMatch: { languagecode: jobpackageObj.languagecode, packagename: { $regex: "^" + jobpackageObj.packagename.toLowerCase() + "$", $options: 'i' } } } }).count(function (err, res) {
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
        async.forEach(jobPackageListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking Job package Name - Jobpackage" + e); }
}
function checkJobPackageNameByCode(jobPackageListObj, packagecodeObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (jobpackageObj, done) {
            if (!jobpackageObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + jobpackageObj.packagename.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ package: { $elemMatch: { languagecode: jobpackageObj.languagecode, packagename: { $regex: "^" + jobpackageObj.packagename.toLowerCase() + "$", $options: 'i' } } }, packagecode: { $ne: packagecodeObj } }).count(function (err, res) {
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
        async.forEach(jobPackageListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking Job package Name by code - Jobpackage" + e); }
}
exports.checkJobPackageExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job package name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        checkJobPackageName(req.body.package, function (err, packagecount) {
            if (err) {
                return;
            }
            return callback(packagecount);
        });
    }
    catch (e) { logger.error("Error in checking  job package name -  job package" + e); }
}
exports.checkJobPackageExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job package name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        checkJobPackageNameByCode(req.body.package, parseInt(req.query.packagecode), function (err, packagecount) {
            if (err) {
                return;
            }
            return callback(packagecount);
        });
    }
    catch (e) { logger.error("Error in checking job package name by code - job package" + e); }
}
exports.checkpackagecodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking job package code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ packagecode: parseInt(req.query.packagecode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking job package code - job package" + e); }
}
exports.InsertJobPackageDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in JobPackage create by JobPackage Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).insertOne(params, function (err, res) {
                if (err) throw err;
                finalresult = res.insertedCount; 
                //  console.log(res.ops[0].packagecode,'finalresult')
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in create - JobPackage" + e); }
}
exports.updateJobPackageDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in JobPackage update by JobPackage Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "packagecode": parseInt(params.packagecode) }, { $set: params}, function (err, res) {
                if (err) throw err;
                finalresult = res.lastErrorObject.updatedExisting;
                ////console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - JobPackage" + e); }
}
exports.deleteJobPackageDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in JobPackage Delete by JobPackage Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "packagecode": parseInt(params.packagecode) }, function (err, res) {
            if (err) throw err;  
            finalresult = res.deletedCount;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - JobPackage" + e); }
}
exports.getJobPackageSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in JobPackage List by JobPackage Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "packagecode": parseInt(params.query.packagecode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - JobPackage" + e); }
}
exports.getJobPackageSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in JobPackage List by JobPackage Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // //console.log(params.packagecode)
        dbo.collection(String(dbcollectionname)).aggregate([
            { $match: { "packagecode": parseInt(params.packagecode) } },
            { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employer.employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: { path: '$employerinfo', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    "_id": {
                        "packagecode": '$packagecode', "package": '$package', "packagevalidity": '$packagevalidity', "price": '$price', "allowedposts": '$allowedposts', "jobvalidity": '$jobvalidity', "allowedvacancies": '$allowedvacancies',
                        "allowedprofiles_view": '$allowedprofiles_view', "allowedprofiles_shortlist": '$allowedprofiles_shortlist', "allowedcandidates_jobpost": '$allowedcandidates_jobpost', "allowedcandidates_employer": '$allowedcandidates_employer',"timesavailed": '$timesavailed', "plantypecode": '$plantypecode', "statuscode": '$statuscode'
                    }, "employerlist": { "$push": { "employercode": '$employer.employercode', "employername": '$employerinfo.registeredname', "appliedon": '$employer.appliedon' } }
                }
            },
            {
                "$project": {
                    _id: 0,
                    "packagecode": '$_id.packagecode', "package": '$_id.package', "packagevalidity": '$_id.packagevalidity', "price": '$_id.price', "allowedposts": '$_id.allowedposts', "jobvalidity": '$_id.jobvalidity', "allowedvacancies": '$_id.allowedvacancies',
                    "allowedprofiles_view": '$_id.allowedprofiles_view', "allowedprofiles_shortlist": '$_id.allowedprofiles_shortlist', "allowedcandidates_jobpost": '$_id.allowedcandidates_jobpost', "allowedcandidates_employer": '$_id.allowedcandidates_employer',"timesavailed": '$_id.timesavailed', "plantypecode": '$_id.plantypecode', "statuscode": '$_id.statuscode', "employerlist": '$employerlist'
                }
            }
        ]).toArray(function (err, result) {
            ////console.log(result);
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - JobPackage" + e); }
}
exports.getJobPackageList = function (logparams, params, langcount, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in JobPackage List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        // if (parseInt(params.statuscode) == 0) { var condition = { 'package.languagecode': objConstants.defaultlanguagecode, statuscode: { $ne: objConstants.deletestatus } }; }
        // else { var condition = { 'package.languagecode': objConstants.defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstants.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"package.languagecode": parseInt(params.languagecode) };
        }
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selected_language_count: {
                        $size: "$package"
                    },
                    language_count_status: { $toInt: { $eq: [{ $size: "$package" }, langcount] } },
                }
            },
            { $unwind: '$package' },
            { $match: {$and:[statuscondition,languagecondition]} },
            {
                $lookup:
                {
                    from: String(dbstatuscollectionname),
                    localField: 'statuscode',
                    foreignField: 'statuscode',
                    as: 'statusname'
                }
            },
            { $unwind: '$statusname' },
            {
                $lookup:
                {
                    from: String(dbplantypecollectionname),
                    localField: 'plantypecode',
                    foreignField: 'plantypecode',
                    as: 'plantype'
                }
            },
            { $unwind: '$plantype' },
            {
                $sort: {
                    createddate: -1
                }
            },
            {
                $project: {
                    _id: 0, packagecode: 1, plantypecode: 1, plantypename: '$plantype.plantypename',
                    languagecode: '$package.languagecode', price: 1, packagename: '$package.packagename',
                     statuscode: 1, statusname: '$statusname.statusname', language_count_status: 1, 
                     selected_language_count: 1,zohoitemcode:1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in JobPackage List: " + e); }

}
exports.getJobPackageFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            dbo.collection(String(dbplantypecollectionname)).aggregate([
                { $match: { statuscode: parseInt(objConstants.activestatus) } },
                {
                    $sort: {
                        plantypename: 1
                    }
                },
                {
                    $project: { _id: 0, plantypecode: 1, plantypename: 1 }
                }
            ]).toArray(function (err, plantyperesult) {
                dbo.collection(String(dbemployercollectionname)).aggregate([
                    { $match: { statuscode: parseInt(objConstants.activestatus) } },
                    {
                        $sort: {
                            registeredname: 1
                        }
                    },
                    {
                        $project: { _id: 0, employercode: 1, registeredname: 1 }
                    }
                ]).toArray(function (err, employerresult) {
                    finalresult.push(languageresult);
                    finalresult.push(plantyperesult);
                    finalresult.push(employerresult);
                    return callback(finalresult);
                });
            });
        });
    }
    catch (e) { logger.error("Error in List - Job Package " + e); }
}


//Create zoho book item
exports.createzohobookitem = function (insertparams, callback) {
    try { 
        const params = { price: parseInt(insertparams.price), package:insertparams.package};
        objZohoBook.insertJobPackageAsItem(params, insertparams.zohocode, function (zohoresponse) {
            if(zohoresponse){ 
                return callback(zohoresponse);
            } 
        });
    }
    catch (e) {
        logger.error("Error in PDF Generatoe : Employee" + e);
    }
}
//Update zoho item code in job package
exports.updateJobPackageZohoItemCode = function ( params,packagecode, callback) {
    try {  
        const dbo = MongoDB.getDB();
        var finalresult; 
            dbo.collection(String(dbcollectionname)).findOneAndUpdate
            ({ "packagecode": parseInt(packagecode) }, { $set: params}, function (err, res) {
                if (err) { throw err;}
                //  console.log(res,'res');
                finalresult = res.lastErrorObject.updatedExisting; 
                return callback(finalresult);
            }); 
    }
    catch (e) {console.log(e,"error"); logger.error("Error in update - JobPackage" + e); }
}
//Update zoho book item
exports.updatezohobookitem = function (insertparams, callback) {
    try { 
        const params = { price: parseInt(insertparams.price), package:insertparams.package};
        objZohoBook.updateJobPackageAsItem(params, insertparams.zohocode,insertparams.zohoitemcode, function (zohoresponse) {
            if(zohoresponse){ 
                return callback(zohoresponse);
            } 
        });
    }
    catch (e) {
        logger.error("Error in PDF Generatoe : Employee" + e);
    }
}
