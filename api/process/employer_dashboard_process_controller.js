'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const { param } = require('../controller');
const Logger = require('../services/logger_service');
const logger = new Logger('logs');
const objConstants = require('../../config/constants');

// exports.getEmployerDashboardList= function (logparams, empparams, callback) {
//     try 
//     {
//         logger.info("Log in Admin Dashboard List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
//         const dbo = MongoDB.getDB();
//         var finalresult;
//         var date = new Date(); // some mock date
//         var milliseconds = date.getTime();
//         ////console.log(parseFloat(req.query.todate));
//         dbo.collection(String(MongoDB.JobPostsCollectionName)).find({"$and": [{"statuscode": objConstants.approvedstatus}, {"employercode":Number(empparams.employercode)}, {"validitydate": {$gte: milliseconds}}]}).count(function (err, activejobsresult) {
//             dbo.collection(String(MongoDB.JobPackageSubscriptionCollectionName)).aggregate([
//                 {$match: {"employercode":Number(empparams.employercode), "statuscode": objConstants.activestatus}},
//                 {$group: { _id: {employercode: '$employercode'}, "totcount": {$sum: '$allowedposts'}}},
//                 {$project: {_id:0, employercode: '$_id.employercode', "totcount": '$totcount'}}
//                 ]).toArray(function (err, totalresult) {
//                     dbo.collection(String(MongoDB.JobPostsCollectionName)).aggregate([
//                         {$match: {"employercode": Number(empparams.employercode)}},
//                         {$group: { _id: {employercode: '$employercode'}, "jobcode": {$addToSet: '$jobcode'}}},
//                         {$project: {_id:0, employercode: '$_id.employercode', "totcount": {"$size": '$jobcode'}}}
//                         ]).toArray(function (err, usedresult) {
//                             dbo.collection(String(MongoDB.ControlsCollectionName)).find({}, { projection: { _id: 0, jobsexpirydays: 1 } }).toArray(function (err, controlresult) {
//                                 var expirydays = 0;
//                                 if (controlresult != null && controlresult.length > 0)
//                                 {
//                                     expirydays = controlresult[0].jobsexpirydays;
//                                 }
//                                 dbo.collection(String(MongoDB.JobPostsCollectionName)).aggregate([
//                                     {$match: {"$and": [{"employercode": Number(empparams.employercode)},{"statuscode": objConstants.approvedstatus}, {"validitydate": {$gte: milliseconds}}]}},
//                                     {$project: {_id:0, "employercode": '$employercode', jobcode: '$jobcode', "daysleft": {$trunc: { "$divide": [{ "$subtract": ["$validitydate", milliseconds] },60 * 1000 * 60 * 24]}}}},
//                                     //{$match: {"daysleft": {$gte: expirydays}}},
//                                     {$group: { _id: {employercode: '$employercode'}, "jobcode": {$addToSet: '$jobcode'}}},
//                                     {$project: {_id: 0, count: {"$size": '$jobcode'}}}
//                                     ]).toArray(function (err, expiredresult) {
//                                         console.log('activejobsresult',activejobsresult);
//                                         console.log('usedresult',usedresult);
//                                         console.log('totalresult',totalresult);
//                                         console.log('expiredresult',expiredresult);
//                                         if (activejobsresult == null)
//                                         {
//                                             activejobsresult = 0;
//                                         }
//                                         var usedcount = 0, usedresultcount = 0, expirycount = 0;
//                                         if (usedresult != null && usedresult.length > 0 )
//                                         {
//                                             usedresultcount = usedresult[0].totcount;
//                                         }
//                                         if (totalresult != null && totalresult.length > 0 )
//                                         {
//                                             usedcount = totalresult[0].totcount - usedresultcount;
//                                         }
//                                         if (expiredresult != null && expiredresult.length > 0 && expiredresult[0].count!= null)
//                                         {
//                                             expirycount = expiredresult[0].count;
//                                         }
//                                         console.log('activecount',activejobsresult);
//                                         console.log('usedresultcount',usedresultcount);
//                                         console.log('usedcount',usedcount);
//                                         console.log('expirycount',expirycount);
//                                         finalresult = {
//                                             "activecount": activejobsresult,
//                                             "availablecount": usedcount,
//                                             "expirysooncount": expirycount
//                                         }
//                                         return callback(finalresult);

//                         });       
//                     });
//                 });
//             });
//         });
        
        
//     }
//     catch (e) { logger.error("Error in Admin Dashboard List " + e); }
//   }

