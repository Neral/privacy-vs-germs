export class UserLocation {
    constructor(
        readonly timelineId: string, 
        readonly emailHash: string, 
        readonly testType: string, 
        readonly testDate: Date, 
        readonly coordinates: number[], 
        readonly timeFrom: Date, 
        readonly timeTo: Date) { }
}
