export interface ICounterState {
  count: number
}

export interface IBooleanState {
  bool: boolean
}

export interface IShallowState {
  str: string
  bool: boolean
  num: number
}

export interface IShallowArraysState {
  str: string[]
  bool: boolean[]
  num: number[]
}

export interface IDeepState {
  a: {
    a: {
      a: boolean
    }
    b: string
  }
  b: {
    a: {
      a: {
        a: string[]
        b: number
      }
    }
    b: {
      a: boolean[]
    }
  }
}
