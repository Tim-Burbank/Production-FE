/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.invoice_detail+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const invoice_detail = require('./container/invoice_detail').default;
      const reducer = require('./modules/invoice_detail').default
      injectReducer(store, { key: 'invoiceDetail', reducer })
      cb(null, invoice_detail)
    }, 'invoice_detail')
  },
})




