/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.client,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const client = require('./container/client').default;
      const reducer = require('./modules/client').default
      injectReducer(store, { key: 'client', reducer })
      cb(null, client)
    }, 'client')
  },
})


