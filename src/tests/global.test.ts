import {
  Store,
  getGlobalState,
  resetGlobalState,
  replaceGlobalState,
} from "../index"

import { IBooleanState } from "./helpers/types"

test("Correct store index", () => {
  const FirstStore = new Store<IBooleanState>({ bool: true })
  const SecondStore = new Store<IBooleanState>({ bool: true })

  expect(FirstStore.idx).toBe(0)
  expect(SecondStore.idx).toBe(1)
})

test("Correct store names", () => {
  const FirstStore = new Store<IBooleanState>({ bool: true }, "Test")
  const SecondStore = new Store<IBooleanState>({ bool: true })

  expect(FirstStore.name).toBe("Test")
  expect(SecondStore.name).toBe("")
})

test("Global state", () => {
  resetGlobalState()
  expect(JSON.stringify(getGlobalState())).toBe(JSON.stringify({}))

  const newGlobalState = { 0: { test: true } }
  replaceGlobalState(newGlobalState)
  expect(JSON.stringify(getGlobalState())).toBe(JSON.stringify(newGlobalState))
})
