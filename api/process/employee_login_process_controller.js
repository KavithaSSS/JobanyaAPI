'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
var async = require('async');
exports.registration = async function (params, logparams, isfromlead, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        if (isfromlead == null || isfromlead == undefined)
        {
            isfromlead = 0;
        }
        var AWS = require('aws-sdk');
       
        const BUCKET_NAME = objConstants.s3_employeebucketname;
        const prefixkey = objConstants.profilekeyPrefix;
        var leadkey = objConstants.leadkeyPrefix;
            // const ID = 'AKIAIEVUKMCDILAPAARQ';
            // const SECRET = '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';
           
            const path = require('path');
            var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
            logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            params.makerid = String(logres["ops"][0]["_id"]);
            var imageurl = "http://" + __dirname + '/male.png';
            var date = new Date();
            var milliseconds = date.getTime();
            var savedfilename = "";
            var filenamearray = []
            if (params.imageurl != null && params.imageurl != "") {
                //logger.info("enter1")
                imageurl = params.imageurl;
                var path = require('path');
                    //Return the extension:
                    var ext = path.extname(imageurl);
                    //console.log(ext);
                    params.imageurl = (params.imageurl).replace(leadkey, prefixkey)
                   // params.imageurl = prefixkey + 'profile_pic_' + params.employeecode + '_' + milliseconds + ext;
                    filenamearray = imageurl.split("/");
                    savedfilename = filenamearray[filenamearray.length - 1];
                    var filenamearray1 = savedfilename.split("?");
                    savedfilename = filenamearray1[0];

            }
           
                if (params.imageurl != null && params.imageurl != "") {
                   // imageurl = params.imageurl;
                   //logger.info("enter2")
                       
                    if (params.leadcode != null &&params.leadcode != undefined && params.leadcode != 0 && isfromlead == 1)
                    {
                        //logger.info("enter3")
                        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(async function (err, result) {
                            if (err) throw err;
                            //logger.info(JSON.stringify(result))
                        var s3 = new AWS.S3({
                            accessKeyId: result[0].accessKeyId,
                            secretAccessKey: result[0].secretAccessKey
                        });
                        //logger.info("enter2")
                        // var tempvar = BUCKET_NAME + '.s3.amazonaws.com/' + leadkey  + savedfilename;
                        // var imgparams = {
                        //     Bucket: BUCKET_NAME,
                        //     CopySource: tempvar,
                        //     Key: tempvar.replace(leadkey, prefixkey)
                        //   };
                        //   logger.info(JSON.stringify(imgparams))
                        //   logger.info("enter2.1")
                        //   s3.copyObject(imgparams, function(copyErr, copyData){
                        //     if (copyErr) {
                        //       logger.error(copyErr);
                        //     }
                        //     else {
                        //         logger.info("enter3")
                        //         params.imageurl = imgparams.Key;
                        //       logger.info('Copied: ', imgparams.Key);
                        //       //cb();
                        //     }
                        //   });

                        // s3.copyObject({ 
                        //     CopySource: BUCKET_NAME + '/lead-picture-test/profile_pic_19_1681991197094.jpeg',
                        //     Bucket: BUCKET_NAME +  '/profile-picture-test',
                        //     Key: 'profile_pic_19_1681991197094.jpeg'
                        //     }, function(copyErr, copyData){
                        //      if (copyErr) {
                        //         logger.info("Error: " + copyErr);
                        //      } else {
                        //         logger.info('Successfully copied the item'+copyData);
                        //      } 
                        //   });

                        s3.copyObject({ 
                            CopySource: BUCKET_NAME + '/' + leadkey + '/' + savedfilename,
                            Bucket: BUCKET_NAME +  '/' + prefixkey,
                            Key: savedfilename,
                            ACL: 'public-read'
                            }, function(copyErr, copyData){
                             if (copyErr) {
                                logger.info("Error: " + copyErr);
                             } else {
                                logger.info('Successfully copied the item'+ JSON.stringify(copyData));
                             } 
                          });

                          var deleteparams = {
                            Bucket: BUCKET_NAME,
                            Key: leadkey + '/' + savedfilename
                          };
                          s3.deleteObject(deleteparams, function(err, data) {
                            if (err) logger.info("Error: " + err);
                            else logger.info('Successfully deleted');
                          });
                        //var fileContent = fs.readFileSync(imageurl);
                        // var request = require('request').defaults({ encoding: null });
                        // request.get(imageurl, function (err, response, body) {
                        //     if (!error && response.statusCode == 200) {
                        //         data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                        //         console.log(data);
                        //     }
                        // });
                        // const response = await axios.get(imageurl,  { responseType: 'arraybuffer' })
                        // logger.info("enter3")
                        // const fileContent = Buffer.from(response.data, "utf-8")
                        // var resimg = await fetch(imageurl)
                        
                        // var fileContent = Buffer.from(await resimg.arrayBuffer())
                        // ////console.log(fileContent);
                        // Setting up S3 upload parameters
                        // logger.info("enter4")
                        // var params1 = {
                        //     Bucket: BUCKET_NAME,
                        //     Key: params.imageurl, // File name you want to save as in S3
                        //     Body: fileContent,
                        //     ACL: 'public-read'
                        // };
                        // logger.info("Bucket params", params1)
                        // s3.upload(params1, function (err, data) {
                        //     if (err) {
                        //         ////console.log("err",err);
                        //     }
                        //     ////console.log(`${data.Location}`);    
                    
                        //     // remove the file from local folder
                        //     // delete file named 'sample.txt'
                        //     // fs.unlink(imageurl, function (err) {
                        //     //     if (err) throw err;
                        //     //     // if no error, file has been deleted successfully
                        //     //     ////console.log('File deleted!');
                    
                        //     // });
                        // });
                        //params.imageurl = prefixkey + 'profile_pic_' + params.employeecode + '_' + milliseconds + ext;
                    });
                        
                    }
                    
                }
                else if (params.personalinfo != null && params.personalinfo.gender != null && params.personalinfo.gender == 2) {
                    //imageurl = filePath + '/female.png';
                }
                else {
                    //imageurl = filePath + '/male.png';
                }
            var dbcollectionname = dbo.collection(MongoDB.EmployeeCollectionName);
            //logger.info("enter4")
            dbcollectionname.insertOne(params, function (err, res) {
                if (err) throw err;
                //logger.info("enter5")
                finalresult = res.insertedCount;
                
                return callback(finalresult);
            });
        });

    }
    catch (e) { logger.error("Error in Employee Registration: " + e); }
}
exports.leadregistration = function (params, logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            params.makerid = String(logres["ops"][0]["_id"]);
            var dbcollectionname = dbo.collection(MongoDB.LeadCollectionName);
            dbcollectionname.insertOne(params, function (err, res) {
                if (err) throw err;
                finalresult = res.insertedCount;
                return callback(finalresult);
            });
        });

    }
    catch (e) { logger.error("Error in Employee Registration: " + e); }
}
exports.getMaxcode = function (callback) {
    try {
        const dbo = MongoDB.getDB();
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
exports.registerationload = function (logparams, req, callback) {
    try {
        var finalresult;
        // //console.log(logparams.employercode);
        logger.info("Log in Employer load : UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var params = Number(req.query.languagecode);  
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
                    _id: 0, knownfromcode: 1, knownfromname: '$knownfrom.knownfromname', isneedinput: 1, isuser: 1, ordervalue:1
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
            finalresult = { 
                "knowntypelist": knowntyperesult ,
                "userlist":userresult,
            } 
            return callback(finalresult);
        });
    });
                    
                    
    }
    catch (e) {
        logger.error("Error in Employee load: " + e);
    }
}
exports.checkEmployeeLogin = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in checking Employee Login : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ $or: [{ "username": { $regex: "^" + req.query.username + "$", $options: 'i' } }, { "mobileno": req.query.username }] }, { projection: { _id: 0, password: 1, employeecode: 1, employeename: 1, username: 1, mobileno: 1, statuscode: 1, "personalinfo.gender": 1, imageurl: 1 } }).toArray(function (err, empdetails) {
            ////console.log(empdetails);
            if (empdetails.length > 0) {
                ////console.log(empdetails);
                if (empdetails[0].statuscode != objConstants.activestatus && empdetails[0].statuscode != objConstants.pendingstatus) {
                    finalresult = {
                        "statuscode": empdetails[0].statuscode,
                        "username": empdetails[0].username,
                        "employeename": empdetails[0].employeename,
                        "employeecode": empdetails[0].employeecode,
                        "mobileno": empdetails[0].mobileno,
                        "gender": empdetails[0].personalinfo.gender,
                        "imageurl": empdetails[0].imageurl,
                        "result": false,
                        "isleadtype": 0
                    }
                    return callback(finalresult);
                }
                else {
                    objUtilities.decryptpassword(logparams, empdetails[0].password, function (passwordres) {
                         // //console.log(passwordres);
                        // var params={ "username": { $regex: "^" + req.query.username + "$", $options: 'i' } };
                        if ((empdetails[0].username.toLowerCase() == req.query.username.toLowerCase() || empdetails[0].mobileno == req.query.username) && passwordres == req.query.password) {
                            ////console.log(doc);
                            dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode":empdetails[0].employeecode, "statuscode": objConstants.pendingstatus }, { $set: { "statuscode": objConstants.activestatus } }, function (err, res) {
                                finalresult = {
                                    "username": empdetails[0].username,
                                    "employeename": empdetails[0].employeename,
                                    "employeecode": empdetails[0].employeecode,
                                    "mobileno": empdetails[0].mobileno,
                                    "result": true,
                                    "gender": empdetails[0].personalinfo.gender,
                                    "imageurl": empdetails[0].imageurl,
                                    "statuscode": empdetails[0].statuscode,
                                    "isleadtype": 0
                                }
                                return callback(finalresult);
                            });
                            
                            // //console.log(finalresult);

                        }
                        else {
                            finalresult = {
                                "result": false
                            }
                            return callback(finalresult);
                        }

                        
                        /* dbo.collection(MongoDB.EmployeeCollectionName).find({$and: {$or : [{"username":req.query.username},{"mobileno":req.query.username}] }, "password": passwordres}, {projection: {_id:0, employeecode:1,employeename:1, username:1, mobileno: 1}}).toArray(function(err, doc) 
                        {
                           
                        }); */
                    });
                }
                ////console.log(finalresult);

            }
            else {
                dbo.collection(MongoDB.LeadCollectionName).find({ $or: [{ "username": { $regex: "^" + req.query.username + "$", $options: 'i' } }, { "mobileno": req.query.username }] }, { projection: { _id: 0, password: 1, employeecode: 1, employeename: 1, username: 1, mobileno: 1, statuscode: 1, "personalinfo.gender": 1, imageurl: 1 } }).toArray(function (err, leaddetails) {
                    ////console.log(leaddetails);
                    if (leaddetails.length > 0) {
                        ////console.log(leaddetails);
                        if (leaddetails[0].statuscode != objConstants.activestatus && leaddetails[0].statuscode != objConstants.pendingstatus) {
                            finalresult = {
                                "statuscode": leaddetails[0].statuscode,
                                "username": leaddetails[0].username,
                                "employeename": leaddetails[0].employeename,
                                "employeecode": leaddetails[0].employeecode,
                                "mobileno": leaddetails[0].mobileno,
                                "gender": leaddetails[0].personalinfo.gender,
                                "imageurl": leaddetails[0].imageurl,
                                "result": false,
                                "isleadtype": 1
                            }
                            return callback(finalresult);
                        }
                        else {
                            objUtilities.decryptpassword(logparams, leaddetails[0].password, function (passwordres) {
                                 // //console.log(passwordres);
                                // var params={ "username": { $regex: "^" + req.query.username + "$", $options: 'i' } };
                                if ((leaddetails[0].username.toLowerCase() == req.query.username.toLowerCase() || leaddetails[0].mobileno == req.query.username) && passwordres == req.query.password) {
                                    ////console.log(doc);
                                    dbo.collection(MongoDB.LeadCollectionName).updateOne({ "employeecode":leaddetails[0].employeecode, "statuscode": objConstants.pendingstatus }, { $set: { "statuscode": objConstants.activestatus } }, function (err, res) {
                                        finalresult = {
                                            "username": leaddetails[0].username,
                                            "employeename": leaddetails[0].employeename,
                                            "employeecode": leaddetails[0].employeecode,
                                            "mobileno": leaddetails[0].mobileno,
                                            "result": true,
                                            "gender": leaddetails[0].personalinfo.gender,
                                            "imageurl": leaddetails[0].imageurl,
                                            "statuscode": leaddetails[0].statuscode,
                                            "isleadtype": 1
                                        }
                                        return callback(finalresult);
                                    });
                                    
                                    // //console.log(finalresult);
        
                                }
                                else {
                                    finalresult = {
                                        "result": false
                                    }
                                    return callback(finalresult);
                                }
        
                            });
                        }
                        ////console.log(finalresult);
        
                    }
                    else {
                        finalresult = {
                            "result": false
                        }
                        // //console.log(finalresult);
                        return callback(finalresult);
                    }
        
                });
            }

        });


    }
    catch (e) { logger.error("Error in checking Employee Login: " + e); }
}

