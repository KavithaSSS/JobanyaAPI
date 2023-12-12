'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');
const { imageurl } = require('../controller/employee_profile_controller');
//Personal Info
exports.getPersonalInfoLoad = function (logparams, langparams, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Personal Info Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var genderparams = { statuscode: objConstants.activestatus, 'gender.languagecode': Number(langparams) };
        dbo.collection(MongoDB.GenderCollectionName).aggregate([
            { $unwind: '$gender' },
            { $match: genderparams },
            {
                $sort: {
                    gendercode: 1
                }
            },
            {
                $project: {
                    _id: 0, gendercode: 1, gendername: '$gender.gendername'
                }
            }
        ]).toArray(function (err, genderresult) {
            //District Collection
            var maritalparams = { statuscode: objConstants.activestatus, 'marital.languagecode': Number(langparams) };
            dbo.collection(MongoDB.MaritalStatusCollectionName).aggregate([
                { $unwind: '$marital' },
                { $match: maritalparams },
                {
                    $sort: {
                        maritalcode: 1
                    }
                },
                {
                    $project: {
                        _id: 0, maritalcode: 1, maritalname: '$marital.maritalname'
                    }
                }
            ]).toArray(function (err, maritalresult) {
                //Job Function Collection
                var languageparams = { statuscode: objConstants.activestatus };
                objUtilities.getLanguageDetails(logparams, function (languageresult) {
                    var langresult = [];
                    var knowntypeadd = [
                        { "knownto": "read", "status": objConstants.defaultdisablecode },
                        { "knownto": "write", "status": objConstants.defaultdisablecode },
                        { "knownto": "speak", "status": objConstants.defaultdisablecode }
                    ];
                    for (var i = 0; i <= languageresult.length - 1; i++) {
                        langresult[i] = {
                            "languagecode": languageresult[i].languagecode,
                            "languagename": languageresult[i].languagename,
                            "displayname": languageresult[i].language,
                            "status": objConstants.defaultdisablecode,
                            "knowntype": knowntypeadd
                        }
                    }
                    finalresult = {
                        "genderlist": genderresult,
                        "maritallist": maritalresult,
                        "languagelist": langresult
                    }
                    return callback(finalresult);
                });
            });
        });
    }
    catch (e) { logger.error("Error in Personal info Load: " + e); }

}

exports.getEmpPersonalInfo = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Profile Info List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, employeecode: 1, personalinfo: 1, "resumeurl": 1, "generatedresumeurl": 1 } }).toArray(function (err, profileresult) {
            // //console.log(profileresult);
            if (profileresult != null && profileresult.length > 0) {
                finalresult = profileresult;
            }            
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Get Personal Info: " + e); }

}

exports.getPersonalInfo = function (logparams, empparams, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        if (isleadtype == null || isleadtype == NaN) {
            // console.log("Hi");
             isleadtype = 0
           }
        //    console.log(isleadtype);
        logger.info("Log in Employee Getting Single Record for Personal Info on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        // dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, employeecode: 1, personalinfo: 1 } }).toArray(function (err, empresult) {
        //     ////console.log(empresult);
        //     if (err) throw err;
        //     if (empresult != null) {
        //         finalresult = empresult;
        //         console.log(empresult);
        //     }
        //     return callback(finalresult);
        // });
        dbo.collection(String(dbCollectionName)).aggregate([{$match: {employeecode: empparams.employeecode}}, { $project: { _id: 0, employeecode: 1, personalinfo: 1 } }]).toArray(function (err, empresult) {
            ////console.log(empresult);
            if (err) throw err;
            if (empresult != null) {
                finalresult = empresult;
                // console.log(empresult);
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Get Personal Info: " + e); }

}

exports.personalinfosave = function (params, employeecode,isleadtype, logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            if(isleadtype == 0){
                dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(employeecode) }, { $set: { "personalinfo": params, "employeename": params.employeefullname } }, function (err, res) {
                    if (err) throw err;
                    finalresult = res.modifiedCount;
                    ////console.log(finalresult);
                    return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
                });
            }
            else{
                dbo.collection(MongoDB.LeadCollectionName).updateOne({ "employeecode": Number(employeecode) }, { $set: { "personalinfo": params, "employeename": params.employeefullname } }, function (err, res) {
                    if (err) throw err;
                    finalresult = res.modifiedCount;
                    ////console.log(finalresult);
                    return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
                });
            }
            

        });

    }
    catch (e) { logger.error("Error in Employee Personal Info Update: " + e); }
}
exports.personalinfoEdit = function (req, employeecode, isleadtype, logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            if(isleadtype == 0){
                dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(employeecode) }, { $set: { "personalinfo": req.body.personalinfo, "employeename": req.body.personalinfo.employeefullname, "contactinfo": req.body.contactinfo } }, function (err, res) {
                    if (err) throw err;
                    finalresult = res.modifiedCount;
                    ////console.log(finalresult);
                    return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
                });
            }
            else{
                dbo.collection(MongoDB.LeadCollectionName).updateOne({ "employeecode": Number(employeecode) }, { $set: { "personalinfo": req.body.personalinfo, "employeename": req.body.personalinfo.employeefullname, "contactinfo": req.body.contactinfo } }, function (err, res) {
                    if (err) throw err;
                    finalresult = res.modifiedCount;
                    ////console.log(finalresult);
                    return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
                });
            }
            

        });

    }
    catch (e) { logger.error("Error in Employee Personal Info Update: " + e); }
}
exports.getContactInfoLoad = function (logparams, langparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Contact Info Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
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
                //taluk Collection
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
                ]).toArray(function (err, talukresult) {
                    finalresult = {
                        "statelist": stateresult,
                        "districtlist": districtresult,
                        "taluklist": talukresult
                    }
                    return callback(finalresult);
                });
            });
        });
    }
    catch (e) { logger.error("Error in Contact Info Load: " + e); }

}

exports.getEmpContactInfo = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Contact Info List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, employeecode: 1, contactinfo: 1 } }).toArray(function (err, profileresult) {
            ////console.log(prefresult);
            if (profileresult.length > 0) {
                finalresult = profileresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Contact Info Load: " + e); }

}

exports.contactinfosave = function (params, employeecode, isleadtype, logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).updateOne({ "employeecode": Number(employeecode) }, { $set: { "contactinfo": params } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employee Contact Info Update: " + e); }
}

exports.UpdateImageurl = function (logparams, req, callback) {
    try {
        logger.info("Updating Image URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        if(Number(req.query.isleadtype)==0){
            dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "imageurl": req.query.imageurl } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
            });
        }
        else
        {
            dbo.collection(MongoDB.LeadCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "imageurl": req.query.imageurl } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
            });
        }
       

    }
    catch (e) { logger.error("Error in Updating Image URL: " + e); }
}

exports.UpdateResumeurl = function (logparams, req, callback) {
    try {
        logger.info("Updating Resume URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "resumeurl": req.query.resumeurl } }, function (err, res) {
            if (err) throw err;
            finalresult = res.modifiedCount;
            ////console.log(finalresult);
            return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
        });

    }
    catch (e) { logger.error("Error in Updating Resume URL: " + e); }
}

