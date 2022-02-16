import dbus from 'dbus-next';
import * as utils from './gatt-utils'; 

export const ADAPTER_NAME = 'hci0';

export const BLUEZ_SERVICE_NAME = 'org.bluez';
export const BLUEZ_NAMESPACE = '/org/bluez/';

export const DBUS_PROP_IFACE ='org.freedesktop.DBus.Properties';
export const DBUS_OM_IFACE = 'org.freedesktop.DBus.ObjectManager';

export const ADAPTER_INTERFACE = BLUEZ_SERVICE_NAME + '.Adapter1';
export const DEVICE_INTERFACE = BLUEZ_SERVICE_NAME + '.Device1';

export const GATT_CHARACTERISTIC_INTERFACE = BLUEZ_SERVICE_NAME + '.GattCharacteristic1';
export const GATT_DESCRIPTOR_INTERFACE = BLUEZ_SERVICE_NAME + '.GattDescriptor1';
export const GATT_MANAGER_INTERFACE = BLUEZ_SERVICE_NAME + '.GattManager1';
export const GATT_SERVICE_INTERFACE = BLUEZ_SERVICE_NAME + '.GattService1';

export const ADVERTISEMENT_INTERFACE = BLUEZ_SERVICE_NAME + '.LEAdvertisement1';
export const ADVERTISING_MANAGER_INTERFACE = BLUEZ_SERVICE_NAME + '.LEAdvertisingManager1';

// System bus
export const systemBus = utils.getBus();

export namespace apperance {
    export const GenericUnknown = 0x0000;
    export const GenericPhone = 0x0040;
    export const GenericComputer = 0x0080;
    export const DesktopWorkstation = 0x0081;
    export const ServerclassComputer = 0x0082;
    export const Laptop = 0x0083;
    export const HandheldPC_PDAclamshell = 0x0084;
    export const PalmsizePC_PDA = 0x0085;
    export const Wearablecomputerwatchsize = 0x0086;
    export const Tablet = 0x0087;
    export const DockingStation = 0x0088;
    export const AllinOne = 0x0089;
    export const BladeServer = 0x008A;
    export const Convertible = 0x008B;
    export const Detachable = 0x008C;
    export const IoTGateway = 0x008D;
    export const MiniPC = 0x008E;
    export const StickPC = 0x008F;
    export const GenericWatch = 0x00C0;
    export const SportsWatch = 0x00C1;
    export const Smartwatch = 0x00C2;
    export const GenericClock = 0x0100;
    export const GenericDisplay = 0x0140;
    export const GenericRemoteControl = 0x0180;
    export const GenericEyeglasses = 0x01C0;
    export const GenericTag = 0x0200;
    export const GenericKeyring = 0x0240;
    export const GenericMediaPlayer = 0x0280;
    export const GenericBarcodeScanner = 0x02C0;
    export const GenericThermometer = 0x0300;

    export const GenericHeartRateSensor = 0x0340;
    export const HeartRateBelt = 0x0341;
    export const GenericBloodPressure = 0x0380;
    export const ArmBloodPressure = 0x0381;
    export const WristBloodPressure = 0x0382;
    export const GenericHumanInterfaceDevice = 0x03C0;
    export const Keyboard = 0x03C1;
    export const Mouse = 0x03C2;
    export const Joystick = 0x03C3;
    export const Gamepad = 0x03C4;
    export const DigitizerTablet = 0x03C5;
    export const CardReader = 0x03C6;
    export const DigitalPen = 0x03C7;
    export const BarcodeScanner = 0x03C8;
    export const Touchpad = 0x03C9;
    export const PresentationRemote = 0x03CA;
    export const GenericGlucoseMeter = 0x0400;
    export const GenericRunningWalkingSensor = 0x0440;
    export const InShoeRunningWalkingSensor = 0x0441;
    export const OnShoeRunningWalkingSensor = 0x0442;
    export const OnHipRunningWalkingSensor = 0x0443;
    export const GenericCycling = 0x0480;
    export const CyclingComputer = 0x0481;
    export const SpeedSensor = 0x0482;
    export const CadenceSensor = 0x0483;
    export const PowerSensor = 0x0484;
    export const SpeedandCadenceSensor = 0x0485;
    export const GenericControlDevice = 0x04C0;
    export const Switch = 0x04C1;
    export const MultiSwitch = 0x04C2;
    export const Button = 0x04C3;
    export const Slider = 0x04C4;
    export const RotarySwitch = 0x04C5;
    export const TouchPanel = 0x04C6;

