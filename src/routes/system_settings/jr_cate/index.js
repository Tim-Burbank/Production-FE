/**
 * Created by Yurek on 2017/10/16.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.jr_cate,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const jr_cate = require('./component/jr_cate').default;
      const reducer = require('./modules/jr_cate').default
      injectReducer(store, { key: 'jr', reducer })
      cb(null, jr_cate)
    }, 'jr_cate')
  },
})


