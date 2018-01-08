
import { injectReducer } from 'store/reducers'
import { rootPath,chilPath } from '../../../config'



export default (store) => ({
  path : rootPath.jobCompletion,
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const jobCompletion = require('./component/jobCompletion').default;
      const reducer = require('./modules/jobCompletion').default
      injectReducer(store, { key: 'jobCompletion', reducer })
      cb(null, jobCompletion)
    }, 'jobCompletion')
  },
})


