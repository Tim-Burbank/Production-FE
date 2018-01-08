
import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../../config'





export default (store) => ({
  path : rootPath.product_details+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const product_details = require('./component/product_details').default;
      const reducer = require('./modules/product_details').default
      injectReducer(store, { key: 'productInfo', reducer })
      cb(null, product_details)
    }, 'product_details')
  },
})