exports.CheckProfileStatus = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var personalinfostatus = 0, contactinfostatus = 0, preferencestatus = 0, educationstatus = 0, referenceinfostatus = 0, experiencestatus = 0, skillsstatus = 0, imagestatus = 0;
        var totalpercentage = 0, personalinfopercentage = 0, contactinfopercentage = 0, preferencepercentage = 0, educationpercentage = 0, referenceinfopercentage = 0, experiencepercentage = 0, skillspercentage = 0, photopercentage = 0;
        logger.info("Log in Checking Profile Status in Employee App: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        objUtilities.GetProfilePercentage(function (profilepercentageresult) {
            //console.log(profilepercentageresult);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        
            dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, "employeecode": 1, "personalinfo": 1, "contactinfo": 1, "preferences": 1, "schooling": 1, "afterschooling": 1, "referenceinfo": 1, "experienceinfo": 1, "skills": 1, "fresherstatus": 1, "resumeurl": 1, "generatedresumeurl": 1, "imageurl": 1, "totalexperience": 1 } }).toArray(function (err, profileresult) {
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    if (result != null && result.length > 0) {
                        var pc_eng = result[0].pc_eng
                        var pc_tam = result[0].pc_tam
                        var support_mobileno = result[0].supportmobileno
                        ////console.log(profileresult);
                        if (profileresult!=null && profileresult.length > 0) {
                            if (profileresult[0].personalinfo.dateofbirth != null && profileresult[0].personalinfo.dateofbirth != 0) {
                                personalinfostatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 1);
                                personalinfopercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].contactinfo.talukcode != null && profileresult[0].contactinfo.talukcode != 0) {
                                contactinfostatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 2);
                                contactinfopercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].preferences != null) {
                                preferencestatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 6);
                                preferencepercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].schooling != null && profileresult[0].schooling.length > 0) {
                                educationstatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 3);
                                educationpercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].referenceinfo != null && profileresult[0].referenceinfo.length > 0) {
                                referenceinfostatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 5);
                                referenceinfopercentage = profile[0].profilepercentage;
                            }
                            ////console.log(profileresult[0].fresherstatus);
                            if ((profileresult[0].totalexperience != null && profileresult[0].totalexperience > 0) || (profileresult[0].fresherstatus != null && profileresult[0].fresherstatus == 1)) {
                                experiencestatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 4);
                                experiencepercentage = profile[0].profilepercentage;
                            }
                            ////console.log(profileresult[0]);
                            if (profileresult[0].skills != null && profileresult[0].skills.length > 0) {
                                skillsstatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 7);
                                skillspercentage = profile[0].profilepercentage;
                            }
                            //if (profileresult[0].imageurl != null && profileresult[0].imageurl != "") {
                            if(1==1)
                            {
                                var profile = profilepercentageresult.filter(t => t.profilecode == 8);
                                photopercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].imageurl != null && profileresult[0].imageurl != "") {
                                imagestatus = 1;
                            }
                            else
                            {
                                // console.log(JSON.stringify(profileresult[0].personalinfo))
                                // console.log(profileresult[0].personalinfo.gender)
                                if (profileresult[0].personalinfo.gender != undefined && profileresult[0].personalinfo.gender != null && profileresult[0].personalinfo.gender == 2)
                                    profileresult[0].imageurl = "https://bj-app-images.s3.ap-south-1.amazonaws.com/female.png";
                                else
                                    profileresult[0].imageurl = "https://bj-app-images.s3.ap-south-1.amazonaws.com/male.png";
                            }
                            totalpercentage = personalinfopercentage + contactinfopercentage + preferencepercentage + educationpercentage +
                                referenceinfopercentage + experiencepercentage + skillspercentage + photopercentage;
                            finalresult = {
                                personalinfostatus: personalinfostatus,
                                contactinfostatus: contactinfostatus,
                                preferencestatus: preferencestatus,
                                educationstatus: educationstatus,
                                referenceinfostatus: referenceinfostatus,
                                experiencestatus: experiencestatus,
                                skillsstatus: skillsstatus,
                                imagestatus: imagestatus,
                                imageurl: profileresult[0].imageurl,
                                resumeurl: profileresult[0].resumeurl,
                                generatedresumeurl: profileresult[0].generatedresumeurl,
                                personalinfopercentage: personalinfopercentage,
                                contactinfopercentage: contactinfopercentage,
                                preferencepercentage: preferencepercentage,
                                educationpercentage: educationpercentage,
                                referenceinfopercentage: referenceinfopercentage,
                                experiencepercentage: experiencepercentage,
                                skillspercentage: skillspercentage,
                                photopercentage: photopercentage,
                                totalpercentage: totalpercentage,
                                pc_eng: pc_eng,
                                pc_tam: pc_tam,
                                support_mobileno: support_mobileno
                            };
                            return callback(finalresult);
                        }                        
                    }
                });
            });
        });

    }
    catch (e) { logger.error("Error in Checking Profile Status: " + e); }

}

