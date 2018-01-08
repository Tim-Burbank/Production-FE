/**
 * Created by Maoguijun on 2017/8/7.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.collect_balance_details+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const collect_balance_details = require('./container/collect_balance_details').default;
      const reducer = require('./modules/collect_balance_details').default
      injectReducer(store, { key: 'collect_balance_details', reducer })
      cb(null, collect_balance_details)
    }, 'collect_balance_details')
  },
})




