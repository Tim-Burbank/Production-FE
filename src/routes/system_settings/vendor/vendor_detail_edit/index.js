/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../../config'





export default (store) => ({
  path : rootPath.vendor_detail_edit+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const vendor_detail_edit = require('./container/vendor_detail_edit').default;
      const reducer = require('./modules/vendor_detail_edit').default
      injectReducer(store, { key: 'vendorDetailEdit', reducer })
      cb(null, vendor_detail_edit)
    }, 'vendor_detail_edit')
  },
})





