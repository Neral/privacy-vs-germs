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

    readonly radius: number

    readonly isConfirmed: boolean

    readonly userId: string

    constructor(
        timelineId: string,
        testType: string,
        testDate: Date,
        coordinates: number[],
        timeFrom: Date,
        timeTo: Date,
        radius: number,
        isConfirmed: boolean,
        userId: string) {
        this.timelineId = timelineId
        this.testType = testType
        this.testDate = testDate
        this.coordinates = coordinates
        this.timeFrom = timeFrom
        this.timeTo = timeTo
        this.radius = radius
        this.isConfirmed = isConfirmed
        this.userId = userId
    }
}
