/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Dropdown,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Table ,Menu,Timeline,Badge   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../utils/'
import TopSearch from '../../../components/search/topSearch'
import Title from '../../../components/title/title'
import {host,titles as _tit ,invoice_tableField as _cliPOT,rootPath,CPOStatus,invoice_type,currency,BudgetType,invoice_tableField as _inT} from '../../../config'
import {WORLD_COUNTRY} from '../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../utils/formatData'
import {getFormRequired} from '../../../utils/common'
import { fetchVAT,fetchVATInfo,altVAT,delVAT,newVAT,fetchVATWithInv} from '../../VAT_list/modules/VAT_list'
import { opInvoice,fetchInvoice ,fetchInvoiceInfo ,newInvoice ,altInvoice,disabledCPO,agreeCPO,fetchCollectionLog} from '../modules/invoice_management'
import {fetchClientPO} from '../../clientPO/modules/client_po'
import { fetchBillTo } from '../../system_settings/bill_to/modules/bill_to'
import { fetchPlacedTo } from '../../system_settings/placed_to/modules/placed_to'
import { fetchSendTo } from '../../system_settings/send_to/modules/send_to'
import { fetchClient } from '../../system_settings/client/modules/client'
import "./invoice.css"
import { render } from 'react-dom';
const Option = Select.Option;
const Search = Input.Search;

