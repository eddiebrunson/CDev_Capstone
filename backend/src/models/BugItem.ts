/* Defines the structure of the data stored in the DynamoDB tables */

export interface BugItem {
  userId: string
  bugId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
  message: string
}
