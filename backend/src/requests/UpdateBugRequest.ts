/**
 * Fields in a request to update a single BUG item.
 */
export interface UpdateBugRequest {
  name: string
  dueDate: string
  done: boolean
  message: string
}