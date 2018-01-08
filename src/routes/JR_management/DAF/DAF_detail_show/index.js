/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../../config'





export default (store) => ({
  path : rootPath.DAF_detail_show+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const DAF_detail_show = require('./container/DAF_detail_show').default;
      const reducer = require('./modules/DAF_detail_show').default
      injectReducer(store, { key: 'DAFDetailEdit', reducer })
      cb(null, DAF_detail_show)
    }, 'DAF_detail_show')
  },
})





