/** A class representation of the Link type. */
export class Link extends String {
  /**
   * Create a string instance
   * @param {(string)} text Can be a long string.
   */
  constructor(value?: string) {
    super(value);
    this.text = value ? value : '';
  }
  /** this string instance */
  protected text: string;
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
    return encodeURIComponent(this.text);
  }

  /**
   * Return the string representation
   * @return {string} return the string representation.
   */
  public toString(): string {
    return super.toString();
  }
}
