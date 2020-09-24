import 'source-map-support/register'
import { getTodos } from '../../businessLogic/bugs'
import { createLogger } from '../../utils/logger'
import { getToken } from '../../helpers/authHelper'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const logger = createLogger('getTodos')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all BUG items for a current user
  logger.info('Processing GetTodos Event: ', event)
  try{
  const jwtToken: string = getToken(event.headers.Authorization)
  const todoItems = await getTodos(jwtToken)
  logger.info('Get bugs successful')
  console.log(todoItems)


  return {
    statusCode: 200, 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: todoItems,
    })
  }

} catch (error) {
  if(error.statusCode == 403) {
    console.error('The bug does not have an image yet.')
   }

  }
}