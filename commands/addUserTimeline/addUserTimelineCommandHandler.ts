import { Guid } from "guid-typescript"
import { AddUserTimelineCommand } from "./addUserTimelineCommand"
import { Client } from "@elastic/elasticsearch"
import { UserLocation } from "../../elastic/userLocation"
import { transformAndValidate } from "class-transformer-validator"
import mysql from "mysql"

export class AddUserTimelineCommandHandler {
    constructor(private client: Client, private index: string) { }

    public async Handle(command: AddUserTimelineCommand): Promise<void> {

        const timelineId = Guid.create().toString()
        await transformAndValidate(AddUserTimelineCommand, command)

        const env = process.env
        const connection = mysql.createConnection({
            host: env.RDS_HOSTNAME,
            database : env.RDS_DB_NAME,
            user: env.RDS_USERNAME,
            password: env.RDS_PASSWORD
        })

        connection.query(`INSERT into Users (guid, email) values ('${timelineId}', '${command.email}')`, (err) => {
            if (err) throw err;
        });
        
        await this.client.bulk({
            refresh: "true",
            body: command.locations
                .map(location => new UserLocation(
                    timelineId,
                    command.testType,
                    command.testDate,
                    [location.longitude, location.latitude],
                    location.timeFrom,
                    location.timeTo))
                .flatMap(location => [{ index: { _index: this.index } }, location])
        })
    }
}
