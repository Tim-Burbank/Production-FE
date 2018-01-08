/**
 * Created by Maoguijun on 2017/12/06.
 */

import React, { PureComponent } from 'react'
import { injectIntl } from 'react-intl'
import {
  Badge,
  Timeline,
  Form,
  InputNumber,
  Radio,
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
  Upload,
  Icon,
  Tooltip,
  Menu,
  Tabs,
  Card
} from 'antd'
import { connect } from 'react-redux'
import { ImmutableTable } from '../../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../../components/antd/SimpleForm'
import { Link } from 'react-router'
import { pathJump, ifFin } from '../../../../../utils/'
import TopSearch from '../../../../../components/search/topSearch'

// import Title from "../../../../../components/title/title";

import SecondTitle from '../../../../../components/secondTitle/secondTitle'
import {
  host,
  titles as _tit,
  vendorPO_tableField as _venDeT,
  vendorPO_type as _clientPOType,
  currency as _cur,
  vendorTypeArr,
  location_,
  vendorFP_,
  taxRate,
  vendorType
} from '../../../../../config'
import { WORLD_COUNTRY } from '../../../../../country_config'
import Immutable from 'immutable'
import {
  formatDate,
  formatMoney,
  configDirectory,
  configDirectoryObject,
  configCate,
  renderPic,
  divHundred,
  add,
  sub,
  mul,
  div
} from '../../../../../utils/formatData'
import { getFormRequired } from '../../../../../utils/common'
import { fetchVendorPOInfo, updateVendorPO } from '../../vendor_PO_show/modules/vendorPoShow'
import {
  fetchRequisition,
  newRequisition,
  altRequisition,
  fetchRequisitionInfo
} from '../../../../personal_center/requisition/modules/requisition'
import './vendorPoShow_.scss'
const Option = Select.Option
const Search = Input.Search
const RadioGroup = Radio.Group
const FormItem = Form.Item

const TabPane = Tabs.TabPane
const { MonthPicker, RangePicker } = DatePicker
import moment from 'moment'
import '../../../../../components/antd/SimpleForm.css'
import classNames from 'react-draggable'

