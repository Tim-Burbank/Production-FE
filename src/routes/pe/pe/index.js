
import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'



export default (store) => ({
  path : rootPath.PE,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const PE = require('./component/PE').default;
      const reducer = require('./modules/PE').default
      injectReducer(store, { key: 'PE', reducer })
      cb(null, PE)
    }, 'PE')
  },
})


