/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'





export default (store) => ({
  path : rootPath.client_po_details+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const client_po_details = require('./container/client_po_details').default;
      const reducer = require('./modules/client_po_details').default
      injectReducer(store, { key: 'clientPODetails', reducer })
      cb(null, client_po_details)
    }, 'client_po_details')
  },
})