class InvoiceManagement extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      previewImage   : '',
      loading        : false,
      currentPage    : 1,
      modal          : false,
      modalLoad      : false,
      itemId         : null,
      modal_t        : false,
      status         : false,
      modalTLoad     : false,
      slideList      : [],
      modal_c        : false,
      itemDes        : null,
      selectedRowKeys: [],
      modal_collect  : false,
      collectionLog  : Immutable.fromJS([]),
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
    dispatch(fetchInvoice()).then((e)=>{
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
      limit : limit,
      offset: offset
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

          dispatch(newInvoice(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }else{
          dispatch(altInvoice(this.state.itemId,values)).then(e=>{
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


  billDetails=(id)=>{
    const {dispatch} = this.props;
    dispatch(pathJump('/invoice_detail/'+id))
  }

  billDetailsInv=(id)=>{
    const {dispatch} = this.props;
    dispatch(pathJump('/invoice_management/vat_balance_details/vat='+id))
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


  handleModal_t=()=>{
    const {dispatch,invoiceInfo} = this.props;
    this.setState({modalTLoad:true})
    let _record = invoiceInfo.toJS()
    let action  = _record.status == 1?'disable':'enable'
    let json = {
      ..._record,
      status: _record.status==1?0:1
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

  // expand=(expanded, record)=>{
  //   const {dispatch} = this.props
  //   //console.log('=========',record)
  //   let json = {
  //     invoiceId:record.id
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


  getcontent=()=>{
    const {intl:{formatMessage},currencyAllCN,currencyAllUS} = this.props

    const menu = (
      <Menu onClick={(e)=>this.handledInvoice(e.key)}>
        <Menu.Item key="sentToClient">{formatMessage({id:'sendToCus'})}</Menu.Item>
        <Menu.Item key="clientApprove">{formatMessage({id:'cusCfm'})}</Menu.Item>
        <Menu.Item key="clientRefuse">{formatMessage({id:'cusRej'})}</Menu.Item>
        <Menu.Item key="sendToCoordinator">{formatMessage({id:'sendToCo'})}</Menu.Item>
        <Menu.Item key="sendToFinance">{formatMessage({id:'SendToFin'})}</Menu.Item>
        <Menu.Item key="financeApprove">{formatMessage({id:'finCfm'})}</Menu.Item>
      </Menu>
    )

    return (
      <Row style={{display:'flex'}}>
      <Col>
      <Button style={{marginRight:15}} onClick={()=>{
          const {dispatch} = this.props;
          const data = this.state.selectedRows
          console.log(219,data)
          //没有选择inv也能直接跳过去
          if(!data||data.length==0){
            dispatch(pathJump(`/invoice_management/vat_balance_details/new`))
          }else{
            let {FPCategory,clientPoId,approverId} = data[0]
            let VATBalanceStatusId = data[0].VATBalanceStatus[1]
            let isSame =false
            //要满足多条inv
            //判断这些数据是否都没有经过vat配平
            data.forEach(item=>{
              if(item.VATBalanceStatus[1] !==VATBalanceStatusId){
                message.error(`这些数据不在同一个vat balance中`)
                isSame =false
                return
              }
              if(item.FPCategory !==FPCategory ) {
                message.error(`这些数据Category 不相同`)
                isSame =false
                return
              }
              if(item.clientPoId !==clientPoId){
                message.error( `这些数据client 不相同`)
                isSame =false
                return
              }
              if(item.approverId!== approverId){
                message.error(`这些数据approver 不相同`)
                isSame =false
                return
              }
              isSame = true

            })
            if(!data[0].VATBalanceStatus[1]&&isSame&&data[0].VATBalanceStatus[2]){
              //没有配平id
              let invList = JSON.stringify(data)
              sessionStorage.setItem("invList",invList)
              dispatch(pathJump(`/invoice_management/vat_balance_details/new`))
            }else if(data[0].VATBalanceStatus[1]&&isSame){
              dispatch(pathJump(`/invoice_management/vat_balance_details/${data[0].id}`))
            }else if(isSame){
              message.error("您选择的invoices当前状态不能参与vat balance")
            }
          }
          }}>{formatMessage({id:'vat_balance'})}</Button>
        <Button style={{marginRight:15}} onClick={()=>{
          const {dispatch} = this.props;
          const data       = this.state.selectedRows||[]
          console.log(219,data)
          //没有选择inv也能直接跳过去
          if(!data||data.length==0){
            dispatch(pathJump(`/collect_balance/collect_balance_details/new`))
          }else{
          let {FPCategory,clientPoDetail:{clientId,billToId,currencyId}} = data[0]
          let collectBalanceStatusId = data[0].collectBalanceStatus[1]
            let isSame=false
            //要满足多条inv
            //判断这些数据是否都没有经过collecte配平
            data.forEach(item=>{
              if(item.collectBalanceStatus[1] !==collectBalanceStatusId){
                message.error(`这些数据不在同一个collect balance中`)
                isSame =false
                return
              }
              if(item.FPCategory !==FPCategory ) {
                message.error("Category 不相同")
                isSame =false
                return
              }
              if(!item.clientPoDetail){
                message.error("clientPoDetail不存在")
                isSame =false
                return
              }
              if (item.clientPoDetail.clientId !==clientId){
                message.error(`client 不相同`)
                isSame =false
                return
              }
              if (item.clientPoDetail.billToId !==billToId){
                message.error(`billTo 不相同`)
                isSame =false
                return
              }
              if (item.clientPoDetail.currencyId !==currencyId){
                message.error(`currency 不相同`)
                isSame =false
                return
              }
              isSame=true
            })
            if(!data[0].collectBalanceStatus[1]&&isSame&&data[0].collectBalanceStatus[2]){
              let invList = JSON.stringify(data)
              sessionStorage.setItem("invList",invList)
              dispatch(pathJump(`/collect_balance/collect_balance_details/new`))
            }else if(data[0].collectBalanceStatus[1]&&isSame){
              dispatch(pathJump(`/collect_balance/collect_balance_details/${data[0].collectBalanceStatus[1]}`))
            }else if(isSame){
              message.error("您选择的invoices当前状态不能参与collecte balance")
            }
          }
          }}>{formatMessage({id:'back_balance'})}</Button>
        <Dropdown type="primary" overlay={menu}>
          <Button>
            {formatMessage({id:'inv_flow'})} <Icon type="down" />
          </Button>
        </Dropdown>
      </Col>
        <Row style={{display:'flex',marginLeft:50,fontSize:14,paddingTop:2,marginTop:9}}>
          <p style={{marginRight:10,marginBottom:0}}>{formatMessage({id:'amount'})}</p>
          {<p style={{marginRight:20,fontWeight:'bold',marginBottom:0}}>RMB : {formatMoney(currencyAllCN/100||0)}</p>}
          {<p style={{marginRight:20,fontWeight:'bold',marginBottom:0}}>USD : {formatMoney(currencyAllUS/100||0)}</p>}
        </Row>
     </Row>
    )
  };



  handledInvoice=(operation)=>{
    const {dispatch} = this.props;
    const {intl:{formatMessage}} = this.props
    if(this.state.selectedRowKeys.length===0) return message.error(formatMessage({id:'onlyOne'}))
    this.setState({loading:true})
    let json = {
        ids:this.state.selectedRowKeys,
        operation
    }
    console.log(260,json)
    dispatch(opInvoice(json)).then(e=>{
      if(e.payload){
        this.setState({loading:false})
        message.success(formatMessage({id:'save_ok'}))
        //成功后再刷新页面的数据
        dispatch(fetchInvoice()).then(e=>{
          if(e.payload){
            //更新 selectedRowKeys,selectedRows
            const {selectedRowKeys,selectedRows} = this.state
            // console.log(361,selectedRowKeys,selectedRows)
            let _selectedRows=[]
            _selectedRows = e.payload.objs.filter(value=>{
              let a
              selectedRowKeys.forEach(item=>{
                if(value.id===item){
                  a = value
                }
              })
              return a
            })
            // console.log(372,_selectedRows)
            this.setState({
              selectedRows:_selectedRows
            })
          }
        })
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
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

  // getCollectContent = () => {
  //   const {intl:{formatMessage}} = this.props
  //   const {collectionLog} = this.state
  //   return (
  //     <Timeline>
  //       {collectionLog.size>0?
  //         collectionLog&&collectionLog.toJS().map(item=>{
  //           return <Timeline.Item key ={item}>{item.split(',')[0]}<span style={{paddingLeft:24,fontWeight:'bold'}}>{parseFloat(item.split(",")[1])/100}</span></Timeline.Item>
  //         }):<p style={{textAlign:'center',height:'82px',lineHeight:'82px'}}>{formatMessage({id:'noData'})}</p>
  //       }
  //     </Timeline>
  //   )
  // }

  render(){
    const {intl:{formatMessage},location:{pathname},vatsInv,currencyAllCN,currencyAllUS,clientPO,count,invoice,invoiceInfo,roles,ldap,placedTo,sendTo,billTo,client} = this.props;
    const { itemDes,modal_c,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage,modal_collect,collectionLog} = this.state
    //console.log('yinyinyin',billTo,placedTo,client,clientPO)
    console.log(428,collectionLog,collectionLog&&collectionLog.toJS())
    const columns = [
      {dataIndex:_inT.flowStatus,render:text => <span>{formatMessage({id:`inv_flow_${text}`})}</span>},
      {dataIndex:_inT.id,render: (text,record) =>record&&record.FPType==='creditNote'?<div><a style={{display:'block'}} onClick={()=>this.billDetails(text)}>{text}</a><a onClick={()=>this.billDetails(record.invoiceId)}>{record.invoiceId}</a></div>:<a onClick={()=>this.billDetails(text)}>{text}</a>},
      {dataIndex:_inT.description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>)},
      {dataIndex:_inT.clientPoId},
      {dataIndex:_inT.clientId,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.clientId},
      {dataIndex:_inT.currencyId,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.currencyId},
      {dataIndex:_inT.billToId,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.billToId},
      {dataIndex:_inT.placedToId,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.placedToId},
      {dataIndex:_inT.INVDate,render:date=>date&&formatDate(date)},
      {dataIndex:_inT.net,className: 'column-money',render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.tax,className: 'column-money',render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.gross,className: 'column-money',render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.dueDate},
      {dataIndex:_inT.overDue},
      {dataIndex:_inT.collectedAmount,className: 'column-money',render:(text,record)=>{
        if(record.clientPoDetail&&record.clientPoDetail.currencyId==="CNY"){
          return formatMoney(text/100||0)
        }else{
          return (<a onClick={()=>this.getCollectionLog(record)}>{formatMoney(text/100||0)}</a>)
        }
      }},
    ].map(
      item=>({
        ...item,
        key:item.dataIndex,
        title:formatMessage({id:`invoice_${item.dataIndex}`}),
      })
    );

    const renderForm=(v,column)=>{
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


    const columnMap=column=>{
      //console.log(invoiceInfo)
      let bold = column.bold
      let text
      if(invoiceInfo){
        text=column.deep?invoiceInfo.getIn(column.deep):invoiceInfo.get(column.dataIndex)
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
      {dataIndex:'flowStatus',type:'select',selectOption:Object.keys(CPOStatus).map(v=>v),placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'id_like',formTag:'input'},
      {dataIndex:'clientPoId_like',type:'selectSearch',selectOption:clientPO&&clientPO,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.clientId',type:'selectSearch',selectOption:client&&client,placeholder:formatMessage({id:'pleaseSelect'})},

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )


    this.expandColumns=[
      {dataIndex:'clientPoDetail.billToId',type:'selectSearch',selectOption:billTo&&billTo,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.placedToId',type:'selectSearch',selectOption:placedTo&&placedTo,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.currencyId',type:'select',selectOption:currency,placeholder:formatMessage({id:'pleaseSelect'})},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    const invColumns = [

//      {dataIndex:_inT.id,render: (text,record,e) => <a onClick={()=>this.billDetailsInv(text)}>{text}</a>,width: 150},
      {dataIndex:_inT.id,width: 150},
      {dataIndex:_inT.FPCategory,width:150},
      {dataIndex:_inT.description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>),width: 150},
      {dataIndex:_inT.net,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.tax,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.gross,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)},
      {dataIndex:_inT.collectedAmount,className: 'column-money',width: 200,render:(text,record)=>(<a onClick={()=>this.props.dispatch(pathJump("/collect_balance/collect_balance_details/"+record["collectBallanceId"]||"new"))}>{formatMoney(text/100||0)}</a>)},
      {dataIndex:_inT.sentToId,width: 150,render:(text,record)=>record.clientPoDetail&&record.clientPoDetail.sentToId},
      {dataIndex:_inT.approverId,width: 150},
      {dataIndex:_inT.actualInvoiceDate,width: 150,render:date=>date&&formatDate(date)},
      {dataIndex:_inT.payDate,width: 150},
      {dataIndex:_inT.overDue,width: 150},
    ].map(
      item=>({
        ...item,
        key:item.dataIndex,
        title:formatMessage({id:`invoiceE_${item.dataIndex}`}),
      })
    );

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


    let searchProps={
      formColumns : this.formColumns,
      onSave      : this.onFetch,
      rightContent: this.getcontent(),
      limit       : 99999,
      expand      : true,
      expandForm  : this.expandColumns
    };


    const expandedRowRender = (record) => {
      const _data = record.vats
      return (
        <Table
          columns={invColumns}
          dataSource={_data}
          pagination={false}
          style={{marginLeft:53}}
          rowKey={record =>record.id}
          size="small"
          border={false}
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
         <Title title={formatMessage({id:`${_tit.invoice_management}`})} />
        {billTo&&placedTo&&client&&clientPO&&<TopSearch  {...searchProps} />}
        {/*<Row style={{display:'flex',marginBottom:10}}>
          <Button type='primary' style={{marginRight:15}} onClick={this.handledInvoice.bind(null,'sentToClient')} >{formatMessage({id:'sendToCus'})}</Button>
          <Button type='primary' style={{marginRight:15}} onClick={this.handledInvoice.bind(null,'clientApprove')} >{formatMessage({id:'cusCfm'})}</Button>
          <Button type='primary' style={{marginRight:15}} onClick={this.handledInvoice.bind(null,'sendToCoordinator')} >{formatMessage({id:'sendToCo'})}</Button>
          <Button type='primary' style={{marginRight:15}} onClick={this.handledInvoice.bind(null,'sendToFinance')} >{formatMessage({id:'SendToFin'})}</Button>
          <Button type='primary' style={{marginRight:15}} onClick={this.handledInvoice.bind(null,'financeApprove')} >{formatMessage({id:'finCfm'})}</Button>
          <Button type='primary' style={{marginRight:15}} onClick={this.handledInvoice.bind(null,'clientRefuse')} >{formatMessage({id:'cusRej'})}</Button>
        </Row>*/}
        {<Table
          loading={loading}
          columns={columns}
          dataSource={invoice&&invoice.toJS()}
          pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
          //onChange={this.changeTable}
          rowSelection={rowSelection}
          expandedRowRender={record=>expandedRowRender(record)}
          scroll={{x:2230}}
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
          bordered
          rowClassName={(record,index)=>{
            let className=""
            if(record.clientPoDetail&&record.clientPoDetail.currencyId==="USD"){
              className = "no-expand"
            }

            if(!record.VATBalanceStatus[0]&&record.collectBalanceStatus[0]){
              className +=" row-invat"
            }else if(!record.collectBalanceStatus[0]&&record.VATBalanceStatus[0]){
              className += " row-incollect"
            }else if(!record.collectBalanceStatus[0]&&!record.VATBalanceStatus[0]){
              className += " row-incollect-invat"
            }else{
              {/* return index%2===0?'row-a':'row-b' */}
              if(index%2){
                className += " row-b"
              }else{
                className += " row-a"
              }
            }
            return className
          }}
        />}
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




InvoiceManagement.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) =>{
  console.log(525,state&&state.toJS())
  let _invoiceInfo = state.getIn(['invoice','invoiceInfo'])&&state.getIn(['invoice','invoiceInfo']).toJS()
  // _invoiceInfo.gross /=100
  // _invoiceInfo.tax /=100
  // _invoiceInfo.net /=100

  return ({
   invoice      : state.getIn(['invoice','invoices']),
   vatsInv      : state.getIn(['vatList','vatsInv']),
   count        : state.getIn(['invoice','count']),
   currencyAllCN: state.getIn(['invoice','currencyAllCN']),
   currencyAllUS: state.getIn(['invoice','currencyAllUS']),
   clientPO     : state.getIn(['clientPO','clientPO']),
   invoiceInfo  : Immutable.fromJS(_invoiceInfo),
   billTo       : state.getIn(['billTo','billTo']),
   client       : state.getIn(['client','client']),
   placedTo     : state.getIn(['placedTo','placedTo']),
   sendTo       : state.getIn(['sendTo','sendTo']),
 });
}

export default injectIntl(connect(mapStateToProps)(InvoiceManagement))


//const WrappedSystemUser = Form.create()();



