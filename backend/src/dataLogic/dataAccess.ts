/*  */
import * as AWS from 'aws-sdk';
import * as AWSXRAY from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { BugItem } from '../models/BugItem';
import { TodoUpdate } from '../models/TodoUpdate';
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
        /*This parameter is the name of the table where todos are stored*/
      private readonly bugsTable = process.env.BUGS_TABLE,
      //private readonly bucketUrl = process.env.S3_BUCKET_URL
    ) { }

async getTodoItems(userId) {
    console.log('Get all todos')
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

async get(todoId, userId){
    const result = await this.docClient
      .query({
        TableName: this.bugsTable,
        KeyConditionExpression: 'todoId = :todoId and userId = :userId',
        ExpressionAttributeValues: {
          ':todoId': todoId,
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

async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate) {
    const updtedTodo = await this.docClient.update({
        TableName: this.bugsTable,
        Key: { userId, todoId },
        ExpressionAttributeNames: { "#N": "name" },
        UpdateExpression: "set #N=:todoName, dueDate=:dueDate, done=:done",
        ExpressionAttributeValues: {
        ":todoName": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done
         },
         ReturnValues: "UPDATED_NEW"
       })

       .promise();
     return { Updated: updtedTodo };
 
   }

   async updateTodoUrl(updatedTodo: any): Promise<BugItem> {
    await this.docClient.update({
        TableName: this.bugsTable,
        Key: { 
            todoId: updatedTodo.todoId, 
            userId: updatedTodo.userId },
        ExpressionAttributeNames: {"#A": "attachmentUrl"},
        UpdateExpression: "set #A = :attachmentUrl",
        ExpressionAttributeValues: {
            ":attachmentUrl": updatedTodo.attachmentUrl,
        },
        ReturnValues: "UPDATED_NEW"
    }).promise()
      
    return updatedTodo
    
}

async setTodoAttachmentUrl(todoId: string, userId: string): Promise<string> {
   logger.info('Generating upload Url')
   console.log('Generating upload Url')
     const url = await this.s3.getSignedUrl('putObject', {
         Bucket: this.bucketName,
         Key: todoId,
         Expires: 10000,
     });
     console.log(url);
 await this.docClient.update({
   TableName: this.bugsTable,
   Key: { userId, todoId},
   UpdateExpression: "set attachmentUrl=:URL",
   ExpressionAttributeValues: {
     ":URL": url.split("?")[0]
   },
   ReturnValues: "UPDATED_NEW"
   })
   .promise();
 return url;
 }


async deleteTodo(todoId: string, userId: string) {
  const deleteTodo = await this.docClient.delete({
        TableName: this.bugsTable,
        Key: {
            userId: userId,
            todoId: todoId,
          },
        })
        .promise();
      return { Deleted: deleteTodo };
    }
}