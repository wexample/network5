import Queue from "../class/Queue";
import MixinInterface from "../interface/MixinInterface";
import MixinsAppService from "../class/MixinsAppService";

import {deleteItem as ArrayDeleteItem} from "../helper/Arrays";
import {shallowCopy as ArrayShallowCopy} from "../helper/Arrays";

const mixin: MixinInterface = {
    name: 'queues',

    service: class extends MixinsAppService {
        queues: object = {}

        afterAllQueues(queues, complete) {
            let originalList = ArrayShallowCopy(queues);
            let hasRunningQueue = false;

            queues.forEach((queue) => {
                if (queue.started) {
                    hasRunningQueue = true;
                    queue.then(() => {
                        ArrayDeleteItem(queues, queue);
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
    }
};

export default mixin;