exports.forgotpassword = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Employee Forgot Password : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ mobileno: req.query.mobileno }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            if (doc.length > 0) {
                objUtilities.encryptpassword(logparams, req.query.password, function (encryptpassword) {

                    dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "mobileno": req.query.mobileno }, { $set: { "password": encryptpassword } }, function (err, res) {
                        finalresult = res.modifiedCount;
                        ////console.log(finalresult);
                        return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
                    });
                });
            }
            else {
                dbo.collection(MongoDB.LeadCollectionName).find({ mobileno: req.query.mobileno }, { $exists: true }).toArray(function (err, leaddoc) //find if a value exists
                {
                    if (leaddoc.length > 0) {
                        objUtilities.encryptpassword(logparams, req.query.password, function (encryptpassword) {

                            dbo.collection(MongoDB.LeadCollectionName).updateOne({ "mobileno": req.query.mobileno }, { $set: { "password": encryptpassword } }, function (err, res) {
                                finalresult = res.modifiedCount;
                                ////console.log(finalresult);
                                return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
                            });
                        });
                    }
                    else {
                        return callback(false);
                    }

                });
            }

        });
    }
    catch (e) { logger.error("Error in Employee Forgor Password: " + e); }
}

exports.checkEmployeeUserNameExists = function (logparams, req, isleadtype, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employee User name  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        //var regex = new RegExp("^" + String(req.body.username).toLowerCase(), "i");
        //  //console.log(req.body.username );
        dbo.collection(MongoDB.EmployeeCollectionName).find({ username: { $regex: "^" + String(req.body.username).toLowerCase() + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            dbo.collection(MongoDB.EmployeeCollectionName).find({ mobileno: req.body.mobileno }, { $exists: true }).toArray(function (err, mobdoc) //find if a value exists
            {
                if(isleadtype == 0){
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
                }
                else{
                    finalresult = {
                        "usernamecount": doc.length,
                        "mobilenocount": mobdoc.length
                    }
                    // //console.log(finalresult);
                    return callback(finalresult);
                }
                
            });

        });
    }
    catch (e) { logger.error("Error in checking Employee User name : " + e); }
}

