import { Store } from '../index'

import { IShallowState } from './helpers/types'

test('BooleanStore subscription', () => {
  const BooleanStore = new Store<IShallowState>({
    bool: false,
    num: 0,
    str: 'test',
  })

  // [str, num, bool, all]
  // This is done for the sake of shortening the line count of the test
  let subscriptionStatuses = [false, false, false, false]

  const resetStatuses = () => {
    for (const i of Object.keys(subscriptionStatuses))
      subscriptionStatuses[i] = false
  }

  BooleanStore.subscribe(() => (subscriptionStatuses[0] = true), ['str'])
  BooleanStore.subscribe(() => (subscriptionStatuses[1] = true), ['num'])
  BooleanStore.subscribe(() => (subscriptionStatuses[2] = true), ['bool'])
  BooleanStore.subscribe(() => (subscriptionStatuses[3] = true))

  expect(subscriptionStatuses).toEqual([false, false, false, false])

  // String
  resetStatuses()

  BooleanStore.set((state) => (state.str = 'test'))
  expect(subscriptionStatuses).toEqual([false, false, false, false])

  BooleanStore.set((state) => (state.str = 'test2'))
  expect(subscriptionStatuses).toEqual([true, false, false, true])

  // Number
  resetStatuses()

  BooleanStore.set((state) => (state.num = 0))
  expect(subscriptionStatuses).toEqual([false, false, false, false])

  BooleanStore.set((state) => (state.num = 1))
  expect(subscriptionStatuses).toEqual([false, true, false, true])

  // Boolean
  resetStatuses()

  BooleanStore.set((state) => (state.bool = false))
  expect(subscriptionStatuses).toEqual([false, false, false, false])

  BooleanStore.set((state) => (state.bool = true))
  expect(subscriptionStatuses).toEqual([false, false, true, true])
})
