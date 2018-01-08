/**
 * Created by Maoguijun on 2017/10/13.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_VENDOR = 'FETCH_VENDOR';
export const NEW_VENDOR = 'NEW_VENDOR';
export const ALT_VENDOR = 'ALT_VENDOR'
export const FETCH_VENDOR_INFO = 'FETCH_VENDOR_INFO'

export const fetchVendor = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_VENDOR,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchVendorInfo = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors/'+id,'get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_VENDOR_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newVendor = (json) => {
  //console.log(4646464,json)
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors','post',json)
      .then(
        e=>{
          return dispatch(fetchVendor())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altVendor = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchVendor())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const disabledVendor = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors/disable/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchVendor())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const enabledVendor = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors/enable/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchVendor())
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_VENDOR]    : (state, action) => state.update('vendors',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_VENDOR_INFO] :(state, action) => state.update('vendorsInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function vendorReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
