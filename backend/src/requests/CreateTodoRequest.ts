/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTodoRequest {
  name: string
  dueDate: string
  done: string
  createdAt: string
  attachmentUrl: string
}
