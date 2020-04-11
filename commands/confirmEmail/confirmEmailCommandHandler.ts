import { ConfirmEmailCommand } from './confirmEmailCommand';
import { transformAndValidate } from "class-transformer-validator"
import { Client } from '@elastic/elasticsearch';

export class ConfirmEmailCommandHandler {
    constructor(
        private elasticClient: Client,
        private elasticIndex: string) { }

    public async Handle(command: ConfirmEmailCommand): Promise<void> {
        await transformAndValidate(ConfirmEmailCommand, command)
        await this.elasticClient.updateByQuery({
            index: this.elasticIndex,
            body: {
                script: {
                    source: "ctx._source['isConfirmed'] = true",
                },
                query: {
                    match: {
                        timelineId: command.confirmationCode
                    }
                }
            }    
        })
    }
}
