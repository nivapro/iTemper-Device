export class SensorData  {
    private port: number = -1;     // The sensor knows which port it is connected to.
    private value: number = 85.0;         // Temperature value in degrees celsius
    private date: number = 0;
    constructor(port: number = -1, value: number = 0.0) {
        this.port = port;
        this.value = value;
        this.date = Date.now();
    }

    public getValue(): number {
        return this.value;
    }

    public valid(): boolean {
        return this.value < 85.0;
    }

    public setValue(value: number) {
        this.value = value;
        this.date = Date.now();
    }
    public updateValue(value: number) {
        this.value = value;
    }
    public setPort(port: number) {
        this.port = port;
    }

    public getPort(): number {
        return this.port;
    }

    public timestamp(): number {
        return this.date;
    }

    public isConnected(): boolean {
        return this.port >= 0;
    }

}
