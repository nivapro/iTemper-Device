import bleno from 'bleno';
import * as util from 'util';
import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';

// Copied from bleno because it was not exported
type Property = 'read' | 'write' | 'indicate' | 'notify' | 'writeWithoutResponse';

// Responses on read and write requests
export interface ReadResponse {
    result: number;
    data?: any;
}
export interface WriteResponse {
    result: number;
}
export abstract class BaseCharacteristic<T extends object> extends bleno.Characteristic {
  private result: Buffer;

  constructor(UUID: string, private descriptorValue: string, properties: ReadonlyArray<Property>) {

    super({
      uuid: UUID,
      properties,
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: descriptorValue,
      })],
    });
  }

  abstract handleReadRequest(): Promise<T>;

  onReadRequest(offset: number, callback: (result: number, data?: Buffer) => void) {
    const m = 'base-characteristic.onReadRequest ('+ this.descriptorValue + '): ';
    if (offset === 0) {
        this.handleReadRequest()
        .then((response) =>  {
          if (response) {
            this.result = Buffer.from(stringify(response));
            callback(this.RESULT_SUCCESS, this.result);
          } else {
            callback(this.RESULT_SUCCESS);
          }
        })
        .catch(() => {
          log.error(m + 'RESULT_UNLIKELY_ERROR, offset' + offset + ', result.length=' + this.result.length);
          callback(this.RESULT_UNLIKELY_ERROR);
        });
    }  else if ( this.result && offset  < this.result.length) {
      callback(this.RESULT_SUCCESS, this.result.slice(offset));
    } else {
      log.error(m + 'RESULT_INVALID_OFFSET, offset' + offset + ', result.length=' + this.result.length);
      callback(this.RESULT_INVALID_OFFSET);
    }
  }
  async abstract handleWriteRequest(raw: unknown): Promise<boolean>;

  onWriteRequest(data: Buffer, offset: number, withoutResponse: boolean, callback: (result: number) => void): void {
    const m = 'base-characteristic.onWriteRequest ('+ this.descriptorValue + '): ';
    log.debug(m + 'offset=' + offset);
    log.debug(m + 'withoutResponse=' + withoutResponse);
    log.debug(m + 'data=' + decode(data));

    if (offset) {
      log.error(m + 'RESULT_ATTR_NOT_LONG, offset' + offset);
      callback(this.RESULT_ATTR_NOT_LONG);
    } else {
      try {
        const raw = JSON.parse(decode(data));
        this.handleWriteRequest(raw);
        log.info(m + 'RESULT_SUCCESS');
        callback(this.RESULT_SUCCESS);
      } catch {
        log.error(m + 'RESULT_UNLIKELY_ERROR: Cannot parse BLE write request data.');
        callback(this.RESULT_UNLIKELY_ERROR);
      }
    }
  }
}

// helper function to decode message sent from peripheral
export function decode(buf: Buffer): string {
  const dec = new util.TextDecoder('utf-8');
  return dec.decode(buf);
}
export function encode(value: string ): BufferSource {
  const enc = new util.TextEncoder();
  return enc.encode(value);
}