exports.UpdateProfileStatus = function (employeecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparam = { "employeecode": Number(employeecode) };
        var personalinfostatus = 0, contactinfostatus = 0, preferencestatus = 0, educationstatus = 0, referenceinfostatus = 0, experiencestatus = 0, skillsstatus = 0;
        dbo.collection(MongoDB.EmployeeCollectionName).find(matchparam, { projection: { _id: 0, "employeecode": 1, "personalinfo": 1, "contactinfo": 1, "preferences": 1, "schooling": 1, "afterschooling": 1, "referenceinfo": 1, "experienceinfo": 1, "skills": 1, "fresherstatus": 1, "resumeurl": 1, "generatedresumeurl": 1 } }).toArray(function (err, profileresult) {
            ////console.log(profileresult);
            if (profileresult.length > 0) {
                if (profileresult[0].personalinfo.dateofbirth != null && profileresult[0].personalinfo.dateofbirth != 0)
                    personalinfostatus = 1;
                if (profileresult[0].contactinfo.talukcode != null && profileresult[0].contactinfo.talukcode != 0)
                    contactinfostatus = 1;
                if (profileresult[0].preferences != null)
                    preferencestatus = 1;
                if (profileresult[0].schooling != null && profileresult[0].schooling.length > 0)
                    educationstatus = 1;
                if (profileresult[0].referenceinfo != null && profileresult[0].referenceinfo.length > 0)
                    referenceinfostatus = 1;
                ////console.log(profileresult[0].fresherstatus);
                if ((profileresult[0].totalexperience != null && profileresult[0].totalexperience == 1) || (profileresult[0].fresherstatus != null && profileresult[0].fresherstatus == 1)) {
                    experiencestatus = 1;
                }
                ////console.log(profileresult[0]);
                if (profileresult[0].skills != null && profileresult[0].skills.length > 0)
                    skillsstatus = 1;

                if (skillsstatus == 1 && experiencestatus == 1 && referenceinfostatus == 1 && educationstatus == 1 &&
                    preferencestatus == 1 && contactinfostatus == 1 && personalinfostatus == 1) {
                    objUtilities.getcurrentmilliseconds(function (currenttime) {

                        dbo.collection(MongoDB.EmployeeCollectionName).updateOne(matchparam, { $set: { "profilestatus": 1, "completedon": currenttime } }, function (err, res) {
                            if (err)
                                throw (err)
                            ////console.log(res.modifiedCount)
                            return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);

                        });
                    });
                }
                else {
                    dbo.collection(MongoDB.EmployeeCollectionName).updateOne(matchparam, { $set: { "profilestatus": 2, "completedon": 0 } }, function (err, res) {
                        if (err)
                            throw (err)
                        ////console.log(res.modifiedCount)
                        return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);

                    });
                }
            }

        });
    }
    catch (e) { logger.error("Error in update Profile Status: " + e); }

}
exports.InsertEmployeedetails = function (logparams, params,isleadtype, callback) {
    try {
        var finalresult;
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        logger.info("Log in Insert employee details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbCollectionName)).insertOne(params, function (err, res) {
            if (err)
                throw err;
            ////console.log(res.insertedCount);
            return callback(res.insertedCount);
        });

    }
    catch (e) {
        logger.error("Error in Insert employee details: " + e);
    }
}
exports.checkEmployeeUserNameExists = function (logparams, params, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employee User name  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ username: params }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            dbo.collection(MongoDB.EmployeeCollectionName).find({ mobileno: params }, { $exists: true }).toArray(function (err, mobdoc) //find if a value exists
            {
                dbo.collection(MongoDB.LeadCollectionName).find({ username: { $regex: "^" + String(req.body.username).toLowerCase() + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, leaddoc) //find if a value exists
                {
                    dbo.collection(MongoDB.LeadCollectionName).find({ mobileno: req.body.mobileno }, { $exists: true }).toArray(function (err, leadmobdoc) //find if a value exists
                    {
                        // //console.log(err);
                        ////console.log(mobdoc.length);
                        finalresult = {
                            "usernamecount": doc.length+leaddoc.length,
                            "mobilenocount": mobdoc.length+leadmobdoc.length
                        }
                        // //console.log(finalresult);
                        return callback(finalresult);
                    });
                });
            });

        });
    }
    catch (e) { logger.error("Error in checking Employee User name : " + e); }
}
exports.getMaxcode = function (isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        if(isleadtype == 0){
            dbo.collection(MongoDB.EmployeeCollectionName).find().sort([['employeecode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].employeecode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
        }
        else{
            dbo.collection(MongoDB.EmployeeCollectionName).find().sort([['leadcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].leadcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
        }
        
    }
    catch (e) { logger.error("Error in Employee Getting Max Code: " + e); }
}

exports.getLeadMaxcode = function (callback) {
    try {
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.LeadCollectionName).find().sort([['employeecode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].employeecode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Employee Getting Max Code: " + e); }
}
exports.EmpListLoad = function (logparams, langparams, callback) {
    try {
        logger.info("Employee List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
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
                            _id: 0, talukcode: 1, talukname: '$taluk.talukname',
                            districtcode: 1
                        }
                    }
                ]).toArray(function (err, talukresult) {
                    //Job Function Collection
                    var jobfuncparams = { statuscode: objConstants.activestatus, 'jobfunction.languagecode': Number(langparams) };
                    dbo.collection(MongoDB.JobFunctionCollectionName).aggregate([
                        { $unwind: '$jobfunction' },
                        { $match: jobfuncparams },
                        {
                            $sort: {
                                'jobfunction.jobfunctionname': 1
                            }
                        },
                        {
                            $project: {
                                _id: 0, jobfunctioncode: 1, jobfunctionname: '$jobfunction.jobfunctionname'
                            }
                        }
                    ]).toArray(function (err, jobfunctionresult) {
                        //Job Role Collection
                        var jobroleparams = { statuscode: objConstants.activestatus, 'jobrole.languagecode': Number(langparams) };
                        dbo.collection(MongoDB.JobRoleCollectionName).aggregate([
                            { $unwind: '$jobrole' },
                            { $match: jobroleparams },
                            {
                                $sort: {
                                    'jobrole.jobrolename': 1
                                }
                            },
                            {
                                $project: {
                                    _id: 0, jobrolecode: 1, jobrolename: '$jobrole.jobrolename', jobfunctioncode: 1
                                }
                            }
                        ]).toArray(function (err, jobroleresult) {
                            //Employement Type Collection
                            var emptypeparams = { statuscode: objConstants.activestatus };
                            dbo.collection(MongoDB.JobTypeCollectionName).aggregate([
                                { $unwind: '$jobtype' },
                                { $match: { 'jobtype.languagecode': Number(langparams), statuscode: parseInt(objConstants.activestatus) } },
                                {
                                    $sort: {
                                        'jobtype.jobtypename': 1
                                    }
                                },
                                {
                                    $project:
                                        { _id: 0, employementtypecode: '$jobtypecode', employementtypename: '$jobtype.jobtypename' }
                                }
                            ]).toArray(function (err, emptyperesult) {
                                var genderparams = { statuscode: objConstants.activestatus, 'gender.languagecode': Number(langparams) };
                                dbo.collection(MongoDB.GenderCollectionName).aggregate([
                                    { $unwind: '$gender' },
                                    { $match: genderparams },
                                    {
                                        $sort: {
                                            gendercode: 1
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0, gendercode: 1, gendername: '$gender.gendername'
                                        }
                                    }
                                ]).toArray(function (err, genderresult) {
                                    //District Collection
                                    var maritalparams = { statuscode: objConstants.activestatus, 'marital.languagecode': Number(langparams) };
                                    dbo.collection(MongoDB.MaritalStatusCollectionName).aggregate([
                                        { $unwind: '$marital' },
                                        { $match: maritalparams },
                                        {
                                            $sort: {
                                                maritalcode: 1
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 0, maritalcode: 1, maritalname: '$marital.maritalname'
                                            }
                                        }
                                    ]).toArray(function (err, maritalresult) {
                                        var params = { "statuscode": objConstants.activestatus };
                                        dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
                                            { $unwind: '$educationcategory' },
                                            { $match: { "statuscode": parseInt(objConstants.activestatus), "educationcategory.languagecode": parseInt(objConstants.defaultlanguagecode) } },
                                            {
                                                $sort: {
                                                    ordervalue: 1
                                                }
                                            },
                                            {
                                                $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1, ordervalue: 1 }
                                            }
                                        ]).toArray(function (err, educatresult) {
                                            var params = { "statuscode": objConstants.activestatus, "typecode": objConstants.afterschoolingtypecode };
                                            dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
                                                { $match: params },
                                                {
                                                    $lookup:
                                                    {
                                                        from: String(MongoDB.QualificationCollectionName),
                                                        localField: 'educationcategorycode',
                                                        foreignField: 'educationcategorycode',
                                                        as: 'qualification'
                                                    }
                                                },
                                                { $unwind: '$qualification' },
                                                {
                                                    $sort: {
                                                        'qualification.qualificationname': 1
                                                    }
                                                },
                                                {
                                                    $project: {
                                                        _id: 0, educationcategorycode: '$qualification.educationcategorycode', qualificationcode: '$qualification.qualificationcode', qualificationname: '$qualification.qualificationname'
                                                    }
                                                }
                                            ]).toArray(function (err, qualresult) {
                                                dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
                                                    { $match: params },
                                                    {
                                                        $lookup:
                                                        {
                                                            from: String(MongoDB.SpecializationCollectionName),
                                                            localField: 'educationcategorycode',
                                                            foreignField: 'educationcategorycode',
                                                            as: 'specializationinfo'
                                                        }
                                                    },
                                                    { $unwind: '$specializationinfo' },
                                                    { $unwind: '$specializationinfo.specialization' },
                                                    { $match: { "specializationinfo.specialization.languagecode": Number(langparams) } },
                                                    {
                                                        $lookup:
                                                        {
                                                            from: String(MongoDB.Quali_Spec_MappingCollectionName),
                                                            localField: 'specializationinfo.specializationcode',
                                                            foreignField: 'specializationcode',
                                                            as: 'specinfo'
                                                        }
                                                    },
                                                    { $unwind: '$specinfo' },
                                                    {
                                                        $sort: {
                                                            'specializationinfo.specialization.specializationname': 1
                                                        }
                                                    },
                                                    {
                                                        $project: {
                                                            _id: 0, educationcategorycode: '$specializationinfo.educationcategorycode', specializationcode: '$specializationinfo.specializationcode', specializationname: '$specializationinfo.specialization.specializationname', qualificationcode: '$specinfo.qualificationcode'
                                                        }
                                                    }
                                                ]).toArray(function (err, specialresult) {
                                                    var skillparams = { statuscode: objConstants.activestatus, 'skill.languagecode': Number(langparams) };
                                                    dbo.collection(String(MongoDB.SkillsMappingCollectionName)).aggregate([
                                                        {
                                                            $lookup:
                                                            {
                                                                from: String(MongoDB.SkillCollectionName),
                                                                localField: 'skillcode',
                                                                foreignField: 'skillcode',
                                                                as: 'skillinfo'
                                                            }
                                                        },
                                                        { $unwind: '$skillinfo' },
                                                        { $unwind: '$skillinfo.skill' },
                                                        { $match: { "skillinfo.statuscode": objConstants.activestatus, "skillinfo.skill.languagecode": Number(langparams) } },
                                                        {
                                                            $sort: {
                                                                'skillinfo.skill.skillname': 1
                                                            }
                                                        },
                                                        {
                                                            $project: {
                                                                _id: 0, jobrolecode: 1, jobfunctioncode: 1, skillname: '$skillinfo.skill.skillname', skillcode: 1
                                                            }
                                                        }
                                                    ]).toArray(function (err, skillresult) {
                                                        dbo.collection(MongoDB.UserCollectionName).aggregate([
                                                            { $match: { statuscode: parseInt(objConstants.activestatus) } },
                                                            {
                                                                $sort: {
                                                                    username: 1
                                                                }
                                                            },
                                                            {
                                                                $project: { _id: 0, usercode: 1, username: 1, nameoftheuser: 1, designationcode: 1, userrolecode: 1 }
                                                            }
                                                        ]).toArray(function (err, userresult) {
                                                            dbo.collection(MongoDB.KonwnFromCollectionName).aggregate([
                                                                { $unwind: '$knownfrom' },
                                                                { $match: { 'knownfrom.languagecode': Number(langparams), statuscode: parseInt(objConstants.activestatus) } },
                                                                {
                                                                    $sort: {
                                                                        'ordervalue': 1
                                                                    }
                                                                },
                                                                {
                                                                    $project: { _id: 0, knownfromcode: 1, knownfromname: '$knownfrom.knownfromname', isneedinput: 1, isuser: 1, ordervalue: 1 }
                                                                }
                                                            ]).toArray(function (err, knownresult) {
                                                                dbo.collection(MongoDB.ChatTypeCollectionName).aggregate([
                                                                    { $match: { $and: [{ statuscode: parseInt(objConstants.activestatus) }, { chattypecode: { $in: [1, 3] } }] } },
                                                                    {
                                                                        $sort: {
                                                                            chattypecode: 1
                                                                        }
                                                                    },
                                                                    {
                                                                        $project: { _id: 0, chattypecode: 1, chattypename: 1 }
                                                                    }
                                                                ]).toArray(function (err, chattyperesult) {
                                                                    objUtilities.GetProfilePercentage(function (profilepercentageresult) {
                                                                        //console.log("profilepercentageresult",profilepercentageresult);
                                                                        finalresult = {
                                                                            "statelist": stateresult,
                                                                            "districtlist": districtresult,
                                                                            "taluklist": talukresult,
                                                                            "jobfunctionlist": jobfunctionresult,
                                                                            "jobrolelist": jobroleresult,
                                                                            "employementtypelist": emptyperesult,
                                                                            "genderlist": genderresult,
                                                                            "maritallist": maritalresult,
                                                                            "qualificationlist": qualresult,
                                                                            "specializationlist": specialresult,
                                                                            "skilllist": skillresult,
                                                                            "userlist": userresult,
                                                                            "knownlist": knownresult,
                                                                            "educationcategorylist": educatresult,
                                                                            "chattyperesult": chattyperesult,
                                                                            "profilecategoryresult": profilepercentageresult
                                                                        }
                                                                        //console.log(finalresult);
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
                    });
                });
            });
        });
    }
    catch (e) {
        logger.error("Error in Employee List: " + e);
    }
}

exports.EmpList = function (logparams, req, callback) {
    try {
        logger.info("Employee List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        if (req.query.inactivedays != null) {
            date.setDate(date.getDate() - req.query.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        }
        if (Number(req.query.statuscode) == 0) { var condition = { "statuscode": { $ne: objConstants.deletestatus }, lastlogindate: { $lte: milliseconds } }; }
        else { var condition = { statuscode: Number(req.query.statuscode), lastlogindate: { $lte: milliseconds } }; }
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: condition },
            {
                "$project": {
                    _id: 0,
                    "employeecode": 1, "employeename": 1, mobileno: 1, statuscode: 1, registervia: 1, createddate: 1, personalinfo: 1, lastlogindate: 1,
                    contactinfo: 1, referenceinfo: 1, experienceinfo: 1, schooling: 1, afterschooling: 1, skills: 1, preferences: 1, totalexperience: 1, fresherstatus: 1
                }
            }
        ]).toArray(function (err, emplist) {
            return callback(emplist);
        });
    }
    catch (e) {
        logger.error("Error in Employee List: " + e);
    }
}


exports.GetEmpExcelList = function (logparams, req, callback) {
    try {
        logger.info("Employee List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {}, usercode = {};
        var profilepercentage = {}, personalinfo = {}, contactinfo = {}, preference = {}, education = {},
            referenceinfo = {}, experience = {}, skills = {}, photo = {}, profileparams = {}, registereddate = {};
        var date = new Date();
        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = {};
        var sortbycode = req.query.sortbycode;
        var sortbyparams;
        if (req.query.isleadtype == null) {
            req.query.isleadtype = 0
          }
        if (sortbycode == 7 || sortbycode == 19)
            sortbyparams = { 'totalexperience': 1, 'employeecode': -1 };
        else if (sortbycode == 8 || sortbycode == 20)
            sortbyparams = { 'totalexperience': -1, 'employeecode': -1 };
        else if (sortbycode == 9 || sortbycode == 21)
            sortbyparams = { 'joiningdays': 1, 'employeecode': -1 };
        else if (sortbycode == 10 || sortbycode == 22)
            sortbyparams = { 'joiningdays': -1, 'employeecode': -1 };
        else if (sortbycode == 11 || sortbycode == 23)
            sortbyparams = { 'salarymax': 1, 'employeecode': -1 };
        else if (sortbycode == 12 || sortbycode == 24)
            sortbyparams = { 'salarymax': -1, 'employeecode': -1 };
        else if (sortbycode == 13 || sortbycode == 25)
            sortbyparams = { 'lastlogindate': -1, 'employeecode': -1 };
        else if (sortbycode == 14 || sortbycode == 26)
            sortbyparams = { 'lastlogindate': 1, 'employeecode': -1 };
        else if (sortbycode == 27)
            sortbyparams = { 'createddate': 1, 'employeecode': -1 };
        else if (sortbycode == 28)
            sortbyparams = { 'createddate': -1, 'employeecode': -1 };
        else
            sortbyparams = { 'lastlogindate': -1, 'totalexperience': -1, 'employeecode': -1 };
        if (listparams.percentagefrom > 0 || listparams.percentageto > 0) {
            profilepercentage = { $and: [{ totalpercentage: { $gte: listparams.percentagefrom } }, { totalpercentage: { $lte: listparams.percentageto } }] };
        }
        if (listparams.registeredfrom > 0 && listparams.registeredto > 0) {
            registereddate = { $and: [{ createddate: { $gte: listparams.registeredfrom } }, { createddate: { $lte: listparams.registeredto } }] };
        }
        if (listparams.profilecategory != null && listparams.profilecategory.length > 0) {
            if (listparams.profilecategory.includes(1))
                personalinfo = { personalinfopercentage: { $eq: 0 } };
            // else
            //     personalinfo = {personalinfopercentage:{$eq:0}};
            if (listparams.profilecategory.includes(2))
                contactinfo = { contactinfopercentage: { $eq: 0 } };
            // else
            //     contactinfo = {contactinfopercentage:{$eq:0}};
            if (listparams.profilecategory.includes(6))
                preference = { preferencepercentage: { $eq: 0 } };
            // else   
            //     preference = {preferencepercentage:{$eq:0}};
            if (listparams.profilecategory.includes(3))
                education = { educationpercentage: { $eq: 0 } };
            // else
            //     education = {educationpercentage:{$eq:0}};
            if (listparams.profilecategory.includes(5))
                referenceinfo = { referenceinfopercentage: { $eq: 0 } };
            // else    
            //     referenceinfo = {referenceinfopercentage:{$eq:0}};
            if (listparams.profilecategory.includes(4))
                experience = { experiencepercentage: { $eq: 0 } };
            // else
            //     experience = {experiencepercentage:{$eq:0}};
            if (listparams.profilecategory.includes(7))
                skills = { skillspercentage: { $eq: 0 } };
            // else
            //     skills = {skillspercentage:{$eq:0}};
            if (listparams.profilecategory.includes(8))
                photo = { photopercentage: { $eq: 0 } };
            // else
            //     photo = {photopercentage:{$eq:0}};
        }
        profileparams = { $and: [profilepercentage, personalinfo, contactinfo, preference, education, referenceinfo, experience, skills, photo] };

        //console.log(JSON.stringify(profilepercentage))
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { lastlogindate: { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { lastlogindate: { $gte: milliseconds } };
            ////console.log(activedays);
        }
        if (listparams.searchbymobileno != "") {
            searchbymobileno = { $or: [{ 'mobileno': listparams.searchbymobileno }, { 'contactinfo.altmobileno': listparams.searchbymobileno }] };
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'employeename': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
       
        var fresherinfo, experienceinfo;
        if (explist.length > 0) {
            if (Number(explist[0]) == 0) {
                fresherinfo = { 'fresherstatus': 1 };
                if (explist[1] && explist[2]) {
                    if (Number(explist[2]) != 0) {
                        experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[2]) } }, { 'totalexperience': { '$gte': Number(explist[1]) } }] };
                    }
                } else {
                    if (Number(explist[2]) != 0) {
                        experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[2]) } }, { 'totalexperience': { '$gte': Number(explist[1]) } }] };
                    }
                }
                if (experienceinfo && fresherinfo) {
                    exp = { $or: [fresherinfo, experienceinfo] };
                } else if (experienceinfo) {
                    exp = experienceinfo;
                } else {
                    exp = fresherinfo;
                }

            } else {
                if (explist[0] && explist[1]) {
                    experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[1]) } }, { 'totalexperience': { '$gte': Number(explist[0]) } }] };
                }
                exp = experienceinfo;
            }
        }

        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { $or: [{ 'skills.jobfunctioncode': { $in: listparams.jobfunctioncode } }] };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { $or: [{ 'skills.jobrolecode': { $in: listparams.jobrolecode } }] };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0)// JobType==
            jobtypecode = { $or: [{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } }, { 'preferences.employementtype.employementtypecode': 9 }] };
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'personalinfo.differentlyabled': listparams.differentlyabled };
        if (Number(req.body.statuscode) == 0) { var condition = { "statuscode": { $ne: objConstants.deletestatus } }; }
        else if (Number(req.body.statuscode) == -1) { var condition = { "registervia": { $eq: 1 } }; }
        else if (Number(req.body.statuscode) == 1) { var condition = { $and: [{ "registervia": { $ne: 1 } }, { statuscode: Number(req.body.statuscode) }] }; }
        else { var condition = { statuscode: Number(req.body.statuscode) }; }

        if (listparams.usercode.length > 0)
            usercode = { 'usercode': { $in: listparams.usercode } };
        var profilestatus = {};
        if ((listparams.profilestatus) != 0) {
            if ((listparams.profilestatus) == 2) {
                profilestatus = { $or: [{ 'profilestatus': { $exists: false } }, { 'profilestatus': parseInt(listparams.profilestatus) }] };
            } else {
                profilestatus = { 'profilestatus': parseInt(listparams.profilestatus) };
            }
        }
        var languagecodecondition = {};
        if (listparams.languagecode && (listparams.languagecode) != 0)
            languagecodecondition = { 'preferredlanguagecode': listparams.languagecode };

        var matchparams = {
            $and: [profilestatus, languagecodecondition, locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays,
                activedays, exp, usercode,registereddate,
                { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
        var dbCollectionName = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        if (matchparams != "") {
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
               
                dbo.collection(String(dbCollectionName)).aggregate([
                    // {$project: {
                    //     employeecode: 1,
                    //     employeename: 1,
                    //     contactinfo: 1,
                    //     preferences: 1,
                    //     schooling: 1,
                    //     afterschooling: 1,
                    //     size: { $size:{ $ifNull: ["$schooling", 0] } }
                    // }},
                    { $match: matchparams },
                    { $unwind: { path: '$contactinfo', preserveNullAndEmptyArrays: true } },
	{ $unwind: { path: '$preferences.location', preserveNullAndEmptyArrays: true } },
	{ $unwind: { path: '$schooling', preserveNullAndEmptyArrays: true } },
	{ $unwind: { path: '$afterschooling', preserveNullAndEmptyArrays: true } },
	{
		$lookup: {
		from: "tbl_cp_district",
		localField: 'contactinfo.districtcode',
		foreignField: 'districtcode',
		as: 'districtinfo'
		}
	},
	{ $unwind: { path: '$districtinfo', preserveNullAndEmptyArrays: true } },
	{ $unwind: { path: '$districtinfo.district', preserveNullAndEmptyArrays: true } },
	{ $match: { $or: [{ "districtinfo.district.languagecode": { $exists: false } }, { "districtinfo.district.languagecode": "" }, { "districtinfo.district.languagecode": 2 }] } },
	{
		$lookup: {
		from: "tbl_cp_district",
		localField: 'preferences.location.locationcode',
		foreignField: 'districtcode',
		as: 'preferredlocationinfo'
		}
	},
    { $unwind: { path: '$preferredlocationinfo', preserveNullAndEmptyArrays: true } },
	{ $unwind: { path: '$preferredlocationinfo.district', preserveNullAndEmptyArrays: true } },
	{ $match: { $or: [{ "preferredlocationinfo.district.languagecode": { $exists: false } }, { "preferredlocationinfo.district.languagecode": "" }, { "preferredlocationinfo.district.languagecode": 2 }] } },
	{
		$lookup: {
			from: "tbl_def_educationcategory",
			localField: 'schooling.qualificationcode',
			foreignField: 'educationcategorycode',
			as: 'schoolinginfo'
		}
	},
	{ $unwind: { path: '$schoolinginfo', preserveNullAndEmptyArrays: true } },
	{ $unwind: { path: '$schoolinginfo.educationcategory', preserveNullAndEmptyArrays: true } },
	{ $match: { $or: [{ "schoolinginfo.educationcategory.languagecode": { $exists: false } }, { "schoolinginfo.educationcategory.languagecode": "" }, { "schoolinginfo.educationcategory.languagecode": 2 }] } },
	{
		$lookup: {
			from: "tbl_def_educationcategory",
			localField: 'afterschooling.educationcategorycode',
			foreignField: 'educationcategorycode',
			as: 'afterschoolingeduinfo'
		}
	},
	{ $unwind: { path: '$afterschoolingeduinfo', preserveNullAndEmptyArrays: true } },
	{ $unwind: { path: '$afterschoolingeduinfo.educationcategory', preserveNullAndEmptyArrays: true } },
	{ $match: { $or: [{ "afterschoolingeduinfo.educationcategory.languagecode": { $exists: false } }, { "afterschoolingeduinfo.educationcategory.languagecode": "" }, { "afterschoolingeduinfo.educationcategory.languagecode": 2 }] } },
	{
		$lookup: {
			from: "tbl_cp_qualification",
			localField: 'afterschooling.qualificationcode',
			foreignField: 'qualificationcode',
			as: 'qualificationinfo'
		}
	},
	{ $unwind: { path: '$qualificationinfo', preserveNullAndEmptyArrays: true } },
	{ "$lookup": 
		{
			 "from": "tbl_cp_specialization",
			 "localField": "afterschooling.specializationcode",
			 "foreignField": "specializationcode",
			 "as": "specializationinfo"
		}
	},
    { $unwind: { path: '$specializationinfo', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$specializationinfo.specialization', preserveNullAndEmptyArrays: true } },
	
	{ $match: {$or:[{ "specializationinfo.specialization.languagecode": { $exists: false } }, { "specializationinfo.specialization.languagecode": "" }, {"specializationinfo.specialization.languagecode": 2}]}},
	
	{
		$lookup: {
			from: "tbl_cp_jobrole",
			localField: 'preferences.jobrole.jobrolecode',
			foreignField: 'jobrolecode',
			as: 'jobroleinfo'
		}
	},
	{ $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
	{ $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
	{ $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": 2 }] } },
	{
		$group: {
		  _id: {
				"employeecode": '$employeecode', 
				"employeename": { $ifNull: ["$employeename", '-'] },
				districtname : {$ifNull: ['$districtinfo.district.districtname', '-']},
				contactmobileno: { $ifNull: ['$contactinfo.mobileno', '-'] },  
				contactemailid: { $ifNull: ['$contactinfo.emailid', '-'] },
				personalinfopercentage: {
					$cond: [{ $and: [{ $ifNull: ['$personalinfo', false] }, { $ifNull: ['$personalinfo.dateofbirth', false] }, { $gt: [{ $type: '$personalinfo.dateofbirth' }, 0], }] },
					20, 0
					]
				},
				contactinfopercentage: {
					$cond: [{ $and: [{ $ifNull: ['$contactinfo', false] }, { $ifNull: ['$contactinfo.talukcode', false] }, { $gt: [{ $type: '$contactinfo.talukcode' }, 0], }] },
					20, 0
					]
				},
				preferencepercentage: {
					$cond: [{ $ifNull: ['$preferences', false] },
					5, 0
					]
				},
			    referenceinfopercentage: {
					$cond: [{ $and: [{ $ifNull: ['$referenceinfo', false] }, { $gt: [{ $size: "$referenceinfo" }, 0] }] },
					5, 0
					]
				},
				experiencepercentage: {
					$cond: [{ $or: [{ $and: [{ $ifNull: ['$totalexperience', false] }, { $gt: [{ $type: '$totalexperience' }, 0] }] }, { $and: [{ $ifNull: ['$fresherstatus', false] }, { $gt: [{ $type: '$fresherstatus' }, 0] }] }] },
					15, 0
					]
				},
			    skillspercentage: {
					$cond: [{ $and: [{ $ifNull: ['$skills', false] }, { $gt: [{ $size: "$skills" }, 0] }] },
					10, 0
					]
				},
				photopercentage: {
					$cond: [{ $and: [{ $ifNull: ['$imageurl', false] }, { $ne: [{ $type: '$imageurl' }, ''] }] },
					5, 5
					]
				}
			
			},
			"preferedlocation_list":{
				$addToSet: "$preferredlocationinfo.district.districtname"
			},
			"schooling_list": {
                $addToSet:  { $cond : [{ $and: [{ $ifNull: ['$schooling.institution', false] }, { $ne: [{ $type: "$schooling.institution" }, ''] }] },
                { $concat: ["$schoolinginfo.educationcategory.educationcategoryname", " - ", "$schooling.institution", " - ", "$schooling.location", " - ", { $toString: "$schooling.percentage"}, " - ", { $toString: "$schooling.yearofpassing"}]}, "$$REMOVE"
                 ]}
                
                
				//$addToSet:  { $concat: ["$schoolinginfo.educationcategory.educationcategoryname", " - ", "$schooling.institution", " - ", "$schooling.location", " - ", { $toString: "$schooling.percentage"}, " - ", { $toString: "$schooling.yearofpassing"}]}
			},
			"afterschooling_list": {
				$addToSet:  { $concat: ["$afterschoolingeduinfo.educationcategory.educationcategoryname", " - ", "$qualificationinfo.qualificationname", " - ", "$specializationinfo.specialization.specializationname" , " - ", "$afterschooling.institution", " - ", "$afterschooling.location", " - ", { $toString: "$afterschooling.percentage"}, " - ", { $toString: "$afterschooling.yearofpassing"}]}
			},
			"jobrole_list":{
				$addToSet: "$jobroleinfo.jobrole.jobrolename"
			},
		}
	},
	{
		"$project": {
			_id: 0,
			
			"Employee_Name": '$_id.employeename',
			"District_Name": '$_id.districtname',
			"Contact_Mobileno": '$_id.contactmobileno',  
			"Contact_Emailid": '$_id.contactemailid',
			"Prefered_LocationName": '$preferedlocation_list',
			"Schooling_List": '$schooling_list',
			"Afterschooling_List": '$afterschooling_list',
			"Preferred_Jobs": '$jobrole_list',
			"PersonalInfoPercentage": '$_id.personalinfopercentage',
			"ContactInfoPercentage": '$_id.contactinfopercentage',
			"PreferencePercentage": '$_id.preferencepercentage',
			"EducationPercentage": 
			{
				$cond: [{ $and: [{ $ifNull: ['$schooling_list', false] }, { $gt: [{ $size: "$schooling_list" }, 0] }] },
			   20, 0
				]
			},
			"ReferenceInfoPercentage": '$_id.referenceinfopercentage',
			"ExperiencePercentage": '$_id.experiencepercentage',
			"SkillsPercentage": '$_id.skillspercentage',
			"PhotoPercentage": '$_id.photopercentage'
		},
	},
	{
		$addFields: {
			"Total_Percentage":
			{
				$add: ["$PhotoPercentage", "$SkillsPercentage", "$ExperiencePercentage", "$ReferenceInfoPercentage",
					"$EducationPercentage", "$PreferencePercentage", "$ContactInfoPercentage", "$PersonalInfoPercentage"]
			}
		}
	},
                    { $match: profileparams },
                    { $sort: sortbyparams },
                    // { $skip:0},
                    // { $limit: 20000 }
                ],{ allowDiskUse: true }).toArray(function (err, emplist) {
                    if (emplist != null && emplist.length > 0) {
                        // console.log(JSON.stringify(matchparams))
                        // console.log(JSON.stringify(profileparams))
                        // var activecount, inactivecount, blockcount, pendingcount , rejectedcount , regviaapp, regviaportal , totalcount =0;
                        // activecount = emplist.filter(t => t.statuscode == objConstants.activestatus);
                        // inactivecount = emplist.filter(t => t.statuscode == objConstants.inactivestatus);
                        // blockcount = emplist.filter(t => t.statuscode == objConstants.blockstatus);
                        // pendingcount = emplist.filter(t => t.statuscode == objConstants.pendingstatus);
                        // rejectedcount = emplist.filter(t => t.statuscode == objConstants.rejectedstatus);
                        // regviaapp = emplist.filter(t => t.registervia == 1);
                        // regviaportal = emplist.filter(t => t.registervia == 2);
                        // totalcount = activecount.length + inactivecount.length + blockcount.length + pendingcount.length + rejectedcount.length;
                        //var percentage = {"percentagetext": "20 %","percentagevalue": 20,"percentagecount":percentage_20.length};
                        var finalresult={
                            emplist: emplist,
                            // activecount: activecount.length,
                            // inactivecount: inactivecount.length,
                            // blockcount: blockcount.length,
                            // pendingcount: pendingcount.length,
                            // rejectedcount: rejectedcount.leadcode,
                            // totalcount: totalcount,
                            // regviaapp: regviaapp.length,
                            // regviaportal: regviaportal.length
                        };
                        // finalresult.push(activecount.length);
                        // finalresult.push(inactivecount.length);
                        // finalresult.push(blockcount.length);
                        // finalresult.push(pendingcount.length);
                        // finalresult.push(rejectedcount.length);
                        // finalresult.push(totalcount);                        
                        // finalresult.push(regviaapp.length);
                        // finalresult.push(regviaportal.length);
                        return callback(emplist);
                      }
                    //return callback(emplist);
                });
            });

        }
        else {
            return callback(finalresult);
        }

    }
    catch (e) {
        logger.error("Error in Employee Excel List: " + e);
    }
}


exports.GetEmpList = function (logparams, req, callback) {
    try {
        logger.info("Employee List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {}, usercode = {};
        var profilepercentage = {}, personalinfo = {}, contactinfo = {}, preference = {}, education = {},
            referenceinfo = {}, experience = {}, skills = {}, photo = {}, profileparams = {}, registereddate = {};
        var date = new Date();
        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = {};
        var sortbycode = req.query.sortbycode;
        var sortbyparams;
        if (req.query.isleadtype == null) {
            req.query.isleadtype = 0
          }
        if (sortbycode == 7 || sortbycode == 19)
            sortbyparams = { 'totalexperience': 1, 'employeecode': -1 };
        else if (sortbycode == 8 || sortbycode == 20)
            sortbyparams = { 'totalexperience': -1, 'employeecode': -1 };
        else if (sortbycode == 9 || sortbycode == 21)
            sortbyparams = { 'joiningdays': 1, 'employeecode': -1 };
        else if (sortbycode == 10 || sortbycode == 22)
            sortbyparams = { 'joiningdays': -1, 'employeecode': -1 };
        else if (sortbycode == 11 || sortbycode == 23)
            sortbyparams = { 'salarymax': 1, 'employeecode': -1 };
        else if (sortbycode == 12 || sortbycode == 24)
            sortbyparams = { 'salarymax': -1, 'employeecode': -1 };
        else if (sortbycode == 13 || sortbycode == 25)
            sortbyparams = { 'lastlogindate': -1, 'employeecode': -1 };
        else if (sortbycode == 14 || sortbycode == 26)
            sortbyparams = { 'lastlogindate': 1, 'employeecode': -1 };
        else if (sortbycode == 27)
            sortbyparams = { 'createddate': 1, 'employeecode': -1 };
        else if (sortbycode == 28)
            sortbyparams = { 'createddate': -1, 'employeecode': -1 };
        else
            sortbyparams = { 'lastlogindate': -1, 'totalexperience': -1, 'employeecode': -1 };
        if (listparams.percentagefrom > 0 || listparams.percentageto > 0) {
            profilepercentage = { $and: [{ totalpercentage: { $gte: listparams.percentagefrom } }, { totalpercentage: { $lte: listparams.percentageto } }] };
        }
        if (listparams.registeredfrom > 0 && listparams.registeredto > 0) {
            registereddate = { $and: [{ createddate: { $gte: listparams.registeredfrom } }, { createddate: { $lte: listparams.registeredto } }] };
        }
        if (listparams.profilecategory != null && listparams.profilecategory.length > 0) {
            if (listparams.profilecategory.includes(1))
                personalinfo = { personalinfopercentage: { $eq: 0 } };
            // else
            //     personalinfo = {personalinfopercentage:{$eq:0}};
            if (listparams.profilecategory.includes(2))
                contactinfo = { contactinfopercentage: { $eq: 0 } };
            // else
            //     contactinfo = {contactinfopercentage:{$eq:0}};
            if (listparams.profilecategory.includes(6))
                preference = { preferencepercentage: { $eq: 0 } };
            // else   
            //     preference = {preferencepercentage:{$eq:0}};
            if (listparams.profilecategory.includes(3))
                education = { educationpercentage: { $eq: 0 } };
            // else
            //     education = {educationpercentage:{$eq:0}};
            if (listparams.profilecategory.includes(5))
                referenceinfo = { referenceinfopercentage: { $eq: 0 } };
            // else    
            //     referenceinfo = {referenceinfopercentage:{$eq:0}};
            if (listparams.profilecategory.includes(4))
                experience = { experiencepercentage: { $eq: 0 } };
            // else
            //     experience = {experiencepercentage:{$eq:0}};
            if (listparams.profilecategory.includes(7))
                skills = { skillspercentage: { $eq: 0 } };
            // else
            //     skills = {skillspercentage:{$eq:0}};
            if (listparams.profilecategory.includes(8))
                photo = { photopercentage: { $eq: 0 } };
            // else
            //     photo = {photopercentage:{$eq:0}};
        }
        profileparams = { $and: [profilepercentage, personalinfo, contactinfo, preference, education, referenceinfo, experience, skills, photo] };

        //console.log(JSON.stringify(profilepercentage))
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { lastlogindate: { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { lastlogindate: { $gte: milliseconds } };
            ////console.log(activedays);
        }
        if (listparams.searchbymobileno != "") {
            searchbymobileno = { $or: [{ 'mobileno': listparams.searchbymobileno }, { 'contactinfo.altmobileno': listparams.searchbymobileno }] };
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'employeename': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        // if (explist.length > 0) {
        //     for (var i = 0; i <= explist.length - 1; i++) {
        //         if (i == 0) {
        //             exp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
        //             //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
        //             // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
        //             ////console.log(exp);
        //         }
        //         else {
        //             var exp1 = [];
        //             exp1 = exp;
        //             var temp = [];
        //             temp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
        //             //temp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
        //             // //console.log(temp);
        //             exp = exp1.concat(temp);
        //             ////console.log(exp);
        //         }
        //     }
        // }
        // else {
        //     exp = [{}];
        // }
        var fresherinfo, experienceinfo;
        if (explist.length > 0) {
            if (Number(explist[0]) == 0) {
                fresherinfo = { 'fresherstatus': 1 };
                if (explist[1] && explist[2]) {
                    if (Number(explist[2]) != 0) {
                        experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[2]) } }, { 'totalexperience': { '$gte': Number(explist[1]) } }] };
                    }
                } else {
                    if (Number(explist[2]) != 0) {
                        experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[2]) } }, { 'totalexperience': { '$gte': Number(explist[1]) } }] };
                    }
                }
                if (experienceinfo && fresherinfo) {
                    exp = { $or: [fresherinfo, experienceinfo] };
                } else if (experienceinfo) {
                    exp = experienceinfo;
                } else {
                    exp = fresherinfo;
                }

            } else {
                if (explist[0] && explist[1]) {
                    experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[1]) } }, { 'totalexperience': { '$gte': Number(explist[0]) } }] };
                }
                exp = experienceinfo;
            }
        }

        //   console.log(exp,'exp')

        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { $or: [{ 'skills.jobfunctioncode': { $in: listparams.jobfunctioncode } }] };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { $or: [{ 'skills.jobrolecode': { $in: listparams.jobrolecode } }] };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0)// JobType==
            jobtypecode = { $or: [{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } }, { 'preferences.employementtype.employementtypecode': 9 }] };
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'personalinfo.differentlyabled': listparams.differentlyabled };
        if (Number(req.body.statuscode) == 0) { var condition = { "statuscode": { $ne: objConstants.deletestatus } }; }
        else if (Number(req.body.statuscode) == -1) { var condition = { "registervia": { $eq: 1 } }; }
        else if (Number(req.body.statuscode) == 1) { var condition = { $and: [{ "registervia": { $ne: 1 } }, { statuscode: Number(req.body.statuscode) }] }; }
        else { var condition = { statuscode: Number(req.body.statuscode) }; }

        if (listparams.usercode.length > 0)
            usercode = { 'usercode': { $in: listparams.usercode } };
        var profilestatus = {};
        if ((listparams.profilestatus) != 0) {
            if ((listparams.profilestatus) == 2) {
                profilestatus = { $or: [{ 'profilestatus': { $exists: false } }, { 'profilestatus': parseInt(listparams.profilestatus) }] };
            } else {
                profilestatus = { 'profilestatus': parseInt(listparams.profilestatus) };
            }
        }
        var languagecodecondition = {};
        if (listparams.languagecode && (listparams.languagecode) != 0)
            languagecodecondition = { 'preferredlanguagecode': listparams.languagecode };

        var matchparams = {
            $and: [profilestatus, languagecodecondition, locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays,
                activedays, exp, usercode,registereddate,
                { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
        var dbCollectionName = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        if (matchparams != "") {
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
                dbo.collection(String(dbCollectionName)).aggregate([
                    { $match: matchparams },
                    
                    {
                        "$project": {
                            _id: 0,
                            "employeecode": 1, "employeename": 1, mobileno: 1, statuscode: 1, registervia: 1, createddate: 1, personalinfo: 1,
                            contactinfo: 1, referenceinfo: 1, experienceinfo: 1, schooling: 1, afterschooling: 1, skills: 1, preferences: 1, totalexperience: 1, expmonth: 1, expyear: 1, fresherstatus: 1, lastlogindate: 1, imageurl: 1,
                            leadcode:1, zohocontactid:1,
                            oldstatuscode: 1, deletedon: 1, recoveredon: 1, profilestatus: 1, completedon: 1, personalinfopercentage: {
                                $cond: [{ $and: [{ $ifNull: ['$personalinfo', false] }, { $ifNull: ['$personalinfo.dateofbirth', false] }, { $gt: [{ $type: '$personalinfo.dateofbirth' }, 0], }] },
                                personalinfopercentage[0].profilepercentage, 0
                                ]
                                // $cond: {
                                //   if: {
                                //     $gt: [{ $type: '$personalinfo.dateofbirth' }, 0],
                                //   },
                                //   then: personalinfopercentage[0].profilepercentage,
                                // else: 0,
                                // },
                            },
                            contactinfopercentage: {
                                $cond: [{ $and: [{ $ifNull: ['$contactinfo', false] }, { $ifNull: ['$contactinfo.talukcode', false] }, { $gt: [{ $type: '$contactinfo.talukcode' }, 0], }] },
                                contactinfopercentage[0].profilepercentage, 0
                                ]
                                // $cond: {
                                //   if: {
                                //     $gt: [{ $type: '$contactinfo.talukcode' }, 0],
                                //   },
                                //   then: contactinfopercentage[0].profilepercentage,
                                // else: 0,
                                // },
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
                    },
                    { $match: profileparams },
                    { $sort: sortbyparams },
                    { $skip: parseInt(listparams.skipvalue) },
                    { $limit: parseInt(listparams.limitvalue) }
                ],{ allowDiskUse: true }).toArray(function (err, emplist) {
                    return callback(emplist);
                });
            });

        }
        else {
            return callback(finalresult);
        }

    }
    catch (e) {
        logger.error("Error in Employee List: " + e);
    }
}

exports.GetEmpListFilter = function (logparams, req, callback) {
    try {
        logger.info("Employee List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {}, usercode = {};
        var profilepercentage = {}, personalinfo = {}, contactinfo = {}, preference = {}, education = {},
            referenceinfo = {}, experience = {}, skills = {}, photo = {}, profileparams = {}, registereddate = {};
        var date = new Date();
        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = {};
        var sortbycode = req.query.sortbycode;
        var sortbyparams;
        if (req.query.isleadtype == null) {
            req.query.isleadtype = 0
          }
        if (sortbycode == 7 || sortbycode == 19)
            sortbyparams = { 'totalexperience': 1, 'employeecode': -1 };
        else if (sortbycode == 8 || sortbycode == 20)
            sortbyparams = { 'totalexperience': -1, 'employeecode': -1 };
        else if (sortbycode == 9 || sortbycode == 21)
            sortbyparams = { 'joiningdays': 1, 'employeecode': -1 };
        else if (sortbycode == 10 || sortbycode == 22)
            sortbyparams = { 'joiningdays': -1, 'employeecode': -1 };
        else if (sortbycode == 11 || sortbycode == 23)
            sortbyparams = { 'salarymax': 1, 'employeecode': -1 };
        else if (sortbycode == 12 || sortbycode == 24)
            sortbyparams = { 'salarymax': -1, 'employeecode': -1 };
        else if (sortbycode == 13 || sortbycode == 25)
            sortbyparams = { 'lastlogindate': -1, 'employeecode': -1 };
        else if (sortbycode == 14 || sortbycode == 26)
            sortbyparams = { 'lastlogindate': 1, 'employeecode': -1 };
        else if (sortbycode == 27)
            sortbyparams = { 'createddate': 1, 'employeecode': -1 };
        else if (sortbycode == 28)
            sortbyparams = { 'createddate': -1, 'employeecode': -1 };
        else
            sortbyparams = { 'lastlogindate': -1, 'totalexperience': -1, 'employeecode': -1 };
        if (listparams.percentagefrom > 0 || listparams.percentageto > 0) {
            profilepercentage = { $and: [{ totalpercentage: { $gte: listparams.percentagefrom } }, { totalpercentage: { $lte: listparams.percentageto } }] };
        }
        if (listparams.registeredfrom > 0 && listparams.registeredto > 0) {
            registereddate = { $and: [{ createddate: { $gte: listparams.registeredfrom } }, { createddate: { $lte: listparams.registeredto } }] };
        }
        if (listparams.profilecategory != null && listparams.profilecategory.length > 0) {
            if (listparams.profilecategory.includes(1))
                personalinfo = { personalinfopercentage: { $eq: 0 } };
            // else
            //     personalinfo = {personalinfopercentage:{$eq:0}};
            if (listparams.profilecategory.includes(2))
                contactinfo = { contactinfopercentage: { $eq: 0 } };
            // else
            //     contactinfo = {contactinfopercentage:{$eq:0}};
            if (listparams.profilecategory.includes(6))
                preference = { preferencepercentage: { $eq: 0 } };
            // else   
            //     preference = {preferencepercentage:{$eq:0}};
            if (listparams.profilecategory.includes(3))
                education = { educationpercentage: { $eq: 0 } };
            // else
            //     education = {educationpercentage:{$eq:0}};
            if (listparams.profilecategory.includes(5))
                referenceinfo = { referenceinfopercentage: { $eq: 0 } };
            // else    
            //     referenceinfo = {referenceinfopercentage:{$eq:0}};
            if (listparams.profilecategory.includes(4))
                experience = { experiencepercentage: { $eq: 0 } };
            // else
            //     experience = {experiencepercentage:{$eq:0}};
            if (listparams.profilecategory.includes(7))
                skills = { skillspercentage: { $eq: 0 } };
            // else
            //     skills = {skillspercentage:{$eq:0}};
            if (listparams.profilecategory.includes(8))
                photo = { photopercentage: { $eq: 0 } };
            // else
            //     photo = {photopercentage:{$eq:0}};
        }
        profileparams = { $and: [profilepercentage, personalinfo, contactinfo, preference, education, referenceinfo, experience, skills, photo] };

        //console.log(JSON.stringify(profilepercentage))
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { lastlogindate: { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { lastlogindate: { $gte: milliseconds } };
            ////console.log(activedays);
        }
        if (listparams.searchbymobileno != "") {
            searchbymobileno = { $or: [{ 'mobileno': listparams.searchbymobileno }, { 'contactinfo.altmobileno': listparams.searchbymobileno }] };
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'employeename': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        // if (explist.length > 0) {
        //     for (var i = 0; i <= explist.length - 1; i++) {
        //         if (i == 0) {
        //             exp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
        //             //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
        //             // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
        //             ////console.log(exp);
        //         }
        //         else {
        //             var exp1 = [];
        //             exp1 = exp;
        //             var temp = [];
        //             temp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
        //             //temp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
        //             // //console.log(temp);
        //             exp = exp1.concat(temp);
        //             ////console.log(exp);
        //         }
        //     }
        // }
        // else {
        //     exp = [{}];
        // }
        var fresherinfo, experienceinfo;
        if (explist.length > 0) {
            if (Number(explist[0]) == 0) {
                fresherinfo = { 'fresherstatus': 1 };
                if (explist[1] && explist[2]) {
                    if (Number(explist[2]) != 0) {
                        experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[2]) } }, { 'totalexperience': { '$gte': Number(explist[1]) } }] };
                    }
                } else {
                    if (Number(explist[2]) != 0) {
                        experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[2]) } }, { 'totalexperience': { '$gte': Number(explist[1]) } }] };
                    }
                }
                if (experienceinfo && fresherinfo) {
                    exp = { $or: [fresherinfo, experienceinfo] };
                } else if (experienceinfo) {
                    exp = experienceinfo;
                } else {
                    exp = fresherinfo;
                }

            } else {
                if (explist[0] && explist[1]) {
                    experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[1]) } }, { 'totalexperience': { '$gte': Number(explist[0]) } }] };
                }
                exp = experienceinfo;
            }
        }

        //   console.log(exp,'exp')

        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { $or: [{ 'skills.jobfunctioncode': { $in: listparams.jobfunctioncode } }] };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { $or: [{ 'skills.jobrolecode': { $in: listparams.jobrolecode } }] };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0)// JobType==
            jobtypecode = { $or: [{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } }, { 'preferences.employementtype.employementtypecode': 9 }] };
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'personalinfo.differentlyabled': listparams.differentlyabled };
        // if (Number(req.body.statuscode) == 0) { var condition = { "statuscode": { $ne: objConstants.deletestatus } }; }
        // else if (Number(req.body.statuscode) == -1) { var condition = { "registervia": { $eq: 1 } }; }
        // else if (Number(req.body.statuscode) == 1) { var condition = { $and: [{ "registervia": { $ne: 1 } }, { statuscode: Number(req.body.statuscode) }] }; }
        // else { var condition = { statuscode: Number(req.body.statuscode) }; }
        var condition = {};
        if ((Number(req.body.statuscode)) == objConstants.deletestatus)
            condition = { 'statuscode': { $eq: objConstants.deletestatus } };
        else
            condition = { 'statuscode': { $ne: objConstants.deletestatus } };

        if (listparams.usercode.length > 0)
            usercode = { 'usercode': { $in: listparams.usercode } };
        var profilestatus = {};
        if ((listparams.profilestatus) != 0) {
            if ((listparams.profilestatus) == 2) {
                profilestatus = { $or: [{ 'profilestatus': { $exists: false } }, { 'profilestatus': parseInt(listparams.profilestatus) }] };
            } else {
                profilestatus = { 'profilestatus': parseInt(listparams.profilestatus) };
            }
        }
        var languagecodecondition = {};
        if (listparams.languagecode && (listparams.languagecode) != 0)
            languagecodecondition = { 'preferredlanguagecode': listparams.languagecode };
        var dbCollectionName = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        var matchparams = {
            $and: [profilestatus, languagecodecondition, locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays,
                activedays, exp, usercode,registereddate,
                { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
        if (matchparams != "") {
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
                dbo.collection(String(dbCollectionName)).aggregate([
                    { $match: matchparams },
                    
                    {
                        "$project": {
                            _id: 0,
                            "employeecode": 1,  statuscode: 1,"registervia": 1, personalinfopercentage: {
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
                    },
                    { $match: profileparams },
                    { $sort: sortbyparams },
                ],{ allowDiskUse: true }).toArray(function (err, emplist) {
                    if (emplist != null && emplist.length > 0) {
                        var activecount, inactivecount, blockcount, pendingcount , rejectedcount , regviaapp, regviaportal , totalcount =0;
                        activecount = emplist.filter(t => t.statuscode == objConstants.activestatus);
                        inactivecount = emplist.filter(t => t.statuscode == objConstants.inactivestatus);
                        blockcount = emplist.filter(t => t.statuscode == objConstants.blockstatus);
                        pendingcount = emplist.filter(t => t.statuscode == objConstants.pendingstatus);
                        rejectedcount = emplist.filter(t => t.statuscode == objConstants.rejectedstatus);
                        regviaapp = emplist.filter(t => t.registervia == 1);
                        regviaportal = emplist.filter(t => t.registervia == 2);
                        totalcount = activecount.length + inactivecount.length + blockcount.length + pendingcount.length + rejectedcount.length;
                        //var percentage = {"percentagetext": "20 %","percentagevalue": 20,"percentagecount":percentage_20.length};
                        var finalresult=[];
                        finalresult.push(activecount.length);
                        finalresult.push(inactivecount.length);
                        finalresult.push(blockcount.length);
                        finalresult.push(pendingcount.length);
                        finalresult.push(rejectedcount.length);
                        finalresult.push(totalcount);                        
                        finalresult.push(regviaapp.length);
                        finalresult.push(regviaportal.length);
                        return callback(finalresult);
                      }
                });
            });

        }
        else {
            return callback(finalresult);
        }

    }
    catch (e) {
        logger.error("Error in Employee List: " + e);
    }
}

exports.getEmployeeProfileImage = function (logparams, req, callback) {
    try {
        logger.info("Log in getEmployeeProfileImage  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        if (req.query.isleadtype == null) {
            req.query.isleadtype = 0
          }
        var dbcollectionname = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbcollectionname)).aggregate(
            { $unwind: { path: '$skills', preserveNullAndEmptyArrays: true } },
            { $match: { employeecode: Number(req.query.employeecode) } },
            {
                "$lookup":
                {
                    "from": String(MongoDB.JobRoleCollectionName),
                    "localField": "skills.jobrolecode",
                    "foreignField": "jobrolecode",
                    "as": "jobroleinfo"
                }
            },
            { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(req.query.languagecode) }] } },
            
            {
                $group:
                {
                    "_id": {
                        "employeecode": '$employeecode', "imageurl": { $ifNull: ['$imageurl', ''] }
                    },
                    "currentjobrolename": {
                        "$push": {
                            "$cond": [
                                { "$eq": ["$skills.currentjobfunction", 1] },
                                "$jobroleinfo.jobrole.jobrolename",
                                ""
                            ]
                        }
                    }
                }
            },
            { $project: { "_id": 0, "employeecode": '$_id.employeecode',"currentjobrolename": '$currentjobrolename',  "imageurl": '$_id.imageurl' } }).toArray(function (err, imageresult) {
                // if(imageresult.imageurl==null)
                //     imageresult.imageurl="";
                //console.log(imageresult[0]);
                var currentjobrolename = "";
                var currentjobrolelist = imageresult[0].currentjobrolename.filter(Boolean);
                if(currentjobrolelist && currentjobrolelist.length>0){
                    currentjobrolename = currentjobrolelist[0]
                }
                // console.log(imageresult[0].imageurl);
                // console.log(imageresult[0]. _id.imageurl);
                var finalresult = {
                    imageurl: imageresult[0]. _id.imageurl,
                    currentjobrolename: currentjobrolename
                }
                return callback(finalresult);

            });
    }
    catch (e) { logger.error("Error in getEmployeeProfileImage : " + e); }
}

