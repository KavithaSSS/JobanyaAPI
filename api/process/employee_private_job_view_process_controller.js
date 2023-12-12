'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');
var dblogcollectionname = MongoDB.LogCollectionName;

exports.insertJobPostViewed = function (logparams, employercodedata, employeecodedata, jobcodedata, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    logger.info("Log in Job View by Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

    var insertparams = {};
    insertparams.employeecode = parseInt(employeecodedata);
    insertparams.employercode = parseInt(employercodedata);
    insertparams.jobcode = parseInt(jobcodedata);
    insertparams.statuscode = parseInt(objConstants.activestatus);
    insertparams.createddate = milliseconds;
    //Find job codee and employee details
    dbo.collection(MongoDB.JobPostViewedHistory).find({ $and: [{ "jobcode": parseInt(jobcodedata) }, { "employeecode": parseInt(employeecodedata) }] }).count(function (err, result) {
      if (err)
        throw err;
      if (result == 0) {
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
          if (err)
            throw err;
          insertparams.makerid = String(logres["ops"][0]["_id"]);
          //Insert job view count against employee
          dbo.collection(MongoDB.JobPostViewedHistory).insertOne(insertparams, function (err, result) {
            if (err)
              throw err;
            //Insert viewed count
            objUtilities.InsertJobCounts(parseInt(jobcodedata), objConstants.viewed, 0, function (err, result) {

            });
            ////console.log(result.insertedCount);
            return callback(result.insertedCount);
          });
        });
      }
    });
  }
  catch (e) { logger.error("Error in Getting Job View: " + e); }

}

//Get job count
exports.getJobCounts = function (logparams, jobcodedata, callback) {
  try {
    const dbo = MongoDB.getDB();
    logger.info("Log in Job View by Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    //Get counts 
    dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
      { $match: { 'jobcode': Number(jobcodedata) } },
      {
        $project: {
          _id: 0, matchingprofilecount: { $ifNull: ['$matchingprofilecount', 0] },
          wishedcount: { $ifNull: ['$wishlistcount', 0] }, viewedcount: { $ifNull: ['$viewedcount', 0] }
        }
      }
    ]).toArray(function (err, empresult) {
      return callback(empresult);
    });
  }
  //   dbo.collection(MongoDB.PrivateJobPostsCollectionName).find({ "jobcode": parseInt(jobcodedata) },
  //    { projection: { _id: 0, "matchingprofilecount":{ $ifNull:[ 'matchingprofilecount','0']}  , viewedcount: 1,wishlistcount:1 } }).toArray(function (err, result) {
  //     if (err) 
  //         throw err;   
  //         return callback(result);

  //   });
  // }
  catch (e) { logger.error("Error in Getting Job View: " + e); }

}

