import UnitTest from "../../../../src/Wex/BaseBundle/Resources/js/class/Tests/UnitTest";

// TODO Temp
(() => {
    setTimeout(() => {
        function testQueue1() {
            let test = new UnitTest();
            let queuesMixin = window['app'].queues;
            let queue = queuesMixin.create('test-queue');
            let counter = 0;

            queue.add(() => {
                test.assertTrue(queue.started, 'Queue status is started');

                test.assertTrue(true);
                counter++;
            });

            queue.add(() => {
                test.assertTrue(true);
                counter++;
            });

            queue.then(() => {
                test.assertEquals(queue.commands.length, 0, 'Queue commands is empty');
                test.assertTrue(queue.started, 'Queue status is started');

                test.assertEquals(
                    counter,
                    2,
                    'All queue commands has been executed'
                );

                queue.die();

                test.assertNoTrue(queue.started, 'Queue status is stopped');
            });

            queue.start();

            let queue2 = queuesMixin.create('test-queue');

            queue2.add(() => {
                test.assertTrue(true, 'Queue 2 is running...');
            });

            queue2.start();

            queuesMixin.afterAllQueues(
                [queue, queue2],
                () => {
                    test.assertTrue(
                        !queue.started && !queue.started,
                        'All queues are complete'
                    )

                    queuesMixin.afterAllQueues(
                        [queue, queue2],
                        () => {
                            test.assertTrue(
                                !queue.started && !queue.started,
                                'If already complete, callback is executed immediately.'
                            )
                        }
                    );
                }
            );
        }

        testQueue1();
    }, 200);
})();

export default {
    classContext: 'page',

    init() {

    }
};
