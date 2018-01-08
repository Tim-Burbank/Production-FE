/**
 * Created by Maoguijun on 2017/10/13.
 */

import React from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'
import {
  Row,
  message,
  Spin,
  Button,
  Pagination,
  Modal,
  Col,
  Select,
  Input,
  DatePicker,
  Timeline,
  Switch,
  Form,
  Icon,
  Tooltip,
  Card,
  Tabs,
  Checkbox
} from 'antd'
import { connect } from 'react-redux'
import { ImmutableTable } from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import { Link } from 'react-router'
import { pathJump } from '../../../../utils/'

// import TopSearch from '../../../../components/search/topSearch'
import SecondTitle from '../../../../components/secondTitle/secondTitle'
import Title from '../../../../components/title/title'
import { titles as _tit, payment_tableField as _paymentINVT, client_location, client_INVType } from '../../../../config'
import { WORLD_COUNTRY } from '../../../../country_config'
import Immutable, { List } from 'immutable'
import {
  formatDate,
  formatMoney,
  configDirectory,
  configDirectoryObject,
  configCate,
  div
} from '../../../../utils/formatData'
import { getFormRequired } from '../../../../utils/common'
import { fetchPayment, newPayment, altPayment, fetchPaymentInfo, oprationPayment } from '../modules/payment'
import { fetchApprover } from '../../../system_settings/approver/modules/approver'
import './payment_.scss'
const Option = Select.Option
const Search = Input.Search
const FormItem = Form.Item
const TabPane = Tabs.TabPane
import moment from 'moment'
// import _ from 'lodash'

