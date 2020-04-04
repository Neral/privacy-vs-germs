import { IsLatitude, IsLongitude } from "class-validator"

export class LocationDto {
    @IsLatitude({message: "Invalid latitude"})
    readonly latitude: number

    @IsLongitude({message: "Invalind longitude"})
    readonly longitude: number

    
    readonly timeFrom: Date
    readonly timeTo: Date
    
    constructor(
        latitude: number,
        longitude: number,
        timeFrom: Date,
        timeTo: Date) {
        this.latitude = latitude
        this.longitude = longitude
        this.timeFrom = timeFrom
        this.timeTo = timeTo
    }
}
