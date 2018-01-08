/**
 * Created by Yurek on 2017/8/24.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.tier2+'/:id',

  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const tier2 = require('./container/tier2').default;
      const reducer = require('./modules/tier2').default
      injectReducer(store, { key: 'tier2', reducer })
      cb(null, tier2)
    }, 'tier2')
  },
})





