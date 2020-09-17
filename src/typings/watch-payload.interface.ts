export default interface IWatchPayload extends IBaseWatchPayload {
  messageId: string
  lastMessageUpdateDt: Date
}

export interface IBaseWatchPayload {
  quoteId: string

  serverId: string
  channelId: string

  emoji: string
  count: number

  expireDt: Date
}
