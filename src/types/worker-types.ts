export interface SyncEvent extends ExtendableEvent {
  tag: string
}

export interface NotificationOptionsWithActions extends NotificationOptions {
  actions?: Array<{ action: string; title: string }>
}
