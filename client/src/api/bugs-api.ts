import { apiEndpoint } from '../config'
import { Bug } from '../types/Bug';
import { CreateBugRequest } from '../types/CreateBugRequest';
import Axios from 'axios'
import { UpdateBugRequest } from '../types/UpdateBugRequest';

export async function getBugs(idToken: string): Promise<Bug[]> {
  console.log('Fetching bugs')

  const response = await Axios.get(`${apiEndpoint}/bugs`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Bugs:', response.data)
  return response.data.items
}

export async function createBug(
  idToken: string,
  newBug: CreateBugRequest
): Promise<Bug> {
  const response = await Axios.post(`${apiEndpoint}/bugs`,  JSON.stringify(newBug), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchBug(
  idToken: string,
  bugId: string,
  updatedBug: UpdateBugRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/bugs/${bugId}`, JSON.stringify(updatedBug), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteBug(
  idToken: string,
  bugId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/bugs/${bugId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  bugId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/bugs/${bugId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
