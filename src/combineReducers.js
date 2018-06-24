import ActionTypes from './utils/actionTypes'
import warning from './utils/warning'
import isPlainObject from './utils/isPlainObject'



function getUnexpectedStateShapeWarningMessage(
  inputState,
  reducers,
  action,
  unexpectedKeyCache
) {
  const reducerKeys = Object.keys(reducers)
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? 'preloadedState argument passed to createStore'
      : 'previous state received by the reducer'

  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  )

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true
  })
  if (action && action.type === ActionTypes.REPLACE) return
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key]
    const initialState = reducer(undefined, { type: ActionTypes.INIT })

    const type =
      '@@redux/PROBE_UNKNOWN_ACTION_' +
      Math.random()
        .toString(36)
        .substring(7)
        .split('')
        .join('.')
  })
}


/*
{
  a: () => {},
  b: () => {},
  c: () => {},
  d: () => {},
  e: () => {}
}
*/

export default function combineReducers(reducers) {
  //  [a,b,c,d,e]
  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i] // a/b/c/d/e

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key] // 一个for循环将reducers对象复制，放到finalReducers对象里
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)
  // [a,b,c,d,e]  拿到复制后对象的key值
  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      // [a,b,c,d,e]
      const reducer = finalReducers[key]
      // funA, funB, funC, funD, funE
      const previousStateForKey = state[key] // 原始状态
      const nextStateForKey = reducer(previousStateForKey, action) // 传入reducer, reducer处理后返回新状态
      nextState[key] = nextStateForKey // 再把返回后的新状态存储一份，

      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    return hasChanged ? nextState : state // 用一个标志位判断reducer状态是否发生改变，改变返回true，没改变返回false;
  }
}
