/**
 * Created by Yurek on 2017/7/11.
 */

import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../../config'





export default (store) => ({
  path : rootPath.vendorPoShow+'/:id',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const vendorPoShow = require('./container/vendorPoShow').default;
      const reducer = require('./modules/vendorPoShow').default
      injectReducer(store, { key: 'vendorPoShow', reducer })
      cb(null, vendorPoShow)
    }, 'vendorPoShow')
  },
})





