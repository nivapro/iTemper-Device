import * as util from 'util';
import { log } from './logger';
export function stringify(value: any, spacer?: string|number ) {
    const cache: object[] = [];

    const replacer = function(key: string, value: any) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Duplicate reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }

        if (typeof value === 'string' || typeof value === 'number') {
            log.debug(key + ',' + value);
        }
        return value;
    }
    return JSON.stringify(value, replacer, spacer);
}

// helper functions to encode/decode messages
export function decode(buf: Buffer): string {
    const decoder = new util.TextDecoder('utf-8');
    const decoded = decoder.decode(buf);
    return decoded;
  }
export function encode(value: string ): BufferSource {
    const enc = new util.TextEncoder();
    return enc.encode(value);
}
