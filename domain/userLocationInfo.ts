import { UserInfo } from "./userInfo"
import { Time } from "./time"
import { Coordinates } from "./coordinates"

export class UserLocationInfo {
    userInfo: UserInfo
    coords: Coordinates
    time: Time

    constructor(userInfo: UserInfo, coords: Coordinates, time: Time) {
        this.userInfo = userInfo
        this.coords = coords
        this.time = time
    }
}
