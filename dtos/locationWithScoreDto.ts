export class LocationWithScoreDto {
    constructor(
        readonly latitude: number,
        readonly longitude: number,
        readonly timeFrom: Date,
        readonly timeTo: Date,
        readonly score: number) { }
}
