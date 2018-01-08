
import React from 'react'
import { injectIntl } from 'react-intl'
import { Timeline ,Badge,Form,InputNumber,Radio,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Menu,Tabs,Card  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump,ifFin  } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {host,titles as _tit ,clientPO_tableField as _cliPOT,clientPO_type as _clientPOType,currency as _cur,rootPath,invoice_tableField as _inT , billingPL_tableField as _billPL} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,add,sub,mul,div} from '../../../../utils/formatData'
import { getFormRequired } from '../../../../utils/common'
import { fetchClientPO ,newClientPO ,altClientPO ,fetchClientPOInfo} from '../../../clientPO/modules/client_po'
import { fetchInvoicesInfo ,newInvoices ,altInvoices,ApprovalInvoices,chargeInvoices,delInvoices,fetchPayOffId } from '../modules/invoice_detail'
import { opInvoice } from '../../modules/invoice_management'
import {fetchClientPO_inv,fetchCollectLog} from '../../../clientPO/cpo_invoice/modules/cpo_invoice'
import { fetchBillTo } from '../../../system_settings/bill_to/modules/bill_to'
import { fetchPlacedTo,fetchPlacedToInfo } from '../../../system_settings/placed_to/modules/placed_to'
import { fetchSendTo,fetchSendToInfo } from '../../../system_settings/send_to/modules/send_to'
import { fetchClient ,fetchClientInfo} from '../../../system_settings/client/modules/client'
import { fetchApproverInfo } from '../../../system_settings/approver/modules/approver'
import { fetchBillingPlanInfo } from '../../../billing_plan_list/modules/billing_plan_list'
import Invoice_template  from '../../../../components/invoice_template/invoice'
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment'

