/**
 * Created by Yurek on 2017/5/15.
 */
import Immutable from 'immutable'
import {easyfetch} from '../../../utils/FetchHelper'
import {host} from '../../../config'


export const FETCH_BILLING_PLAN = 'FETCH_BILLING_PLAN';
export const NEW_BILLING_PLAN = 'NEW_BILLING_PLAN';
export const ALT_BILLING_PLAN = 'ALT_BILLING_PLAN'
export const FETCH_BILLING_PLAN_INFO = 'FETCH_BILLING_PLAN_INFO'




export const fetchBillingPlan = (json) => {
  return (dispatch, getState) => {
    //console.log(16,json)
    return easyfetch(host, '/billingPlans', 'get', json)
      .then(
        e=>{
          return dispatch({
            type    : FETCH_BILLING_PLAN,
            payload : e
          })
        }
      )
      .catch(e=>({error:e}))

  }
}

export const fetchBillingPlanInfo = (id) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/billingPlans/'+id,'get')
      .then(
        e=>{
          return dispatch({
            type    : FETCH_BILLING_PLAN_INFO,
            payload : e.obj
          })
        }
      )
      .catch(e=>({error:e}))
  }
}



export const newBillingPlan = (json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/billingPlans','post',json)
      .then(
        e=>{
          return dispatch(fetchBillingPlan())
        }
      )
      .catch(e=>({error:e}))

  }
}

export const altBillingPlan = (id,json) => {
  return (dispatch, getState) => {
    return easyfetch(host,'/billingPlans/'+id,'put',json)
      .then(
        e=>{
          return dispatch(fetchBillingPlan())
        }
      )
      .catch(e=>({error:e}))

  }
}


const ACTION_HANDLERS = {
  [FETCH_BILLING_PLAN]    : (state, action) => state.update('billingPlan',() =>Immutable.fromJS(action.payload.objs)).update('count',() =>Immutable.fromJS(action.payload.count)).update('currencyAllCN',() =>Immutable.fromJS(action.payload.CNY)).update('currencyAllUS',() =>Immutable.fromJS(action.payload.USD)),
  [FETCH_BILLING_PLAN_INFO] :(state, action) => state.update('billingPlanInfo',() =>Immutable.fromJS(action.payload))
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function billingPlanReducer (state = Immutable.Map(), action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
