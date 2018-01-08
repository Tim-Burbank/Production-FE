/**
 * Created by Maoguijun on 2017/10/13.
 */
import Immutable from 'immutable'
import { easyfetch } from '../../../../utils/FetchHelper'
import { host } from '../../../../config'

export const FETCH_VENDORFP = 'FETCH_VENDORFP'
export const NEW_VENDORFP = 'NEW_VENDORFP'
export const ALT_VENDORFP = 'ALT_VENDORFP'
export const FETCH_VENDORFP_INFO = 'FETCH_VENDORFP_INFO'
export const FETCH_PAYMENT_ID = 'FETCH_PAYMENT_ID'
export const NEW_PAYMENT = 'NEW_PAYMENT'
export const UPDATE_PAYMENT = 'UPDATE_PAYMENT'

export const fetchVendorFP = json => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vendorFPS', 'get', json)
      .then(e => {
        return dispatch({
          type: FETCH_VENDORFP,
          payload: e
        })
      })
      .catch(e => ({ error: e }))
  }
}

export const fetchVendorFPInfo = (id, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vendorFPS/' + id, 'get', json)
      .then(e => {
        return dispatch({
          type: FETCH_VENDORFP_INFO,
          payload: e.obj
        })
      })
      .catch(e => ({ error: e }))
  }
}
export const fetchPaymentId = json => {
  return (dispatch, getState) => {
    return easyfetch(host, '/payments/id-generator', 'get', json)
      .then(e => {
        return dispatch({
          type: FETCH_PAYMENT_ID,
          payload: e.obj
        })
      })
      .catch(e => ({ error: e }))
  }
}

export const newVendorFP = json => {
  // console.log(4646464,json)
  return (dispatch, getState) => {
    return easyfetch(host, '/vendorFPS', 'post', json)
      .then(e => {
        return dispatch({
          type: NEW_VENDORFP,
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

export const altVendorFP = (id, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vendorFPS/' + id, 'put', json)
      .then(e => {
        return dispatch(fetchVendorFP())
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

export const disabledVendorFP = (id, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vendorFPS/disable/' + id, 'put', json)
      .then(e => {
        return dispatch(fetchVendorFP())
      })
      .catch(e => ({ error: e }))
  }
}

export const enabledVendorFP = (id, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vendorFPS/enable/' + id, 'put', json)
      .then(e => {
        return dispatch(fetchVendorFP())
      })
      .catch(e => ({ error: e }))
  }
}

const ACTION_HANDLERS = {
  [FETCH_VENDORFP]: (state, action) =>
    state
      .update('vendorFPS', () => Immutable.fromJS(action.payload.objs))
      .update('count', () => Immutable.fromJS(action.payload.count)),
  [FETCH_VENDORFP_INFO]: (state, action) => state.update('vendorFPSInfo', () => Immutable.fromJS(action.payload)),
  [FETCH_PAYMENT_ID]: (state, action) => state.update('paymentid', () => Immutable.fromJS(action.payload.obj))
}

// ------------------------------------
// Reducer
// ------------------------------------
export default function vendorFPSReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
