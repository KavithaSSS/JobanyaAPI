'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getContactInfoLoad = function (logparams, langparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Contact Info Load on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var stateparams = { statuscode: objConstants.activestatus, 'state.languagecode': Number(langparams) };
        dbo.collection(MongoDB.StateCollectionName).aggregate([
            { $unwind: '$state' },
            { $match: stateparams },
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
        ]).toArray(function (err, stateresult) {
            //District Collection
            var distparams = { statuscode: objConstants.activestatus, 'district.languagecode': Number(langparams) };
            dbo.collection(MongoDB.DistrictCollectionName).aggregate([
                { $unwind: '$district' },
                { $match: distparams },
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
            ]).toArray(function (err, districtresult) {
                var talukparams = { statuscode: objConstants.activestatus, 
                    'taluk.languagecode': Number(langparams) };
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
                            _id: 0, talukcode: 1, talukname: '$taluk.talukname',
                            districtcode: 1
                        }
                    }
                ]).toArray(function (err, talukresult) {
                    finalresult = {
                        "statelist": stateresult,
                        "districtlist": districtresult,
                        "taluklist":talukresult
                    }
                    return callback(finalresult);
                }); 
            });
        });
    }
    catch (e) { logger.error("Error in Employer Contact Info Load: " + e); }

}

exports.getEmpContactInfo = function (logparams, empparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employer Contact Info List on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, employercode: 1, contactinfo: 1, registered_email: 1, website: 1 } }).toArray(function (err, profileresult) {
            ////console.log(prefresult);
            if (profileresult.length > 0) {
                finalresult = profileresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Employer Contact Info Load: " + e); }

}

exports.contactinfosave = function (params, employercode, logparams, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(employercode) }, { $set: { "contactinfo": params.contactinfo, "website": params.website, "updateddate": milliseconds } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employer Contact Info Update: " + e); }
}

exports.checkEmailIdExists = function (logparams, prefparams, callback) {
    try {
        logger.info("Log in checking emailid: UserId: " + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "registered_email": prefparams.registered_email, employercode: { $ne: Number(prefparams.employercode) } }, { $exists: true }).count(function (err, totalcount) //find if a value exists
        {
            ////console.log(totalcount)
            return callback(totalcount);
        });
    }
    catch (e) { logger.error("Error in checking emailid - employer" + e); }
}

exports.getCompanyInfoLoad = function (logparams, langparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Company Info Load on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var params = { statuscode: objConstants.activestatus, 'facility.languagecode': Number(langparams) };
        dbo.collection(MongoDB.FacilityCollectionName).aggregate([
            { $unwind: '$facility' },
            { $match: params },
            {
                $sort: {
                    'facility.facilityname': 1
                }
            },
            {
                $project: {
                    _id: 0, facilitycode: 1, facilityname: '$facility.facilityname'
                }
            }
        ]).toArray(function (err, facilityresult) {
            dbo.collection(MongoDB.TurnOverSlabCollectionName).aggregate([
                { $unwind: '$slabs' },
                { $match: { statuscode: objConstants.activestatus, 'slabs.languagecode': Number(langparams) } },
                {
                    $sort: {
                        'slabcode': 1
                    }
                },
                {
                    $project: {
                        _id: 0, slabcode: 1, slabname: '$slabs.slabname'
                    }
                }
            ]).toArray(function (err, turnoverslabresult) {
                finalresult = {
                    facility: facilityresult,
                    turnoverslabresult: turnoverslabresult
                }
                // //console.log(finalresult)
                return callback(finalresult);
            });

        });
    }
    catch (e) { logger.error("Error in Employer Company Info Load: " + e); }

}

exports.getEmpCompanyInfo = function (logparams, empparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employer Company Info List on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, employercode: 1, aboutcompany: 1, turnovercode: 1, noofemployees: 1, gallery: 1, facilities_offered: 1 } }).toArray(function (err, profileresult) {
            ////console.log(prefresult);
            if (profileresult.length > 0) {
                finalresult = profileresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Employer Company Info: " + e); }
}

exports.companyinfosave = function (params, employercode, logparams, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(employercode) }, { $set: { "updateddate": milliseconds, "aboutcompany": params.aboutcompany, "turnovercode": params.turnovercode, "noofemployees": params.noofemployees, "gallery": params.gallery, "facilities_offered": params.facilities_offered } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employer Company Info Update: " + e); }
}

exports.UpdateProfileStatus = function (employercode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparam={ "employercode": Number(employercode)};
        var companyinfostatus = 0;
       dbo.collection(MongoDB.EmployerCollectionName).find(matchparam, { projection: { _id: 0, "employercode": 1, "aboutcompany": 1, "turnovercode": 1, "noofemployees": 1, "facilities_offered": 1} }).toArray(function (err, profileresult) {
            ////console.log(profileresult);
            if (profileresult.length > 0) {
                
                if (profileresult[0].aboutcompany != null && profileresult[0].turnovercode != null && 
                    profileresult[0].noofemployees != null && profileresult[0].facilities_offered != null)
                    companyinfostatus = 1;
               
                if(companyinfostatus==1) {
                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                        
                        dbo.collection(MongoDB.EmployerCollectionName).updateOne(matchparam, { $set: { "profilestatus": 1, "completedon": currenttime} }, function (err, res) {
                            if (err)
                                throw (err)
                            ////console.log(res.modifiedCount)
                            return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
    
                        });
                    });  
                }
                else{
                    dbo.collection(MongoDB.EmployerCollectionName).updateOne(matchparam, { $set: { "profilestatus": 2, "completedon": 0} }, function (err, res) {
                        if (err)
                            throw (err)
                        ////console.log(res.modifiedCount)
                        return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);

                    });
                }
            }

        });
    }
    catch (e) { logger.error("Error in update Profile Status: " + e); }

}

