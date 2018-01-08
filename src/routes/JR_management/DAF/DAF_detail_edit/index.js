/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../../config'





export default (store) => ({
  path : rootPath.DAF_detail_edit+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const DAF_detail_edit = require('./container/DAF_detail_edit').default;
      const reducer = require('./modules/DAF_detail_edit').default
      injectReducer(store, { key: 'DAFDetailEdit', reducer })
      cb(null, DAF_detail_edit)
    }, 'DAF_detail_edit')
  },
})





