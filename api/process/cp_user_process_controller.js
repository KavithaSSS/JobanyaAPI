'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
//const { defaultstatuscode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const objUtilities = require('../controller/utilities');
var dbcollectionname = MongoDB.UserCollectionName;
var dbdesignationcollectionname = MongoDB.DesignationCollectionName;
var dbuserrolecollectionname = MongoDB.UserRoleCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['usercode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].usercode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - User" + e); }
}
exports.checkUserNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking user name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "username": { $regex: "^" + req.body.username + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking user name - User" + e); }
}
exports.checkUserCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking user code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "usercode": parseInt(req.query.editusercode) }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking user code - user" + e); }
}
exports.checkUserNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking user name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        // var regex = new RegExp("^" + req.body.username.toLowerCase(), "i");
        dbo.collection(String(dbcollectionname)).find({  "username": { $regex: "^" + req.body.username + "$", $options: 'i' }, "usercode": { $ne: parseInt(req.query.editusercode) } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking user name by code - user" + e); }
}
exports.InsertUserDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in user create: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - User" + e); }
}
exports.updateUserDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in user update by user Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "usercode": params.usercode }, { $set: params},function (err, res) {
                if (err) throw err;
                finalresult = res.lastErrorObject.updatedExisting;
                ////console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - User" + e); }
}
exports.deleteUserDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in user Delete by user Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "usercode": parseInt(params.usercode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
             ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - user" + e); }
}
exports.getUserSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in user List by user Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "usercode": parseInt(params.query.editusercode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - user" + e); }
}
exports.getUserSingleRecordDetails_Login = function (logparams, params, callback) {
    try {
        logger.info("Log in user login by user Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // //console.log(params);
        dbo.collection(String(dbcollectionname)).aggregate([
            { $match: { username: params.username, password: params.password } },
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
                $lookup:
                {
                    from: String(dbdesignationcollectionname),
                    localField: 'designationcode',
                    foreignField: 'designationcode',
                    as: 'designation'
                }
            },
            { $unwind: '$designation' },
            {
                $lookup:
                {
                    from: String(dbuserrolecollectionname),
                    localField: 'userrolecode',
                    foreignField: 'userrolecode',
                    as: 'userrole'
                }
            },
            { $unwind: '$userrole' },
            {
                $project: {
                    _id: 0, lastlogindate:1, usercode: 1, password: params.actpwd, nameoftheuser: 1, userrolecode: 1, userrolename: '$userrole.userrolename', designationcode: 1, designationname: '$designation.designationname', username: 1, statuscode: 1, statusname: '$status.statusname'
                }
            }
        ]).toArray(function (err, result) {
            // //console.log(result);
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for login - user" + e); }
}
exports.getUserSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in user List by user Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = "";
        dbo.collection(String(dbcollectionname)).aggregate([
            { $match: { usercode: parseInt(params.usercode) } },
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
                $lookup:
                {
                    from: String(dbuserrolecollectionname),
                    localField: 'userrolecode',
                    foreignField: 'userrolecode',
                    as: 'userrole'
                }
            },
            { $unwind: '$userrole' },
            {
                $lookup:
                {
                    from: String(dbdesignationcollectionname),
                    localField: 'designationcode',
                    foreignField: 'designationcode',
                    as: 'designation'
                }
            },
            { $unwind: '$designation' },
            {
                $project: {
                    _id: 0, usercode: 1, nameoftheuser: 1, userrolecode: 1, designationcode: 1, username: 1, password: 1, statuscode: 1, userrolename: '$userrole.userrolename',
                    designationname: '$designation.designationname', statusname: '$status.statusname'
                }
            }
        ]).toArray(function (err, result) {
            //console.log(result);
            if (result != null && result.length > 0) {
                // //console.log(result);
                objUtilities.decryptpassword(logparams, result[0].password, function (respassword) {
                    result[0].password = respassword;
                    finalresult = result;
                    // //console.log(finalresult);
                    return callback(finalresult);
                });

            }
            else {
                return callback(finalresult);
            }
            ////console.log(finalresult);

        });
    }
    catch (e) { logger.error("Error in single record details for edit - user" + e); }
}
exports.getFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        dbo.collection(String(dbdesignationcollectionname)).aggregate([
            { $match: { statuscode: objConstants.activestatus } },
            {
                $sort: {
                    designationname: 1
                }
            },
            {
                $project: { _id: 0, designationcode: 1, designationname: 1 }
            }
        ]).toArray(function (err, result) {
            dbo.collection(String(dbuserrolecollectionname)).aggregate([
                { $match: { statuscode: objConstants.activestatus } },
                {
                    $sort: {
                        userrolename: 1
                    }
                },
                {
                    $project: { _id: 0, userrolecode: 1, userrolename: 1 }
                }
            ]).toArray(function (err, resultnext) {
                finalresult.push(result);
                finalresult.push(resultnext);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in List - user" + e); }
}
exports.getUserList = function (logparams, params, callback) {
    try {
        logger.info("Log in user List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        if (params.statuscode == 0) {
            dbo.collection(String(dbcollectionname)).aggregate([

                { $match: { statuscode: parseInt(params.statuscode), statuscode: { $ne: objConstants.deletestatus } } },
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
                    $lookup:
                    {
                        from: String(dbdesignationcollectionname),
                        localField: 'designationcode',
                        foreignField: 'designationcode',
                        as: 'designation'
                    }
                },
                { $unwind: '$designation' },
                {
                    $lookup:
                    {
                        from: String(dbuserrolecollectionname),
                        localField: 'userrolecode',
                        foreignField: 'userrolecode',
                        as: 'userrole'
                    }
                },
                { $unwind: '$userrole' },
                {
                    $sort: {
                        createddate: -1
                    }
                },
                {
                    $project: {
                        _id: 0, usercode: 1, nameoftheuser: 1, userrolename: '$userrole.userrolename', designationname: '$designation.designationname', username: 1, statuscode: 1, status: '$status.statusname'
                    }
                }

            ]).toArray(function (err, result) {
                finalresult = result;
                return callback(finalresult);
            });
        }
        else {
            dbo.collection(String(dbcollectionname)).aggregate([
                { $match: { statuscode: parseInt(params.statuscode) } },
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
                    $lookup:
                    {
                        from: String(dbdesignationcollectionname),
                        localField: 'designationcode',
                        foreignField: 'designationcode',
                        as: 'designation'
                    }
                },
                { $unwind: '$designation' },
                {
                    $lookup:
                    {
                        from: String(dbuserrolecollectionname),
                        localField: 'userrolecode',
                        foreignField: 'userrolecode',
                        as: 'userrole'
                    }
                },
                { $unwind: '$userrole' },
                {
                    $project: {
                        _id: 0, usercode: 1, nameoftheuser: 1, userrolename: '$userrole.userrolename', designationname: '$designation.designationname', username: 1, statuscode: 1, status: '$status.statusname'
                    }
                }
            ]).toArray(function (err, result) {
                finalresult = result;
                return callback(finalresult);
            });
        }
    }
    catch (e) { logger.error("Error in List - user" + e); }
}
// exports.getUserRecordDetails = function (logparams, req, callback) {
//     try {
//         logger.info("Log in user List by user Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
//         const dbo = MongoDB.getDB();
//         var finalresult;
//         dbo.collection(MongoDB.UserCollectionName).find({ "username": parseInt(req.query.username) }).toArray(function (err, result) {
//             finalresult = result;
//             //console.log(finalresult);
//             return callback(finalresult);
//         });
//     }
//     catch (e) { logger.error("Error in single record details - user" + e); }
// }