import { Guid } from "guid-typescript";

const validateGUID = (guid: string) => {
    return  Guid.isGuid(guid);
}

export default validateGUID;