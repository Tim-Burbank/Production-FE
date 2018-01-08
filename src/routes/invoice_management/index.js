/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../config'


export default (store) => ({
  path : rootPath.invoice_management,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const invoice_management = require('./container/invoice_management').default;
      const reducer = require('./modules/invoice_management').default
      injectReducer(store, { key: 'invoice', reducer })
      cb(null, invoice_management)
    }, 'invoice_management')
  },
})




