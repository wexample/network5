import UnitTest from "../../../../src/Wex/BaseBundle/Resources/js/class/Tests/UnitTest";

export default {
    classContext: 'page',

    init() {
        this.unitTest = new UnitTest();
        this.test();
    },

    onChangeResponsiveSize(current: string, previous?: string) {
        this.unitTest.assertTrue(typeof current === 'string', 'Responsive size is valid');

        document
            .querySelectorAll('.display-breakpoint')
            .forEach((el) => el.classList.remove('display-breakpoint-current'));

        document
            .querySelector(`.display-breakpoint-${current}`)
            .classList
            .add('display-breakpoint-current');
    },

    test() {
        let test = this.unitTest;
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
            test.assertTrue(queue.commands.length === 0, 'Queue commands list is empty');
            test.assertTrue(queue.callbacks.length === 0, 'Queue callbacks is empty');

            counter++;
        });

        queue.start();

        let queue2 = queuesMixin.create('test-queue');

        queue2.add(() => {
            test.assertTrue(true, 'Queue 2 is running...');
            counter++;
        });

        queue2.start();

        queuesMixin.afterAllQueues(
            [queue, queue2],
            () => {
                test.assertTrue(
                    !queue.started && !queue.started,
                    'All queues are complete'
                );
                counter++;

                queuesMixin.afterAllQueues(
                    [queue, queue2],
                    () => {
                        test.assertTrue(
                            !queue.started && !queue.started,
                            'If already complete, callback is executed immediately.'
                        );
                        counter++;

                        queue.then(() => {
                            test.assertTrue(
                                !queue.started && !queue.started,
                                'All new callbacks are executed'
                            );
                            counter++;
                        })
                    });
            });

        setTimeout(() => {

            test.assertEquals(
                counter,
                7,
                'All callbacks are executed after 1 second'
            );
        }, 1000);
    }
};
