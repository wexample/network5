import Page from "./Page";

export default class TestManagerPage extends Page {
  runTests(tests) {
    Object.values(tests).forEach((testDefinition: any) => {
      let test = new testDefinition(this.app);

      test.getTestMethods().forEach((method) => {
        method.apply(test);
      })
    });
  }
};
