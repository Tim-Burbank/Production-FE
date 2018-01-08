/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.requisition,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const requisition = require('./container/requisition').default;
      const reducer = require('./modules/requisition').default
      injectReducer(store, { key: 'requisition', reducer })
      cb(null, requisition)
    }, 'requisition')
  },
})


