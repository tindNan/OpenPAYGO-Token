const shared = require('./shared-node');
const sharedExtended = require('./shared_extended-node');

module.exports = class OPAYGOEncoder {
  static generateStandardToken({
    startingCode,
    key,
    value,
    count,
    mode = shared.TOKEN_TYPE_SET_TIME,
    restrictedDigitSet,
  }) {
    // get the first 3 digits with encoded value
    const startingCodeBase = shared.getTokenBase(startingCode);
    const tokenBase = this.#encodeBase(startingCodeBase, value); 
    let currentToken = shared.putBaseInToken(startingCode, tokenBase);
    const currentCountOdd = count % 2;

    let newCount;
    if (mode === shared.TOKEN_TYPE_SET_TIME) {
      if (currentCountOdd) { // odd numbers are for Set Time
        newCount = count + 2; 
      } else  {
        newCount = count + 1;
      }
    } else {
      if (currentCountOdd) {
        newCount = count + 1;
      } else {
        newCount = count + 2;
      }
    }

    for (let xn = 0; xn < newCount; xn++) {
      currentToken = shared.generateNextToken(currentToken, key);
    }

    let finalToken = shared.putBaseInToken(currentToken, tokenBase);

    if (restrictedDigitSet) {
      finalToken = shared.convertTo4DigitToken(finalToken);
      // TODO: PLEASE CONFIRM WHATS HAPPENING HERE
    } else {
      // TODO: PLEASE CONFRIM WHATS HAPPENING HERE
    }

    return { newCount, finalToken };
  }

  static #encodeBase(base, number) {
    if ((number + base) > 999) {
      return number + base - 1000;
    } else {
      return number + base;
    }
  }

  static generateExtendedToken({
    startingCode,
    key,
    value,
    count,
    restrictedDigitSet = false,
  }) {
    const startingCodeBase = sharedExtended.getTokenBase(startingCode);
    const tokenBase = this.#encodeBaseTokenExtended(startingCodeBase, value);
    let currentToken = sharedExtended.putBaseInToken(startingCode, value);

    const newCount = count + 1;

    for (let xn = 0; xn < newCount; xn ++) {
      currentToken = sharedExtended.generateNextToken(currentToken, key);
    }

    let finalToken = sharedExtended.putBaseInToken(currentToken, tokenBase);
    if (restrictedDigitSet) {
      finalToken = sharedExtended.convertTo4DigitToken(finalToken);
      // TODO: COMPARE WITH PYTHON IMPLEMENTATION
    } else {
      // TODO: COMPARE WITH PYTHON IMPLEMENTATION
    }

    return { newCount, finalToken };
  }

  static #encodeBaseTokenExtended(base ,number) {
    if ((number + base) > 999999) {
      return number + base - 1000000;
    } else {
      return number + base;
    }
  }
}
