/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../../config'




export default (store) => ({
  path : rootPath.JR_details+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const JR_details = require('./component/JR_details').default;
      const reducer = require('./modules/JR_details').default
      // injectReducer(store, { key: 'JRDetails', reducer })
      cb(null, JR_details)
    }, 'JRDetails')
  },
})




