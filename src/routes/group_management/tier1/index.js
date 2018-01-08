import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'



export default (store) => ({
  path : rootPath.tier1,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const tier1 = require('./container/tier1').default;
      const reducer = require('./modules/tier1').default
      injectReducer(store, { key: 'tier1', reducer })
      cb(null, tier1)
    }, 'tier1')
  },
})


