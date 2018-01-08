/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../../utils/FetchHelper'
import {host} from '../../../../config'

export const FETCH_PRODUCT = 'FETCH_PRODUCT';
export const NEW_PRODUCT = 'NEW_PRODUCT';
export const ALT_PRODUCT = 'ALT_PRODUCT'
export const FETCH_PRODUCT_INFO = 'FETCH_PRODUCT_INFO'
export const FETCH_PRODUCT_RE = 'FETCH_PRODUCT_RE'

export const fetchProduct = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/products','get',json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_PRODUCT,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}



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

export const fetchProductRe = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/products-updateApp/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_PRODUCT_RE,
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
          return dispatch(fetchProduct())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altProduct = (action,id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/products/'+action+'/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchProduct())
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_PRODUCT]    : (state, action) => state.update('product',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)),
  [FETCH_PRODUCT_INFO] :(state, action) => state.update('productInfo',() =>Immutable.fromJS(action.payload)),
  [FETCH_PRODUCT_RE] :(state, action) => state.update('productRe',() =>Immutable.fromJS(action.payload))

};

// ------------------------------------
// Reducer
// ------------------------------------
export default function productReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
