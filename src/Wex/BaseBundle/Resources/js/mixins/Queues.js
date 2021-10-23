import MixinArrays from "./Arrays";
import Queue from "../class/Queue";

export default {
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
                let originalList = this.arrays.shallowCopy(queues);

                queues.forEach((queue) => {
                    queue.then(() => {
                        this.arrays.deleteItem(queues, queue);
                        if (!queues.length) {
                            complete(originalList);
                        }
                    });
                });
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
