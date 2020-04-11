import { MailSender } from "./../../infrastructure/mailSender"
import { Guid } from "guid-typescript"
import { AddUserTimelineCommand } from "./addUserTimelineCommand"
import { Client } from "@elastic/elasticsearch"
import { UserLocation } from "../../elastic/userLocation"
import { transformAndValidate } from "class-transformer-validator"
import mysql, { ConnectionConfig } from "mysql"
import { LocationsScoreCalculator } from "../../domain/locationsScoreCalculator"
import { Config } from '../../config/Config';

export class AddUserTimelineCommandHandler {
    constructor(
        private elasticClient: Client,
        private elasticIndex: string,
        private mysqlConnectionConfig: ConnectionConfig,
        private mailSender: MailSender) { }

    public async Handle(command: AddUserTimelineCommand): Promise<void> {
        await transformAndValidate(AddUserTimelineCommand, command)

        let userId: string
        
        const mysqlConnection = mysql.createConnection(this.mysqlConnectionConfig)
        mysqlConnection.query(`SELECT guid from Users where email = '${command.email}' limit 1`, async (err, rows) => {
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
        
            await this.elasticClient.bulk({
                refresh: "true",
                body: command.locations
                    .map(location => new UserLocation(
                        timelineId,
                        command.testType,
                        command.testDate,
                        [location.longitude, location.latitude],
                        location.timeFrom,
                        location.timeTo,
                        location.radius || Config.ACCURATE_DISTANCE,
                        false,
                        userId))
                    .flatMap(location => [{ index: { _index: this.elasticIndex } }, location])
            })

            await this.mailSender.SendMail(
                command.email,
                "Privacy Vs Germs Email Confirmation",
                `<html><body>
                <p>Thank you</p>
                <p>We have received your data submission. In order to finalize it please follow link provided below.</p>
                <p>By clicking on link below you consent and agree that 3 weeks of your Google Timeline data will be anonymously stored on our system.</p>
                <p><a href="http://privacy-vs-germs.us-east-2.elasticbeanstalk.com/locations/confirm/${timelineId}" target="_blank">Agree and Submit</a></p><p>Privacy VS Germs Team</p>
                </body></html>`
                )
        })
    }   
}