class Payment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      currentPage: 1,
      itemId: null,
      vatList: Immutable.fromJS([]),
      vatIndex: 0, // vat数组的计数器
      isCanEdit: false, // 是否可以点击编辑,false表示可以点击
      tabKey: 'INV',
      check: false,
      INVSelected: {
        selectedRowKeys: [],
        selectedRows: []
      },
      VATSelected: {
        selectedRowKeys: [],
        selectedRows: []
      },
      pay_modal: false,
      cre_modal: false,
      issuesChecked: true,
      // 操作值
      flowStatus_in: [
        'toSubmit',
        'toApproveByFM',
        'refusedByAD',
        'toApproveByFD',
        'refusedByFM',
        'toExport',
        'refusedByFD',
        'toPay',
        'failed',
        'updatedToExport',
        'abandoned'
      ].toString()
    }
  }

  componentWillMount () {
    const { dispatch, params, location } = this.props
    const { flowStatus_in, issuesChecked } = this.state
    this.setState({ loading: true, loading_tab: true })
    let json = {
      limit: 13,
      offset: 0,
      'vendorFP.vendorFPType': 'INV',
      mineIssues: issuesChecked,
      flowStatus_in: flowStatus_in
    }
    dispatch(fetchPayment(json)).then(e => {
      if (e.error) {
        message.error(e.error.message)
      } else {
        this.setState({
          loading: false,
          count: e.payload.count,
          loading_tab: false
        })
      }
    })
  }

  onFetch = (value, limit, offset, cur = 1, p = 0) => {
    this.setState({ loading: true, currentPage: cur })
    const { dispatch } = this.props
    let values = {
      ...value,
      limit: limit,
      offset: offset
    }
    dispatch(fetchPayment(values)).then(e => {
      if (e.error) {
        message.error(e.error.message)
        this.setState({ loading: false })
      } else {
        // 判断从哪里发起的请求
        let count = 0
        if (!p) {
          count = e.payload.objs.length || 0
        } else {
          count = e.payload.count
        }
        this.setState({
          loading: false,
          count: count
        })
      }
    })
  }

  paymentPO_detaile = value => {
    console.log(value)
    const { dispatch } = this.props
    dispatch(pathJump(`payment_po/payment_po_show/${value}`))
  }
  // 修改单元格的数据
  editCell = (index, name, value, list = 'payList') => {
    console.log(335, index, name, value)
    let _list = this.state[list].toJS()
    _list[index][name] = value
    this.setState({
      [list]: Immutable.fromJS(_list)
    })
  }

  payComplite = () => {
    const { tabKey } = this.state
    let payList = this.state[`${tabKey}Selected`].selectedRows
    if (payList.length === 0) {
      message.error('请选择合适的payment', 0.5)
      return
    }
    payList = payList.map(item => ({
      ...item.toJS(),
      payDate: moment().format('YYYY-MM-DD')
    }))
    console.log(161, payList)
    this.setState({
      payList: Immutable.fromJS(payList),
      pay_modal: true
    })
  }
  // tabs切换
  tabChange = val => {
    const { dispatch } = this.props
    const { issuesChecked, flowStatus_in, check } = this.state
    let json = {
      limit: 13,
      offset: 0,
      'vendorFP.vendorFPType': val,
      mineIssues: issuesChecked,
      flowStatus_in: check ? '' : flowStatus_in
    }
    this.setState({ tabKey: val, loading_tab: true })
    dispatch(fetchPayment(json)).then(e => {
      if (e.error) {
        message.error(e.error.message)
      } else {
        this.setState({
          loading: false,
          count: e.payload.count,
          loading_tab: false
        })
      }
    })
  }
  // 是否展示所有数据
  issuesCheck = string => {
    const { issuesChecked, tabKey, check, flowStatus_in } = this.state
    const { dispatch } = this.props
    let _issuesChecked = issuesChecked
    let _check = check
    if (string === 'issuesChecked') {
      _issuesChecked = !issuesChecked
    } else if (string === 'check') {
      _check = !check
    }
    let json = {
      limit: 13,
      offset: 0,
      'vendorFP.vendorFPType': tabKey,
      mineIssues: _issuesChecked,
      flowStatus_in: _check ? '' : flowStatus_in
    }
    this.setState({ loading_tab: true })
    dispatch(fetchPayment(json)).then(e => {
      if (e.error) {
        message.error(e.error.message)
      } else {
        this.setState({
          issuesChecked: _issuesChecked,
          check: _check,
          count: e.payload.count,
          loading_tab: false
        })
      }
    })
  }

  // opration
  operatePayment = (operation, list) => {
    const { dispatch } = this.props
    const { tabKey } = this.state
    let arr = []
    let json = { payments: [] }
    if (list) {
      json.payments = list.toJS()
      if (json.payments === 0) {
        message.error('请选择适合的payment', 0.5)
        return
      }
    } else {
      if (arr.length === 0) {
        message.error('请选择适合的payment', 0.5)
        return
      }
      arr = this.state[`${tabKey}Selected`].selectedRows
      arr.forEach(item => {
        json.payments.push({
          id: item.get('id'),
          payDate: ''
        })
      })
    }
    console.log(operation, json)
    dispatch(oprationPayment(operation, json)).then(e => {
      if (e.error) {
        message.error(e.error.message)
      } else {
        dispatch(fetchPayment()).then(e => {
          if (e.error) {
            message.error('pls flesh')
          } else {
            message.success('success')
            this.setState({
              pay_modal: false,
              payList: Immutable.fromJS([])
            })
          }
        })
      }
    })
  }

  render () {
    const {
      intl: { formatMessage },
      location: { pathname },
      payment,
      paymentsInfo,
      approver,
      count,
      userInfo
    } = this.props
    const {
      flow_status,
      loading,
      currentPage,
      vat_modal,
      itemId,
      paymentType,
      payList,
      isable,
      isCanEdit,
      tabKey,
      pay_modal,
      cre_modal,
      creList,
      check,
      loading_tab,
      issuesChecked
    } = this.state
    // console.log('state',this.state)
    // console.log("vatList",vatList&&vatList.toJS())

    const invColumns = [
      {
        dataIndex: _paymentINVT.flowStatus,
        render: text => formatMessage({ id: text })
      },
      { dataIndex: _paymentINVT.id },
      {
        dataIndex: _paymentINVT.vpoCode,
        render: (text, record, index) => {
          let _record = record.toJS()
          return _record.vendorPo.code
        }
      },
      {
        dataIndex: _paymentINVT.vendorFPNum,
        render: (text, record, index) => {
          let _record = record.toJS()
          return _record.vendorFP.num
        }
      },
      {
        dataIndex: _paymentINVT.gross,
        className: 'column-money',
        render: (text, record, index) => {
          return formatMoney(text / 100 || 0)
        }
      },
      {
        dataIndex: _paymentINVT.peCode
      },
      {
        dataIndex: _paymentINVT.vendorCode
      },
      {
        dataIndex: _paymentINVT.vendorName
      },
      {
        dataIndex: _paymentINVT.bankName
      },
      {
        dataIndex: _paymentINVT.accountNum
      },
      {
        dataIndex: _paymentINVT.expectedDate
      },
      {
        dataIndex: _paymentINVT.payDate
      },
      {
        dataIndex: _paymentINVT.filePath,
        render: (text, record, index) => {
          return (
            <Button style={{ marginLeft: 16 }} onClick={() => window.open(record.get('filePath'))}>
              {formatMessage({ id: 'check' })}
            </Button>
          )
        }
      },
      {
        dataIndex: _paymentINVT.remark
      }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `paymentINV_${item.dataIndex}` }),
      width: item.width ? item.width : 150
    }))

    const vatColumns = [
      { dataIndex: _paymentINVT.flowStatus,render: text => formatMessage({ id: text }) },
      { dataIndex: _paymentINVT.id },
      {
        dataIndex: _paymentINVT.vpoCode,
        render: (text, record, index) => {
          let _record = record.toJS()
          return _record.vendorPo.code
        }
      },
      {
        dataIndex: _paymentINVT.vendorFPNum,
        render: (text, record, index) => {
          let _record = record.toJS()
          return _record.vendorFP.num
        }
      },
      {
        dataIndex: _paymentINVT.net,
        className: 'column-money',
        render: (text, record, index) => {
          return formatMoney(text / 100 || 0)
        }
      },
      {
        dataIndex: _paymentINVT.tax,
        className: 'column-money',
        render: (text, record, index) => {
          return formatMoney(text / 100 || 0)
        }
      },
      {
        dataIndex: _paymentINVT.gross,
        className: 'column-money',
        render: (text, record, index) => {
          return formatMoney(text / 100 || 0)
        }
      },
      {
        dataIndex: _paymentINVT.peCode
      },
      {
        dataIndex: _paymentINVT.vendorCode
      },
      {
        dataIndex: _paymentINVT.vendorName
      },
      {
        dataIndex: _paymentINVT.accountNum
      },
      {
        dataIndex: _paymentINVT.expectedDate
      },
      {
        dataIndex: _paymentINVT.payDate
      },
      {
        dataIndex: _paymentINVT.filePath,
        render: (text, record, index) => {
          return (
            <Button style={{ marginLeft: 16 }} onClick={() => window.open(record.get('filePath'))}>
              {formatMessage({ id: 'check' })}
            </Button>
          )
        }
      },
      {
        dataIndex: _paymentINVT.remark
      }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `paymentVAT_${item.dataIndex}` }),
      width: item.width ? item.width : 150
    }))

    const payColumns = [
      {
        dataIndex: _paymentINVT.vendorName
      },
      {
        dataIndex: _paymentINVT.vendorCode
      },
      {
        dataIndex: _paymentINVT.peCode
      },
      {
        dataIndex: _paymentINVT.vpoCode,
        render: (text, record, index) => {
          let _record = record.toJS()
          return _record.vendorPo.code
        }
      },
      {
        dataIndex: _paymentINVT.vendorFPNum,
        render: (text, record, index) => {
          let _record = record.toJS()
          return _record.vendorFP.num
        }
      },
      {
        dataIndex: _paymentINVT.gross,
        className: 'column-money',
        render: (text, record, index) => {
          return formatMoney(text / 100 || 0)
        }
      },
      {
        dataIndex: _paymentINVT.payDate,
        render: (text, record, index) => (
          <DatePicker
            style={{ width: '100%' }}
            defaultValue={text ? moment(text) : null}
            onChange={value => this.editCell(index, 'payDate', moment(value).format('YYYY-MM-DD'))}
          />
        )
      }
    ].map(item => {
      if (item.title) {
        return {
          ...item,
          width: item.width ? item.width : 150
        }
      } else {
        return {
          ...item,
          title: formatMessage({ id: `paymentINV_${item.dataIndex}` }),
          width: item.width ? item.width : 150
        }
      }
    })

    const rowSelectionINV = {
      onChange: (selectedRowKeys, selectedRows) => {
        let INVSelected = {
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows
        }
        console.log(selectedRowKeys)
        this.setState({
          INVSelected
        })
      }
    }
    const rowSelectionVAT = {
      onChange: (selectedRowKeys, selectedRows) => {
        let VATSelected = {
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows
        }
        this.setState({
          VATSelected
        })
      }
    }
    // 判断是否有权限
    const hasAttr = (userInfo, string) => {
      let flag = false
      userInfo.map(item => {
        if (item.id === string) {
          flag = true
        }
      })
      return flag
    }

    const getRoles = agree => {
      const { userInfo } = this.props
      let _userInfo = userInfo.toJS()
      if (!_userInfo) {
        message.error('no user info, pls login again!')
        return
      }
      if (!_userInfo.roles.length === 0) {
        message.error('you have no qualifications')
        return
      }
      let roles = _userInfo.roles
      console.log(roles)

      let aaa = hasAttr(roles, 'Finance-Manager')
      console.log('aaa', aaa)

      let operation = ''
      if (hasAttr(roles, 'Finance-Manager')) {
        operation = 'fm' + agree
      } else if (hasAttr(roles, 'Finance-Director')) {
        operation = 'fd' + agree
      } else if (hasAttr(roles, 'Account-Director')) {
        operation = 'ad' + agree
      }
      return operation
    }

    return (
      <Row>
        <SecondTitle title={formatMessage({ id: `${_tit.payment}` })} />
        <Card style={{ width: '100%', marginTop: 61 }}>
          <Row>
            <Button
              type={issuesChecked ? 'default' : 'primary'}
              size='large'
              onClick={() => this.issuesCheck('issuesChecked')}
            >
              {'My Issues'}
            </Button>
            <Button
              style={{ marginLeft: 16 }}
              type='primary'
              size='large'
              onClick={() => {
                let opreation = getRoles('Approve')
                console.log('opreation', opreation)
                this.operatePayment(opreation)
              }}
            >
              {'批准'}
            </Button>
            <Button
              style={{ marginLeft: 16 }}
              size='large'
              onClick={() => {
                let opreation = getRoles('Refuse')
                console.log('opreation', opreation)
                this.operatePayment(opreation)
              }}
            >
              {'拒绝'}
            </Button>
            <Button
              style={{ marginLeft: 16 }}
              type='primary'
              size='large'
              onClick={() => this.operatePayment('exportFP')}
            >
              {'导出'}
            </Button>
            <Button style={{ marginLeft: 16 }} type='primary' size='large' onClick={() => this.payComplite()}>
              {'付款成功'}
            </Button>
            <Button style={{ marginLeft: 16 }} type='primary' size='large' onClick={() => this.operatePayment('fail')}>
              {'付款失败'}
            </Button>
            <Button
              style={{ marginLeft: 16 }}
              type='primary'
              size='large'
              onClick={() => this.operatePayment('update')}
            >
              {'已修改'}
            </Button>
            <Checkbox style={{ marginLeft: 16 }} checked={check} onChange={e => this.issuesCheck('check')}>
              {'付款成功'}
            </Checkbox>
          </Row>
        </Card>
        <Tabs activeKey={tabKey} onChange={val => this.tabChange(val)}>
          <TabPane tab='INV' key='INV'>
            <ImmutableTable
              rowSelection={rowSelectionINV}
              style={{ marginTop: 16 }}
              loading={loading_tab}
              columns={invColumns}
              dataSource={payment}
              rowKey={record => record.get('id')}
              pagination={{ pageSize: 20, total: count, showQuickJumper: true }}
              bordered
              scroll={{ x: 2100 }}
            />
          </TabPane>
          <TabPane tab='VAT' key='VAT'>
            <ImmutableTable
              rowSelection={rowSelectionVAT}
              style={{ marginTop: 16 }}
              loading={loading_tab}
              columns={vatColumns}
              dataSource={payment}
              rowKey={record => record.get('id')}
              pagination={{ pageSize: 20, total: count, showQuickJumper: true }}
              bordered
              scroll={{ x: 2400 }}
            />
          </TabPane>
        </Tabs>
        <Modal
          visible={pay_modal}
          title={formatMessage({ id: 'payment' })}
          maskClosable={false}
          width={1200}
          className={'vatModal'}
          onOk={() => this.operatePayment('pay', payList)}
          onCancel={() => this.setState({ pay_modal: false, itemId: null })}
        >
          <Row style={{ marginTop: 8 }}>
            <ImmutableTable
              pagination={false}
              columns={payColumns}
              dataSource={payList}
              ref={t => (this.tabele = t)}
              scroll={{ x: 1100 }}
              rowKey={record => `pay_${record.get('index')}`}
              bordered
            />
          </Row>
        </Modal>
      </Row>
    )
  }
}
Payment.propTypes = {
  pathJump: React.PropTypes.func
}

const mapStateToProps = state => {
  console.log('567', state, state && state.toJS())
  return {
    payment: state.getIn(['payment', 'payment']),
    count: state.getIn(['payment', 'count']),
    paymentInfo: state.getIn(['payment', 'paymentInfo']),
    userInfo: state.getIn(['userInfo', 'userLoginInfo'])
  }
}

export default injectIntl(connect(mapStateToProps)(Payment))

// const WrappedSystemUser = Form.create()();
