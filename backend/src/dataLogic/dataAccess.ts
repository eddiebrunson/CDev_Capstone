/*  */
import * as AWS from 'aws-sdk';
import * as AWSXRAY from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { BugItem } from '../models/BugItem';
import { BugUpdate } from '../models/BugUpdate';
import { createLogger } from '../utils/logger'

/* Creates an instance of AWS Clients using XRay SDK */
const XAWS = AWSXRAY.captureAWS(AWS);
const logger = createLogger(XAWS)

export class DataAccess {
    constructor(
        /*This parameter works with DynamoDB*/
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
      private readonly bucketName = process.env.S3_BUCKET,
        /*This parameter is the name of the table where all BUGS are stored*/
      private readonly bugsTable = process.env.BUGS_TABLE,
      //private readonly bucketUrl = process.env.S3_BUCKET_URL
    ) { }

async getBugItems(userId) {
    console.log('Get all bugs')
    const result  = await this.docClient. query({
        TableName: this.bugsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    })
    .promise();

   
   return result.Items
}

async get(bugId, userId){
    const result = await this.docClient
      .query({
        TableName: this.bugsTable,
        KeyConditionExpression: 'bugId = :bugId and userId = :userId',
        ExpressionAttributeValues: {
          ':bugId': bugId,
          ':userId': userId,
        },
      })
      .promise();

    
    return result.Items[0]
  }


async createBug(bugItem: BugItem): Promise<BugItem> { 
    await this.docClient
       .put({
           TableName: this.bugsTable,
           Item: bugItem
       })
       .promise()
    return bugItem
}

async updateBug(userId: string, bugId: string, updatedBug: BugUpdate) {
    const updtedBug = await this.docClient.update({
        TableName: this.bugsTable,
        Key: { userId, bugId },
        ExpressionAttributeNames: { "#N": "name" , "#M": "message" },
        UpdateExpression: "set #N=:bugName, dueDate=:dueDate, done=:done",
        ExpressionAttributeValues: {
        ":bugName": updatedBug.name,
        ":dueDate": updatedBug.dueDate,
        ":done": updatedBug.done,
        ":message": updatedBug.message,
         },
         ReturnValues: "UPDATED_NEW"
       })

       .promise();
     return { Updated: updtedBug };
 
   }

   async updateBugUrl(updatedBug: any): Promise<BugItem> {
    await this.docClient.update({
        TableName: this.bugsTable,
        Key: { 
            bugId: updatedBug.bugId, 
            userId: updatedBug.userId },
        ExpressionAttributeNames: {"#A": "attachmentUrl"},
        UpdateExpression: "set #A = :attachmentUrl",
        ExpressionAttributeValues: {
            ":attachmentUrl": updatedBug.attachmentUrl,
        },
        ReturnValues: "UPDATED_NEW"
    }).promise()
      
    return updatedBug
    
}

async setBugAttachmentUrl(bugId: string, userId: string): Promise<string> {
   logger.info('Generating upload Url')
   console.log('Generating upload Url')
     const url = await this.s3.getSignedUrl('putObject', {
         Bucket: this.bucketName,
         Key: bugId,
         Expires: 10000,
     });
     console.log(url);
 await this.docClient.update({
   TableName: this.bugsTable,
   Key: { userId, bugId},
   UpdateExpression: "set attachmentUrl=:URL",
   ExpressionAttributeValues: {
     ":URL": url.split("?")[0]
   },
   ReturnValues: "UPDATED_NEW"
   })
   .promise();
 return url;
 }


async deleteBug(bugId: string, userId: string) {
  const deleteBug = await this.docClient.delete({
        TableName: this.bugsTable,
        Key: {
            userId: userId,
            bugId: bugId,
          },
        })
        .promise();
      return { Deleted: deleteBug };
    }
}