exports.DeleteEmployee = function (logparams, req, callback) {
    try {
        logger.info("Log in Delete Employee: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        if (req.query.isleadtype == null) {
            req.query.isleadtype = 0
          }
        var dbcollectionname = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        objUtilities.InsertLog(logparams, function (validlog) {
            if (validlog != null && validlog != "") {
                objUtilities.getcurrentmilliseconds(function (currenttime) {
                    var matchparam = { "employeecode": Number(req.body.employeecode) };
                    if (Number(req.body.statuscode) == objConstants.deletestatus) {
                        dbo.collection(String(dbcollectionname)).updateOne(matchparam, { $set: { "statuscode": Number(req.body.statuscode), "oldstatuscode": Number(req.body.currentstatuscode), "deletedon": currenttime } }, function (err, res) {
                            if (err)
                                throw (err)
                            ////console.log(res.modifiedCount)
                            return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);

                        });
                    }
                    else {
                        dbo.collection(String(dbcollectionname)).updateOne(matchparam, { $set: { "statuscode": Number(req.body.statuscode), "oldstatuscode": 0, "recoveredon": currenttime } }, function (err, res) {
                            if (err)
                                throw (err)
                            ////console.log(res.modifiedCount)
                            return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);

                        });
                    }
                });
            }

        });

    }
    catch (e) {
        logger.error("Error in Update statuscode - Employer Management " + e);
    }
}