exports.checkPortalEmployeeUserNameExists = function (logparams, req, isleadtype, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employee User name  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        //var regex = new RegExp("^" + String(req.body.username).toLowerCase(), "i");
        //  //console.log(req.body.username );
        dbo.collection(MongoDB.LeadCollectionName).deleteOne({ "mobileno": req.body.mobileno }, function (err, res) {
            if (err) throw err;
            // finalresult = res.deletedCount;
            // return callback(finalresult);
          
        dbo.collection(MongoDB.EmployeeCollectionName).find({ username: { $regex: "^" + String(req.body.username).toLowerCase() + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            dbo.collection(MongoDB.EmployeeCollectionName).find({ mobileno: req.body.mobileno }, { $exists: true }).toArray(function (err, mobdoc) //find if a value exists
            {
                if(isleadtype == 0){
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
                }
                else{
                    finalresult = {
                        "usernamecount": doc.length,
                        "mobilenocount": mobdoc.length
                    }
                    // //console.log(finalresult);
                    return callback(finalresult);
                }
                
            });

        });
    });
    }
    catch (e) { logger.error("Error in checking Employee User name : " + e); }
}
exports.UpdateMobileNumber = function (logparams, req, callback) {
    try {
        ////console.log(req);
        logger.info("Updating employee Mobile no : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        ////console.log("entry");
        ////console.log(req);
        var dbCollectionName = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        
        dbo.collection(String(dbCollectionName)).findOneAndUpdate({ "employeecode": Number(req.query.employeecode) }, { $set: { "mobileno": req.query.mobileno, "contactinfo.mobileno": req.query.mobileno } }, function (err, res) {
            if (err)
                throw (err)
            // //console.log(res.lastErrorObject.updatedExisting);
            return callback(res.lastErrorObject.updatedExisting);


        });

    }
    catch (e) { logger.error("Error in Updating employee Mobile no: " + e); }
}

exports.checkvalidMobileNo = function (params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        var dbcollectionname = MongoDB.EmployeeCollectionName;

        dbo.collection(String(dbcollectionname)).find(params, { projection: { _id: 0, mobileno: 1 } }).toArray(function (err, result) {
            ////console.log(result);
            dbo.collection(MongoDB.LeadCollectionName).find(params, { projection: { _id: 0, mobileno: 1 } }).toArray(function (err, leadresult) {
                ////console.log(result);
                if (result.length + leadresult.length == 0)
                    res = false;
                else
                    res = true;
                //res=result[0].employeecode;  
                ////console.log(res);
                return callback(res);
            });
        });
    }
    catch (ex) {
        logger.error("Error in checking Valid Mobile no: " + e);
    }
    finally {
        //dbo.disconnect();
    }
}

