/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../../utils/FetchHelper'
import {host} from '../../../../../config'


export const NEW_PRODUCT = 'NEW_PRODUCT';
export const ALT_PRODUCT = 'ALT_PRODUCT'
export const FETCH_PRODUCT_INFO = 'FETCH_PRODUCT_INFO'
export const NEW_PRODUCT_INFO = 'NEW_PRODUCT_INFO'


export const fetchProductInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/products/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_PRODUCT_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const newProduct = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/products','post',json)
      .then(
        e=>{
          return dispatch({
            type    : NEW_PRODUCT_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altProduct = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/products/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchProductInfo(id))
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_PRODUCT_INFO] :(state, action) => state.update('productInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function productReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