exports.employee_update_portal = function (params, employeecode, logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                { $match: { "employeecode": employeecode } },
                {
                    $project: {
                        _id: 0, preferences: 1
                    }
                }
            ]).toArray(function (err, preferenceresult) {
                if (preferenceresult != null && preferenceresult != undefined && preferenceresult.length > 0)
                {
                    preferenceresult[0].preferences.maxsalary = params.maxsalary
                    preferenceresult[0].preferences.location[0].locationcode = params.locationcode
                    preferenceresult[0].preferences.employementtype = params.employementtype
                }
            dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": employeecode }, { $set: { "employeename": params.employeename, "personalinfo": params.personalinfo, "fresherstatus": params.fresherstatus, "preferences": preferenceresult[0].preferences, "afterschooling": params.afterschooling, "schooling": params.schooling, "contactinfo": params.contactinfo } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
            });
        });

        });

    }
    catch (e) { logger.error("Error in Employee Personal Info Update: " + e); }
}


exports.employee_jobrole_update_portal = function (params, employeecode, logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                { $match: { "employeecode": employeecode } },
                {
                    $project: {
                        _id: 0, preferences: 1
                    }
                }
            ]).toArray(function (err, preferenceresult) {
                if (preferenceresult != null && preferenceresult != undefined && preferenceresult.length > 0)
                {
                    preferenceresult[0].preferences.jobfunction = params.jobfunction
                    preferenceresult[0].preferences.jobrole = params.jobrole
                }
            dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": employeecode }, { $set: { "preferences": preferenceresult[0].preferences, "experienceinfo": params.experienceinfo, "skills": params.skills} }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
            });
        });

        });

    }
    catch (e) { logger.error("Error in Employee Personal Info Update: " + e); }
}

