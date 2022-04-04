import AppChild from './AppChild';
import { convertToHexRgba } from "../helpers/CssHelper";

export default abstract class extends AppChild {
  protected assertEquals(
    value: any,
    expected: any,
    message?: string,
    fatal: boolean = true
  ) {
    let styleDefault = 'border-radius:10rem;';
    message = message || expected;

    if (value !== expected) {
      console.log(
        '%c Fail ',
        `background: #FFCCCC; color: #880000; ${styleDefault}`,
        `Assertion failed, ${value} is not equal to expected value : ${expected}. ${message}`
      );

      if (fatal) {
        throw new Error('UNIT TEST ERROR');
      }
    } else {
      console.log(
        '%c Success ',
        `background: #00FF00; color: #002200; ${styleDefault}`,
        message
      );
    }
  }

  protected assertTrue(value, message?: string) {
    this.assertEquals(value, true, message);
  }

  protected assertFalse(value, message?: string) {
    this.assertEquals(value, false, message);
  }

  protected assertCssStyleHasColor(
    el: HTMLElement,
    propertyName: string,
    colorNameOrHex: string,
    name: string
  ) {
    this.assertEquals(
      this.getComputedProperty(
        el,
        propertyName
      ),
      convertToHexRgba(
        colorNameOrHex
      ),
      name + ` has color of type ${colorNameOrHex}`
    )
  }

  getComputedProperty(
    el: HTMLElement,
    propertyName: string
  ): string {
    return getComputedStyle(el)[propertyName];
  }

  public init() {
    // To override.
  }

  public abstract getTestMethods();
}
