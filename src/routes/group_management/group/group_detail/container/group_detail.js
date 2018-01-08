/**
 * Created by Yurek on 2017/8/21.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Popconfirm,Badge,Form,InputNumber,Radio,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Menu,Tabs,Card,Table  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../../components/antd/Table'
import { EditableCell } from '../../../../../components/antd/EditableCell'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../../utils/'

import TopSearch from '../../../../../components/search/topSearch'
import Title from '../../../../../components/title/title'
import {group_tableField as _groT , host,titles as _tit ,clientPO_tableField as _cliPOT,clientPO_type as _clientPOType,currency as _cur,rootPath,groupDetails_tableField as _inT , tier1_tableField as _T1T} from '../../../../../config'
import {WORLD_COUNTRY} from '../../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,add,sub,mul,div,divHundred} from '../../../../../utils/formatData'
import { getFormRequired } from '../../../../../utils/common'
import { fetchClient } from '../../../../system_settings/client/modules/client'
import { fetchClientPO } from '../../../../clientPO/modules/client_po'
import { fetchGroup ,newGroup ,altGroup ,fetchGroupInfo, } from '../../modules/group'
import { newTier1,altTier1,delTier1 } from '../modules/group_detail'

const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment'
import './group.scss'


class GroupDetails extends React.Component{
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
      groupInfo:Immutable.fromJS([])

    }
  }



  fetchFun=()=>{
    const {dispatch,params,location} = this.props;
    dispatch(fetchGroupInfo(params.id)).then(e=>{
      console.log("eeee",e)
      if(e.payload){
        this.setState({
          groupAmount:e.payload.amount/100,
          groupRestMoney:e.payload.restAmount/100
        })
        let json = {
          'clientPoDetail.clientId':e.payload.clientId
        }
        dispatch(fetchClientPO(json))
        let arr = []
        let item = e.payload.clientPos
        item.map((v,i)=>{
          for(let a in v.clientPoDetails[0]){
            v[a] = v.clientPoDetails[0][a]
            v['amountNtax'] = this.cpoTax(v.clientPoDetails[0],'productionCost')
            v.key = i
          }

          arr.push(v)
        })

        //console.log('arrrrr',arr)
        let _tier1 = []
        e.payload.tier1s.map(v=>{
          v.amount = v.amount/100;
          v.open = v.open/100;
          v.planned = v.planned/100;
          v.committed = v.committed/100;
          _tier1.push(v)
        })
        this.setState({
          loading:false,
          dataSource:arr,
          cpoCount:e.payload.clientPos.length,
          currency:e.payload.currencyId,
          tierCount:e.payload.tier1s.length,
          dataSource_tier1:_tier1,
          groupInfo:Immutable.fromJS(e.payload)
        })
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
    if(params.id==='new_group'){

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
        if(params.id === 'new_group'){
          dispatch(newGroup(values)).then(e=>{
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
          dispatch(altGroup(params.id ,values)).then(e=>{
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
    console.log('fee',obj,fee)
    if(fee === 0) return 0
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


  handleClient = (v) => {
    const {dispatch} = this.props
    this.setState({client_id:v,loading:true})
    let json = {
      'clientPoDetail.clientId':v
    }
    dispatch(fetchClientPO(json)).then(e=>{
      if(e.payload){
        this.setState({loading:false});
      }else{
        this.setState({loading:false});
        message.error(e.error.message);
      }
    })
  };


  reduce = (v) => {
    return formatMoney(divHundred(v))
  }


  render(){
    const {intl:{formatMessage},params,location:{pathname,query},client,clientPO} = this.props;
    const { itemId ,loading,readOnly,editIndex , groupInfo, dataSource,dataSource_tier1,tier_load,groupRestMoney } = this.state
    //console.log('state',this.state)
    console.log(370,groupInfo,groupInfo&&groupInfo.toJS())
    const formColumns = [
      {dataIndex:_groT.name},
      {dataIndex:_groT.description},
      {dataIndex:_groT.clientId,FormTag:
        <Select
          disabled={this.state.readOnly}
          showSearch
          allowClear={true}
          onChange={this.handleClient}
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
          {client&&client.map(v=><Option  key={v.get('id')} value={v.get('id')}>{v.get('id')}</Option>)}
        </Select>},
      {dataIndex:_groT.startDate,FormTag:<DatePicker  disabled={this.state.readOnly} /> },
      {dataIndex:_groT.currencyId,FormTag:
        <Select
          showSearch
          allowClear={true}
          disabled={this.state.readOnly}
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          onChange={(v)=>this.setState({currency:v})}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
          {_cur.map(v=><Option key={v}>{v}</Option>)}
        </Select>},
      {dataIndex:_groT.amount,transform:this.reduce,props:{disabled:true,placeholder:formatMessage({id:'autoCal'})}},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`group_${item.dataIndex}`}),
      })
    );

    const readFormColumns = formColumns.map(
      item=>({
        ...item,
        disabled:true,
        props:{disabled:true}
      })
    )


    const columns = [
      {dataIndex:_cliPOT.operation,
        title:'Action',
        render: (text, record, index) => {
        return (
          (!this.state.readOnly?<Popconfirm title="Are you sure to delete this line" okText={'OK'} cancelText={'Cancel'} onConfirm={() => this.onDelete(index,'dataSource',true)}>
                <a href="#">{formatMessage({id:'delete'})}</a>
              </Popconfirm>:null)
        );
      },width:150},
      // {dataIndex:_cliPOT.id,render: (text, record) => (
      //   <span>
      //     <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text.length>10?<span>{text.substring(0,10)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      // </span>),width:150},
      {dataIndex:_cliPOT.description,
        title:'Client PO',
        render: (text, record, index) => (
          (!this.state.readOnly?<EditableCell
          value={<span>
            <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>30?<span>{text.substring(0,30)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
          </span>}
          onChange={this.onCellChange(index, 'description')}
          option={this.preOption(clientPO&&clientPO.toJS())}
          tag="select"
        />:text)
      )},

      {dataIndex:_groT.amountNtax,title:'Production Amount',render:text=>formatMoney(text),className: 'column-money',width:150},
      {dataIndex:_cliPOT.GADUsr,title:'GAD',width:150},
    ].map(
      item=>({
        ...item,
        //title:formatMessage({id:`clientPO_${item.dataIndex}`}),
      })
    );


    const tierColumns = [
      {dataIndex:_T1T.operation,
        children:[{
          title: 'Total',
          dataIndex:_T1T.operation,
          render: (text, record, index) => {
          return (
            <Row style={{display:'flex',justifyContent:'space-between'}}>
              <a onClick={this.saveTier.bind(this,record)} >{formatMessage({id:'save_btn'})}</a>
              <span>|</span>
              <Popconfirm title="Are you sure to delete this line" okText={'OK'} cancelText={'Cancel'}  onConfirm={() => this.onDelete(index,'dataSource_tier1',false,record)}>
                <a href="#">{formatMessage({id:'delete'})}</a>
              </Popconfirm>
            </Row>
          );
        },width:150,className:'column-center'}]
        },

      {dataIndex:_T1T.name,
        children:[{
          title: '',
          dataIndex:_T1T.name,
          render: (text, record, index) => (
            <EditableCell
              value={text}
              onChange={this.onTierCellChange(index, 'name')}
              tag="input"
              jump={()=>{
              const {dispatch} = this.props;
              dispatch(pathJump('/tier_1/tier1_detail/'+record.id))
              }}
            />
          ),width:200
        }]
        },
      {dataIndex:_T1T.amount,children:[{
        title: this.calAmount(dataSource_tier1,_T1T.amount),
        dataIndex:_T1T.amount,
        render: (text, record, index) => (
          <EditableCell
            value={formatMoney(text||0)}
            onChange={this.onTierCellChange(index, 'amount')}
            tag="input"
          />
        ),className: 'column-money th-right'}]},
      {dataIndex:_T1T.open,
        children:[{
        title: this.calAmount(dataSource_tier1,_T1T.open),
        dataIndex:_T1T.open,render:text=>formatMoney(text||0),
        className: 'column-money',}]},
      {dataIndex:_T1T.planned,
        children:[{
        title: this.calAmount(dataSource_tier1,_T1T.planned),
        dataIndex:_T1T.planned,render:text=>formatMoney(text||0),
        className: 'column-money',}]},
      {dataIndex:_T1T.committed,
        children:[{
        title: this.calAmount(dataSource_tier1,_T1T.committed),
        dataIndex: _T1T.committed,render:text=>formatMoney(text||0),
        className: 'column-money'}]},
      {dataIndex:_T1T.description,
        children:[{
          title: '',
          dataIndex:_T1T.description,
          render: (text, record, index) => (
            <EditableCell
              value={text}
              onChange={this.onTierCellChange(index, 'description')}
              tag="input"
            />
          ),width:300
        }]
        }
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`tier1_${item.dataIndex}`}),
      })
    );

    return (
      <Row>
        <Title  title={formatMessage({id:`${_tit.group_detail}`})} />
        {/* <Title  title={<Row>
            <Col span={10}>{formatMessage({id:`${_tit.group_detail}`})}</Col>
            <Col span={10} offset={4}>
              <Button onClick={()=>this.getData()}>{"自动添加测试数据"}</Button>
            </Col>
          </Row>} /> */}
        <Spin   spinning={ loading } tip="Processing...">
          <Row style={{marginTop:61}}>
            <SimpleForm columns={ readOnly?readFormColumns:formColumns } initial={params.id === 'new_group'?Immutable.fromJS([]):groupInfo} colSpan={12} labelCol={{span:7}} ref={f=>this.form=f} />
          </Row>

          <Row style={{marginTop:30}}>
            {<Table
              title={()=><p style={{fontWeight:'bold'}}>{formatMessage({id:'selectCPO'})}</p>}
              columns={columns}
              dataSource={dataSource}
              rowClassName={(e,index)=>index===editIndex?'editRow':index%2===0?'row-a':'row-b'}
              className="group-table"
              bordered
              size="middle"
              pagination={false}
              rowKey={record=>record.id}
              footer={data=>(!readOnly&&
                <Row type="flex" justify='space-between'>
                  <Col>
                    <Button disabled={readOnly} onClick={this.addNewData}><Icon type="plus" />{formatMessage({id:'add'})}</Button>
                  </Col>
                </Row>

              )}
            />
            }
          </Row>
          {!readOnly&&<Row style={{textAlign:'center',margin:'40px 0'}}>
            <Button style={{marginRight:10 }} onClick={this.handleModal}   type="primary" size="large">{formatMessage({id:'cfm'})}</Button>
            <Button style={{marginRight:10 }} onClick={()=>{ history.back()}}  size="large">{formatMessage({id:'cancel'})}</Button>
          </Row>}
        </Spin>
        {params.id!=='new_group'&&<Row>
          <Table
            loading={tier_load}
            title={()=>
            <Row style={{display:'flex'}} >
              <p style={{fontWeight:'bold'}}>{formatMessage({id:'inputTier1'})}</p>
              <Row style={{display:'flex',marginLeft:'36%'}}>
              <p style={{fontWeight:'bold'}}>{formatMessage({id:'groupRest'})} : </p>
              <p style={{fontWeight:'bold',marginLeft:5}}>{formatMoney(groupRestMoney||0)}</p>
              </Row>
            </Row>
            }

            columns={tierColumns}
            dataSource={dataSource_tier1}
            rowKey={record=>record.id}
            rowClassName={(e,index)=>index===editIndex?'editRow':index%2===0?'row-a':'row-b'}
            className="group-table"
            bordered
            size="middle"
            pagination={false}
            footer={data=>(
              <Row type="flex" justify='space-between'>
                <Col>
                  <Button  onClick={this.addNewTierData}><Icon type="plus" />{formatMessage({id:'add'})}</Button>
                </Col>
              </Row>
            )}
          />
        </Row>}
      </Row>
    )
  }
}

GroupDetails.propTypes = {
  pathJump : React.PropTypes.func,
};

const mapStateToProps = (state) =>{
  console.log(597,state&&state.toJS())
  return ({
    // groupInfo : state.getIn(['group','groupInfo']),
    client : state.getIn(['client','client']),
    clientPO : state.getIn(['clientPO','clientPO']),
  });
}

export default injectIntl(connect(mapStateToProps)(GroupDetails))
