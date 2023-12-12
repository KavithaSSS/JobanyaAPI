
const winston = require('winston')
WinstonCloudWatch = require('winston-cloudwatch');
const objConstants = require('../../config/constants');
const MongoDB = require('../../config/database');
// Cloud Watch error
exports.clouderrorLog = async function (error) {
    
    try {   
      var logGroupName = objConstants.s3_log_group_name; 
      var awsRegion = 'ap-south-1';
      var awsAccessKeyId = 'AKIA3DO4IRQFRNJXBGEP';
      var awsSecretKeyId = 'lC3tbHvC+gsA6IHWWD930dQTaI5KfMugxixajD6F'; 
      var AWS = require('aws-sdk');
        try {  
            // const dbo = MongoDB.getDB();
            // dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            //     awsAccessKeyId = result[0].accessKeyId,
            //     awsSecretKeyId = result[0].secretAccessKey,
            //     awsRegion = "ap-south-1"
            //     logGroupName = objConstants.s3_log_group_name; 
                
            // });
          
          
        } catch (error) {
          console.log('Something went wrong: Service: awsCredentials', error); 
        }
       
        AWS.config.update({
            accessKeyId:awsAccessKeyId,
            secretAccessKey:awsSecretKeyId,
            region: "ap-south-1"
         }); 
      // when you don't provide a name the default one
      // is CloudWatch 
      console.log("Regiontttttttttttttttttt", awsRegion)
      winston.add(new WinstonCloudWatch({
        logGroupName: 'jobanya_error_log',
        logStreamName: "errorlog",
        awsRegion: 'ap-south-1',
        awsAccessKeyId: 'AKIA3DO4IRQFRNJXBGEP',
        awsSecretKeyId: 'lC3tbHvC+gsA6IHWWD930dQTaI5KfMugxixajD6F'
      }));
      winston.error('API - File Name : Test Entry');
    } catch (error) {
      
      console.log('Something went wrong: Service: clouderrorLog', error);
      throw new Error(error);
    }
  }