import { Guid } from "guid-typescript"
import { AddUserTimelineCommand } from "./addUserTimelineCommand"
import { Client } from "@elastic/elasticsearch"
import { UserLocation } from "../../elastic/userLocation"
import { transformAndValidate } from "class-transformer-validator"
import mysql, { ConnectionConfig } from "mysql"

export class AddUserTimelineCommandHandler {
    constructor(
        private elasticClient: Client,
        private elasticIndex: string,
        private mysqlConnectionConfig: ConnectionConfig) { }

    public async Handle(command: AddUserTimelineCommand): Promise<void> {
        await transformAndValidate(AddUserTimelineCommand, command)

        let userId: string
        
        const mysqlConnection = mysql.createConnection(this.mysqlConnectionConfig)
        mysqlConnection.query(`SELECT guid from Users where email = '${command.email}' limit 1`, (err, rows) => {
            if (err)
                throw err

            if (rows.length == 0) {
                userId = Guid.create().toString()
                mysqlConnection.query(`INSERT into Users (guid, email) values ('${userId}', '${command.email}')`, (err) => {
                    if (err)
                        throw err
                })
            }
            else {
                userId = rows[0].guid
            }
            const timelineId = Guid.create().toString()
        
            this.elasticClient.bulk({
                refresh: "true",
                body: command.locations
                    .map(location => new UserLocation(
                        timelineId,
                        command.testType,
                        command.testDate,
                        [location.longitude, location.latitude],
                        location.timeFrom,
                        location.timeTo,
                        false,
                        userId))
                    .flatMap(location => [{ index: { _index: this.elasticIndex } }, location])
            })

            this.elasticClient.updateByQuery({
                index: this.elasticIndex,
                body: {
                    script: {
                        source: "ctx._source['isConfirmed'] = true",
                    },
                    query: {
                        match: {
                            timelineId: timelineId
                        }
                    }
                }    
            })
        })
    }
}
