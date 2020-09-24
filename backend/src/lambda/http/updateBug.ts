import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateBugRequest } from '../../requests/UpdateBugRequest'
import { createLogger } from '../../utils/logger'
import { updateBug } from '../../businessLogic/bugs'
import { getToken } from '../../helpers/authHelper'

const logger = createLogger('bugs')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing UpdateBug Event: ', event)
  const bugId = event.pathParameters.bugId
  const updatedBug: UpdateBugRequest = JSON.parse(event.body)

  // TODO: Update a bug item with the provided id using values in the "updatedBug" object
  
  const jwtToken: string = getToken(event.headers.Authorization)

  await updateBug(bugId, updatedBug, jwtToken);

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: 'update successful',
};
}