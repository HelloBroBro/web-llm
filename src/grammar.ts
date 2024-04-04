import * as tvmjs from "tvmjs";

export type BNFGrammar = tvmjs.TVMObject;
export type GrammarStateMatcher = tvmjs.TVMObject;

/**
 * A factory class for generating and calling GrammarStateMatcher (GrammarSM) and BNFGrammar related
 * methods, essentially a wrapper of related global functions in the tvm instance's wasm.
 * 
 * We implement a factory class rather than having classes of GrammarStateMatcher and BNFGrammar
 * because factory class allows us to only get/dispose PackedFunc once -- especially when we need
 * multiple instances of BNFGrammar or GrammarStateMatcher.
 */
export class GrammarFactory {
  private fBNFGrammarGetGrammarOfJSON: tvmjs.PackedFunc;
  private fGrammarSMFromTokenTable: tvmjs.PackedFunc;
  private fGrammarSMAcceptToken: tvmjs.PackedFunc;
  private fGrammarSMFindNextTokenBitmaskAsNDArray: tvmjs.PackedFunc;
  private fGrammarSMIsTerminated: tvmjs.PackedFunc;
  private fGrammarSMResetState: tvmjs.PackedFunc;

  /**
   * Extract TVM global functions from tvm runtime instance.
   * 
   * @param tvm An instantiated tvm runtime instance.
   */
  constructor(tvm: tvmjs.Instance) {
    tvm.beginScope();
    // Get global functions.
    this.fBNFGrammarGetGrammarOfJSON = tvm.detachFromCurrentScope(
      tvm.getGlobalFunc("mlc.serve.BNFGrammarGetGrammarOfJSON")
    );
    this.fGrammarSMFromTokenTable = tvm.detachFromCurrentScope(
      tvm.getGlobalFunc("mlc.serve.GrammarStateMatcherFromTokenTable")
    );
    this.fGrammarSMAcceptToken = tvm.detachFromCurrentScope(
      tvm.getGlobalFunc("mlc.serve.GrammarStateMatcherAcceptToken")
    );
    this.fGrammarSMFindNextTokenBitmaskAsNDArray = tvm.detachFromCurrentScope(
      tvm.getGlobalFunc("mlc.serve.GrammarStateMatcherFindNextTokenBitmaskAsNDArray")
    );
    this.fGrammarSMIsTerminated = tvm.detachFromCurrentScope(
      tvm.getGlobalFunc("mlc.serve.GrammarStateMatcherIsTerminated")
    );
    this.fGrammarSMResetState = tvm.detachFromCurrentScope(
      tvm.getGlobalFunc("mlc.serve.GrammarStateMatcherResetState")
    );
    tvm.endScope();
  }

  /**
   * @returns BNFGrammar of JSON.
   * @note Caller needs to handle disposal of returned object.
   */
  getBNFGrammarOfJSON(): BNFGrammar {
    return this.fBNFGrammarGetGrammarOfJSON() as BNFGrammar;
  }

  /**
   * Creates a Grammar State Matcher from a specified BNFGrammar rule and a token table.
   * 
   * @param grammar A BNFGrammar used to specify the rule for the state matcher.
   * @param tokenTable A list of all tokens in the tokenizer in the order of their ids.
   * @param maxRollbackSteps Max rollback steps to support. Currently not supported, has to be zero.
   * @returns A Grammar state matcher
   * @note Caller needs to handle disposal of returned object.
   */
  getGrammarStateMatcherFromTokenTable(
    grammar: BNFGrammar,
    tokenTable: string[],
    maxRollbackSteps = 0,
  ): GrammarStateMatcher {
    if (maxRollbackSteps !== 0) {
      throw Error("maxRollbackSteps has to be zero as rollback is not supported yet.")
    }
    return this.fGrammarSMFromTokenTable(
      grammar, ...tokenTable, new tvmjs.Scalar(maxRollbackSteps, "int32")) as GrammarStateMatcher;
  }

  /**
   * Accept a new token to the gramamr state matcher, updating its internal state.
   * 
   * @param grammarStateMatcher The grammar state matcher that will accept a new token and update
   * its stsate correspondingly.
   * @param tokenID The token to be accepted in its ID.
   * @returns Whether the token is accepted.
   */
  acceptToken(
    grammarStateMatcher: GrammarStateMatcher,
    tokenID: number
  ): boolean {
    let accepted = false;
    try {
      accepted = this.fGrammarSMAcceptToken(grammarStateMatcher, new tvmjs.Scalar(tokenID, "int32"));
    } catch (error) {
      throw Error("Ecnoutered error when accepting token " + tokenID + ": " + error);
    }
    return accepted;
  }

  /**
   * Returns a bitmask in the form of an NDArray of shape (max_num_token, ceildiv(vocab_size, 32))
   * based on what tokens can/cannot be accepted by the current state of the grammar state matcher.
   * 
   * @param grammarStateMatcher The grammar state matcher that will produce the bit mask.
   * @returns A bitmask in the form of an NDArray.
   */
  findNextTokenBitmask(grammarStateMatcher: GrammarStateMatcher): tvmjs.TVMObject {
    return this.fGrammarSMFindNextTokenBitmaskAsNDArray(grammarStateMatcher);
  }

  /**
   * @returns Whether the grammar state matcher has reached the end and hence terminated.
   */
  isTerminated(grammarStateMatcher: GrammarStateMatcher): boolean {
    return this.fGrammarSMIsTerminated(grammarStateMatcher);
  }

  /**
   * Reset the state of matcher to the initial state.
   */
  resetState(grammarStateMatcher: GrammarStateMatcher): void {
    this.fGrammarSMResetState(grammarStateMatcher);
  }

  /**
   * Dispose all tvmjs.PackedFunc this factory is initialized with.
   */
  dispose() {
    this.fBNFGrammarGetGrammarOfJSON.dispose();
    this.fGrammarSMFromTokenTable.dispose();
    this.fGrammarSMAcceptToken.dispose();
    this.fGrammarSMFindNextTokenBitmaskAsNDArray.dispose();
    this.fGrammarSMIsTerminated.dispose();
    this.fGrammarSMResetState.dispose();
  }
}
