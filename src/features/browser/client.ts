import {SensorAttributes} from '../sensors/sensor-attributes';

enum Category {
    Temperature = 'Temperature',
    AbsoluteHumidity = 'AbsoluteHumidity',
    RelativeHumidity = 'RelativeHumidity',
    WindSpeed = 'WindSpeed',
    rssi = 'rssi',
    Humidity = 'Humidity',
    AirPressure = 'AirPressure',
    AccelerationX = 'AccelerationX',
    AccelerationY = 'AccelerationY',
    AccelerationZ = 'AccelerationZ',
    Battery = 'Battery',
    TxPower = 'TxPower',
    MovementCounter = 'MovementCounter',
}

init();

function init() {
    initMenu();

    openSection('sensorSection');
    const monitorBtn = document.getElementById('monitor');
    on('click', monitorBtn,  ()=> { monitor();});
    window.addEventListener('message', receiveItemperDevice, false);

}
function receiveItemperDevice(event: any) {
    console.log('client.receiveItemperDevice, event=' + JSON.stringify(event.data));
}
function initMenu() {
    const menu = document.getElementById('menu');
    console.log('initMenu()');
    menu.appendChild(menuItem('Device','deviceSection'));
    menu.appendChild(menuItem('Sensors','sensorSection'));
    menu.appendChild(menuItem('Settings','settingsSection'));
}

function menuItem(name: string, sectionId: string): HTMLElement {
    console.log('menuItem: name=%s, sectionId=%s', name, sectionId);
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.innerHTML = name;
    on('click', a, ()=> { openSection(sectionId);});

    li.appendChild(a);
    return li;
}


function on(event: string, element: HTMLElement | null, fn: () => void) {
    if (element) {
        console.log('on %s: add event listener', event);
        element.addEventListener(event, fn);
    }
}
function setElementBackgroundColor(id: string, color: string) {
    const element = document.getElementById(id);
    if (element) {
        const backgroundColor = 'background-color:' + color;
        element.setAttribute('style', backgroundColor);
        console.log('setElementBackgroundColor: %s', id);
    } else {
        console.error('setElementBackgroundColor: ID NOT FOUND: %s', id);
    }
}
function setBackgroundColor(color: string) {
    setElementBackgroundColor('itemper-header', color);
    setElementBackgroundColor('itemper-footer', color);
}
function openSection(id: string) {
    console.log('openSection: ', id);
    closeActiveSections();
    const section = document.getElementById(id);
    if (section) {
        console.log('openSection: %s', id);
        section.style.display = 'block';
        section.classList.add('active');
    } else {
        console.log('openSection: section %s not found', id);
    }

}

function closeActiveSections() {
    const activeItems = document.getElementsByClassName('active');

    for (let index = 0; index < activeItems.length; index++) {
        const section = activeItems[index];
        section.classList.remove('active');
        section.setAttribute('style', 'display:none');
    }
}

export interface SensorDescription {
    SN: string;
    port: number;
}
export interface SensorSample {
    value: number;
    date: number;
}
export interface SensorLog {
    desc: SensorDescription;
    attr: SensorAttributes;
    samples: SensorSample[];
}
export type SettingValue = string | number;

export interface Setting {
    name: string;
    label: string;
    value: SettingValue;
    defaultValue: SettingValue;
    text: string;
    readonly: boolean;
}

const sensors: SensorLog[] = [];

const url = 'ws://' + window.location.host;
let socket = new WebSocket(url);

socket.onopen = function() {
    setConnectionStatus(true);
    socket.send(JSON.stringify({command: 'getSensors'}));
    socket.send(JSON.stringify({command: 'getSettings'}));
};

socket.onmessage = function(event) {
    setConnectionStatus(true);
    const msg = JSON.parse(event.data);
    switch(msg.command) {
        case 'sensors':
            receiveSensors(msg.data);
            if (!isMonitoring) {
                startMonitor(sensors);
            }
            break;
        case 'settings':
            receiveSettings(msg.data);
            break;
        case 'log':
            log(msg.data);
            break;
      }
};

socket.onclose = function() {
    setConnectionStatus(false);
    clearTimeout(logTimer);
    logTimer = setInterval(clearSensorValue, 5000);
};

