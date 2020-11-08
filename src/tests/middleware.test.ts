import { ICounterState } from './helpers/types'
import { Store } from '../index'

test('CounterStore actions with middleware', () => {
  // Creating a new store with an initial state { count: 0 }
  const CounterStore = new Store<ICounterState>({ count: 0 }, 'Counter')

  // Setting a condition to prevent count from going below 0 when `actionType` is `Decrement`
  CounterStore.addMiddleware(
    (state, actionType) => !(state.count < 0 && actionType === 'Decrement')
  )

  // Implementing some actions to update the store
  const increment = () => CounterStore.set((prev) => prev.count++, 'Increment')
  const decrement = () => CounterStore.set((prev) => prev.count--, 'Decrement')
  const sudoDecrement = () =>
    CounterStore.set((prev) => prev.count--, 'SudoDecrement')

  const replaceWithTen = () =>
    CounterStore.replace(() => ({ count: 10 }), 'Replace with ten')

  CounterStore.reset()
  expect(CounterStore.get().count).toBe(0)

  increment()
  expect(CounterStore.get().count).toBe(1)

  decrement()
  expect(CounterStore.get().count).toBe(0)

  // Making sure decrement can't go below 0
  decrement()
  expect(CounterStore.get().count).toBe(0)

  // Special case for `SudoDecrement` actions which CAN go below 0
  sudoDecrement()
  expect(CounterStore.get().count).toBe(-1)

  replaceWithTen()
  expect(CounterStore.get().count).toBe(10)
})

test('TestStore actions with middleware', () => {
  const TestStore = new Store({ count: 0, toggle: false })

  // Setting a middleware to prevent count from going below 0 when `actionType` is `Decrement`
  TestStore.addMiddleware(
    (state, actionType) => !(state.count < 0 && actionType === 'Decrement')
  )

  // Implementing some actions to update the store
  const decrement = () => TestStore.set((prev) => prev.count--, 'Decrement')
  const toggle = () =>
    TestStore.set((prev) => (prev.toggle = !prev.toggle), 'Toggle')

  toggle()
  expect(TestStore.get().count).toBe(0)
  expect(TestStore.get().toggle).toBe(true)

  decrement()
  expect(TestStore.get().count).toBe(0)
  expect(TestStore.get().toggle).toBe(true)
})

test('TestStore actions with remove middleware', () => {
  const TestStore = new Store<ICounterState>({ count: 0 })

  // Setting a middleware to prevent count from going below 0 when `actionType` is `Decrement`
  const middleware = (state, actionType) => !(state.count < 0 && actionType === 'Decrement')

  TestStore.addMiddleware(middleware)
  TestStore.removeMiddleware(middleware)

  // Implementing some actions to update the store
  const decrement = () => TestStore.set((prev) => prev.count--, 'Decrement')

  decrement()
  expect(TestStore.get().count).toBe(-1)
})
