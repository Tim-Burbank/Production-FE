/**
 * Created by Maoguijun on 2017/8/22.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Form,InputNumber,Radio,Row , message ,Card, Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Menu,Tabs, Popconfirm  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../../components/antd/Table'
import {AddVatTable} from '../../../../../components/AddVatTable/AddVatTable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../../utils/'
import TopSearch from '../../../../../components/search/topSearch'
import Title from '../../../../../components/title/title'
import {host,titles as _tit ,tier1_tableField as _T1TF} from '../../../../../config'
import {WORLD_COUNTRY} from '../../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,add,sub,mul,div} from '../../../../../utils/formatData'
import { getFormRequired } from '../../../../../utils/common'
import TableTitle from '../../../../../components/TableTitle/TableTitle'
import { fetchTier1 ,newTier1 ,altTier1 ,fetchTier1Info ,updateTier1,deleteTier1,newTier2,updateTier2,deleteTier2} from '../modules/tier1_details'

import './tier1_details.css'
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
let uuid = 9999
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment'


class Tier1Detail extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      isable:false,
      id:'',//
      loading:false,
      currentPage:1,
      modal:false,
      modalLoad:false,
      itemId:null,
      status:false,
      modalTLoad:false,
      tier1RestMoney:0,
      total:{
        action:'total',
        name:'',
        approverId:'',
        description:'',
        amount:0,
        open:0,
        planned:0,
        committed:0
      },

      tier2_selected:Immutable.fromJS([]),
      vatIndex:0,//vat数组的计数器
      formItems:Immutable.fromJS([]),

      isCanEdit:false,//是否可以点击编辑,false表示可以点击

    }
  }



  /**
   *
   *
   * @memberof tier1Detail
   */
  componentWillMount(){
    const {dispatch,params,location} = this.props;
    if (params.id !== 'new') {
      this.setState({ modalLoad: true });
      this.getTier1Info()
    }
  }

  getTier1Info=()=>{
    const {dispatch,params} = this.props
    dispatch(fetchTier1Info(params.id)).then(e=>{
      if(e.error){
        message.error(e.error.message)
        this.setState({ modalLoad: false });
      }else{
        //添加statusBB
        let _tier2_selected = e.payload.tier2s
        //分本位，表格展示的时候要把数据/100
        _tier2_selected = e.payload.tier2s.map(item=>(
          {
            ...item,
            amount:item.amount/100,
            open:item.open/100,
            planned:item.planned/100,
            committed:item.committed/100,
            statusBB:true
          }
        ))
        let _total = {
          amount:0,
          open:0,
          planned:0,
          committed:0
        }
        _tier2_selected.forEach(item=>{
          _total.amount +=item.amount
          _total.open +=item.open
          _total.planned +=item.planned
          _total.committed +=item.committed
        })
        //console.log(108,_tier2_selected)
        e.payload.groupName = e.payload.group.name
        e.payload.currencyId = e.payload.group.currencyId
        this.setState({
          formItems:Immutable.fromJS({...e.payload,amount:e.payload.amount/100}),
          tier2_selected:Immutable.fromJS(_tier2_selected),
          approverList:Immutable.fromJS(e.payload.group.approverIds),
          modalLoad: false,
          total:{...this.state.total,..._total},
          tier1RestMoney:e.payload.amount/100-_total.amount,
        })
      }
    })
  }

  componentDidUpdate(nextProps, nextState) {
    //console.log(90000,this.state,nextState)
    const {dispatch, params,intl:{formatMessage}} = this.props

  }
  //新增一行数据
  handleTier2Add=()=>{
    //console.log('add',this.state.vatIndex)
    let _vatIndex=this.state.vatIndex
    this.setState({
      vatIndex:_vatIndex+1,
      tier2_selected:Immutable.fromJS([...this.state.tier2_selected.toArray(),{index:_vatIndex}]),
      isable:true,
      isCanEdit:true,
    })
    //console.log(371,this.state.tier2_selected.toArray())
  }
  //修改单元格的数据
  editCell=(index,name,value)=>{
    //console.log(335,index,name,value)
    let _tier2_selected = this.state.tier2_selected.toJS()
    _tier2_selected[index][name]=value
    this.setState({
      tier2_selected:Immutable.fromJS(_tier2_selected)
    })
  }

  //保存一行数据并新建一个vat//并统计数据
  rowSave=(index)=>{
    const {dispatch,params}=this.props
    const {formItems} = this.state
    let _tier2_selected = this.state.tier2_selected.toJS()
    //分本位，发送前先乘以100
    this.formRef.validateFields((err,value)=>{
      if(value){
        let values = {
          ...value,
          groupId:formItems&&formItems.get("groupId"),
          ..._tier2_selected[index],
          amount:_tier2_selected[index].amount*100||0,
          open:_tier2_selected[index].open*100||0,
          planned:_tier2_selected[index].planned*100||0,
          committed:_tier2_selected[index].committed*100||0,
          tier1Id:params.id,
        }
        //console.log(172,values)
        dispatch(updateTier2(values.name,values)).then(e=>{
          if(e.error){
            //console.log(e.error.message)
            dispatch(newTier2(values)).then(e=>{
              if(e.error){
                message.error(e.error.message)
              }else{
                message.success('新建成功')
                //重新获取tier1Details
                this.getTier1Info()
                this.setState({
                  isable:false,
                  isCanEdit:false
                })
              }
            })
          }else{
            message.success(`${values.name}更新成功`)
            //重新获取tier1
            this.getTier1Info()
            this.setState({
              isable:false,
              isCanEdit:false
            })
          }
        })
      }
    })

  }
  //修改一行状态为可编辑
  rowEdit=(index)=>{
    const {isCanEdit} = this.state
    let _tier2_selected = this.state.tier2_selected.toJS()
    _tier2_selected[index].statusBB=false
    if(isCanEdit){
      message.info("请先保存再编辑")
      return
    }
    this.setState({
      tier2_selected:Immutable.fromJS(_tier2_selected),
      isable:true,
      isCanEdit:true
    })
  }

  //删除一条tier2
  deleteRow=(index)=>{
    //console.log(206,index)
    const {dispatch}=this.props
    let _tier2_selected = this.state.tier2_selected.toJS()
    //console.log(209,_tier2_selected[index].id)
    //如果要删除的刚好是正在编辑的，那么isCanEdit要修改为false（可以点击编辑按钮）
    console.log(231,_tier2_selected[index].statusBB)
    if(!_tier2_selected[index].statusBB){
      this.setState({
        isCanEdit:false
      })
    }
    if(_tier2_selected[index].id){
      dispatch(deleteTier2(_tier2_selected[index].id)).then(e=>{
       if(e.error){
         message.error(e.error.message)
       }else{
         message.success(`${_tier2_selected[index].name}已被删除`)
        this.getTier1Info()
        this.setState({
          isable:false
        })
       }
      })
    }else{
      //console.log(2222,_tier2_selected)
      this.setState({
        tier2_selected:Immutable.fromJS(_tier2_selected.filter((item,indexI)=>{if(index!=indexI){return item}})),
        isable:false
      })
    }
  }

  getRequiredMessage=(e,type)=>{
    return getFormRequired(this.props.intl.formatMessage({id:'input_require'},{name:e}),type)
  };
  handleSelect(state, value=1) {
    //console.log(state,value)
    this.setState({
      state:value
    })
  }

  tier2Details=(id)=>{
    const {dispatch} = this.props;
    //console.log(130,id)
    this.setState({loading:true})
    dispatch(pathJump('/tier2/'+id))
  }

  render(){
    const {intl:{formatMessage},location:{pathname},tier1Info,count,params,client} = this.props;
    const {
      loading,
      isable,
      currentPage,
      modal,
      modalLoad,
      status,
      slideList,
      formItems,
      approverList,
      tier2_selected,
      vat_toSelect,
      total,
      tier1RestMoney,
      VATisable,
      // VatBalanceInfo_copy,
      isCanEdit,
      invoice_copy,
    } = this.state
    const { getFieldDecorator, getFieldValue } = this.props.form;
    //console.log('state',this.state)
    //console.log('props', this.props)
    //console.log('tier2_selected',tier2_selected&&tier2_selected.toJS())


    //将List结构解压成数组
    const getSearchList = (List) => {
      let set = new Set()
      if (List) {
        List.toArray().forEach(item => {
          set.add(item.get('id'))
        })
      }
      return [...set]
    }


    const renderOption = (config) => {
      //console.log(269,config)
      if (config) {
        return config.map(v=> (
          <Option key={v}>{v}</Option>
        ))
      }
    }

    const saveChange = () =>{
      const {dispatch,params} =this.props
      const {formItems} = this.state
      this.formRef.validateFields((err,value)=>{
        if(err){
          //console.log(err)
        }else{
          //console.log(506,value)
          let values = {
            ...value,
            groupId:formItems&&formItems.get("groupId"),
            budgetAllocated:0,//这个到时候删除掉//后端会忽略掉的，这里就这么传
          }
          values.amount = values.amount*100
          dispatch(updateTier1(params.id,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
            }else{
              message.success(`${values.name}更新成功`)
              //console.log(321,this.state.total.amount)
              this.getTier1Info()
              this.setState({
                tier1RestMoney:parseFloat(values.amount)/100-this.state.total.amount
              })
            }
          })
        }
      })
    }

    const validNum = {
      rules: [
        {
          type: "string",
          required: true,
          pattern: /^[0-9]*[.]?[0-9]*$/,
          transform(value){ if(value){return value.toString()}},
           message: 'Please enter the number'
       }
      ]
    }

    const formColumns = [
      {dataIndex:_T1TF.name},
      {dataIndex:_T1TF.description},
      {dataIndex:_T1TF.groupName,props:{disabled:true}},
      {dataIndex:_T1TF.currencyId,props:{disabled:true}},
      {dataIndex:_T1TF.amount},

    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `tier1_${item.dataIndex}` }),
        placeholder: formatMessage({ id: `tier1_${item.dataIndex}` })
      })
    );

    //tier2表格
    const tier2Columns = [
      {
        title:TableTitle(formatMessage({ id: `tier1E_action` }),total.action),
        dataIndex:'statusBB',
        width:60,
        colSpan:2,
        render:(text,record,index)=>{
          return text?<a onClick={()=>this.rowEdit(index)}>{formatMessage({ id: `edit` })}</a>:<a onClick={()=>this.rowSave(index)}>{formatMessage({ id: `save_btn` })}</a>
        }
      },
      {
        title:'',
        colSpan:0,
        width:60,
        render:(text,record,index)=>{
          return<Popconfirm title="Are you sure to delete this line" okText={'OK'} cancelText={'Cancel'}  onConfirm={()=>this.deleteRow(index)}>
          <a href="#">{formatMessage({id:'deleteItem'})}</a>
        </Popconfirm>
        }
      },
      {
        dataIndex: _T1TF.name,
        title:TableTitle(formatMessage({ id: `tier1E_name` }),total.name),
        width:'15%',
        render: (text,record, index) => {
          if (record.get('statusBB')) {
            return <a onClick={()=>{this.tier2Details(record.get("id"))}}>{text}</a>
          } else {
            return (<Input placeholder={' Tier2'}
            style={{width:"100%"}} defaultValue={text} onBlur={e=>this.editCell(index,'name',e.target.value)}/>)
          }
        }
      },
      {
        dataIndex: _T1TF.approverId,
        title:TableTitle(formatMessage({ id: `tier1E_approverId` }),total.approverId),
        width:'15%',
        render: (text,record, index) => {
          if (record.get('statusBB')) {
            return text
          } else {
            return (
              <Select defaultValue={text} style={{ width: '100%' }}
              key={index}
              style={{width:"100%"}}
              allowClear={true}
              mode='combobox' onSelect={value=>this.editCell(index,'approverId',value)}>
                {renderOption(approverList)}
            </Select>
            )
          }
        }
      },
      { dataIndex:_T1TF.description,
        width:'15%',
        title:TableTitle(formatMessage({ id: `tier1E_description` }),total.description),
        render: (text,record, index) => {
          if (record.get('statusBB')) {
            return (
              <span>
                <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>10?<span>{text.substring(0,10)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
            </span>)
          } else {
            return (<Input placeholder={'Description'} key={index} defaultValue={text} style={{width:"100%"}} onBlur={e=>this.editCell(index,'description',e.target.value)}/>)
          }
        }
      },
      { title:TableTitle(formatMessage({ id: `tier1E_amount` }),formatMoney(total.amount)),
        dataIndex:_T1TF.amount,
        width:'15%',
        className: 'column-money',
        render:(text,record,index)=>{
          if(record.get('statusBB')){
            return formatMoney(text||'')
          }else{
            return (<Input placeholder={'Current Month Budget'} key={index} style={{width:"100%"}} defaultValue={text} onBlur={e=>{
                let value =e.target.value;
                this.editCell(index,'amount',value);
              }}/>)
            }
          },
      },
      { title:TableTitle(formatMessage({ id: `tier1E_open` }),formatMoney(total.open)),
        dataIndex:_T1TF.open,
        render:text=>formatMoney(text||''),
        width:'10%',
        className: 'column-money',
      },
      { title:TableTitle(formatMessage({ id: `tier1E_planned` }),formatMoney(total.planned)),
      dataIndex:_T1TF.planned,
      width:'10%',
      className: 'column-money',
      render:text=>formatMoney(text||''),
      },
      { title:TableTitle(formatMessage({ id: `tier1E_committed` }),formatMoney(total.committed)),
        dataIndex:_T1TF.committed,
        render:text=>formatMoney(text||''),
        width:'10%',
        className: 'column-money',
      },
    ].map(
      item=>item

    );



    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    }

    const amountLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 8, offset: 14 },
      },
    }

    return (

      <Row style={{paddingBottom:100}}>
        <Title title={`${formatMessage({id:`${_tit.tier1_detail}`})}/${tier1Info&&tier1Info.get('name')||'new'}`} />
          <Spin  spinning={ modalLoad } tip={formatMessage({id:'loading'})} >
            <Row style={{marginTop:61,paddingBottom:40,position:'relative'}}>
            <SimpleForm
              columns={formColumns}
              initial={ formItems}
              colSpan={12} labelCol={{ span: 7 }}
              onChange={this.changeForm}
              hideRequiredMark={true}
              ref={f=>{this.formRef = f}} />
            </Row>


            <Row  style={{marginTop:40,textAlign:'center',paddingBottom:'24px'}}>
              {<Button  type='primary' size="large" style={{marginRight:10}} onClick={saveChange}>{formatMessage({id:'cfm'})}</Button>}
              <Button onClick={()=>{const {dispatch} = this.props ;dispatch(pathJump('/tier_1'))}}  size="large">{formatMessage({id:'cancel'})}</Button>
            </Row>
            <Row style={{marginTop:'36px'}}>
              <ImmutableTable
                pagination={false}
                columns={tier2Columns}
                dataSource={tier2_selected}
                ref={t=>this.tabele = t}
                //scroll={{ x: 1800 }}
                rowKey={record => record.get('id')}
                size='middle'
                title={()=>
                  <Row style={{display:'flex'}} >
                    <p style={{fontWeight:'bold'}}>{formatMessage({id:'inputTier2'})}</p>
                    <Row style={{display:'flex',marginLeft:'36%'}}>
                    <p style={{fontWeight:'bold'}}>{formatMessage({id:'tier1Rest'})} : </p>
                    <p style={{fontWeight:'bold',marginLeft:5}}>{formatMoney(tier1RestMoney)}</p>
                    </Row>
                  </Row>
                }
                footer={data=>(
                  <Row type="flex" justify='space-between'>
                    <Col>
                      <Button  onClick={this.handleTier2Add} disabled={isable}><Icon type="plus" />{formatMessage({id:'add'})}</Button>
                    </Col>
                  </Row>
                )}
                />
            </Row>
          </Spin>
      </Row>
    )
  }



}


Tier1Detail.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => {
  //console.log(277,state)
  return({
    tier1Info:state.getIn(['tier1_detail','Tier1Info']),
  });
}

export default Form.create()(injectIntl(connect(mapStateToProps)(Tier1Detail)))
