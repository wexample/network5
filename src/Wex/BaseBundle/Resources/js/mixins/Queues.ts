import MixinArrays from "./Arrays";
import Queue from "../class/Queue";
import MixinInterface from "../interface/MixinInterface";

const mixin:MixinInterface = {
    name: 'queues',

    dependencies: {
        MixinArrays,
    },

    hooks: {
        app: {
            loadRenderData(data, registry) {
                if (registry.MixinArrays === 'complete') {
                    return 'complete';
                }
                return 'wait';
            },
        },
    },

    methods: {
        app: {
            queues: {},

            afterAllQueues(queues, complete) {
                let originalList = this.getMixin('arrays').shallowCopy(queues);
                let hasRunningQueue = false;

                queues.forEach((queue) => {
                    if (queue.started) {
                        hasRunningQueue = true;
                        queue.then(() => {
                            this.arrays.deleteItem(queues, queue);
                            if (!queues.length) {
                                queue.then(() => {
                                    complete(originalList);
                                });
                            }
                        });
                    }
                });

                if (!hasRunningQueue) {
                    complete(originalList);
                }
            },

            create(queueName) {
                return this.queues.get(queueName)
                    || new Queue(this, queueName);
            },

            get(queueName) {
                return this.queues.queues[queueName];
            },

            start(queueName) {
                let queue = this.queues.get(queueName);
                queue && queue.start();

                return queue;
            },
        },
    },
};

export default mixin;