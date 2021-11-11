import Queue from '../class/Queue';
import MixinInterface from '../interfaces/MixinInterface';
import MixinsAppService from '../class/MixinsAppService';

import { deleteItem as ArrayDeleteItem } from '../helpers/Arrays';
import { shallowCopy as ArrayShallowCopy } from '../helpers/Arrays';

export class QueuesService extends MixinsAppService {
  queues: object = {};

  afterAllQueues(queues, complete) {
    let originalList = ArrayShallowCopy(queues);
    let hasRunningQueue = false;

    queues.forEach((queue: Queue) => {
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
    return this.get(queueName) || new Queue(this, queueName);
  }

  get(queueName): Queue {
    return this.queues[queueName];
  }
}

export const MixinQueues: MixinInterface = {
  name: 'queues',

  service: QueuesService,
};
