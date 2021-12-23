import AppChild from "./AppChild";

export default abstract class extends AppChild {
  assertEquals(value, equals, message?: string) {
    let styleDefault = 'border-radius:10rem;';
    message = message || equals;

    if (value !== equals) {
      console.log(
        '%c Fail ',
        `background: #FFCCCC; color: #880000; ${styleDefault}`,
        `Assertion failed : ${value} is not equal to ${equals}. ${message}`
      );
    } else {
      console.log(
        '%c Success ',
        `background: #00FF00; color: #002200; ${styleDefault}`,
        message
      );
    }
  }

  assertTrue(value, message?: string) {
    this.assertEquals(value, true, message);
  }

  assertFalse(value, message?: string) {
    this.assertEquals(value, false, message);
  }

  public abstract getTestMethods();
}