socket.onerror = function() {
    setConnectionStatus(false);
    clearTimeout(logTimer);
    logTimer = setInterval(clearSensorValue, 5000);
};



function sensorName(desc: SensorDescription): string {
    return desc.SN.replace('--', '/') + '/' + desc.port;
}

function sensorId(desc: SensorDescription): string {
    const sn = desc.SN.replace(' ', desc.SN);
    const id = desc.SN.replace(' ', desc.SN) + '-' + desc.port;
    return id;
}

function receiveSensors(sensors: SensorLog[]) {
    const section = document.getElementById('sensorSection');
    for (const sensor of sensors) {
        const article = document.createElement('article');
        const heading = document.createElement('h3');

        heading.id = sensorId(sensor.desc) + '-value';
        article.appendChild(heading);

        const desc = document.createElement('p');
        desc.id = sensorId(sensor.desc);
        article.appendChild(desc);
        if (section) {
            section.appendChild(article);
        }
    }
    log(sensors);
}
let isMonitoring = false;
function setMonitoringButton() {
    const button = document.getElementById('monitor');
    if (!button) { return; }
    if (isMonitoring) {
        button.innerHTML = 'Stop monitor';
        button.classList.add('isMonitoring');
    } else {
        button.innerHTML = 'Start Monitor';
        button.classList.remove('isMonitoring');
    }
}

function startMonitor(sensors: SensorLog[]) {
    isMonitoring = true;
    setMonitoringButton();
    const command = 'startMonitor';
    const data: any = [];
    for (const sensor of sensors) {
        data.push(sensor.desc);
    }
    socket.send(JSON.stringify({command, data}));
}

function stopMonitor(sensors: SensorLog[]) {
    isMonitoring = false;
    setMonitoringButton();
    const command = 'stopMonitor';
    const data: any = [];
    for (const sensor of sensors) {
        data.push(sensor.desc);
    }
    socket.send(JSON.stringify({command, data}));
}
function unit(category: Category): string {
    switch (category) {
        case Category.AbsoluteHumidity || Category.RelativeHumidity || Category.Humidity:
            return ' \%';
        case Category.Temperature:
            return ' °C';
         default:
            return '';
    }
}
function categoryName(category: Category): string {
    switch (category) {
        case Category.AbsoluteHumidity:
            return 'Absolute Humidity';
        case Category.RelativeHumidity:
            return 'Relative Humidity';
        case Category.Humidity:
            return 'Humidity';
        case Category.Temperature:
            return 'Temperature';
        case Category.rssi:
            return 'RSSI';
        case Category.MovementCounter:
            return 'Movement Counter';
         default:
            return category.toString();
    }
}
let logTimer: any;
function log(sensorData: SensorLog[]) {
    for (const sensor of sensorData) {
        const log = document.getElementById(sensorId(sensor.desc) + '-value');
        if (log) {
            const date = new Date(sensor.samples[0].date);
            const value = sensor.samples[0].value;
            log.innerHTML = categoryName(sensor.attr.category) + ': ' + value + unit(sensor.attr.category);
        }
        const desc = document.getElementById(sensorId(sensor.desc));
        if (desc) {
            const date = new Date(sensor.samples[0].date);
            const value = sensor.samples[0].value;
            desc.innerHTML = 'by ' + sensorName(sensor.desc)  + ': ' +
                date.toLocaleDateString() + ', ' + date.toLocaleTimeString() + '. model: ' + sensor.attr.model;
        }
        clearTimeout(logTimer);
        logTimer = setInterval(clearSensorValue, 3000);
    }
}
class HTMLSetting implements Setting {
    private static settings: HTMLSetting[] = [];
    public value: SettingValue;
    public label: string;
    public defaultValue: SettingValue;
    public text: string;
    public readonly: boolean;
    public name: string;
    public backstore: string;
    public input: HTMLInputElement;
    public editBtn: HTMLButtonElement;
    public SaveBtn: HTMLButtonElement;
    constructor(setting: Setting) {
        this.name = setting.name;
        this.label = setting.label;
        this.value = setting.value;
        this.defaultValue = setting.defaultValue;
        this.text = setting.text;
        this.readonly = setting.readonly;
        this.input = <HTMLInputElement>document.getElementById(name +'value');
        this.backstore = this.value.toString();
        this.editBtn = <HTMLButtonElement>document.getElementById(name +'edit');
        this.SaveBtn = <HTMLButtonElement>document.getElementById(name +'save');
    }

