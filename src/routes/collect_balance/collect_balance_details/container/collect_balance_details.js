/**
 * Created by Maoguijun on 2017/8/7.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Form,InputNumber,Radio,Row , message ,Card, Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Menu,Tabs  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import {AddTable,SmallSelectionTable,SelectableCell} from '../../../../components/AddTable/AddTable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {host,titles as _tit ,CollectBalance_tableField as CollectBalanceTF,currency as _cur,balanceType} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,add,sub,mul,div} from '../../../../utils/formatData'
import { getFormRequired } from '../../../../utils/common'
import { fetchCollectBalance ,newCollectBalance ,altCollectBalance ,fetchCollectBalanceInfo,fetchDisble} from '../modules/collect_balance_details'
import { fetchBillTo } from '../../../system_settings/bill_to/modules/bill_to'
import { opInvoice,fetchInvoice ,fetchInvoiceInfo ,newInvoice ,altInvoice,disabledCPO,agreeCPO} from '../../../invoice_management/modules/invoice_management'
import { fetchClient , fetchClientInfo } from '../../../system_settings/client/modules/client'
import { fetchVAT } from '../../../VAT_list/modules/VAT_list'
import './collect_balance_details.css'
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
let uuid = 9999
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment'


class CollectBalanceDetails extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      loading:false,
      currentPage:1,
      modal:false,
      modalLoad:false,
      itemId:null,
      modal_t:false,
      status:false,
      modalTLoad:false,
      slideList: [],
      ClientId: '',
      BillToId: '',
      balanceTypeId: '',
      CurrencyId:'',
      balance_collected:Immutable.fromJS([]),//已配平的数据
      balance_toCollect:Immutable.fromJS([]),//待配平的数据
      balance_credit: Immutable.fromJS([]),//已废弃或者已冲抵的
      selectOption: '',//下拉框选到的项
      isable: '',
      CNY: 0,
      total_amount: 0,
      bankCharge_amount: 0,
      selectList:[],//下拉框选项
      canSubmit:false,
      FormItems:Immutable.fromJS([]),
      withData:false,//记录是否带数据过来了
    }
  }



  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props', this.props)
    this.setState({
      isable:this.state.selectList,
    })
    dispatch(fetchBillTo());
    dispatch(fetchClient());
    // dispatch(fetchInvoice());


    // dispatch(fetchSendTo());
    if (params.id !== 'new') {
      //console.log(66,params)
      this.setState({ modalLoad: true });
      // dispatch(fetchInvoice());
      dispatch(fetchCollectBalanceInfo(params.id)).then((e)=>{
        if(e.payload){
          //console.log(89,e.payload)
          let CNY = 0;
          e.payload.obj.collectBalanceDetails.forEach(value=>{
            e.payload.invoices.map(item=>{
              if(value.invoiceId ===item.id){
                item.index = value.index
                item.clientPoIdDescription = item.clientPoDetail.description
              }
            })
            e.payload.vats.map(item=>{
              if(value.VATId ===item.id){
                item.index = value.index
                item.clientPoIdDescription = item.clientPoDetail.description
              }
            })
          })
          //排序
          e.payload.invoices.sort((a,b)=>a.index-b.index)
          e.payload.vats.sort((a,b)=>a.index-b.index)

          let balance_collected=e.payload.invoices.concat(e.payload.vats)
          balance_collected.forEach(value=>{
            CNY +=value.gross
          })

          let _FormItems = e.payload.obj
          _FormItems.amount /= 100
          _FormItems.bankCharge /= 100

          //console.log(112,balance_collected,balance_credit)
          console.log(119,CNY,e.payload)
          this.setState({
            modalLoad: false,
            CollectBalanceInfo_copy:e.payload.obj,
            invoice_copy:e.payload.invoices,
            vat_copy:e.payload.vats,
            balance_collected:Immutable.fromJS(balance_collected),
            CNY:CNY,
            total_amount:(e.payload.obj.amount)*100,
            bankCharge_amount:(e.payload.obj.bankCharge)*100,
            FormItems:Immutable.fromJS(_FormItems),
            clientId:e.payload.obj.clientId,
            currencyId:e.payload.obj.currencyId,
            billToId:e.payload.obj.billToId,
            balanceType:e.payload.obj.balanceType,
          });
          //请求invs
          let values = {
            'clientPoDetail.clientId':e.payload.obj.clientId,
            'clientPoDetail.billToId': e.payload.obj.billToId,
            'clientPoDetail.currencyId': e.payload.obj.currencyId,
          }
          if (e.payload.obj.balanceType == 'INV') {
            //console.log('发起请求')
            values = {
              ...values,
              balanceType: e.payload.obj.balanceType,
            }
            dispatch(fetchInvoice({ ...values,flowStatus:'toCollected', })).then((e) => {
              if (e.error) {
                message.error(e.error.message);
                this.setState({
                  loading: false,
                })
              } else {
                let s = []
                e.payload.objs.map(item => {
                  item.clientPoIdDescription =item.clientPoDetail&&item.clientPoDetail.description||""
                   s.push(item.id)
                })
                this.setState({
                  loading: false,
                  balance_toCollect: Immutable.fromJS(e.payload.objs),
                  selectList: s,
                })
                this.setState({isable:!this.state.selectList.length})
              }
            });
          } else if (e.payload.obj.balanceType == 'VAT') {
            values = {
              ...values,
              balanceType: e.payload.obj.balanceType,
            }
            dispatch(fetchVAT({ ...values,flowStatus:'toCollection', })).then((e) => {
              if (e.error) {
                message.error(e.error.message);
                this.setState({
                  loading: false,
                })
              } else {
                let s = []
                e.payload.objs.map(item => {
                  item.clientPoIdDescription =item.clientPoDetail&&item.clientPoDetail.description||""
                  s.push(item.id)
                })
                this.setState({
                  loading: false,
                  balance_toCollect: Immutable.fromJS(e.payload.objs),
                  selectList: s,
                })
                this.setState({isable:!this.state.selectList.length})
              }
            });
          }
        }else{
          message.error(e.error.message);
          dispatch(pathJump("/collect_balance/collect_balance_details/new"))
          this.setState({modalLoad:false})
        }
      })
      dispatch(fetchDisble(params.id)).then(e=>{
        if(e.payload){
          let _balance_credit = []
          _balance_credit.concat(e.payload.obj.vats).concat(e.payload.obj.invs)
          console.log(123,_balance_credit)
          this.setState({
            balance_credit:Immutable.fromJS(_balance_credit)
          })
        }
      })
    }else{
      //新建的时候先看看有没有带数据过来
      let invList = sessionStorage.getItem("invList")&&JSON.parse(sessionStorage.getItem("invList"))||[]
      let vatList = sessionStorage.getItem("vatList")&&JSON.parse(sessionStorage.getItem("vatList"))||[]
      let data=[] ,balanceType=""
      console.log(146,invList,vatList)
      if(!invList&&!vatList){
        return
      }
      if(invList&&invList.length){
        data = invList
        balanceType = "INV"
      }
      if(vatList&&vatList.length){
        data = vatList
        balanceType = "VAT"
      }
      if(data.length==0){
        return
      }
      this.setState({
        withData:true
      })
      const {clientPoDetail:{clientId,currencyId,billToId}}=data[0]
      let formItems ={clientId,currencyId,billToId,balanceType}
      let CNY=0
      data.map(item=>{
        CNY+=item.gross
        item.clientPoIdDescription = item.clientPoDetail.description
      })
      console.log(151,formItems)
      this.setState({
        clientId,
        billToId,
        currencyId,
        balanceType,
        CNY,
        FormItems:Immutable.fromJS(formItems),
        balance_collected:Immutable.fromJS(data),
      })
      sessionStorage.setItem("invList","")
      sessionStorage.setItem("vatList","")

      //请求invs
      let values = {
        'clientPoDetail.clientId':clientId,
        'clientPoDetail.billToId': billToId,
        'clientPoDetail.currencyId': currencyId,
      }
      if (balanceType == 'INV') {
        //console.log('发起请求')
        values = {
          ...values,
          balanceType:balanceType,
        }
        dispatch(fetchInvoice({ ...values,flowStatus:'toCollected', })).then((e) => {
          if (e.error) {
            message.error(e.error.message);
            this.setState({
              loading: false,
            })
          } else {
            let s = []
            e.payload.objs.map(item => {
              item.clientPoIdDescription =item.clientPoDetail&&item.clientPoDetail.description||""
              s.push(item.id)
            })
            s = s.filter(item=>{
              let a
              data.forEach(value=>{
                if(value.id!==item){
                  a = item
                }
              })
              return a
            })
            // console.log(282,"筛选后的invlist",s)
            this.setState({
              loading: false,
              balance_toCollect: Immutable.fromJS(e.payload.objs),
              selectList: s,
            })
            this.setState({isable:!s.length})
          }
        });
      } else if (balanceType == 'VAT') {
        values = {
          ...values,
          balanceType: balanceType,
        }
        dispatch(fetchVAT({ ...values,flowStatus:'toCollection', })).then((e) => {
          if (e.error) {
            message.error(e.error.message);
            this.setState({
              loading: false,
            })
          } else {
            let s = []
            e.payload.objs.map(item => {
              item.clientPoIdDescription =item.clientPoDetail&&item.clientPoDetail.description||""
              s.push(item.id)
            })
            s = s.filter(item=>{
              let a
              data.forEach(value=>{
                if(value.id!==item){
                  a = item
                }
              })
              return a
            })
            // console.log(282,"筛选后的invlist",s)
            this.setState({
              loading: false,
              balance_toCollect: Immutable.fromJS(e.payload.objs),
              selectList: s,
            })
            this.setState({isable:!s.length})
          }
        });
      }

    }
  }

  componentDidUpdate(nextProps, nextState) {
    //console.log(90000,this.state,nextState)
    const {dispatch, params} = this.props
    const {ClientId, BillToId,isable, balanceTypeId, CurrencyId, selectOption, balance_toCollect,balance_collected, selectList} = this.state
    //console.log(132,ClientId, BillToId, balanceTypeId, CurrencyId, selectOption)
    if (ClientId != nextState.ClientId || BillToId != nextState.BillToId|| balanceTypeId != nextState.balanceTypeId||CurrencyId != nextState.CurrencyId) {
      if (ClientId && BillToId && balanceTypeId && CurrencyId) {
        //发起请求前，初始化一些状态
        this.setState({
          selectList: [],
          isable:true,
          balance_collected:Immutable.fromJS([]),
          balance_toCollect:Immutable.fromJS([]),
          CNY:0,
          selectOption:''
        })
        let values = {
          'clientPoDetail.clientId':ClientId,
          'clientPoDetail.billToId': BillToId,
          'clientPoDetail.currencyId': CurrencyId,
        }
        if (balanceTypeId == 'INV') {
          //console.log('发起请求')
          values = {
            ...values,
            balanceType: balanceTypeId,
          }
          dispatch(fetchInvoice({ ...values,flowStatus:'toCollected', })).then((e) => {
            if (e.error) {
              message.error(e.error.message);
              this.setState({
                loading: false,
              })
            } else {
              let s = []
              e.payload.objs.forEach(item => { s.push(item.id) })
              this.setState({
                loading: false,
                balance_toCollect: Immutable.fromJS(e.payload.objs),
                selectList: s,
              })
              this.setState({isable:!this.state.selectList.length})
            }
          });
        } else if (balanceTypeId == 'VAT') {
          values = {
            ...values,
            balanceType: balanceTypeId,
          }
          dispatch(fetchVAT({ ...values,flowStatus:'toCollection', })).then((e) => {
            if (e.error) {
              message.error(e.error.message);
              this.setState({
                loading: false,
              })
            } else {
              let s = []
              e.payload.objs.forEach(item => { s.push(item.id) })
              this.setState({
                loading: false,
                balance_toCollect: Immutable.fromJS(e.payload.objs),
                selectList: s,
              })
              this.setState({isable:!this.state.selectList.length})
            }
          });
        }
      }
    }
    if (selectOption != nextState.selectOption) {
      //console.log(183, balance_toCollect, selectOption,selectList,isable)
      let sp = {}
      balance_toCollect.forEach(item => {
        //console.log(...item);
        if (item.get('id') === selectOption) {
          sp = item
        }
      })
      //console.log(190, balance_collected, sp)
      let nextSelctList = []
      selectList.forEach(item => {
        if (item !== selectOption) {
          nextSelctList.push(item)
        }
      })
      let CNY=0
      balance_collected.forEach(item=>{
        CNY += item.get('gross')
      })
      CNY += sp.get('gross')
      this.setState({
        balance_collected: Immutable.fromJS([...balance_collected.toArray(), sp]),
        selectList: nextSelctList,
        isable:!(nextSelctList.length),
        CNY:CNY
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
  render(){
    const {intl:{formatMessage},location:{pathname},count,invoice,CollectBalance,CollectBalanceInfo,params,Invoices,Vats,billTo,client} = this.props;
    const {
      loading,
      previewImage,
      currentPage,
      modal,
      modalLoad,
      itemId,
      modal_t,
      status,
      modalTLoad,
      slideList,
      ClientId,
      BillToId,
      balanceTypeId,
      CurrencyId,
      balance_collected,
      balance_toCollect,
      balance_credit,
      isable,
      CNY,
      total_amount,
      bankCharge_amount,
      selectList,
      CollectBalanceInfo_copy,
      invoice_copy,
      FormItems,
      withData,
    } = this.state
    const { getFieldDecorator, getFieldValue } = this.props.form;
    //console.log('state',this.state)
    //console.log('props', this.props)
    //console.log('CollectBalanceInfo', CollectBalanceInfo, 2)
    //console.log(204,balance_collected,balance_toCollect,balance_credit,balance_credit.size)

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
      const { params } = this.props
      const {canSubmit, CNY,bankCharge, total_amount } = this.state
     //console.log(299,this.formRef)
      this.formRef.validateFields((err,value)=>{
        if(err){
          //console.log(err)
        }else{
          //console.log(value);
          const { dispatch } = this.props
          //console.log(302,total_amount+bankCharge_amount-CNY)
          if(canSubmit || total_amount+bankCharge_amount-CNY==0){
            dispatch(fetchClientInfo(value.clientId)).then(e=>{
              if(e){
                //console.log(307,e.payload)
                value.clientDetailId = e.payload.clientDetailId
                value.amount *=100
                value.bankCharge *=100

                //console.log(310,this.tabel.data.state.dataSource)
                let collectBalanceDetails = [],dataSource = this.tabel.data.state.dataSource

                for(let i =0;i<dataSource.length;i++){
                  let obj ={}
                  obj.index = dataSource[i].get('index')
                  obj.gross = dataSource[i].get('gross')
                  obj.description = dataSource[i].get('description')
                  if(value.balanceType ==='INV'){
                    obj.invoiceId = dataSource[i].get('id')
                  }else{
                    obj.VATId = dataSource[i].get('id')
                  }
                  collectBalanceDetails.push(obj)
                }
                value.collectBalanceDetails = collectBalanceDetails
                //console.log(312,value)
                dispatch(altCollectBalance(params.id,value)).then(e=>{
                  if (e.error) {
                    message.error(e.error.message);
                  } else {
                    dispatch(pathJump('/collect_balance'))
                  }

                })
              }else{
                //console.log('没有找到'+value.clientId)
              }
            })
          }else{
            message.error('数据没有配平')
          }
        }
      })
    }


    const newCreate = () =>{
      //console.log(299,this.formRef)
      const {canSubmit, CNY,bankCharge, total_amount } = this.state
      this.formRef.validateFields((err,value)=>{
        if(err){
          //console.log(err)
        }else{
          //console.log(value);
          const { dispatch } = this.props
          //console.log(354,total_amount+bankCharge_amount-CNY)
          dispatch(fetchClientInfo(value.clientId)).then(e=>{
            if(e.error){
              message.error(e.error.message)
            }else{
              //console.log(307,e.payload)
              value.clientDetailId = e.payload.clientDetailId
              value.amount *= 100
              value.bankCharge *= 100
              //console.log(310,this.tabel)
              let collectBalanceDetails = [],dataSource = this.tabel.data.state.dataSource

              for(let i =0;i<dataSource.length;i++){
                let obj ={}
                obj.index = dataSource[i].get('index')||i
                obj.gross = dataSource[i].get('gross')
                obj.description = dataSource[i].get('description')
                if(value.balanceType ==='INV'){
                  obj.invoiceId = dataSource[i].get('id')
                }else{
                  obj.VATId = dataSource[i].get('id')
                }
                collectBalanceDetails.push(obj)
              }
              value.collectBalanceDetails = collectBalanceDetails
              console.log(312,value)
              dispatch(newCollectBalance(value)).then(e=>{
                if (e.error) {
                  message.error(e.error.message);
                } else {
                  dispatch(pathJump('/collect_balance'))
                }

              })
            }
          })
        }
      })
    }

    const validNum = {rules: [{
       type: "string",
       required: true,
       pattern: /^[0-9]*[.]?[0-9]*$/,
       transform(value){
          if(value||value===0){
            return value.toString()
          }},
    message: 'Please enter the number' }]}

    const formColumns = [
      {dataIndex:CollectBalanceTF.clientId,FormTag:
        <Select
          showSearch
          allowClear={true}
          onSelect={value=>{this.setState({ClientId:value})}}
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          disabled={(params.id!=="new"||withData)?true:false}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
        {renderOption(getSearchList(client))}
        </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] },

      },
      {dataIndex:CollectBalanceTF.billToId,FormTag:
        <Select
          showSearch
          allowClear={true}
          onSelect={value=>{this.setState({BillToId:value})}}
          placeholder={formatMessage({id:'pleaseSelect'})}
          disabled={(params.id!=="new"||withData)?true:false}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
            {renderOption(getSearchList(billTo))}
        </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] },
      },
      { dataIndex: CollectBalanceTF.amount, option: validNum, props: { onChange: e => {const value= e.target.value; this.setState({ total_amount: parseFloat(value*100)||0 }) } } },
      {dataIndex:CollectBalanceTF.bankCharge,option:validNum, props: { onChange: e => {const value= e.target.value; this.setState({ bankCharge_amount: parseFloat(value*100)||0 }) } }},
      {dataIndex:CollectBalanceTF.currencyId,FormTag:
        <Select
          showSearch
          allowClear={true}
          placeholder={formatMessage({ id: 'pleaseSelect' })}
          onSelect={value=>{this.setState({CurrencyId:value})}}
          disabled={(params.id!=="new"||withData)?true:false}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
           {renderOption(_cur)}
        </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] }
      },
      {dataIndex:CollectBalanceTF.balanceType,FormTag:
        <Select
          showSearch
          allowClear={true}
          onSelect={value=>{this.setState({balanceTypeId:value})}}
          placeholder={formatMessage({id:'pleaseSelect'})}
          disabled={(params.id!=="new"||withData)?true:false}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
           {renderOption(balanceType)}
        </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] },
      },
      {
        dataIndex: CollectBalanceTF.createdAt,
        FormTag: <DatePicker style={{ width: '100%' }}/>,
        option: { rules: [{ required: true, message: 'Please select' }] }
      },
      {dataIndex:CollectBalanceTF.Description,formTag:<Input/>},

    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `CollectBalanceDTF_${item.dataIndex}` }),
        placeholder: formatMessage({ id: `CollectBalanceDTF_${item.dataIndex}` }),
      })
    );

    const enColumns = [
      { dataIndex: CollectBalanceTF.index, render: (text,recode, index) =>index+1},
      {
        dataIndex: CollectBalanceTF.id,
        render: (text) => {
          if (text) {
            return text
          } else {
            return (<Select defaultValue={text} allowClear={true}  style={{ width: '100%' }} mode='combobox' onSelect={value => this.setState({selectOption:value})}>
              {renderOption(selectList)}
            </Select>)
          }
        }
      },
      {dataIndex:CollectBalanceTF.clientPoIdDescription,},
      { dataIndex: CollectBalanceTF.gross ,
        render:text=>formatMoney(text/100||0),
        className: 'column-money',},
      {dataIndex:CollectBalanceTF.description},
    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `CollectBalanceDTF_${item.dataIndex}` }),
      })
    );



    const disColumns = [
      ...enColumns,
      { dataIndex: CollectBalanceTF.flowStatus, render: (text) => { return(formatMessage({ id: text })) } },
    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `CollectBalanceDTF_${item.dataIndex}` }),
      })
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
        <Title title={formatMessage({id:`${_tit.collect_balance_details}`})} />
          <Spin  spinning={ modalLoad } tip={formatMessage({id:'loading'})} >
            <Row style={{marginTop:61,paddingBottom:40,borderBottom:'1px solid #e9e9e9',position:'relative'}}>
            <SimpleForm
              columns={formColumns}
              initial={ FormItems ||Immutable.fromJS([])}
              colSpan={12} labelCol={{ span: 7 }}
              onChange={this.changeForm}
              hideRequiredMark={true}
              ref={f=>{this.formRef = f}} />
            </Row>
            <Row>
            <AddTable
              rowSelection={true}
              pagination={false}
              columns={enColumns}
              dataSource={balance_collected}
              isable={isable}
              ref={t=>this.tabel = t}
              title={()=>
                <Row style={{display:'flex'}} >
                  <p style={{fontWeight:'bold'}}>{formatMessage({id:'amount_selected'})} : </p>
                  <p style={{fontWeight:'bold',marginLeft:5}}>{formatMoney(CNY/100)}</p>
                  <Row style={{display:'flex',marginLeft:'36%'}}>
                  <p style={{fontWeight:'bold'}}>{formatMessage({id:'rest'})} : </p>
                  <p style={{fontWeight:'bold',marginLeft:5}}>{formatMoney((total_amount+bankCharge_amount-CNY)/100)}</p>
                  </Row>
                </Row>
              }
            />
            </Row>

            <Row  style={{marginTop:40,textAlign:'center'}}>
              {params.id==='new'&&<Button  type='primary' size="large" style={{marginRight:10}} onClick={newCreate}>{itemId===null?formatMessage({id:'new_btn'}):formatMessage({id:'save_btn'})}</Button>}
              {params.id!=='new'&&<Button  type='primary' size="large" style={{marginRight:10}} onClick={saveChange}>{formatMessage({id:'save_change'})}</Button>}
              <Button onClick={()=>{const {dispatch} = this.props ;dispatch(pathJump('/collect_balance'))}}  size="large">{formatMessage({id:'cancel'})}</Button>
            </Row>
            {params.id!=='new'&&balance_credit.size>0&&<Row>
              <Card style={{ backgroundColor: '#ddd', marginTop: '16px' }} title='disable'>
                <ImmutableTable
                  pagination={false}
                  columns={disColumns}
                  dataSource={balance_credit}
                  rowKey={record =>record.get("id")}
                />
              </Card>
            </Row>}
          </Spin>
      </Row>
    )
  }



}


CollectBalanceDetails.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => {
  //console.log(277,...state)
  return({
    invoice : state.getIn(['invoice','invoices']),
    CollectBalance : state.getIn(['CollectBalance','CollectBalance']),
    count : state.getIn(['CollectBalance','count']),
    CollectBalanceInfo: state.getIn(['collect_balance_details','CollectBalanceInfo']),
    Invoices:state.getIn(['collect_balance_details','invoices']),
    Vats:state.getIn(['collect_balance_details','vats']),
    FormItems:state.getIn(['collect_balance_details','formItems']),
    billTo : state.getIn(['billTo','billTo']),
    client : state.getIn(['client','client']),
    // placedTo : state.getIn(['placedTo','placedTo']),
    // sendTo: state.getIn(['sendTo', 'sendTo']),
  });
}

export default Form.create()(injectIntl(connect(mapStateToProps)(CollectBalanceDetails)))