exports.getJobViewProcess = function (logparams, params, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    logger.info("Log in Job View by Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    var matchparams;
    if (params.statuscode[0] == 0) {
      matchparams = { "jobcode": Number(params.jobcode) };
    }
    else {
      matchparams = { "statuscode": { $in: params.statuscode }, "jobcode": Number(params.jobcode) }
    }

    dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
      { $match: matchparams },

      {
        "$lookup": {
          "from": String(MongoDB.JobFunctionCollectionName),
          "localField": "jobfunctioncode",
          "foreignField": "jobfunctioncode",
          "as": "jobfunctioninfo"
        }
      },
      {
        "$lookup": {
          "from": String(MongoDB.JobRoleCollectionName),
          "localField": "jobrolecode",
          "foreignField": "jobrolecode",
          "as": "jobroleinfo"
        }
      },

      { $unwind: "$jobfunctioninfo" },
      { $unwind: "$jobfunctioninfo.jobfunction" },
      { $match: { "jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) } },
      { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
      { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(params.languagecode) }] } },
      {
        $group: {
          "_id": {
            "jobid": "$jobid", "jobcode": '$jobcode', "remarks": '$remarks', "jobdescription": '$jobdescription', "experience": '$experience',
            "salaryrange": '$salaryrange', "contactdetails": '$contactdetails',
            "subscriptiondetails": '$subscriptiondetails', "createddate": '$createddate', "validitydate": '$validitydate', "daysleft": {
              $ceil: {
                "$divide": [{ "$subtract": ["$validitydate", milliseconds] },
                60 * 1000 * 60 * 24]
              }
            },
            "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname', "jobfunctioncode": '$jobfunctioncode', "jobrolecode": '$jobrolecode',
            "jobrolename": '$jobroleinfo.jobrole.jobrolename', //"jobtypecode": '$jobtypecode', "jobtypename": '$jobtypeinfo.jobtype.jobtypename',
            "invitedshortliststatus": { $ifNull: ['$invitedinfo.shortliststatus', 0] }, "inviteddate": { $ifNull: ['$invitedinfo.createddate', 0] },
            "remarks": '$remarks', "latitude": "$latitude", "longitude": "$longitude"
          }
        }
      },
      { $sort: { '_id.approveddate': -1 } },
      {
        "$project": {
          _id: 0,
          "jobid": '$_id.jobid', "jobcode": '$_id.jobcode', "remarks": '$_id.remarks', "jobdescription": '$_id.jobdescription', "experience": '$_id.experience',
          "salaryrange": '$_id.salaryrange', "contactdetails": '$_id.contactdetails',
          "subscriptiondetails": '$_id.subscriptiondetails', "validitydate": '$_id.validitydate', "daysleft": '$_id.daysleft',
          "employerdetails": '$_id.employerdetails', "industrycode": '$_id.industrycode', "industryname": '$_id.industryname', "jobfunctioncode": '$_id.jobfunctioncode',
          "jobfunctionname": '$_id.jobfunctionname', "jobrolecode": '$_id.jobrolecode', "jobrolename": '$_id.jobrolename',// "jobtypecode": '$_id.jobtypecode', "jobtypename": '$_id.jobtypename',
          "remarks": '$_id.remarks', "createdate": '$_id.createddate'
        }
      }
    ]).toArray(function (err, result) {
      if (result != null && result.length > 0) {
        finalresult = result;
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
          { $unwind: '$schooling' },
          { $match: matchparams },
          {
            "$lookup": {
              "from": String(MongoDB.EduCategoryCollectionName),
              "localField": "schooling.qualificationcode",
              "foreignField": "educationcategorycode",
              "as": "schoolingInfo"
            }
          },
          { $unwind: "$schoolingInfo" },
          { $unwind: '$schoolingInfo.educationcategory' },
          { $match: { "schoolingInfo.educationcategory.languagecode": Number(params.languagecode) } },
          {
            "$project": {
              _id: 0, "qualificationcode": '$schoolingInfo.educationcategorycode', "qualificationname": '$schoolingInfo.educationcategory.educationcategoryname'
            }
          }
        ]).toArray(function (err, schoolingresult) {
          // //console.log("schooling",schoolingresult);

          finalresult[0].schooling = schoolingresult;
          dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
            { $unwind: '$afterschooling' },
            { $unwind: '$afterschooling.categorylist' },
            { $match: matchparams },
            {
              "$lookup": {
                "from": String(MongoDB.EduCategoryCollectionName),
                "localField": "afterschooling.categorylist.educationcategorycode",
                "foreignField": "educationcategorycode",
                "as": "categoryInfo"
              }
            },
            { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$categoryInfo.educationcategory', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "categoryInfo.educationcategory.languagecode": { $exists: false } }, { "categoryInfo.educationcategory.languagecode": "" }, { "categoryInfo.educationcategory.languagecode": Number(params.languagecode) }] } },
            {
              $group:
              {
                "_id": {
                  "isanydegree": '$afterschooling.isanydegree', "afterschoolingisany": '$afterschooling.isanyspec', "qualisany": '$afterschooling.isany',
                  "educationcategorycode": '$categoryInfo.educationcategorycode', "educationcategoryname": '$categoryInfo.educationcategory.educationcategoryname'
                }
              }
            },
            {
              $group:
              {
                "_id": { "isanydegree": '$_id.isanydegree', "afterschoolingisany": '$_id.afterschoolingisany', "qualisany": '$_id.qualisany' },
                "categorylist": {
                  "$push": {
                    "educationcategorycode": '$_id.educationcategorycode', "educationcategoryname": '$_id.educationcategoryname'
                  }
                }
              }
            },
            {
              "$project": {
                _id: 0, "isanydegree": '$_id.isanydegree',
                "afterschoolingisany": '$_id.afterschoolingisany', "qualisany": '$_id.qualisany', "categorylist": '$categorylist'
              }
            }
          ]).toArray(function (err, categoryresult) {
            // //console.log("afterschooling",afterschoolingresult);
            finalresult[0].afterschooling = categoryresult;
            // if (afterschoolingresult != null && afterschoolingresult.length > 0)
            //   finalresult[0].afterschoolingisany = "false"
            // else
            //   finalresult[0].afterschoolingisany = "true"

            dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
              { $unwind: '$afterschooling' },
              { $unwind: '$afterschooling.qualificationlist' },
              { $match: matchparams },
              {
                "$lookup": {
                  "from": String(MongoDB.QualificationCollectionName),
                  "localField": "afterschooling.qualificationlist.qualificationcode",
                  "foreignField": "qualificationcode",
                  "as": "qualificationinfo"
                }
              },
              {
                "$lookup": {
                  "from": String(MongoDB.EduCategoryCollectionName),
                  "localField": "afterschooling.qualificationlist.educationcategorycode",
                  "foreignField": "educationcategorycode",
                  "as": "categoryInfo"
                }
              },
              { $unwind: { path: '$qualificationinfo', preserveNullAndEmptyArrays: true } },
              { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
              { $unwind: { path: '$categoryInfo.educationcategory', preserveNullAndEmptyArrays: true } },
              { $match: { $or: [{ "categoryInfo.educationcategory.languagecode": { $exists: false } }, { "categoryInfo.educationcategory.languagecode": "" }, { "categoryInfo.educationcategory.languagecode": Number(params.languagecode) }] } },
              {
                "$project": {
                  _id: 0,
                  "qualificationcode": '$qualificationinfo.qualificationcode', "qualificationname": '$qualificationinfo.qualificationname', "educationcategorycode": '$categoryInfo.educationcategorycode', "educationcategoryname": '$categoryInfo.educationcategory.educationcategoryname'
                }
              }])
              .toArray(function (err, qualificationresult) {
                ////console.log(qualificationresult);
                if (finalresult[0].afterschooling != null && finalresult[0].afterschooling.length > 0) {
                  finalresult[0].afterschooling[0].qualificationlist = qualificationresult;
                }
                else {
                  finalresult[0].afterschooling.qualificationlist = qualificationresult;
                }

                dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                  { $unwind: '$afterschooling' },
                  { $unwind: '$afterschooling.afterschoolinglist' },
                  { $match: matchparams },
                  {
                    "$lookup": {
                      "from": String(MongoDB.QualificationCollectionName),
                      "localField": "afterschooling.afterschoolinglist.qualificationcode",
                      "foreignField": "qualificationcode",
                      "as": "qualificationinfo"
                    }
                  },
                  {
                    "$lookup": {
                      "from": String(MongoDB.SpecializationCollectionName),
                      "localField": "afterschooling.afterschoolinglist.specializationcode",
                      "foreignField": "specializationcode",
                      "as": "specializationinfo"
                    }
                  },
                  { $unwind: "$qualificationinfo" },
                  { $unwind: "$specializationinfo" },
                  { $unwind: "$specializationinfo.specialization" },
                  { $match: { "specializationinfo.specialization.languagecode": Number(params.languagecode) } },
                  {
                    "$project": {
                      _id: 0, "qualificationcode": '$qualificationinfo.qualificationcode', "qualificationname": '$qualificationinfo.qualificationname',
                      "specializationcode": '$specializationinfo.specializationcode', "specializationname": '$specializationinfo.specialization.specializationname'
                    }
                  }
                ]).toArray(function (err, specializationresult) {
                  ////console.log(specializationresult);
                  if (finalresult[0].afterschooling != null && finalresult[0].afterschooling.length > 0) {
                    finalresult[0].afterschooling[0].specializationlist = specializationresult;
                  }
                  else {
                    finalresult[0].afterschooling.specializationlist = specializationresult;
                  }

                  dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                    { $unwind: '$maritalstatus' },
                    { $match: matchparams },
                    {
                      "$lookup": {
                        "from": String(MongoDB.MaritalStatusCollectionName),
                        "localField": "maritalstatus.maritallist.maritalcode",
                        "foreignField": "maritalcode",
                        "as": "maritalinfo"
                      }
                    },
                    { $unwind: "$maritalinfo" },
                    { $unwind: "$maritalinfo.marital" },
                    { $match: { "maritalinfo.marital.languagecode": Number(params.languagecode) } },
                    {
                      "$project": {
                        _id: 0, "maritalcode": '$maritalinfo.maritalcode', "maritalname": '$maritalinfo.marital.maritalname', "isany": '$maritalstatus.isany'
                      }
                    }
                  ]).toArray(function (err, maritalresult) {
                    finalresult[0].maritalstatus = maritalresult;
                    // //console.log("marital",maritalresult);
                    if (maritalresult != null && maritalresult.length > 0)
                      finalresult[0].maritalisany = "false"
                    else
                      finalresult[0].maritalisany = "true"
                    dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                      { $unwind: '$gender' },
                      { $match: matchparams },
                      {
                        "$lookup": {
                          "from": String(MongoDB.GenderCollectionName),
                          "localField": "gender.genderlist.gendercode",
                          "foreignField": "gendercode",
                          "as": "genderinfo"
                        }
                      },
                      { $unwind: "$genderinfo" },
                      { $unwind: "$genderinfo.gender" },
                      { $match: { "genderinfo.gender.languagecode": Number(params.languagecode) } },
                      {
                        "$project": {
                          _id: 0, "gendercode": '$genderinfo.gendercode', "gendername": '$genderinfo.gender.gendername'
                        }
                      }
                    ]).toArray(function (err, genderresult) {
                      finalresult[0].genderlist = genderresult;
                      if (genderresult != null && genderresult.length > 0)
                        finalresult[0].genderisany = "false"
                      else
                        finalresult[0].genderisany = "true"
                      dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                        { $unwind: '$preferredlocation' },
                        { $match: matchparams },
                        {
                          "$lookup": {
                            "from": String(MongoDB.DistrictCollectionName),
                            "localField": "preferredlocation.locationlist.locationcode",
                            "foreignField": "districtcode",
                            "as": "locationinfo"
                          }
                        },
                        { $unwind: "$locationinfo" },
                        { $unwind: "$locationinfo.district" },
                        { $match: { "locationinfo.district.languagecode": Number(params.languagecode) } },
                        {
                          "$project": {
                            _id: 0, "locationcode": '$locationinfo.districtcode', "locationname": '$locationinfo.district.districtname'
                          }
                        }
                      ]).toArray(function (err, locationresult) {
                        finalresult[0].locationlist = locationresult;
                        if (locationresult != null && locationresult.length > 0)
                          finalresult[0].locationisany = "false"
                        else
                          finalresult[0].locationisany = "true"
                        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                          { $unwind: '$preferredjoblocation' },
                          { $match: matchparams },
                          {
                            "$lookup": {
                              "from": String(MongoDB.DistrictCollectionName),
                              "localField": "preferredjoblocation.locationlist.locationcode",
                              "foreignField": "districtcode",
                              "as": "joblocationinfo"
                            }
                          },
                          { $unwind: "$joblocationinfo" },
                          { $unwind: "$joblocationinfo.district" },
                          { $match: { "joblocationinfo.district.languagecode": Number(params.languagecode) } },
                          {
                            "$project": {
                              _id: 0, "locationcode": '$joblocationinfo.districtcode', "locationname": '$joblocationinfo.district.districtname'
                            }
                          }
                        ]).toArray(function (err, joblocationresult) {
                          finalresult[0].joblocationlist = joblocationresult;
                          dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                            { $unwind: '$languagesknown' },
                            { $match: matchparams },
                            {
                              "$lookup": {
                                "from": String(MongoDB.LanguageCollectionName),
                                "localField": "languagesknown.languagecode",
                                "foreignField": "languagecode",
                                "as": "languageinfo"
                              }
                            },
                            { $unwind: "$languageinfo" },
                            {
                              "$project": {
                                _id: 0, "languagecode": '$languageinfo.languagecode', "languagename": '$languageinfo.languagename', "displayname": '$languageinfo.language', "status": '$languagesknown.status', "knowntype": '$languagesknown.knowntype'
                              }
                            }
                          ]).toArray(function (err, languageresult) {
                            finalresult[0].languagesknown = languageresult;
                            dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                              { $unwind: '$facilityoffered' },
                              { $match: matchparams },
                              {
                                "$lookup": {
                                  "from": String(MongoDB.FacilityCollectionName),
                                  "localField": "facilityoffered.facilitycode",
                                  "foreignField": "facilitycode",
                                  "as": "facilityinfo"
                                }
                              },
                              { $unwind: "$facilityinfo" },
                              { $unwind: "$facilityinfo.facility" },
                              { $match: { "facilityinfo.facility.languagecode": Number(params.languagecode) } },
                              {
                                "$project": {
                                  _id: 0, "facilitycode": '$facilityinfo.facilitycode', "facilityname": '$facilityinfo.facility.facilityname'
                                }
                              }
                            ]).toArray(function (err, facilityresult) {
                              finalresult[0].facilityoffered = facilityresult;
                              dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "jobcode": Number(params.jobcode) }, { projection: { _id: 0, statuscode: 1, shortliststatus: 1 } }).toArray(function (err, appresult) {
                                if (appresult != null && appresult.length > 0) {
                                  finalresult[0].appliedcount = appresult.length

                                }
                                else {
                                  finalresult[0].appliedcount = 0
                                }
                                dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "jobcode": Number(params.jobcode) }, { projection: { _id: 0, statuscode: 1, shortliststatus: 1 } }).toArray(function (err, invresult) {
                                  var totshortlistcount = 0;
                                  if (invresult != null && invresult.length > 0) {
                                    finalresult[0].invitedcount = invresult.length
                                  }
                                  else {
                                    finalresult[0].invitedcount = 0
                                  }
                                  dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "jobcode": Number(params.jobcode), "shortliststatus": objConstants.shortlistedstatus }, { projection: { _id: 0, statuscode: 1, shortliststatus: 1 } }).toArray(function (err, appshortresult) {
                                    if (appshortresult != null && appshortresult.length > 0) {
                                      totshortlistcount = appshortresult.length;
                                    }
                                    else {
                                      totshortlistcount = 0;
                                    }

                                    dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "jobcode": Number(params.jobcode), "shortliststatus": objConstants.shortlistedstatus }, { projection: { _id: 0, statuscode: 1, shortliststatus: 1 } }).toArray(function (err, invshortresult) {
                                      if (invshortresult != null && invshortresult.length > 0) {
                                        totshortlistcount = totshortlistcount + invshortresult.length;
                                      }
                                      finalresult[0].totalshortlistcount = totshortlistcount;
                                      dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                                        { $unwind: '$skills' },
                                        { $match: matchparams },
                                        {
                                          "$lookup": {
                                            "from": String(MongoDB.SkillCollectionName),
                                            "localField": "skills.skillcode",
                                            "foreignField": "skillcode",
                                            "as": "skillinfo"
                                          }
                                        },
                                        { $unwind: "$skillinfo" },
                                        { $unwind: "$skillinfo.skill" },
                                        { $match: { "skillinfo.skill.languagecode": Number(params.languagecode) } },
                                        {
                                          "$project": {
                                            _id: 0, "skillcode": '$skillinfo.skillcode', "skillname": '$skillinfo.skill.skillname'
                                          }
                                        }
                                      ]).toArray(function (err, skillresult) {
                                        finalresult[0].skills = skillresult;
                                        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                                          { $unwind: '$jobtypes' },
                                          { $match: matchparams },
                                          {
                                            "$lookup": {
                                              "from": String(MongoDB.JobTypeCollectionName),
                                              "localField": "jobtypes.jobtypecode",
                                              "foreignField": "jobtypecode",
                                              "as": "jobtypeinfo"
                                            }
                                          },
                                          { $unwind: "$jobtypeinfo" },
                                          { $unwind: "$jobtypeinfo.jobtype" },
                                          { $match: { "jobtypeinfo.jobtype.languagecode": Number(params.languagecode) } },
                                          {
                                            "$project": {
                                              _id: 0, "jobtypecode": '$jobtypeinfo.jobtypecode', "jobtypename": '$jobtypeinfo.jobtype.jobtypename'
                                            }
                                          }
                                        ]).toArray(function (err, jobtyperesult) {
                                          finalresult[0].jobtypes = jobtyperesult;
                                          dbo.collection(MongoDB.AbuseEmployerCollectionName).find({ "apptypecode": 1, "statuscode": objConstants.pendingstatus, "employeecode": Number(params.employeecode), "jobcode": Number(params.jobcode) }).toArray(function (err, abuseresult) {
                                            var abusestatus = 0;
                                            if (abuseresult != null && abuseresult.length > 0) {
                                              abusestatus = abuseresult[0].statuscode;
                                            }
                                            finalresult[0].abusestatus = abusestatus;
                                            dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                                              { $unwind: '$preferredlocation' },
                                              { $match: matchparams },
                                              {
                                                "$lookup": {
                                                  "from": String(MongoDB.TalukCollectionName),
                                                  "localField": "preferredlocation.taluklist.talukcode",
                                                  "foreignField": "talukcode",
                                                  "as": "talukinfo"
                                                }
                                              },
                                              { $unwind: "$talukinfo" },
                                              { $unwind: "$talukinfo.taluk" },
                                              { $match: { "talukinfo.taluk.languagecode": Number(params.languagecode) } },
                                              {
                                                "$project": {
                                                  _id: 0, "talukcode": '$talukinfo.talukcode', "talukname": '$talukinfo.taluk.talukname'
                                                }
                                              }
                                            ]).toArray(function (err, talukresult) {
                                              finalresult[0].talukresult = talukresult;
                                              if (talukresult != null && talukresult.length > 0)
                                                finalresult[0].talukisany = "false"
                                              else
                                                finalresult[0].talukisany = "true"
                                              dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                                                { $unwind: '$preferredjoblocation' },
                                                { $match: matchparams },
                                                {
                                                  "$lookup": {
                                                    "from": String(MongoDB.TalukCollectionName),
                                                    "localField": "preferredjoblocation.taluklist.talukcode",
                                                    "foreignField": "talukcode",
                                                    "as": "jobtalukinfo"
                                                  }
                                                },
                                                { $unwind: "$jobtalukinfo" },
                                                { $unwind: "$jobtalukinfo.taluk" },
                                                { $match: { "jobtalukinfo.taluk.languagecode": Number(params.languagecode) } },
                                                {
                                                  "$project": {
                                                    _id: 0, "talukcode": '$jobtalukinfo.talukcode', "talukname": '$jobtalukinfo.taluk.talukname'
                                                  }
                                                }
                                              ]).toArray(function (err, jobtalukresult) {

                                                finalresult[0].jobtaluklist = jobtalukresult;
                                                if (jobtalukresult != null && jobtalukresult.length > 0)
                                                  finalresult[0].jobtalukisany = "false"
                                                else
                                                  finalresult[0].jobtalukisany = "true"
                                                return callback(finalresult);
                                              });
                                            });

                                          });
                                        });

                                        ////console.log(finalresult);


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

                  });
                });
              });


            ////console.log("school");
            ////console.log(result);

          });
        });
      }
      else {

        // //console.log(finalresult);
        return callback(finalresult);
      }
    });
  }
  catch (e) { logger.error("Error in Getting Job View: " + e); }


}