exports.getGovtInfo = function (logparams, empparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employer Govt Identification List on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, gstn: 1, gstnurl: 1, pan: 1, panurl: 1, aadhaarno: 1, aadhaarnourl: 1, documentdetails: 1 } }).toArray(function (err, profileresult) {
            ////console.log(prefresult);
            if (profileresult.length > 0) {
                finalresult = profileresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Employer Govt Identification Info: " + e); }

}

exports.getProfileInfoLoad = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Profile Info Load on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection

        dbo.collection(MongoDB.CompanyTypeCollectionName).aggregate([
            { $unwind: '$companytype' },
            { $match: { statuscode: objConstants.activestatus, 'companytype.languagecode': params } },
            {
                $sort: {
                    'ordervalue': 1
                }
            },
            {
                $project: {
                    _id: 0, companytypecode: 1, companytypename: '$companytype.companytypename', ordervalue:1
                }
            }
        ]).toArray(function (err, companytyperesult) {
            dbo.collection(MongoDB.EmployerTypeCollectionName).aggregate([
                { $unwind: '$employertype' },
                { $match: { statuscode: objConstants.activestatus, 'employertype.languagecode': params } },
                {
                    $sort: {
                        'employertype.employertypename': 1
                    }
                },
                {
                    $project: {
                        _id: 0, employertypecode: 1, employertypename: '$employertype.employertypename'
                    }
                }
            ]).toArray(function (err, employertyperesult) {
                dbo.collection(MongoDB.IndustryCollectionName).aggregate([
                    { $unwind: '$industry' },
                    { $match: { statuscode: objConstants.activestatus, 'industry.languagecode': params } },
                    {
                        $sort: {
                            'industry.industryname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, industrycode: 1, industryname: '$industry.industryname'
                        }
                    }
                ]).toArray(function (err, industryresult) {
                    dbo.collection(MongoDB.ActivityCollectionName).aggregate([
                        { $unwind: '$activitytype' },
                        { $match: { statuscode: objConstants.activestatus, 'activitytype.languagecode': params } },
                        {
                            $sort: {
                                'ordervalue': 1
                            }
                        },
                        {
                            $project: {
                                _id: 0, activitytypecode: 1, activitytypename: '$activitytype.activitytypename', ordervalue: 1
                            }
                        }
                    ]).toArray(function (err, activitytyperesult) {
                        dbo.collection(MongoDB.DocumentTypeCollectionName).aggregate([
                            { $unwind: '$documenttype' },
                            { $match: { statuscode: objConstants.activestatus, 'documenttype.languagecode': params } },
                            {
                                $sort: {
                                    'ordervalue': 1
                                }
                            },
                            {
                                $project: {
                                    _id: 0, documenttypecode: 1, documenttypename: '$documenttype.documenttypename', ordervalue: 1, companytypecode: 1
                                }
                            }
                        ]).toArray(function (err, documenttyperesult) {
                            finalresult = {
                                companytypelist: companytyperesult,
                                employertypelist: employertyperesult,
                                industrylist: industryresult,
                                activitytypelist: activitytyperesult,
                                documenttypelist: documenttyperesult
                            }
                            return callback(finalresult);
                        });
                    });
                   
                });
            });
        });
    }
    catch (e) { logger.error("Error in Employer Profile Info Load: " + e); }

}

exports.getEmpProfileInfo = function (logparams, empparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employer Profile Info List on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, registeredname: 1, companytypecode: 1, employertypecode: 1, industrycode: 1, activitytypecode: 1 } }).toArray(function (err, profileresult) {
            ////console.log(prefresult);
            if (profileresult.length > 0) {
                finalresult = profileresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Employer Profile Info Load: " + e); }

}

exports.profileinfosave = function (params, employercode, logparams, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(employercode) }, { $set: { "registeredname": params.registeredname, "industrycode": Number(params.industrycode), "activitytypecode": Number(params.activitytypecode), "companytypecode": Number(params.companytypecode), "employertypecode": Number(params.employertypecode), "updateddate": milliseconds } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employer Contact Info Update: " + e); }
}