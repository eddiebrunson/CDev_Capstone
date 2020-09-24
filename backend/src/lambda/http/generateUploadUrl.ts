
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { setBugAttachmentUrl } from '../../businessLogic/bugs'
import { updateBugUrl } from '../../businessLogic/bugs'
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
  // TODO: Return a presigned URL to upload a file for a BUG item with the provided id

  const bugId = event.pathParameters.bugId
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const uploadUrl = getUploadUrl(bugId)
  const userId = getUserId(event)
  const updatedBug = {
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${bugId}`
  }
  await updateBugUrl(updatedBug, userId, bugId)

 const url = await setBugAttachmentUrl(bugId,jwtToken)

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

function getUploadUrl(bugId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: bugId,
    Expires: 10000
  })
}