exports.checkUserNameExists = function (req, callback) {
    try {
        var finalresult;
        /////logger.info("Log in Checking Employee User name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
        const dbo = MongoDB.getDB();
        // var regex = new RegExp("^" + req.query.username.toLowerCase(), "i");
        dbo.collection(MongoDB.EmployeeCollectionName).find({ username: { $regex: "^" + req.query.username + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            dbo.collection(MongoDB.LeadCollectionName).find({ username: { $regex: "^" + req.query.username + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, leaddoc) //find if a value exists
            {
                finalresult = {
                    "usernamecount": doc.length + leaddoc.length

                }
                // //console.log(finalresult);
                return callback(finalresult);

            });
        });
    }
    catch (e) { logger.error("Error in checking Employee User name: " + e); }
}

exports.checkMobileNoExists = function (req, callback) {
    try {
        var finalresult;
        //logger.info("Log in Checking Employee Mobile no : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ mobileno: req.query.mobileno }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            if(doc!=null && doc.length>0){
                var statuscode;
                if (doc[0].statuscode == objConstants.inactivestatus) {
                    statuscode = objConstants.deactivateaccountcode;
                } 
                else if (doc[0].statuscode == objConstants.blockstatus) {
                    statuscode = objConstants.abusedcode;
                }
                else {
                    statuscode = doc[0].statuscode;
                } 
                
                finalresult = {
                    "mobilenocount": doc.length,
                    "statuscode":statuscode
    
                }
                
                ////console.log(finalresult);
                return callback(finalresult);
            }
            else{
                dbo.collection(MongoDB.LeadCollectionName).find({ mobileno: req.query.mobileno }, { $exists: true }).toArray(function (err, leaddoc) //find if a value exists
                {
                    if(leaddoc!=null && leaddoc.length>0){
                        var statuscode;
                        if (leaddoc[0].statuscode == objConstants.inactivestatus) {
                            statuscode = objConstants.deactivateaccountcode;
                        } 
                        else if (leaddoc[0].statuscode == objConstants.blockstatus) {
                            statuscode = objConstants.abusedcode;
                        }
                        else {
                            statuscode = leaddoc[0].statuscode;
                        } 
                        
                        finalresult = {
                            "mobilenocount": leaddoc.length,
                            "statuscode":statuscode
            
                        }
                    }
                    else{
                        finalresult = {
                            "mobilenocount": doc.length    
                        }
                    }
                    ////console.log(finalresult);
                    return callback(finalresult);

                });
            }

        });
    }
    catch (e) { logger.error("Error in checking Employee Mobile no: " + e); }
}
exports.checkEmailIdExists = function (req, callback) {
    try {
        var finalresult;
        //logger.info("Log in Checking Employee Mobile no : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "contactinfo.emailid": { $regex: "^" + req.query.emailid + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            if(doc!=null && doc.length>0){
                var statuscode;
                if (doc[0].statuscode == objConstants.inactivestatus) {
                    statuscode = objConstants.deactivateaccountcode;
                } 
                else if (doc[0].statuscode == objConstants.blockstatus) {
                    statuscode = objConstants.abusedcode;
                }
                else {
                    statuscode = doc[0].statuscode;
                } 
                
                finalresult = {
                    "mobilenocount": doc.length,
                    "statuscode":statuscode
                }
                ////console.log(finalresult);
                return callback(finalresult);
            }
            else{
                dbo.collection(MongoDB.LeadCollectionName).find({ "contactinfo.emailid": { $regex: "^" + req.query.emailid + "$", $options: 'i' } }, { $exists: true }).toArray(function (err, leaddoc) //find if a value exists
                {
                    if(leaddoc!=null && leaddoc.length>0){
                        var statuscode;
                        if (leaddoc[0].statuscode == objConstants.inactivestatus) {
                            statuscode = objConstants.deactivateaccountcode;
                        } 
                        else if (leaddoc[0].statuscode == objConstants.blockstatus) {
                            statuscode = objConstants.abusedcode;
                        }
                        else {
                            statuscode = leaddoc[0].statuscode;
                        } 
                        
                        finalresult = {
                            "mobilenocount": leaddoc.length,
                            "statuscode":statuscode
                        }
                    }
                    else{
                        finalresult = {
                            "mobilenocount": leaddoc.length    
                        }
                    }
                    ////console.log(finalresult);
                    return callback(finalresult);

                });
            }

        });
    }
    catch (e) { logger.error("Error in checking Employee Mobile no: " + e); }
}