class InvoiceDetails extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      modal:false,
      modalLoad:false,
      modalBp:false,
      modal_c:false,
      collectionLog : Immutable.fromJS([]),
      modalTitle:'collectLog',
      loading:false,

    }
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;


    this.setState({loading:true});
    if(params.id==='new_inv'){
      dispatch(fetchBillingPlanInfo(location.query.bp))
      dispatch(fetchClientPOInfo(location.query.cpo)).then(e=>{
        if(e.payload){
          dispatch(fetchPlacedToInfo(e.payload.placedToId))
          dispatch(fetchSendTo())
          dispatch(fetchClientInfo(e.payload.clientId))
          this.setState({loading:false});
        }else{
          this.setState({loading:false});
          message.error(e.error.message);
        }
      })
    }else{
      dispatch(fetchInvoicesInfo(params.id)).then((e)=>{

        if(e.error){
          this.setState({loading:false});
          message.error(e.error.message);
        }else{
          let a = [];
          e.payload.invoiceDetails.map(v=>{
            v.net = v.net/100
            a.push(v)
          }
          )
          this.setState({detail:Immutable.fromJS(a),approver:e.payload.approverId})
          dispatch(fetchBillingPlanInfo(e.payload.billingPlanId))
          dispatch(fetchClientPOInfo(e.payload.clientPoId)).then(e=>{
            if(e.payload){
              dispatch(fetchPlacedToInfo(e.payload.placedToId))
              dispatch(fetchSendTo())

              this.setState({loading:false});
            }else{
              this.setState({loading:false});
              message.error(e.error.message);
            }
          })
          dispatch(fetchClientInfo(e.payload.clientPoDetail.clientId)).then(e=>{
            if(e.payload){
              this.setState({loading:false});
            }else{
              this.setState({loading:false});
              message.error(e.error.message);
            }
          })
        }
      });
    }
  }



  onFetch = (values,limit,offset,cur=1) =>{
    this.setState({ loading:true,currentPage:cur });
    const { dispatch } = this.props;
    values={
      ...values,
      limit:limit,
      offset:offset
    };
    dispatch(fetchInvoice(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
      }
    });
  };

  changeTable=(pagination, filters, sorter) => {

    const limit=13;
    const offset=(pagination.current-1)*limit;
    this.onFetch({},limit,offset,pagination.current)
  };

  getRequiredMessage=(e,type)=>{
    return getFormRequired(this.props.intl.formatMessage({id:'input_require'},{name:e}),type)
  };


  handleModal=()=>{
    const {dispatch,params,intl:{formatMessage},invoicesInfo} = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {

        this.setState({modalLoad:true})

          let _inv = invoicesInfo.toJS()

          values={
            ..._inv,
            ...values,
            invoiceId:params.id,
            FPType: "creditNote",
          }
          dispatch(chargeInvoices(params.id,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false})
              message.success(formatMessage({id:'save_ok'}))
            }
          })

      }
    });
  };



  billDetails=(id)=>{
    const {dispatch} = this.props;
    dispatch(pathJump('/client_po/client_po_details/'+id))
  }

  handleStatus=(modal,id,des)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchInvoiceInfo(id)).then(e=>{
      if(e.payload){
        this.setState({itemId:id,[`${modal}`]:true,itemDes:des})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }


  viewBack = ()=>{
    const {dispatch,params} = this.props;
    dispatch(fetchCollectLog(params.id)).then(e=>{
      if(e.payload){
        this.setState({
          collectionLog:Immutable.fromJS(e.payload),
          modal_c:true,
          modalTitle:'collectLog'
        })
      }
    })
  }


  fetchPayoffId = () => {
    const {dispatch} = this.props
    dispatch(fetchPayOffId({FPType:'creditNote'})).then(e=>{
      if(e.error){
        message.error(e.error.message)
      }else{
        this.setState({payOffId:e.payload,modal:true})
      }
    })
  }


  handleModal_t=()=>{
    const {dispatch,invoiceInfo} = this.props;
    this.setState({modalTLoad:true})
    let _record = invoiceInfo.toJS()
    let action =_record.status==1?'disable':'enable'
    let json = {
      ..._record,
      status:_record.status==1?0:1
    }

    dispatch(altInvoice(action,this.state.itemId,json)).then(e=>{
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

  getcontent=()=>{
    const {intl:{formatMessage}} = this.props
    return (
      <Col>
        <Button style={{marginRight:15}}>{formatMessage({id:'vat_balance'})}</Button>
        <Button>{formatMessage({id:'back_balance'})}</Button>
      </Col>
    )
  };

  handledInvoices=(operation)=>{
    const {dispatch,params} = this.props;
    const {intl:{formatMessage}} = this.props
    this.setState({loading:true})
    let arr = []
    arr.push(params.id)
    let json = {
      ids:arr,
      operation
    }
    dispatch(opInvoice(json,params.id)).then(e=>{
      if(e.payload){
        this.setState({loading:false})
        message.success(formatMessage({id:'save_ok'}))
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }


  handledInvoice=(operation)=>{
    const {dispatch,location ,invoicesInfo,params,clientPOInfo,billingPlanInfo} = this.props;
    const {intl:{formatMessage}} = this.props

    let _data

    if(!this.state.approver) return message.error(formatMessage({id:'selectApprove'}))
    console.log('---',this.state.detail)
    if(!this.state.detail) return message.error(formatMessage({id:'inputInvDetails'}))
    if(this.state.detail.size === 0) return message.error(formatMessage({id:'inputInvDetails'}))
    this.setState({loading:true})


    if(params.id==='new_inv'){
      _data = clientPOInfo.toJS()
      //_data.id = 'INV' + moment().format('YYYYMMDDHHmmss');
      _data.INVDate = moment().format('YYYY-MM-DD')
      _data.net = billingPlanInfo.get('net');
      _data.tax = billingPlanInfo.get('tax');
      _data.gross = billingPlanInfo.get('gross');
      _data.FPType = 'common';
      _data.billingPlanId = location.query.bp;
      _data.usedType = 'client';
      _data.FPCategory = location.query.billCategory
    }else {
      _data = invoicesInfo.toJS()
    }

      if(this.state.detail){
        let _detail = []
        this.state.detail.toJS().map(v=>{
          v.net = Number(v.net)*100
          _detail.push(v)
        })
        _data.invoiceDetails = _detail
      }
      _data.operation = operation


      if(this.state.approver){
        _data.approverId = this.state.approver
      }

      let action
      if(params.id==='new_inv'){
        action = newInvoices
      }else if(invoicesInfo.get('flowStatus')==='toApproveByFD'){
        action = ApprovalInvoices
      }else if(invoicesInfo.get('flowStatus')==='toSubmit'){
        action = altInvoices
      }else if(invoicesInfo.get('flowStatus')==='refusedByFD'){
        action = altInvoices
      }

    let ac
    if(params.id==='new_inv'){
      ac=action(_data)
    }else{
      ac=action(params.id,_data)
    }
      dispatch(ac).then(e=>{
        if(e.payload){
          this.setState({loading:false})
          message.success(formatMessage({id:`approval_${operation}`}))
          this.timer = setTimeout(()=>history.back(), 700);
        }else{
          this.setState({loading:false})
          message.error(e.error.message)
        }
      })
  };

  abandon=()=>{
    const {dispatch,params,intl:{formatMessage}} = this.props;
    dispatch(delInvoices(params.id)).then(e=>{
      if(e.payload){
        message.success(formatMessage({id:'abandonInvSuccess'}))
        this.timer = setTimeout(()=>history.back(), 700);
      }else{
        message.error(e.error.message)
      }
    })
  }

  getCollectContent = () => {
    const {intl:{formatMessage}} = this.props
    const {collectionLog} = this.state
    return (
      <Timeline>
        {collectionLog.size>0?
        collectionLog&&collectionLog.toJS().map(item=>{
          return <Timeline.Item key ={item}>{item.split(',')[0]}<span style={{paddingLeft:24,fontWeight:'bold'}}>{parseFloat(item.split(",")[1])/100}</span></Timeline.Item>
        }):<p style={{textAlign:'center',height:'82px',lineHeight:'82px'}}>{formatMessage({id:'noData'})}</p>
        }
      </Timeline>
    )
  }



  render(){
    const {intl:{formatMessage},location:{pathname,query},params,userInfo,clientPOInfo,invoicesInfo,collectLog,clientInfo,placedToInfo,billingPlanInfo} = this.props;
    const { loading,detail,itemDes,modal,modalLoad,modalBp,modal_c } = this.state


    const ifFinDirector = ifFin('Finance-Director',userInfo&&userInfo.toJS())
    let handleINvInfo = []
    invoicesInfo&&invoicesInfo.toJS().invoiceDetails.map(v=>{
      v.net = v.net/100
      handleINvInfo.push(v)
    })

    let inv = invoicesInfo&&invoicesInfo.toJS()
    if(inv){
      inv.invoiceDetails = handleINvInfo
    }

    const _flowStatus = invoicesInfo&&invoicesInfo.get('flowStatus');
    const isToSubmit = _flowStatus==='toSubmit';
    const isCharged= _flowStatus==='credit';
    const isToApproveByFD = _flowStatus==='toApproveByFD';
    const toSendToClient= _flowStatus==='toSendToClient';
    const toApproveByClient= _flowStatus==='toApproveByClient';
    const toSentToCoordinator= _flowStatus==='toSentToCoordinator';
    const refusedByClient= _flowStatus==='refusedByClient';
    const toSentToFinance= _flowStatus==='toSentToFinance';
    const toApproveByFinance= _flowStatus==='toApproveByFinance';

    const isRefuse= _flowStatus==='refusedByFD';
    const isAbandon= _flowStatus==='abandoned';
    const readOnly = params.id!=='new_inv'&&!isToSubmit&&!isRefuse;
    const showSubmitBtn = params.id==='new_inv'|| isRefuse||isToSubmit
    const noBtn = !isToSubmit&&!isToApproveByFD&&!isAbandon&&!isRefuse&&params.id!=='new_inv';
    const noTopBtn = !isToSubmit&&!isToApproveByFD&&!isAbandon&&!isRefuse&&params.id!=='new_inv'&&!isCharged
    const newInv = params.id==='new_inv';
    const showApprovalBtn = isToApproveByFD&&ifFinDirector&&params.id!=='new_inv'

    const pre_data =(data)=>{
      if(data){
        let _data = data.toJS();
        _data.bpId = _data.id
        _data.id = ''
        _data.INVDate = moment().format('YYYY-MM-DD')
        return Immutable.fromJS(_data)
      }
    }


    const invoice_props = newInv?{
      setSuperState:(e)=>{this.setState(e)},
      clientPOInfo,
      clientInfo,
      invoicesInfo:pre_data(billingPlanInfo),
      placedToInfo,
      readOnly,
      newInv:true,
      net:billingPlanInfo&&billingPlanInfo.get('net'),
      desc:billingPlanInfo&&billingPlanInfo.get('description'),
    }:{
      setSuperState:(e)=>{this.setState(e)},
      clientPOInfo,
      clientInfo,
      invoicesInfo:Immutable.fromJS(inv),
      placedToInfo,
      readOnly,
      detail,
      approver:this.state.approver
    }

    const payOffNo=(e)=>{
      return e + 'CN'
    }

    const formColumns = [
      {dataIndex:_inT.id,transform:()=>this.state.payOffId,props:{disabled:true}},
      {dataIndex:_inT.INVDate,format:formatDate,FormTag:<DatePicker />},
      {dataIndex:_inT.clientId,deep:['clientPoDetail','clientId'],props:{disabled:true}},
      {dataIndex:_inT.collectedDate,FormTag:<DatePicker />},
      {dataIndex:_inT.billToId,deep:['clientPoDetail','billToId'],props:{disabled:true}},
      {dataIndex:_inT.currencyId,props:{disabled:true}},
      {dataIndex:_inT.clientPoId,props:{disabled:true}},
      {dataIndex:_inT.net,format:formatMoney,props:{disabled:true}},
      {dataIndex:_inT.description},
      {dataIndex:_inT.tax,format:formatMoney,props:{disabled:true}},
      {dataIndex:_inT.placedToId,deep:['clientPoDetail','placedToId'],jumpOver:true},
      {dataIndex:_inT.gross,format:formatMoney,props:{disabled:true}},
      {dataIndex:_inT.sentToId,deep:['clientPoDetail','sentToId'],props:{disabled:true}},
      {dataIndex:_inT.flowStatus,local:true,jumpOver:true},
      {dataIndex:_inT.approverId,props:{disabled:true}},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`invoice_${item.dataIndex}`}),
      })
    );


    const bpFormColumns = [
      {dataIndex:_billPL.clientPoId,},
      {dataIndex:_billPL.Month,format:formatDate},
      {dataIndex:_billPL.clientId,},
      {dataIndex:_billPL.currencyId,},
      {dataIndex:_billPL.billToId,},
      {dataIndex:_billPL.net,format:formatMoney},
      {dataIndex:_billPL.description,},
      {dataIndex:_billPL.tax,format:formatMoney},
      {dataIndex:_billPL.billCategory,},
      {dataIndex:_billPL.gross,format:formatMoney},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`billingPL_${item.dataIndex}`}),
      })
    );

    const renderForm=(v,column)=>{
      if(v == undefined || v=='') return
      if(column.trans){
        return column.trans(v,column.config)
      }else if(column.local){
        return formatMessage({id:`inv_flow_${v}`})
      }else if(column.format){
        return column.format(v)
      }else{
        return v
      }
    }
    const columnMap=(column,data)=>{
      let text
      if(data){
        text=column.deep?data.getIn(column.deep):data.get(column.dataIndex)
      }else{
        text= ''
      }

      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item'>
          <Col span={12}  className="payment-label" style={{fontWeight:'bold'}}>{column.title}</Col>
          <Col span={12}  className="payment-value" >{
            renderForm(text,column)
          }</Col>
        </Col>
      )};

    const rightContent = newInv?null:<Row style={{margin:'23px 0',marginLeft:15,marginTop:27}} className="inv-badge">
      <Badge status="processing"   text={formatMessage({id:`inv_flow_${_flowStatus}`})} />
    </Row>

    return (
      <Row>

        <Title rightContent={rightContent} title={params.id==='new_inv'?'New Invoice':params.id} />
        <Spin  spinning={ loading } tip="Processing..." >
        <Row style={{display:'flex',marginTop:61}}>
          {billingPlanInfo&&<Invoice_template  {...invoice_props} />}
          <Row className="btn-group"  style={!noTopBtn?{marginTop:'40%'}:{marginTop:30}} >
            {/*newInv&&<Row>
              {<Button type="primary" size="large" onClick={this.handledInvoice.bind(null,'submit')} >{formatMessage({id:'new_submit_btn'})}</Button>}
              {<Button type="primary" size="large" onClick={this.handledInvoice.bind(null,'save')}>{formatMessage({id:'save_btn'})}</Button>}
            </Row>*/}
            {<Row>
              {noTopBtn&&<Row>
                {toSendToClient&&<Button size="large"  onClick={this.handledInvoices.bind(null,'sentToClient')} >{formatMessage({id:'sendToCus'})}</Button>}
                {toApproveByClient&&<Button size="large"  onClick={this.handledInvoices.bind(null,'clientApprove')} >{formatMessage({id:'cusCfm'})}</Button>}
                {toApproveByClient&&<Button size="large"  onClick={this.handledInvoices.bind(null,'clientRefuse')} >{formatMessage({id:'cusRej'})}</Button>}
                {toSentToCoordinator&&<Button size="large"  onClick={this.handledInvoices.bind(null,'sendToCoordinator')} >{formatMessage({id:'sendToCo'})}</Button>}
                {toSentToFinance&&<Button size="large"  onClick={this.handledInvoices.bind(null,'sendToFinance')} >{formatMessage({id:'SendToFin'})}</Button>}
                {toApproveByFinance&&<Button size="large"  onClick={this.handledInvoices.bind(null,'financeApprove')} >{formatMessage({id:'finCfm'})}</Button>}
                <div className="line"></div>
              </Row>}
              {noBtn&&<Row>
                {!isCharged&&<Button  onClick={this.abandon} size="large">{formatMessage({id:'invalid'})}</Button>}
                {!isCharged&&<Button  onClick={this.fetchPayoffId} size="large">{formatMessage({id:'payOff'})}</Button>}
                <Button  onClick={()=>{this.setState({modalBp:true})}} size="large">{formatMessage({id:'toBP'})}</Button>
                <Button  onClick={()=>{
                      const {dispatch,params,invoicesInfo} = this.props;
                      if(invoicesInfo.get('VATBalanceStatus')){
                          dispatch(pathJump('/invoice_management/vat_balance_details/'+params.id))
                      }else{
                          this.setState({modal_c:true,modalTitle:'vat_balance'})
                      }
                      }}
                        size="large">{formatMessage({id:'toBalance'})}</Button>
                <Button  onClick={this.viewBack} size="large">{formatMessage({id:'viewBackB'})}</Button>
                <Button  size="large">{formatMessage({id:'print'})}</Button>
              </Row>}
            </Row>}
            <Row style={{marginTop:38}}>
              {showSubmitBtn&&<Button  size="large" onClick={this.handledInvoice.bind(null,'submit')} >{formatMessage({id:'new_submit_btn'})}</Button>}
              {showSubmitBtn&&<Button  size="large" onClick={this.handledInvoice.bind(null,'save')}>{formatMessage({id:'save_btn'})}</Button>}
              {showApprovalBtn&&<Button  size="large" onClick={this.handledInvoice.bind(null,'agree')} >{formatMessage({id:'agree'})}</Button>}
              {showApprovalBtn&&<Button  size="large" onClick={this.handledInvoice.bind(null,'disagree')}>{formatMessage({id:'disagree'})}</Button>}
            </Row>
            <Button size="large" type="primary" onClick={()=>{
                    history.back()
                  }}>{formatMessage({id:'back'})}</Button>
          </Row>
        </Row>
        </Spin>
        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false})}
          title={formatMessage({id:'payOffModalTitle'})}
          footer={null}
          maskClosable={false}
          width={700}
        >
          <Spin  spinning={ modalLoad } tip="Processing..." >
            <p style={{margin:'20px 0',textAlign:'center',fontWeight:'bold',fontSize:'16px'}}>{formatMessage({id:'payOffFrom'})}</p>
            <Row className="payment-read" style={{margin:'0 25px'}}>
              {formColumns.map(v=>columnMap(v,invoicesInfo))}
            </Row>
            <Row style={{margin:'50px 0'}}>
              <p style={{margin:'20px 0',textAlign:'center',fontWeight:'bold',fontSize:'16px'}}>{formatMessage({id:'payOffTo'})}</p>
              <SimpleForm columns={ formColumns } initial={invoicesInfo} colSpan={12} labelCol={{span:7}} ref={f=>this.form=f} />
            </Row>
            <Row style={{textAlign:'center',marginBottom:20}}>
              <Button size="large" style={{marginRight:10}} type="primary" onClick={this.handleModal} >{formatMessage({id:'createNsubmit'})}</Button>
              <Button size="large"  onClick={()=>{this.setState({modal:false})}} >{formatMessage({id:'cancel'})}</Button>
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modalBp}
          onCancel={()=>this.setState({modalBp:false})}
          title={formatMessage({id:'bill_plan'})}
          footer={null}
          maskClosable={false}
          width={700}
        >
            <Row className="payment-read" style={{margin:'0 25px'}}>
              {bpFormColumns.map(v=>columnMap(v,billingPlanInfo))}
            </Row>
          <Row style={{textAlign:'center',margin:'20px 0'}}>
            <Button size="large"  onClick={()=>{this.setState({modalBp:false})}} >{formatMessage({id:'back'})}</Button>
          </Row>
        </Modal>
        <Modal
          visible={modal_c}
          onCancel={()=>this.setState({modal_c:false})}
          title={formatMessage({id:this.state.modalTitle})}
          maskClosable={false}
          width={500}
          footer={
            <Row>
              <Button onClick={()=>this.setState({modal_c:false})} >{formatMessage({id:'cfm'})}</Button>
            </Row>
          }
        >
          <Row>
            {this.getCollectContent()}
          </Row>
          {/*<Row style={{marginTop:30}}>
            {collectLog&&collectLog.size>0?<p style={{textAlign:'center'}}>{formatMessage({id:'collectLog'})}</p>:null}
            {collectLog&&collectLog.size>0?collectLog.map(v=>(
              <p>{v}</p>
            )):<p style={{textAlign:'center',fontSize:'24px'}}>{formatMessage({id:'noBackB'})}</p>}
            <Row style={{textAlign:'center',margin:'30px 0'}}>
              <Button size="large" onClick={()=>this.setState({modal_c:false})}>{formatMessage({id:'back'})}</Button>
            </Row>
          </Row>*/}
        </Modal>
      </Row>
    )
  }
}

