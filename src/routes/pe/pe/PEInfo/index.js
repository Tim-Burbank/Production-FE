/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../../config'




export default (store) => ({
  path : rootPath.PE_details+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const PE_details = require('./component/PE_details').default;
      // const reducer = require('./modules/PE_details').default
      // injectReducer(store, { key: 'PEDetails', reducer })
      cb(null, PE_details)
    }, 'PEDetails')
  },
})




