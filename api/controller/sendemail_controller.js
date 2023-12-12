const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const varconstant = require('../../config/constants');
const objUtilities = require("../controller/utilities");
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
exports.SendMail = function (req, callback) {
    // Load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
    const dbo = MongoDB.getDB();
    dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
        if (err) throw err;
        AWS.config.update({
            accessKeyId: result[0].accessKeyId,
            secretAccessKey: result[0].secretAccessKey,
            region: result[0].region
        });
        // Set the region 
        const ses = new AWS.SES({ apiVersion: "2010-12-01" });
        // Create sendEmail params 
        var params = {
            Destination: { /* required */
                ToAddresses: [
                    'malashri@shivasoftwares.com'
                    /* more items */
                ]
            },
            Message: { /* required */
                Body: { /* required */
                    Html: {
                        Charset: "UTF-8",
                        Data: '<html>' +
                            '<head>' +
                            '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                            '</head>' +
                            '<body bgcolor="white" style="display: inline-block;color:black">' +
                            '<div style="text-align: center;padding: 20px;">' +
                            '<img src="/web_service/images/image_of_mail/logo.jpg"><br><br>' +
                            '<label style="font-size: 25px;"><font Style="color:black;">' +
                            'Welcome to</font> <font color="orange">JOBANYA!</font> </label>' +
                            '</div>' +
                            '<center>' +
                            '<div style="width: 60%;height: 100px;align-items: center;text-align:justify;justify-content: center;font-family: "Salsa",sans-serif;color:black !important">' +
                            '<p style="text-align: justify;font-size: 16px; !important">' +
                            '<font color="black">' +
                            'Thank you for joining JOBANYA! We truly appreciate you wanting to be a part of this driven and professional community. We will verify your application and will send you information regarding the next steps.' +
                            '</font>' +
                            '<br><br>' +
                            '<font color="black">' +
                            'If you would like to know more about JOBANYA, feel free to visit our website <a href="www.Jobanya.com">Jobanya.com</a> and start posting!' +
                            '</font>' +
                            '<br>' +
                            '<br><br>' +
                            '<center>' +
                            '<font color="black">If you have any other questions or ever need anything,</font>' +
                            '</center>' +
                            '<center>' +
                            '<font color="black">' +
                            '<a href="https://Jobanya.com/#contact"><u><font>Reach out to Jobanya support</font></u></a>' +
                            '</font>' +
                            '<br><br>' +
                            '<a href="https://www.facebook.com/jobanya.offocial/" target="_blank"><img src="/web_service/images/image_of_mail/facebook.png"></a>&nbsp;&nbsp;&nbsp;' +
                            '<a href="https://www.instagram.com/jobanya_in/?igshid=YmMyMTA2M2Y=" target="_blank"><img src="/web_service/images/image_of_mail/instagram.png"></a> &nbsp;&nbsp;&nbsp;' +
                            '<a href="https://twitter.com/BestJobsapp/" target="_blank"><img src="/web_service/images/image_of_mail/twitter.png"></span></a>&nbsp;&nbsp;&nbsp;' +
                            '<a href="https://www.youtube.com/channel/UCXTknuz12ghgr9RGn-ObPBA" target="_blank"><img src="/web_service/images/image_of_mail/youtube.png"></a>' +
                            '</center>' +
                            '<br>' +
                            '<center><font>&#9400; Jobanya. All rights reserved</font></center>' +
                            '</p>' +
                            '</div>' +
                            '</center>' +
                            '</body>' +
                            '</html>'
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Test email'
                }
            },
            Source: 'malashri@shivasoftwares.com' /* required */
        };
        // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
        const sendEmail = ses.sendEmail(params).promise();
        sendEmail
            .then(data => {
                //console.log("email submitted to SES", data);
                return callback(data);

            })
            .catch(error => {
                //console.log(error);
            });
    });
}