exports.checkAadharNoExists = function (req, callback) {
    try {
        var finalresult;
        //logger.info("Log in Checking Employee Mobile no : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
        const dbo = MongoDB.getDB();
        ////console.log(req.body.aadharno);
        dbo.collection(MongoDB.EmployeeCollectionName).find({$and:[{"personalinfo.aadharno":req.body.aadharno},{employeecode:{$ne:Number(req.body.employeecode)}}]}).toArray(function (err, doc) //find if a value exists
        {
            ////console.log(doc);
            if(doc!=null && doc.length>0){
                var statuscode;
                if (doc[0].statuscode == objConstants.inactivestatus) {
                    statuscode = objConstants.deactivateaccountcode;
                } 
                else if (doc[0].statuscode == objConstants.blockstatus) {
                    statuscode = objConstants.abusedcode;
                }
                else {
                    statuscode = doc[0].statuscode;
                } 
                
                finalresult = {
                    "aadharnocount": doc.length,
                    "statuscode":statuscode
    
                }
                ////console.log(finalresult);
                return callback(finalresult);
            }
            else{
                dbo.collection(MongoDB.LeadCollectionName).find({$and:[{"personalinfo.aadharno":req.body.aadharno},{employeecode:{$ne:Number(req.body.employeecode)}}]}).toArray(function (err, leaddoc) //find if a value exists
                {
                    ////console.log(doc);
                    if(leaddoc!=null && leaddoc.length>0){
                        var statuscode;
                        if (leaddoc[0].statuscode == objConstants.inactivestatus) {
                            statuscode = objConstants.deactivateaccountcode;
                        } 
                        else if (leaddoc[0].statuscode == objConstants.blockstatus) {
                            statuscode = objConstants.abusedcode;
                        }
                        else {
                            statuscode = leaddoc[0].statuscode;
                        } 
                        
                        finalresult = {
                            "aadharnocount": leaddoc.length,
                            "statuscode":statuscode
            
                        }
                    }
                    else{
                        finalresult = {
                            "aadharnocount": 0    
                        }
                    }
                    ////console.log(finalresult);
                    return callback(finalresult);

                });
            }

        });
    }
    catch (e) { logger.error("Error in checking Employee Aadhar no: " + e); }
}
// exports.UpdateMobileNumber = function (logparams, req, callback) {
//     try {
//         logger.info("Updating employee Mobile no : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
//         const dbo = MongoDB.getDB();
//         // db.tbl_cp_employee.updateOne({"employeecode":3},{$set:{"mobileno":"9047788666"}})
//         dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "mobileno": req.query.mobileno } }, function (err, res) {
//             if (err) {
//                 return callback(false);
//             }
//             else {
//                 ////console.log(res);
//                 return callback(true);
//             }
//         });

