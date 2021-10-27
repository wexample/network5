import UnitTest from "../../../../src/Wex/BaseBundle/Resources/js/class/Tests/UnitTest";

export default {
    classContext: 'page',

    init() {
        this.unitTest = new UnitTest();
        
        this.testLoading();
    },

    testLoading() {
        let test = this.unitTest;
        let queuesMixin = this.app.queues;
        let queue = queuesMixin.create('test-loading');
        let counter = 0;

        queue.add(() => {
            // TODO
            test.assertTrue(true, 'TODO...');
            counter++;
        });
    }
};
