
import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'



export default (store) => ({
  path : rootPath.DAF,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const DAF = require('./container/DAF').default;
      const reducer = require('./modules/DAF').default
      injectReducer(store, { key: 'DAF', reducer })
      cb(null, DAF)
    }, 'DAF')
  },
})


