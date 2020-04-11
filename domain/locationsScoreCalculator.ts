import { TimeInterval } from "./timeInterval"
import { Config } from '../config/Config';

export class LocationsScoreCalculator {
    

    public static calculateExposureScore(distance: number, radius: number, checkTimeInterval: TimeInterval, positiveCaseTimeInterval: TimeInterval): number {
        if (!checkTimeInterval)
            throw new Error("Check time interval must be provided.")

        if (!positiveCaseTimeInterval)
            throw new Error("Positive case time interval must be provided.")

        const germsLifespanOnSurface = 6 * 60 * 60 * 1000
        const germsOnSurfaceTimeInterval = new TimeInterval(
            positiveCaseTimeInterval.to, new Date(positiveCaseTimeInterval.to.valueOf() + germsLifespanOnSurface))
        const exposedTimeInterval = new TimeInterval(positiveCaseTimeInterval.from, germsOnSurfaceTimeInterval.to)

        if (!exposedTimeInterval.containsDate(checkTimeInterval.from) && !exposedTimeInterval.containsDate(checkTimeInterval.to))
            return 0

        if (germsOnSurfaceTimeInterval.containsDate(checkTimeInterval.from))
            return 2

        let exposure: number

        if (exposedTimeInterval.containsInterval(checkTimeInterval))
            exposure = checkTimeInterval.to.valueOf() - checkTimeInterval.from.valueOf()

        else if (checkTimeInterval.containsInterval(exposedTimeInterval))
            exposure = exposedTimeInterval.to.valueOf() - exposedTimeInterval.from.valueOf()

        else if (exposedTimeInterval.containsDate(checkTimeInterval.from))
            exposure = exposedTimeInterval.to.valueOf() - checkTimeInterval.from.valueOf()

        else
            exposure = checkTimeInterval.to.valueOf() - exposedTimeInterval.from.valueOf()

        const score = exposure > 15 * 60 * 1000 ? 10 : 5
        const isNearby = distance <= Config.ACCURATE_DISTANCE
        return isNearby ? score : (distance / radius) * score
    }
}