//     }
//     catch (e) { logger.error("Error in Updating employee Mobile no: " + e); }
// }
/* exports.checkvalidMobileNo = function (params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        var dbcollectionname = MongoDB.EmployeeCollectionName;

        dbo.collection(String(dbcollectionname)).find(params, { projection: { _id: 0, mobileno: 1 } }).toArray(function (err, result) {
            //console.log(params);
            if (result.length > 0)
                res = true;
            else
                res = false;
            //res=result[0].employeecode;  
            // //console.log(res);
            return callback(res);
        });
    }
    catch (ex) {
        logger.error(ex.message);
    }
    finally {
        //dbo.disconnect();
    }
} */
exports.Changepassword = function (logparams, req, callback) {
    try {
        logger.info("Change New Password : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "employeecode": Number(req.query.employeecode) }).toArray(function (err, doc) {
            ////console.log(doc);
            if (doc.length > 0) {
                objUtilities.encryptpassword(logparams, req.query.newpassword, function (encryptpassword) {

                    dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "password": encryptpassword } }, function (err, res) {
                        finalresult = res.modifiedCount;
                        ////console.log(finalresult);
                        return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
                    });
                });
            }
            else {
                dbo.collection(MongoDB.LeadCollectionName).find({ "employeecode": Number(req.query.employeecode) }).toArray(function (err, leaddoc) {
                    ////console.log(doc);
                    if (leaddoc.length > 0) {
                        objUtilities.encryptpassword(logparams, req.query.newpassword, function (encryptpassword) {
        
                            dbo.collection(MongoDB.LeadCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "password": encryptpassword } }, function (err, res) {
                                finalresult = res.modifiedCount;
                                ////console.log(finalresult);
                                return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
                            });
                        });
                    }
                    else {
                        return callback(false);
                    }
        
                });
            }

        });
    }
    catch (e) {
        { logger.error("Error in Change New password: " + e); }
    }
}

