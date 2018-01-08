/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row , message , Spin ,Button ,Pagination,Tooltip,Icon,Modal,Col,Select,Input ,DatePicker,Timeline   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'

import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {titles as _tit ,client_tableField as _cliT,client_location,client_INVType} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchClient ,newClient ,altClient ,fetchClientInfo,disabledClient,enabledClient } from '../modules/client'
import { fetchApprover } from '../../../system_settings/approver/modules/approver'
const Option = Select.Option;
const Search = Input.Search;
import moment from 'moment'
import {List} from 'immutable'
const { TextArea } = Input;


class Client extends React.Component{
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
      modal_approver:false,
      InvalidDate: null,
      count: 0,
      flow_status:null,
      log:false,

    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    let json = {
      limit:13,
      offset:0
    }
    const currentDay = new Date();
    //传入当前时间，获取有效approver
    dispatch(fetchApprover({
      validDate_lte: moment(currentDay).format('YYYY-MM-DD'),
      inValidDate_or_gte: moment(currentDay).format('YYYY-MM-DD'),
    }))
    dispatch(fetchClient(json)).then((e)=>{
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
    dispatch(fetchClient(values)).then((e)=>{
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

  handleModal = (v) => {
    const {dispatch,params,intl:{formatMessage}} = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {
        this.setState({modalLoad:true})
        values = {
          ...values,
          validDate:moment(values['validDate']).format('YYYY-MM-DD'),
          operation:v,
          INVType:values.location==='domestic'?'VAT':'INV'
        }
        if(this.state.itemId === null){
          dispatch(newClient(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.form.resetFields()
              this.setState({modalLoad:false,modal:false,itemId:null})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }else{
          dispatch(altClient(this.state.itemId,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.form.resetFields()
              this.setState({modalLoad:false,modal:false,itemId:null,currentPage:1})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }
      }
    });
  };



  billDetails=(id,status)=>{
    const {dispatch} = this.props;
    this.setState({loading:true,flow_status:status})
    dispatch(fetchClientInfo(id, {})).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:id})
        if(status==='toSubmit'){
          this.setState({modal:true,loading:false})
        }else{
          this.setState({modal_t:true,loading:false})
        }
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }



  handleStatus=(status,id)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchClientInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:id,status:status==='approved',modal_dis:true})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }

  handleEdit=(record)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchClientInfo(record.get('id'), {})).then(e=>{
      //console.log("eeee",e)
      if (e.payload) {
        this.setState({itemId:record.get('id'),status:status=='approved',modal:true})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }

  handleApproverModal=(status,id) => {
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchClientInfo(id, {})).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:id,modal_approver:true})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }


  handleModal_t=()=>{
    const {dispatch,clientInfo} = this.props;
    this.setState({modalTLoad:true})
    let _record = clientInfo.toJS()
    let action =_record.status==1?'disable':'enable'
    let json = {
      ..._record,
      status:_record.status==1?0:1
    }
    dispatch(altClient(action,this.state.itemId,json)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:null,modal_t:false,currentPage:1})
        this.setState({modalTLoad:false})
      }else{
        this.setState({modalTLoad:false})
        message.error(e.error.message)
      }
    })
  }



  handleDisabled=(status)=>{
    const {dispatch,intl:{formatMessage}} = this.props

    if(status === 'disabled'){
      if(!this.state.InvalidDate) return message.warn('Please select invalid date!')
      let json = {
        invalidDate:this.state.InvalidDate
      }
      this.setState({modalTLoad:true})
      dispatch(disabledClient(this.state.itemId,json)).then(e=>{
        if(e.payload){
          this.setState({modal_t:false,modalTLoad:false})
          message.success(formatMessage({id:'abandonSuccess'}))
        }else{
          this.setState({modalTLoad:false})
          message.error(e.error.message)
        }
      })
    }else{
      if(!this.state.validDate) return message.warn('Please select valid date!')
      let json = {
        validDate:this.state.validDate
      }
      this.setState({modalTLoad:true})
      dispatch(enabledClient(this.state.itemId,json)).then(e=>{
        if(e.payload){
          this.setState({modal_t:false,modalTLoad:false})
          message.success(formatMessage({id:'enabledSuccess'}))
        }else{
          this.setState({modalTLoad:false})
          message.error(e.error.message)
        }
      })
    }
  }


  getcontent=()=>{
    const {intl:{formatMessage}} = this.props
    return (
      <Col>
        <Button onClick={()=>{this.setState({modal:true,itemId:null})}} type='primary'>{formatMessage({id:'new_btn'})}</Button>
      </Col>
    )
  };

  //添加测试数据
  getData=()=>{
    const {dispatch} =this.props
    const data = require("../../../../testData").clientInfo
    dispatch({
      type   : "FETCH_CLIENT_INFO",
      payload: data
    })
  }


  render(){
    const { intl: { formatMessage }, location: { pathname }, client, clientInfo, approver,count } = this.props;
    const { log,flow_status,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad,modal_approver,InvalidDate } = this.state
    //console.log('state',this.state)
    // //console.log('approver',approver)
    const columns = [
      {
        dataIndex: _cliT.id,
        width: 150,
        fixed:'left',
        render: (text,record) => <a onClick={this.billDetails.bind(this, text, record.get('flowStatus'))}>{text}</a>,
      },

      {dataIndex:_cliT.flowStatus,render:text => <span>{formatMessage({id:`${text}`})}</span>},
      {dataIndex:_cliT.code,},
      {dataIndex:_cliT.validDate,},
      {dataIndex:_cliT.cartesisCode,},
      {dataIndex:_cliT.description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>)},
      {dataIndex:_cliT.nameEN,},
      {dataIndex:_cliT.nameCN,},
      {dataIndex:_cliT.brief,},
      {dataIndex:_cliT.approver,render:(text,record) => <a onClick={this.handleApproverModal.bind(this,text,record.get('id'))} >{formatMessage({id:'check'})}</a>},
      {dataIndex:_cliT.creditTerm,},
      {dataIndex:_cliT.contactName,},
      {dataIndex:_cliT.title,},
      {dataIndex:_cliT.phoneNum,},
      {dataIndex:_cliT.email,},
      {dataIndex:_cliT.location,},
      {dataIndex:_cliT.INVType,},
    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `client_${item.dataIndex}` }),
  })
    );

    const renderOption = (arr,needLocale) =>{
      return arr.map((v,i)=>(
        <Option key={i} value={v}>{v}</Option>
      ))
    };

    let handleApproverData=(data)=>{
      if (data == undefined) return []
      let _arr = [];
      data.forEach(v=>{
        _arr.push(v.get('id'))
      })
      return _arr
    }


    const formColumns = [
      {dataIndex:_cliT.id,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliT.validDate,FormTag:<DatePicker />,option:{rules: [{ required: true, message: 'Please select' }]}},
      //{dataIndex:_cliT.code},
      {dataIndex:_cliT.creditTerm,option:{rules: [{ type: "number",required: true,transform(value){ if(value&&value!=='undefined'){return Number(value)}}, message: 'Please enter the number' }]}},
      //{dataIndex:_cliT.cartesisCode},
      {dataIndex:_cliT.contactName,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliT.title},
      {dataIndex:_cliT.brief,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliT.nameEN,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliT.phoneNum,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliT.nameCN,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliT.faxNum},
      {dataIndex:_cliT.approver,FormTag:
        <Select  mode="multiple" placeholder="Please select" allowClear={true} >
          {renderOption(handleApproverData(approver))}
        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_cliT.email,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliT.location,FormTag:
        <Select  placeholder="Please select" allowClear={true} >
          {renderOption(client_location)}
        </Select>,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`client_${item.dataIndex}`}),
      })
    );

    const formColumns1 = [
      ...formColumns,
      {dataIndex:_cliT.description,labelSpan:4,valueSpan:18,colStyle:{height:'100%'},span:24,style:{width:230,height:'100%'},valueStyle:{width:'70%'}},

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`client_${item.dataIndex}`}),
      })
    );

    const formColumns2 = [
      ...formColumns,
      {dataIndex:_cliT.description,FormTag:<TextArea ></TextArea>,colSpan:24,style:{marginLeft:'-139px'}},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`client_${item.dataIndex}`}),
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


    const columnMap=column=>{
      // //console.log(clientInfo)
      let bold = column.bold
      let text
      if(clientInfo){
        // text=column.id?clientInfo.get(column.dataIndex):clientInfo.getIn('clientDetail',column.dataIndex)
        text=clientInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 24 } className='payment-item' style={column.colStyle}>
           <span span={column.labelSpan} className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`client_${column.dataIndex}`})}</span>
          <span span={column.valueSpan} className="payment-value" style={bold&&{fontWeight:"bold"}}>{
            renderForm(text,column)
          }</span>
        </Col>
      )};

    this.formColumns=[
      {dataIndex:'id_like',formTag:'input',title:"Show Name"},
      {dataIndex:'code_like',formTag:'input'},
      {dataIndex:'nameEN_like',formTag:'input'},
    ].map(
      item=>{
        if(!item.title){
          return {
          ...item,
          title:formatMessage({id:`search_${item.dataIndex}`}),
        }}else{
          return item
        }
    })


    const showEditBtn = flow_status==='approved'||flow_status==='toSubmit'||flow_status==='enabling'
    const showData = flow_status==='disabled'||flow_status==='enabling'||flow_status==='approved'
    const dis_btn = flow_status==='approved'

    let searchProps={
      formColumns:this.formColumns,
      onSave:this.onFetch,
      rightContent:this.getcontent()
    };
    // //console.log('count',count)
    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.client}`})} />
          <TopSearch  {...searchProps} />
          <ImmutableTable
          loading={loading}
          columns={columns}
          dataSource={client}
          rowKey={record =>record.get("id")}
          pagination={{ pageSize:20, total:count,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
          //onChange={this.changeTable}
          scroll={{x:2450}}
          />

        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false,itemId:null})}
          //原来的代码开始
          //title={itemId?formatMessage({id:'edit'}):formatMessage({id:'newInfo'})}
          //原来的代码结束
          //测试代码开始
          title={<div>{itemId?formatMessage({id:'edit'}):formatMessage({id:'newInfo'})}<Button onClick={()=>this.getData()}>{"填充测试数据"}</Button></div>}
          //测试代码结束
          footer={null}
          maskClosable={false}
          width={1000}
        >

          <Spin  spinning={ modalLoad } tip="creating..." >
            <Row>
              <SimpleForm columns={ formColumns2 }
              //源代码开始
              //initial={itemId===null?Immutable.fromJS([]):clientInfo}
              //源代码结束
              //测试代码开始
              initial={clientInfo}
              //测试代码结束
              colSpan={12} labelCol={{span:7}} ref={f=>this.form=f} />
            </Row>
            <Row style={{marginTop:50,textAlign:'center',marginBottom:50}}>
              <Button onClick={this.handleModal.bind(this,'submit')} type='primary' size="large" style={{marginRight:10}}>{itemId===null?formatMessage({id:'new_submit_btn'}):formatMessage({id:'save_submit_btn'})}</Button>
              {itemId === null ? <Button onClick={this.handleModal.bind(this, 'save')} type='primary' size="large" style={{ marginRight: 10 }}>{formatMessage({ id: 'new_btn' })}</Button>:''}
              <Button onClick={()=>{this.setState({modal:false})}}  size="large">{formatMessage({id:'cancel'})}</Button>
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modal_t}
          onCancel={()=>this.setState({modal_t:false,itemId:null})}
          title={formatMessage({id:'client'})}
          onOk={this.handleModal_t}
          maskClosable={false}
          width={700}
          footer={null}
        >
          <Spin  spinning={ modalTLoad } tip="creating..." >
            <Row className="payment-read">
              {formColumns1.map(columnMap)}
            </Row>
            {showData&&<Row>
                <Row style={{display:'flex',justifyContent:'center'}}>
                {flow_status==='approved'&&<div style={{display:'flex',justifyContent:'center',marginTop:40 }}>
                  <p style={{lineHeight:'10px',marginRight:10,fontWeight:'bold',marginTop:9}}>{formatMessage({id:'InvalidDate'})} :</p>
                  <DatePicker onChange={(date, dateString)=>{this.setState({InvalidDate:dateString})}} />
                </div>}
                {flow_status==='disabled'&&<div style={{display:'flex',justifyContent:'center',marginTop:40 }}>
                  <p style={{lineHeight:'10px',marginRight:10,fontWeight:'bold',marginTop:9}}>{formatMessage({id:'validDate'})} :</p>
                  <DatePicker onChange={(date, dateString)=>{this.setState({validDate:dateString})}} />
                </div>}

              </Row>
            </Row>}
            <Row style={{textAlign:'center',marginBottom:40,marginTop:20}}>
              {dis_btn&&<Button style={{marginRight:10 }} onClick={this.handleDisabled.bind(null,'disabled')}  type="danger" size="large">{formatMessage({id:'toDisabled'})}</Button>}
              {flow_status==='disabled'&&<Button style={{marginRight:10 }} onClick={this.handleDisabled.bind(null,'enabled')}  type="primary" size="large">{formatMessage({id:'toNormal'})}</Button>}
              {showEditBtn&&<Button style={{marginRight:10 }} onClick={()=>{this.setState({modal_t:false,modal:true})}}  type="primary" size="large">{formatMessage({id:'edit'})}</Button>}
              <Button style={{marginRight:10 }} onClick={()=>{this.setState({modal_t:false})}}   size="large">{formatMessage({id:'cancel'})}</Button>
            </Row>
            <p style={{color:'#1890ff',textDecoration:'underline',cursor:'pointer'}} onClick={()=>this.setState({log:!log})}>Logs</p>
            {log&&<Row style={{marginTop:50,marginLeft:33,color:'#666',marginBottom:50}}>
              <Timeline>
                {clientInfo&&clientInfo.get('logs')&&clientInfo.get('logs').map((v,i)=>(
                  <Timeline.Item key={i}>
                    <p>
                      <span style={{textTransform:'Capitalize'}}>{v.get('operator')} </span><span>{v.get('operation')} </span><span>{v.get('type')}</span>{v.get('remark')&&<span>---{v.get('remark')}</span>}<span style={{display:'inline-block',marginLeft:10}}>{v.get('createdAt')}</span>
                    </p>
                  </Timeline.Item>))}
              </Timeline>
            </Row>}
          </Spin>
        </Modal>
        <Modal
          visible={modal_approver}
          onCancel={()=>this.setState({modal_approver:false,itemId:null})}
          title={formatMessage({id:'clientApprover'})}
          maskClosable={false}
          width={500}
          footer={null}
        >
          <Row style={{marginTop:20,marginBottom:50,marginLeft:90,marginRight:90,background:'#fff'}}>
              {clientInfo&&clientInfo.get('approvers')&&clientInfo.get('approvers').size>0?clientInfo.get('approvers').map((v,i,r)=>(
                <Row>
                <p style={{padding:'10px 77px'}}>
                  <span style={{fontWeight:'bold'}}>Approver {i+1} : </span><span style={{display:'inline-block',marginLeft:10}}>{v.get('id')}</span>
                </p>
                  {i<r.toJS().length-1&&<div style={{textAlign:'center'}}>
                    <p style={{borderBottom:'1px solid #d5d5d5',margin:'0 auto'}} />
                  </div>}
                </Row>)):<p style={{textAlign:'center',background:'#f5f5f5',border:0,marginBottom:0}}>{formatMessage({id:'noData'})}</p>}
            </Row>
        </Modal>
      </Row>
    )
  }
}
Client.propTypes = {
  pathJump : React.PropTypes.func,
};



const mapStateToProps = (state) => ({
  client : state.getIn(['client','client']),
  count : state.getIn(['client','count']),
  clientInfo: state.getIn(['client','clientInfo']),
  approver : state.getIn(['approver','approver']),
});

export default injectIntl(connect(mapStateToProps)(Client))


//const WrappedSystemUser = Form.create()();