exports.getTotalPercentage = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult =0;
        var personalinfostatus = 0, contactinfostatus = 0, preferencestatus = 0, educationstatus = 0, referenceinfostatus = 0, experiencestatus = 0, skillsstatus = 0, imagestatus = 0;
        var totalpercentage = 0, personalinfopercentage = 0, contactinfopercentage = 0, preferencepercentage = 0, educationpercentage = 0, referenceinfopercentage = 0, experiencepercentage = 0, skillspercentage = 0, photopercentage = 0;
        logger.info("Log in Checking Profile Status in Employee App: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(emptypeparams);
        objUtilities.GetProfilePercentage(function (profilepercentageresult) {
            //console.log(profilepercentageresult);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        
            dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, "employeecode": 1, "personalinfo": 1, "contactinfo": 1, "preferences": 1, "schooling": 1, "afterschooling": 1, "referenceinfo": 1, "experienceinfo": 1, "skills": 1, "fresherstatus": 1, "resumeurl": 1, "generatedresumeurl": 1, "imageurl": 1, "totalexperience": 1 } }).toArray(function (err, profileresult) {
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    if (result != null && result.length > 0) {
                        var pc_eng = result[0].pc_eng
                        var pc_tam = result[0].pc_tam
                        var support_mobileno = result[0].supportmobileno
                        ////console.log(profileresult);
                        if (profileresult!=null && profileresult.length > 0) {
                            if (profileresult[0].personalinfo.dateofbirth != null && profileresult[0].personalinfo.dateofbirth != 0) {
                                personalinfostatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 1);
                                personalinfopercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].contactinfo.talukcode != null && profileresult[0].contactinfo.talukcode != 0) {
                                contactinfostatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 2);
                                contactinfopercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].preferences != null) {
                                preferencestatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 6);
                                preferencepercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].schooling != null && profileresult[0].schooling.length > 0) {
                                educationstatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 3);
                                educationpercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].referenceinfo != null && profileresult[0].referenceinfo.length > 0) {
                                referenceinfostatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 5);
                                referenceinfopercentage = profile[0].profilepercentage;
                            }
                            ////console.log(profileresult[0].fresherstatus);
                            if ((profileresult[0].totalexperience != null && profileresult[0].totalexperience > 0) || (profileresult[0].fresherstatus != null && profileresult[0].fresherstatus == 1)) {
                                experiencestatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 4);
                                experiencepercentage = profile[0].profilepercentage;
                            }
                            ////console.log(profileresult[0]);
                            if (profileresult[0].skills != null && profileresult[0].skills.length > 0) {
                                skillsstatus = 1;
                                var profile = profilepercentageresult.filter(t => t.profilecode == 7);
                                skillspercentage = profile[0].profilepercentage;
                            }
                            //if (profileresult[0].imageurl != null && profileresult[0].imageurl != "") {
                            if(1==1)
                            {
                                var profile = profilepercentageresult.filter(t => t.profilecode == 8);
                                photopercentage = profile[0].profilepercentage;
                            }
                            if (profileresult[0].imageurl != null && profileresult[0].imageurl != "") {
                                imagestatus = 1;
                            }
                            else
                            {
                                // console.log(JSON.stringify(profileresult[0].personalinfo))
                                // console.log(profileresult[0].personalinfo.gender)
                                if (profileresult[0].personalinfo.gender != undefined && profileresult[0].personalinfo.gender != null && profileresult[0].personalinfo.gender == 2)
                                    profileresult[0].imageurl = "https://bj-app-images.s3.ap-south-1.amazonaws.com/female.png";
                                else
                                    profileresult[0].imageurl = "https://bj-app-images.s3.ap-south-1.amazonaws.com/male.png";
                            }
                            totalpercentage = personalinfopercentage + contactinfopercentage + preferencepercentage + educationpercentage +
                                referenceinfopercentage + experiencepercentage + skillspercentage + photopercentage;
                            // finalresult = totalpercentage;
                            return callback(totalpercentage);
                        }                        
                    }
                });
            });
        });

    }
    catch (e) { logger.error("Error in Checking Profile Status: " + e); }

}