    public static create(setting: Setting): HTMLSetting {
        if (!HTMLSetting.has (setting.name)) {
            const newSetting = new HTMLSetting(setting);
            HTMLSetting.settings.push(newSetting);
            return newSetting;
        } else {
            console.error('HTMLSetting.create: setting exists ', setting.name);
            throw Error();
        }
    }
    public static find(name: string): HTMLSetting {
        for (const setting of HTMLSetting.settings) {
            if (setting.name === name) {
                return setting;
            }
        }
        console.error('Setting.find: setting "%s" not found', name);
        console.log('HTMLSetting.get: length=', HTMLSetting.settings.length);
        throw Error();
    }

    public static has(name: string ): boolean {
        for (const setting of HTMLSetting.settings) {
            if (setting.name === name) {
                return true;
            }
        }
        return false;
    }
    public editSetting() {
        this.backstore =  this.input.value;
        this.input.readOnly=true;
        this.input.classList.remove('settingReadonly');
        this.input.classList.add('settingEdit');

        this.editBtn.innerHTML='Avbryt';
        this.editBtn.classList.remove('settingReadonly');
        this.editBtn.classList.add('settingEdit');

        this.SaveBtn.setAttribute('style', 'display:block');
    }

    public readonlySetting() {
        this.input.value=this.backstore;
        this.input.readOnly=false;
        this.input.classList.remove('settingEdit');
        this.input.classList.add('settingReadonly');

        this.editBtn.innerHTML='Ändra';
        this.editBtn.classList.remove('settingEdit');
        this.editBtn.classList.add('settingReadonly');

        this.SaveBtn.setAttribute('style', 'display:none');
    }

    public saveSetting() {
        if (this.backstore !== this.input.value) {
            this.backstore=this.input.value;
         }
        this.readonlySetting();
    }
}

function textFieldSettingHtml(setting: Setting) {
    const template = document.getElementById('template-text-field-setting');
    if (!template) {
        console.error('addSetting: template missing');
        return;
    }
    const templateHtml = template.innerHTML;

    // replace placeholder tags
    // with actual data, and generate final HTML

    const html = templateHtml.replace(/{{name}}/g, setting.name)
                            .replace(/{{label}}/g, setting.label)
                            .replace(/{{text}}/g, setting.text)
                            .replace(/{{value}}/g, setting.value.toString());
} 
function addSetting(setting: Setting, section: HTMLElement) {
    console.log('addSetting: ' + setting.name);
    // Get the contents of the template
    const template = document.getElementById('template-setting');
    if (!template) {
        console.error('addSetting: template missing');
        return;
    }
    const templateHtml = template.innerHTML;

    // replace placeholder tags
    // with actual data, and generate final HTML

    const html = templateHtml.replace(/{{name}}/g, setting.name)
                            .replace(/{{label}}/g, setting.label)
                            .replace(/{{text}}/g, setting.text)
                            .replace(/{{value}}/g, setting.value.toString());

    const article = document.createElement('article');
    article.innerHTML = html;
    section.appendChild(article);
    const editBtn = document.getElementById(setting.name + 'edit');
    const saveBtn = document.getElementById(setting.name + 'save');
    if (setting.readonly) {
        editBtn.style.display = 'none';
        saveBtn.style.display = 'none';
    } else {
        on ('click', editBtn, ()=> {
            clickedEdit(setting.name);
        });
        on ('click', saveBtn, ()=> {
            clickedSaved(setting.name);
        });
    }

    const settingDOM: HTMLSetting =  HTMLSetting.create(setting);
}

function updateSetting(setting: Setting) {
    console.log('updateSetting: ' + setting.name);
    const input = <HTMLInputElement>document.getElementById(setting.name +'value');
    const readonly = input.readOnly;
    input.readOnly=false;
    input.value = setting.value.toString();
    input.readOnly = readonly;
}

