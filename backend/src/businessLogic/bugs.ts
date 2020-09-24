/* Business Logic independent from external services */
/* To connect to other services we use adaptors and ports */
/* Makes the application more portable by not being tied to just one specific provider */
import { BugItem } from '../models/BugItem'
import { DataAccess } from '../dataLogic/dataAccess'
import { CreateBugRequest } from '../requests/CreateBugRequest'
import { UpdateBugRequest } from '../requests/UpdateBugRequest'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils'


const dataAccess = new DataAccess();

export async function getBugs(jwtToken) {
    const userId = parseUserId(jwtToken);
    return dataAccess.getBugItems(userId);
}

export async function createBug(
    createBugRequest: CreateBugRequest,
    jwtToken: string,
): Promise<BugItem> {
    const bugId = uuid.v4();
    const userId = parseUserId(jwtToken);

    return dataAccess.createBug({
        bugId: bugId,
        userId: userId,
        name: createBugRequest.name,
        dueDate: createBugRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
    });
}

export async function updateBug(
    bugId: string,
    updateBugRequest: UpdateBugRequest,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const bug = await dataAccess.get(bugId, userId);

    dataAccess.updateBug(bug.bugId, bug.userId, updateBugRequest);
}

export async function deleteBug(
    bugId: string,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const bug = await dataAccess.get(bugId, userId);

    await dataAccess.deleteBug(bug.bugId, bug.userId);
}

export async function setBugAttachmentUrl(bugId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken)
    console.log("Setting Item URL")
    console.log(bugId)
    console.log("userId:",userId)
    const url = await dataAccess.setBugAttachmentUrl(bugId, userId);
   return url
   }

   
export async function updateBugUrl(updateBug, userId: string, bugId: string): Promise<BugItem>{
    return await dataAccess.updateBugUrl({
        userId,
        bugId,
        attachmentUrl: updateBug.attachmentUrl,
    })
}