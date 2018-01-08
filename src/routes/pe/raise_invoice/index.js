
import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'



export default (store) => ({
  path : rootPath.raiseInv,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const raiseInv = require('./component/raiseInv').default;
      const reducer = require('./modules/raiseInv').default
      injectReducer(store, { key: 'raiseInv', reducer })
      cb(null, raiseInv)
    }, 'raiseInv')
  },
})


