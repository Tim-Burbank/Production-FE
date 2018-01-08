/*
 * @Author: Maoguijun
 * @Date: 2017-12-29 14:33:16
 * @Last Modified by: Maoguijun
 * @Last Modified time: 2017-12-29 16:07:38
 */

import Immutable from 'immutable'
import { easyfetch } from '../../../../../utils/FetchHelper'
import { host } from '../../../../../config'

export const FETCH_VENDORPO_INFO = 'FETCH_VENDORPO_INFO'

export const fetchVendorPOInfo = id => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vpos/' + id, 'get')
      .then(e => {
        return dispatch({
          type: FETCH_VENDORPO_INFO,
          payload: e.obj
        })
      })
      .catch(e => ({ error: e }))
  }
}

export const newVendorPO = json => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vpos', 'post', json)
      .then(e => {
        return dispatch(fetchVendorPOInfo(json.id))
      })
      .catch(e => ({ error: e }))
  }
}

export const updateVendorPO = (id, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vpos/' + id, 'put', json)
      .then(e => {
        return dispatch(fetchVendorPOInfo(id))
      })
      .catch(e => ({ error: e }))
  }
}

const ACTION_HANDLERS = {
  [FETCH_VENDORPO_INFO]: (state, action) =>
    state
      .update('vpoInfo', () => Immutable.fromJS(action.payload))
      .update('logs', () => Immutable.fromJS(action.payload.flowLogs))
}

// ------------------------------------
// Reducer
// ------------------------------------
export default function VendorPOReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
