/**
 * Created by Maoguijun on 2017/8/7.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../../config'


export default (store) => ({
  path : rootPath.tier1_detail+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const tier1_detail = require('./container/tier1_details').default;
      const reducer = require('./modules/tier1_details').default
      injectReducer(store, { key: 'tier1_detail', reducer })
      cb(null, tier1_detail)
    }, 'tier1_detail')
  },
})




