import { IsLatitude, IsLongitude, MinDate, MaxDate, IsNumber } from "class-validator"
import { IsBiggerThan } from "../validationDecorators/isBiggerThan"
import { Type } from "class-transformer"
import { Config } from '../config/Config';

export class LocationDto {
    @IsLatitude({ message: "invalid latitude" })
    readonly latitude: number

    @IsLongitude({ message: "invalid longitude" })
    readonly longitude: number

    @Type(() => Date)
    @MinDate(new Date(2020, 0), { message: "date is too old" })
    @MaxDate(new Date(), { message: "date cannot be in future" })
    readonly timeFrom: Date

    @Type(() => Date)
    @MinDate(new Date(2020, 0), { message: "date is too old" })
    @MaxDate(new Date(), { message: "date cannot be in future" })
    @IsBiggerThan("timeFrom", { message: "timeTo must be after timeFrom" })
    readonly timeTo: Date
    
    @IsNumber()
    readonly radius: number = Config.ACCURATE_DISTANCE

    constructor(
        latitude: number,
        longitude: number,
        timeFrom: Date,
        timeTo: Date,
        radius: number = Config.ACCURATE_DISTANCE) {
        this.latitude = latitude
        this.longitude = longitude
        this.timeFrom = timeFrom
        this.timeTo = timeTo
        this.radius = radius
    }
}
