const siphash = require('siphash');

class OPAYGOShared {
  static MAX_BASE = 999
  static MAX_ACTIVATION_VALUE = 995
  static PAYG_DISABLE_VALUE = 998
  static COUNTER_SYNC_VALUE = 999
  static TOKEN_VALUE_OFFSET = 1000
  static TOKEN_TYPE_SET_TIME = 1
  static TOKEN_TYPE_ADD_TIME = 2

  static getTokenBase(code) {
    return Number(code) % this.TOKEN_VALUE_OFFSET; 
  }

  static putBaseInToken(token, tokenBase) {
    if (tokenBase > this.MAX_BASE) {
      throw Error('INVALID VALUE');
    }

    return token - this.getTokenBase(token) + tokenBase;
  }

  static generateNextToken(lastCode, key) {
    // TODO: do the right thing
  }

  static #convertHashToToken() {
    // TODO: do the right thing
  }

  static #convertTo295bits(source) {
    const mask = ((1 << (32 - 2 + 1)) - 1) << 2;
    let temp = (source & mask) >> 2

    if (temp > 999999999) {
      temp = temp - 73741825;
    }

    return temp;
  } 

  static convertTo4DigitToken(source) {
    let restrictedDigitToken = '';
    const bitArray = this.#bitArrayFromInt(source, 30);

    for (let i = 0; i < 15; i++) {
      const idx = i * 2;
      const thisArray = bitArray.slice(idx, idx + 2);

      restrictedDigitToken += String(this.#bitArrayToInt(thisArray) + 1);
    }

    return restrictedDigitToken;
  }

  static convertFrom4DigitToken(source) {
    let bitArray = [];

    for (const charDigit of String(source)) {
      const digit = Number(charDigit) - 1;
      const thisArray = this.#bitArrayFromInt(digit, 2);
      bitArray.concat(thisArray);
    }

    return this.#bitArrayToInt(bitArray);
  }

  static #bitArrayToInt(bitArray) {
    let i = 0;
    for (const bit of bitArray) {
      i = (i << 1) | bit;
    }

    return i;
  }

  static #bitArrayFromInt(source, bits) {
    let bitArray = [];

    for (let i = 0; i < bits.length; i++) {
      bitArray.push(Boolean(source & (1 << (bits - 1 - i))));
    }

    return bitArray;
  }
}
