'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
var dbcollectionname = MongoDB.UserRoleCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dbuserlist = MongoDB.UserCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code - User Role: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['userrolecode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].userrolecode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - User Role" + e); }
}
exports.checkUserRoleNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking user role name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        // //console.log(req.body.userrolename.toLowerCase());
        // var regex = new RegExp("^" + req.body.userrolename.toLowerCase() + "$");
        dbo.collection(String(dbcollectionname)).find({ "userrolename": { $regex: "^" + req.body.userrolename + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking user role name - User Role" + e); }
}
exports.checkUserRoleCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking user role code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "userrolecode": parseInt(req.query.userrolecode) }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking user role code - user role" + e); }
}
exports.checkUserRoleNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking user role name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "userrolename": { $regex: "^" + req.body.userrolename + "$", $options: 'i' }, "userrolecode": { $ne: parseInt(req.query.userrolecode) } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking user role name by code - user role" + e); }
}
exports.InsertUserRoleDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in user role create: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - User Role" + e); }
}
exports.updateUserRoleDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in user role update by user role Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "userrolecode": parseInt(params.userrolecode) }, { $set: params}, function (err, res) {
                if (err) throw err;
                finalresult = res.lastErrorObject.updatedExisting;
                // //console.log(finalresult);
                return callback(finalresult);
            });
        });

    }
    catch (e) { logger.error("Error in update - User Role" + e); }
}
exports.deleteUserRoleDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in user role Delete by user role Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "userrolecode": parseInt(params.userrolecode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - user role" + e); }
}
exports.checkUserRoleCodeExistsInOthers = function (logparams, req, callback) {
    try {
        logger.info("Log in checking user role in other tables: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbuserlist)).find({ "userrolecode": parseInt(req.query.userrolecode) }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            ////console.log(doc.length);
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking user role in other tables - user role" + e); }
}
exports.getUserRoleSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in user role List by user role Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "userrolecode": parseInt(params.query.userrolecode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - user role" + e); }
}
exports.getUserRoleSingleRecordDetails_Edit = function (logparams, req, callback) {
    try {
        // //console.log("entry")
        logger.info("Log in editform load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { userrolecode: Number(req.query.userrolecode) }
        // //console.log(params);
        dbo.collection(MongoDB.UserRoleCollectionName).aggregate([
            { $unwind: '$menuid' },
            { $match: params },
            {
                $lookup:
                {
                    from: String(MongoDB.MenuCollectionName),
                    localField: 'menuid.menucode',
                    foreignField: 'menucode',
                    as: 'menu'
                }
            },
            { $unwind: '$menu' },
            {
                $group: {
                    "_id": {
                        menucode: '$menu.menucode',
                        menuname: '$menu.menuname',
                        orderval: '$menu.orderval',
                        parentmenucode: '$menu.parentmenucode',
                        access: '$menuid.access',
                        userrolecode: '$userrolecode',
                        userrolename: '$userrolename',
                        statuscode: '$statuscode'
                    }
                }
            },
            {
                $group: {
                    "_id": {
                        userrolecode: "$_id.userrolecode",
                        userrolename: "$_id.userrolename",
                        statuscode: "$_id.statuscode"
                    },
                    menu_list: {
                        "$push": {
                            menucode: "$_id.menucode",
                            menuname: "$_id.menuname",
                            orderval: "$_id.orderval",
                            parentmenucode: "$_id.parentmenucode",
                            access: "$_id.access"
                        },
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    userrolecode: "$_id.userrolecode",
                    userrolename: "$_id.userrolename",
                    statuscode: "$_id.statuscode",
                    menulist: '$menu_list'
                }
            }
        ]).toArray(function (err, result) {
            // //console.log(result);
            if (err) throw err;
            if (result != null) {
                finalresult = result;
            }
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - user role" + e); }
}
exports.getUserRoleList = function (logparams, params, callback) {
    try {
        logger.info("Log in user role List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
                    $sort: {
                        createddate: -1
                    }
                },
                {
                    $project: {
                        _id: 0, userrolecode: 1, userrolename: 1, statuscode: 1, statusname: '$status.statusname'
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
                    $sort: {
                        createddate: -1
                    }
                },
                {
                    $project: {
                        _id: 0, userrolecode: 1, userrolename: 1, statuscode: 1, statusname: '$status.statusname'
                    }
                }
            ]).toArray(function (err, result) {
                finalresult = result;
                return callback(finalresult);
            });
        }
    }
    catch (e) { logger.error("Error in List - user role" + e); }
}
exports.getUserRoleFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { statuscode: parseInt(objConstants.activestatus) }
        dbo.collection(MongoDB.UserRoleCollectionName).aggregate([
            { $match: params },
            {
                $sort: {
                    userrolename: 1
                }
            },
            {
                $project: { _id: 0, userrolecode: 1, userrolename: 1 }
            }
        ]).toArray(function (err, userroleresult) {
            dbo.collection(MongoDB.MenuCollectionName).aggregate([
                { $match: params },
                {
                    $sort: {
                        menuname: 1
                    }
                },
                {
                    $project: { _id: 0, menucode: 1, menuname: 1, parentmenucode: 1, access:1, access_view:1, access_create:1, access_update:1, access_delete:1, access_special:1,access_export:1,orderval:1 }
                }
            ]).toArray(function (err, menuresult) {

                finalresult = {
                    "userrolelist": userroleresult,
                    "menulist": menuresult
                }
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in List - user role" + e); }
}