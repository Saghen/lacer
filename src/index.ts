import produce, { Draft, enablePatches, Patch } from 'immer'
enablePatches()

let devTools

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log(`You're currently using a development version of Lacer`)
  if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect()
    setTimeout(() => devTools.init(STORE), 200)
  }
}

interface IGlobalState {
  [key: number]: Object
}

let STORE: IGlobalState = {}
let COUNTER = 0

// Set & Replace Types
export type SetStateFunc<T> = (state: Draft<T>) => any
export type ReplaceStateFunc<T> = (state: T) => T

// Middleware Types
export type MiddlewareFunc<T> = (
  state: T,
  draft: Draft<T>,
  actionType?: string
) => boolean | undefined
export interface IMiddleware<T> {
  func: MiddlewareFunc<T>
  properties?: string[]
}

// Listener Types
export type ListenerFunc<T> = (
  state: T,
  oldState: T,
  changes?: string[]
) => void
export type ListenerUnsubscriberFunc = () => void
export interface IListener<T> {
  func: ListenerFunc<T>
  properties?: string[]
}

export class Store<T> {
  idx: number
  name = ''
  listeners: IListener<T>[] = []
  devTools
  initialState: T
  middleware: IMiddleware<T>[] = []

  constructor(initialState: T, name?: string) {
    if (name) this.name = name
    this.idx = COUNTER++
    STORE[this.idx] = initialState
    this.initialState = initialState

    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV !== 'production' &&
      devTools
    ) {
      devTools.subscribe((message) => {
        if (['JUMP_TO_STATE', 'JUMP_TO_ACTION'].includes(message.payload?.type))
          this.replace(JSON.parse(message.state)[this.idx])
      })
    }
  }

  get(): T {
    return <T>STORE[this.idx]
  }

  set(setState: SetStateFunc<T>, actionType?: string): boolean {
    let changes = []
    const currentState = this.get()
    let newState = produce<T>(
      currentState,
      (...args) => {
        setState(...args)
      },
      (patches) => changes.push(...patches)
    )

    let wasMiddlewareSuccessful = true
    newState = produce<T>(
      newState,
      (draft) => {
        const middlewareResult = this.runMiddleware(
          newState,
          draft,
          changes,
          actionType
        )
        if (middlewareResult === false) {
          wasMiddlewareSuccessful = false
          return
        }
      },
      (patches) => changes.push(...patches)
    )

    if (!wasMiddlewareSuccessful) return false

    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV !== 'production' &&
      devTools
    )
      devTools.send(
        this.name ? this.name + ' - ' + actionType : actionType,
        STORE
      )

    STORE[this.idx] = newState

    this.runListeners(newState, currentState, changes)

    return true
  }

  replace(replaceState: ReplaceStateFunc<T>, actionType?: string): boolean {
    const currentState = this.get()
    let newState = replaceState(currentState)

    let wasMiddlewareSuccessful = true
    newState = produce<T>(newState, (draft) => {
      for (const middleware of this.middleware) {
        const middlewareResult = middleware.func(newState, draft, actionType)
        if (middlewareResult === false) {
          wasMiddlewareSuccessful = false
          return
        }
      }
    })

    if (!wasMiddlewareSuccessful) return false

    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV !== 'production' &&
      devTools
    )
      devTools.send(
        this.name ? this.name + ' - ' + actionType : actionType,
        STORE
      )

    STORE[this.idx] = newState

    this.listeners.forEach((listener) => listener.func(newState, currentState))

    return true
  }

  addMiddleware(func: MiddlewareFunc<T>, properties?: string[]) {
    this.middleware.push({ func, properties })
  }

  removeMiddleware(func: MiddlewareFunc<T>) {
    this.middleware = this.middleware.filter(
      (middleware) => middleware.func !== func
    )
  }

  runMiddleware(
    state: T,
    draft: Draft<T>,
    patches: Patch[],
    actionType?: string
  ): boolean {
    const changes = patches.map((patch) => String(patch.path[0]))

    if (changes.length === 0) return true

    for (const middleware of this.middleware) {
      if (
        middleware.properties === undefined ||
        middleware.properties.some((property) => changes.includes(property))
      ) {
        const middlewareResult = middleware.func(state, draft, actionType)
        if (middlewareResult === false) return false
      }
    }

    return true
  }

  reset(force?: boolean): boolean {
    let wasMiddlewareSuccessful = true
    const newState = produce<T>(this.initialState, (draft) => {
      for (const middleware of this.middleware) {
        const middlewareResult = middleware.func(
          this.initialState,
          draft,
          'LACER_RESET'
        )
        if (middlewareResult === false && !force) {
          wasMiddlewareSuccessful = false
          return
        }
      }
    })
    if (!wasMiddlewareSuccessful) return false
    STORE[this.idx] = newState
    return true
  }

  subscribe(
    func: ListenerFunc<T>,
    properties?: Extract<keyof T, string>[]
  ): ListenerUnsubscriberFunc {
    this.listeners.push({
      func,
      properties,
    })
    return () => this.unsubscribe(func)
  }

  unsubscribe(func: ListenerFunc<T>): void {
    this.listeners = this.listeners.filter((listener) => listener.func !== func)
  }

  runListeners(state: T, oldState: T, patches: Patch[]) {
    const changes = patches.map((patch) => String(patch.path[0]))

    if (changes.length === 0) return

    for (const listener of this.listeners) {
      if (listener.properties === undefined)
        listener.func(state, oldState, changes)
      else if (
        listener.properties.some((property) => changes.includes(property))
      )
        listener.func(state, oldState, changes)
    }
  }

  dispatch(value: any, info: string) {
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV !== 'production' &&
      devTools
    ) {
      devTools.send(this.name ? this.name + ' - ' + info : info, STORE)
    }
    return value
  }
}

export function dispatch(value: any, info: string) {
  if (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV !== 'production' &&
    devTools
  )
    devTools.send(info, STORE)

  return value
}

export function getGlobalState() {
  return STORE
}

export function resetGlobalState() {
  STORE = {}
}

export function replaceGlobalState(state: IGlobalState) {
  STORE = state
}
