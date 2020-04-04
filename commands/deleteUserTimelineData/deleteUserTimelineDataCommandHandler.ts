import { Client } from "@elastic/elasticsearch"
import { DeleteUserTimelineDataCommand } from "./deleteUserTimelineDataCommand"
import { sha256 } from "js-sha256"

export class DeleteUserTimelineDataCommandHandler {
    constructor(private client: Client, private index: string) { }

    public async Handle(command: DeleteUserTimelineDataCommand): Promise<void> {
        const emailHash = sha256(command.email)
        await this.client.deleteByQuery({
            index: this.index,
            body: {
                query: {
                    match: {
                        emailHash: emailHash
                    }
                }
            }
        })
    }
}