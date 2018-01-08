/**
 * Created by Maoguijun on 2017/10/13.
 */

import React from 'react'
import { injectIntl, FormattedMessage } from 'react-intl';
import { Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Timeline,Switch,Form,Icon   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'

// import TopSearch from '../../../../components/search/topSearch'
import SecondTitle from '../../../../components/secondTitle/secondTitle'
import Title from '../../../../components/title/title'
import {titles as _tit ,vendor_tableField as _vendorT,client_location,client_INVType} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {
    formatDate,
    formatMoney,
    configDirectory,
    configDirectoryObject,
    configCate,
    div
} from '../../../../utils/formatData';
import {getFormRequired} from '../../../../utils/common'
import { fetchVendor ,newVendor ,altVendor ,fetchVendorInfo,disabledVendor,enabledVendor } from '../modules/vendor'
import { fetchApprover } from '../../../system_settings/approver/modules/approver'
const Option = Select.Option;
const Search = Input.Search;
const FormItem = Form.Item;
import moment from 'moment'
import {List} from 'immutable'

class Vendor extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      loading       : false,
      currentPage   : 1,
      modal         : false,
      modalLoad     : false,
      itemId        : null,
      modal_t       : false,
      status        : false,
      modalTLoad    : false,
      modal_approver: false,
      InvalidDate   : null,
      count         : 0,
      flow_status   : null,
      expandState   : false,
      nameEN        : "",
      nameCN        : "",
      filters       : {},
      nameEN_visible:false,
      nameCN_visible:false,
    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    this.setState({loading:true});
    let json = {
      limit:13,
      offset:0
    }
    dispatch(fetchVendor(json)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({
          loading: false,
          count:e.payload.count
        })
      }
    });
  }

  onFetch = (value,limit,offset,cur=1,p=0) =>{
    this.setState({ loading:true,currentPage:cur });
    const { dispatch } = this.props;
    let values={
      ...value,
      limit:limit,
      offset: offset,
    };
    dispatch(fetchVendor(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      } else {
        //判断从哪里发起的请求
        let count = 0
        if (!p) {
          count = e.payload.objs.length || 0
        } else {
          count =e.payload.count
        }
        this.setState({
          loading: false,
          count:count,
        })
      }
    });
  };


  handleTableChange = (pagination, filters, sorter) => {
    const limit=13;
    const offset=(pagination.current-1)*limit;
    console.log(pagination,filters,sorter)
    this.setState({
      filters
    })
    let values = {
      "vendor.flowStatus_in":filters.status&&filters.status.toString(),
      "vendorType_in":filters.vendorType&&filters.vendorType.toString(),
      "nameEN_like":this.state.nameEN,
      "nameCN_like":this.state.nameCN,
    }
    if(filters.cartesisCode&&filters.cartesisCode.length===1){
      values = {
        ...values,
        cartesis:filters.cartesisCode.toString()
      }
    }
    console.log(values)
    this.onFetch(values,limit,offset,pagination.current,1)
  }

  onSearch = (name={},nameType)=>{
    const limit=13;
    const offset = 0
    let values ={}
    for(var key in name){
      values[key+"_like"] = name[key]
    }
    console.log(165,this.state[nameType],nameType)
    this.onFetch(values,limit,offset)
    this.setState({
      [nameType]:false
    })
  }
  copeVendor = (record)=>{
    const {dispatch} = this.props
    console.log(147,record)
    localStorage.setItem("vendorInfo_",JSON.stringify(record))
    localStorage.setItem("bankInfo_",JSON.stringify(record.vendorBanks))

    dispatch(pathJump("vendor/vendor_detail_edit/new"))
  }

  render(){
    const { intl: { formatMessage }, location: { pathname }, vendor, vendorsInfo, approver,count } = this.props;
    const { flow_status,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad,modal_approver,InvalidDate,expandState,tableWidth } = this.state
    //console.log('state',this.state)
    // //console.log('approver',approver)

    const columns = [
      {
        dataIndex:_vendorT.operation,
        show:true,
        fixed:"left",
        width:70,
        render:(text,record,index)=>(<a onClick={()=>this.copeVendor(record.toJS())}>{"COPY"}</a>)},
      {
        dataIndex: _vendorT.status,
        show:true,
        filters: [
          { text: '已创建，待提交', value: 'toSubmit' },
          { text: '已提交，待批准', value: 'submitted' },
          { text: '已批准', value: 'approved' },
          { text: '已修改，待批准', value: 'updated' },
        ],
        render:(text,record,index)=>{
          let _record = record.toJS();
          if(_record.vendor){
            return formatMessage({id:_record.vendor.flowStatus})
            // return _record.vendor.flowStatus
          }
        }
      },
      {
        dataIndex:_vendorT.nameEN,
        show:true,
        render:(text,record,index)=>(<a onClick={()=>{
          const {dispatch} = this.props
          dispatch(pathJump(`vendor/vendor_detail_show/${record.get("id")}`))
        }}>{text}</a>),
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={f => this.nameENf = f}
              placeholder="name-EN"
              value={this.state.nameEN}
              onChange={(e)=>this.setState({nameEN:e.target.value})}
              onPressEnter={()=>this.onSearch({nameCN:this.state.nameEN},"nameEN_visible")}
            />
            <Button type="primary" onClick={()=>this.onSearch({nameCN:this.state.nameEN},"nameEN_visible")}>Search</Button>
          </div>
        ),
        filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible: this.state.nameEN_visible,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            nameEN_visible: visible,
          }, () => this.nameENf.focus());
        },
      },
      {dataIndex:_vendorT.nameCN,
        show:true,
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => this.nameCNf = ele}
              placeholder="name-CN"
              value={this.state.nameCN}
              onChange={(e)=>this.setState({nameCN:e.target.value},"nameCN_visible")}
              onPressEnter={()=>this.onSearch({nameCN:this.state.nameCN})}
            />
            <Button type="primary" onClick={()=>this.onSearch({nameCN:this.state.nameCN},"nameCN_visible")}>Search</Button>
          </div>
        ),
        filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible: this.state.nameCN_visible,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            nameCN_visible: visible,
          }, () => this.nameCNf.focus());
        },
      },
      {dataIndex:_vendorT.code,show:true,},
      {dataIndex:_vendorT.cartesisCode,
         show:false ,
         filters: [
          { text: '有', value: "notNull" },
          { text: '无', value: "null" },
        ],
      },
      {dataIndex:_vendorT.validDate,show:false},
      {
        dataIndex:_vendorT.vendorType,
        show:true,
        filters: [
          { text: 'Freelancer', value: 'Freelancer' },
          { text: 'NonRegularVendor', value: 'NonRegularVendor' },
          { text: 'RegularVendor', value: 'RegularVendor' },
          { text: 'ContractVendor', value: 'ContractVendor' },
          { text: 'TaxBureau', value: 'TaxBureau' },
        ],
      },
      {dataIndex:_vendorT.taxRate,show:true,},
      {dataIndex:_vendorT.natureOfBusiness,show:true,},
      {dataIndex:_vendorT.expectedValue,show:false},
      {dataIndex:_vendorT.referral,show:false},
      {dataIndex:_vendorT.addressEN,show:false},
      {dataIndex:_vendorT.addressCN,show:false},
      {dataIndex:_vendorT.contactPerson,show:true,},
      {dataIndex:_vendorT.title,show:true,},
      {dataIndex:_vendorT.telephone,show:true,},
      {dataIndex:_vendorT.fax,show:false},
      {dataIndex:_vendorT.email,show:false},
    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `vendor_${item.dataIndex}` }),
        width:item.width?item.width:150,
      })
    ).filter(item=>{
      if(item.show){
        return item
      }
      if(!item.show&&expandState){
        return item
      }
    });

    return (
      <Row>
        <SecondTitle title={formatMessage({id:`${_tit.vendor}`})} rightContent={
          <Row>
            <Col sm={20} offset={0} className={"switch"}>
              <div>
                <span>{"More Attributes："}</span><Switch checked={expandState} onChange={()=>this.setState({expandState:!expandState})} />
              </div>
            </Col>
            <Col sm={4}>
              <Button onClick = {()=>{
                const {dispatch} = this.props
                dispatch(pathJump("vendor/vendor_detail_edit/new"))
              }}>{formatMessage({id:"new_btn"})}</Button>
            </Col>
          </Row>
        } />
          <ImmutableTable
          style={{marginTop:61}}
          loading={loading}
          columns={columns}
          dataSource={vendor}
          rowKey={record =>record.get("id")}
          pagination={{ pageSize:20, total:count ,showQuickJumper:true }}
          onChange={this.handleTableChange}
          scroll={{x:expandState?3000:1600}}
          />
      </Row>
    )
  }
}
Vendor.propTypes = {
  pathJump : React.PropTypes.func,
};



const mapStateToProps = (state) =>{
  console.log("567",state,state&state.toJS())
  return({
    vendor : state.getIn(['vendor','vendors']),
    count : state.getIn(['vendor','count']),
    vendorsInfo: state.getIn(['vendor','vendorsInfo']),
 });
}

export default injectIntl(connect(mapStateToProps)(Vendor))


//const WrappedSystemUser = Form.create()();