function editSetting(name: string) {
    const input = <HTMLInputElement>document.getElementById(name +'value');
    const editBtn = <HTMLButtonElement>document.getElementById(name +'edit');
    const SaveBtn = <HTMLButtonElement>document.getElementById(name +'save');
    input.readOnly = false;
    input.classList.remove('settingReadonly');
    input.classList.add('settingEdit');

    editBtn.innerHTML='Cancel';

    SaveBtn.setAttribute('style', 'display:block');
}
function clickedEdit(name: string) {
    const input=<HTMLInputElement>document.getElementById(name +'value');
    if (input.readOnly) {
        console.log('edit:', name);
        editSetting(name);
    } else {
        console.log('cancel:', name);
        readonlySetting(name);
    }
}
function clickedSaved(name: string) {
    console.log('clickedSaved:');
    const input = <HTMLInputElement>document.getElementById(name +'value');
    const SaveBtn = <HTMLButtonElement>document.getElementById(name +'save');
    const setting: HTMLSetting = HTMLSetting.find(name);
    if (!input || !setting || !SaveBtn) {
        console.error('clickedSaved: could not find all HTML element');
        return;
    }
    setting.backstore = input.value;
    setting.value = input.value;
    SaveBtn.setAttribute('style', 'display:none');
    readonlySetting(name);
    socket.send(JSON.stringify({command: 'saveSetting', data: <Setting>setting}));
    if (isBrowserSetting(setting)) {
        updateBrowser(setting);
    }
}

function readonlySetting(name: string) {
    const input = <HTMLInputElement>document.getElementById(name +'value');
    const editBtn = <HTMLButtonElement>document.getElementById(name +'edit');
    const SaveBtn = <HTMLButtonElement>document.getElementById(name +'save');
    const setting = HTMLSetting.find(name);

    input.classList.remove('settingEdit');
    input.classList.add('settingReadonly');

    editBtn.innerHTML='Edit';

    editBtn.blur();

    input.value=setting.backstore;
    input.readOnly=true;

    SaveBtn.setAttribute('style', 'display:none');
}

const BrowserSettings  = ['COLOR'];
function isBrowserSetting(setting: Setting) {
    return BrowserSettings.find((s) => s === setting.name);
}
function updateBrowser(setting: Setting) {
    console.log('updateBrowser: %s', setting.name);
    switch (setting.name) {
        case 'COLOR':
            setBackgroundColor(setting.value as string);
            return;
    }
    console.error('updateBrowser: No handler for %s', setting.name);
}
function receiveSettings(allSettings: Setting[]) {
    const section = document.getElementById('settingsSection');
    for (const setting of allSettings) {
        if (HTMLSetting.has(setting.name)) {
            updateSetting(setting);
        } else {
            addSetting(setting, section);
        }
        if (isBrowserSetting(setting)) {
            updateBrowser(setting);
        }
    }
}
function setConnectionStatus(connected: boolean) {
    const status = document.getElementById('connection');
    isMonitoring = connected && isMonitoring;
    setMonitoringButton();
    if (status && connected && isMonitoring) {
        status.innerHTML = ' (live)';
    } else if (status && connected) {
        status.innerHTML = ' (Connected)';
    } else if (status) {
        status.innerHTML = ' (Disconnected)';
    }
}

function monitor() {
    if (isMonitoring) {
        stopMonitor(sensors);

    } else {
        startMonitor(sensors);
    }
}

function clearSensorValue() {
    for (const sensor of sensors) {
        const sampleDate = sensor.samples[0].date;
        if (Date.now() - sampleDate > 60_000) {
            const sensorValue = document.getElementById(sensorId(sensor.desc));
            if (sensorValue) {
                sensorValue.innerHTML = 'No sensor data received last 60 seconds';
            }
        }
    }

    setConnectionStatus(socket.readyState === socket.OPEN);
    if (socket.readyState === socket.CLOSED) {
        socket = new WebSocket(url);
    }
}

function round(value: number, precision: number) {
    //    precision || (precision = 1);
    const inverse = 1.0 / precision;
    return Math.round(value * inverse) / inverse;
}