exports.getEmployerDashboardList= function (logparams, empparams, callback) {
    try 
    {
        logger.info("Log in Admin Dashboard List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        ////console.log(parseFloat(req.query.todate));
        dbo.collection(String(MongoDB.JobPostsCollectionName)).find({"$and": [{"statuscode": objConstants.approvedstatus}, {"employercode":Number(empparams.employercode)}, {"validitydate": {$gte: milliseconds}}]}).count(function (err, activejobsresult) {
            // dbo.collection(String(MongoDB.JobPostsCollectionName)).aggregate([
            //     {$match: {"$and": [{"statuscode": objConstants.approvedstatus}, {"employercode":Number(empparams.employercode)}, {"validitydate": {$gte: milliseconds}}]}},
            //     {$group: { _id: {employercode: '$employercode'}, "totcount": {$sum: '$subscriptiondetails.jobposts'}}},
            //     {$project: {_id:0, employercode: '$_id.employercode', "totcount": '$totcount'}}
            //     ]).toArray(function (err, totalresult) {
                    dbo.collection(String(MongoDB.JobPackageSubscriptionCollectionName)).aggregate([
                        {$match: {"employercode":Number(empparams.employercode), "statuscode": objConstants.activestatus,"expirydate": {$gte: milliseconds}}},
                        {$group: { _id: {employercode: '$employercode'}, "totcount": {$sum: '$allowedposts'}}},
                        {$project: {_id:0, employercode: '$_id.employercode', "totcount": '$totcount'}}
                        ]).toArray(function (err, totalresult) {
                    // dbo.collection(String(MongoDB.JobPostsCollectionName)).find({"$and": [{"statuscode": objConstants.approvedstatus}, 
                    //     {"employercode":Number(empparams.employercode)}, {"validitydate": {$lt: milliseconds}}]}).count(function (err, usedresult) {
                    dbo.collection(String(MongoDB.JobPostsCollectionName)).aggregate([
                        {$match: {"employercode": Number(empparams.employercode),"subscriptiondetails.expirydate": {$gte: milliseconds},"statuscode": { $ne: Number(9) }}},
                        {$group: { _id: {employercode: '$employercode'}, "jobcode": {$addToSet: '$jobcode'}}},
                        {$project: {_id:0, employercode: '$_id.employercode', "totcount": {"$size": '$jobcode'}}}
                        ]).toArray(function (err, usedresult) {
                            dbo.collection(String(MongoDB.ControlsCollectionName)).find({}, { projection: { _id: 0, jobsexpirydays: 1 } }).toArray(function (err, controlresult) {
                                var expirydays = 0;
                                if (controlresult != null && controlresult.length > 0)
                                {
                                    expirydays = controlresult[0].jobsexpirydays;
                                }
                                dbo.collection(String(MongoDB.JobPostsCollectionName)).aggregate([
                                    {$match: {"$and": [{"employercode": Number(empparams.employercode)},{"statuscode": objConstants.approvedstatus}, {"validitydate": {$gte: milliseconds}}]}},
                                    {$project: {_id:0, "employercode": '$employercode', jobcode: '$jobcode', "daysleft": {$ceil: { "$divide": [{ "$subtract": ["$validitydate", milliseconds] },60 * 1000 * 60 * 24]}}}},
                                    {$match: {"daysleft": {$gte: expirydays}}},
                                    {$group: { _id: {employercode: '$employercode'}, "jobcode": {$addToSet: '$jobcode'}}},
                                    {$project: {_id: 0, count: {"$size": '$jobcode'}}}
                                    ]).toArray(function (err, expiredresult) {
                                        // console.log('activejobsresult',activejobsresult);
                                        // console.log('usedresult',usedresult);
                                        // console.log('totalresult',totalresult);
                                        // console.log('expiredresult',expiredresult);
                                        if (activejobsresult == null)
                                        {
                                            activejobsresult = 0;
                                        }
                                        var usedcount = 0, usedresultcount = 0, expirycount = 0;                                       
                                        if (usedresult != null && usedresult.length > 0 )
                                        {
                                            usedresultcount = usedresult[0].totcount;
                                        }
                                        if (totalresult != null && totalresult.length > 0 )
                                        {
                                            usedcount = totalresult[0].totcount - usedresultcount;
                                        }
                                        if (expiredresult != null && expiredresult.length > 0 && expiredresult[0].count!= null)
                                        {
                                            expirycount = expiredresult[0].count;
                                        }
                                        // console.log('activecount',activejobsresult);
                                        // console.log('usedresultcount',usedresultcount);
                                        // console.log('usedcount',usedcount);
                                        // console.log('expirycount',expirycount);
                                        finalresult = {
                                            "activecount": activejobsresult,
                                            "availablecount": usedcount,
                                            "expirysooncount": expirycount
                                        }
                                        return callback(finalresult);

                        });       
                    });
                });
            });
        });
        
        
    }
    catch (e) { logger.error("Error in Admin Dashboard List " + e); }
  }