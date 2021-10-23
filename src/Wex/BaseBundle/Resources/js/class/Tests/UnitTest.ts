export default class {
    assertEquals(value, equals, message) {
        if (value !== equals) {
            console.log(message);
            console.error(`Assertion failed : ${value} is not equal to ${equals}.`);
        }
    }

    assertTrue(value, message) {
        this.assertEquals(value, true, message);
    }
}