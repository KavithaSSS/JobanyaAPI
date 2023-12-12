'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
exports.WishList = function (logparams,req, callback) {
    try {
        logger.info("Wishlist List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.EmployeeWishListCollectionName).aggregate([
            { $match: { "employercode": Number(req.query.employercode), "jobcode": Number(req.query.jobcode), "statuscode": objConstants.wishlistedstatus } },
            {
                $lookup: {
                    from: String(MongoDB.EmployeeCollectionName),
                    localField: 'employeecode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: "$employeeinfo" },
            {
                $project: {
                    _id: 0, employeecode: 1, employeename: "$employeeinfo.employeename", username: "$employeeinfo.username", mobileno: "$employeeinfo.mobileno",
                    password: "$employeeinfo.password", personalinfo: "$employeeinfo.personalinfo", contactinfo: "$employeeinfo.contactinfo", statuscode: "$employeeinfo.statuscode",
                    fresherstatus: "$employeeinfo.fresherstatus", totalexperience: "$employeeinfo.totalexperience", referenceinfo: "$employeeinfo.referenceinfo",
                    experienceinfo: "$employeeinfo.experienceinfo", schooling: "$employeeinfo.schooling", afterschooling: "$employeeinfo.afterschooling", skills: "$employeeinfo.skills",
                    preferences: "$employeeinfo.preferences"
                }
            }]).toArray(function(err,result){
                ////console.log(result);
                return callback(result);
            })
    }
    catch (e) {
        logger.error("Error in Wishlist List - Employer " + e);
    }
}