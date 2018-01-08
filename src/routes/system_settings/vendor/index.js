/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.vendor,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const vendor = require('./container/vendor').default;
      const reducer = require('./modules/vendor').default
      injectReducer(store, { key: 'vendor', reducer })
      cb(null, vendor)
    }, 'vendor')
  },
})


