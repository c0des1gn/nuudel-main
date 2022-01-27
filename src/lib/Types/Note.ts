/** A class representation of the Note type. */
export class Note extends String {
  /**
   * Create a string instance
   * @param {(string)} text Can be a long string.
   */
  constructor(value?: any) {
    super(value);
    this.text = value;
  }
  /** this string instance */
  protected text: any;
  /**
   * Checks if a value is a valid string
   * @param {(string)} text Can be a string.
   * @return {boolean} return true if the value is a valid string, return false otherwise.
   */
  public static isValid(text: any): boolean {
    return typeof text === 'string' || text instanceof String;
  }
  /**
   * Compares the equality of this string with `otherID`.
   * @param {string} otherText string instance to compare against.
   * @return {boolean} the result of comparing two string's
   */
  public equals(otherText: string): boolean {
    return otherText === this.toString();
  }
  /**
   * serialize string with encode.
   * @return {string} the result of comparing two string's
   */
  public serialize(): string {
    // Serialize string, boolean and number values to a string, but do not
    // attempt to coerce object, function, symbol, or other types as strings.
    if (typeof this.text === 'string') {
      return this.text;
    }
    if (typeof this.text === 'boolean') {
      return this.text ? 'true' : 'false';
    }
    return this.toString();
  }

  /**
   * Return the string representation
   * @return {string} return the string representation.
   */
  public toString(): string {
    return super.toString();
  }
}
