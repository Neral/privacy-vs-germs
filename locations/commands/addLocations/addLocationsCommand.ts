import { TestType } from "../../../domain/testType"
import { LocationDto } from "../../dtos/locationDto"

export interface AddLocationsCommand {
    email: string
    testDate: number
    testType: TestType
    locations: LocationDto[]
}
