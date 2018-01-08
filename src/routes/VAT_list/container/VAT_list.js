/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Dropdown,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Table ,Menu,Timeline  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../utils/'
import TopSearch from '../../../components/search/topSearch'
import Title from '../../../components/title/title'
import { FPType,FPCate,host,titles as _tit ,invoice_tableField as _cliPOT,rootPath,CPOStatus,invoice_type,currency,BudgetType,invoice_tableField as _inT} from '../../../config'
import { WORLD_COUNTRY} from '../../../country_config'
import Immutable from 'immutable'
import { formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../utils/formatData'
import { getFormRequired} from '../../../utils/common'
import { fetchVAT,fetchVATInfo,altVAT,delVAT,newVAT,fetchVATWithInv} from '../modules/VAT_list'
import { fetchClientPO } from '../../clientPO/modules/client_po'
import { fetchBillTo } from '../../system_settings/bill_to/modules/bill_to'
import { fetchPlacedTo } from '../../system_settings/placed_to/modules/placed_to'
import { fetchSendTo } from '../../system_settings/send_to/modules/send_to'
import { fetchClient } from '../../system_settings/client/modules/client'
import { fetchApprover } from '../../system_settings/approver/modules/approver'
import { fetchInvoice, fetchCollectionLog } from '../../invoice_management/modules/invoice_management'
import { chargeInvoices } from '../../invoice_management/invoice_detail/modules/invoice_detail'
import moment from 'moment'
const Option = Select.Option;
const Search = Input.Search;
import './VAT_list_.css'
const confirm = Modal.confirm;




class VATList extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      previewImage:'',
      loading : false,
      currentPage:1,
      modal:false,
      modalLoad:false,
      itemId:null,
      modal_t:false,
      status:false,
      modalTLoad:false,
      slideList:[],
      modal_c:false,
      itemDes:null,
      selectedRowKeys:[],
      modalLoad_c:false,
      vatsInfo:Immutable.fromJS([]),
      vatsInfo_org:Immutable.fromJS([]),//原始的vatsInfo
      vatsInfo_form:Immutable.fromJS([]),//冲抵表单中的vatsInfo
      modal_abandon:false,
      modal_collect:false,
      collectionLog:Immutable.fromJS([]),
    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    dispatch(fetchBillTo());
    dispatch(fetchClient());
    dispatch(fetchPlacedTo());
    dispatch(fetchClientPO());
    dispatch(fetchApprover())
    dispatch(fetchSendTo())
    dispatch(fetchVAT()).then((e)=>{
      if(e.error){
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
    dispatch(fetchVAT(values)).then((e)=>{
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
    const {vatsInfo,vatsInfo_form,vatsInfo_org} = this.state
    if(this.state.selectedRowKeys.length!==1) return message.error(formatMessage({id:'onlyOne'}))
    if(this.state.selectedRows.length!==1) return message.error(formatMessage({id:'onlyOne'}))
    this.form.validateFields((err, values) => {
      if (!err) {
        //console.log('receive form value',values)
        this.setState({modalLoad:true})
        //console.log('value',values)
        let _vat = this.state.selectedRows[0]
        //console.log('_vat===',_vat)
        values={
          ..._vat,
          ...values,
          VATId:this.state.selectedRowKeys[0],
          FPType: "creditNote",
          gross: vatsInfo_org.get('gross'),
          net: vatsInfo_org.get('net'),
          tax: vatsInfo_org.get('tax'),
        }
        dispatch(newVAT(values)).then(e=>{
          if(e.error){
            message.error(e.error.message)
            this.setState({modalLoad:false,itemId:null})
          }else{
            dispatch(fetchVAT())
            this.setState({modalLoad:false,modal:false})
            message.success(formatMessage({id:'save_ok'}))
          }
        })

      }
    });
  };



  billDetails=(id)=>{
    const {dispatch} = this.props
      dispatch(fetchVATInfo(id)).then(e=>{
        //console.log(146,e)
        if(e.payload){
          e.payload.gross /=100
          e.payload.net /=100
          e.payload.tax /=100
          this.setState({
            modal_t:true,
            itemId:id,
            vatsInfo:Immutable.fromJS(e.payload)
          })
        }else{
          message.error(e.error.message)
        }
      })
  }

  vatBalanceDetails=(id)=>{
    const {dispatch} = this.props
    dispatch(pathJump(`/invoice_management/vat_balance_details/${id}`))
  }

  handleStatus=(modal,id,des)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchInvoiceInfo(id)).then(e=>{
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

  copyCPO=()=> {
    const {dispatch} = this.props;
    dispatch(pathJump('/client_po/client_po_details/copy_'+this.state.itemId))
  }

  handleChangeModal=()=>{
    const {dispatch,intl:{formatMessage}} = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {
        //console.log('receive form value',values)
        this.setState({modalLoad_c:true})
        //console.log('value',values)
        values = {
          ...values,
          actualInvoiceDate:moment(values['actualInvoiceDate']).format('YYYY-MM-DD'),
          collectedDate:moment(values['collectedDate']).format('YYYY-MM-DD'),
        }

          dispatch(altVAT(this.state.itemId,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              //this.setState({modalLoad_c:false,itemId:null})
            }else{
              this.setState({modalLoad_c:false,modal_c:false,itemId:null,currentPage:1})
              message.success(formatMessage({id:'save_ok'}))
            }
          })

      }
    });
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


  delV =()=>{
    const {intl:{formatMessage},currencyAllCN,currencyAllUS} = this.props
    const {dispatch} = this.props;
    if(this.state.selectedRowKeys.length===1){
      dispatch(delVAT(this.state.selectedRowKeys[0])).then(e=>{
        if(e.error){
          message.error(e.error.message)
        }else{
          message.success(`${this.state.selectedRowKeys[0]}已被废弃`)
          this.setState({
            modal_abandon:false,
            currentPage:1
          })
          dispatch(fetchVAT())
        }
      })
    }else{
      message.error(formatMessage({id:'onlyOne'}))
    }
  }

  getVatInfo=()=>{
    const {dispatch} =this.props
    dispatch(fetchVATInfo(this.state.selectedRowKeys[0])).then(e=>{
      if(e.payload){
        this.setState({
          vatsInfo_org:Immutable.fromJS(e.payload)
        })
        //展示数据
        e.payload.gross /=100
        e.payload.net /=100
        e.payload.tax /=100
      }
      this.setState({
        vatsInfo:Immutable.fromJS(e.payload)
      })
      //表单数据
      delete e.payload.id
      delete e.payload.actualInvoiceDate
      delete e.payload.dueDate
      this.setState({
        vatsInfo_form:Immutable.fromJS(e.payload)
      })
    })
  }

  getcontent=()=>{
    const {intl:{formatMessage},currencyAllCN,currencyAllUS} = this.props
    return (
      <Row style={{display:'flex'}}>
        <Col>
          <Button style={{marginRight:15}} onClick={()=>{
            const {dispatch} = this.props;
            const data = this.state.selectedRows
            console.log(219,data)
            //没有选择inv也能直接跳过去
            let {FPCategory,clientPoDetail:{clientId,billToId,currencyId}} = data[0]
            console.log(304,FPCategory,clientId,billToId,currencyId)
            if(!data||data.length===0){
              dispatch(pathJump(`/collect_balance/collect_balance_details/new`))
            }else{
              let isSame=false
              //要满足多条inv
              //判断这些数据是否都没有经过collecte配平
              data.forEach(item=>{
                if(item.vatbalancedId){
                  message.error(`${item.id}已经经历过vat配平`)
                  return
                }
                if(item.FPCategory !==FPCategory ) {
                  message.error("Category 不相同")
                  return
                }
                if(item.clientPoDetail){
                  if (item.clientPoDetail.clientId !==clientId){
                    message.error(`client 不相同`)
                    return
                  }
                  if (item.clientPoDetail.billToId !==billToId){
                    message.error(`billTo 不相同`)
                    return
                  }
                  if (item.clientPoDetail.currencyId !==currencyId){
                    message.error(`currency 不相同`)
                    return
                  }
                  isSame=true
                }
              })
              if(!data[0].collectBalanceStatus[1]&&isSame&&data[0].collectBalanceStatus[2]){
                let vatList = JSON.stringify(data)
                sessionStorage.setItem("vatList",vatList)
                dispatch(pathJump(`/collect_balance/collect_balance_details/new`))
              }else if(data[0].collectBalanceStatus[1]&&isSame){
                dispatch(pathJump(`/collect_balance/collect_balance_details/${data[0].collectBalanceStatus[1]}`))
              }else{
                message.error("您选择的vat当前状态不能参与collecte balance")
              }
            }
          }} >{formatMessage({id:'back_balance'})}</Button>
          <Button style={{marginRight:15}} onClick={()=>{
            const {dispatch} = this.props
            if(this.state.selectedRowKeys.length===1){
              this.getVatInfo()
              this.setState({modal:true})
            }else{
              message.error(formatMessage({id:'onlyOne'}))
          }}}>{formatMessage({id:'payOff'})}</Button>
          <Button style={{marginRight:15}} onClick={()=>{
            const {dispatch} = this.props
            if(this.state.selectedRowKeys.length===1){
              this.getVatInfo()
              this.setState({modal_abandon:true})
            }else{
              message.error(formatMessage({id:'onlyOne'}))
          }}} >{formatMessage({id:'abandon'})}</Button>
        </Col>
        <Row style={{display:'flex',marginLeft:50,fontSize:14,paddingTop:2}}>
          <p style={{marginRight:10}}>{formatMessage({id:'amount'})}</p>
          {<p style={{marginRight:20,fontWeight:'bold'}}>RMB : {formatMoney(currencyAllCN/100||0)}</p>}
          {<p style={{marginRight:20,fontWeight:'bold'}}>USD : {formatMoney(currencyAllUS/100||0)}</p>}
        </Row>
      </Row>
    )
  };

  setThisState = (obj)=>{
    this.setState(obj)
  }

  getCollectionLog=(record)=>{
    const {dispatch} = this.props
    dispatch(fetchCollectionLog(record.id)).then(e=>{
      if(e.payload){
        //console.log(268,e.payload)
        //处理数据
        let _collectionLog = e.payload.objs.map(item=>{
          let arr=[]
          arr = item.split(",")
          console.log(arr)
          return {
            "date":arr[0],
            "amount":arr[1],
            "collectionId":arr[2],
          }
        })
        //console.log(400,e.payload.objs,_collectionLog)
        this.setState({
          collectionLog:Immutable.fromJS(_collectionLog),
          modal_collect:true
        })
      }
    })
  }

  getCollectContent = () => {
    const {collectionLog} = this.state
    return (
      <Timeline>
        {
          collectionLog&&collectionLog.toJS().map(item=>{
            return <Timeline.Item key ={item}>{item.split(',')[0]}<span style={{paddingLeft:24,fontWeight:'bold'}}>{parseFloat(item.split(",")[1])/100}</span></Timeline.Item>
          })
        }
      </Timeline>
    )
  }


  showConfirm=()=> {
    const {intl:{formatMessage}} = this.props
    let _set = this.setThisState
    confirm({
      title: formatMessage({id:'vatCfmMsg'}),
      content: formatMessage({id:'vatCfmCont'}),

      onOk() {
        _set({modal_t:false,modal_c:true})
      },
      onCancel() {
        //_set({modal_t:false})
      },
    });
  }

  // expand=(expanded, record)=>{
  //   const {dispatch} = this.props
  //   //console.log('=========',record)
  //   let json = {
  //     VATId:record.id
  //   }
  //   dispatch(fetchVATWithInv(json)).then((e)=>{
  //     if(e.error){
  //       message.error(e.error.message);
  //       this.setState({loading:false})
  //     }else{
  //       this.setState({loading:false})
  //     }
  //   });
  // }

  handledInvoice=(operation)=>{
    const {dispatch} = this.props;
    const {intl:{formatMessage}} = this.props
    this.setState({loading:true})
    let json = {
      ids:this.state.selectedRowKeys,
      operation
    }
    dispatch(opInvoice(json)).then(e=>{
      if(e.payload){
        this.setState({loading:false})
        message.success(formatMessage({id:'save_ok'}))
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }

  jumpToCollectBalance=(record)=>{
    const {dispatch} = this.props
    dispatch(pathJump('/collect_balance/collect_balance_details/'+(record['collectBallanceId']||'new')))
  }


  render(){
    const {intl:{formatMessage},location:{pathname},vatsInv,invoice,approver,currencyAllCN,currencyAllUS,clientPO,count,vats,invoiceInfo,roles,ldap,placedTo,sendTo,billTo,client} = this.props;
    const { modalLoad_c,itemDes,modal_c,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage,vatsInfo,vatsInfo_form,vatsInfo_org,modal_abandon,modal_collect,collectionLog} = this.state
    //console.log('yinyinyin',billTo,placedTo,client,clientPO)
    //console.log('==========',vatsInv)

    const renderSysId = (data,item) => {
      return data.map(v=>(
        <Option key={v.get(item)}>{v.get(item)}</Option>
      ))
    }

    const columnsLog=[
      {dataIndex:"index",title:"序号",render:(text,record,index)=>index+1},
      {dataIndex:"date",title:"回款日期"},
      {dataIndex:"amount",title:"回款金额",render:(text,record,index)=>{
        console.log(text,record,index)
        return (
          <a onClick={()=>{
            const {dispatch} = this.props
            dispatch(pathJump(`/collect_balance/collect_balance_details/${record.get('collectionId')}`))
          }}>{formatMoney(text/100||0)}</a>
        )
      }},
    ]

    const columns = [
      {dataIndex:_inT.id,render: text => <a onClick={this.billDetails.bind(this,text)}>{text}</a>},
      {dataIndex:_inT.clientPoId,},
      {dataIndex:_inT.clientId,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.clientId},
      {dataIndex:_inT.billToId,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.billToId},
      {dataIndex:_inT.placedToId,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.placedToId},
      {dataIndex:_inT.FPCategory},
      {dataIndex:_inT.description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>),},
      {dataIndex:_inT.net,className: 'column-money',render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.tax,className: 'column-money',render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.gross,className: 'column-money',render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.collectedAmount,className: 'column-money',render:(text,record)=>(<a onClick={()=>this.jumpToCollectBalance(record)}>{formatMoney(text/100||'')}</a>)},
      {dataIndex:_inT.FPType,},
      {dataIndex:_inT.sentToId,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.sentToId},
      {dataIndex:_inT.approverId},
      {dataIndex:_inT.actualInvoiceDate,render:text=>text&&formatDate(text)},
      {dataIndex:_inT.collectedDate,render:text=>text&&formatDate(text)},
      {dataIndex:_inT.overDue},
      {dataIndex:_inT.filePath},
    ].map(
      item=>({
        ...item,
        key:item.dataIndex,
        title:formatMessage({id:`invoice_${item.dataIndex}`}),
      })
    );

    const formColumns = [
      {dataIndex:_inT.id,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_inT.FPCategory,jumpOver:true,FormTag:<Input disabled={true}/>,
        // <Select
        //   showSearch
        //   placeholder={formatMessage({ id: 'pleaseSelect' })}
        //   disabled={true}
        //   optionFilterProp="children"
        //   filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
        //   {FPCate.map(v=><Option  key={v} value={v}>{formatMessage({id:v})}</Option>)}
        // </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] }},
      {dataIndex:_inT.actualInvoiceDate,format:formatDate,FormTag:<DatePicker />},
      {dataIndex:_inT.clientId,deep:['clientPoDetail','clientId'],props:{disabled:true}},
      {dataIndex:_inT.dueDate,format:formatDate,FormTag:<DatePicker />},
      {dataIndex:_inT.billToId,deep:['clientPoDetail','billToId'],props:{disabled:true},
      // FormTag:
      //   <Select
      //     showSearch
      //     placeholder={formatMessage({id:'pleaseSelect'})}
      //     optionFilterProp="children"
      //     filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
      //     {billTo&&renderSysId(billTo,'id')}
      //   </Select>,
        option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_inT.clientPoId,FormTag:<Input disabled={true}/>},
      {dataIndex:_inT.currencyId,props:{disabled:true}},
      {dataIndex:_inT.description},
      {dataIndex:_inT.net,format:formatMoney,FormTag:<Input disabled={true}/>},
      {dataIndex:_inT.placedToId,deep:['clientPoDetail','placedToId'],jumpOver:true},
      {dataIndex:_inT.tax,format:formatMoney,FormTag:<Input disabled={true}/>},
      {dataIndex:_inT.sentToId,deep:['clientPoDetail','sentToId'],props:{disabled:true},
      // FormTag:
      //   <Select
      //     showSearch
      //     placeholder={formatMessage({id:'pleaseSelect'})}
      //     optionFilterProp="children"
      //     filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
      //     {sendTo&&renderSysId(sendTo,'id')}
      //   </Select>,
        option:{rules: [{ required: true, message: 'Please select' }]}
      },
      {dataIndex:_inT.gross,format:formatMoney,props:{disabled:true}},
      {dataIndex:_inT.approverId,props:{disabled:true},
      // FormTag:
      //   <Select
      //     showSearch
      //     placeholder={formatMessage({ id: 'pleaseSelect' })}
      //     optionFilterProp="children"
      //     filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
      //     {approver&&renderSysId(approver,'id')}
      //   </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] }},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`invoiceE_${item.dataIndex}`}),
      })
    );

    const vatForm = [
      ...formColumns.filter(item=>{
        if(item.dataIndex==="gross"){
          return (
            {dataIndex:_inT.gross,format:formatMoney,FormTag:<Input
            onChange={(e)=>{
                let value = e.target.value
                let net = parseFloat(value)/1.06
                let tax = parseInt(value)-net
                this.form.validateFields((er,value)=>{
                  this.form.setFieldsValue({
                    ...value,
                    tax:formatMoney(tax||0),
                    net:formatMoney(net||0)
                  })
                })
            }}/>})
        }else{
          return item
        }
      }),
      {dataIndex:_inT.filePath},
      {dataIndex:_inT.FPType,FormTag:
        <Select
          showSearch
          optionFilterProp="children"
          allowClear={true}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
          {FPType.map(v=><Option  key={v} value={v}>{formatMessage({id:v})}</Option>)}
        </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] }},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`invoice_${item.dataIndex}`}),
        props:item.dataIndex===_inT.clientId?{disabled:true}:{},
        jumpOver:item.dataIndex===_inT.FPCategory?false:item.dataIndex===_inT.currencyId?true:item.jumpOver
      })
    );



    const invColumns = [
      {dataIndex:_inT.flowStatus,render:text => <p>{formatMessage({id:`inv_flow_${text}`})}</p>,width: 250},
      {dataIndex:_inT.id,render: text => <a onClick={this.vatBalanceDetails.bind(this,text)}>{text}</a>,width: 150},
      {dataIndex:_inT.description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>),width: 150},
      {dataIndex:_inT.clientPoId,width: 150},
      {dataIndex:_inT.clientId,width: 150,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.clientId},
      {dataIndex:_inT.billToId,width: 150,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.billToId},
      {dataIndex:_inT.placedToId,width: 150,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.placedToId},
      {dataIndex:_inT.INVDate,width: 150,render:date=>formatDate(date)},
      {dataIndex:_inT.currencyId,width: 130,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.currencyId},
      {dataIndex:_inT.net,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.tax,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.gross,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.payDate,width: 150},
      {dataIndex:_inT.overDue,width: 150},
      {dataIndex:_inT.collectedAmount,className: 'column-money',width: 200,render:(text,record)=>(<a onClick={()=>this.getCollectionLog(record)}>{formatMoney(text/100||0)}</a>)},
    ].map(
      item=>({
        ...item,
        key:item.dataIndex,
        title:formatMessage({id:`invoice_${item.dataIndex}`}),
      })
    );


    const renderForm=(v,column)=>{
      if(v === undefined || v==='' || v===null) return
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

    const columnMap=column=>{
      //console.log(vatsInfo)
      let bold = column.bold
      let text
      if(vatsInfo){
        text=column.deep?vatsInfo.getIn(column.deep):vatsInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item'>
          <Col span={12}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`invoice_${column.dataIndex}`})}</Col>
          <Col span={12}  className="payment-value" style={bold&&{fontWeight:"bold"}}>{
            renderForm(text,column)
          }</Col>
        </Col>
      )};

    this.formColumns=[
      {dataIndex:'id_like',formTag:'input'},
      {dataIndex:'clientPoId_like',type:'selectSearch',selectOption:clientPO&&clientPO,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.clientId',type:'selectSearch',selectOption:client&&client,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.billToId',type:'selectSearch',selectOption:billTo&&billTo,placeholder:formatMessage({id:'pleaseSelect'})},

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    this.expandColumns=[
      {dataIndex:'FPCategory',type:'select',selectOption:FPCate,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.sentToId_like',type:'selectSearch',selectOption:sendTo&&sendTo,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'approverId_like',type:'selectSearch',selectOption:approver&&approver,placeholder:formatMessage({id:'pleaseSelect'})},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    let searchProps={
      formColumns:this.formColumns,
      onSave:this.onFetch,
      rightContent:this.getcontent(),
      limit:99999,
      expand:true,
      expandForm:this.expandColumns
    };


    const expandedRowRender = (record) => {
      const _data = record.invoices
      return (
        <Table
          columns={invColumns}
          dataSource={_data}
          pagination={false}
          rowKey={record =>record.id}
          size="small"
          rowClassName={(record,index)=>index%2===0?'row-a':'row-b'}
        />
      );
    };
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({selectedRowKeys,selectedRows})
      },
    };


    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.VAT_list}`})} />
        {billTo&&placedTo&&client&&clientPO&&<TopSearch  {...searchProps} />}
        {<Table
          //className="components-table-demo-nested"
          loading={loading}
          columns={columns}
          dataSource={vats&&vats.toJS()}
          pagination={{ pageSize: 20,total:count,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
          //onChange={this.changeTable}
          rowSelection={rowSelection}
          expandedRowRender={record=>expandedRowRender(record)}
          //onExpand={this.expand}
          scroll={{x:2130}}
          rowKey={record => record.id}
          title={()=><Row>
            <Col span={5} offset={1}>
              <span className="icon-span row-invat"></span>{ `该数据vat配平状态不平`}
            </Col>
            <Col span={5}>
              <span className="icon-span row-incollect"></span>{ `该数据collect配平状态不平`}
            </Col>
            <Col span={5}>
              <span className="icon-span row-incollect-invat"></span>{ `两种配平状态均不平`}
            </Col>
          </Row>}
          size="small"
          //bordered={true}
          rowClassName={(record,index)=>{
            if(!record.VATBalanceStatus[0]&&record.collectBalanceStatus[0]){
              return "row-invat"
            }else if(!record.collectBalanceStatus[0]&&record.VATBalanceStatus[0]){
              return "row-incollect"
            }else if(!record.collectBalanceStatus[0]&&!record.VATBalanceStatus[0]){
              return "row-incollect-invat"
            }else{
              return index%2===0?'row-a':'row-b'
            }
          }}
        />}
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
              {formColumns.map(v=>columnMap(v,vatsInfo))}
            </Row>
            <Row style={{margin:'50px 0'}}>
              <p style={{margin:'20px 0',textAlign:'center',fontWeight:'bold',fontSize:'16px'}}>{formatMessage({id:'payOffTo'})}</p>
              <SimpleForm columns={ formColumns } initial={vatsInfo_form} colSpan={12} labelCol={{span:7}} ref={f=>this.form=f} />
            </Row>
            <Row style={{textAlign:'center',marginBottom:20}}>
              <Button size="large" style={{marginRight:10}} type="primary" onClick={this.handleModal} >{formatMessage({id:'createNsubmit'})}</Button>
              <Button size="large"  onClick={()=>{this.setState({modal:false})}} >{formatMessage({id:'cancel'})}</Button>
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modal_t}
          onCancel={()=>this.setState({modal_t:false,itemId:null})}
          title={formatMessage({id:'vatInv'})}
          maskClosable={false}
          width={700}
          footer={null}
        >
          <Spin  spinning={ modalTLoad } tip="creating..." >
            <Row className="payment-read">
              {vatForm.map(columnMap)}
            </Row>
            <Row style={{textAlign:'center',margin:'40px 0'}}>
              {<Button style={{marginRight:10 }} onClick={this.showConfirm}  type="danger" size="large">{formatMessage({id:'edit'})}</Button>}
              <Button style={{marginRight:10 }} onClick={()=>{this.setState({modal_t:false})}}  size="large">{formatMessage({id:'cancel'})}</Button>
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modal_c}
          onCancel={()=>this.setState({modal_c:false,itemId:null})}
          title={formatMessage({id:'vatInv'})}
          footer={null}
          maskClosable={false}
          width={1000}
        >
          <Spin  spinning={ modalLoad_c } tip="Processing..." >
            <Row>
              <SimpleForm columns={ vatForm } initial={vatsInfo} colSpan={12} labelCol={{span:7}} ref={f=>this.form=f} />
            </Row>
            <Row style={{marginTop:50,textAlign:'center',marginBottom:50}}>
              <Button onClick={this.handleChangeModal} type='primary' size="large" style={{marginRight:10}}>{formatMessage({id:'save_btn'})}</Button>
              <Button onClick={()=>{this.setState({modal_c:false})}}  size="large">{formatMessage({id:'cancel'})}</Button>
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modal_abandon}
          onCancel={()=>this.setState({modal_abandon:false,itemId:null})}
          title={formatMessage({id:'abandonVat'})}
          maskClosable={false}
          width={700}
          footer={
            <Row>
              <Button type="danger" onClick={()=>this.delV()}>{formatMessage({id:'abandon'})}</Button>
              <Button onClick={()=>this.setState({modal_abandon:false,itemId:null})} >{formatMessage({id:'cancel'})}</Button>
            </Row>
          }
        >
          <Spin  spinning={ modalTLoad } tip="creating..." >
            <Row className="payment-read">
              {formColumns.map(v=>columnMap(v,vatsInfo))}
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modal_collect}
          title={formatMessage({id:'collectLog'})}
          maskClosable={false}
          width={500}
          onCancel={()=>this.setState({modal_collect:false,itemId:null})}
          footer={
            <Row>
              <Button onClick={()=>this.setState({modal_collect:false,itemId:null})} >{formatMessage({id:'cfm'})}</Button>
            </Row>
          }
        >
          <Spin  spinning={ modalTLoad } tip="creating..." >
            <ImmutableTable
            loading={loading}
            columns={columnsLog}
            dataSource={collectionLog}
            rowKey={record => record.get("id")}
            />
          </Spin>
        </Modal>
      </Row>
    )
  }
}

VATList.propTypes = {
  pathJump : React.PropTypes.func,
};

const mapStateToProps = (state) => ({
  vats : state.getIn(['VATList','vats']),
  vatsInv : state.getIn(['VATList','vatsInv']),
  // vatsInfo : state.getIn(['VATList','vatsInfo']),
  count : state.getIn(['VATList','count']),
  currencyAllCN : state.getIn(['VATList','currencyAllCN']),
  currencyAllUS : state.getIn(['VATList','currencyAllUS']),
  clientPO : state.getIn(['clientPO','clientPO']),
  invoiceInfo: state.getIn(['invoice','invoiceInfo']),
  billTo : state.getIn(['billTo','billTo']),
  client : state.getIn(['client','client']),
  placedTo : state.getIn(['placedTo','placedTo']),
  sendTo : state.getIn(['sendTo','sendTo']),
  approver : state.getIn(['approver','approver']),
  invoice : state.getIn(['invoice','invoices']),
});

export default injectIntl(connect(mapStateToProps)(VATList))


//const WrappedSystemUser = Form.create()();



