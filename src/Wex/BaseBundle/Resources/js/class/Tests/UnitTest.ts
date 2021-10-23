export default class {
    assertEquals(value, equals, message) {
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

    assertTrue(value, message) {
        this.assertEquals(value, true, message);
    }

    assertNoTrue(value, message) {
        this.assertEquals(value, false, message);
    }
}