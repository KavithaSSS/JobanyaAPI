'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");

exports.getPreferenceLoad = function(logparams, langparams, callback) {
    const dbo = MongoDB.getDB();
       var finalresult;
       
       logger.info("Log in Preference Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
       //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
       //state Collection
       var stateparams =  {statuscode: objConstants.activestatus, 'state.languagecode': Number(langparams) };
       dbo.collection(MongoDB.StateCollectionName).aggregate([
        {$unwind: '$state'},
        {$match:stateparams},
        {
            $sort: {
                'state.statename': 1
            }
        },
              { $project: {
               _id: 0, statecode:1, statename:'$state.statename'
               } }
            ]).toArray(function(err, stateresult) {
                //District Collection
                var distparams =  {statuscode: objConstants.activestatus, 'district.languagecode': Number(langparams) };
                dbo.collection(MongoDB.DistrictCollectionName).aggregate([
                    {$unwind: '$district'},
                    {$match:distparams},
                    {
                        $sort: {
                            'district.districtname': 1
                        }
                    },
                          { $project: {
                           _id: 0, districtcode:1, districtname:'$district.districtname', statecode:1
                           } }
                        ]).toArray(function (err, districtresult) {
                            var talukparams = { statuscode: objConstants.activestatus, 'taluk.languagecode': Number(langparams) };
                            dbo.collection(MongoDB.TalukCollectionName).aggregate([
                                { $unwind: '$taluk' },
                                { $match: talukparams },
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
                            ]).toArray(function(err, talukresult) {
                            //Job Function Collection
                            var jobfuncparams =  {statuscode: objConstants.activestatus, 'jobfunction.languagecode': Number(langparams) };
                            dbo.collection(MongoDB.JobFunctionCollectionName).aggregate([
                                {$unwind: '$jobfunction'},
                                {$match:jobfuncparams},
                                {
                                    $sort: {
                                        'jobfunction.jobfunctionname': 1
                                    }
                                },
                                      { $project: {
                                       _id: 0, jobfunctioncode:1, jobfunctionname:'$jobfunction.jobfunctionname'
                                       } }
                                    ]).toArray(function(err, jobfunctionresult) {
                                        //Job Role Collection
                                        var jobroleparams =  {statuscode: objConstants.activestatus, 'jobrole.languagecode': Number(langparams) };
                                        dbo.collection(MongoDB.JobRoleCollectionName).aggregate([
                                            {$unwind: '$jobrole'},
                                            {$match:jobroleparams},
                                            {
                                                $sort: {
                                                    'jobrole.jobrolename': 1
                                                }
                                            },
                                                  { $project: {
                                                   _id: 0, jobrolecode:1, jobrolename:'$jobrole.jobrolename', jobfunctioncode:1
                                                   } }
                                                ]).toArray(function(err, jobroleresult) {
                                                    //Employement Type Collection
                                                    var emptypeparams =  {statuscode: objConstants.activestatus };
                                                    dbo.collection(MongoDB.JobTypeCollectionName).aggregate([
                                                        { $unwind: '$jobtype' },
                                                        { $match: { 'jobtype.languagecode': Number(langparams), statuscode: parseInt(objConstants.activestatus) } },
                                                        {
                                                            $sort: {
                                                                'jobtype.jobtypename': 1
                                                            }
                                                        },
                                                        {$project: 
                                                            { _id: 0, employementtypecode:'$jobtypecode', employementtypename:'$jobtype.jobtypename'}}
                                                        ]).toArray(function(err, emptyperesult) {
                                                            dbo.collection(MongoDB.settingsCollectionName).aggregate([
                                                                {$unwind: {path:'$generalsettings',preserveNullAndEmptyArrays: true }  },
                                                                {$project: {_id:0, employee_location_count: {$ifNull:[ '$generalsettings.employee_location_count',0]},
                                                                employee_jobfunction_count: {$ifNull:[ '$generalsettings.employee_jobfunction_count',0]},
                                                                employee_jobrole_count: {$ifNull:[ '$generalsettings.employee_jobrole_count',0]}}}
                                                                ]).toArray(function(err, settingsresult) {
                                                                    if(settingsresult!=null && settingsresult.length>0){
                                                                        finalresult = {
                                                                            "statelist": stateresult,
                                                                            "districtlist": districtresult,
                                                                            "taluklist": talukresult,
                                                                            "jobfunctionlist": jobfunctionresult,
                                                                            "jobrolelist": jobroleresult,
                                                                            "employementtypelist": emptyperesult,
                                                                            "locationcount": settingsresult[0].employee_location_count,
                                                                            "jobfunctioncount": settingsresult[0].employee_jobfunction_count,
                                                                            "jobrolecount": settingsresult[0].employee_jobrole_count
                                                                        }
                                                                    }
                                                                    else{
                                                                        finalresult = {
                                                                            "statelist": stateresult,
                                                                            "districtlist": districtresult,
                                                                            "taluklist": talukresult,
                                                                            "jobfunctionlist": jobfunctionresult,
                                                                            "jobrolelist": jobroleresult,
                                                                            "employementtypelist": emptyperesult,
                                                                            "locationcount": 0
                                                                        }
                                                                    }
                                                                    
                                                                    return callback(finalresult);
                                                                });
                                                            });
                                                        
                                                    });
                                                }); 
                                    }); 
                        });
           });
}
exports.getEmpPreference = function(logparams, emptypeparams,isleadtype, callback) {
        const dbo = MongoDB.getDB();
           var finalresult;
           
           logger.info("Log in Preference List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
           ////console.log(emptypeparams);
           var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
           dbo.collection(String(dbCollectionName)).find(emptypeparams,{projection: { _id: 0, preferences:1}}).toArray(function(err, prefresult) {
            ////console.log(prefresult);
            if (prefresult.length > 0)
            {
                finalresult = prefresult[0].preferences;
            }
            return callback(finalresult);
               });
}
exports.getSingleRecord = function(logparams, emptypeparams,isleadtype, callback) {
            const dbo = MongoDB.getDB();
               var finalresult;
               
               logger.info("Log in Preference Getting Single Record on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
               ////console.log(emptypeparams);
               var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
               dbo.collection(String(dbCollectionName)).find(emptypeparams,{projection: { _id: 0, preferences:1}}).toArray(function(err, prefresult) {
                ////console.log(prefresult);
                if (err) throw err;
                if (prefresult != null)
                {
                    finalresult = prefresult[0].preferences;
                }
                return callback(finalresult);
                   });
}
exports.getSettings = function(logparams, callback) {
    const dbo = MongoDB.getDB();
       var finalresult = 0;
       
       logger.info("Log in Preference Getting Single Record on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
       ////console.log(emptypeparams);
       
dbo.collection(MongoDB.settingsCollectionName).aggregate([
    {$unwind: '$generalsettings'},
    {$project: {_id:0, employee_location_count: '$generalsettings.employee_location_count', employee_jobfunction_count: '$generalsettings.employee_jobfunction_count',
    employee_jobrole_count: '$generalsettings.employee_jobrole_count'}}
    ]).toArray(function(err, settingsresult) {
        ////console.log(prefresult);
        if (err) throw err;
        if (settingsresult != null && settingsresult.length > 0)
        {
            finalresult = {
                employee_location_count: settingsresult[0].employee_location_count,
                employee_jobfunction_count: settingsresult[0].employee_jobfunction_count,
                employee_jobrole_count: settingsresult[0].employee_jobrole_count
            }
        }
        return callback(finalresult);
           });
}


exports.preferencesave = function(params, employeecode, logparams,isleadtype, callback) {
            try
            {
                const dbo = MongoDB.getDB();
                var finalresult;
                var logcollectionname =dbo.collection(MongoDB.LogCollectionName);
                 logcollectionname.insertOne(logparams, function(err, logres) {
                     /* //console.log(logres["ops"][0]["_id"]);
                     params.makerid = String(logres["ops"][0]["_id"]); */

                     var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
                     dbo.collection(String(dbCollectionName)).updateOne({"employeecode":Number(employeecode)},{$set: { "preferences": params }}, function(err, res) {
                        if (err) throw err;
                        finalresult=res.modifiedCount;
                        return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
                    });
                     
                 });
                
            }
            catch(e){logger.error("Error in Employee Preference Save: "+e);}     
}        

/* exports.preferenceupdate = function(params, logparams, callback) {
            try
            {
                ////console.log(employeecode);
                ////console.log(params);
                const dbo = MongoDB.getDB();
                ////console.log("hi");
                var finalresult;
                //var logcollectionname =dbo.collection(String(MongoDB.LogCollectionName));
                ////console.log(String(MongoDB.LogCollectionName));
                ////console.log(logcollectionname);
                ////console.log("Enter to Log");
                dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function(err, logres) {
                     //console.log(logres["ops"][0]["_id"]);
                     params.makerid = String(logres["ops"][0]["_id"]);
                    //var dbcollectionname = dbo.collection(MongoDB.EmployeeCollectionName);
                    dbo.collection(MongoDB.PreferenceCollectionName).replaceOne({"employeecode":Number(params.employeecode)},params, function(err, res) {
                        ////console.log(res);
                     if (err) 
                     {
                         finalresult = false;
                         throw err;
                     }
                     else
                     {
                         finalresult = true;
                     }
                     ////console.log("Document inserted");
                     //finalresult = params;
                     return callback(finalresult);
                 });
                 });
                
            }
            catch(e){logger.error("Error in Employee Preference: "+e);}     
        }   */              
    /* exports.getEmpPreference = function(logparams, langparams, callback) {
        const dbo = MongoDB.getDB();
           var finalresult;
           
           logger.info("Log in Preference List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
           
           dbo.collection(MongoDB.PreferenceCollectionName).aggregate([
            {$unwind: '$jobfunction'},
            {$match:langparams},
               { $lookup:
                  {
                    from: String(MongoDB.JobFunctionCollectionName),
                    localField: '$jobfunction.jobfunctioncode',
                    foreignField: 'jobfunctioncode',
                    as: 'statusname'
                  } }, 
                  {$unwind: '$statusname'},
                  { $project: {
                   _id: 0, splashcode:1, splashcontent:'$splash.content',statuscode:1,imageurl:1,statusname:'$statusname.statusname'
                   } }
                ]).toArray(function(err, result) {
               finalresult = result;
               return callback(finalresult);
               });
        } */