/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.approver,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const approver = require('./container/approver').default;
      const reducer = require('./modules/approver').default
      injectReducer(store, { key: 'approver', reducer })
      cb(null, approver)
    }, 'approver')
  },
})