InvoiceDetails.propTypes = {
  pathJump : React.PropTypes.func,
};

const mapStateToProps = (state) => ({
  invoice : state.getIn(['invoiceManagement','invoices']),
  count : state.getIn(['invoiceManagement','count']),
  currencyAllCN : state.getIn(['invoiceManagement','currencyAllCN']),
  currencyAllUS : state.getIn(['invoiceManagement','currencyAllUS']),
  clientPO : state.getIn(['clientPO','clientPO']),
  billTo : state.getIn(['billTo','billTo']),
  client : state.getIn(['client','client']),
  placedTo : state.getIn(['placedTo','placedTo']),
  sendTo : state.getIn(['sendTo','sendTo']),
  clientPOInfo: state.getIn(['clientPO','clientPOInfo']),
  invoicesInfo: state.getIn(['invoiceDetail','invoicesInfo']),
  clientInfo: state.getIn(['client','clientInfo']),
  placedToInfo: state.getIn(['placedTo','placedToInfo']),
  billingPlanInfo: state.getIn(['billingPlan','billingPlanInfo']),
  collectLog :state.getIn(['cpoInvoice','collectLog']),
  userInfo : state.getIn(['userInfo','userLoginInfo']),
});

export default injectIntl(connect(mapStateToProps)(InvoiceDetails))
