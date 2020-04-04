export class TimeInterval {
    constructor(readonly from: Date, readonly to: Date) {
        if (!from)
            throw new Error("Time interval start must be provided.")

        if (!to)
            throw new Error("Time interval end must be provided.")

        if (from >= to)
            throw new Error("Time interval start must be lower than interval end.")
    }

    containsInterval(timeInterval: TimeInterval): Boolean {
        if (!timeInterval)
            throw new Error("Time interval must be provided.")

        return this.containsDate(timeInterval.from) && this.containsDate(timeInterval.to)
    }

    containsDate(date: Date): Boolean {
        if (!date)
            throw new Error("Date must be provided.")

        return this.from <= date && this.to >= date
    }

    startsAfterInterval(timeInterval: TimeInterval): Boolean {
        if (!timeInterval)
            throw new Error("Time interval must be provided.")

        return this.startsAfterDate(timeInterval.to)
    }

    startsAfterDate(date: Date): Boolean {
        if (!date)
            throw new Error("Date must be provided.")

        return this.from > date
    }
}
