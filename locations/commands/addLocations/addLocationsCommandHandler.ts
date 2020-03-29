import { Client } from "@elastic/elasticsearch"
import { sha256 } from "js-sha256"
import { AddLocationsCommand } from "./addLocationsCommand"
import { UserInfo } from "../../../domain/userInfo"
import { Coordinates } from "../../../domain/coordinates"
import { Time } from "../../../domain/time"
import { UserLocationInfo } from "../../../domain/userLocationInfo"

export class AddLocationsCommandHandler {
    constructor(private client: Client, private locationInfoIndex: string) { }

    public async Handle(command: AddLocationsCommand): Promise<void> {
        const userLocationInfos = command.locations.map(location => {
            const emailHash = sha256(command.email)
            const userInfo = new UserInfo(emailHash, command.testType, command.testDate)
            const coordinates = new Coordinates(location.lat, location.lon)
            const time = new Time(location.from, location.to)
            return new UserLocationInfo(userInfo, coordinates, time)
        })
        const body = userLocationInfos.flatMap(userLocationInfo => [{ index: { _index: this.locationInfoIndex } }, userLocationInfo])
        await this.client.bulk({ refresh: "true", body: body })
    }
}
