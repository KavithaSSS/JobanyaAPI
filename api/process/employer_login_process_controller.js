'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");

exports.insertLoginActivity = function (logparams, params, callback) {
    try {
        logger.info("Log in insert Login Activity " + logparams.usercode + ", Originator: " + logparams.orginator + ", ipaddress: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.LoginActivity).insertOne(params, function (err, res) {
            // //console.log(res);
            if (err) throw err;
            return callback(res.insertedCount);
        });
    }
    catch (e) { logger.error("Error in Employer Forgor Password: " + e); }
}
exports.checkEmployerLogin = function (logparams, params, req, callback) {
    try {
        var finalresult;
        var support_mobileno = '';
        logger.info("Log in checking Employer Login: UserID: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { $match: params },
            { $unwind: '$contactinfo' },
            {
                $project:
                    { _id: 0, mobileno: '$contactinfo.mobileno', password: 1, employercode: 1, registeredname: 1, registered_email: 1, statuscode: 1, verificationstatus: 1, profileurl: 1 }
            }
        ]).toArray(function (err, empdetails) {
            //console.log(empdetails);
            //dbo.collection(MongoDB.EmployerCollectionName).find(params, { projection: { _id: 0, password: 1, employercode: 1, registeredname: 1, registered_email: 1, statuscode: 1, verificationstatus: 1, profileurl: 1 } }).toArray(function (err, empdetails) {
            if (empdetails != null && empdetails.length > 0) {
              
                if (empdetails[0].statuscode != objConstants.activestatus) {
                    finalresult = {
                        "statuscode": empdetails[0].statuscode,
                        "verificationstatus": empdetails[0].verificationstatus,
                        "result": false
                    }
                    
                    return callback(finalresult);
                }
                else {
                  
                    dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                        if (result != null && result.length > 0) {
                            support_mobileno = result[0].supportmobileno
                        }
                        
                      
                    // objUtilities.decryptpassword(logparams, empdetails[0].password, function (passwordresult) {
                        ////console.log(passwordresult);
                        if (empdetails[0].registered_email.toLowerCase() == req.query.registered_email.toLowerCase()) {
                            ////console.log(doc);
                            finalresult = {
                                "registered_email": empdetails[0].registered_email,
                                "registeredname": empdetails[0].registeredname,
                                "employercode": empdetails[0].employercode,
                                "statuscode": empdetails[0].statuscode,
                                "verificationstatus": empdetails[0].verificationstatus,
                                "imageurl": empdetails[0].profileurl,
                                "mobileno": empdetails[0].mobileno,
                                "result": true,
                                "supportmobileno": support_mobileno
                            }
                            ////console.log(finalresult);

                        }
                        else {
                            finalresult = {
                                "result": false
                            }
                        }

                        return callback(finalresult);
                    // });
                });
                }
                ////console.log(finalresult);

            }
            else {
                finalresult = {
                    "result": false
                }
                return callback(finalresult);
            }

        });


    }
    catch (e) { logger.error("Error in checking Employer Login: " + e); }
}
exports.forgotpassword = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Employee Forgot Password: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", ipaddress: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        objUtilities.encryptpassword(logparams, req.query.password, function (encryptpassword) {

            dbo.collection(MongoDB.EmployerCollectionName).findOneAndUpdate({ "registered_email": req.query.registered_email }, { $set: { "password": encryptpassword } }, function (err, res) {
                // //console.log(res);
                if (err) throw err;
                ////console.log(res.lastErrorObject.updatedExisting);
                return callback(res.lastErrorObject.updatedExisting);

            });
        });
    }
    catch (e) { logger.error("Error in Employer Forgor Password: " + e); }
}
exports.registerationload = function (logparams, req, callback) {
    try {
        var finalresult;
        // //console.log(logparams.employercode);
        logger.info("Log in Employer load : UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var params = Number(req.query.languagecode);
        dbo.collection(MongoDB.StateCollectionName).aggregate([
            { $unwind: '$state' },
            { $match: { statuscode: objConstants.activestatus, 'state.languagecode': params } },
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
            dbo.collection(MongoDB.DistrictCollectionName).aggregate([
                { $unwind: '$district' },
                { $match: { statuscode: objConstants.activestatus, 'district.languagecode': params } },
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

                dbo.collection(MongoDB.TalukCollectionName).aggregate([
                    { $unwind: '$taluk' },
                    { $match: { statuscode: objConstants.activestatus, 'taluk.languagecode': params } },
                    {
                        $sort: {
                            'taluk.talukname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, talukcode: 1, talukname: '$taluk.talukname', statecode: 1,
                            districtcode: 1
                        }
                    }
                ]).toArray(function (err, talukresult) {
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
                                _id: 0, companytypecode: 1, companytypename: '$companytype.companytypename', ordervalue: 1
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
                                dbo.collection(MongoDB.FacilityCollectionName).aggregate([
                                    { $unwind: '$facility' },
                                    { $match: { statuscode: objConstants.activestatus, 'facility.languagecode': params } },
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
                                    dbo.collection(MongoDB.KonwnFromCollectionName).aggregate([
                                        { $unwind: '$knownfrom' },
                                        { $match: { statuscode: objConstants.activestatus, 'knownfrom.languagecode': params } },
                                        {
                                            $sort: {
                                                'ordervalue': 1
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 0, knownfromcode: 1, knownfromname: '$knownfrom.knownfromname', isneedinput: 1, isuser: 1, ordervalue: 1
                                            }
                                        }
                                    ]).toArray(function (err, knowntyperesult) {
                                        dbo.collection(MongoDB.UserCollectionName).aggregate([
                                            { $match: { statuscode: objConstants.activestatus } },
                                            {
                                                $sort: {
                                                    username: 1
                                                }
                                            },
                                            {
                                                $project: {
                                                    _id: 0, usercode: 1, username: 1, userrolecode: 1
                                                }
                                            }
                                        ]).toArray(function (err, userresult) {
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
                                                dbo.collection(MongoDB.TurnOverSlabCollectionName).aggregate([
                                                    { $unwind: '$slabs' },
                                                    { $match: { statuscode: objConstants.activestatus, 'slabs.languagecode': params } },
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
                                                            "statelist": stateresult,
                                                            "districtlist": districtresult,
                                                            "taluklist": talukresult,
                                                            "companytypelist": companytyperesult,
                                                            "employertypelist": employertyperesult,
                                                            "industrylist": industryresult,
                                                            "facilitylist": facilityresult,
                                                            "knowntypelist": knowntyperesult,
                                                            "userlist": userresult,
                                                            "activitytypelist": activitytyperesult,
                                                            "turnoverslabresult": turnoverslabresult,
                                                            "documenttypelist": documenttyperesult
                                                        }
                                                        ////console.log(finalresult)
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
            });
        });
    }
    catch (e) {
        logger.error("Error in Employer load: " + e);
    }
}
exports.getMaxcode = function (callback) {
    try {
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find().sort([['employercode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].employercode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Employer Getting Max Code: " + e); }
}

exports.InsertEmployer = function (logparams, insertparams, callback) {
    try {
        logger.info("Log in Insert Employer: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // //console.log(insertparams);
        dbo.collection(MongoDB.EmployerCollectionName).insertOne(insertparams, function (err, res) {
            // //console.log(res);
            if (err) throw err;
            return callback(res.insertedCount);
        });
    }
    catch (e) {
        logger.error("Error in insert - Employer " + e);
    }
}

exports.CheckDecryptPassword = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        logger.info("Check decrypt Password: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployerCollectionName).find({ "employercode": Number(req.query.employercode) }, { projection: { _id: 0, password: 1 } }).toArray(function (err, result) {
            objUtilities.decryptpassword(logparams, result[0].password, function (decryptpassword) {
                console.log('decryptpassword',decryptpassword);
                console.log('old',req.query.oldpassword);
                if (req.query.oldpassword == decryptpassword)
                    res = true;
                else
                    res = false;
                return callback(res);
            });
        })
    }
    catch (ex) {
        logger.error("Error in Check decrypt Password : " + e);
    }
}
exports.ChangeNewpassword = function (logparams, req, callback) {
    try {
        logger.info("Change New Password : UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "employercode": Number(req.query.employercode) }).toArray(function (err, doc) {
            if (doc.length > 0) {
                objUtilities.encryptpassword(logparams, req.query.newpassword, function (encryptpassword) {
                    dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.employercode) }, { $set: { "password": encryptpassword } }, function (err, res) {
                        if (err) throw err;
                        ////console.log(res.modifiedCount);
                        return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
                    });
                });
            }
            else {
                return callback(false);
            }

        });
    }
    catch (e) {
        { logger.error("Error in Change New password: " + e); }
    }
}
exports.CheckMailNameExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employer Email Id : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "registered_email": { $regex: "^" + req.query.registered_email + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            ////console.log("employercount",doc);
            if (doc != null && doc.length > 0) {
                var statuscode;
                if (doc[0].statuscode == objConstants.inactivestatus) {
                    statuscode = objConstants.deactivateaccountcode;
                }
                else if (doc[0].statuscode == objConstants.blockstatus) {
                    statuscode = objConstants.abusedcode;
                }
                else if (doc[0].statuscode == objConstants.pendingstatus) {
                    statuscode = objConstants.pendingcode;
                }
                else {
                    statuscode = doc[0].statuscode;
                }
                finalresult = {
                    "emailcount": doc.length,
                    "statuscode": statuscode
                }
            }
            else {
                finalresult = {
                    "emailcount": doc.length
                }
            }
            ////console.log(finalresult);
            return callback(finalresult);

        });
    }
    catch (e) { logger.error("Error in checking Employer Email Id: " + e); }
}
exports.CheckmobileNoExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employer mobile no. : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        console.log(JSON.stringify({ "$contactinfo.mobileno": { $regex: "^" + req.query.mobileno + "$", $options: 'i' } }))
        dbo.collection(MongoDB.EmployerCollectionName).find({ "contactinfo.mobileno": { $regex: "^" + req.query.mobileno + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            console.log("employercount",doc);
            if (doc != null && doc.length > 0) {
                var statuscode;
                if (doc[0].statuscode == objConstants.inactivestatus) {
                    statuscode = objConstants.deactivateaccountcode;
                }
                else if (doc[0].statuscode == objConstants.blockstatus) {
                    statuscode = objConstants.abusedcode;
                }
                else if (doc[0].statuscode == objConstants.pendingstatus) {
                    statuscode = objConstants.pendingcode;
                }
                else {
                    statuscode = doc[0].statuscode;
                }
                finalresult = {
                    "emailcount": doc.length,
                    "statuscode": statuscode
                }
            }
            else {
                finalresult = {
                    "emailcount": doc.length
                }
            }
            ////console.log(finalresult);
            return callback(finalresult);

        });
    }
    catch (e) { logger.error("Error in checking Employer Email Id: " + e); }
}
exports.CheckOldMailNameExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employer Email Id : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        ////console.log(req.query.registered_email);
        dbo.collection(MongoDB.EmployerCollectionName).find({ "registered_email": { $regex: "^" + req.query.oldmail + "$", $options: 'i' } }, { $exists: true }).count(function (err, employercount) //find if a value exists
        {
            ////console.log(employerres);
            return callback(employercount);

        });
    }
    catch (e) { logger.error("Error in checking Employer Email Id: " + e); }
}
exports.LanguageDeatils = function (logparams, callback) {
    try {
        var finalresult;
        // //console.log(logparams.employercode);
        logger.info("Log in Employer Language List : UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { statuscode: parseInt(objConstants.defaultstatuscode) }
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            finalresult = {
                "languagelist": languageresult,
            }
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Language List - Employer : " + e);
    }
}
exports.UpdateImage = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Update Profile Image : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.employercode) }, { $set: { "profileurl": req.body.profileurl } }, function (err, result) {
            if (err) throw err;
            // //console.log(result.modifiedCount);
            return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in Update image : employer " + e);
    }
}
exports.UpdateGstn = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Update GSTN Image : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.employercode) }, { $set: { "gstnurl": req.body.gstnurl, "gstn": req.body.gstn } }, function (err, result) {
            if (err) throw err;
            // //console.log(result.modifiedCount);
            return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in Update image : employer " + e);
    }
}
exports.UpdatePan = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Update PAN Image : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.employercode) }, { $set: { "panurl": req.body.panurl, "pan": req.body.pan } }, function (err, result) {
            if (err) throw err;
            // //console.log(result.modifiedCount);
            return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in Update image : employer " + e);
    }
}
exports.UpdateAadhar = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Update Aadhar Image : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.employercode) }, { $set: { "aadhaarnourl": req.body.aadhaarnourl, "aadhaarno": req.body.aadhaarno } }, function (err, result) {
            if (err) throw err;
            // //console.log(result.modifiedCount);
            return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in Update image : employer " + e);
    }
}