exports.CheckDecryptPassword = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        logger.info("Check decrypt Password : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "employeecode": Number(req.query.employeecode) }, { projection: { _id: 0, password: 1 } }).toArray(function (err, result) {

            objUtilities.decryptpassword(logparams, result[0].password, function (decryptpassword) {
                if (req.query.oldpassword == decryptpassword){
                    res = true;
                    return callback(res);
                }
                else{
                    dbo.collection(MongoDB.LeadCollectionName).find({ "employeecode": Number(req.query.employeecode) }, { projection: { _id: 0, password: 1 } }).toArray(function (err, result) {

                        objUtilities.decryptpassword(logparams, result[0].password, function (decryptpassword) {
                            if (req.query.oldpassword == decryptpassword)
                                res = true;
                            else
                                res = false;
                            return callback(res);
                        });
                    })
                }
            });
        })
    }
    catch (ex) {
        logger.error("Error in Check decrypt Password : " + e);
    }
    finally {
    }
}
exports.GetSingleUser = function (params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        ////console.log(params);
        //dbo.collection(MongoDB.EmployeeCollectionName).find({ $or: [{ "username": req.query.username }, { "mobileno": req.query.username }] }, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, result) {
        //dbo.collection(MongoDB.EmployeeCollectionName).find({ $or: [{ "username": req.query.username }, { "mobileno": req.query.username }] }, { projection: { _id: 0, password: 1, employeecode: 1, employeename: 1, username: 1, mobileno: 1, statuscode:1 } }).toArray(function (err, empdetails) {
        dbo.collection(MongoDB.EmployeeCollectionName).find({ $or: [{ "username": params }, { "mobileno": params }] }, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, result) {
            if (result != null && result.length > 0){
                res = result[0].employeecode;
                return callback(res);
            }
            else{
                dbo.collection(MongoDB.LeadCollectionName).find({ $or: [{ "username": params }, { "mobileno": params }] }, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, leadresult) {
                    if (leadresult != null && leadresult.length > 0){
                        res = leadresult[0].employeecode;
                        return callback(res);
                    }
                    else{
                        res = 0;
                    }
                })
            }
                
            ////console.log(res);
            

        })
    }
    catch (ex) {
        logger.error("Error in Single user details: " + e);
    }
    finally {
    }
}
exports.DeactivateEmployee = function (logparams, req, callback) {
    try {
        logger.info("Updating Status Code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        // db.tbl_cp_employee.updateOne({"employeecode":3},{$set:{"mobileno":"9047788666"}})
        dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "statuscode": objConstants.inactivestatus } }, function (err, res) {
            finalresult = res.modifiedCount;
            ////console.log(finalresult);
            return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
        });

    }
    catch (e) { logger.error("Error in Updating Status Code: " + e); }
}
exports.ActivateEmployee = function (logparams, req, callback) {
    try {

        var finalresult;
        logger.info("Activate Employee User name and Mobile No : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();

        dbo.collection(MongoDB.EmployeeCollectionName).findOneAndUpdate({ $or: [{ "username": req.query.username }, { "mobileno": req.query.username }] }, { $set: { "statuscode": objConstants.activestatus } }, { projection: { _id: 0, password: 1, employeecode: 1, employeename: 1, username: 1, mobileno: 1, statuscode: 1 } }, function (err, empdetails) {
            ////console.log(empdetails);
            if (err) throw err;
            finalresult = empdetails.lastErrorObject.updatedExisting;
           // //console.log(finalresult);
            return callback(finalresult);
        });

    }
    catch (e) { logger.error("Error in activate Employee User name and Mobile No: " + e); }
}
exports.getLeadRecordDetails = function (logparams, employeecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.LeadCollectionName).find({ "employeecode": parseInt(employeecode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - city" + e); }
}

exports.deleteLeadRecordDetails = function (logparams, employeecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.LeadCollectionName).deleteOne({ "employeecode": parseInt(employeecode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            return callback(finalresult);
          });
    }
    catch (e) { logger.error("Error in single record details - city" + e); }
}