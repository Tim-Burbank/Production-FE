/**
 * Created by Maoguijun on 2017/8/3.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row, message, Spin, Button, Pagination, Modal, Col, Select, Input,DatePicker, Upload, Icon, Tooltip } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../utils/'
import TopSearch from '../../../components/search/topSearch'
import Title from '../../../components/title/title'
import {host,titles as _tit ,billingPL_tableField as _billPL,rootPath,BudgetType,ClientPLStatus} from '../../../config'
import {WORLD_COUNTRY} from '../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../utils/formatData'
import {getFormRequired} from '../../../utils/common'
import { fetchBillingPlan ,newBillingPlan ,altBillingPlan ,fetchBillingPlanInfo} from '../modules/billing_plan_list'
import { fetchClientPO } from '../../clientPO/modules/client_po'
import { fetchClient } from '../../system_settings/client/modules/client'
import { fetchBillTo } from '../../system_settings/bill_to/modules/bill_to'
import moment from 'moment'
const Option = Select.Option;
const Search = Input.Search;


class BillingPlan extends React.Component{
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
      slideList: [],
      count:0,
    }
  }



  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    const values = {
      year:moment().get('year')
    }
    dispatch(fetchClientPO())
    dispatch(fetchClient())
    dispatch(fetchBillTo())
    dispatch(fetchBillingPlan(values)).then((e)=>{
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


  onFetch = (values,limit,offset,cur=1,p) =>{
    this.setState({ loading:true,currentPage:cur });
    const { dispatch } = this.props;
    const year = new Date().getFullYear();
    values.year=values.year?values.year:year
    values={
      ...values,
      limit: limit,
      offset:offset
    };
    dispatch(fetchBillingPlan(values)).then((e)=>{
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


  changeTable=(pagination, filters, sorter) => {
    //console.log(pagination, filters, sorter)
    const limit=13;
    const offset=(pagination.current-1)*limit;
    this.onFetch({},limit,offset,pagination.current,1)
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

          dispatch(newBillingPlan(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }else{
          dispatch(altBillingPlan(this.state.itemId,values)).then(e=>{
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

  handleModal_t=()=>{
    const {dispatch,billingPlanInfo} = this.props;
    this.setState({modalTLoad:true})
    let _record = billingPlanInfo.toJS()
    let action =_record.status==1?'disable':'enable'
    let json = {
      ..._record,
      status:_record.status==1?0:1
    }
    dispatch(altBillingPlan(action,this.state.itemId,json)).then(e=>{
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
    const {intl:{formatMessage},currencyAllCN,currencyAllUS} = this.props

    return (
      <Row style={{display:'flex'}}>
        <Row style={{display:'flex',marginLeft:50,fontSize:14,paddingTop:2,marginTop:7}}>
          <p style={{marginRight:10,marginBottom:0 }}>{formatMessage({id:'amount'})}</p>
          {<p style={{marginRight:20,marginBottom:0,fontWeight:'bold'}}>RMB : {formatMoney(currencyAllCN/100||0)}</p>}
          {<p style={{marginRight:20,marginBottom:0,fontWeight:'bold'}}>USD : {formatMoney(currencyAllUS/100||0)}</p>}
        </Row>
      </Row>
    )
  };
  year=()=>{
    let arr = []
    let _y = Number(moment().format('YYYY'))
    arr.push((_y-2).toString())
    arr.push((_y-1).toString())
    arr.push((_y).toString())
    arr.push((_y+1).toString())
    return arr
  }


  render(){
    const {intl:{formatMessage},location:{pathname},count,billingPlan,clientPO,billTo,client,billingPlanInfo,roles,ldap} = this.props;
    const { loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    //console.log(228,clientPO,billTo,client)

    const columns = [
      {
        dataIndex: _billPL.flowStatus,
        width: 80,
        fixed:'left',
      },
      {
        dataIndex: _billPL.INV_ID,
        fixed:'left',
        render: (text,record) =>{
          if(text&&text.size>0){
            return <div>
              {text.map(v=><a style={{display:'block',textDecoration:'underline'}} onClick={this.billDetails.bind(this, v.get('id'))}>{v.get('id')}</a>)}
            </div>
          }else{
            if(record.get('canCreateInv')){
              return <Link style={{textDecoration:'underline'}} to={{pathname:`/${rootPath.invoice_detail}/new_inv`,query:{cpo:record&&record.get('clientPoId'),option:'noBtn',bp:record&&record.get('id'),billCategory:record&&record.get('billCategory')}} }>{formatMessage({id:'new_btn'})}</Link>
            }else{
              return <span style={{color:'#e7e7e7'}} >{formatMessage({id:'new_btn'})}</span>
            }
          }
        }
      },
      {dataIndex:_billPL.clientPoId,},
      {dataIndex:_billPL.clientId,},
      {dataIndex:_billPL.billToId,},
      {dataIndex:_billPL.description,render:text=>(
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>)},
      {dataIndex:_billPL.billCategory,render:text=>formatMessage({id:text})},
      {dataIndex:_billPL.Month,render:date=>{
        if(moment(date).isBefore(moment(),'month')){
          return <span style={{color:'#e4393c'}}>{moment(date).format('YYYY-MM')}</span>
        }else{
          return moment(date).format('YYYY-MM')
        }
      }},
      {dataIndex:_billPL.currencyId,},
      {dataIndex:_billPL.net,className: 'column-money',render:text=>formatMoney(text/100||0)},
      {dataIndex:_billPL.tax,className: 'column-money',render:text=>formatMoney(text/100||0)},
      {dataIndex:_billPL.gross,className: 'column-money',render:text=>formatMoney(text/100||0)},
      {
        dataIndex: _billPL.operation,className:'column-center',
        width:100,
        fixed: 'right',
        render: (text,record) => <a style={{textDecoration:'underline'}} onClick={()=>{
        const {dispatch} = this.props;
        dispatch(pathJump('/client_po/client_po_details/'+record.get('clientPoId')))
        }}>{formatMessage({id:'edit'})}</a>},
    ].map(
      item =>({
        ...item,
        title: formatMessage({ id: `billingPL_${item.dataIndex}` }),
        width: item.width ? item.width : 150,
      })
    );
    const renderForm=(v,column)=>{
      //console.log('form',v)
      if(v === undefined || v==='') return

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


    const columnMap=column=>{
      //console.log(billingPlanInfo)
      let bold = column.bold
      let text
      if(billingPlanInfo){
        text=column.deep?billingPlanInfo.getIn(column.deep):billingPlanInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item'>
          <Col span={12}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`billPL_${column.dataIndex}`})}</Col>
          <Col span={12}  className="payment-value" style={bold&&{fontWeight:"bold"}}>{
            renderForm(text,column)
          }</Col>
        </Col>
      )
    };

    const getSearchList=(List)=>{
      let set = new Set();
      if(List&&List.size>0){
        //console.log(361,List,List.toArray())
        List.toArray().forEach(item=>{
          set.add(item.get('id'))
        })
      }
      return [...set]
    }


    this.formColumns=[
      {dataIndex:'year',type:'select',noLocal:true,selectOption:this.year(),placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'month',type:'select',noLocal:true,mode:'combobox',selectOption:['01','02','03','04','05','06','07','08','09','10','11','12'],placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'billingPlan.flowStatus',type:'select',selectOption:Object.keys(ClientPLStatus).map(v=>v),placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.clientPoId_like',type:'select',mode:'combobox',noLocal:true,selectOption:getSearchList(clientPO),placeholder:formatMessage({id:'pleaseSelect'})},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    this.expandColumns=[
      {dataIndex:'clientPoDetail.clientId_like',type:'select',mode:'combobox',noLocal:true,selectOption:getSearchList(client),placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.billToId_like',type:'select',mode:'combobox',noLocal:true,selectOption:getSearchList(billTo),placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'billingPlan.billCategory',type:'select',selectOption:Object.keys(BudgetType).map(v=>v),placeholder:formatMessage({id:'pleaseSelect'})},
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
      expand:true,
      expandForm:this.expandColumns,
    };

    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.billing_plan_list}`})} />
        <TopSearch  {...searchProps} />
        <ImmutableTable
          loading={loading}
          columns={columns}
          dataSource={billingPlan}
          pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
          //onChange={this.changeTable}
          scroll={{ x: 1820 }}
          rowKey={record =>record.get('id')}
        />
      </Row>
    )
  }
}


BillingPlan.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) =>{
  return({
    billingPlan : state.getIn(['billingPlan','billingPlan']),
    count : state.getIn(['billingPlan','count']),
    billingPlanInfo: state.getIn(['billingPlan','billingPlanInfo']),
    clientPO : state.getIn(['clientPO','clientPO']),
    client : state.getIn(['client','client']),
    billTo : state.getIn(['billTo','billTo']),
    currencyAllCN : state.getIn(['billingPlan','currencyAllCN']),
    currencyAllUS : state.getIn(['billingPlan','currencyAllUS']),
  });
}

export default injectIntl(connect(mapStateToProps)(BillingPlan))


//const WrappedSystemUser = Form.create()();



