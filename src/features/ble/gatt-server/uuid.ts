// All UUIDs are based on this random UUID:
// 1ad01b31-dd4b-478c-9aa3-cbca25db3739

export enum UUID_Designator {
    PrimaryService,
    DeviceInfo,
    DeviceName,
    DeviceColor,
    DeviceKey,
    CurrentWiFi,
    AvailableWiFi,
}
export function getUuid(designator: UUID_Designator) {
    switch (designator) {
        case UUID_Designator.PrimaryService:
            return '1ad01000-dd4b-478c-9aa3-cbca25db3739';
        case UUID_Designator.DeviceInfo:
            return '1ad01010-dd4b-478c-9aa3-cbca25db3739';
        case UUID_Designator.DeviceName:
            return '1ad01011-dd4b-478c-9aa3-cbca25db3739';
        case UUID_Designator.DeviceColor:
            return '1ad01012-dd4b-478c-9aa3-cbca25db3739';
        case UUID_Designator.DeviceKey:
            return '1ad01013-dd4b-478c-9aa3-cbca25db3739';
        case UUID_Designator.CurrentWiFi:
            return '1ad01020-dd4b-478c-9aa3-cbca25db3739';
        case UUID_Designator.AvailableWiFi:
            return '1ad01030-dd4b-478c-9aa3-cbca25db3739';
    }
}
