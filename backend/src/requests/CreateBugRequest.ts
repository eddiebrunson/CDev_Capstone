/**
 * Fields in a request to create a single Bug item.
 */
export interface CreateBugRequest {
  name: string
  dueDate: string
  done: string
  createdAt: string
  attachmentUrl: string
  message: string
}
