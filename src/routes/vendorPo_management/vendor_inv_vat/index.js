/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.vendorInvVat,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const vendorInvVat = require('./container/vendorInvVat').default;
      const reducer = require('./modules/vendorInvVat').default
      injectReducer(store, { key: 'vendorInvVat', reducer })
      cb(null, vendorInvVat)
    }, 'vendorInvVat')
  },
})