exports.Updatedocumentdetails = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Update Aadhar Image : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.employercode) }, { $set: { "documentdetails": req.body.documentdetails } }, function (err, result) {
            if (err) throw err;
            // //console.log(result.modifiedCount);
            return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in Update image : employer " + e);
    }
}

exports.DeactiveEmployer = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Deactivate Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.employercode) }, { $set: { "statuscode": objConstants.inactivestatus } }, function (err, result) {
            if (err) throw err;
            // //console.log(result.modifiedCount);
            return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in Deactivate Employer " + e);
    }
}
exports.ActiveEmployer = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Activate Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).findOneAndUpdate({ "registered_email": req.query.registered_email }, { $set: { "statuscode": objConstants.activestatus } }, function (err, result) {
            if (err) throw err;
            // //console.log(result.lastErrorObject.updatedExisting);
            return callback(result.lastErrorObject.updatedExisting);
        });
    }
    catch (e) {
        logger.error("Error in Activate Employer " + e);
    }
}
exports.UpdateEmail = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Update Email ID: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.employercode) }, { $set: { "registered_email": req.query.registered_email } }, function (err, result) {
            if (err) throw err;
            // //console.log(result.modifiedCount);
            return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in Update Email ID : employer " + e);
    }
}
exports.UpdateVerificationStatus = function (logparams, params, updateparams, callback) {
    try {
        var finalresult;
        logger.info("Log in Employer Update Verification Status: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", ipaddress: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).findOneAndUpdate({ "employercode": Number(params.employercode), "verificationstatus": objConstants.verificationstatus }, { $set: updateparams }, function (err, res) {
            // //console.log(res);
            if (err) throw err;
            ////console.log(res.lastErrorObject.updatedExisting);
            return callback(res.lastErrorObject.updatedExisting);

        });

    }
    catch (e) { logger.error("Error in Employer Update Verification Status: " + e); }
}

