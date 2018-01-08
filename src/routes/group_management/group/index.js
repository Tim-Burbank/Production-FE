
import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'



export default (store) => ({
  path : rootPath.group,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const group = require('./container/group').default;
      const reducer = require('./modules/group').default
      injectReducer(store, { key: 'group', reducer })
      cb(null, group)
    }, 'group')
  },
})


