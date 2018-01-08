/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.vendorPo,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const vendorPo = require('./container/vendorPo').default;
      const reducer = require('./modules/vendorPo').default
      injectReducer(store, { key: 'vendorPo', reducer })
      cb(null, vendorPo)
    }, 'vendorPo')
  },
})


