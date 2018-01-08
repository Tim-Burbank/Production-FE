/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../config'


export default (store) => ({
  path : rootPath.authority_management,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const authority_management = require('./container/authority_management').default;
      const reducer = require('./modules/authority_management').default
      injectReducer(store, { key: 'authorityManagement', reducer })
      cb(null, authority_management)
    }, 'authority_management')
  },
})


