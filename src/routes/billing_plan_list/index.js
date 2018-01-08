/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../config'

export default (store) => ({
  path : rootPath.billing_plan_list,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const billing_plan_list = require('./container/billing_plan_list').default;
      const reducer = require('./modules/billing_plan_list').default
      injectReducer(store, { key: 'billingPlan', reducer })
      cb(null, billing_plan_list)
    }, 'billing_plan_list')
  },
})

