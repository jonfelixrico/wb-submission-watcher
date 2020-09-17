import {
  ReactionCollector,
  Message,
  Snowflake,
  MessageReaction,
  User,
  ReactionCollectorOptions,
} from 'discord.js'
import { fromEvent, of, never, Observable, merge, from } from 'rxjs'
import { takeUntil, map, mapTo, mergeMap } from 'rxjs/operators'

/**
 * This class' purpose is to wrap around the ReactionCollector class from `discord.js`
 * with `RxJS`.
 */
export default class MessageReactionWrapper {
  /**
   * Given a message, a new reaction collector is spawned off it and that same reaction collector
   * is then wrapped around with RxJS functionalities.
   *
   * This is similar to @see Message#createReactionCollector.
   *
   * @param message
   * @param filter
   * @param options
   */
  static wrap(
    message: Message,
    filter: MessageCollectionFilter = () => true,
    options?: ReactionCollectorOptions
  ): MessageReactionWrapper {
    return new MessageReactionWrapper(message, filter, options)
  }

  private collector: ReactionCollector

  private constructor(
    private message: Message,
    filter: MessageCollectionFilter = () => true,
    options?: ReactionCollectorOptions
  ) {
    this.collector = message.createReactionCollector(filter, options)
  }

  private get reactionCache() {
    return this.message.reactions.cache
  }

  async getReactions(): Promise<ReactionMap> {
    const reactions = [...this.reactionCache.values()]
    const map: ReactionMap = {}
    for (const reaction of reactions) {
      const { users, emoji } = reaction
      const fetched = await users.fetch()
      map[emoji.name] = fetched.keyArray()
    }

    return map
  }

  /**
   * Emits and completes once the wrapper's internal collector has ended.
   * If it's already ended,  the emission and completion will happen upon subscription.
   */
  get end$() {
    const { collector } = this
    if (collector.ended) {
      return of(null).pipe(mapTo(undefined))
    }
    return fromEvent(collector, 'end').pipe(mapTo(undefined))
  }

  /**
   * Ends the internal collector of the wrapper. When this happens, anything subscribed to end$ will receive
   * an emission. Instances of change$ and reactions$ will also instantly complete.
   */
  kill(): boolean {
    const { collector } = this
    if (collector.ended) {
      return true
    }

    collector.stop()
    return false
  }

  private generateMapOperator(type: ReactionChangeType) {
    return map<[MessageReaction, User], ReactionChange>(([r, u]) => ({
      type,
      emoji: r.emoji && r.emoji.name,
      userId: u.id,
    }))
  }

  /**
   * Emits when a user added or removed a reaction from the message we're
   * watching. The emission data will be about whodid the reaction/removal
   * and which emoji was it.
   */
  get change$(): Observable<ReactionChange> {
    const { collector } = this

    const collect$ = fromEvent(collector, 'collect').pipe(
      this.generateMapOperator(ReactionChangeType.COLLECT)
    )
    const remove$ = fromEvent(collector, 'remove').pipe(
      this.generateMapOperator(ReactionChangeType.REMOVE)
    )

    return merge(collect$, remove$).pipe(takeUntil(this.end$))
  }

  /**
   * @see change$
   * Similar to `change$`, but the emission are snapshots of the reaction state.
   */
  get reactions$(): Observable<ReactionMap> {
    const { collector } = this
    if (collector.ended) {
      return never()
    }

    return merge(
      of(undefined),
      fromEvent(collector, 'remove'),
      fromEvent(collector, 'collect')
    ).pipe(
      takeUntil(this.end$),
      mergeMap(() => from(this.getReactions()))
    )
  }
}

export interface ReactionMap {
  [key: string]: string[]
}

export enum ReactionChangeType {
  COLLECT = 'COLLECT',
  REMOVE = 'REMOVE',
}

export interface ReactionChange {
  userId: Snowflake
  emoji: Snowflake
  type: ReactionChangeType
}

export type MessageCollectionFilter = (r: MessageReaction, u: User) => boolean
