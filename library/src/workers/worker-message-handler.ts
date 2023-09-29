export type WorkerMessageHandler = {
  onMessage: (message: any) => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}