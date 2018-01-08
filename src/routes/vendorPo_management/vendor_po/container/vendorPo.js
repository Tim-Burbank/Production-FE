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
  Tooltip
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
import { titles as _tit, vendorPO_tableField as _vendorPOT, client_location, client_INVType } from '../../../../config'
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
import { fetchVendorPo, newVendorFP, updateVendorFP, fetchVendorPoInfo } from '../modules/vendorPo'
import { fetchApprover } from '../../../system_settings/approver/modules/approver'
import './vendorPO_.scss'
const Option = Select.Option
const Search = Input.Search
const FormItem = Form.Item
import moment from 'moment'

class VendorPo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      currentPage: 1,
      vat_modal: false,
      itemId: null,
      vendorType: 'vat', // vat
      vatList: Immutable.fromJS([]),
      vatIndex: 0, // vat数组的计数器
      isCanEdit: false, // 是否可以点击编辑,false表示可以点击
      vpoCode: '',
      currencyId: '',
      description: '',
      vendorPoId: '',
      vendorFPType: ''
    }
  }

  componentWillMount () {
    const { dispatch, params, location } = this.props
    this.setState({ loading: true })
    let json = {
      limit: 13,
      offset: 0
    }
    dispatch(fetchVendorPo(json)).then(e => {
      if (e.error) {
        message.error(e.error.message)
      } else {
        this.setState({
          loading: false,
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
    dispatch(fetchVendorPo(values)).then(e => {
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
  // 打开对话框
  handleModal = record => {
    console.log(record)
    let vatList = record.vendorFPs.map((item, index) => ({
      ...item,
      index: index,
      operation: true
    }))
    this.setState({
      vatList: Immutable.fromJS(vatList),
      vat_modal: true,
      currencyId: record.currencyId,
      description: record.description,
      vpoCode: record.code,
      vatIndex: record.vendorFPs.length - 1,
      vendorPoId: record.id,
      vendorFPType: record.currencyId === 'CNY' ? 'VAT' : 'INV'
    })
  }
  // 新增一行数据
  handleVatAdd = () => {
    // console.log('add',this.state.vatIndex)
    let _vatIndex = this.state.vatIndex
    this.setState({
      vatIndex: _vatIndex + 1,
      vatList: Immutable.fromJS([
        ...this.state.vatList.toJS(),
        {
          index: _vatIndex + 1,
          operation: false,
          enterDate: moment().format('YYYY-MM-DD'),
          INVDate: moment().format('YYYY-MM-DD'),
          expectedDate: moment()
            .add(60, 'd')
            .format('YYYY-MM-DD')
        }
      ]),
      isable: true,
      isCanEdit: true
    })
  }
  // 修改单元格的数据
  editCell = (index, name, value) => {
    console.log(335, index, name, value)
    let _vatList = this.state.vatList.toJS()
    _vatList[index][name] = value
    this.setState({
      vatList: Immutable.fromJS(_vatList)
    })
  }
  // 修改一行状态为可编辑
  rowEdit = index => {
    const { isCanEdit } = this.state
    let _vatList = this.state.vatList.toJS()
    _vatList[index].operation = false
    if (isCanEdit) {
      message.info('请先保存再编辑')
      return
    }
    this.setState({
      vatList: Immutable.fromJS(_vatList),
      isable: true,
      isCanEdit: true
    })
  }
  // 保存一行数据并新建一个vat//并统计数据
  rowSave = index => {
    const { dispatch } = this.props
    const { vendorPoId, vendorFPType, currencyId } = this.state
    let _vatList = this.state.vatList.toJS()
    _vatList[index].operation = true
    _vatList[index].vendorPoId = vendorPoId
    if (_vatList[index].id) {
      dispatch(updateVendorFP(_vatList[index].id, _vatList[index])).then(e => {
        if (e.error) {
          if (e.error) {
            message.error('save error')
            return
          }
        } else {
          message.success('save success')
          dispatch(fetchVendorPo()).then(e => {
            this.setState({
              vatList: Immutable.fromJS(_vatList),
              isable: false,
              isCanEdit: false
            })
          })
        }
      })
    } else {
      // 尝试新增
      _vatList[index].vendorFPType = vendorFPType
      _vatList[index].FPType = 'common'
      _vatList[index].currencyId = currencyId
      dispatch(newVendorFP(_vatList[index])).then(e => {
        if (e.error) {
          message.error('new error')
        } else {
          message.success('new success')
          dispatch(fetchVendorPo()).then(e => {
            if (e.error) {
              return
            }
            this.setState({
              vatList: Immutable.fromJS(_vatList),
              isable: false,
              isCanEdit: false
            })
          })
        }
      })
    }
  }

  vendorPO_detaile = value => {
    console.log(value)
    const { dispatch } = this.props
    dispatch(pathJump(`vendor_po/vendor_po_show/${value}`))
  }

  render () {
    const { intl: { formatMessage }, location: { pathname }, vendorPo, vendorPosInfo, approver, count } = this.props
    const { flow_status, loading, currentPage, vat_modal, itemId, vendorType, vatList, isable, isCanEdit } = this.state
    // console.log('state',this.state)
    console.log('vatList', vatList && vatList.toJS())

    const columns = [
      {
        dataIndex: _vendorPOT.flowStatus,
        render: text => formatMessage({ id: `vendorPo_${text}` })
      },
      {
        dataIndex: _vendorPOT.id,
        render: (text, record, index) => <a onClick={() => this.vendorPO_detaile(text)}>{text}</a>
      },
      { dataIndex: _vendorPOT.code },
      {
        dataIndex: _vendorPOT.description,
        render: text => (
          <span>
            <div style={{ display: 'inline-block', marginRight: '15px' }}>
              <Tooltip title={<p>{text}</p>}>
                {text && text.length > 5 ? (
                  <span>
                    {text.substring(0, 5) + ' ··· '}
                    <Icon type='question-circle-o' />
                  </span>
                ) : (
                  <span>{text}</span>
                )}
              </Tooltip>
            </div>
          </span>
        )
      },
      { dataIndex: _vendorPOT.vendorId },
      { dataIndex: _vendorPOT.placedToId },
      { dataIndex: _vendorPOT.PEId },
      { dataIndex: _vendorPOT.clientId },
      { dataIndex: _vendorPOT.clientPoId },
      { dataIndex: _vendorPOT.currencyId },
      {
        dataIndex: _vendorPOT.net,
        className: 'column-money',
        render: text => formatMoney(text / 100 || 0)
      },
      {
        dataIndex: _vendorPOT.invId,
        render: (text, record, index) => {
          let _record = record.toJS()
          if (_record.vendorFPs && _record.vendorFPs.length > 0) {
            let html = []
            _record.vendorFPs.forEach(item => {
              html.push(<Row key={item.num}>{item.num}</Row>)
            })
            return <a onClick={() => this.handleModal(_record)}>{html}</a>
          } else {
            return <a onClick={() => this.handleModal(_record)}>{formatMessage({ id: 'new_btn' })}</a>
          }
        }
      }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `vendorPO_${item.dataIndex}` }),
      width: item.width ? item.width : 150
    }))

    const vatColumns = [
      {
        dataIndex: _vendorPOT.operation,
        show: true,
        fixed: 'left',
        width: 100,
        render: (text, record, index) => {
          return text ? (
            <a onClick={() => this.rowEdit(index)}>{formatMessage({ id: `edit` })}</a>
          ) : (
            <a onClick={() => this.rowSave(index)}>{formatMessage({ id: `save_btn` })}</a>
          )
        }
      },
      {
        dataIndex: _vendorPOT.num,
        show: true,
        render: (text, record, index) => {
          if (record.get('operation')) {
            return text
          } else {
            return (
              <Input
                placeholder={' VAT No.'}
                style={{ width: '100%' }}
                defaultValue={text || ''}
                onBlur={e => this.editCell(index, 'num', e.target.value)}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorPOT.taxRate,
        show: true,
        className: 'column-money',
        render: (text, record, index) => {
          if (record.get('operation')) {
            return formatMoney(text / 100 || 0)
          } else {
            return (
              <Input
                placeholder={'taxRate'}
                style={{ width: '100%' }}
                defaultValue={text / 100 || 0}
                onBlur={e => this.editCell(index, 'taxRate', e.target.value * 100)}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorPOT.net,
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
        dataIndex: _vendorPOT.tax,
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
        dataIndex: _vendorPOT.gross,
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
      {
        dataIndex: _vendorPOT.INVDate,
        show: true,
        render: (text, record, index) => {
          if (record.get('operation')) {
            return text
          } else {
            return (
              <DatePicker
                style={{ width: '100%' }}
                defaultValue={text ? moment(text) : null}
                onChange={value => this.editCell(index, 'INVDate', moment(value).format('YYYY-MM-DD'))}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorPOT.enterDate,
        show: true,
        render: (text, record, index) => {
          if (record.get('operation')) {
            return text
          } else {
            return (
              <DatePicker
                style={{ width: '100%' }}
                defaultValue={text ? moment(text) : null}
                onChange={value => this.editCell(index, 'enterDate', moment(value).format('YYYY-MM-DD'))}
              />
            )
          }
        }
      },
      {
        dataIndex: _vendorPOT.expectedDate,
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
        dataIndex: _vendorPOT.remark,
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
      .map(item => ({
        ...item,
        title: formatMessage({ id: `vendorPO_${item.dataIndex}` }),
        width: item.width ? item.width : 150
      }))
      .filter(item => {
        if (item.show) {
          return item
        }
        if (!item.show && vendorType === 'vat') {
          return item
        }
      })

    return (
      <Row>
        <SecondTitle title={formatMessage({ id: `${_tit.vendorPO}` })} />
        <ImmutableTable
          style={{ marginTop: 61 }}
          loading={loading}
          columns={columns}
          dataSource={vendorPo}
          rowKey={record => record.get('id')}
          pagination={{ pageSize: 20, total: count, showQuickJumper: true }}
          bordered
          scroll={{ x: 1600 }}
        />
        <Modal
          visible={vat_modal}
          title={formatMessage({ id: 'importVat' })}
          maskClosable={false}
          width={1200}
          className={'vatModal'}
          onCancel={() =>
            this.setState({
              vat_modal: false,
              itemId: null,
              vatList: Immutable.fromJS([]),
              currencyId: '',
              description: '',
              vpoCode: '',
              vatIndex: 0
            })
          }
          footer={
            <Row>
              <Button
                onClick={() =>
                  this.setState({
                    vat_modal: false,
                    itemId: null,
                    vatList: Immutable.fromJS([]),
                    currencyId: '',
                    description: '',
                    vpoCode: '',
                    vatIndex: 0
                  })
                }
              >
                {formatMessage({ id: 'back' })}
              </Button>
            </Row>
          }
        >
          <Row style={{ marginTop: 8 }}>
            <ImmutableTable
              pagination={false}
              columns={vatColumns}
              dataSource={vatList}
              ref={t => (this.tabele = t)}
              scroll={vendorType === 'vat' ? { x: 1450 } : {}}
              rowKey={record => `vat_${record.get('index')}`}
              bordered
              title={() => (
                <Row style={{ display: 'flex' }}>
                  <Col span={6}>
                    <span>{formatMessage({ id: 'vpoCode' })}</span>: <span>{this.state.vpoCode}</span>
                  </Col>
                  <Col span={6}>
                    <span>{formatMessage({ id: `vendorPO_${_vendorPOT.description}` })}</span>:{' '}
                    <span>{this.state.description}</span>
                  </Col>
                  <Col span={6}>
                    <span>{formatMessage({ id: `vendorPO_${_vendorPOT.currencyId}` })}</span>:{' '}
                    <span>{this.state.currencyId}</span>
                  </Col>
                </Row>
              )}
              footer={data => (
                <Row type='flex' justify='space-between'>
                  <Col>
                    <Button onClick={this.handleVatAdd} disabled={isable}>
                      <Icon type='plus' />
                      {formatMessage({ id: 'add' })}
                    </Button>
                  </Col>
                </Row>
              )}
            />
          </Row>
        </Modal>
      </Row>
    )
  }
}
VendorPo.propTypes = {
  pathJump: React.PropTypes.func
}

const mapStateToProps = state => {
  console.log('567', state, state & state.toJS())
  return {
    vendorPo: state.getIn(['vendorPo', 'vpos']),
    count: state.getIn(['vendorPo', 'count']),
    vendorsInfo: state.getIn(['vendorPo', 'vposInfo'])
  }
}

export default injectIntl(connect(mapStateToProps)(VendorPo))

// const WrappedSystemUser = Form.create()();
