import Queue from "../utils/Queue"
import ServerHandler from '../../classes/utils/ServerHandler'
import EventEmitter from "../utils/EvntEmitter"
import EmitterConstants from '../../config/EmitterConstants'

let handlerInstance
let queue = new Queue()

class DownloadHandler {
    constructor() {
        if (handlerInstance) {
            return handlerInstance
        }

        handlerInstance = this
    }

    addItemsInQueue(item) {
        queue.enqueue(item)
    }

    removeItemFromQueue(item) {
        queue.dequeueItem(item)
    }


    downloadAttachments() {

        try {

            let queueItems = queue.getQueues();
            queueItems.forEach((data) => {



            })

        } catch (e) {
            console.log('[downloadAttachments] --- Exception :' + e)
        }

    }


}

let downloadHandlerInstance = Object.freeze(new DownloadHandler())
export default downloadHandlerInstance