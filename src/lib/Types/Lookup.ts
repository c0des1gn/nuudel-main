/** A class representation of the Lookup type. */
export class Lookup extends String {
  /**
   * Create a string instance
   * @param {(string)} data Can be a long string.
   */
  constructor(value?: any) {
    super(value);
    /*
    if (typeof value === 'string') {
      this.data = value;
    } else if (value instanceof String) {
      this.data = value.toString();
    } else if (typeof value.isArray !== 'undefined' || value instanceof Array) {
      this.data = value
        .map(v => v?.toString())
        .fiter(Boolean)
        .join(',');
    } else {
      this.data = ''; //[];
    } // */
  }
  /** this string instance */
  //protected data: string | string[];
  /**
   * Checks if a value is a valid string
   * @param {(string)} text Can be a string.
   * @return {boolean} return true if the value is a valid string, return false otherwise.
   */
  static isValid(data: any): boolean {
    return typeof data === 'string' || data instanceof String
      ? true
      : data instanceof Array || typeof data.isArray !== 'undefined';
  }
  /**
   * Compares the equality of this string with `otherID`.
   * @param {string} otherText string instance to compare against.
   * @return {boolean} the result of comparing two string's
   */
  equals(otherText: string[] | string): boolean {
    return typeof otherText === 'string'
      ? otherText === super.toString()
      : this.arraysEqual(otherText, super.toString());
  }

  /*
   * Array-aware equality checker:
   * Returns whether arguments a and b are == to each other;
   * however if they are equal-lengthed arrays, returns whether their
   * elements are pairwise == to each other recursively under this
   * definition.
   */
  private arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * serialize string with encode.
   * @return {string} the result of comparing two string's
   */
  serialize(): string {
    // Serialize string, boolean and number values to a string, but do not
    // attempt to coerce object, function, symbol, or other types as strings.
    /*
    if (typeof this.data === 'string') {
      return this.data;
    } else if (this.data instanceof String) {
      return this.data.toString();
    } else if (this.data instanceof Array) {
      return this.data.join(',');
    } // */

    return super.toString();
  }

  /**
   * Return the string representation
   * @return {string} return the string representation.
   */
  toString(): string {
    return super.toString();
    /*
    return this.data instanceof String
      ? this.data.toString()
      : this.data instanceof Array
      ? this.data.join(',')
      : this.data.toString(); // */
  }
}
