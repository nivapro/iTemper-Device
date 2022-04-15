import { registerReceiveCommand, registerOnOpenCommand, sendCommand } from './client-connection'; 
export type SettingValue = string | number;
export interface Setting {
    name: string;
    label: string;
    value: SettingValue;
    defaultValue: SettingValue;
    text: string;
    readonly: boolean;
}
interface BrowserSettings {
    [name: string]: (setting: Setting) => void;
}
export function init() {
    registerReceiveCommand('settings', receiveSettings);
    registerOnOpenCommand('getSettings');
}
const browserSettings: BrowserSettings = {}; 
export function registerBrowserSetting(setting: string, callback: (setting: Setting) => void) {
    browserSettings [setting] = callback;
} 
function isBrowserSetting(setting: Setting) {
    for (const name in browserSettings) {
        if (name === setting.name) {
            return true;
        } 
    } 
    return false;
}
function on(event: string, element: HTMLElement | null, fn: () => void) {
    if (element) {
        console.log('on %s: add event listener', event);
        element.addEventListener(event, fn);
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
function textFieldHtml(setting: Setting) {
    // Get the contents of the template
    const template = document.getElementById('template-text-field-setting');
    if (!template) {
        console.error('addSetting: template missing');
        return;
    }
    const templateHtml = template.innerHTML;

    // replace placeholder tags
    // with actual data, and generate final HTML

    return templateHtml.replace(/{{name}}/g, setting.name)
                            .replace(/{{label}}/g, setting.label)
                            .replace(/{{text}}/g, setting.text)
                            .replace(/{{value}}/g, setting.value.toString());
} 
function addSetting(setting: Setting, section: HTMLElement) {
    console.log('addSetting: ' + setting.name);
    const article = document.createElement('article');
    article.innerHTML = textFieldHtml(setting);
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
    sendCommand('saveSetting', setting);
    if (isBrowserSetting(setting)) {
        browserSettings[setting.name](setting);
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
function receiveSettings(data: unknown) {
    const allSettings = data as Setting[];
    const section = document.getElementById('settingsSection');
    for (const setting of allSettings) {
        if (HTMLSetting.has(setting.name)) {
            updateSetting(setting);
        } else {
            addSetting(setting, section);
        }
        if (isBrowserSetting(setting)) {
            browserSettings[setting.name](setting);
        }
    }
}
