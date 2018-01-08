/**
 * Created by Maoguijun on 2017/12/08.
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
  Popconfirm,
  Upload
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
import {
    titles as _tit,
    vendorINV_tableField as _vendorINVT,
    client_location,
    client_INVType,
    host,
    payment_tableField as _PTF,
    taxRate
} from '../../../../config';
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
import {
  fetchVendorFP,
  newVendorFP,
  updateVendorFP,
  fetchVendorFPInfo,
  disabledVendorFP,
  enabledVendorFP,
  fetchPaymentId,
  newPayment,
  updatePayment
} from '../modules/vendorInvVat'
import { fetchApprover } from '../../../system_settings/approver/modules/approver'
import './vendorInvVat_.scss'
const Option = Select.Option
const Search = Input.Search
const FormItem = Form.Item
const TabPane = Tabs.TabPane
import moment from 'moment'

class VendorFP extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      currentPage: 1,
      itemId: null,
      payList: Immutable.fromJS([]), // payment list
      creList: Immutable.fromJS([]), // credit list
      vatIndex: 0, // vat数组的计数器
      isCanEdit: false, // 是否可以点击编辑,false表示可以点击
      tabKey: 'INV',
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
      // 上传
      picModal         : false,
      uploadId         : '',
      slideList        : [],
      isChange         : false, // 这个是带数据过来之后用来记录是否有人点击了,
      paymentNum:''
    }
  }

  componentWillMount () {
    const { dispatch, params, location } = this.props
    this.setState({ loading: true, loading_tab: true })
    let json = {
      limit: 13,
      offset: 0,
      vendorFPType: 'INV'
    }
    dispatch(fetchVendorFP(json)).then(e => {
      if (e.error) {
        message.error(e.error.message)
      } else {
        this.setState({
          loading: false,
          loading_tab: false,
          count: e.payload.count
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
    dispatch(fetchVendorFP(values)).then(e => {
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
  // 新增一行数据
  handleVatAdd = () => {
    // console.log('add',this.state.vatIndex)
    let _vatIndex = this.state.vatIndex
    this.setState({
      vatIndex: _vatIndex + 1,
      payList: Immutable.fromJS([
        ...this.state.payList.toArray(),
        {
          index: _vatIndex,
          operation: false,
          enterDate: moment().format('YYYY-MM-DD')
        }
      ]),
      isable: true,
      isCanEdit: true
    })
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
  // 修改一行状态为可编辑
  rowEdit = index => {
    const { isCanEdit } = this.state
    let _payList = this.state.payList.toJS()
    _payList[index].operation = false
    if (isCanEdit) {
      message.info('请先保存再编辑')
      return
    }
    this.setState({
      payList: Immutable.fromJS(_payList),
      isable: true,
      isCanEdit: true
    })
  }
  // 保存一行数据并新建一个payment//并统计数据
  rowSave = index => {
    const { dispatch } = this.props
    let _payList = this.state.payList.toJS()
    _payList[index].operation = true

    dispatch(newPayment(_payList[index])).then(e => {
      if (e.error) {
        message.error('save error')
      } else {
        message.success('save success')
        this.setState({
          payList:Immutable.fromJS(_payList)
        })
      }
    })
    // dispatch(updatePayment(_payList[index].id, _payList[index])).then(e => {
    //   if (e.error) {
    //   } else {
    //     message.success('save error')
    //     this.setState({
    //       payList:Immutable.fromJS(_payList)
    //     })
    //   }
    // })
  }

  vendorPO_detaile = value => {
    console.log(value)
    const { dispatch } = this.props
    dispatch(pathJump(`vendor_po/vendor_po_show/${value}`))
  }
  handleChange = (index, name, value) => {
    const { creList } = this.state
    let _creList = creList.toJS()
    _creList[index][name] = value
    this.setState({
      creList:Immutable.fromJS(_creList)
    })
  }

  // 上传
  beforeUpload = (file) => {
    console.log(643, file.type)
    const isPDF = file.type === 'application/pdf'
    if (!isPDF) {
      message.error('You can only upload PDF file!')
    }
    // const isLt2M = file.size / 1024 / 1024 < 10;
    // if (!isLt2M) {
    //   message.error('PDF must smaller than 10MB!');
    // }
    // return isPDF && isLt2M;
    return isPDF
  }
  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    })
  }

  handleSlideChange = ({ fileList }) => {
    console.log(672, fileList)
    this.setState({ slideList:fileList })
  }

  handlePicModal = () => {
    const { payList, paymentNum, uploadId, slideList } = this.state
    let _payList = payList.toJS()
    _payList[uploadId].filePath = slideList[0].response.obj
    this.setState({
      payList:Immutable.fromJS(_payList),
      slideList:[],
      picModal:false,
      uploadId:null
    })
  }
  deletePDF = (index) => {
    const { payList } = this.state
    let _payList = payList.toJS()
    _payList[index].filePath = ''
    this.setState({
      payList:Immutable.fromJS(_payList)
    })
  }

  // 处理paymentNum
  getPaymentNun = (string, index) => {
    let paymentIndex = parseInt(string.slice(7))
    // console.log(paymentIndex,index)
    let _paymentNum = paymentIndex + index + ''
    // console.log(348,_paymentNum)
    let leng = _paymentNum.length
    if (leng < 3) {
      for (let i = 0; i < 3 - leng; i++) {
        _paymentNum = 0 + _paymentNum
      }
    }
    return `payment${_paymentNum}`
  }
  payment = () => {
    const { tabKey } = this.state
    const { vpoFPS, dispatch } = this.props
    if (this.state[`${tabKey}Selected`].selectedRows.length === 0) {
      message.error(`请选择${tabKey}`)
      return
    }
    dispatch(fetchPaymentId()).then(e => {
      if (e.error) {
        message.error('payment Id 生成错误!')
      } else {
        // let _paymentNum = e.payload.slice(6)
        let _payList = this.state[`${tabKey}Selected`].selectedRows.map((item, index) => {
          let payment = {
            id: this.getPaymentNun(e.payload, index),
            bankName: '',
            accountNum: '',
            filePath: '',
            PECode:item.PECode,
            vendorCode:item.vendorCode,
            vendorName:item.vendorName,
            expectedDate:item.expectedDate,
            net: item.surplusAmount - item.surplusAmount,
            tax: item.surplusAmount,
            gross: item.surplusAmount,
            remark: '',
            vendorPoId: item.vendorPoId,
            vendorFPId: item.id,
            currencyId: item.currencyId,
            vendorBanks:item.vendorBanks,
            operation: false
          }

          if (item.vendorBanks.length < 2) {
            payment.bankName = item.vendorBanks[0].bankName
            payment.accountNum = item.vendorBanks[0].accountNum
          }

          return payment
        })
        console.log(_payList)
        this.setState({
          pay_modal: true,
          payList: Immutable.fromJS(_payList)
        })
      }
    })
  }
  selectBank = (value, record, index) => {
    const { payList } = this.state
    let _payList = payList.toJS()
    _payList[index].accountNum = value
    _payList[index].vendorBanks.forEach(item => {
      if (item.accountNum === value) {
        _payList[index].bankName = item.bankName
      }
    })
    this.setState({
      payList:Immutable.fromJS(_payList)
    })
  }
  // 计算gross 等
  calculate = (index = 1, name, value) => {
    const { creList } = this.state
    let _creList = creList.toJS()
    _creList[index][name] = value
    let obj = {
      ..._creList[index]
    }
    _creList[index] = {
      ..._creList[index],
      net:parseInt(obj.gross / (1 + parseFloat(obj.taxRate))),
      tax:obj.gross - parseInt(obj.gross / (1 + parseFloat(obj.taxRate)))
    }
    console.log(_creList)
    this.setState({
      creList:Immutable.fromJS(_creList)
    })
  }
  credit = () => {
    const { tabKey } = this.state
    const { dispatch, vpoFPS } = this.props
    console.log(this.state[`${tabKey}Selected`])
    if (this.state[`${tabKey}Selected`].selectedRows.length === 0) {
      message.error(`请选择有效的${tabKey}`)
      return
    }
    if (this.state[`${tabKey}Selected`].selectedRows.length > 1) {
      message.error(`只能选择一条${tabKey}`)
      return
    }
    let _vpoFPS = vpoFPS.toJS()
    let _creList = []
    _vpoFPS.forEach(item => {
      if (this.state[`${tabKey}Selected`].selectedRowKeys[0] === item.id) {
        _creList.push(item)
      }
    })
    _creList = _creList.map(item => {
      return ({
        ...item,
        operation:true
      })
    })
    let obj = _creList[0]
    _creList.push({
      vendorFPType: obj.vendorFPType,
      FPType: 'creditNote',
      num: '',
      INVDate: obj.INVDate,
      expectedDate: obj.expectedDate,
      payDate: obj.payDate,
      taxRate: obj.taxRate[0],
      net: parseInt(obj.balance / (1 + obj.taxRate[0])),
      tax: obj.balance - parseInt(obj.balance / (1 + obj.taxRate[0])),
      gross: obj.balance,
      paidAmount: 0,
      remark: '',
      vendorPoId: obj.vendorPoId,
      currencyId: obj.currencyId,
      vendorFPId:obj.id
    })

    console.log(_creList)
    this.setState({
      cre_modal: true,
      creList:Immutable.fromJS(_creList)
    })
  }
  // 提交credit
  handleCredit = () => {
    const { creList, tabKey } = this.state
    const { dispatch } = this.props
    let _creList = creList.toJS()
    let obj = _creList[1]
    if (obj.gross > _creList[0].balance) {
      message.error('gross 超出可冲抵金额')
      return
    }
    dispatch(newVendorFP(obj)).then(e => {
      if (e.error) {
        message.error(e.error.message)
      } else {
        message.success('credit success')
        this.setState({ loading: true, loading_tab: true })
        let json = {
          limit: 13,
          offset: 0,
          vendorFPType: tabKey
        }
        dispatch(fetchVendorFP(json)).then(e => {
          if (e.error) {
            message.error(e.error.message)
          } else {
            this.setState({
              loading: false,
              loading_tab: false,
              cre_modal:false,
              creList:Immutable.fromJS([])
            })
          }
        })
      }
    })
  }
  select = () => {
    const { vpoFPS } = this.props
    const { tabKey } = this.state
    let _vpoFPS = vpoFPS.toJS()

    let selectedRows = []
    _vpoFPS = _vpoFPS.filter(item => {
      console.log(item.expectedDate)
      if (!moment().isAfter(item.expectedDate, 'day') && item.FPType !== 'creditNote') {
        selectedRows.push(item.id)
        return Immutable.fromJS(item)
      }
    })
    console.log(_vpoFPS, selectedRows)
    this.setState({
      [`${tabKey}Selected`]: {
        selectedRowKeys: selectedRows,
        selectedRows: _vpoFPS
      }
    })
  }
  // tabs切换
  tabChange = val => {
    const { dispatch } = this.props
    let json = {
      limit: 13,
      offset: 0,
      vendorFPType: val
    }
    this.setState({ tabKey: val, loading_tab: true })
    dispatch(fetchVendorFP(json)).then(e => {
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

  render () {
    const { intl: { formatMessage }, location: { pathname }, vpoFPS, vendorsInfo, approver, count } = this.props
    const {
      flow_status,
      loading,
      loading_tab,
      currentPage,
      vat_modal,
      itemId,
      vendorType,
      payList,
      isable,
      isCanEdit,
      tabKey,
      pay_modal,
      cre_modal,
      creList,
      INVSelected,
      VATSelected,
      picModal,
      uploadId,
      slideList,
      paymentNum
    } = this.state
    // console.log('state',this.state)
    console.log('payList', payList && payList.toJS())
    // console.log(INVSelected, VATSelected)

    const renderOption = config => {
      // console.log(269,config)
      if (config) {
        return config.map(v => <Option key={v}>{v}</Option>)
      }
    }
    const uploadButton = (
      <Button>
        <Icon type="plus" />
        <span className="ant-upload-text">Upload</span>
      </Button>
    )

    const invColumns = [
      { dataIndex: _vendorINVT.INVDate },
      { dataIndex: _vendorINVT.vpoCode },
      {
        dataIndex: _vendorINVT.num,
        render: (text, record, index) => {
          if (record.get('targetNum')) {
            return (
              <div>
                <Row>{record.get('num')}</Row>
                <Row>({record.get('targetNum')})</Row>
              </div>
            )
          } else {
            return record.get('num')
          }
        }
      },
      {
        dataIndex: _vendorINVT.net,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('FPType') === 'creditNote') {
            return <span style={{ color: '#f00' }}>{formatMoney(text / 100 || 0)}</span>
          } else {
            return <span style={{ color: '#33CC33' }}>{formatMoney(text / 100 || 0)}</span>
          }
        }
      },
      { dataIndex: _vendorINVT.PECode },
      { dataIndex: _vendorINVT.vendorCode },
      {
        dataIndex: _vendorINVT.vendorName
      },
      {
        dataIndex: _vendorINVT.enterDate,
        render: (text, record, index) => record.get('creatDate')
      },
      { dataIndex: _vendorINVT.expectedDate },
      { dataIndex: _vendorINVT.payDate },
      {
        dataIndex: _vendorINVT.paidAmount,
        className: 'column-money',
        render: (text, record, index) => formatMoney(text / 100 || 0)
      },
      {
        dataIndex: _vendorINVT.balance,
        className: 'column-money',
        render: (text, record, index) => formatMoney(text / 100 || 0)
      },
      { dataIndex: _vendorINVT.remark }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `vendorINV_${item.dataIndex}` }),
      width: item.width ? item.width : 150
    }))

    const vatColumns = [
      { dataIndex: _vendorINVT.INVDate },
      { dataIndex: _vendorINVT.vpoCode },
      {
        dataIndex: _vendorINVT.num,
        render: (text, record, index) => {
          if (record.get('targetNum')) {
            return (
              <div>
                <Row>{record.get('num')}</Row>
                <Row>({record.get('targetNum')})</Row>
              </div>
            )
          } else {
            return record.get('num')
          }
        }
      },
      {
        dataIndex: _vendorINVT.net,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('FPType') === 'creditNote') {
            return <span style={{ color: '#f00' }}>{formatMoney(text / 100 || 0)}</span>
          } else {
            return <span style={{ color: '#33CC33' }}>{formatMoney(text / 100 || 0)}</span>
          }
        }
      },
      {
        dataIndex: _vendorINVT.tax,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('FPType') === 'creditNote') {
            return <span style={{ color: '#f00' }}>{formatMoney(text / 100 || 0)}</span>
          } else {
            return <span style={{ color: '#33CC33' }}>{formatMoney(text / 100 || 0)}</span>
          }
        }
      },
      {
        dataIndex: _vendorINVT.gross,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('FPType') === 'creditNote') {
            return <span style={{ color: '#f00' }}>{formatMoney(text / 100 || 0)}</span>
          } else {
            return <span style={{ color: '#33CC33' }}>{formatMoney(text / 100 || 0)}</span>
          }
        }
      },
      { dataIndex: _vendorINVT.PECode },
      { dataIndex: _vendorINVT.vendorCode },
      {
        dataIndex: _vendorINVT.vendorName
      },
      {
        dataIndex: _vendorINVT.enterDate,
        render: (text, record, index) => record.get('creatDate')
      },
      { dataIndex: _vendorINVT.expectedDate },
      { dataIndex: _vendorINVT.payDate },
      {
        dataIndex: _vendorINVT.paidAmount,
        className: 'column-money',
        render: (text, record, index) => formatMoney(text / 100 || 0)
      },
      {
        dataIndex: _vendorINVT.balance,
        className: 'column-money',
        render: (text, record, index) => formatMoney(text / 100 || 0)
      },
      { dataIndex: _vendorINVT.remark }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `vendorVAT_${item.dataIndex}` }),
      width: item.width ? item.width : 150
    }))

    const payColumns = [
      {
        dataIndex: _PTF.operation,
        show: true,
        fixed: 'left',
        width: 100,
        render: (text, record, index) => {
          return (
            <a onClick={() => this.rowSave(index)}>{formatMessage({ id: `save_btn` })}</a>
          )
        }
      },
      {
        dataIndex: _PTF.id,
        show: true
      },
      {
        dataIndex: _PTF.vendorPoId,
        show: true,
        title:
          tabKey === 'VAT'
            ? formatMessage({ id: `vendorVAT_${_PTF.id}` })
            : formatMessage({ id: `vendorINV_${_PTF.id}` })
      },
      {
        dataIndex: _PTF.net,
        title:
          tabKey === 'VAT'
            ? formatMessage({ id: `vendorVAT_${_PTF.net}` })
            : formatMessage({ id: `vendorINV_${_PTF.net}` }),
        show: true,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('operation')) {
            return formatMoney(text / 100 || 0)
          } else {
            return (
              <Input
                placeholder={' net'}
                style={{ width: '100%' }}
                defaultValue={text / 100 || 0}
                onBlur={e => this.editCell(index, 'net', e.target.value * 100)}
              />
            )
          }
        }
      },
      {
        dataIndex: _PTF.tax,
        title: formatMessage({ id: `vendorVAT_${_PTF.tax}` }),
        show: false,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('operation')) {
            return formatMoney(text / 100 || 0)
          } else {
            return (
              <Input
                placeholder={' tax'}
                style={{ width: '100%' }}
                defaultValue={text / 100 || 0}
                onBlur={e => this.editCell(index, 'tax', e.target.value * 100)}
              />
            )
          }
        }
      },
      {
        dataIndex: _PTF.gross,
        title: formatMessage({ id: `vendorVAT_${_PTF.gross}` }),
        show: false,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('operation')) {
            return formatMoney(text / 100 || 0)
          } else {
            return (
              <Input
                placeholder={' gross'}
                style={{ width: '100%' }}
                defaultValue={text / 100 || 0}
                onBlur={e => this.editCell(index, 'gross', e.target.value * 100)}
              />
            )
          }
        }
      },
      { dataIndex: _PTF.PECode, show: true },
      { dataIndex: _PTF.vendorCode, show: true },
      { dataIndex: _PTF.vendorName, show: true },
      { dataIndex: _PTF.bankName, show: true },
      {
        dataIndex: _PTF.accountNum,
        show: true,
        render: (text, record, index) => {
          let _record = record.toJS()
          return (
            <Select
              defaultValue={_record.accountNum}
              allowClear
              style={{ width: '100%' }}
              mode='combobox'
              onSelect={(value, option) => {
                this.selectBank(value, record, index)
              }}
            >
              {renderOption(_record.vendorBanks.map(item => item.accountNum))}
            </Select>
          )
        }
      },
      {
        dataIndex: _PTF.expectedDate,
        show: true,
        render: (text, record, index) => {
          if (record.get('operation')) {
            return text
          } else {
            return (
              <DatePicker
                style={{ width: '100%' }}
                defaultValue={text ? moment(text) : null}
                onChange={value => this.editCell(index, 'expectedDate', moment(value).format('YYYY-MM-DD'))}
              />
            )
          }
        }
      },
      {
        dataIndex: _PTF.filePath,
        show: true,
        render: (text, record, index) => {
          return text !== '' && text !== ' ' && text !== undefined && text !== null ? (
            <Popconfirm
              title='Are you sure to delete this PDF'
              okText={'OK'}
              cancelText={'Cancel'}
              onConfirm={() => this.deletePDF(index)}
              trigger='hover'
            >
              <a onClick={() => window.open(text)}>{formatMessage({ id: `check` })}</a>
            </Popconfirm>
          ) : (
            <a
              onClick={() => {
                this.setState({ picModal: true, uploadId: index, paymentNum:record.get('id') })
              }}
            >
              {formatMessage({ id: `upload` })}
            </a>
          )
        }
      },
      {
        dataIndex: _PTF.remark,
        show: true,
        render: (text, record, index) => {
          if (record.get('operation')) {
            return (
              <span>
                <div style={{ display: 'inline-block', marginRight: '15px' }}>
                  <Tooltip title={<p>{text}</p>}>
                    {text && text.length > 10 ? (
                      <span>
                        {text.substring(0, 10) + ' ··· '}
                        <Icon type='question-circle-o' />
                      </span>
                    ) : (
                      <span>{text}</span>
                    )}
                  </Tooltip>
                </div>
              </span>
            )
          } else {
            return (
              <Input
                placeholder={' remark'}
                style={{ width: '100%' }}
                defaultValue={text}
                onBlur={e => this.editCell(index, 'remark', e.target.value)}
              />
            )
          }
        }
      }
    ]
      .map(item => {
        if (item.title) {
          return {
            ...item,
            width: item.width ? item.width : 150
          }
        } else {
          return {
            ...item,
            title: formatMessage({ id: `payment_${item.dataIndex}` }),
            width: item.width ? item.width : 150
          }
        }
      })
      .filter(item => {
        if (item.show) {
          return item
        }
        if (!item.show && tabKey === 'VAT') {
          return item
        }
      })

    const creColumns = [
      // {
      //   dataIndex: _vendorINVT.operation,
      //   show: true,
      //   fixed: 'left',
      //   width: 100,
      //   render: (text, record, index) => {
      //     return <a onClick={() => this.rowSave(index)}>{formatMessage({ id: `save_btn` })}</a>
      //   }
      // },
      {
        dataIndex: _vendorINVT.num,
        show: true,
        title:
          tabKey === 'VAT'
            ? formatMessage({ id: `vendorVAT_${_vendorINVT.id}` })
            : formatMessage({ id: `vendorINV_${_vendorINVT.id}` }),
        render:(text, record, index) => {
          let _record = record.toJS()
          if (_record.operation) {
            return text
          } else {
            return (
              <Input
                placeholder={'VAT No.'}
                style={{ width: '100%' }}
                defaultValue={text}
                onBlur={e => this.editCell(index, 'num', e.target.value, 'creList')}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorINVT.taxRate,
        title: formatMessage({ id: `vendorVAT_${_vendorINVT.taxRate}` }),
        show: true,
        className: 'column-money',
        render: (text, record, index) => {
          let _record = record.toJS()
          if (record.get('operation')) {
            return formatMoney(_record.taxRate[0] || 0)
          } else {
            return (
              <Input
                placeholder={'taxrate'}
                style={{ width: '100%' }}
                value={text}
                onChange={e => this.handleChange(index, 'taxRate', e.target.value)}
                onBlur={e => {
                  // this.editCell(index, 'taxRate', e.target.value, 'creList')
                  this.calculate(index, 'taxRate', e.target.value)
                }}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorINVT.net,
        title: formatMessage({ id: `vendorVAT_${_vendorINVT.net}` }),
        show: false,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('operation')) {
            return formatMoney(text / 100 || 0)
          } else {
            return (
              <Input
                placeholder={' net'}
                style={{ width: '100%' }}
                value={text / 100 || 0}
                onChange={e => this.handleChange(index, 'net', e.target.value * 100)}
                onBlur={e => {
                  this.editCell(index, 'net', e.target.value * 100, 'creList')
                  // this.calculate(index, 'net', e.target.value * 100)
                }}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorINVT.tax,
        title: formatMessage({ id: `vendorVAT_${_vendorINVT.tax}` }),
        show: false,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('operation')) {
            return formatMoney(text / 100 || 0)
          } else {
            return (
              <Input
                placeholder={' tax'}
                style={{ width: '100%' }}
                value={text / 100 || 0}
                onChange={e => this.handleChange(index, 'tax', e.target.value * 100)}
                onBlur={e => {
                  this.editCell(index, 'tax', e.target.value * 100, 'creList')
                  // this.calculate(index, 'tax', e.target.value * 100)
                }}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorINVT.gross,
        title: formatMessage({ id: `vendorVAT_${_vendorINVT.gross}` }),
        show: true,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('operation')) {
            return formatMoney(text / 100 || 0)
          } else {
            return (
              <Input
                placeholder={' gross'}
                style={{ width: '100%' }}
                value={text / 100 || 0}
                onChange={e => this.handleChange(index, 'gross', e.target.value * 100)}
                onBlur={e => {
                  // this.editCell(index, 'gross', e.target.value * 100, 'creList')
                  this.calculate(index, 'gross', e.target.value * 100)
                }}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorINVT.balance,
        show:true,
        render:(text, record, index) => {
          return formatMoney(text / 100 || '')
        }
      },
      {
        dataIndex: _vendorINVT.INVDate,
        show: true,
        render: (text, record, index) => {
          if (record.get('operation')) {
            return text
          } else {
            return (
              <DatePicker
                style={{ width: '100%' }}
                defaultValue={text ? moment(text) : null}
                onChange={value => this.editCell(index, 'INVDate', moment(value).format('YYYY-MM-DD'), 'creList')}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorINVT.enterDate,
        show: true,
        render: (text, record, index) => {
          if (record.get('operation')) {
            return text
          } else {
            return (
              <DatePicker
                style={{ width: '100%' }}
                defaultValue={text ? moment(text) : null}
                onChange={value => this.editCell(index, 'enterDate', moment(value).format('YYYY-MM-DD'), 'creList')}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorINVT.remark,
        show: true,
        render: (text, record, index) => {
          if (record.get('operation')) {
            return (
              <span>
                <div style={{ display: 'inline-block', marginRight: '15px' }}>
                  <Tooltip title={<p>{text}</p>}>
                    {text && text.length > 10 ? (
                      <span>
                        {text.substring(0, 10) + ' ··· '}
                        <Icon type='question-circle-o' />
                      </span>
                    ) : (
                      <span>{text}</span>
                    )}
                  </Tooltip>
                </div>
              </span>
            )
          } else {
            return (
              <Input
                placeholder={' remark'}
                style={{ width: '100%' }}
                defaultValue={text}
                onBlur={e => this.editCell(index, 'remark', e.target.value, 'creList')}
              />
            )
          }
        }
      }
    ]
      .map(item => {
        if (item.title) {
          return {
            ...item,
            width: item.width ? item.width : 150
          }
        } else {
          return {
            ...item,
            title: formatMessage({ id: `vendorINV_${item.dataIndex}` }),
            width: item.width ? item.width : 150
          }
        }
      })
      .filter(item => {
        if (item.show) {
          return item
        }
        if (!item.show && tabKey === 'VAT') {
          return item
        }
      })

    const rowSelectionINV = {
      selectedRowKeys: INVSelected.selectedRowKeys,
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
      selectedRowKeys: VATSelected.selectedRowKeys,
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

    return (
      <Row>
        <SecondTitle title={formatMessage({ id: `${_tit.vendorInvVat}` })} />
        {/* <Card bordered={false}  style={{ width: "100%",marginTop:61 }}>
        </Card> */}
        <Row style={{ marginTop: 61 }}>
          <Button type='primary' size='large' onClick={() => this.payment()}>
            {'Payment'}
          </Button>
          <Button style={{ marginLeft: 16 }} type='primary' size='large' onClick={() => this.credit()}>
            {'Credit'}
          </Button>
          <Button style={{ marginLeft: 16 }} size='large' onClick={() => this.select()}>
            {'勾选当前可付款的 INV/VAT'}
          </Button>
        </Row>
        <Tabs activeKey={tabKey} onChange={val => this.tabChange(val)}>
          <TabPane tab='INV' key='INV'>
            <ImmutableTable
              rowSelection={rowSelectionINV}
              // selectedRowKeys={INVSelected.selectedRowKeys}
              style={{ marginTop: 16 }}
              loading={loading_tab}
              columns={invColumns}
              dataSource={vpoFPS}
              rowKey={record => record.get('id')}
              pagination={{ pageSize: 20, total: count, showQuickJumper: true }}
              bordered
              scroll={{ x: 1600 }}
            />
          </TabPane>
          <TabPane tab='VAT' key='VAT'>
            <ImmutableTable
              rowSelection={rowSelectionVAT}
              // selectedRowKeys={INVSelected.selectedRowKeys}
              style={{ marginTop: 16 }}
              loading={loading_tab}
              columns={vatColumns}
              dataSource={vpoFPS}
              rowKey={record => record.get('id')}
              pagination={{ pageSize: 20, total: count, showQuickJumper: true }}
              bordered
              scroll={{ x: 2000 }}
            />
          </TabPane>
        </Tabs>
        <Modal
          visible={pay_modal}
          title={formatMessage({ id: 'payment' })}
          maskClosable={false}
          width={1200}
          className={'vatModal'}
          onCancel={() => this.setState({ pay_modal: false, itemId: null })}
          footer={
            <Row>
              <Button onClick={() => this.setState({ pay_modal: false, itemId: null })}>
                {formatMessage({ id: 'back' })}
              </Button>
            </Row>
          }
        >
          <Row style={{ marginTop: 8 }}>
            <ImmutableTable
              pagination={false}
              columns={payColumns}
              dataSource={payList}
              ref={t => (this.tabele = t)}
              scroll={tabKey === 'VAT' ? { x: 2050 } : { x: 1750 }}
              rowKey={record => `pay_${record.get('id')}`}
              bordered
            />
          </Row>
        </Modal>
        <Modal
          visible={cre_modal}
          title={formatMessage({ id: 'credit' })}
          maskClosable={false}
          width={1200}
          className={'vatModal'}
          onOk={() => this.handleCredit()}
          onCancel={() => this.setState({ cre_modal: false, itemId: null })}
          // footer={
          //   <Row>
          //     <Button onClick={() => this.setState({ cre_modal: false, itemId: null })}>
          //       {formatMessage({ id: 'back' })}
          //     </Button>
          //   </Row>
          // }
        >
          <Row style={{ marginTop: 8 }}>
            <ImmutableTable
              pagination={false}
              columns={creColumns}
              dataSource={creList}
              ref={t => (this.tabele = t)}
              scroll={tabKey === 'VAT' ? { x: 1450 } : { x: 1150 }}
              rowKey={record => `cre_${record.get('id')}`}
              bordered
            />
          </Row>
        </Modal>
        <Modal
          visible={picModal}
          onCancel={() => this.setState({ uploadId:null, picModal:false, slideList:[] })}
          title={formatMessage({ id:'uploadVat' })}
          onOk={this.handlePicModal}
          maskClosable={false}
          width={500}
        >
          <Row style={{ marginTop:50, marginBottom:50 }}>
            <Upload
              // listType="picture-card"
              action={`${host}/common/upload/?target=payment&name=${paymentNum}`}
              beforeUpload={this.beforeUpload}
              onPreview={this.handlePreview}
              onChange={this.handleSlideChange}
              fileList={slideList}
              name='photo'
            >
              { slideList.length >= 1 ? null : uploadButton}
            </Upload>
          </Row>
        </Modal>
      </Row>
    )
  }
}
VendorFP.propTypes = {
  pathJump: React.PropTypes.func
}

const mapStateToProps = state => {
  console.log('567', state, state && state.toJS())
  let _vpoFPS = []
  if (state.getIn(['vendorInvVat', 'vendorFPS'])) {
    _vpoFPS = state
      .getIn(['vendorInvVat', 'vendorFPS'])
      .toJS()
      .map(item => {
        if (item.vendorFPType === 'VAT') {
          item.balance = item.gross - item.paidAmount
        } else if (item.vendorFPType === 'INV') {
          item.balance = item.net - item.paidAmount
        }
        console.log(692, item)
        return { ...item }
      })
  }
  return {
    // vpoFPS: state.getIn(["vendorInvVat", "vendorFPS"]),
    vpoFPS: Immutable.fromJS(_vpoFPS),
    count: state.getIn(['vendorInvVat', 'count'])
    // vendorsInfo: state.getIn(["vendorInvVat", "vendorsInfo"])
  }
}

export default injectIntl(connect(mapStateToProps)(VendorFP))

// const WrappedSystemUser = Form.create()();
