const siphash = require('siphash');

module.exports = class OPAYGOSharedExtended {
  static MAX_BASE = 999999
  static MAX_ACTIVATION_VALUE = 999999
  static TOKEN_VALUE_OFFSET_EXTENDED = 1000000

  static getTokenBase(code) {
    return Number(code) % this.TOKEN_VALUE_OFFSET_EXTENDED;
  }

  static putBaseInToken(token, tokenBase) {
    if (tokenBase > this.MAX_BASE) {
      throw Error('INVALID VALUE');
    }

    return token - this.getTokenBase(token) + tokenBase;
  }

  static generateNextToken(lastCode, key) {
    // TODO: learn how siphash works and really understand the token
  }

  static #convertHashToToken(hash) {
  }

  static #convertTo40Bits(source) {
    const mask = ((1 << (64 - 24 + 1)) - 1) << 24;
    let temp = (source & mask) >> 24;

    if (temp > 999999999999) {
      temp = temp - 99511627777;
    }

    return temp;
  }

  static convertTo4DigitToken(source) {
    let restrictedDigitToken = '';
    const bitArray = this.#bitArrayFromInt(source, 40);

    for (let i = 0 ; i < 20; i++) {
      const idx = i * 2;
      const thisArray = bitArray.slice(idx, idx + 2);
      restrictedDigitToken += String(this.#bitArrayToInt(thisArray) + 1);
    }

    return Number(restrictedDigitToken);
  }

  static convertFrom4DigitToken(source) {
    let bitArray = [];
    for (const charDigit of String(source)) {
      const digit = Number(charDigit) - 1;
      const arr = this.#bitArrayFromInt(digit, 2)
      bitArray.concat(arr);
    }

    return this.#bitArrayToInt(bitArray);
  }

  static #bitArrayToInt(bitArray) {
    let i = 0;
    for (const bit of bitArray) {
      i = (i << 1) | bit
    }
    return i;
  }

  static #bitArrayFromInt(source, numBits) {
    let bitArray = [];

    for (let i = 0; i < numBits; i++) {
      bitArray.push(Boolean(source & (1 << (bits - 1 - i))));
    }

    return bitArray;
  }
}