class VendorPoShow extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      previewImage: '',
      loading: false,
      currentPage: 1,
      modal: false,
      modalLoad: false,
      itemId: null,
      modal_t: false,
      status: false,
      modalTLoad: false,
      vendorType: '',
      location: '',
      vendorFP: '',
      flowStatus: '',
      flowStatus_state: '',
      comments: '',
      cartesis: '',
      adpCode: '',
      operation_modal: false,
      operationType: ''
    }
  }
  componentWillMount = () => {
    const { dispatch, params, location } = this.props
    dispatch(fetchVendorPOInfo(params.id)).then(e => {
      if (e.payload) {
        // console.log(118,e.payload.vendor.flowStatus)
        this.setState({
          flowStatus: e.payload.flowStatus
        })
      }
    })
  }

  openPSD = v => {
    window.open(v)
  }
  operationVendor = () => {
    const { operationType, adCode } = this.state
    const { dispatch, params } = this.props
    let json = {
      operation: operationType,
      code: adCode
    }
    dispatch(updateVendorPO(params.id, json)).then(e => {
      if (e.error) {
        message.error(e.error.message)
      } else {
        message.success('success')
        this.setState({
          operation_modal: false,
          operationType: '',
          adCode: ''
        })
      }
    })
  }

  render () {
    const {
      intl: { formatMessage },
      location: { pathname, search },
      count,
      clientPO,
      vendorPoInfo,
      vendorLogs,
      params,
      bankInfo
    } = this.props
    const {
      currency,
      modalLoad,
      itemId,
      current,
      vendorType,
      location,
      filePath,
      vendorFP,
      flowStatus,
      flowStatus_state,
      operation_modal,
      adCode
    } = this.state
    console.log('flowStatus', flowStatus)
    console.log('search', search)
    const { getFieldDecorator, getFieldValue } = this.props.form

    console.log('state', this.state)
    console.log('props', this.props)
    console.log('vendorPoInfo', vendorPoInfo && vendorPoInfo.toJS())

    // Basic Info.
    const formColumns1 = [
      { dataIndex: _venDeT.vendorId, deep: ['vendorDetail', 'nameEN'], span: 12 },
      { dataIndex: _venDeT.code, span: 12 },
      {
        dataIndex: _venDeT.vendorAddress,
        deep: ['vendorDetail', 'addressEN'],
        span: 12
      },
      {
        dataIndex: _venDeT.clientId,
        span: 12,
        deep: ['clientDetail', 'nameEN']
      },
      {
        dataIndex: _venDeT.placedToId,
        span: 12,
        deep: ['placedTo', 'nameEN']
      },
      { dataIndex: _venDeT.PEId, span: 12 },
      { dataIndex: _venDeT.address, span: 12 },
      { dataIndex: _venDeT.clientPoId, span: 12 },
      { dataIndex: _venDeT.description, span: 24, labelSpan: 6, valueSpan: 18 }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `vendorPO_${item.dataIndex}` })
    }))
    // Business Info
    const formColumns2 = [
      {
        dataIndex: _venDeT.currencyId,
        span: 12,
        className: 'column-money'
      },
      {
        dataIndex: _venDeT.net,
        span: 12,
        render: text => formatMoney(text / 100),
        className: 'column-money'
      },
      {
        dataIndex: _venDeT.tax,
        span: 12,
        render: text => formatMoney(text / 100),
        className: 'column-money'
      },
      {
        dataIndex: _venDeT.gross,
        span: 12,
        render: text => formatMoney(text / 100),
        className: 'column-money'
      }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `vendorPO_${item.dataIndex}` })
    }))

    const renderForm = (v, column) => {
      if (column.trans) {
        return column.trans(v, column.config)
      } else if (column.format) {
        return column.format(v).map((t, i) => <Row key={i}>{t}</Row>)
      } else {
        return v && v.toString()
      }
    }

    const columnMap = column => {
      let bold = column.bold
      let text
      let styleHeight = {}
      if (column.dataIndex === 'description') {
        styleHeight = { height: 'auto' }
      }

      if (vendorPoInfo) {
        text = column.deep ? vendorPoInfo.getIn(column.deep) : vendorPoInfo.get(column.dataIndex)
      } else {
        text = ''
      }
      if (column.render) {
        text = column.render(text)
      }

      return (
        <Col key={column.dataIndex} span={column.span || 8} className={`payment-item`} style={styleHeight}>
          {!column.noLabel && (
            <Col span={column.labelSpan || 10} className='payment-label' style={{ fontWeight: 'bold' }}>
              {formatMessage({ id: `vendorPO_${column.dataIndex}` })}
            </Col>
          )}
          <Col span={column.valueSpan || 14} className={`payment-value ${column.className}`}>
            {renderForm(text, column)}
          </Col>
        </Col>
      )
    }

    const getLogs = vendorLogs => {
      if (!vendorLogs) {
        return
      }
      let _vnedorLogs = vendorLogs.toJS()
      let context = _vnedorLogs.map(item => {
        return (
          <Timeline.Item key={item.id}>
            <Col span={6}>{item.operator}</Col>
            <Col span={18}>
              <span>{item.operation}</span>
              <span style={{ paddingLeft: 16 }}>{item.updatedAt}</span>
            </Col>
          </Timeline.Item>
        )
      })
      return (
        <Row style={{ width: '100%', padding: 24 }}>
          <p style={{ margin: '5px 0 10px 0', fontWeight: 'bold', color: '#00c1de' }}>vendorPo logs</p>
          <Timeline>{context}</Timeline>
        </Row>
      )
    }
    const labelCol = {
      xs: { span: 24 },
      sm: { span: 7 }
    }
    const wrapperCol = {
      xs: { span: 24 },
      sm: { span: 14 }
    }

    return (
      <Row style={{ paddingBottom: 100, position: 'relative' }}>
        <SecondTitle
          title={
            <Row>
              <Col span={6}>{formatMessage({ id: `${_tit.vendorPO}` })}</Col>
              <Col span={6}>{vendorPoInfo && vendorPoInfo.toJS().nameCN}</Col>
              <Col span={12}>
                <span className='icon-span status' />
                {flowStatus ? formatMessage({ id: `vendorPo_${flowStatus}` }) : ''}
              </Col>
            </Row>
          }
        />
        <Spin spinning={modalLoad} tip={formatMessage({ id: 'loading' })}>
          <Card
            style={{
              marginTop: 61,
              minWidth: 1100,
              width: '100%',
              paddingBottom: 40,
              borderBottom: '1px solid #e9e9e9',
              position: 'relative'
            }}
            className='no-padding'
          >
            <Row>
              <Col
                span={16}
                style={{
                  borderRight: '1px solid #f5f5f5',
                  padding: '24px 32px'
                }}
              >
                <Row className='payment-read' style={{ marginBottom: 20, border: 0 }}>
                  <p style={{ margin: '5px 0 10px 0', fontWeight: 'bold', color: '#00c1de' }}>PO Info.</p>
                  <Col className='wrap'>{formColumns1.map(columnMap)}</Col>
                </Row>
                <Row className='payment-read' style={{ marginBottom: 20, border: 0 }}>
                  <p style={{ margin: 5, fontWeight: 'bold', color: '#00c1de' }}>Amount</p>
                  <Col className='wrap'>{formColumns2.map(columnMap)}</Col>
                </Row>
                {flowStatus === 'toUpdate' && (
                  <Row className='payment-read' style={{ marginBottom: 20, border: 0 }}>
                    <p style={{ margin: '5px 0 10px 0', fontWeight: 'bold', color: '#00c1de' }}>
                      JR 变更内容（请前往 Adept 系统进行修改）
                    </p>

                    <Col className='wrap'>
                      <Col span={12} className={'payment-item'}>
                        <Col className={'payment-label'} style={{ fontWeight: 'bold' }}>
                          {'before'}
                        </Col>
                      </Col>
                      <Col span={12} className={'payment-item'}>
                        <Col className={'payment-label'} style={{ fontWeight: 'bold' }}>
                          {'after'}
                        </Col>
                      </Col>
                      <Col span={12} className={'payment-item'}>
                        <Col className={'payment-value'}>
                          {vendorPoInfo && vendorPoInfo.getIn(['compare', 'before'])}
                        </Col>
                      </Col>
                      <Col span={12} className={'payment-item'}>
                        <Col className={'payment-value'}>
                          {vendorPoInfo && vendorPoInfo.getIn(['compare', 'after'])}
                        </Col>
                      </Col>
                    </Col>
                  </Row>
                )}
                <Row style={{ marginTop: 40, textAlign: 'center', marginBottom: 40 }}>
                  {flowStatus === 'toSubmit' && (
                    <Button
                      onClick={() => {
                        this.setState({
                          operation_modal: true,
                          operationType: 'submit'
                        })
                      }}
                      type='primary'
                      size='large'
                      style={{ marginRight: 10 }}
                    >
                      {formatMessage({ id: 'submit' })}
                    </Button>
                  )}
                  {flowStatus === 'toUpdate' && (
                    <Button
                      onClick={() => {
                        this.setState({
                          operation_modal: true,
                          operationType: 'jrUpdate'
                        })
                      }}
                      type='primary'
                      size='large'
                      style={{ marginRight: 10 }}
                    >
                      {formatMessage({ id: 'update' })}
                    </Button>
                  )}
                  {flowStatus === 'toSendToVendor' && (
                    <span>
                      <Button
                        onClick={() => {
                          this.setState({
                            operation_modal: true,
                            operationType: 'sendToVendor'
                          })
                        }}
                        type='primary'
                        size='large'
                        style={{ marginRight: 10 }}
                      >
                        {formatMessage({ id: 'send' })}
                      </Button>
                      <Button
                        onClick={() => {
                          this.setState({
                            operation_modal: true,
                            operationType: 'sendToVendor'
                          })
                        }}
                        type='primary'
                        size='large'
                        style={{ marginRight: 10 }}
                      >
                        {formatMessage({ id: 'print' })}
                      </Button>
                    </span>
                  )}
                  {flowStatus === 'toFinanceAbandon' && (
                    <Button
                      onClick={() => {
                        this.setState({
                          operation_modal: true,
                          operationType: 'abandon'
                        })
                      }}
                      type='primary'
                      size='large'
                      style={{ marginRight: 10 }}
                    >
                      {formatMessage({ id: 'abandon' })}
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      const { dispatch } = this.props
                      dispatch(pathJump('/vendor_po'))
                    }}
                    size='large'
                  >
                    {formatMessage({ id: 'back' })}
                  </Button>
                  <Modal
                    visible={operation_modal}
                    title={formatMessage({ id: 'importVat' })}
                    maskClosable={false}
                    width={600}
                    className={'vatModal'}
                    onOk={() => this.operationVendor()}
                    onCancel={() =>
                      this.setState({
                        operation_modal: false
                      })
                    }
                  >
                    <Row style={{ padding: 16 }}>
                      <Col span={4} style={{ marginTop: 2 }}>
                        Adept Code:
                      </Col>
                      <Col span={18}>
                        <Input
                          value={adCode}
                          onChange={e => {
                            this.setState({
                              adCode: e.target.value
                            })
                          }}
                        />
                      </Col>
                    </Row>
                  </Modal>
                </Row>
              </Col>
              <Col span={8}>{getLogs(vendorLogs)}</Col>
            </Row>
          </Card>
        </Spin>
      </Row>
    )
  }
}

VendorPoShow.propTypes = {
  pathJump: React.PropTypes.func
}

const mapStateToProps = state => {
  console.log(354, state, state && state.toJS())

  return {
    vendorPoInfo: state.getIn(['vendorPoShow', 'vpoInfo']),
    vendorLogs: state.getIn(['vendorPoShow', 'logs'])
  }
}

export default Form.create()(injectIntl(connect(mapStateToProps)(VendorPoShow)))
