'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const { param } = require('../controller');
const Logger = require('../services/logger_service');
const logger = new Logger('logs');
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");

exports.getDashboardList = function (logparams, req, callback) {
  try {
    logger.info("Log in Admin Dashboard List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    ////console.log(date);
    ////console.log(parseFloat(req.query.todate));
    var fromdate = parseFloat(req.query.fromdate);
    var todate = parseFloat(req.query.todate);
    var employeeparams = {}, employerparams = {}, subscriptionactiveparams = {}, jobpostactiveparams = {}, subscriptionexpireparams = {}, jobpostexpireparams = {};
    var appliedinvitedparams = {}, shorlistedparam = {}, flashparam = {};
    flashparam = { "$and": [{ "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
    appliedinvitedparams = { "$and": [{ "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
    shorlistedparam = { "$and": [{ "shortliststatus": objConstants.shortlistedstatus }, { "updateddate": { $gte: fromdate } }, { "updateddate": { $lte: todate } }] };
    if (Number(req.query.statuscode) == 0) {
      employeeparams = { "$and": [{ "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      employerparams = { "$and": [{ "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      //subscriptionactiveparams = {"$and": [{"statuscode": objConstants.activestatus},{"expirydate": {$gte: milliseconds}}, {"createddate": {$gte: fromdate}}, {"createddate": {$lte: todate}}]};
      subscriptionactiveparams = { "$and": [{ "statuscode": objConstants.activestatus }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      //subscriptionexpireparams = {"$and": [{"statuscode": objConstants.activestatus},{"expirydate": {$lt: milliseconds}}, {"createddate": {$gte: fromdate}}, {"createddate": {$lte: todate}}]};
      jobpostactiveparams = { "$and": [{ "statuscode": objConstants.approvedstatus }, { "validitydate": { $gte: milliseconds } }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      jobpostexpireparams = { "$and": [{ "statuscode": objConstants.approvedstatus }, { "validitydate": { $lt: milliseconds } }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
    }
    else {
      employeeparams = { "$and": [{ "statuscode": Number(req.query.statuscode) }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      employerparams = { "$and": [{ "statuscode": Number(req.query.statuscode) }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      //subscriptionactiveparams = {"$and": [{"statuscode": objConstants.activestatus}, {"expirydate": {$gte: milliseconds}}, {"createddate": {$gte: fromdate}}, {"createddate": {$lte: todate}}]};
      //subscriptionexpireparams = {"$and": [{"statuscode": objConstants.activestatus}, {"expirydate": {$lt: milliseconds}}, {"createddate": {$gte: fromdate}}, {"createddate": {$lte: todate}}]};
      subscriptionactiveparams = { "$and": [{ "statuscode": objConstants.activestatus }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      jobpostactiveparams = { "$and": [{ "statuscode": objConstants.approvedstatus }, { "validitydate": { $gte: milliseconds } }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      jobpostexpireparams = { "$and": [{ "statuscode": objConstants.approvedstatus }, { "validitydate": { $lt: milliseconds } }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
    }

    dbo.collection(String(MongoDB.LanguageCollectionName)).aggregate([
      { $match: { "statuscode": 1, isappsupport: 1 } },
      {
        $project: { _id: 0, languagecode: 1 }
      }
    ],{ allowDiskUse: true }).toArray(function (err, langresult) {
      var langarray = [];
      for (var i = 0; i < langresult.length; i++)
      {
        langarray.push(langresult[i].languagecode);
      }
    dbo.collection(String(MongoDB.EmployeeCollectionName)).aggregate([
      { $unwind: { path: '$personalinfo', preserveNullAndEmptyArrays: true } },
      { $match: employeeparams },
      {
        "$lookup":
        {
          "from": String(MongoDB.GenderCollectionName),
          "localField": "personalinfo.gender",
          "foreignField": "gendercode",
          "as": "genderinfo"
        }
      },
      { $unwind: { path: '$genderinfo', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$genderinfo.gender', preserveNullAndEmptyArrays: true } },
      { $match: { $or: [{ "genderinfo.gender.languagecode": { $exists: false } }, { "genderinfo.gender.languagecode": "" }, { "genderinfo.gender.languagecode": Number(req.query.languagecode) }] } },
      { $group: { _id: { gendercode: { $ifNull: ['$personalinfo.gender', 0] }, gendername: { $ifNull: ['$genderinfo.gender.gendername', 'Incomplete Profiles'] } }, "employeecode": { "$addToSet": '$employeecode' } } },
      { $sort: { '_id.gendercode': 1 } },
      { "$project": { _id: 0, gendercode: '$_id.gendercode', gendername: '$_id.gendername', count: { $size: '$employeecode' } } }
    ]).toArray(function (err, employeeresult) {
      dbo.collection(String(MongoDB.StatusCollectionName)).aggregate([
        { $match: { "statuscode": { $in: [1, 2, 3, 4, 6, 14] } } },
        {
          "$lookup":
          {
            "from": String(MongoDB.EmployerCollectionName),
            "let": { "statuscode": "$statuscode" },
            "pipeline": [
              {
                $match: {
                  "$expr": {
                    "$and": [{ $eq: ["$statuscode", "$$statuscode"] },
                    { $gte: ["$createddate", fromdate] },
                    { $lte: ["$createddate", todate] }]
                  }
                }
              }
            ],
            "as": "employerinfo"
          }
        },
        { $unwind: { path: '$employerinfo', preserveNullAndEmptyArrays: true } },

        { $group: { _id: { statuscode: { $ifNull: ['$statuscode', 0] }, "statusname": '$statusname', ordervalue: { $ifNull: ['$ordervalue', 0] } }, "employercode": { "$addToSet": '$employerinfo.employercode' } } },
        { $sort: { '_id.statuscode': 1 } },
        { "$project": { _id: 0, statuscode: '$_id.statuscode', statusname: '$_id.statusname', count: { $size: '$employercode' } } }
      ]).toArray(function (err, employerresult) {
        dbo.collection(String(MongoDB.JobPackageCollectionName)).aggregate([
          { $unwind: '$package' },
          {
            $match: { $and: [{ "statuscode": 1 }, { $or: [{ "package.languagecode": { $exists: false } }, { "package.languagecode": "" }, { "package.languagecode": Number(req.query.languagecode) }] }] }
          },
          {
            "$lookup":
            {
              "from": String(MongoDB.JobPackageSubscriptionCollectionName),
              "let": { "packagecode": "$packagecode" },
              "pipeline": [
                {
                  $match: {
                    "$and": [{
                      "$expr": {
                        "$and": [{ $eq: ["$packagecode", "$$packagecode"] },
                        { $gte: ["$createddate", fromdate] },
                        { $lte: ["$createddate", todate] }]
                      }
                    }, { "statuscode": { $exists: true } }, { "statuscode": objConstants.activestatus }]
                  }
                }
                //{$match:{"$and": [{ $eq: ["$packagecode", "$$packagecode"] },{"statuscode": { $exists: true } },{"statuscode":objConstants.activestatus},{"createddate":{$gte:fromdate}},{"createddate":{$lte:todate}}]}}
              ],
              "as": "jobpackageinfo"
            }
          },
          { $unwind: { path: '$jobpackageinfo', preserveNullAndEmptyArrays: true } },
          { $group: { _id: { packagecode: { $ifNull: ['$packagecode', 0] }, packagename: { $ifNull: ['$package.packagename', ''] } }, "subscriptioncode": { "$addToSet": '$jobpackageinfo.subscriptioncode' } } },
          { $sort: { '_id.packagecode': 1 } },
          {
            "$project": {
              _id: 0, packagecode: '$_id.packagecode',
              packagename: '$_id.packagename', count: { $size: '$subscriptioncode' }
            }
          },
          { $sort: { '_id.packagecode': 1 } }
        ]).toArray(function (err, subscriptionresult) {
          dbo.collection(String(MongoDB.JobPostsCollectionName)).find(jobpostactiveparams).count(function (err, jobsactiveresult) {
            dbo.collection(String(MongoDB.JobPostsCollectionName)).find(jobpostexpireparams).count(function (err, jobsexpireresult) {
              dbo.collection(String(MongoDB.EmployeeAppliedCollectionName)).find(appliedinvitedparams).count(function (err, jobappliedresult) {
                dbo.collection(String(MongoDB.EmployeeInvitedCollectionName)).find(appliedinvitedparams).count(function (err, jobinvitedresult) {
                  dbo.collection(String(MongoDB.EmployeeAppliedCollectionName)).find(shorlistedparam).count(function (err, jobsappliedshortlistedresult) {
                    dbo.collection(String(MongoDB.EmployeeInvitedCollectionName)).find(shorlistedparam).count(function (err, jobsinvitedshortlistedresult) {
                      dbo.collection(String(MongoDB.PrivateJobPostsCollectionName)).find(flashparam).count(function (err, flashjobsresult) {
                        dbo.collection(String(MongoDB.EmployeeCollectionName)).aggregate([
                          { $match: { "statuscode": 1, "preferredlanguagecode": {$in : langarray} }},
                          {
                            "$lookup":
                            {
                              "from": String(MongoDB.LanguageCollectionName),
                              "localField": "preferredlanguagecode",
                              "foreignField": "languagecode",
                              "as": "languageinfo"
                            }
                          },
                          { $unwind: { path: '$languageinfo', preserveNullAndEmptyArrays: true } },
                          { $unwind: { path: '$languageinfo.language', preserveNullAndEmptyArrays: true } },
                          { $match: { $or: [{ "languageinfo.language.code": { $exists: false } }, { "languageinfo.language.code": "" }, { "languageinfo.language.code": 2 }] } },
                        { $group: { _id: { languagecode: '$preferredlanguagecode', languagename: '$languageinfo.language.name'  }, "count": {"$sum": 1} } },
                          {
                            $project: { _id: 0, languagecode: '$_id.languagecode',languagename: '$_id.languagename', "count": '$count' }
                          }
                        ],{ allowDiskUse: true }).toArray(function (err, employeelangarray) {
                          dbo.collection(String(MongoDB.EmployerCollectionName)).aggregate([
                            { $match: { "statuscode": 1, "preferredlanguagecode": {$in :langarray} }},
                            {
                              "$lookup":
                              {
                                "from": String(MongoDB.LanguageCollectionName),
                                "localField": "preferredlanguagecode",
                                "foreignField": "languagecode",
                                "as": "languageinfo"
                              }
                            },
                            { $unwind: { path: '$languageinfo', preserveNullAndEmptyArrays: true } },
                          { $unwind: { path: '$languageinfo.language', preserveNullAndEmptyArrays: true } },
                          { $match: { $or: [{ "languageinfo.language.code": { $exists: false } }, { "languageinfo.language.code": "" }, { "languageinfo.language.code": 2 }] } },
                          { $group: { _id: { languagecode: '$preferredlanguagecode', languagename: '$languageinfo.language.name' }, "count": {"$sum": 1} } },
                            {
                              $project: { _id: 0, languagecode: '$_id.languagecode',languagename: '$_id.languagename', "count": '$count' }
                            }
                          ],{ allowDiskUse: true }).toArray(function (err, employerlangarray) {

                        finalresult = {
                          employeeresult: employeeresult,
                          employerresult: employerresult,
                          subscriptionresult: subscriptionresult,
                          jobresult: {
                            active: jobsactiveresult,
                            expired: jobsexpireresult,
                            applied: jobappliedresult,
                            invited: jobinvitedresult,
                            shortlisted: jobsappliedshortlistedresult + jobsinvitedshortlistedresult,
                            flashjobs: flashjobsresult
                          },
                          employeelangarray: employeelangarray,
                          employerlangarray: employerlangarray
                        }
                        return callback(finalresult);
                      });
                      });
                      });
                    });
                  });
                });
              });
            });
          });
        });
        // dbo.collection(String(MongoDB.JobPackageSubscriptionCollectionName)).find(subscriptionactiveparams).count(function (err, subsactiveresult) {
        //     dbo.collection(String(MongoDB.JobPackageSubscriptionCollectionName)).find(subscriptionexpireparams).count(function (err, subsexpireresult) {

        //     });
        // });
      });
    });
  });
  }
  catch (e) { logger.error("Error in Admin Dashboard List " + e); }
}

exports.getProfileDashboard = function (logparams, req, callback) {
  try {
    logger.info("Log in Admin Profile Dashboard List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult = [];
    var percentage_20 = [], percentage_40 = [], percentage_60 = [], percentage_80 = [], percentage_100 = [];

    var personalinfopercentage = 0, contactinfopercentage = 0, preferencepercentage = 0, educationpercentage = 0,
      referenceinfopercentage = 0, experiencepercentage = 0, skillspercentage = 0, photopercentage = 0;
    objUtilities.GetProfilePercentage(function (profilepercentageresult) {
      personalinfopercentage = profilepercentageresult.filter(t => t.profilecode == 1);
      contactinfopercentage = profilepercentageresult.filter(t => t.profilecode == 2);
      preferencepercentage = profilepercentageresult.filter(t => t.profilecode == 6);
      educationpercentage = profilepercentageresult.filter(t => t.profilecode == 3);
      referenceinfopercentage = profilepercentageresult.filter(t => t.profilecode == 5);
      experiencepercentage = profilepercentageresult.filter(t => t.profilecode == 4);
      skillspercentage = profilepercentageresult.filter(t => t.profilecode == 7);
      photopercentage = profilepercentageresult.filter(t => t.profilecode == 8);
      dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
        { $match: { "statuscode": objConstants.activestatus } },
        {
          "$project": {
            _id: 0,
            "employeecode": 1, personalinfopercentage: {
              $cond: [{ $and: [{ $ifNull: ['$personalinfo', false] }, { $ifNull: ['$personalinfo.dateofbirth', false] }, { $gt: [{ $type: '$personalinfo.dateofbirth' }, 0], }] },
              personalinfopercentage[0].profilepercentage, 0
              ]
            },
            contactinfopercentage: {
              $cond: [{ $and: [{ $ifNull: ['$contactinfo', false] }, { $ifNull: ['$contactinfo.talukcode', false] }, { $gt: [{ $type: '$contactinfo.talukcode' }, 0], }] },
              contactinfopercentage[0].profilepercentage, 0
              ]
            },
            preferencepercentage: {
              $cond: [{ $ifNull: ['$preferences', false] },
              preferencepercentage[0].profilepercentage, 0
              ]
            },
            educationpercentage: {
              $cond: [{ $and: [{ $ifNull: ['$schooling', false] }, { $gt: [{ $size: "$schooling" }, 0] }] },
              educationpercentage[0].profilepercentage, 0
              ]
            },
            referenceinfopercentage: {
              $cond: [{ $and: [{ $ifNull: ['$referenceinfo', false] }, { $gt: [{ $size: "$referenceinfo" }, 0] }] },
              referenceinfopercentage[0].profilepercentage, 0
              ]
            },
            // experiencepercentage: {
            //   $cond: [{ $or: [{ $and: [{ $ifNull: ['$experienceinfo', false] }, { $gt: [{ $size: "$experienceinfo" }, 0] }] }, { $eq: [{ $type: '$fresherstatus' }, 1] }] },
            //   experiencepercentage[0].profilepercentage, 0
            //   ]
            // },
            experiencepercentage: {
              $cond: [{ $or: [{ $and: [{ $ifNull: ['$totalexperience', false] }, { $gt: [{ $type: '$totalexperience' }, 0] }] }, { $and: [{ $ifNull: ['$fresherstatus', false] }, { $gt: [{ $type: '$fresherstatus' }, 0] }] }] },
              experiencepercentage[0].profilepercentage, 0
              ]
          },
            skillspercentage: {
              $cond: [{ $and: [{ $ifNull: ['$skills', false] }, { $gt: [{ $size: "$skills" }, 0] }] },
              skillspercentage[0].profilepercentage, 0
              ]
            },
            photopercentage: {
              $cond: [{ $and: [{ $ifNull: ['$imageurl', false] }, { $ne: [{ $type: '$imageurl' }, ''] }] },
              photopercentage[0].profilepercentage, photopercentage[0].profilepercentage
              ]
            }
          },
        },
        {
          $addFields: {
            totalpercentage:
            {
              $add: ["$photopercentage", "$skillspercentage", "$experiencepercentage", "$referenceinfopercentage",
                "$educationpercentage", "$preferencepercentage", "$contactinfopercentage", "$personalinfopercentage"]
            }
          }
        }
      ]).toArray(function (err, emplist) {
        if (emplist != null && emplist.length > 0) {
          percentage_20 = emplist.filter(t => t.totalpercentage >= 0 && t.totalpercentage <= 20);
          percentage_40 = emplist.filter(t => t.totalpercentage >= 21 && t.totalpercentage <= 40);
          percentage_60 = emplist.filter(t => t.totalpercentage >= 41 && t.totalpercentage <= 60);
          percentage_80 = emplist.filter(t => t.totalpercentage >= 61 && t.totalpercentage <= 80);
          percentage_100 = emplist.filter(t => t.totalpercentage >= 81 && t.totalpercentage <= 100);
          //var percentage = {"percentagetext": "20 %","percentagevalue": 20,"percentagecount":percentage_20.length};
          finalresult.push({ "percentagetext": "20 %", "percentagevalue": 20, "percentagecount": percentage_20.length });
          finalresult.push({ "percentagetext": "40 %", "percentagevalue": 40, "percentagecount": percentage_40.length });
          finalresult.push({ "percentagetext": "60 %", "percentagevalue": 60, "percentagecount": percentage_60.length });
          finalresult.push({ "percentagetext": "80 %", "percentagevalue": 80, "percentagecount": percentage_80.length });
          finalresult.push({ "percentagetext": "100 %", "percentagevalue": 100, "percentagecount": percentage_100.length });
          return callback(finalresult);
        }

      });
    });
  }
  catch (e) { logger.error("Error in Admin Dashboard List " + e); }
}

exports.getDashboardChartList = function (logparams, req, callback) {
  try {
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    logger.info("Log in Admin Dashboard List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    ////console.log(date);
    ////console.log(parseFloat(req.query.todate));
    var fromdate = parseFloat(req.query.fromdate);
    var todate = parseFloat(req.query.todate);
    var params = {}, empparams = {};
    //subscriptionactiveparams = {"$and": [{"statuscode": objConstants.activestatus},{"expirydate": {$gte: milliseconds}}, {"createddate": {$gte: fromdate}}, {"createddate": {$lte: todate}}]};
    if (Number(req.query.statuscode) == 0) {
      empparams = { "$and": [{ "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      params = { "$and": [{ "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }, { "statuscode": objConstants.activestatus }] };
    }
    else {
      empparams = { "$and": [{ "statuscode": Number(req.query.statuscode) }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
      params = { "$and": [{ "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }, { "statuscode": objConstants.activestatus }] };
    }
    if (Number(req.query.charttype) == 0) {
      dbo.collection(MongoDB.MonthCollectionName).aggregate([
        { $unwind: "$month" },
        { $match: { "month.languagecode": objConstants.defaultlanguagecode } },
        {
          $sort: {
            monthnumber: 1
          }
        },
        {
          $project: {
            _id: 0, monthnumber: 1, monthname: "$month.monthname", shortname: "$month.shortname"
          }
        }
      ]).toArray(function (err, monthresult) {
        dbo.collection(String(MongoDB.JobPackageSubscriptionCollectionName)).aggregate([
          { $match: params },
          {
            "$addFields": {
              "date": {
                "$toDate": "$createddate"
              }
            }
          },
          {
            "$group": {
              "_id": { "$month": "$date" },
              "subscription": {
                "$push": '$subscriptioncode'
              }
            }
          },
          { "$project": { "_id": 0, "monthnumber": '$_id', "subscriptioncount": { "$size": "$subscription" } } }
        ]).toArray(function (err, subscriptionresult) {
          dbo.collection(String(MongoDB.EmployerCollectionName)).aggregate([
            { $match: empparams },
            {
              "$addFields": {
                "date": {
                  "$toDate": "$createddate"
                }
              }
            },
            {
              "$group": {
                "_id": { "$month": "$date" },
                "employer": {
                  "$push": '$employercode'
                }
              }
            },
            { "$project": { "_id": 0, "monthnumber": '$_id', "employercount": { "$size": "$employer" } } }
          ]).toArray(function (err, employerresult) {
            dbo.collection(String(MongoDB.EmployeeCollectionName)).aggregate([
              { $match: empparams },
              {
                "$addFields": {
                  "date": {
                    "$toDate": "$createddate"
                  }
                }
              },
              {
                "$group": {
                  "_id": { "$month": "$date" },
                  "employee": {
                    "$push": '$employeecode'
                  }
                }
              },
              { "$project": { "_id": 0, "monthnumber": '$_id', "employeecount": { "$size": "$employee" } } }
            ]).toArray(function (err, employeeresult) {
              finalresult = {
                monthresult: monthresult,
                employeeresult: employeeresult,
                employerresult: employerresult,
                subscriptionresult: subscriptionresult
              }
              return callback(finalresult);
            });
          });
        });
      });
    }
    else if (Number(req.query.charttype) == 1) {
      dbo.collection(String(MongoDB.JobPackageSubscriptionCollectionName)).aggregate([
        { $match: params },
        {
          "$addFields": {
            "createddate": {
              "$toDate": "$createddate"
            }
          }
        },
        {
          "$addFields": {
            "date": {
              $dateToString: {
                format: '%d-%m-%Y',
                date: '$createddate'
              }
              //  "$toDate": "$createddate"
            }
          }
        },
        {
          "$group": {
            "_id": "$date",
            "subscription": {
              "$push": '$subscriptioncode'
            }
          }
        },
        { "$project": { "_id": 0, "datenumber": '$_id', "subscriptioncount": { "$size": "$subscription" } } }
      ]).toArray(function (err, subscriptionresult) {
        dbo.collection(String(MongoDB.EmployerCollectionName)).aggregate([
          { $match: empparams },
          {
            "$addFields": {
              "createddate": {
                "$toDate": "$createddate"
              }
            }
          },
          {
            "$addFields": {
              "date": {
                $dateToString: {
                  format: '%d-%m-%Y',
                  date: '$createddate'
                }
              }
            }
          },
          {
            "$group": {
              "_id": "$date",
              "employer": {
                "$push": '$employercode'
              }
            }
          },
          { "$project": { "_id": 0, "datenumber": '$_id', "employercount": { "$size": "$employer" } } }
        ]).toArray(function (err, employerresult) {
          dbo.collection(String(MongoDB.EmployeeCollectionName)).aggregate([
            { $match: empparams },
            {
              "$addFields": {
                "createddate": {
                  "$toDate": "$createddate"
                }
              }
            },
            {
              "$addFields": {
                "date": {
                  $dateToString: {
                    format: '%d-%m-%Y',
                    date: '$createddate'
                  }
                }
              }
            },
            {
              "$group": {
                "_id": "$date",
                "employee": {
                  "$push": '$employeecode'
                }
              }
            },
            { "$project": { "_id": 0, "datenumber": '$_id', "employeecount": { "$size": "$employee" } } }
          ]).toArray(function (err, employeeresult) {
            finalresult = {
              employeeresult: employeeresult,
              employerresult: employerresult,
              subscriptionresult: subscriptionresult
            }
            return callback(finalresult);
          });
        });
      });
    }

  }
  catch (e) { logger.error("Error in Admin Dashboard List " + e); }
}