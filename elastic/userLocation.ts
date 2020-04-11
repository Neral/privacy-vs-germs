import { Type } from "class-transformer"

export class UserLocation {
    readonly timelineId: string

    readonly testType: string

    @Type(() => Date)
    readonly testDate: Date

    readonly coordinates: number[]

    @Type(() => Date)
    readonly timeFrom: Date

    @Type(() => Date)
    readonly timeTo: Date

    constructor(
        timelineId: string,
        testType: string,
        testDate: Date,
        coordinates: number[],
        timeFrom: Date,
        timeTo: Date) {
        this.timelineId = timelineId
        this.testType = testType
        this.testDate = testDate
        this.coordinates = coordinates
        this.timeFrom = timeFrom
        this.timeTo = timeTo
    }
}
