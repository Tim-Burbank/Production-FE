/**
 * Created by Maoguijun on 2017/10/14.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../../utils/FetchHelper'
import {host} from '../../../../../config'

export const FETCH_VENDOR = 'FETCH_VENDOR';
export const NEW_VENDOR = 'NEW_VENDOR';
export const FETCH_VENDOR_INFO = 'FETCH_VENDOR_INFO'


export const fetchVendorInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors/'+id,'get')
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
export const fetchVendor2Info = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors-updateApp/'+id,'get',json)
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
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_VENDOR,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}


export const updateVendor = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/vendors/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchVendorInfo(id))
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_VENDOR]    : (state, action) => state.update('VENDOR',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_VENDOR_INFO] :(state, action) => state.update('vendorInfo',() =>Immutable.fromJS(action.payload)).update('bankInfo',() =>Immutable.fromJS(action.payload.vendorBanks))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function VendorReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
