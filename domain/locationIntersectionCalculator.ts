import { UserLocation } from "../elastic/userLocation"
import { LocationDto } from "../dtos/locationDto"
import { getDistance } from 'geolib';

export class LocationIntersectionCalculator {
    public static isIntersecting(positiveUserLocation: UserLocation, location: LocationDto): boolean {
        const distance = getDistance(
            { latitude: positiveUserLocation.coordinates[1], longitude: positiveUserLocation.coordinates[0] },
            { latitude: location.latitude, longitude: location.longitude }
        );
        return distance < positiveUserLocation.radius
    }
}
