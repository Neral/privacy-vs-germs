import { LocationDto } from "../../dtos/locationDto"
import { IsEmail, IsDate, MinDate, MaxDate, IsNotEmpty, IsString, ArrayNotEmpty, ValidateNested } from "class-validator"

export class AddUserTimelineCommand {
    @IsEmail({}, { message: "Invalid email" })
    readonly email: string

    @MinDate(new Date(2020, 0), { message: "Date is too old" })
    @MaxDate(new Date(), { message: "Date cannot be in future" })
    readonly testDate: Date

    @IsString({ message: "Invalid test type" })
    @IsNotEmpty({ message: "Invalid test type" })
    readonly testType: string

    @ArrayNotEmpty({ message: "At least one location must be provided" })
    @ValidateNested()
    readonly locations: LocationDto[]

    constructor(
        email: string,
        testDate: Date,
        testType: string,
        locations: LocationDto[]) {
        this.email = email
        this.testDate = testDate
        this.testType = testType
        this.locations = locations
    }
}