export default class {
    assertEquals(value, equals, message?: string) {
        let styleDefault = 'border-radius:10rem;'
        if (value !== equals) {
            console.log(
                '%c Fail ', `background: #FFCCCC; color: #880000; ${styleDefault}`,
                `Assertion failed : ${value} is not equal to ${equals}.`
            );
        } else {
            console.log(
                '%c Success ', `background: #00FF00; color: #002200; ${styleDefault}`,
                message || equals
            );
        }
    }

    assertTrue(value, message?: string) {
        this.assertEquals(value, true, message);
    }

    assertNoTrue(value, message?: string) {
        this.assertEquals(value, false, message);
    }
}