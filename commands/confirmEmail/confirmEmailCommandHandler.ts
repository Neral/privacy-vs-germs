import { ConfirmEmailCommand } from './confirmEmailCommand';
import { transformAndValidate } from "class-transformer-validator"

export class ConfirmEmailCommandHandler {
    constructor() { }

    public async Handle(command: ConfirmEmailCommand): Promise<void> {
        await transformAndValidate(ConfirmEmailCommand, command)
        console.log(command)
    }
}
