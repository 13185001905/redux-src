function bindActionCreator(actionCreator, dispatch) {
  return function() {
    return dispatch(actionCreator.apply(this, arguments))
  }
}

export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

/*
  actionCreators = () => {}
  actionCreators = {a: funcA, B: funB, c: funC}
*/

  const keys = Object.keys(actionCreators)
  // [a,b,c]
  const boundActionCreators = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]  // a  --  b  --  c
    const actionCreator = actionCreators[key];
    // funA  --  funB  --  funC
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  // 返回一个新对象，新对象存储的是 a -- 对应的函数的一个一阶函数
  /*
    {
      a: () => {},
      b: () => {}
    }
  */
  return boundActionCreators
}
