/** A class representation of the Image type. */
export class Image {
  /**
   * Create a string instance
   * @param {(string)} img Can be a long string.
   */
  constructor(value?: any) {
    //super(value);
    if (typeof value === 'string' || value instanceof String) {
      try {
        value = JSON.parse(value.toString());
      } catch {}
    }

    if (typeof value === 'object') {
      this.uri = !!value.uri ? value.uri : '';
      this.width = value?.width || undefined;
      this.height = value?.height || undefined;
    } else if (typeof value === 'string' || value instanceof String) {
      this.uri = value.toString();
    } else {
      this.uri = '';
    }
  }
  /** this string instance */
  protected uri: string = '';
  protected width: number | undefined = undefined;
  protected height: number | undefined = undefined;
  /**
   * Checks if a value is a valid string
   * @param {(string)} text Can be a string.
   * @return {boolean} return true if the value is a valid string, return false otherwise.
   */
  static isValid(img: any): boolean {
    return (
      typeof img === 'object' &&
      Object.keys(img).filter(obj => obj === 'uri').length > 0
    );
  }
  /**
   * Compares the equality of this string with `otherID`.
   * @param {string} otherText string instance to compare against.
   * @return {boolean} the result of comparing two string's
   */
  equals(otherUri: string): boolean {
    return otherUri === this.uri;
  }
  /**
   * serialize string with encode.
   * @return {string} the result of comparing two string's
   */
  serialize(): object {
    let obj: any = { uri: this.uri };
    if (!!this.width) {
      obj['width'] = this.width;
    }
    if (!!this.height) {
      obj['height'] = this.height;
    }
    return obj;
  }

  /**
   * Return the string representation
   * @return {string} return the string representation.
   */
  toString(): string {
    return JSON.stringify(this.serialize());
  }
}
