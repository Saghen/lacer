import { Store } from "../index"

import { IBooleanState } from "./helpers/types"

test("BooleanStore replace", () => {
  const BooleanStore = new Store<IBooleanState>({ bool: true })

  expect(BooleanStore.get().bool).toBe(true)

  BooleanStore.replace(() => ({ bool: false }))
  expect(BooleanStore.get().bool).toBe(false)
})

test("BooleanStore replace with middleware", () => {
  const BooleanStore = new Store<IBooleanState>({ bool: true })
  BooleanStore.addMiddleware((state) => state.bool !== false)

  expect(BooleanStore.get().bool).toBe(true)

  BooleanStore.replace(() => ({ bool: false }))
  expect(BooleanStore.get().bool).toBe(true)
})

test("BooleanStore replace with subscription", () => {
  const BooleanStore = new Store<IBooleanState>({ bool: true })

  let propertySubscriptionRan = false
  let allSubscriptionRan = false
  BooleanStore.subscribe(() => (propertySubscriptionRan = true), ["bool"])
  BooleanStore.subscribe(() => (allSubscriptionRan = true))

  expect(BooleanStore.get().bool).toBe(true)
  expect(propertySubscriptionRan).toBe(false)
  expect(allSubscriptionRan).toBe(false)

  BooleanStore.replace(() => ({ bool: false }))

  expect(BooleanStore.get().bool).toBe(false)
  expect(propertySubscriptionRan).toBe(true)
  expect(allSubscriptionRan).toBe(true)
})
