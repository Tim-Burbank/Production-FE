/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../utils/'
import TopSearch from '../../../components/search/topSearch'
import Title from '../../../components/title/title'
import {host,titles as _tit ,clientPO_tableField as _cliPOT,rootPath,CPOStatus,clientPO_type,currency,BudgetType} from '../../../config'
import {WORLD_COUNTRY} from '../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../utils/formatData'
import {getFormRequired} from '../../../utils/common'
import { fetchClientPO ,newClientPO ,altClientPO ,fetchClientPOInfo,disabledCPO,agreeCPO} from '../modules/client_po'
import { fetchBillTo } from '../../system_settings/bill_to/modules/bill_to'
import { fetchPlacedTo } from '../../system_settings/placed_to/modules/placed_to'
import { fetchSendTo } from '../../system_settings/send_to/modules/send_to'
import { fetchClient } from '../../system_settings/client/modules/client'
const Option = Select.Option;
const Search = Input.Search;
import moment from 'moment'


class ClientPO extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      previewImage: '',
      loading     : false,
      currentPage : 1,
      modal       : false,
      modalLoad   : false,
      itemId      : null,
      modal_t     : false,
      status      : false,
      modalTLoad  : false,
      slideList   : [],
      modal_c     : false,
      itemDes     : null,
      count       : 0,

    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    dispatch(fetchBillTo());
    dispatch(fetchClient());
    dispatch(fetchPlacedTo());
    dispatch(fetchSendTo());
    dispatch(fetchClientPO()).then((e)=>{
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

  copyCPO=()=> {
    const {dispatch} = this.props;
    dispatch(pathJump('/client_po/client_po_details/copy_'+this.state.itemId))
  }

  openPSD=(v)=>{
    window.open(v);
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

  getcontent=()=>{
    const {intl:{formatMessage},currencyAllCN,currencyAllUS} = this.props
    return (
      <Row style={{display:'flex'}}>
        <Col>
          <Button onClick={()=>{
          const {dispatch} = this.props;
          dispatch(pathJump(rootPath.client_po_details+'/new'))
          }} type='primary'>{formatMessage({id:'new_btn'})}</Button>
        </Col>
        <Row style={{display:'flex',marginLeft:50,fontSize:14,paddingTop:2,marginTop:7}}>
          <span style={{marginRight:10}}>{formatMessage({id:'amount'})}</span>
          {<span style={{marginRight:20,fontWeight:'bold'}}>RMB : {formatMoney(currencyAllCN/100||0)}</span>}
          {<span style={{marginRight:20,fontWeight:'bold'}}>USD : {formatMoney(currencyAllUS/100||0)}</span>}
        </Row>
      </Row>
    )
  };

  handleDisable=()=>{
    const {dispatch} = this.props;
    const {intl:{formatMessage}} = this.props
    this.setState({modalTLoad:true})
    dispatch(disabledCPO(this.state.itemId)).then(e=>{
      if(e.payload){
        this.setState({modalTLoad:false})
        this.setState({modal_t:false})
        dispatch(fetchClientPO()).then((e)=>{
          if(e.error){
            message.error(e.error.message);
          }else{
            this.setState({
              loading: false,
              count:e.payload.count
            })
          }
        });
        message.success(formatMessage({id:'abandonSuccess'}))
      }else{
        message.error(e.error.message)
      }
    })
  }

  year=()=>{
    let arr = []
    let _y = Number(moment().format('YYYY'))
    arr.push(_y-2)
    arr.push(_y-1)
    arr.push(_y)
    arr.push(_y+1)
    return arr
  }


  render(){
    const {intl:{formatMessage},location:{pathname},count,clientPO,clientPOInfo,roles,ldap,placedTo,sendTo,billTo,client} = this.props;
    const { itemDes,modal_c,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    const columns = [
      {dataIndex:_cliPOT.flowStatus,render:text => <span>{formatMessage({id:`${text}`})}</span>,width: 200,fixed: 'left'},
      {dataIndex:_cliPOT.id,fixed: 'left',render: text => <a onClick={this.billDetails.bind(this,text)} style={{textDecoration:'underline'}} >{text}</a>,width: 130},
      {dataIndex:_cliPOT.version,width: 80,fixed: 'left'},
      {dataIndex:_cliPOT.clientId,width: 150},
      {dataIndex:_cliPOT.clientPoType,width: 150},
      {dataIndex:_cliPOT.description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>),width: 150},
      {dataIndex:_cliPOT.billToId,width: 150},
      {dataIndex:_cliPOT.placedToId,width: 150},
      {dataIndex:_cliPOT.currencyId,width: 150},
      {dataIndex:_cliPOT.amount,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)},
      {dataIndex:_cliPOT.agencyFee,className: 'column-money',width: 180,render:(text,record)=><Link to={{pathname:`/${rootPath.cpo_invoice}`,query:{type:'agencyFee',id:record&&record.get('clientPoDetailId')}} }>{formatMoney(text/100||0)}</Link>},
      {dataIndex:_cliPOT.agencyIncentive,className: 'column-money',width: 180,render:(text,record)=><Link to={{pathname:`/${rootPath.cpo_invoice}`,query:{type:'agencyIncentive',id:record&&record.get('clientPoDetailId')}} }>{formatMoney(text/100||0)}</Link>},
      {dataIndex:_cliPOT.productionCost,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)
        //render:(text,record)=><Link to={{pathname:`/${rootPath.cpo_invoice}`,query:{type:'productionCost',id:record&&record.get('clientPoDetailId')}} }>{formatMoney(text/100||0)}</Link>
      },

      {dataIndex:_cliPOT.travelCost,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)
        //render:(text,record)=><Link to={{pathname:`/${rootPath.cpo_invoice}`,query:{type:'travelCost',id:record&&record.get('clientPoDetailId')}} }>{formatMoney(text/100||0)}</Link>
       },
      {dataIndex:_cliPOT.tax,className: 'column-money',width: 180,render:text=>formatMoney(text/100||0)},
      {dataIndex:_cliPOT.POFilePath,width: 150,render:(text) => (
        <span>
        <a onClick={this.openPSD.bind(this,text)} >{formatMessage({id:'viewPO'})}</a>
      </span>)},
      {dataIndex:_cliPOT.operation,className:'th-center',
        fixed: 'right',
        render: (text,record) => (<div style={{display:'flex',justifyContent:'space-between',padding:'0 7px'}}>
          {record.get('abandonFlag') === 'Y'?<a style={{textDecoration:'underline'}} onClick={this.handleStatus.bind(this,'modal_t',record.get('id'))} >{formatMessage({id:'abandon'})}</a>:<span style={{color:'gray'}}>{formatMessage({id:'abandon'})}</span>}
          <a style={{textDecoration:'underline'}} onClick={this.handleStatus.bind(this,'modal_c',record.get('id'),record.get('description'))}>{formatMessage({id:'copy'})}</a>
        </div>),
        width: 115},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`clientPO_${item.dataIndex}`}),
      })
    );

    const formColumns = [
      {dataIndex:_cliPOT.id,fixed: 'left'},
      {dataIndex:_cliPOT.amount,width: 150,render:(data)=>formatMoney(data)},
      {dataIndex:_cliPOT.description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>10?<span>{text.substring(0,10)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>),width: 150,fixed: 'left'},
      {dataIndex:_cliPOT.agencyFee,width: 150,render:(data)=>formatMoney(data)},
      {dataIndex:_cliPOT.clientId,width: 150},
      {dataIndex:_cliPOT.agencyIncentive,width: 150,render:(data)=>formatMoney(data)},
      {dataIndex:_cliPOT.flowStatus,width: 150,formatWord:true},
      {dataIndex:_cliPOT.productionCost,width: 150,render:(data)=>formatMoney(data)},
      {dataIndex:_cliPOT.currencyId,width: 150},
      {dataIndex:_cliPOT.travelCost,width: 150,render:(data)=>formatMoney(data)},
      {dataIndex:_cliPOT.tax,width: 150,render:(data)=>formatMoney(data)},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`clientPO_${item.dataIndex}`}),
      })

    );

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


    const columnMap=column=>{
      //console.log(clientPOInfo)
      let bold = column.bold
      let text
      if(clientPOInfo){
        text=column.deep?clientPOInfo.getIn(column.deep):clientPOInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item'>
          <Col span={12}  className="payment-label" style={{color:'#999'}}>{formatMessage({id:`clientPO_${column.dataIndex}`})}</Col>
          <Col span={12}  className="payment-value" style={{color:'#333333',...bold&&{fontWeight:"bold"}}}>{
            renderForm(text,column)
          }</Col>
        </Col>
      )};


    this.formColumns=[
      {dataIndex:'clientPoDetail.year',type:'selectSearch',selectOption:this.year(),placeholder:formatMessage({id:'pleaseSelect'}),dataType:'year'},
      {dataIndex:'flowStatus',type:'select',selectOption:Object.keys(CPOStatus).map(v=>v),placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'id_like',formTag:'input'},
      {dataIndex:'clientPoDetail.description_like',formTag:'input'},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    this.expandColumns=[
      {dataIndex:'clientPoDetail.clientId',type:'selectSearch',selectOption:client&&client,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.clientPoType',type:'select',selectOption:clientPO_type,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.sentToId',type:'selectSearch',selectOption:sendTo&&sendTo,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.billToId',type:'selectSearch',selectOption:billTo&&billTo,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.placedToId',type:'selectSearch',selectOption:placedTo&&placedTo,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'clientPoDetail.currencyId',type:'select',selectOption:currency,placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'budgetType_in',type:'select',selectOption:Object.keys(BudgetType).map(v=>v),placeholder:formatMessage({id:'pleaseSelect'}),mode:'multiple',props:{style:{width:400}}},
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
    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.client_po}`})} />
        {billTo&&placedTo&&sendTo&&client&&<TopSearch  {...searchProps} />}
        <ImmutableTable
          loading={loading}
          columns={columns}
          dataSource={clientPO}
          rowKey={record =>record.get("id")}
          pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items`}}
          //onChange={this.changeTable}
          scroll={{ x: 2650 }}

        />
        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false,itemId:null,slideList:[]})}
          title={formatMessage({id:'newInfo'})}
          onOk={this.handleModal}
          maskClosable={false}
          width={600}
        >
          <Spin  spinning={ modalLoad } tip="creating..." >
            <Row>
              <SimpleForm columns={ formColumns } initial={itemId==null?Immutable.fromJS([]):clientPOInfo} colSpan={24} labelCol={{span:7}} ref={f=>this.form=f} />
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modal_t}
          onCancel={()=>this.setState({modal_t:false,itemId:null})}
          title={formatMessage({id:'abandonCfm'})}
          onOk={this.handleDisable}
          okText={formatMessage({id:'cfmDisabled'})}
          maskClosable={false}
          width={900}
        >
          <Spin  spinning={ modalTLoad } tip="Processing..." >
            <Row className="payment-read">
              {formColumns.map(columnMap)}
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modal_c}
          onCancel={()=>this.setState({modal_c:false,itemId:null})}
          title={formatMessage({id:'copyCPO'})}
          style={{top:250}}
          onOk={this.copyCPO}
          maskClosable={false}
          width={421}
        >
          <Row>
            <Row style={{fontSize:14,marginBottom:10}}>
              <Col span={10} offset={2} style={{fontWeight:'bold'}}>{formatMessage({id:`clientPO_${_cliPOT.id}`})} : </Col><Col span={12}>{itemId}</Col>
            </Row>
            <Row style={{fontSize:14}}>
              <Col span={10} offset={2} style={{fontWeight:'bold'}}>{formatMessage({id:`clientPO_${_cliPOT.description}`})} : </Col><Col span={12}>{itemDes}</Col>
            </Row>
          </Row>
        </Modal>
      </Row>
    )
  }


}


