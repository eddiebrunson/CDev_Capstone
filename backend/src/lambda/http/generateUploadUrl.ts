
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { setTodoAttachmentUrl } from '../../businessLogic/todos'
import { updateTodoUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS from 'aws-sdk'

const logger = createLogger('generateUploadUrl')

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing GenerateUploadUrl', event)
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const uploadUrl = getUploadUrl(todoId)
  const userId = getUserId(event)
  const updatedTodo = {
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  }
  await updateTodoUrl(updatedTodo, userId, todoId)

 const url = await setTodoAttachmentUrl(todoId,jwtToken)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl,
      url
    }),
  };
};

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: 10000
  })
}