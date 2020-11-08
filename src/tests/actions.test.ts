import { ICounterState, IShallowState } from './helpers/types'
import { Store } from '../index'

test('CounterStore simple actions', () => {
  // Creating a new store with an initial state { count: 0 }
  const CounterStore = new Store<ICounterState>({ count: 0 }, 'Counter')

  // Implementing an action to update the store
  const increment = () => CounterStore.set((prev) => prev.count++, 'Increment')

  expect(CounterStore.get().count).toBe(0)

  increment()
  expect(CounterStore.get().count).toBe(1)
})

test('CounterStore advanced actions', () => {
  // Creating a new store with an initial state { count: 0 }
  const CounterStore = new Store<ICounterState>({ count: 0 }, 'Counter')

  // Implementing some actions to update the store
  const increment = () => CounterStore.set((prev) => prev.count++, 'Increment')
  const decrement = () => CounterStore.set((prev) => prev.count--, 'Decrement')

  const replaceWithTen = () =>
    CounterStore.replace(() => ({ count: 10 }), 'Replace with ten')

  CounterStore.reset()
  expect(CounterStore.get().count).toBe(0)

  increment()
  expect(CounterStore.get().count).toBe(1)

  decrement()
  expect(CounterStore.get().count).toBe(0)

  decrement()
  expect(CounterStore.get().count).toBe(-1)

  replaceWithTen()
  expect(CounterStore.get().count).toBe(10)
})

test('TestStore actions', () => {
  const TestStore = new Store<IShallowState>({
    str: 'test',
    num: 0,
    bool: false,
  })

  // Implementing some actions to update the store
  const decrement = () => TestStore.set((prev) => prev.num--, 'Decrement')
  const toggle = () =>
    TestStore.set((prev) => (prev.bool = !prev.bool), 'Toggle')
  const changeStr = (str) => TestStore.set((prev) => (prev.str = str), 'Toggle')

  toggle()
  expect(TestStore.get().str).toBe('test')
  expect(TestStore.get().num).toBe(0)
  expect(TestStore.get().bool).toBe(true)

  decrement()
  expect(TestStore.get().str).toBe('test')
  expect(TestStore.get().num).toBe(-1)
  expect(TestStore.get().bool).toBe(true)

  changeStr('test2')
  expect(TestStore.get().str).toBe('test2')
  expect(TestStore.get().num).toBe(-1)
  expect(TestStore.get().bool).toBe(true)
})
