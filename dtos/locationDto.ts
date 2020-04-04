export class LocationDto {
    constructor(
        readonly latitude: number,
        readonly longitude: number,
        readonly timeFrom: Date,
        readonly timeTo: Date) { }
}
