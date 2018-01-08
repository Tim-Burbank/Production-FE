/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../config'


export default (store) => ({
  path : rootPath.client_po,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const client_po = require('./container/client_po').default;
      const reducer = require('./modules/client_po').default
      injectReducer(store, { key: 'clientPO', reducer })
      cb(null, client_po)
    }, 'client_po')
  },
})