    export const SingleSwitch = 0x04C7;
    export const DoubleSwitch = 0x04C8;
    export const TripleSwitch = 0x04C9;
    export const BatterySwitch = 0x04CA;
    export const EnergyHarvestingSwitch = 0x04CB;
    export const PushButton = 0x04CC;
    export const GenericNetworkDevice = 0x0500;
    export const AccessPoint = 0x0501;
    export const MeshDevice = 0x0502;
    export const MeshNetworkProxy = 0x0503;
    export const GenericSensor = 0x0540;
    export const MotionSensor = 0x0541;
    export const AirqualitySensor = 0x0542;
    export const TemperatureSensor = 0x0543;
    export const HumiditySensor = 0x0544;
    export const LeakSensor = 0x0545;
    export const SmokeSensor = 0x0546;
    export const OccupancySensor = 0x0547;
    export const ContactSensor = 0x0548;
    export const CarbonMonoxideSensor = 0x0549;
    export const CarbonDioxideSensor = 0x054A;
    export const AmbientLightSensor = 0x054B;
    export const EnergySensor = 0x054C;
    export const ColorLightSensor = 0x054D;
    export const RainSensor = 0x054E;
    export const FireSensor = 0x054F;
    export const WindSensor = 0x0550;
    export const ProximitySensor = 0x0551;
    export const MultiSensor = 0x0552;
    export const Flushmountedsensor = 0x0553;
    export const Ceilingmountedsensor = 0x0554;
    export const Wallmountedsensor = 0x0555;
    export const Multisensor = 0x0556;
    export const EnergyMeter = 0x0557;

    export const FlameDetector = 0x0558;
    export const VehicleTirePressureSensor = 0x0559;
    export const GenericLightFixtures = 0x0580;
    export const WallLight = 0x0581;
    export const CeilingLight = 0x0582;
    export const FloorLight = 0x0583;
    export const CabinetLight = 0x0584;
    export const DeskLight = 0x0585;
    export const TrofferLight = 0x0586;
    export const PendantLight = 0x0587;
    export const IngroundLight = 0x0588;
    export const FloodLight = 0x0589;
    export const UnderwaterLight = 0x058A;
    export const BollardwithLight = 0x058B;
    export const PathwayLight = 0x058C;
    export const GardenLight = 0x058D;
    export const PoletopLight = 0x058E;
    export const Spotlight = 0x058F;
    export const LinearLight = 0x0590;
    export const StreetLight = 0x0591;
    export const ShelvesLight = 0x0592;
    export const BayLight = 0x0593;
    export const EmergencyExitLight = 0x0594;
    export const Lightcontroller = 0x0595;
    export const Lightdriver = 0x0596;
    export const Bulb = 0x0597;
    export const LowbayLight = 0x0598;
    export const HighbayLight = 0x0599;
    export const GenericFan = 0x05C0;
    export const CeilingFan = 0x05C1;
    export const AxialFan = 0x05C2;
    export const ExhaustFan = 0x05C3;
    export const PedestalFan = 0x05C4;
    export const DeskFan = 0x05C5;
 
    export const WallFan = 0x05C6;
    export const GenericHVAC = 0x0600;
    export const Thermostat = 0x0601;
    export const Humidifier = 0x0602;
    export const Dehumidifier = 0x0603;
    export const Heater = 0x0604;
    export const Radiator = 0x0605;
    export const Boiler = 0x0606;
    export const Heatpump = 0x0607;
    export const Infraredheater = 0x0608;
    export const Radiantpanelheater = 0x0609;
    export const Fanheater = 0x060A;
    export const Aircurtain = 0x060B;
    export const GenericAirConditioning = 0x0640;
    export const GenericHumidifier = 0x0680;
    export const GenericHeating = 0x06C0;
    export const Radiator2 = 0x06C1;
    export const Boiler2 = 0x06C2;
    export const HeatPump = 0x06C3;
    export const InfraredHeater = 0x06C4;
    export const RadiantPanelHeater = 0x06C5;
    export const FanHeater = 0x06C6;
    export const AirCurtain = 0x06C7;
    export const GenericAccessControl = 0x0700;
    export const AccessDoor = 0x0701;
    export const GarageDoor = 0x0702;
    export const EmergencyExitDoor = 0x0703;
    export const AccessLock = 0x0704;
    export const Elevator = 0x0705;
    export const Window = 0x0706;
    export const EntranceGate = 0x0707;
    export const DoorLock = 0x0708;
    export const Locker = 0x0709;
    export const GenericMotorizedDevice = 0x0740;
} 

