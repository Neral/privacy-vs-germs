import { Guid } from "guid-typescript"
import { sha256 } from "js-sha256"
import { AddUserTimelineCommand } from "./addUserTimelineCommand"
import { Client } from "@elastic/elasticsearch"
import { UserLocation } from "../../elastic/userLocation"

export class AddUserTimelineCommandHandler {
    constructor(private client: Client, private index: string) { }

    public async Handle(command: AddUserTimelineCommand): Promise<void> {
        const timelineId = Guid.create().toString()
        const emailHash = sha256(command.email)
        await this.client.bulk({
            refresh: "true",
            body: command.locations
                .map(location => new UserLocation(
                    timelineId,
                    emailHash,
                    command.testType,
                    command.testDate,
                    [location.longitude, location.latitude],
                    location.timeFrom,
                    location.timeTo))
                .flatMap(location => [{ index: { _index: this.index } }, location])
        })
    }
}
