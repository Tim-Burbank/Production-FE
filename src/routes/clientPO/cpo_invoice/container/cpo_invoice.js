/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Table,Form,InputNumber,Radio,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Menu,Tabs ,Card } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {host,titles as _tit ,clientPO_tableField as _cliPOT,clientPO_type as _clientPOType,currency as _cur,cpoInvoice_tableField as _cpoI,invoice_tableField as _invT} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,add,sub,mul,div} from '../../../../utils/formatData'
import { getFormRequired } from '../../../../utils/common'
import {fetchClientPO_inv,fetchCollectLog} from '../modules/cpo_invoice'
import { fetchClientPO ,newClientPO ,altClientPO ,fetchClientPOInfo} from '../../modules/client_po'
import { fetchBillTo } from '../../../system_settings/bill_to/modules/bill_to'
import { fetchPlacedTo } from '../../../system_settings/placed_to/modules/placed_to'
import { fetchSendTo } from '../../../system_settings/send_to/modules/send_to'
import { fetchClient } from '../../../system_settings/client/modules/client'
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
let uuid = 9999
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment'




class CPOInvoice extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      previewImage:'',
      loading : false,
      current:props.location.query.type,
      modal:false,
      modalLoad:false,
      itemId:null,
      modal_t:false,
      status:false,
      modalTLoad:false,
      slideList:[],
      modal_c:false,
      itemDes:null,
      coModal:false,
    }
  }


  componentDidMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    let json = {
      type:location.query.type
    }
    //console.log('tttt',json)
    dispatch(fetchClientPO_inv(location.query.id,json)).then((e)=>{
      if(e.error){
        this.setState({loading:false})
        message.error(e.error.message);
      }else{
        this.setState({loading:false})
      }
    });
  }

  onFetch = (values,limit,offset,cur=1) =>{
    this.setState({ loading:true,currentPage:cur });
    const { dispatch } = this.props;
    values={
      ...values,
      limit:limit,
      offset:offset
    };
    dispatch(fetchClientPO(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
      }
    });
  };


  changeTable=(pagination, filters, sorter) => {
    //console.log(pagination, filters, sorter)
    const limit=13;
    const offset=(pagination.current-1)*limit;
    this.onFetch({},limit,offset,pagination.current)
  };

  getRequiredMessage=(e,type)=>{
    return getFormRequired(this.props.intl.formatMessage({id:'input_require'},{name:e}),type)
  };

  handleModal=()=>{
    const {dispatch,params,intl:{formatMessage}} = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {
        //console.log('receive form value',values)
        this.setState({modalLoad:true})
        //console.log('value',values)
        if(this.state.itemId == null){
          this.form.resetFields()

          dispatch(newClientPO(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }else{
          dispatch(altClientPO(this.state.itemId,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null,currentPage:1})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }
      }
    });
  };



  pre=($v)=>{
    let _bp
    if($v){
      _bp = $v.toJS().billingPlans
    }else{
      return
    }

    if(_bp){
      _bp.map(v=>{
        let _inv
        if(v.invoices.length>0){
          _inv = v.invoices[0]
          _inv.chargeId = v.invoices[0].invoices.length>0?v.invoices[0].invoices[0].id:''
        }
        v.invoices = _inv
      })
    }
    return _bp
  }


  billDetails=(id)=>{
    const {dispatch} = this.props;
    dispatch(pathJump('/client_po/client_po_details/'+id))
  }

  handleStatus=(modal,id,des)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchClientPOInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:id,[`${modal}`]:true,itemDes:des})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }




  handleModal_t=()=>{
    const {dispatch,clientPOInfo} = this.props;
    this.setState({modalTLoad:true})
    let _record = clientPOInfo.toJS()
    let action =_record.status==1?'disable':'enable'
    let json = {
      ..._record,
      status:_record.status==1?0:1
    }
    dispatch(altClientPO(action,this.state.itemId,json)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:null,modal_t:false,currentPage:1})
        this.setState({modalTLoad:false})
      }else{
        this.setState({modalTLoad:false})
        message.error(e.error.message)
      }
    })
  };




  handleDisable=()=>{
    const {dispatch} = this.props;
    const {intl:{formatMessage}} = this.props
    this.setState({modalTLoad:true})
    dispatch(disabledCPO(this.state.itemId)).then(e=>{
      if(e.payload){
        this.setState({modalTLoad:false})
        this.setState({modal_t:false})
        message.success(formatMessage({id:'abandonSuccess'}))
      }else{
        message.error(e.error.message)
      }
    })
  }

  handleMenu = (e) => {
    const{dispatch,location} = this.props;
    //console.log('click ', e);
    this.setState({current: e.key,loading:true})
    let json = {
      type:e.key
    }



    dispatch(fetchClientPO_inv(location.query.id,json)).then((e)=>{
      if(e.error){
        this.setState({loading:false})
        message.error(e.error.message);
      }else{
        this.setState({loading:false})
      }
    });
  }

  handleMoney=(v)=>{
  if(v){
    return formatMoney((v/100))
  }
}

  render(){
    const {intl:{formatMessage},location:{pathname},count,clientPO,clientPOInfo,cpoInvoice,ldap,placedTo,sendTo,billTo,client,collectLog} = this.props;
    const { itemDes,modal_c,loading ,currentPage ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    //console.log('=====',cpoInvoice)
    const bpColumns = [
      {dataIndex:_cpoI.date},
      {dataIndex:_cpoI.gross,className: 'column-money',width: 180,render:text=>formatMoney(text/100)},
      {dataIndex:_cpoI.flowStatus},
    ].map(
      item=>({
        ...item,
        key:`bp_${item.dataIndex}`,
        title:formatMessage({id:`cpo_invoice_${item.dataIndex}`}),
      })
    );



    const inColumns = [
      {dataIndex:_invT.id,render:(text,record,index)=>(
      record.invoices&&<div>
          <Link style={{display:'block'}} to={{pathname:'/invoice_detail/'+record.invoices[_invT.id],query:{option:'noBtn'}}} >{record.invoices?record.invoices[_invT.id]:''}</Link>
          <Link style={{display:'block'}} to={{pathname:'/invoice_detail/'+record.invoices['chargeId'],query:{option:'noBtn'}}} >{record.invoices?record.invoices['chargeId']:''}</Link>
        </div>
      )},
      {dataIndex:_invT.flowStatus,render:(text,record,index)=>record.invoices?formatMessage({id:`inv_flow_${record.invoices[_invT.flowStatus]}`}):''},
      {dataIndex:_invT.INVDate},
      {dataIndex:_invT.gross,className: 'column-money',width:180,render:(text,record,index)=>record.invoices?formatMoney(record.invoices[_invT.gross]/100):''},
      {dataIndex:_invT.FPType},
      {dataIndex:_invT.overDue},
      {dataIndex:_invT.collectedDate},
      {dataIndex:_invT.collectedAmount,className: 'column-money',width:180,render:(text,record,index)=>(
      record.invoices&&record.invoices[_invT.collectedAmount]?<a onClick={()=>{
        const {dispatch} = this.props;
        dispatch(fetchCollectLog(record.invoices[_invT.id]))
        this.setState({modal_c:true})}
        }>{record.invoices?formatMoney(record.invoices[_invT.collectedAmount]/100):''}</a>:<span>{record.invoices?formatMoney(record.invoices[_invT.collectedAmount]/100):''}</span>
      )},
      {dataIndex:_invT.clientId,render:(text,record,index)=>record.invoices?record.invoices.clientPoDetail[_invT.clientId]:''},
      {dataIndex:_invT.billToId,render:(text,record,index)=>record.invoices?record.invoices.clientPoDetail[_invT.billToId]:''},
      {dataIndex:_invT.approverId},
    ].map(
      item=>({
        ...item,
        key:item.dataIndex,
        title:formatMessage({id:`invoice_${item.dataIndex}`}),
        render:item.render?item.render:(text,record,index)=>record.invoices?record.invoices[item.dataIndex]:''
    })
  );

    const columnTop = [
      {title:formatMessage({id:'bill_plan'}),children:bpColumns},
      {title:formatMessage({id:'invoice'}),children:inColumns},
    ]


    const renderForm=(v,column)=>{
      //console.log('form',v)
      if(v === undefined || v==='') return
      if(column.formatWord){
        return formatMessage({id:v})
      }
      if(column.trans){
        return column.trans(v,column.config)
      }else if(column.format){
        return column.format(v).map((t,i)=>(
          <Row key={i} >
            {t}
          </Row>
        ))
      }else if(column.render){
        return column.render(v)
      }else{
        return v
      }
    }

    const renderSysId = (data,item) => {
      return data.map(v=>(
        <Option key={v.get(item)}>{v.get(item)}</Option>
      ))
    }

    const baseColumn = [
      {dataIndex:_cliPOT.clientPoId},
      {dataIndex:_cliPOT.net,render:this.handleMoney},
      {dataIndex:_cliPOT.tax,render:this.handleMoney},
      {dataIndex:_cliPOT.gross,render:this.handleMoney},
      {dataIndex:_cliPOT.currencyId},
      {dataIndex:_cliPOT.description,span:24,style:{marginTop:10}},
    ]

    let searchProps = {
      title: null,
      className: "search-bar",
      style: {borderRadius: 0, margin: '10px 0'},
      bodyStyle: {padding: '5px 0px 5px 10px', backgroundColor: '#f7f7f7'}
    };

    const columnMap=column=>{
      //console.log(clientPOInfo)


      let text
      if(cpoInvoice){
        text=column.deep?cpoInvoice.getIn(column.deep):cpoInvoice.get(column.dataIndex)
      }else{
        text= ''
      }

      return (
        <Col key={column.dataIndex} span={column.span || 4 } style={column.style} className='payment-item'>
          <span   className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`clientPO_${column.dataIndex}`})} : </span>
          <span  className="payment-value" >{
            renderForm(text,column)
          }</span>
        </Col>
      )};

    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.cpo_invoice}`})} />
        <Menu
          onClick={this.handleMenu}
          selectedKeys={[this.state.current]}
          mode="horizontal"
        >
          <Menu.Item key='agencyFee' >{formatMessage({id:`clientPO_${_cliPOT.agencyFee}`})}</Menu.Item>
          <Menu.Item key='agencyIncentive' >{formatMessage({id:`clientPO_${_cliPOT.agencyIncentive}`})}</Menu.Item>
          {/*<Menu.Item key='productionCost' >{formatMessage({id:`clientPO_${_cliPOT.productionCost}`})}</Menu.Item>*/}
          {/*<Menu.Item key='travelCost' >{formatMessage({id:`clientPO_${_cliPOT.travelCost}`})}</Menu.Item>*/}
        </Menu>
        <Card {...searchProps} >
          <Row style={{margin:'10px 0'}}>
            {baseColumn.map(columnMap)}
          </Row>
        </Card>
        <Table
          loading={loading}
          columns={columnTop}
          dataSource={this.pre(cpoInvoice)}
          bordered={true}
          rowKey={record =>record.id}
          size='small'
          pagination={false}
          scroll={{ x: 2000 }}
        />
        <Modal
          visible={modal_c}
          onCancel={()=>this.setState({modal_c:false})}
          title={formatMessage({id:'collectLog'})}
          maskClosable={false}
          width={700}
          footer={null}
        >
          <Row>
              {collectLog&&collectLog.map(v=>(
                <p>{v}</p>
              ))}
            <Row style={{textAlign:'center'}}>
              <Button size="large" onClick={()=>this.setState({modal_c:false})}>{formatMessage({id:'back'})}</Button>
            </Row>
          </Row>
        </Modal>
      </Row>
    )
  }
}



CPOInvoice.propTypes = {
  pathJump : React.PropTypes.func,
};



const mapStateToProps = (state) => ({
  cpoInvoice : state.getIn(['cpoInvoice','cpoInvoice']),
  collectLog :state.getIn(['cpoInvoice','collectLog']),
});

export default injectIntl(connect(mapStateToProps)(CPOInvoice))


//const WrappedSystemUser = Form.create()();



