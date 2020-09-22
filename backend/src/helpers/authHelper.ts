import { Jwt } from '../auth/Jwt'
import { decode } from 'jsonwebtoken'



export function getUserId(authHeader: string): string{
    const token = getToken(authHeader)
    const jwt: Jwt = decode(token, { complete: true }) as Jwt
    return jwt.payload.sub
  }
  
export function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('Error no authentication header')
  
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
  
    const split = authHeader.split(' ')
    const token = split[1]
  
    return token
  }