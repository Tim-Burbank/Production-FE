
import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'



export default (store) => ({
  path : rootPath.JR,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const JR = require('./component/JR').default;
      const reducer = require('./modules/JR').default
      injectReducer(store, { key: 'JR', reducer })
      cb(null, JR)
    }, 'JR')
  },
})


