/**
 * Created by Yurek on 2017/8/21.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../../config'



export default (store) => ({
  path : rootPath.group_detail+"/:id",
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const group_detail = require('./container/group_detail').default;
      cb(null, group_detail)
    }, 'group_detail')
  },
})


