/**
 * Created by Maoguijun on 2017/8/7.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.vat_balance_details+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const vat_balance_details = require('./container/vat_balance_details').default;
      const reducer = require('./modules/vat_balance_details').default
      injectReducer(store, { key: 'vat_balance_details', reducer })
      cb(null, vat_balance_details)
    }, 'vat_balance_details')
  },
})




