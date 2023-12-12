const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const varconstant = require('../../config/constants');
const objUtilities = require("../controller/utilities");
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objProfile = require('../process/employee_profile_view_process_controller')
const express = require('express');
const app = express();
var pdf = require("pdf-creator-node");
var fs = require('fs');
exports.generateEmployeeProfilePDF = function (logparams, employeecode, callback) {
    try {
        logger.info("Log in Checking generate pdf: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            if (err) throw err;
            // //console.log("entry");
            // The name of the bucket that you have created
            const BUCKET_NAME = 'bestjobs-employee-upload';
            // const ID = 'AKIAIEVUKMCDILAPAARQ';
            // const SECRET = '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';

            const s3 = new AWS.S3({
                accessKeyId: result[0].accessKeyId,
                secretAccessKey: result[0].secretAccessKey
            });
            const path = require('path');
            ////console.log(employeecode);
            var filePath = path.dirname(require.main.filename) + '/employee_profile';
            app.use(express.static(filePath));
            var html = fs.readFileSync(filePath + '/profile_template.html', 'utf8');
            var empparams = { "employeecode": Number(employeecode) };
            var req = "";
            objProfile.getProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function (profileresult) {

                var schoolingArray = [], afterschoolingArray = [], referenceArray = [], experienceArray = [],
                    skillsArray = [], jobroleArray = [];
                var prefjobfunction = [], prefjobrole = [], prefjoblocation = [], prefjobtype = [];
                var fresherstatus = "", differentlyabled = "No", dobdate = "", age = "", languagesKnown = "";
                if (profileresult.personalinfo.dateofbirth != null) {
                    var d = new Date(profileresult.personalinfo.dateofbirth),
                        month = '' + (d.getMonth() + 1),
                        day = '' + d.getDate(),
                        year = d.getFullYear();

                    if (month.length < 2)
                        month = '0' + month;
                    if (day.length < 2)
                        day = '0' + day;
                    dobdate = [day, month, year].join('-');
                    var ageDifMs = Date.now() - profileresult.personalinfo.dateofbirth;
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    age = Math.abs(ageDate.getUTCFullYear() - 1970);
                }

                var imageurl = "http://" + __dirname + '/male.png';
                if (profileresult.personalinfo.imageurl != null && profileresult.personalinfo.imageurl != "") {
                    imageurl = profileresult.personalinfo.imageurl;
                }
                else if (profileresult.personalinfo != null && profileresult.personalinfo.gender != null && profileresult.personalinfo.gender == 2) {
                    imageurl = filePath + '/female.png';
                }
                else {
                    imageurl = filePath + '/male.png';
                }
                if (profileresult.fresherstatus != 0) {
                    fresherstatus = "Fresher"
                }
                if (profileresult.differentlyabled != 0)
                    differentlyabled = "Yes";
                if (profileresult.schooling != null && profileresult.schooling.length > 0)
                    schoolingArray = profileresult.schooling;
                if (profileresult.afterschooling != null && profileresult.afterschooling.length > 0)
                    afterschoolingArray = profileresult.afterschooling;
                if (profileresult.references != null && profileresult.references.length > 0)
                    referenceArray = profileresult.references;
                if (profileresult.experience != null && profileresult.experience.length > 0)
                    experienceArray = profileresult.experience;
                if (profileresult.skilllist != null && profileresult.skilllist.length > 0) {
                    skillsArray = profileresult.skilllist;
                    profileresult.skilllist.forEach(element => {
                        if (element.jobrolecode != 0)
                            jobroleArray.push(element.jobrolename);
                        else
                            jobroleArray.push(element.jobfunctionname);
                    });
                }

                if (profileresult.personalinfo != null && profileresult.personalinfo.languagesknown != null && profileresult.personalinfo.languagesknown.length > 0) {
                    profileresult.personalinfo.languagesknown.forEach(element => {
                        languagesKnown = languagesKnown + "," + element.languagename;
                    });
                }
                if (languagesKnown != "") {
                    languagesKnown = languagesKnown.substring(1, languagesKnown.length);
                    ////console.log(languagesKnown);
                }
                if (profileresult.preferences != null && profileresult.preferences.jobfunctionlist != null && profileresult.preferences.jobfunctionlist.length > 0) {
                    profileresult.preferences.jobfunctionlist.forEach(element => {
                        prefjobfunction.push(element.jobfunctionname);
                    });
                }
                if (profileresult.preferences != null && profileresult.preferences.jobrolelist != null && profileresult.preferences.jobrolelist.length > 0) {
                    profileresult.preferences.jobrolelist.forEach(element => {
                        prefjobrole.push(element.jobrolename);
                    });
                }
                if (profileresult.preferences != null && profileresult.preferences.locationlist != null && profileresult.preferences.locationlist.length > 0) {
                    profileresult.preferences.locationlist.forEach(element => {
                        prefjoblocation.push(element.locationname);
                    });
                }
                if (profileresult.preferences != null && profileresult.preferences.emptypelist != null && profileresult.preferences.emptypelist.length > 0) {
                    profileresult.preferences.emptypelist.forEach(element => {
                        prefjobtype.push(element.employementtypename);
                    });
                }
                var resume =
                {
                    name: profileresult.personalinfo != null && profileresult.personalinfo.employeefullname != null ? profileresult.personalinfo.employeefullname : "",
                    age: age,
                    jobrole: jobroleArray,
                    gender: profileresult.personalinfo != null && profileresult.personalinfo.gendername != null ? profileresult.personalinfo.gendername : "",
                    imgsource: imageurl,
                    maritalstatus: profileresult.personalinfo != null && profileresult.personalinfo.maritalstatus != null ? profileresult.personalinfo.maritalstatus : "",
                    contactinfo:
                    {
                        mobileno: profileresult.contactinfo != null && profileresult.contactinfo.mobileno != null ? profileresult.contactinfo.mobileno : "",
                        altmobileno: profileresult.contactinfo != null && profileresult.contactinfo.altmobileno != null ? profileresult.contactinfo.altmobileno : "",
                        streetname: profileresult.contactinfo != null && profileresult.contactinfo.streetname != null ? profileresult.contactinfo.streetname : "",
                        areaname: profileresult.contactinfo != null && profileresult.contactinfo.areaname != null ? profileresult.contactinfo.areaname : "",
                        cityname: profileresult.contactinfo != null && profileresult.contactinfo.cityname != null ? profileresult.contactinfo.cityname : "",
                        districtname: profileresult.contactinfo != null && profileresult.contactinfo.districtname != null ? profileresult.contactinfo.districtname : "",
                        pincode: profileresult.contactinfo != null && profileresult.contactinfo.pincode != null ? profileresult.contactinfo.pincode : "",
                        statename: profileresult.contactinfo != null && profileresult.contactinfo.statename != null ? profileresult.contactinfo.statename : "",
                        emailid: profileresult.contactinfo != null && profileresult.contactinfo.emailid != null ? profileresult.contactinfo.emailid : "",
                    },
                    personalinfo:
                    {
                        fathername: profileresult.personalinfo != null && profileresult.personalinfo.fathername != null ? profileresult.personalinfo.fathername : "",
                        spousename: profileresult.personalinfo != null && profileresult.personalinfo.spousename != null ? profileresult.personalinfo.spousename : "",
                        dateofbirth: dobdate,
                        aadharno: profileresult.personalinfo != null && profileresult.personalinfo.aadharno != null ? profileresult.personalinfo.aadharno : "",
                        medicalhistory: profileresult.personalinfo != null && profileresult.personalinfo.medicalhistory != null ? profileresult.personalinfo.medicalhistory : "",
                        differentlyabled: differentlyabled,
                        languagesknown: languagesKnown,
                    },

                    education:
                    {
                        schooling: schoolingArray,
                        afterschooling: afterschoolingArray,
                    },
                    fresherstatus: fresherstatus,
                    totalexperience: profileresult.totalexperience,
                    expmonth: profileresult.expmonth,
                    expyear: profileresult.expyear,
                    experience: experienceArray,
                    skilllist: skillsArray,
                    references: referenceArray,
                    preferences:
                    {
                        jobfunctionlist: prefjobfunction,
                        jobtype: prefjobtype,
                        minsalary: profileresult.preferences != null && profileresult.preferences.minsalary != null ? profileresult.preferences.minsalary : "",
                        maxsalary: profileresult.preferences != null && profileresult.preferences.maxsalary != null ? profileresult.preferences.maxsalary : "",
                        timeforjoiningcode: profileresult.preferences != null && profileresult.preferences.timeforjoiningcode != null ? profileresult.preferences.timeforjoiningcode : "",
                        jobrolelist: prefjobrole,
                        locationlist: prefjoblocation

                    }
                }
                var options = {
                    //phantomPath: __dirname + "/node_modules/phantomjs/bin/phantomjs",
                    format: "A4",
                    orientation: "portrait",
                    border: "10mm",
                    type: "pdf",
                    timeout: 30000
                };

                var file = profileresult.contactinfo != null && profileresult.contactinfo.mobileno != null ? profileresult.contactinfo.mobileno : employeecode;
                //console.log(file);
                //console.log(filePath+"/"+resume.name.replace('.', "")+"_"+ file +".pdf");
                logger.info("Log in Checking generate pdf: filePath: " + filePath + "/" + resume.name.replace('.', "") + "_" + file + ".pdf");
                var document = {
                    html: html,
                    data: {
                        resume: resume
                    },
                    path: filePath + "/" + resume.name.replace('.', "") + "_" + file + ".pdf",
                    type: ""
                };

                pdf.create(document, options)
                    .then(res => {
                        console.log(res);
                        uploadFile(res.filename, function (err, data) {
                            logger.info("Log in Checking generate pdf: res.fileName: " + res.fileName);
                            console.log(data);
                            logger.info("Log in Checking generate pdf: create: " + data);
                            return callback(data);
                        });

                    })
                    .catch(error => {
                        console.log(error);
                        logger.info("Error Log in Checking generate pdf: create: " + error);
                        return callback(0);
                    });

                const uploadFile = (fileName) => {
                    // Read content from the file
                    logger.info("Log in Checking generate pdf: fileName: " + fileName);
                    const fileContent = fs.readFileSync(fileName);
                    console.log(fileContent);
                    logger.info("Log in Checking generate pdf: fileContent: " + fileContent);
                    // Setting up S3 upload parameters
                    const params = {
                        Bucket: BUCKET_NAME,
                        Key: "generated-resume/" + resume.name.replace('.', "") + "_" + file + '.pdf', // File name you want to save as in S3
                        Body: fileContent,
                        ACL: 'public-read'
                    };

                    // Uploading files to the bucket
                    s3.upload(params, function (err, data) {
                        if (err) {
                            console.log("Error Log in upload: " + err);
                            logger.info("Error Log in upload generated pdf: " + err);
                        }


                        // remove the file from local folder
                        // delete file named 'sample.txt'
                        fs.unlink(fileName, function (err) {
                            if (err)
                                logger.info("Error Log in generated pdf: " + err);
                            // if no error, file has been deleted successfully
                            ////console.log('File deleted!');
                            console.log(data.Location);
                            ////console.log(`${data.Location}`);
                            logger.info("Log in generated pdf: " + data.Location);
                            return callback(data.Location);
                        });

                    });
                };
            });
        });
    }
    catch (e) {
        logger.error("Error in Send OTP : Employer" + e);
    }
    // Load the AWS SDK for Node.js
}

const uploadFile1 = (fileName, BUCKET_NAME, s3, callback) => {
    // Read content from the file
    const fileContent = fs.readFileSync(fileName);
    ////console.log(fileContent);
    // Setting up S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: resume.name.replace('.', " ") + "_" + resume.contactinfo.mobileno + '.pdf', // File name you want to save as in S3
        Body: fileContent,
        ACL: 'public-read'
    };
    ////console.log("upload");
    // Uploading files to the bucket
    s3.upload(params, function (err, data) {

        if (err) {
            ////console.log("err",err);
        }
        ////console.log(`${data.Location}`);

        // remove the file from local folder
        // delete file named 'sample.txt'
        fs.unlink(fileName, function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully
            ////console.log('File deleted!');

        });
        return callback(data.Location);
    });
};