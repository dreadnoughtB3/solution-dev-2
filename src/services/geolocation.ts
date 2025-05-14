import { Coordinates } from "@/types/map";

const DEFAULT_LOCATION: Coordinates = {
    lat: 35.6811673,
    lng: 139.7670516,
}

export const getLocation = async (): Promise<Coordinates> => {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return DEFAULT_LOCATION;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        resolve(DEFAULT_LOCATION);
      }
    );
  });
};