exports.checkEmployerCode = function (logparams, params, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employer Code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ employercode: Number(params.employercode), verificationstatus: objConstants.verificationstatus }, { $exists: true }).count(function (err, employercount) //find if a value exists
        {
            // //console.log(employercount);
            return callback(employercount);

        });
    }
    catch (e) { logger.error("Error in checking Employer code: " + e); }
}
exports.CheckVersion = function (logparams, callback) {
    try {
        var finalresult;
        logger.info("Log in Check Version : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.VersionCollectionName).find({ statuscode: objConstants.defaultstatuscode }, { projection: { employeeappversion: 1, employerappversion: 1, isemployeeforceupdate: 1, isemployerforceupdate: 1 } }).toArray(function (err, result) //find if a value exists
        {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in check Version: " + e); }
}

exports.GetAllActiveJobs = function (employercode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        dbo.collection(String(MongoDB.JobPostsCollectionName)).aggregate([
            { $match: { "$and": [{ "employercode": employercode },{ "statuscode": objConstants.approvedstatus }, { "validitydate": { $gte: milliseconds } }] } },
            {$project:{_id: 0,jobcode:1}}
        ]).toArray(function (err, activejobsresult) { 
            return callback(activejobsresult);
        });
    }
    catch (e) { logger.error("Error in Getting All Employees: " + e); }
  }