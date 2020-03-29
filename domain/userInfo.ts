import { TestType } from "./testType"

export class UserInfo {
    emailHash: string
    testType: TestType
    testDate: number

    constructor(emailHash: string, testType: TestType, testDate: number) {
        this.emailHash = emailHash
        this.testType = testType
        this.testDate = testDate
    }
}
