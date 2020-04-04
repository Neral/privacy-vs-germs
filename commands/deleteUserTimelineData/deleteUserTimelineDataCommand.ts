import { IsEmail } from "class-validator"

export class DeleteUserTimelineDataCommand {
    @IsEmail({}, {
        message: "Invalid email"
    })
    readonly email: string

    constructor(email: string) {
        this.email = email
    }
}