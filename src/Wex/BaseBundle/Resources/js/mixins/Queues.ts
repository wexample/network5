import MixinArrays from "./Arrays";
import Queue from "../class/Queue";
import MixinInterface from "../interface/MixinInterface";
import MixinsAppService from "../class/MixinsAppService";

const mixin: MixinInterface = {
    name: 'queues',

    dependencies: {
        MixinArrays,
    },

    hooks: {
        app: {
            loadRenderData(data, registry) {
                if (registry.MixinArrays === MixinsAppService.LOAD_STATUS_COMPLETE) {
                    return MixinsAppService.LOAD_STATUS_COMPLETE;
                }
                return MixinsAppService.LOAD_STATUS_WAIT;
            },
        },
    },

    service: class extends MixinsAppService {
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