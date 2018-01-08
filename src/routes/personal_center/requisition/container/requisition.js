/**
 * Created by Yurek on 2017/7/11.
 */
/**
 * Created by Yurek on 2017/5/11.
 */
import React from 'react'
import { injectIntl } from 'react-intl'
import { Row , message , Spin ,Button ,Tooltip,Icon,Pagination,Modal,Col,Select,Input ,DatePicker ,Menu ,Timeline} from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'

import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {titles as _tit ,requisition_tableField as _reqT,client_tableField as _cliT,product_tableField as _prodT} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchRequisition ,newRequisition ,altRequisition ,fetchRequisitionInfo } from '../modules/requisition'
import { fetchClientInfo } from '../../../system_settings/client/modules/client'
import { fetchProductRe} from '../../../system_settings/product/modules/product'
import { fetchProductInfo,newProduct,altProduct } from '../../../system_settings/product/product_details/modules/product_details'

const Option = Select.Option;
const Search = Input.Search;
const confirm = Modal.confirm;
const { TextArea } = Input;
import {List} from 'immutable'




class Requisition extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      loading : false,
      currentPage:1,
      modal:false,
      modalLoad:false,
      itemId:null,
      modal_t:false,
      status:false,
      modalTLoad:false,
      current:'pending',
      action_state:null,
      flowStatus_state:null,
      record:null,
      isTraffic :false,
      cartesis:'',
      adpCode:'',
      clientStatus: '',
      count:0,
      log:false,

    }
  }

  componentWillMount(){
    const {dispatch,params,location,userInfo} = this.props;
    //console.log('this.props',this.props)
    let _isTraffic = false
    if(userInfo){
      //console.log(userInfo.get('roles'))
      userInfo.get('roles').forEach(v=>{
          //console.log('role',v)
          if(v.get('id')==='traffic'){
            _isTraffic = true
            this.setState({isTraffic:true})
          }
        }
      )
    }
    this.setState({loading:true});
    let json = {
      applyStatus:'waitToHandle',
      // limit:13,
      // offset:0
    }


    dispatch(fetchRequisition(json)).then((e)=>{
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
    dispatch(fetchRequisition(values)).then((e)=>{
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

  submitModal = (v) => {
    const {dispatch,params,intl:{formatMessage}} = this.props;

    this.setState({modalLoad:true})
    let _action
    //console.log('action_state',this.state.action_state)
    if(this.state.action_state ==='create-client'){
      _action = 'createApp'
    }else if(this.state.action_state ==='update-client'){
      _action = 'updateApp'
    }else if(this.state.action_state ==='disable-client'){
      _action = 'disableApp'
    }else if(this.state.action_state ==='enable-client'){
      _action = 'enableApp'
    }
    let json = {
      operation:v,
      remark:this.state.comments,
      cartesisCode:this.state.cartesis,
      code:this.state.adpCode,
    }
    dispatch(altRequisition(_action,this.state.record.get('id'),json)).then(e=>{
      if(e.error){
        message.error(e.error.message)
        this.setState({
          modalLoad: false,
          itemId: null
        })
      }else{
        this.setState({
          modalLoad: false,
          modal: false,
          itemId: null,
          currentPage: 1,
          comments: null,
          cartesisCode: '',
          code: '',
          action_state:null
        })
        message.success(formatMessage({id:'save_ok'}))
        dispatch(fetchRequisition({applyStatus:'waitToHandle'}))
      }
    })
  }

  handleModal=(v)=>{
    const {dispatch,params,intl:{formatMessage}} = this.props;
    let _sub = this.submitModal
    //console.log('agree',v)
    if(v === 'disagree'){
      if(this.state.comments == null){
        message.error(formatMessage({id:'comments_tip'}))
      }else{
        _sub(v)
      }
    }else if(v === 'agree'){
      if(this.state.flowStatus_state ==='toTypeInCode'){
        if(this.state.adpCode.length ===0||this.state.cartesis.length ===0) {
          message.error(formatMessage({id:'code_tip'}))
        }else{
          confirm({
            title: formatMessage({id:'cfmCode_title'}),
            content: <div>
              <p><span>Adept Code : </span><span>{this.state.adpCode}</span></p>
              <p><span>Cartesis : </span><span>{this.state.cartesis}</span></p>
            </div>,
            onOk() {
              _sub(v)
            }
          });
        }
      } else {
        _sub(v)
      }
    }
  };




  billDetails=(id,record)=>{
    //console.log('lalala',record.toJS())
    const {dispatch} = this.props;
    this.setState({loading:true})
    let json={},action

    if(record.get("type")==="vendor"){

      sessionStorage.setItem("requestFlag",JSON.stringify(record.toJS()))
      dispatch(pathJump(`/vendor/vendor_detail_show/${record.get("commonId")}?${record.get("action")}&&${record.get("flowStatus")}`))
    }else if(record.get("type")==="client"){
      if(record.get('action') ==='create-client'){
        action = fetchClientInfo
      }else if(record.get('action') === 'update-client'){
        action = fetchClientInfo
        json.showDifferent=true
        json.updateAppId = record.get('id')

      }else if(record.get('action') === 'create-product'){
        action = fetchProductRe
      }else{
        action = fetchClientInfo
      }
    }else if(record.get("type")==="product"){
      if(record.get('action') ==='create-product'){
        action = fetchProductInfo
      }else{
        action = fetchProductInfo
      }
    }




    dispatch(action(id,json)).then(e=>{
      console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:id,action_state:record.get('action'),flowStatus_state:record.get('flowStatus'),record:record,reqType:record.get('type')})
        this.setState({loading:false})
        this.setState({modal:true})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }


  handleStatus=(status,id)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchRequisitionInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:id,status:status==1,modal_t:true})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }

  handleClick=(e)=>{
    const {dispatch,params,location,userInfo} = this.props;
    //console.log('click ', e);
    this.setState({load:true});
    this.setState({
      current: e.key,
    });
    let json;

    if(e.key == 'pending'){
      json = {
        applyStatus:'waitToHandle',
        limit:13,
        offset:0
      }
    }else if(e.key == 'processing'){
      json = {
        applyStatus:'handling',
        limit:13,
        offset:0
      }
    }else{
      json = {
        applyStatus:'handled',
        limit:13,
        offset:0
      }
    }
    dispatch(fetchRequisition(json)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({load:false})
      }else{
        this.setState({load:false})
      }
    });
  }


  getToolTip = (text) => {

    if(!text) return
    function strlen(t){
      let len = 0;
      for (let i=0; i<t.length; i++) {
        let c = t.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
          len++;
        }
        else {
          len+=2;
        }
      }
      return len;
    }

    let textL = strlen(text)

    console.log('666666',text,textL)
    return <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{textL>30?<span>{text.substring(0,13)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>
  }

  render(){
    const {intl:{formatMessage},location:{pathname},count,requisition,clientInfo,userInfo,productInfo} = this.props;
    const { reqType,log,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad,action_state,isTraffic,flowStatus_state } = this.state
    //console.log('state',this.state)
    //console.log("userInfo",userInfo)
    console.log('clientInfo',clientInfo&&clientInfo.toJS())
    console.log('--------',this.props)


    const columns = [
      {dataIndex:_reqT.commonId,render: (text,record) => <a onClick={this.billDetails.bind(this,record.get('commonId'),record)}>{text}</a>,},
      {dataIndex:_reqT.action},
      {dataIndex:_reqT.flowStatus},
      {dataIndex:_reqT.createdAt},
      {dataIndex:_reqT.createdUsr},
    ].map(
      item=>({

        ...item,
        title:formatMessage({id:`requisition_${item.dataIndex}`}),
      })
    );



    const formColumns = [
      {dataIndex:_cliT.id},
      {dataIndex:_cliT.validDate},
      {dataIndex:_cliT.code},
      {dataIndex:_cliT.creditTerm},
      {dataIndex:_cliT.cartesisCode},
      {dataIndex:_cliT.contactName},
      {dataIndex:_cliT.title},
      {dataIndex:_cliT.nameEN},
      {dataIndex:_cliT.phoneNum},
      {dataIndex:_cliT.nameCN},
      {dataIndex:_cliT.faxNum},
      {dataIndex:_cliT.approver},
      {dataIndex:_cliT.email},
      {dataIndex:_cliT.location},
      {dataIndex:_cliT.INVType},
      {dataIndex:_cliT.description,labelSpan:4,valueSpan:18,colStyle:{height:'100%'},span:24,style:{width:230,height:'100%'},valueStyle:{width:'70%'}}
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`client_${item.dataIndex}`}),
      })
    );

    const formColumns_pro = [
      {dataIndex:_prodT.name},
      {dataIndex:_prodT.currencyId},
      {dataIndex:_prodT.clientId,deep:['product','clientId']},
      {dataIndex:_prodT.validDate},
      {dataIndex:_prodT.contactName},
      {dataIndex:_prodT.title},
      {dataIndex:_prodT.phoneNum},
      {dataIndex:_prodT.email},
      {dataIndex:_prodT.faxNum},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`product_${item.dataIndex}`}),
      })
    );


    const renderForm=(v,column)=>{
      // //console.log('form',v)
      if(v == undefined || v=='') return
      if(List.isList(v)){
        return v.map(t=>t.get('id')).join(',')
      }
      if(column.trans){
        return column.trans(v,column.config)
      }else if(column.format){
        return column.format(v).map((t,i)=>(
          <Row key={i} >
            {t}
          </Row>
        ))
      }else{
        return v
      }
    }

    const columnMap=(column,data)=>{
      // //console.log('dadada',column,data)
      let bold = column.bold
      let text

      if(data){
        text=column.deep?data.getIn(column.deep):data.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 24 } className='payment-item' style={column.colStyle}>
          <span className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`client_${column.dataIndex}`})}</span>
          <span span={12}  className="payment-value" style={bold&&{fontWeight:"bold"}}>{
            renderForm(text,column)
          }</span>
        </Col>
      )};

    const renderSingleColumn = data => {
      let dom = []
       for(let k in data) {
         dom.push(<Col key={k} span={ 12 } className='payment-item' style={{width:'100%',borderRight:'0px'}}>
          <span className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`client_${k}`})}</span>
          <span className="payment-value">{
            data[k]
          }</span>
        </Col>)
      }
      //console.log('000000',dom)
    }
    this.formColumns=[
      {dataIndex:'id_like',formTag:'input'},
      {dataIndex:'nameEN_like',formTag:'input'},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    let searchProps={
      formColumns:this.formColumns,
      onSave:this.onFetch,
      //rightContent:this.getcontent()
    };
    // clientInfo&&//console.log(394,clientInfo.get('unchanged'))
    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.requisition}`})} />
        <TopSearch  {...searchProps} />
        <Menu
          onClick={this.handleClick}
          selectedKeys={[this.state.current]}
          mode="horizontal"
        >
          <Menu.Item key="pending">{formatMessage({id:'pending'})}</Menu.Item>
          <Menu.Item key="processing">{formatMessage({id:'processing'})}</Menu.Item>
          <Menu.Item key="processed">{formatMessage({id:'processed'})}</Menu.Item>
        </Menu>
        <ImmutableTable
          loading={loading}
          style={{width:'100%' }}
          columns={columns}
          dataSource={requisition}
          rowKey={record =>record.get("id")}
          pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
          //onChange={this.changeTable}
        />
        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false,itemId:null,comments:null,action_state:null})}
          title={action_state&&formatMessage({id:`${action_state}`})}
          footer={null}
          maskClosable={false}
          width={900}
        >
          <Spin  spinning={ modalLoad } tip="creating..." >
            {reqType === 'client'&&clientInfo&&!clientInfo.has('unchanged')&&<Row  className="payment-read" style={{margin:'0 25px'}}>
              {formColumns.map(v=>columnMap(v,clientInfo))}
            </Row>}
            {action_state === 'update-client' &&
              <Row>
                <p style={{marginBottom:13,textAlign:'center',fontWeight:'bold'}}>{formatMessage({id: 'unChange'})}</p>
                <Row className="payment-read" style={{margin:'0 25px'}}>
                  {clientInfo && Object.entries(clientInfo.get('unchanged').toJS()).map((v, i)=>
                    <Col key={i} span={ 12 } className='payment-item' style={{borderRight:'1px solid #d7d7d7'}}>
                      <span className="payment-label"
                            style={{fontWeight:'bold'}}>{formatMessage({id: `client_${v[0]}`})}</span>
                      <span className="payment-value">
                        {this.getToolTip(typeof v[1] === 'object' &&v[1]? v[1].map(t=>Object.values(t)).join(',') : v[1])}
                      </span>
                    </Col>
                  )}
                </Row>
              </Row>
            }
            {action_state==='create-client'&&flowStatus_state ==='toTypeInCode'&&<Row style={{display:'flex',justifyContent:'center',marginTop:63}}>
              <div style={{display:'flex',justifyContent:'start',marginRight:20}}>
                <p style={{marginRight:10,fontWeight:'bold',marginTop:5}}>{formatMessage({id:`client_${_cliT.code}`})}:</p>
                <Input style={{width:'45%'}} onChange={(e)=>{this.setState({adpCode:e.target.value})}} />
              </div>
              <div style={{display:'flex',justifyContent:'start'}}>
                <p style={{marginRight:10,fontWeight:'bold',marginTop:5}}>{formatMessage({id:`client_${_cliT.cartesisCode}`})}:</p>
                <Input style={{width:'45%'}} onChange={(e)=>{this.setState({cartesis:e.target.value})}} />
              </div>
            </Row>}
            {action_state==='update-client'&&
              <Row  className="payment-read" style={{margin:'15px 25px',borderTop:'0px',borderLeft:'0px'}}>
                <Col span={12} >
                  <p style={{marginBottom:13,textAlign:'center',fontWeight:'bold'}}>{formatMessage({id:'beforeChange'})}</p>
                  <Row style={{borderTop:'1px solid #d7d7d7',borderLeft:'1px solid #d7d7d7',borderRight:'1px solid #d7d7d7'}}>
                    {clientInfo&&Object.entries(clientInfo.get('beforeChanged').toJS()).map((v,i)=>
                      v[0]!=='clientDetailId'&&<Col key={i} span={ 12 } className='payment-item' style={{width:'100%',borderRight:'0px'}}>
                          <span className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`client_${v[0]}`})}</span>
                          <span className="payment-value">{
                            typeof v[1] ==='object'?v[1].map(t=>Object.values(t)).join(','):v[1]
                          }</span>
                        </Col>
                    )}
                  </Row>
                </Col>
                <Col span={12} >
                  <p style={{marginBottom:13,textAlign:'center',fontWeight:'bold'}}>{formatMessage({id:'afterChange'})}</p>
                  <Row style={{borderTop:'1px solid #d7d7d7',borderRight:'1px solid #d7d7d7'}}>
                    {clientInfo&&Object.entries(clientInfo.get('afterChanged').toJS()).map((v,i)=>
                      v[0]!=='clientDetailId'&&<Col key={i} span={ 12 } className='payment-item' style={{width:'100%',borderRight:'0px'}}>
                        <span className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`client_${v[0]}`})}</span>
                        <span className="payment-value">{
                          typeof v[1] ==='object'&&v[1]?v[1].map(t=>Object.values(t)).join(','):v[1]
                        }</span>
                      </Col>
                    )}
                  </Row>
                </Col>
              </Row>
            }
            {reqType === 'product'&&productInfo&&<Row  className="payment-read" style={{margin:'0 25px'}}>
              {formColumns_pro.map(v=>columnMap(v,productInfo))}
            </Row>}
            {flowStatus_state==='success'||flowStatus_state==='falied'?null:<Row style={{marginTop:6}}>
              <div style={{display:'flex',justifyContent:'center',marginTop:25 }}>
                <p style={{marginRight:10,fontWeight:'bold',marginTop:5}}>{formatMessage({id:'comments'})}:</p>
                <Input style={{width:'66%'}} onChange={(e)=>{this.setState({comments:e.target.value})}} />
              </div>
              <div style={{textAlign:'center',color:'#999',marginTop:5}}>--- {formatMessage({id:'comments_tip'})} ---</div>
              <Row style={{marginTop:30,textAlign:'center',marginBottom:30}}>
                <Button onClick={this.handleModal.bind(this,'agree')} type='primary' size="large" style={{marginRight:10}}>{formatMessage({id:'agree'})}</Button>
                <Button onClick={this.handleModal.bind(this,'disagree')} type='danger' size="large" style={{marginRight:10}}>{formatMessage({id:'disagree'})}</Button>
              </Row>
            </Row>}

            <p style={{color:'#1890ff',textDecoration:'underline',cursor:'pointer'}} onClick={()=>this.setState({log:!log})}>Logs</p>
            {clientInfo&&log&&<Row style={{marginTop:50,marginLeft:33,color:'#666',marginBottom:50}}>
              <Timeline>
                {clientInfo.get('logs').map((v,i)=>(
                  <Timeline.Item key={i}>
                    <p>
                      <span style={{textTransform:'Capitalize'}}>{v.get('operator')} </span><span>{v.get('operation')} </span><span>{v.get('type')}</span>{v.get('remark')&&<span>---{v.get('remark')}</span>}<span style={{display:'inline-block',marginLeft:10}}>{v.get('createdAt')}</span>
                    </p>
                  </Timeline.Item>))}
              </Timeline>
            </Row>}
          </Spin>
        </Modal>
      </Row>
    )

  }
}



Requisition.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  requisition : state.getIn(['requisition','requisition']),
  count : state.getIn(['requisition','count']),
  requisitionInfo: state.getIn(['requisition','requisitionInfo']),
  clientInfo: state.getIn(['client','clientInfo']),
  userInfo:state.getIn(['userInfo','userInfo']),
  productRe:state.getIn(['product','productRe']),
  productInfo: state.getIn(['productInfo','productInfo']),
});

export default injectIntl(connect(mapStateToProps)(Requisition))


//const WrappedSystemUser = Form.create()();



