import MixinArrays from "./Arrays";
import Queue from "../class/Queue";
import MixinInterface from "../interface/MixinInterface";
import AppService from "../class/AppService";

const mixin: MixinInterface = {
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

    service: class extends AppService {
        queues: object = {}

        afterAllQueues(queues, complete) {
            let arraysService = this.app.getService('arrays');
            let originalList = arraysService.shallowCopy(queues);
            let hasRunningQueue = false;

            queues.forEach((queue) => {
                if (queue.started) {
                    hasRunningQueue = true;
                    queue.then(() => {
                        arraysService.deleteItem(queues, queue);
                        if (!queues.length) {
                            queue.then(() => {
                                complete(originalList);
                            });
                        }
                    });
                }
            });

            if (!hasRunningQueue) {
                this.app.async(() => complete(originalList));
            }
        }

        create(queueName) {
            return this.get(queueName)
                || new Queue(this.app, queueName);
        }

        get(queueName): Queue {
            return this.queues[queueName];
        }

        start(queueName) {
            let queue = this.get(queueName);
            queue && queue.start();

            return queue;
        }
    }
};

export default mixin;