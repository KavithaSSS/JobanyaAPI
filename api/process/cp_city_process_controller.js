'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
const { defaultstatuscode, defaultlanguagecode } = require('../../config/constants');
var dbcollectionname = MongoDB.CityCollectionName;
var dbstatecollectionname = MongoDB.StateCollectionName;
var dbdistrictcollectionname = MongoDB.DistrictCollectionName;
var dbtalukcollectionname = MongoDB.TalukCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['citycode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].citycode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - city " + e); }
}
exports.checkCityNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking city name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({cityname: req.body.city[0].cityname}, {$exists: true}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkCityName(req.body.city, req.body.districtcode, function (err, stateCount) {
            if (err) {
                return;
            }
            return callback(stateCount);
        });
    }
    catch (e) { logger.error("Error in checking city name - city" + e); }
}
exports.checkCityCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking city code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ citycode: parseInt(req.query.citycode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking city code - city" + e); }
}
exports.checkCityNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking city name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({cityname: req.body.city[0].cityname,citycode:{$ne:req.query.citycode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkCityNameByCode(req.body.city, req.query.citycode, req.body.districtcode, function (err, stateCount) {
            if (err) {
                return;
            }
            return callback(stateCount);
        });
    }
    catch (e) { logger.error("Error in checking city name by code - city" + e); }
}
var async = require('async');
function checkCityName(cityListObj, districtcodeObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (cityObj, done) {
            if (!cityObj.languagecode) {
                done();
                return;
            }

            //var regex = new RegExp("^" + cityObj.cityname.toLowerCase(), "i");
            //dbo.collection(MongoDB.EmployeeCollectionName).find({ username: {$regex:"^"+req.query.username+"$",$options:'i'} }, { $exists: true })
            dbo.collection(String(dbcollectionname)).find({ city: { $elemMatch: { languagecode: cityObj.languagecode, cityname: {$regex:"^"+cityObj.cityname.toLowerCase()+"$",$options:'i'} } }, districtcode: parseInt(districtcodeObj) }).count(function (err, res) {

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
        async.forEach(cityListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking city name - city" + e); }
}
function checkCityNameByCode(cityListObj, citycodeObj, districtcodeobj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (cityObj, done) {
            if (!cityObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + cityObj.cityname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ city: { $elemMatch: { languagecode: cityObj.languagecode, cityname: {$regex:"^"+cityObj.cityname.toLowerCase()+"$",$options:'i'} } }, districtcode: parseInt(districtcodeobj), citycode: { $ne: parseInt(citycodeObj) } }).count(function (err, res) {
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
        async.forEach(cityListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking city name By code - city" + e); }
}

exports.InsertCityDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in city create by city Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - city" + e); }
}
exports.updateCityDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in city update by city Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).replaceOne({ "citycode": parseInt(params.citycode) }, params, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - city" + e); }
}
exports.checkCityCodeExistsInEmployer = function (logparams, params, callback) {
    try {
        logger.info("Log in checking city code in employer: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "contactinfo.citycode": parseInt(params.citycode) }, { $exists: true }).count(function (err, citycount) //find if a value exists
        {
            // //console.log(citycount);
            dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                { "$unwind": "$branch" },
                { $match: { "branch.citycode": Number(params.citycode) } },
            ]).toArray(function (err, citycountbranch)
            {
                return callback(citycount+citycountbranch.length);
            });
            
        });
    }
    catch (e) { logger.error("Error in checking city code in employer  - city" + e); }
}
exports.checkCityCodeExistsInEmployee = function (logparams, params, callback) {
    try {
        logger.info("Log in checking city code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "contactinfo.citycode": parseInt(params.citycode) }, { $exists: true }).count(function (err, citycount) //find if a value exists
        {
            return callback(citycount);
        });
    }
    catch (e) { logger.error("Error in checking city code in employee - city" + e); }
}
exports.checkDistrictCodeExistsInCity = function (logparams, params, callback) {
    try {
        logger.info("Log in checking city code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "citycode": parseInt(params.citycode) }, { projection: { _id: 0, districtcode: 1 } }).toArray(function (err, result) //find if a value exists
        {
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) { logger.error("Error in checking district code in  city" + e); }
}
exports.deleteCityDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in city Delete by city Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "citycode": parseInt(params.citycode) }, function (err, res) {
            if (err)
                throw err;
            ////console.log(res.deletedCount);
            return callback(res.deletedCount);
        });
    }
    catch (e) { logger.error("Error in delete - city" + e); }
}
exports.getCitySingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in city List by city Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "citycode": parseInt(params.query.citycode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - city" + e); }
}
exports.getCitySingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in city List by city Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).aggregate([
            { $match: { "citycode": parseInt(params.citycode) } },
            
            {
                $lookup:
                {
                    from: String(dbtalukcollectionname),
                    localField: 'talukcode',
                    foreignField: 'talukcode',
                    as: 'talukinfo'
                }
            },
            { $unwind: { path: '$talukinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$talukinfo.taluk', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "talukinfo.taluk.languagecode": { $exists: false } }, { "talukinfo.taluk.languagecode": "" }, { "talukinfo.taluk.languagecode": parseInt(defaultlanguagecode) }] } },
            {
                $lookup:
                {
                    from: String(dbdistrictcollectionname),
                    localField: 'talukinfo.districtcode',
                    foreignField: 'districtcode',
                    as: 'talukdistrictinfo'
                }
            },
            { $unwind: { path: '$talukdistrictinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$talukdistrictinfo.district', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "talukdistrictinfo.district.languagecode": { $exists: false } }, { "talukdistrictinfo.district.languagecode": "" }, { "talukdistrictinfo.district.languagecode": parseInt(defaultlanguagecode) }] } },
            
            {
                $lookup:
                {
                    from: String(dbdistrictcollectionname),
                    localField: 'districtcode',
                    foreignField: 'districtcode',
                    as: 'districtinfo'
                }
            },
            { $unwind: '$districtinfo' },
            {
                $project: {
                    _id: 0, citycode: 1, city: 1, statuscode: 1, talukcode: { $ifNull: ['$talukinfo.talukcode', 0] }, districtcode: { $ifNull: ['$talukinfo.districtcode', '$districtinfo.districtcode'] } ,statecode: "$districtinfo.statecode"
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - city" + e); }
}
exports.getCityFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            dbo.collection(String(dbstatecollectionname)).aggregate([
                { $unwind: '$state' },
                { $match: { 'state.languagecode': parseInt(defaultlanguagecode), statuscode: parseInt(objConstants.activestatus) } },
                {
                    $sort: {
                        'state.statename': 1
                    }
                },
                {
                    $project: {
                        _id: 0, statecode: 1, statename: '$state.statename'
                    }
                }
            ]).toArray(function (err, resultnext) {
                dbo.collection(String(dbdistrictcollectionname)).aggregate([
                    { $unwind: '$district' },
                    { $match: { 'district.languagecode': parseInt(defaultlanguagecode), statuscode: parseInt(objConstants.activestatus) } },
                    {
                        $sort: {
                            'district.districtname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, districtcode: 1, districtname: '$district.districtname', statecode: 1
                        }
                    }
                ]).toArray(function (err, distrctresult) {
                    
                    dbo.collection(MongoDB.TalukCollectionName).aggregate([
                        { $unwind: '$taluk' },
                        { $match: { 'taluk.languagecode': parseInt(defaultlanguagecode), statuscode: parseInt(objConstants.activestatus) } },
                        {
                            $sort: {
                                'taluk.talukname': 1
                            }
                        },
                        {
                            $project: {
                                _id: 0, talukcode: 1, talukname: '$taluk.talukname', statecode: 1, districtcode: 1
                            }
                        }
                    ]).toArray(function (err, talukresult) {
                        finalresult.push(languageresult);
                        finalresult.push(resultnext);
                        finalresult.push(distrctresult);
                        finalresult.push(talukresult);
                        return callback(finalresult);
                    });
                   
                });
            });
        });
    }
    catch (e) { logger.error("Error in Fom load - City " + e); }
}
exports.getCityList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in city List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // if (parseInt(params.statuscode) == 0) { var condition = { 'city.languagecode': defaultlanguagecode, "statuscode": { $ne: objConstants.deletestatus } }; }
        // else { var condition = { 'city.languagecode': defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstants.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"city.languagecode": parseInt(params.languagecode) };
        }
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selected_language_count: {
                        $size: "$city"
                    },
                    language_count_status: { $toInt: { $eq: [{ $size: "$city" }, langcount] } },
                }
            },
            { $unwind: '$city' },
            { $match: {$and:[statuscondition,languagecondition]} },
            {
                $lookup:
                {
                    from: String(dbtalukcollectionname),
                    localField: 'talukcode',
                    foreignField: 'talukcode',
                    as: 'talukinfo'
                }
            },
            { $unwind: { path: '$talukinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$talukinfo.taluk', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "talukinfo.taluk.languagecode": { $exists: false } }, { "talukinfo.taluk.languagecode": "" }, { "talukinfo.taluk.languagecode": defaultlanguagecode }] } },
            {
                $lookup:
                {
                    from: String(dbdistrictcollectionname),
                    localField: 'talukinfo.districtcode',
                    foreignField: 'districtcode',
                    as: 'talukdistrictinfo'
                }
            },
            { $unwind: { path: '$talukdistrictinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$talukdistrictinfo.district', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "talukdistrictinfo.district.languagecode": { $exists: false } }, { "talukdistrictinfo.district.languagecode": "" }, { "talukdistrictinfo.district.languagecode": defaultlanguagecode }] } },
            {
                $lookup:
                {
                    from: String(dbdistrictcollectionname),
                    let: { districtcode: "$districtcode" },
                    pipeline: [{ $unwind: '$district' },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$districtcode", "$$districtcode"] },
                                    { $eq: ["$district.languagecode", defaultlanguagecode] }
                                ]
                            }
                        }
                    }],
                    as: 'district'
                }
            },
            { $unwind: '$district' },
            {
                $lookup:
                {
                    from: String(dbstatecollectionname),
                    localField: 'district.statecode',
                    foreignField: 'statecode',
                    as: 'stateinfo'
                }
            },
            { $unwind: '$stateinfo' },
            { $unwind: '$stateinfo.state' },
            { $match: { 'stateinfo.state.languagecode': defaultlanguagecode, "stateinfo.statuscode": objConstants.activestatus } },
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
                    _id: 0, citycode: 1, cityname: "$city.cityname",languagecode: '$city.languagecode', districtcode: 1, talukname: "$talukinfo.taluk.talukname", districtname: { $ifNull: ['$talukdistrictinfo.district.districtname', '$district.district.districtname'] }, statecode: "$stateinfo.statecode", statename: "$stateinfo.state.statename", statuscode: 1, statusname: '$status.statusname', language_count_status: 1, selected_language_count: 1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - City " + e); }
}
