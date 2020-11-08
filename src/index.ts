import produce, { Draft, enablePatches, Patch } from 'immer'
enablePatches()

let devTools

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log(`You're currently using a development version of Immco`)
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

export type SetStateFunc<T> = (state: Draft<T>) => any
export type ReplaceStateFunc<T> = (state: T) => T
export type MiddlewareFunc<T> = (state: T, actionType?: string) => T | boolean

export type ListenerFunc<T> = (
  state: T,
  oldState: T,
  changes?: string[]
) => void
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
  middleware: MiddlewareFunc<T>[] = []

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

  set(setState: SetStateFunc<T>, actionType?: string) {
    let changes = []
    const currentState = this.get()
    let newState = produce<T>(
      currentState,
      (...args) => {
        setState(...args)
      },
      (patches) => changes.push(...patches)
    )
    for (const middleware of this.middleware) {
      const middlewareResult = middleware(newState, actionType)
      if (middlewareResult === false) return false
      if (middlewareResult === true) continue
      newState = middlewareResult
    }

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
  }

  replace(replaceState: ReplaceStateFunc<T>, actionType?: string) {
    const currentState = this.get()
    let newState = replaceState(currentState)
    for (const middleware of this.middleware) {
      const middlewareResult = middleware(newState, actionType)
      if (middlewareResult === false) return false
      if (middlewareResult === true) continue
      newState = middlewareResult
    }

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
  }

  addMiddleware(func: MiddlewareFunc<T>) {
    this.middleware.push(func)
  }

  removeMiddleware(func: MiddlewareFunc<T>) {
    this.middleware = this.middleware.filter((f) => f !== func)
  }

  reset() {
    STORE[this.idx] = this.initialState
  }

  subscribe(func: ListenerFunc<T>, properties?: Extract<keyof T, string>[]) {
    this.listeners.push({
      func,
      properties,
    })
  }

  unsubscribe(func: ListenerFunc<T>) {
    this.listeners = this.listeners.filter((listener) => listener.func !== func)
  }

  runListeners(state: T, oldState: T, patches: Patch[]) {
    const changes = patches.map((patch) => String(patch.path[0]))

    if (changes.length === 0) return;

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
