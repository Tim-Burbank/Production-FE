
import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.placed_to,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const placed_to = require('./container/placed_to').default;
      const reducer = require('./modules/placed_to').default
      injectReducer(store, { key: 'placedTo', reducer })
      cb(null, placed_to)
    }, 'placed_to')
  },
})


