import Page from "../../../../src/Wex/BaseBundle/Resources/js/class/Page";
import UnitTest from "../../../../src/Wex/BaseBundle/Resources/js/class/UnitTest";
import AssetBundleInterface from "../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface";

const bundle: AssetBundleInterface = {
    bundleGroup: 'page',

    definition: class extends Page {
        unitTest: UnitTest

        init() {
            this.unitTest = new UnitTest();

            this.testQueues();
            this.testVariables();

            this.refreshLoadedAssetsList();
        }

        updateCurrentResponsiveDisplay() {
            super.updateCurrentResponsiveDisplay();

            let responsiveMixin = this.app.getService('responsive');
            let current = responsiveMixin.responsiveSizeCurrent;

            document
                .querySelectorAll('.display-breakpoint')
                .forEach((el) => el.classList.remove('display-breakpoint-current'));

            document
                .querySelector(`.display-breakpoint-${current}`)
                .classList
                .add('display-breakpoint-current');

            this.refreshLoadedAssetsList();
        }

        refreshLoadedAssetsList() {
            let list;

            list = [];
            // Base loaded assets
            document
                .querySelectorAll('link[rel=stylesheet]')
                .forEach((el) => {
                    list.push(el.getAttribute('href'));
                });

            this.refreshLoadedAssetsTypeList('css', list);

            list = [];
            // Base loaded assets
            document
                .querySelectorAll('script')
                .forEach((el) => {
                    let src = el.getAttribute('src');
                    if (src !== null) {
                        list.push(src);
                    }
                });
            this.refreshLoadedAssetsTypeList('js', list);

            this.refreshAvailableAssets('css');
            this.refreshAvailableAssets('js');
        }

        protected refreshAvailableAssets(type) {
            let layoutData = this.app.registry.layoutData;
            let list = [];

            layoutData.assets[type].map((asset) => list.push(asset.path));
            layoutData.page.assets[type].map((asset) => list.push(asset.path));

            this.refreshLoadedAssetsTypeList(`${type}-available`, list);
        }

        refreshLoadedAssetsTypeList(type: string, list: string[]) {
            let el = document.getElementById(`loaded-assets-list-${type}`);
            let output = '';

            list.forEach((item) => {
                output += `<li>${item}</li>`;
            });

            el.innerHTML = output;
        }

        testQueues() {
            let test = this.unitTest;
            let queuesMixin = this.app.getService('queues');
            let queue = queuesMixin.create('test-queue');
            let counterOne = 0;

            queue.add(() => {
                test.assertTrue(queue.started, 'Queue status is started');

                test.assertTrue(true);
                counterOne++;
            });

            queue.add(() => {
                test.assertTrue(true);
                counterOne++;
            });

            queue.then(() => {
                test.assertEquals(queue.commands.length, 0, 'Queue commands is empty');
                test.assertTrue(queue.started, 'Queue status is started');

                test.assertEquals(
                    counterOne,
                    2,
                    'All queue commands has been executed'
                );

                queue.reset();

                test.assertNoTrue(queue.started, 'Queue status is stopped');
                test.assertTrue(queue.commands.length === 0, 'Queue commands list is empty');
                test.assertTrue(queue.callbacks.length === 0, 'Queue callbacks is empty');

                counterOne++;
            });

            queue.start();

            let queue2 = queuesMixin.create('test-queue');
            let counterTwo = 0;

            queue2.add(() => {
                test.assertTrue(true, 'Queue 2 is running...');
                counterTwo++;
            });

            queue2.start();

            queuesMixin.afterAllQueues(
                [queue, queue2],
                () => {
                    test.assertTrue(
                        !queue.started && !queue.started,
                        'All queues are complete'
                    );
                    counterTwo++;

                    queuesMixin.afterAllQueues(
                        [queue, queue2],
                        () => {
                            test.assertTrue(
                                !queue.started && !queue.started,
                                'If already complete, callback is executed immediately.'
                            );
                            counterTwo++;

                            queue.then(() => {
                                test.assertTrue(
                                    !queue.started && !queue.started,
                                    'All new callbacks are executed'
                                );
                                counterTwo++;
                            })
                        });
                });

            setTimeout(() => {
                test.assertEquals(
                    counterOne + counterTwo,
                    7,
                    'All callbacks are executed after 1 second'
                );
            }, 1000);
        }

        testVariables() {
            let test = this.unitTest;

            test.assertEquals(
                this.app.layoutPage.vars.demoVariable,
                'demoVariableValue',
                'Variable has proper value'
            );

            test.assertTrue(
                typeof this.app.layoutPage.vars.demoVariableBoolean === 'boolean',
                'Variable has proper boolean value'
            );

            test.assertTrue(
                typeof this.app.layoutPage.vars.demoVariableInteger === 'number',
                'Variable int has proper number value'
            );

            test.assertTrue(
                typeof this.app.layoutPage.vars.demoVariableFloat === 'number',
                'Variable float has proper number value'
            );

            test.assertTrue(
                typeof this.app.layoutPage.vars.demoVariableObject === 'object',
                'Variable object has proper number value'
            );
        }
    }
};

export default bundle;