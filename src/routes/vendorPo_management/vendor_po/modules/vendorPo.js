/**
 * Created by Maoguijun on 2017/10/13.
 */
import Immutable from 'immutable'
import { easyfetch } from '../../../../utils/FetchHelper'
import { host } from '../../../../config'

export const FETCH_VENDORPO = 'FETCH_VENDORPO'
export const NEW_VENDORPO = 'NEW_VENDORPO'
export const ALT_VENDORPO = 'ALT_VENDORPO'
export const FETCH_VENDORPO_INFO = 'FETCH_VENDORPO_INFO'

export const fetchVendorPo = json => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vpos', 'get', json)
      .then(e => {
        return dispatch({
          type: FETCH_VENDORPO,
          payload: e
        })
      })
      .catch(e => ({ error: e }))
  }
}

export const fetchVendorPoInfo = (id, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vpos/' + id, 'get', json)
      .then(e => {
        return dispatch({
          type: FETCH_VENDORPO_INFO,
          payload: e.obj
        })
      })
      .catch(e => ({ error: e }))
  }
}

export const newVendorFP = json => {
  // console.log(4646464,json)
  return (dispatch, getState) => {
    return easyfetch(host, '/vendorFPs', 'post', json)
      .then(e => {
        return dispatch(fetchVendorPo())
      })
      .catch(e => ({ error: e }))
  }
}

export const updateVendorFP = (id, json) => {
  return (dispatch, getState) => {
    return easyfetch(host, '/vendorFPs/' + id, 'put', json)
      .then(e => {
        return dispatch(fetchVendorPo())
      })
      .catch(e => ({ error: e }))
  }
}

// export const disabledVendorPo = (id,json) => {
//   return (dispatch, getState) => {
//     return easyfetch(host,'/vpos/disable/'+id,'put',json)
//       .then(
//         e=>{
//           return dispatch(fetchVendorPo())
//         }
//       )
//       .catch(e=>({error:e}))

//   }
// }

// export const enabledVendorPo = (id,json) => {
//   return (dispatch, getState) => {
//     return easyfetch(host,'/vpos/enable/'+id,'put',json)
//       .then(
//         e=>{
//           return dispatch(fetchVendorPo())
//         }
//       )
//       .catch(e=>({error:e}))

//   }
// }

const ACTION_HANDLERS = {
  [FETCH_VENDORPO]: (state, action) =>
    state
      .update('vpos', () => Immutable.fromJS(action.payload.objs))
      .update('count', () => Immutable.fromJS(action.payload.count)),
  [FETCH_VENDORPO_INFO]: (state, action) => state.update('vposInfo', () => Immutable.fromJS(action.payload))
}

// ------------------------------------
// Reducer
// ------------------------------------
export default function vendorReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
