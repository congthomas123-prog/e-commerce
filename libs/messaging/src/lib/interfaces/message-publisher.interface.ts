export interface MessagePublisher {
  emit<T>(subject: string, payload: T): Promise<void>;
}
