/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.cpo_invoice,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const cpo_invoice = require('./container/cpo_invoice').default;
      const reducer = require('./modules/cpo_invoice').default
      injectReducer(store, { key: 'cpoInvoice', reducer })
      cb(null, cpo_invoice)
    }, 'cpo_invoice')
  },
})




