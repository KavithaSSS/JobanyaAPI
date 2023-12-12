const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const varconstant = require('../../config/constants');
const objUtilities = require("../controller/utilities");
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objProfile = require('../process/employee_profile_view_process_controller')
const objEmpProfile = require('../process/employee_profile_process_controller')
const varemailconstant = require('../../config/email_constants');
const express = require('express');
const app = express();
//Require dependecies for pdf generation
const fs = require('fs') // file read and write permission
const path = require('path') // for get the html path
const utils = require('util') // for file checking
const puppeteer = require('puppeteer') //using headless mode
const hb = require('handlebars') //Compiing the template with handlebars
const readFile = utils.promisify(fs.readFile)

exports.generateEmployeeProfilePDF = function (logparams, employeecode, req, callback) {
//module.exports.generateEmployeeProfilePDF = async (logparams, employeecode, callback) => {
    try {
        logger.info("Log in Checking generate pdf: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        const BUCKET_NAME = 'bj-employee-upload';
        //console.log("Process controller")
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            if (err) throw err;
            // //console.log("entry");
            // The name of the bucket that you have created
            
            // const ID = 'AKIAIEVUKMCDILAPAARQ';
            // const SECRET = '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';

            const s3 = new AWS.S3({
                accessKeyId: result[0].accessKeyId,
                secretAccessKey: result[0].secretAccessKey
            });
            //const path = require('path');
            ////console.log(employeecode);
            // var filePath = path.dirname(require.main.filename) + '/employee_profile';
            // app.use(express.static(filePath));
            // var html = fs.readFileSync(filePath + '/profile_template.html', 'utf8');
            var empparams = { "employeecode": Number(employeecode) };
            //var req = "";
            var savedfilename = "";
            var filenamearray = [];
            var generatedresumeurl = "";
           // dbo.collection(MongoDB.EmployeeCollectionName).find(empparams, { projection: { _id: 0, employeecode: 1, generatedresumeurl: { $ifNull: ['$generatedresumeurl', ''] } } }).toArray(function (err, empresult){
            dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                {$match: empparams},
                {$project: {_id: 0, employeecode: 1, generatedresumeurl: { $ifNull: ['$generatedresumeurl', ''] }}}
                ]).toArray(function (err, empresult){
                //console.log(JSON.stringify(empresult));
                if (empresult != null && empresult.length > 0)
                {
                   

                    if (empresult[0].generatedresumeurl != null && empresult[0].generatedresumeurl != "")
                    {
                        generatedresumeurl = empresult[0].generatedresumeurl;
                        filenamearray = generatedresumeurl.split("/");
                        savedfilename = filenamearray[filenamearray.length - 1];
                        // var filenamearray1 = savedfilename.split("?");
                        // savedfilename = filenamearray1[0];
                    }
                }
               // console.log("Process controller1", savedfilename)
            // console.log("Process controller1")
            objEmpProfile.UpdateProfileStatus(employeecode,function (statuscount) {
                // console.log("Process controller11")
                objUtilities.getcurrentmilliseconds(function (currenttime) {
                    // console.log("Process controller12")
                    objProfile.getProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function (profileresult) {
                        // console.log("Process controller1.1")
                        var schoolingArray = [], afterschoolingArray = [], referenceArray = [], experienceArray = [],
                            skillsArray = [], jobroleArray = [], iseducation = false, ispreference = false;
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
        
                        var imageurl = "https://bj-app-images.s3.ap-south-1.amazonaws.com/male.png";
                        if (profileresult.personalinfo.imageurl != null && profileresult.personalinfo.imageurl != "") {
                            imageurl = profileresult.personalinfo.imageurl;
                        }
                        else if (profileresult.personalinfo != null && profileresult.personalinfo.gender != null && profileresult.personalinfo.gender == 2) {
                            imageurl = "https://bj-app-images.s3.ap-south-1.amazonaws.com/female.png";
                        }
                        else {
                            imageurl = "https://bj-app-images.s3.ap-south-1.amazonaws.com/male.png";
                        }
                        // console.log("Process controller1.2")
                        if (profileresult.fresherstatus != 0) {
                            fresherstatus = "Fresher"
                        }
                        if (profileresult.personalinfo.differentlyabled != 0)
                            differentlyabled = "Yes";
                        if (profileresult.schooling != null && profileresult.schooling.length > 0)
                            schoolingArray = profileresult.schooling;
                        if (profileresult.afterschooling != null && profileresult.afterschooling.length > 0)
                            afterschoolingArray = profileresult.afterschooling;
                        if (profileresult.references != null && profileresult.references.length > 0)
                            referenceArray = profileresult.references;
                        if (profileresult.experience != null && profileresult.experience.length > 0){
                            if(profileresult.experience[0].designationname && profileresult.experience[0].designationname!=null){
                                experienceArray = profileresult.experience;
                            }
                        }
                        if ((profileresult.schooling != null && profileresult.schooling.length > 0) || (profileresult.afterschooling != null && profileresult.afterschooling.length > 0))
                        {
                            iseducation = true;
                        }
                        // console.log("Process controller1.3")
                          //  console.log(experienceArray);
                        if (profileresult.skilllist != null && profileresult.skilllist.length > 0) {
                            skillsArray = profileresult.skilllist;
                            // console.log(JSON.stringify(skillsArray, null, " "))
                            // console.log(skillsArray.length)
                            profileresult.skilllist.forEach(element => {
                                if (element.jobrolecode != 0)
                                    jobroleArray.push(element.jobrolename);
                                else
                                    jobroleArray.push(element.jobfunctionname);
                            });
                        }
                        // console.log("Process controller1.4")
                        if (profileresult.personalinfo != null && profileresult.personalinfo.languagesknown != null && profileresult.personalinfo.languagesknown.length > 0) {
                            //console.log(JSON.stringify(profileresult.personalinfo.languagesknown, null, " "))
                            // let knownlang = profileresult.personalinfo.languagesKnown.map(e => e.displayname.filter(ee => ee.languagecode == 2));
                            // console.log(JSON.stringify(knownlang, null, " "))
                            //console.log(JSON.stringify(profileresult.personalinfo.languagesknown, null, " "))
                            let knownlang = [];
                            profileresult.personalinfo.languagesknown.forEach(element => {
                                let a = element.displayname.filter(function(lan){
                                    return (lan.code == 2);
                                });
                                //console.log(a);
                                knownlang.push(a[0]);
                            });
                           // console.log(JSON.stringify(knownlang, null, " "))
                           knownlang.forEach(element => {
                                languagesKnown = languagesKnown + "," + element.name;
                            });
                        }
                        // console.log(languagesKnown);
                        if (languagesKnown != "") {
                            languagesKnown = languagesKnown.substring(1, languagesKnown.length);
                            // console.log(languagesKnown);
                        }
                        if (profileresult.preferences != null)
                        {
                            ispreference = true;
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
                        // console.log("Process controller1.5")
                        //console.log(skillsArray.length, "SKILLLength")
                        var resume =
                        {
                            name: profileresult.personalinfo != null && profileresult.personalinfo.employeefullname != null ? profileresult.personalinfo.employeefullname : "",
                            age: age,
                            jobrole: jobroleArray,
                            gender: profileresult.personalinfo != null && profileresult.personalinfo.gendername != null ? profileresult.personalinfo.gendername : "",
                         
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
                                imageurl: imageurl
                            },
                            iseducation: iseducation,
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
                            ispreference: ispreference,
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
                         //console.log("Process controller1.6")
                        // var resume =
                        // {
                        //     name: profileresult.personalinfo != null && profileresult.personalinfo.employeefullname != null ? profileresult.personalinfo.employeefullname : "",
                        //     age: age,
                        //     jobrole: jobroleArray,
                        //     gender: profileresult.personalinfo != null && profileresult.personalinfo.gendername != null ? profileresult.personalinfo.gendername : "",
                            
                        //     maritalstatus: profileresult.personalinfo != null && profileresult.personalinfo.maritalstatus != null ? profileresult.personalinfo.maritalstatus : "",
                            
                        // }
                        const today = new Date();
                        const yyyy = today.getFullYear();
                        let mm = today.getMonth() + 1; // Months start at 0!
                        let dd = today.getDate();

                        if (dd < 10) dd = '0' + dd;
                        if (mm < 10) mm = '0' + mm;

                        const formattedToday = dd + '/' + mm + '/' + yyyy;

                        var file = profileresult.contactinfo != null && profileresult.contactinfo.mobileno != null ? profileresult.contactinfo.mobileno : employeecode;
                        //console.log(resume);
                        // console.log("Process controller2")
                        // console.log(filePath+"/"+resume.name.replace('.', "")+"_"+ file +".pdf");
                        // logger.info("Log in Checking generate pdf: filePath: " + filePath + "/" + resume.name.replace('.', "") + "_" + file + ".pdf");
                        (async () => {
                            var res=await module.exports.getTemplateHtml();               
                            
                            // console.log(res,"return input filek")
                            // .then(async (res) => {
                            // Now we have the html code of our template in res object
                            // you can check by logging it on console
                            
                            //console.log("Compiing the template with handlebars")
                            const template = hb.compile(res, { strict: true });
                            //console.log(template)
                            // we have compile our code with handlebars
                            const resultTemplate = template(resume);
                            //console.log(resultTemplate)
                            // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
                            const html = resultTemplate;
        
                            const browser = await puppeteer.launch();
                            const page = await browser.newPage()
                            var filePath = path.dirname(require.main.filename) + '/employee_profile';
                            const uploadedFileName = filePath + "/" + currenttime +"_"+ resume.name.replace('.', "") + "_" + file + ".pdf";
                            // We set the page content as the generated html by handlebars
                            // console.log("Process controller3")
                            await page.setContent(html)
                            //console.log(uploadedFileName)
                            // We use pdf function to generate the pdf in the same folder as this file.
                            // await page.evaluate(() => {
                            //     const div = document.createElement('div');
                            //     div.innerHTML = 'Watermark Text...';
                            //     div.style.cssText = "position: fixed; bottom: 10px; right: 10px; background: red; z-index: 10000";
                            //     document.body.appendChild(div);
                            //   });
                            //   +'  <div style="width:40px;margin-left:10px;position:absolute;"><img style="width: 80%;height:80%;" src="https://bj-email-template.s3.ap-south-1.amazonaws.com/Jobanya_logo.jpg"/></div>'
                            await page.pdf({ path: uploadedFileName, format: 'A4', 
                            displayHeaderFooter: true,
                            printBackground: true,
                            preferCSSPageSize: true,
                            // margin: {
                            //     top: '20px',
                            //     bottom: '75px'
                            //   },
                            // footerTemplate: '<div style="width:100%;padding: 0 10px;"><div style="width:100%;padding: 0 10px;display: flex;position:relative;">'
                           
                            //    +' <div style="width:100%;padding: 5px;justify-content:center;background-color:#ed6727 !important;margin-left:0px; -webkit-print-color-adjust:exact"> '
                              
                            //     +'  <div style="font-family: Roboto !important;font-size:6px;text-align:left; padding-right:10px;color:#ffffff">www.jobanya.com</div>'
                            //       +'<div style="font-family: Roboto !important;font-size:6px;text-align:right; padding-right:10px;color:#ffffff"><span class="date"></span></div></div></div></br><div style="font-family: Roboto !important; text-align:right; padding-right:10px;color:#ffffff"> </div></div>',
                        margin: {
                                top: '20px',
                                bottom: '75px'
                              },
                            footerTemplate: '<div style="width:100%;padding: 0 10px;"><div style="width:100%;padding: 0 10px;display: flex;position:relative;">'
                           
                            
                              
                             
                                  +'<div style="font-family: Roboto !important;font-size:6px;text-align:right; padding-right:10px;color:#0a0a0a"><span>' + formattedToday + '</span></div></div></br><div style="font-family: Roboto !important; text-align:right; padding-right:10px;color:#ffffff"> </div></div>',
                      
                        })
                            await browser.close(); 
                            //console.log("PDF Generated");
                            //return callback(uploadedFileName);
                            //console.log('Random Number'+randomnumber);
                            //TO call encrypted pdf generation
        
                            const uploadFile = (fileName) => {
                                // Read content from the file
                                logger.info("Log in Checking generate pdf: fileName: " + fileName);
                                const fileContent = fs.readFileSync(fileName);
                                //console.log(fileContent);
                                logger.info("Log in Checking generate pdf: fileContent: " + fileContent);
                                // Setting up S3 upload parameters
                                const params = {
                                    Bucket: BUCKET_NAME,
                                    Key: "generated-resume/" + currenttime +"_"+ resume.name.replace('.', "") + "_" + file + '.pdf', // File name you want to save as in S3
                                    Body: fileContent,
                                    ACL: 'public-read'
                                };
                                // console.log("Process controller4")
                                // Uploading files to the bucket
                             s3.upload(params, function (err, data) {
                                    if (err) {
                                        //console.log("Error Log in upload: " + err);
                                        logger.info("Error Log in upload generated pdf: " + err);
                                    }
        
        
                                    // remove the file from local folder
                                    // delete file named 'sample.txt'
                                    fs.unlink(fileName, function (err) {
                                        if (err)
                                            logger.info("Error Log in generated pdf: " + err);
                                        // if no error, file has been deleted successfully
                                        ////console.log('File deleted!');
                                       //console.log(data.Location);
                                        ////console.log(`${data.Location}`);
                                        logger.info("Log in generated pdf: " + data.Location);
                                        return callback(data.Location);
                                    });
        
                                }); 
                            };
                            // console.log("Process controller5")
                            uploadFile(uploadedFileName, function (err, data) {
                                logger.info("Log in Checking generate pdf: res.fileName: " + uploadedFileName);
                                //console.log(data);
                                logger.info("Log in Checking generate pdf: create: " + data);
                                return callback(data);
                            });
                            
                            if (savedfilename != "")
                            {
                                //console.log("Process controller6")
                                var deleteparams = {
                                    Bucket: BUCKET_NAME,
                                    Key: "generated-resume/" + savedfilename
                                  };
                                  s3.deleteObject(deleteparams, function(err, data) {
                                    if (err) logger.info("Error: " + err);
                                    else logger.info('Successfully deleted');
                                  });
                            }
                           
                        })();
                        
                        
                        // we are using headless mode
                        // (async () => {
                        
                        // })();
                        
        
        
                        //return this.uploadFile(filePath + "/" + resume.name.replace('.', "") + "_" + file + ".pdf",req);
        
                    });
                });
            });
            });
            
            
            
        });
    }
    catch (e) {
        logger.error("Error in Send OTP : Employer" + e);
        return callback(e);
        
    }
    // Load the AWS SDK for Node.js
}

module.exports.getTemplateHtml = async() => { 
    //console.log("Loading template file in memory")
    try {
        var filePath = path.dirname(require.main.filename) + '/employee_profile';
        //console.log("1")
        app.use(express.static(filePath));      
        //console.log("2")  
        const resumePath = path.resolve(filePath + '/profile_template.html');
        //console.log("3")
        // console.log("path",invoicePath)
        return readFile(resumePath, 'utf8');
    } catch (err) {
       // console.log("Could not load html template")
        return Promise.reject("Could not load html template");
    }
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