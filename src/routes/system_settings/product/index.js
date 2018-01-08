
import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'


export default (store) => ({
  path : rootPath.product,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const product = require('./component/product').default;
      const reducer = require('./modules/product').default
      injectReducer(store, { key: 'product', reducer })
      cb(null, product)
    }, 'product')
  },
})


