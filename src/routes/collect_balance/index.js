/**
 * Created by  Maoguijun on 2017/8/7.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../config'


export default (store) => ({
  path : rootPath.collect_balance,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const collect_balance = require('./container/collect_balance').default;
      const reducer = require('./modules/collect_balance').default
      injectReducer(store, { key: 'collect_balance', reducer })
      cb(null, collect_balance)
    }, 'collect_balance')
  },
})




