import Page from './Page';

export default class TestManagerPage extends Page {
  async runTests(tests) {
    let testDefinition: any;
    let method: Function;

    for (testDefinition of Object.values(tests)) {
      let test = new testDefinition(this.app);

      for (method of test.getTestMethods()) {
        await method.apply(test);
      }
    }
  }
}