ClientPO.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) =>{
  console.log(480,state&&state.toJS())
  let _clientPOInfo = state.toJS().clientPO&&state.toJS().clientPO.clientPOInfo||{}
  console.log(182,_clientPOInfo)
  _clientPOInfo={
    ..._clientPOInfo,
    tax:_clientPOInfo.tax /=100,
    amount:_clientPOInfo.amount /=100,
    agencyFee:_clientPOInfo.agencyFee /=100,
    agencyIncentive:_clientPOInfo.agencyIncentive /=100,
    productionCost:_clientPOInfo.productionCost /=100,
    travelCost:_clientPOInfo.travelCost /=100,
  }
  return {
    clientPO : state.getIn(['clientPO','clientPO']),
    count : state.getIn(['clientPO','count']),
    clientPOInfo: Immutable.fromJS(_clientPOInfo),
    billTo : state.getIn(['billTo','billTo']),
    client : state.getIn(['client','client']),
    placedTo : state.getIn(['placedTo','placedTo']),
    sendTo : state.getIn(['sendTo','sendTo']),
    currencyAllCN : state.getIn(['clientPO','currencyAllCN']),
    currencyAllUS : state.getIn(['clientPO','currencyAllUS']),
  };
}

export default injectIntl(connect(mapStateToProps)(ClientPO))

//const WrappedSystemUser = Form.create()();



