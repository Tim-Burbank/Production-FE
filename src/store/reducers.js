import { combineReducers } from 'redux-immutable'
import { routerReducer } from 'react-router-redux'
import localReducer from './locale'
import userReducer from './user'
import userInfoReducer from '../routes/Login/modules/login'
import approverReducer from '../routes/system_settings/approver/modules/approver'
import clientReducer from '../routes/system_settings/client/modules/client'
import placedTo from '../routes/system_settings/placed_to/modules/placed_to'
import billTo from '../routes/system_settings/bill_to/modules/bill_to'
import sendTo from '../routes/system_settings/send_to/modules/send_to'
import clientPO from '../routes/clientPO/modules/client_po'
import invoice from '../routes/invoice_management/modules/invoice_management'
import vatList from '../routes/VAT_list/modules/VAT_list'
import billingPlan from '../routes/billing_plan_list/modules/billing_plan_list'
import vendor from '../routes/system_settings/vendor/modules/vendor'
import product from '../routes/system_settings/product/modules/product'
import productInfo from '../routes/system_settings/product/product_details/modules/product_details'
import JR from '../routes/JR_management/JR/modules/JR'
import PE from '../routes/pe/pe/modules/PE'


export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    routing: routerReducer,
    locale:localReducer,
    user:userReducer,
    userInfo:userInfoReducer,
    approver:approverReducer,
    client:clientReducer,
    placedTo,
    billTo,
    sendTo,
    clientPO,
    invoice,
    vatList,
    billingPlan,
    vendor,
    product,
    JR,
    PE,
    productInfo,
    ...asyncReducers
  })
}


export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
