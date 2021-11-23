import Queue from '../class/Queue';
import MixinsAppService from '../class/MixinsAppService';

import { deleteItem as ArrayDeleteItem } from '../helpers/Arrays';
import { shallowCopy as ArrayShallowCopy } from '../helpers/Arrays';
import { uniqueId as StringUniqueId } from '../helpers/String';

export default class QueuesService extends MixinsAppService {
  public queues: object = {};
  protected service: QueuesService;

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

  create(queueName: string = null) {
    if (queueName === null) {
      queueName = StringUniqueId();
    }

    return this.get(queueName) || new Queue(this, queueName);
  }

  get(queueName): Queue {
    return this.queues[queueName];
  }
}
