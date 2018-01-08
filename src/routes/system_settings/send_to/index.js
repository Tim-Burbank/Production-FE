/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.send_to,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const send_to = require('./container/send_to').default;
      const reducer = require('./modules/send_to').default
      injectReducer(store, { key: 'sendTo', reducer })
      cb(null, send_to)
    }, 'send_to')
  },
})


