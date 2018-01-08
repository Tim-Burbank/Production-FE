/**
 * Created by Maoguijun on 2017/10/13.
 */
import Immutable from 'immutable'
import { easyfetch } from '../../../../utils/FetchHelper'
import { host, CPOOperation } from '../../../../config'

export const FETCH_PAYMENT = 'FETCH_PAYMENT'
export const NEW_PAYMENT = 'NEW_PAYMENT'
export const UPDATE_PAYMENT = 'UPDATE_PAYMENT'
export const OPERATION_PAYMENT = 'OPERATION_PAYMENT'
export const FETCH_PAYMENT_INFO = 'FETCH_PAYMENT_INFO'

export const fetchPayment = json => {
  return (dispatch, getState) => {
    return easyfetch(host, '/payments', 'get', json)
      .then(e => {
        return dispatch({
          type: FETCH_PAYMENT,
          payload: e
        })
      })
      .catch(e => ({ error: e }))
  }
}

export const fetchPaymentInfo = (id, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/payments/' + id, 'get', json)
      .then(e => {
        return dispatch({
          type: FETCH_PAYMENT_INFO,
          payload: e.obj
        })
      })
      .catch(e => ({ error: e }))
  }
}

export const newPayment = json => {
  // console.log(4646464,json)
  return (dispatch, getState) => {
    return easyfetch(host, '/payments', 'post', json)
      .then(e => {
        return dispatch({
          type: NEW_PAYMENT,
          payload: e.obj
        })
      })
      .catch(e => ({ error: e }))
  }
}

export const updatePayment = (id, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/payments/' + id, 'put', json)
      .then(e => {
        return dispatch({
          type: UPDATE_PAYMENT,
          payload: e.obj
        })
      })
      .catch(e => ({ error: e }))
  }
}

export const oprationPayment = (operation, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/payments/:' + operation, 'put', json)
      .then(e => {
        return dispatch({
          type: OPERATION_PAYMENT,
          payload: e.obj
        })
      })
      .catch(e => ({ error: e }))
  }
}

const ACTION_HANDLERS = {
  [FETCH_PAYMENT]: (state, action) =>
    state
      .update('payment', () => Immutable.fromJS(action.payload.objs))
      .update('count', () => Immutable.fromJS(action.payload.count)),
  [FETCH_PAYMENT_INFO]: (state, action) => state.update('paymentInfo', () => Immutable.fromJS(action.payload))
}

// ------------------------------------
// Reducer
// ------------------------------------
export default function vendorReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
