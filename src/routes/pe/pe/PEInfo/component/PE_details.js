/**
 * Created by Yurek on 2017/8/21.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Timeline,Popconfirm,Badge,Form,InputNumber,Radio,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Menu,Tabs,Card,Table  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../../components/antd/Table'
import { EditableCell } from '../../../../../components/antd/EditableCell'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump,ifFin } from '../../../../../utils/'

import TopSearch from '../../../../../components/search/topSearch'
import Title from '../../../../../components/title/title'
import {group_tableField as _groT , host,titles as _tit ,clientPO_tableField as _cliPOT,clientPO_type as _clientPOType,currency as _cur,rootPath,groupDetails_tableField as _inT , tier1_tableField as _T1T,PE_tableField as _PET} from '../../../../../config'
import {WORLD_COUNTRY} from '../../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,add,sub,mul,div,divHundred} from '../../../../../utils/formatData'
import { getFormRequired } from '../../../../../utils/common'
import { fetchClient } from '../../../../system_settings/client/modules/client'
import { fetchClientPO } from '../../../../clientPO/modules/client_po'
import {fetchPEMainInfo,altPEMain } from '../../modules/PE'
// import { newTier1,altTier1,delTier1 } from '../modules/group_detail'
const { TextArea } = Input;
const Option = Select.Option;
const Search = Input.Search;
const RadioPE = Radio.PE;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment'


class PEDetails extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      itemId:null,
      modal:false,
      modalLoad:false,
      modalBp:false,
      modal_c:false,
      editIndex:-1,
      readOnly:false,  //true => group form and column can't edit
      editable: false,
      dataSource:[],
      dataSource_tier1:[],
      cpoCount:0,
      tierCount:0,
      tier_load:false,
      groupAmount:0,
      groupRestMoney:0,
      groupInfo:Immutable.fromJS([]),
      adpCode:'',
      tr_code:false,
      adHandle:false,      //客户总监审批
      finHandle:false,  //财务审批
      fmHandle:false,   //财务总监审批
      aeHandle:false,   //客户执行审批
      remark:'',
      uploadHandle:false,

    }
  }



  fetchFun=()=>{
    const {dispatch,params,location} = this.props;
    this.setState({loading:true})
    dispatch(fetchPEMainInfo(params.id)).then(e=>{
      console.log("eeee",e)
      if(e.payload){
        this.setState({loading:false})
        let item = e.payload;
        if(item.flowStatus === 'toSubmit'){
          this.setState({tr_code:true})
        }else if(item.flowStatus === 'toApproveByFM'){
          this.setState({fmHandle:true})
        }else if(item.flowStatus === 'toApproveByAD'){
          this.setState({adHandle:true})
        }else if(item.flowStatus === 'toApproveByClient'){
          this.setState({aeHandle:true})
        }else if(item.flowStatus === 'toApproveByFinance'){
          this.setState({finHandle:true})
        }else if(item.flowStatus === 'toSendToClient'){
          this.setState({uploadHandle:true})
        }

      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }



  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    dispatch(fetchClient()).then(e=>{
      if(e.payload){
        this.setState({loading:false});
      }else{
        this.setState({loading:false});
        message.error(e.error.message);
      }
    })
    if(params.id==='new'){

    }else{
      this.setState({loading:true})
      this.fetchFun()
    }
  }


  preOption=(data)=>{
    if(data){
      let arr = []
      data.map(v=>{
        if(!v.groupId&&v.currencyId===this.state.currency){
          arr.push(v)
        }
      })
      return arr
    }else{
      return []
    }
  }


  handleModal = (v) => {
    const {dispatch,params,intl:{formatMessage}} = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {
        //console.log('receive form value',values)
        this.setState({loading:true})
        //console.log('value',values)
        values = {
          ...values,
          clientPos:this.state.dataSource
        }
        if(params.id === 'new'){
          dispatch(newPE(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({loading:false})
            }else{
              this.setState({loading:false})
              message.success(formatMessage({id:'save_ok'}))
              dispatch(pathJump('/group'))
            }
          })




        }else{
          values = {
            ...values,
            clientPos:this.state.dataSource,
            id:params.id
          }
          dispatch(altPE(params.id ,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({loading:false})
            }else{
              this.setState({loading:false})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }
      }
    });
  };

  updateAmount = () => {
    const {dataSource} = this.state;
    let amount = 0
    dataSource.map(v=>{
      amount = amount+Number(v.amountNtax)
    })
    this.form.setFieldsValue({amount:amount.toFixed(2)})
  }


  cpoTax = (obj, type) => {
    let fee = obj[type]
    let taxRate = fee / (obj.amount - obj.tax)
    return ((fee+obj.tax * taxRate)/100).toFixed(2)
  }



  onCellChange = (index, key) => {
    return (value) => {
      const {clientPO}  =this.props;
      if(!clientPO) return
      const dataSource = [...this.state.dataSource];
      dataSource[index][key] = value;
      let _c = clientPO.toJS()
      _c.map(v=>{
        if(value === v.description){
          for(let a in v){
            dataSource[index][a] = v[a];
          }
        }
      })
      dataSource[index]['amountNtax'] = this.cpoTax(dataSource[index],'productionCost')
      console.log('1111111data',this.state.dataSource)
      this.setState({ dataSource },this.updateAmount);
    };
  };


  onTierCellChange = (index, key) => {
    return (value) => {
      console.log('=====',value)
      const dataSource_tier1 = [...this.state.dataSource_tier1];
      dataSource_tier1[index][key] = value;
      this.setState({ dataSource_tier1 });
    };
  }


  delTier=(record)=>{
    const {dispatch,intl:{formatMessage}} = this.props;
    this.setState({tier_load:true})
    dispatch(delTier1(record.id)).then(e=>{
      if(e.error){
        message.error(e.error.message)
        this.setState({tier_load:false})
      }else{
        this.setState({tier_load:false})
        this.fetchFun()
        message.success(formatMessage({id:'save_ok'}))
      }
    })
  }


  onDelete = (index,data,updateAmount,record) => {
    const _data = [...this.state[data]];
    let noId = false
    if(!_data[index].hasOwnProperty('id')) noId=true
    _data.splice(index, 1);
    let obj = {}
    obj[data] = _data
    if(updateAmount){
      this.setState(obj,this.updateAmount);
    }else{
      if(noId){
        this.setState(obj);
      }else{
        this.setState(obj,this.delTier(record));
      }
    }
  };


  saveTier = (data) => {
    const {dispatch,params,intl:{formatMessage}} =this.props
    //console.log(data)
    data = {
      ...data,
      groupId : params.id,
      amount : data.amount*100
    }
    this.setState({tier_load:true})
    if(data.id){
      dispatch(altTier1(data.id,data)).then(e=>{
        if(e.error){
          message.error(e.error.message)
          this.setState({tier_load:false})
        }else{
          this.setState({tier_load:false})
          this.fetchFun()
          message.success(formatMessage({id:'save_ok'}))
        }
      })
    }else{
      dispatch(newTier1(data)).then(e=>{
        if(e.error){
          message.error(e.error.message)
          this.setState({tier_load:false})
        }else{
          this.setState({tier_load:false})
          this.fetchFun()
          message.success(formatMessage({id:'save_ok'}))
        }
      })
    }
  };





  calAmount = (data,type) => {
    console.log('-----',data,type)
    let result = 0
    data.map(v=>{
      result = result + Number(v[type])
    })
    return formatMoney(result)
  }

  addNewData = () => {
    const { cpoCount, dataSource } = this.state;
    //console.log('addddd',dataSource)
    const newData = {key: cpoCount,id:'',amountNtax:'',GADUsr:'',description:''};
    this.setState({
      dataSource: [...dataSource,newData],
      cpoCount: cpoCount + 1,
    });
  }

  addNewTierData = () => {
    const { tierCount, dataSource_tier1,groupRestMoney } = this.state;
    const newData = {key: tierCount,name:'',amount:groupRestMoney,open:'',planned:'',committed:'',description:''};
    this.setState({
      dataSource_tier1: [...dataSource_tier1,newData],
      tierCount: tierCount + 1,
    });
  }

  restAmount = () => {
    const {groupAmount,dataSource_tier1} = this.state;
    let _g = groupAmount
    if(dataSource_tier1.length>0){
      dataSource_tier1.map(v=>{
        _g = _g - Number(v.amount)
      })
    }

    //console.log('rest',_g)
    if(_g<0) _g = 0
    //this.setState({groupRestMoney:_g})
    return formatMoney(_g)
  }


  handleApprove=(opt,type,json)=>{
    const { dispatch ,params,intl:{formatMessage}} = this.props;
    const {flowStatus,flowType,} = this.props;

    if(type===2&&this.state.remark.length===0) return message.error(formatMessage({id:'comments_tip'}))

    let _json = {
      ...json,
      remark:this.state.remark
    }

    if(opt ==='sendFileToClient'){
      if(!this.state.filePath) return message.warn('Please upload file!')
      _json.filePath = this.state.filePath
    }
    console.log('lllll',_json)
    this.setState({loading:true})
      dispatch(altPEMain(params.id,opt,_json)).then(e=>{
        if(e.payload){
          this.setState({loading:false});
          message.success('Operation success')
          history.back()
        }else{
          this.setState({loading:false});
          message.error(e.error.message);
        }
      })


  }

  fileChange = (state,info)=> {
    if (info.file.status !== 'uploading') {
      //console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      //console.log('upinfo',info)
      message.success(`${info.file.name} file uploaded successfully`,1);
      let obj ={}
      obj[state] = info.file.response.obj
      this.setState(obj)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`,1);
    }
  }


  reduce = (v) => {
    return formatMoney(divHundred(v))
  }


  render(){
    const {intl:{formatMessage},params,location:{pathname,query},client,PEInfo,userInfo} = this.props;
    const { uploadHandle,remark,aeHandle,fmHandle,finHandle,adHandle,tr_code,adpCode,itemId ,loading,readOnly,editIndex , groupInfo, dataSource,dataSource_tier1,tier_load,groupRestMoney } = this.state
    console.log('PEInfo',PEInfo&&PEInfo.toJS())


    const formColumns1 = [
      {dataIndex:_PET.client,deep:['clientDetail','nameEN']},
      {dataIndex:_PET.peCode},
      {dataIndex:_PET.contact},
      {dataIndex:_PET.cpo},
      {dataIndex:_PET.jobType},
      {dataIndex:_PET.product,deep:['productName',0]},
      {dataIndex:_PET.clientFile},
      {dataIndex:_PET.gad},
      {dataIndex:_PET.description,wrapStyle:{height:'100%'}},

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`PEDetail_${item.dataIndex}`}),
      })
    );

    const formColumns2 = [
      {dataIndex:_PET.currency},
      {dataIndex:_PET.net,render:formatMoney},
      {dataIndex:_PET.tax,render:formatMoney},
      {dataIndex:_PET.gross,render:formatMoney},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`PEDetail_${item.dataIndex}`}),
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



    const columnMap=column=>{
      //console.log(clientPOInfo)
      let bold = column.bold
      let text
      if(PEInfo){
        text=column.deep?PEInfo.getIn(column.deep):PEInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item' style={column.wrapStyle}>
          <Col span={12}  className="payment-label" style={{color:'#999'}}>{formatMessage({id:`PEDetail_${column.dataIndex}`})}</Col>
          <Col span={12}  className="payment-value" style={{color:'#333333',...bold&&{fontWeight:"bold"}}}>{
            renderForm(text,column)
          }</Col>
        </Col>
      )};

    const ad = ifFin('Account-Director',userInfo&&userInfo.toJS()),
      fd = ifFin('Finance-Director',userInfo&&userInfo.toJS()),
      fm = ifFin('Finance-Manager',userInfo&&userInfo.toJS()),
      tr = ifFin('traffic',userInfo&&userInfo.toJS()),
      ae = ifFin('Account-Executive',userInfo&&userInfo.toJS()),
      ifFinGroup = fd||fm

    const rightContent = params.id==='new'?null:<Row style={{margin:'27px 0',marginLeft:15}} className="inv-badge">
      <Badge status="processing"   text={`${PEInfo&&formatMessage({id:`PE_${PEInfo&&PEInfo.get('flowStatus')}`})}`} />
    </Row>


    return (
      <Row>
        <Title  title={formatMessage({id:`${_tit.PE_detail}`})}  rightContent={PEInfo&&rightContent} />
        <Spin   spinning={ loading } tip="Processing...">
          <Row style={{width:'800px',marginTop:61,paddingBottom:40,position:'relative',paddingLeft:'35px',paddingTop:'18px'}}>
            <Row style={{marginBottom:20,borderBottom:'1px solid #e9e9e9',paddingBottom:38}}>
              <p style={{margin:'5px 0 10px 0',fontWeight:'bold'}}>Client Info. </p>
              <Row className="payment-read">
                {formColumns1.map(columnMap)}
              </Row>
            </Row>
            <Row style={{borderBottom:'1px solid #e9e9e9',paddingBottom:38}}>
              <p style={{margin:5,fontWeight:'bold'}}>Amount </p>
              <Row className="payment-read">
                {formColumns2.map(columnMap)}
              </Row>
            </Row>
          </Row>
          <Row style={{position:'absolute',left:'884px',top:'12px'}}>
            <p style={{fontWeight:'bold',borderBottom:'1px solid #e9e9e9',marginBottom:20,padding:'10px 0'}}>{formatMessage({id:'cpoLog'})}</p>
            {<Timeline>
              {PEInfo&&PEInfo.has('logs')&&PEInfo.get('logs').map(v=>(
                <Timeline.Item>
                  <p>
                    <span style={{textTransform:'Capitalize'}}>{v.get('operator')} </span><span>{v.get('operation')} </span><span>{v.get('type')}</span>{v.get('remark')&&<span>---{v.get('remark')}</span>}<span style={{display:'inline-block',marginLeft:10}}>{v.get('createdAt')}</span>
                  </p>
                </Timeline.Item>))}
            </Timeline>}
          </Row>

          <Row style={{marginTop:5}}>
            {tr_code&&ae&&<Row type='flex' justify='start' style={{paddingLeft:90,marginBottom:15}}>
              <p style={{marginBottom:0,lineHeight:'28px',fontWeight:'bold'}}>Adept Code ：</p>
              <Input value={adpCode} style={{width:300}} onChange={(e)=>this.setState({adpCode:e.target.value})}/>
            </Row>}
            <Row type='flex' justify='start' style={{paddingLeft:117}}>
              <p style={{marginBottom:0,lineHeight:'91px',fontWeight:'bold'}}>Remark ：</p>
              <TextArea rows={4} style={{width:500}} value={remark} onChange={(v)=>this.setState({remark:v.target.value})}/>
            </Row>
          </Row>
          {ae&&uploadHandle&&<Row type='flex' justify='start' style={{margin:'32px 0',paddingLeft:117}}>
            <p style={{marginBottom:0,lineHeight:'28px',fontWeight:'bold',marginRight:5}}>Send file to client : </p>
            {<Upload
              name='photo'
              action={`${host}/common/upload?target=PE&name=${params.id}`}
              onChange={this.fileChange.bind(this,'filePath')}
            >
              <Button>
                <Icon type="upload" /> Click to Upload
              </Button>
            </Upload>}
          </Row>}
          <Row style={{margin:'45px 0',width:'800px'}} type='flex' justify='center'>
            {tr_code&&tr&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'submit',1,{code:adpCode})}   type="primary" size="large">{formatMessage({id:'tr-submit'})}</Button>}
            {fmHandle&&fm&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'fmApprove',1,{})}   type="primary" size="large">{formatMessage({id:'fm-approve'})}</Button>}
            {fmHandle&&fm&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'fmRefuse',2,{})}   type="danger" size="large">{formatMessage({id:'fm-disapprove'})}</Button>}
            {adHandle&&ad&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'adApprove',1,{})}   type="primary" size="large">{formatMessage({id:'ad-approve'})}</Button>}
            {adHandle&&ad&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'adRefuse',2,{})}   type="danger" size="large">{formatMessage({id:'ad-disapprove'})}</Button>}
            {uploadHandle&&ae&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'sendFileToClient',1,{})}   type="primary" size="large">{formatMessage({id:'upload-save'})}</Button>}
            {aeHandle&&ae&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'clientApprove',1,{})}   type="primary" size="large">{formatMessage({id:'ae-approve'})}</Button>}
            {aeHandle&&ae&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'clientRefuse',2,{})}   type="danger" size="large">{formatMessage({id:'ae-disapprove'})}</Button>}
            {finHandle&&ifFinGroup&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'financeApprove',1,{})}   type="primary" size="large">{formatMessage({id:'fin-approve'})}</Button>}
            {finHandle&&ifFinGroup&&<Button style={{marginRight:10 }} onClick={this.handleApprove.bind(this,'financeRefuse',2,{})}   type="danger" size="large">{formatMessage({id:'fin-disapprove'})}</Button>}
            <Button style={{marginRight:10 }} onClick={()=>{ history.back()}}  size="large">{formatMessage({id:'cancel'})}</Button>

          </Row>
          {<Row style={{textAlign:'center',margin:'40px 0'}}>
            {/*<Button style={{marginRight:10 }} onClick={this.handleModal}   type="primary" size="large">{formatMessage({id:'cfm'})}</Button>*/}
          </Row>}
        </Spin>
      </Row>
    )
  }
}

PEDetails.propTypes = {
  pathJump : React.PropTypes.func,
};

const mapStateToProps = (state) =>{
  return ({
    PEInfo : state.getIn(['PE','PEInfo']),
    userInfo : state.getIn(['userInfo','userLoginInfo']),
  });
}

export default injectIntl(connect(mapStateToProps)(PEDetails))
