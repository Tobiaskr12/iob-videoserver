const convertDestinationToLocation = (destination: ('A' | 'B' | 'C' | 'D')) => {
    switch (destination) {
        case 'A':
            return {
              lat: 55.368718,
              lng: 10.431933,
            }
        case 'B':
            return {
              lat: 55.369556,
              lng: 10.431723,
            }
        case 'C':
            return {
              lat: 55.370879,
              lng: 10.428032,
            }
        case 'D':
            return {
              lat: 55.370052,
              lng: 10.429440,
            }
        default:
            throw new Error(`Unknown destination: ${destination}`);
    }
}

export default convertDestinationToLocation;
