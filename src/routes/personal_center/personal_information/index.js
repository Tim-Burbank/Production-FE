/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.personal_information,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const requisition = require('./container/personal_information').default;
      const reducer = require('./modules/personal_information').default
      injectReducer(store, { key: 'personalInformation', reducer })
      cb(null, requisition)
    }, 'personal_information')
  },
})


