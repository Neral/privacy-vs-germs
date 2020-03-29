import { Time } from "./time"

export class LocationsScoreCalculator {
    public static calculateLocationScore(location1Time: Time, location2Time: Time): number {
        const germsLifespanOnSurface = 360 * 60000
        const noExposure = Number.MIN_SAFE_INTEGER
        let exposureMilliseconds: number

        if (location2Time.from <= location1Time.from) {
            if (location2Time.to <= location1Time.to) {
                exposureMilliseconds = location2Time.to - location1Time.from
            }
            else {
                exposureMilliseconds = location1Time.to - location1Time.from
            }
        }
        else {
            if (location2Time.to + germsLifespanOnSurface >= location1Time.to) {
                if (location1Time.to < location2Time.from) {
                    exposureMilliseconds = noExposure
                }
                else {
                    exposureMilliseconds = location1Time.to - location2Time.from
                }
            }
            else {
                exposureMilliseconds = location2Time.to + germsLifespanOnSurface - location2Time.from
            }
        }

        const exposureMinutes = exposureMilliseconds / 60000

        if (exposureMinutes > 15)
            return 10

        if (exposureMinutes > 0)
            return 5

        if (exposureMinutes > -360)
            return 2

        return 0
    }
}
