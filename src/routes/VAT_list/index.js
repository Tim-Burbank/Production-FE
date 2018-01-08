/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../config'


export default (store) => ({
  path : rootPath.VAT_list,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const VAT_list = require('./container/VAT_list').default;
      const reducer = require('./modules/VAT_list').default
      injectReducer(store, { key: 'VATList', reducer })
      cb(null, VAT_list)
    }, 'VAT_list')
  },
})




