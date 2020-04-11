import { IsNotEmpty } from "class-validator"

export class ConfirmEmailCommand {
    @IsNotEmpty({ message: "invalid confirmation code" })
    readonly confirmationCode: string

    constructor(confirmationCode: string) {
        this.confirmationCode = confirmationCode
    }
}