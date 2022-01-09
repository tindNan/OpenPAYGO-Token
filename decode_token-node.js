const Shared = require('./shared-node');
const SharedExtended = require('./shared_extended-node');

module.exports = class OPAYGODecoder {
  MAX_TOKEN_JUMP = 64;
  MAX_TOKEN_JUMP_COUNTER_SYNC = 100;
  MAX_UNUSED_OLDER_TOKENS = 8 * 2;

  getActivationValueCountAndTypeFromToken({
    token,
    startingCode,
    key,
    lastCount,
    restrictedDigitSet = false,
    usedCounts = null,
  }) {
    let convertedToken = token; 
    if (restrictedDigitSet) {
      convertedToken = Shared.convertFrom4DigitToken(token);
    }

    let validOlderToken = false;
    const tokenBase = Shared.getTokenBase(convertedToken); // we get the base of the token
    const currentCode = Shared.putBaseInToken(startingCode, tokenBase); // we put it into the starting code
    const startingCodeBase = Shared.getTokenBase(startingCode);
    const value = this.#decodeBase(startingCodeBase, tokenBase);
    /*
     * If there is a match we get the value from the toekn
     * We try all combination up until lastCounter + TOKEN_JUMP, or to the larger jump if syncing counter
     * We could start directly the loop at the last count if we kept the token value for the last count
     */
    const maxCountTry = value === Shared.COUNTER_SYNC_VALUE 
      ? lastCount + this.MAX_TOKEN_JUMP_COUNTER_SYNC + 1
      : lastCount + this.MAX_TOKEN_JUMP + 1;

    for (let count = 0; count < maxCountTry; count++) {
      const maskedToken = Shared.putBaseInToken(currentCode, tokenBase);

      const type = count % 2
        ? Shared.TOKEN_TYPE_SET_TIME
        : Shared.TOKEN_TYPE_ADD_TIME; 

      if (maskedToken === token) {
        if (this.#countIsValid(count, lastCount, value, type, usedCounts)) {
          return { value, count, type };
        } else {
          validOlderToken = true;
        }
      }

      currentCode = Shared.generateNextToken(currentCode, key) // If not we go to the next token
    }

    if (validOlderToken) {
      return { value: -2, count: null, type: null };
    }

    return { value: null, count: null, type: null };
  }

  #countIsValid({
    count,
    lastCount,
    value,
    type,
    usedCounts,
  }) {
    if (value === Shared.COUNTER_SYNC_VALUE) {
      if (count > (lastCount - 30)) {
        return true;
      }
    } else if (count > lastCount) {
      return true;
    } else if (this.MAX_UNUSED_OLDER_TOKENS > 0) {
      if (count > (lastCount - this.MAX_UNUSED_OLDER_TOKENS)) {
        if (!usedCounts.includes(count) && type === Shared.TOKEN_TYPE_ADD_TIME) {
          return true;
        }
      }
    }

    return false;
  }

  updateUsedCounts({
    pastUsedCounts,
    value,
    newCount,
    type
  }) {
    let highestCount = pastUsedCounts ? Math.max(...pastUsedCounts) : 0;

    if (newCount > highestCount) {
      highestCount = newCount;
    }

    bottomRange = highestCount - this.MAX_UNUSED_OLDER_TOKENS;

    let usedCounts = [];

    if (
      type !== Shared.TOKEN_TYPE_ADD_TIME
      || Shared.COUNTER_SYNC_VALUE
      || value === Shared.PAYG_DISABLE_VALUE
    ) {
      // if it is not an Add-Time token, we mark all the past tokens as used in the range
      for (let count = bottomRange; count < highestCount + 1; count++) {
        usedCounts.push(count);
      }
    } else {
      // if it is an Add-Time token, we just mark the tokens actually used in the range
      for (let count = bottomRange; count < highestCount + 1; count ++) {
        if (count === newCount || pastUsedCounts.includes(count)) {
          usedCounts.push(count);
        }
      }
    }

    return usedCounts;
  }

  #decodeBase(startingCodeBase, tokenBase) {
    const decodedValue = tokenBase - startingCodeBase;

    return decodedValue < 0 ? decodedValue + 1000 : decodedValue;
  }

  getActivationValueCountFromExtendedToken({
    token,
    startingCode,
    key,
    lastCount,
    restrictedDigitSet = false,
  }) {
    let convertedToken = token;
    if (restrictedDigitSet) {
      convertedToken = SharedExtended.convertFrom4DigitToken(convertedToken);
    }

    const tokenBase = SharedExtended.getTokenBase(convertedToken); // we get the base of the token
    
    let currentCode = SharedExtended.putBaseInToken(startingCode, tokenBase); // we put it into the starting code
    const startingCodeBase = SharedExtended.getTokenBase(startingCode);
    const value = this.#decodeBaseExtended(startingCodeBase, tokenBase);

    for (let count = 0; count < 30; count++) {
      const maskedToken = SharedExtended.putBaseInToken(currentCode, tokenBase);

      if (maskedToken === token && count > lastCount) {
        const cleanCount = count - 1;
        // review this
        return { value, count: cleanCount };
      }

      currentCode = SharedExtended.generateNextToken(currentCode, key); // if not we go to the next token
    }

    return  { value, count: null };
  }

  #decodeBaseExtended(startingCodeBase, tokenBase) {
    const decodedValue = tokenBase - startingCodeBase;

    return decodedValue < 0 ? decodedValue + 1000000 : decodedValue;
  }
}
