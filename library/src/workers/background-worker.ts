import { Worker } from "worker_threads";
import { WorkerMessageHandler } from "./worker-message-handler";

/* istanbul ignore next */
export class BackgroundWorker {

  worker: Worker;

  constructor(workerPath: string, data: any, handlers: WorkerMessageHandler[] = []) {
    this.worker = new Worker(workerPath, {workerData: data});
    this.worker.on("message", (data) => {
      handlers.forEach(async handler => await handler.onMessage(data));
    });
    this.worker.on("error", (ex) => {
      let errorHandlers = handlers.filter(h => !!h.onError);
      errorHandlers.forEach(async handler => await handler.onError(ex));
    });
  }

  postMessage = (message: any): void => {
    this.worker.postMessage(message);
  }

}
