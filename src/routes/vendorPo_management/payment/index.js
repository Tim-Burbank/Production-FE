/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath, chilPath } from '../../../config'

export default store => ({
  path: rootPath.payment,
  getComponent (nextState, cb) {
    require.ensure(
      [],
      require => {
        const payment = require('./container/payment').default
        const reducer = require('./modules/payment').default
        injectReducer(store, { key: 'payment', reducer })
        cb(null, payment)
      },
      'payment'
    )
  }
})
