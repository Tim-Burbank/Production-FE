/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Badge ,Timeline ,Form,InputNumber,Radio,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Menu,Tabs  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump,ifFin } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {host,titles as _tit ,clientPO_tableField as _cliPOT,clientPO_type as _clientPOType,currency as _cur} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,getScrollTop,divHundred,add,sub,mul,div} from '../../../../utils/formatData'
import { getFormRequired } from '../../../../utils/common'
import { fetchClientPO ,newClientPO ,altClientPO ,fetchClientPOInfo,disabledCPO,agreeCPO,fetchCPOId} from '../../modules/client_po'
import { fetchBillTo } from '../../../system_settings/bill_to/modules/bill_to'
import { fetchPlacedTo } from '../../../system_settings/placed_to/modules/placed_to'
import { fetchSendTo } from '../../../system_settings/send_to/modules/send_to'
import { fetchClient } from '../../../system_settings/client/modules/client'
import { fetchAuthority } from '../../../authority_management/modules/authority_management'
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
import './client_po_details.scss'


const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment'

class ClientPODetails extends React.Component{
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
      billType_state:1,
      agencyFee_State:'',
      agencyIn_State:'',
      tax_State:'',
      amount_State:'',
      avg_value:'',
      billType_fee:1,
      billValue_fee:'',
      billDate_fee:null,
      billType_in:1,
      billValue_in:'',
      billDate_in:null,
      handled_amount_fee:null,
      handled_tax_fee:null,
      handled_amountG_fee:null,
      handled_amount_in:null,
      handled_tax_in:null,
      handled_amountG_in:null,
      current:null,
      version_state:'001',
      version_changed:false,
      isCopy:false,
      currency:'CNY'
    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    dispatch(fetchBillTo());
    dispatch(fetchClient());
    dispatch(fetchPlacedTo());
    dispatch(fetchAuthority({'role.id':'Group-Account-Director'})).then(e=>{
      if(e.payload){
        this.setState({gadUser:e.payload.objs})
      }else{
        message.error(e.error.message);
      }
    })

    dispatch(fetchSendTo());
    if(params.id !== 'new'){
      //console.log('ididdiid',params.id.substring(0,5))
      if(params.id.substring(0,5) === 'copy_'){
        this.setState({modalLoad:true,isCopy:true});
        dispatch(fetchClientPOInfo(params.id.substring(5))).then((e)=>{
          if(e.payload){
            let re = e.payload
            this.setState({
              modalLoad:false,
              agencyFee_State:this.divHundred(re.agencyFee),
              agencyIn_State:this.divHundred(re.agencyIncentive),
              amount_State:this.divHundred(re.amount),
              tax_State:this.divHundred(re.tax),
              POPath:re.POFilePath,
              SOPath:re.SowFilePath,
              version_state:re.version,
              currency:re.currencyId
            });
            if(re.agencyFee||re.agencyIncentive){
              if(re.agencyFee>0){
                this.setState({current:'bill_fee'})
              }
              if(re.agencyIncentive>0){
                this.setState({current:'bill_incentive'})
              }
            }
          }else{
            message.error(e.error.message);
          }
        })
      }else{
        this.setState({modalLoad:true});
        dispatch(fetchClientPOInfo(params.id)).then((e)=>{
          if(e.payload){
            let re = e.payload
            this.setState({
              modalLoad:false,
              agencyFee_State:this.divHundred(re.agencyFee),
              agencyIn_State:this.divHundred(re.agencyIncentive),
              amount_State:this.divHundred(re.amount),
              tax_State:this.divHundred(re.tax),
              POPath:re.POFilePath,
              SOPath:re.SowFilePath,
              version_state:re.version,
              currency:re.currencyId
            });


            if(re.agencyFee||re.agencyIncentive){
              if(re.agencyFee>0){
                if(re.agencyFee>0&&re.agencyIncentive>0){
                  this.setState({current:'bill_fee'})
                  this.setState({current:'bill_incentive'})
                  this.setState({current:'bill_fee'})
                }else{
                  this.setState({current:'bill_fee'})
                }
              }else if(re.agencyIncentive>0){
                this.setState({current:'bill_incentive'})
              }
            }
            //if(re.agencyFee||re.agencyIncentive){
            //  if(re.agencyFee>0){
            //    this.setState({current:'bill_fee'})
            //  }
            //  if(re.agencyIncentive>0){
            //    this.setState({current:'bill_incentive'})
            //  }
            //}
          }else{
            message.error(e.error.message);
          }
        })
      }
    }else{

    }
  }

  componentWillUnmount(){
    window.removeEventListener('scroll',this.scrollFun)
  }

  componentDidMount(){
    const {dispatch,params,location} = this.props;
    const {version_state} = this.state
    this.form1&&this.form1.setFieldsValue({version:version_state})
    if(params.id ==='new'){
      dispatch(fetchCPOId()).then(e=>{
        if(e.payload){
          this.setState({cpoId:e.payload.id})
          this.form1&&this.form1.setFieldsValue({id:e.payload.id})
        }else{
          message.error(e.error.message);
        }
      })
    }else{
      this.setState({cpoId:params.id})
    }

    window.addEventListener('scroll',this.scrollFun)
  }

  scrollFun = ()=>{
    let _btn = this.btnCss;
    console.log('llllkjk',_btn)
    let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

    // console.log('00000',scrollTop)
    if(scrollTop>300){
      _btn.className = 'btn-normal';
    }else{
      _btn.className = 'btn-fixed';
    }
  }

  onFetch = (values,limit,offset,cur=1) =>{
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
        this.setState({loading:false})
      }
    });
  };

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


  changeTable=(pagination, filters, sorter) => {
    //console.log(pagination, filters, sorter)
    const limit=13;
    const offset=(pagination.current-1)*limit;
    this.onFetch({},limit,offset,pagination.current)
  };

  getRequiredMessage=(e,type)=>{
    return getFormRequired(this.props.intl.formatMessage({id:'input_require'},{name:e}),type)
  };

  addZeroToVersion=(v)=>{
    if(v.toString().length ===1){
      return '00'+v
    }else if(v.toString().length ===2){
      return '0'+v
    }else{
      return v
    }
  }

  openPSD=(v)=>{
    window.open(v);
  }


  deepCopy=(p, c)=> {
    var c = c || {};
    for (var i in p) {
      if (p[i]&&typeof p[i] === 'object') {
        console.log('----',p[i])
        c[i] = (p[i].constructor === Array) ? [] : {};
        this.deepCopy(p[i], c[i]);
      } else {
        c[i] = p[i];
      }
    }


    return c;
  }

  handleModal=(t,type='update')=> {
    const {dispatch,params,intl:{formatMessage},clientPOInfo} = this.props;
    const { getFieldsValue} = this.props.form;
    const {billType_fee,billType_in} = this.state

    this.form1.validateFieldsAndScroll((err, values1) => {
      if (!err) {
        this.form2.validateFieldsAndScroll((err, values2) => {
          if (!err) {
            this.form3.validateFieldsAndScroll((err, values3) => {
              if (!err) {
                if(!values3.agencyFee&&!values3.agencyIncentive&&!values3.productionCost&&!values3.travelCost) return message.error(formatMessage({id:'inputOneFee'}))
                let a = getFieldsValue()
                let g = this.deepCopy(getFieldsValue())



                let billPlan = []
                for (let k in g) {
                  if (k.substring(0, 2) == 'fe') {
                    if(g[k]!==undefined){
                      g[k]['billCategory'] = "agencyFee"
                      g[k]['billType'] = billType_fee === 1 ? 'byMonth' : 'byPercentage'
                      g[k].net = this.mulHundred(Number(g[k].amount))
                      g[k].gross = this.mulHundred(Number(g[k].amountG))
                      g[k].percentage = (g[k].per/100).toFixed(2)
                      g[k].date = moment(g[k].date).format('YYYY-MM-DD')
                      g[k].index = k.substring(4)
                      g[k].tax = this.mulHundred(Number(g[k].tax))
                      billPlan.push(g[k])
                    }
                  } else if(k.substring(0, 2) == 'in') {
                    if(g[k]!==undefined) {
                      g[k]['billCategory'] = "agencyIncentive"
                      g[k]['billType'] = billType_in === 1 ? 'byMonth' : 'byPercentage'
                      g[k].net = this.mulHundred(Number(g[k].amount))
                      g[k].gross = this.mulHundred(Number(g[k].amountG))
                      g[k].percentage = (g[k].per / 100).toFixed(2)
                      g[k].date = moment(g[k].date).format('YYYY-MM-DD')
                      g[k].index = k.substring(3)
                      g[k].tax = this.mulHundred(Number(g[k].tax))
                      billPlan.push(g[k])
                    }
                  }
                }

                let values = {
                  ...values1,
                  ...values2,
                  ...values3,
                }


                values.startDate = moment(values.startDate).format('YYYY-MM-DD')
                values.billingPlans = billPlan
                values.operation = t
                values.POFilePath = this.state.POPath
                values.SowFilePath = this.state.SOPath
                values.agencyFee =values.agencyFee?this.mulHundred(values.agencyFee):0
                values.agencyIncentive = values.agencyIncentive?this.mulHundred(values.agencyIncentive):0
                values.productionCost = values.productionCost?this.mulHundred(values.productionCost):0
                values.travelCost = values.travelCost?this.mulHundred(values.travelCost):0
                values.tax = this.mulHundred(values.tax)
                values.amount = this.mulHundred(values.amount)
                values.version = this.addZeroToVersion(values.version)


                this.setState({modalLoad:true})
                if(params.id === 'new' || params.id.substring(0,5) === 'copy_'){
                  dispatch(newClientPO(values)).then(e=>{
                    if(e.payload){
                      //console.log('already-eee')
                      this.setState({modalLoad:false})
                      message.success(formatMessage({id:'save_ok'}))
                      dispatch(pathJump('/client_po'))
                    }else{
                      this.setState({modalLoad:false})
                      message.error(e.error.message)
                    }
                  })

                }else {
                  let action
                  if(type ==='agree'){
                    action=agreeCPO
                  }else{
                    action=altClientPO
                  }
                  dispatch(action(params.id,values)).then(e=>{
                    if(e.payload){
                      //console.log('already-eee')
                      this.setState({modalLoad:false})
                      message.success(formatMessage({id:'save_ok'}))
                      dispatch(pathJump('/client_po'))
                    }else{
                      this.setState({modalLoad:false})
                      message.error(e.error.message)
                    }
                  })
                }
              }

            })
          }
        })
      }else{
        window.scrollTo(0,0)
      }
    });
  }

  setCountry=(e)=>{
    const {sendTo} = this.props
    sendTo.forEach(v=>{
      if(v.get('id') === e){
        this.form2.setFieldsValue({country:v.get('country'),city:v.get('city')})
      }
    })
  }

  setCreditTerm=(e)=>{
    const {client} = this.props
    client.forEach(v=>{
      if(v.get('clientDetailId') === e){
        this.form2.setFieldsValue({creditTerm:v.get('creditTerm')})
      }
    })
  }



  handleChange=(title,type,noTimeOut,target)=>{

    //console.log('value',title,type,target)
    if(this.timer){
      clearTimeout(this.timer);
    }
    let e = type==='date'?target:target.target.value
    let obj = {}
    obj[title] = e
    if(noTimeOut){
      this.setState(obj);
    }else{
      this.timer = setTimeout(()=>{
        this.setState(obj);
      },1000);
    }

  }
  calculateTax=(tax,fee,amount)=>{
    if(tax&&fee&&amount){
      return mul(tax,div(fee,sub(amount,tax))).toFixed(2)
    }
  }

  calculateAmountGross=(fee,tax)=>{
    if(fee&&tax){
      return add(fee,tax).toFixed(2)
    }
  }



   autoField = (a,b) => {
     const { amount_State,tax_State} = this.state

    let obj = {};
     let _tax = this.calculateTax(tax_State,b,amount_State)
    obj[a] = b;
    obj['tax'] = _tax
    obj[a+'Gross'] = this.calculateAmountGross(b,_tax)
    return Immutable.fromJS(obj);
  };

  mulHundred = (v) => {
    return mul(100,v)
  }

  divHundred =(v)=>{
    return div(v,100)
  }
  remove = (index,key,keys,k) => {
    const { form,params } = this.props;
    if(k.status === 'billing') return
    const keyss = form.getFieldValue(key);
    console.log('ppp')
  //  keys.splice(index,1);
  //  let obj = {};
  //  obj[key] = keys,
  //    console.log('objobjbo',obj)
  //  form.setFieldsValue(obj);
    form.setFieldsValue({
      [key]: keyss.filter(_keys => _keys !== k),
    });
  };



  add = (key) => {
    const { form } = this.props;
    const keys = form.getFieldValue(key)||[];
    const uuid = {amount:'',amountG:'',date:moment(keys[keys.length-1]['date']).add(1,'months'),per:'',tax:'',keys:Math.round((Math.random()*10000000))}
    const nextKeys = keys.concat(uuid);
    let obj = {};
    obj[key] = nextKeys;
    form.setFieldsValue(obj);
  };

  reduce = (v) => {
    return formatMoney(divHundred(v))
  }




  changedVersion=()=>{
    const {version_state,version_changed} = this.state
    //console.log('version_state',version_state)
    if(!version_changed){
      let _v = version_state.toString();
      let _vArr = _v.split('');
      let _needNum = []
      _vArr.map(v=>{
        if(v !== '0'){
          _needNum.push(v)
        }
      });
      let _num = this.addZeroToVersion(Number(_needNum.join(''))+1)
      this.form1.setFieldsValue({version:_num})
      this.setState({version_changed:true})
    }
  }

  abandonFun=()=>{
    const {dispatch,params} = this.props ;
    dispatch(disabledCPO(params.id)).then(e=>{
        if(e.payload){
          message.success('Reject success')
          dispatch(pathJump('/client_po'))
        }else{
          message.error(e.error.message)
        }
      }
    )
  }

  reject = ()=>{
    let fun = this.abandonFun
    Modal.confirm({
      title: 'Are you sure abandon this CPO? ',
      content: 'Once abandon CPO this operation is irreversible!',
      okText: 'Yes,I want abandon',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        fun()
      },
      onCancel() {
      },
    });
  }


  formatM=(value)=>{
    let parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if(parts[1]){
      parts[1] = parts[1].substring(0,2)
    }
    return `${this.state.currency==='CNY'?'￥':'$'} ${parts.join(".")}`;
  }



  //添加测试数据
  getData=()=>{
    const data = {

      // "remark"        : "test",
      // "startDate"     : moment("2017-08-01"),
      // "endDate"       : moment("2017-08-01"),
      "creditTerm"    : 30,
      "description"   : "test",
      "country"       : "china",
      "city"          : "shanghai",
      "postCode"      : "0211",
      "address"       : "test",
      "year"          : "2017",
      "clientPoType"  : "Annual Scope",
      "clientDetailId": "test-inv",
      "billToId"      : "test",
      "sentToId"      : "test",
      "placedToId"    : "test",
      "POFilePath"    : "test",
      "currencyId"    : "CNY",
      "GADUsr"        : "developer"
    }

    this.form1.setFieldsValue(data)
    this.form2.setFieldsValue(data)
    this.form3.setFieldsValue(data)
  }

  changeBtnCss=()=>{
    getScrollTop()
    return {marginTop:40,textAlign:'center'}
  }

  render(){
    const {intl:{formatMessage},location:{pathname},count,clientPO,userInfo,clientPOInfo,params,placedTo,sendTo,billTo,client} = this.props;
    const {SOPath,POPath,cpoId,currency,isCopy,version_state,handled_amount_fee,handled_tax_fee,handled_amountG_fee,handled_amount_in,handled_tax_in,handled_amountG_in, billType_fee,billValue_fee,billDate_fee,avg_date,billType_in,billValue_in,billDate_in,amount_State,modalLoad ,itemId ,tax_State ,current,agencyFee_State,agencyIn_State,gadUser} = this.state
    const { getFieldDecorator, getFieldValue } = this.props.form;

    const ifFinDirector = ifFin('Finance-Director',userInfo&&userInfo.toJS())

    console.log('lllll',getScrollTop())

    // console.log('state',this.state)
    // console.log('props',this.props)
    // console.log("clientPoinfo",clientPOInfo&&clientPOInfo.toJS())

    const renderOption =(config) => {
      return config.map(v=> (
        <Option key={v}>{v}</Option>
      ))
    }


    const renderSysId = (data,item) => {
      return data.map(v=>(
        <Option key={v.get(item)}>{v.get(item)}</Option>
      ))
    }


    const validNum = {rules: [{ type: "number",required: true,transform(value){if(value||value===0||value!==undefined){return Number(value)}}, message: 'Please enter a positive number' }]}
    const validNumFalse = {rules: [{ type: "number",required: false,transform(value){if(value||value===0||value!==undefined){return Number(value)}}, message: 'Please enter a positive number' }]}
    const validMoney = {rules: [{ type: "string",required: true, pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/,transform(value){if(value){return value.toString()}}, message: 'Please enter the number' }]}
    const formColumns1 = [
      {dataIndex:_cliPOT.id,option:this.getRequiredMessage(formatMessage({id:'required_fields'})),props:{disabled:true}},
      {dataIndex:_cliPOT.version,FormTag:<Input disabled style={{width:'50px'}} />},
      {dataIndex:_cliPOT.description,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliPOT.clientPoType,FormTag:
        <Select
          showSearch
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          allowClear={true}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {renderOption(_clientPOType)}
        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_cliPOT.year,props:{style:{width:'56px'}},option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliPOT.startDate,FormTag:<DatePicker  style={{width:'125px'}} />},
      {dataIndex:_cliPOT.GADUsr,FormTag:
        <Select placeholder="Please select" allowClear={true} >
          {gadUser&&gadUser.map(v=><Option  key={v.id} value={v.id}>{v.id}</Option>)}
        </Select>,option:{rules: [{ required: true, message: 'Please upload' }]}},

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`clientPO_${item.dataIndex}`}),
      })
    );

    const formColumns2 = [
      {dataIndex:_cliPOT.clientDetailId,FormTag:
        <Select
          onChange={this.setCreditTerm}
          allowClear={true}
          showSearch
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {client&&client.map(v=>(
            v.get('validFlag')==='Y'&&<Option key={v.get('id')} value={v.get('clientDetailId')} >{v.get('id')}</Option>
          ))}

        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_cliPOT.billToId,FormTag:
        <Select
          showSearch
          allowClear={true}
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
          {billTo&&renderSysId(billTo,'id')}
        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_cliPOT.placedToId,FormTag:
        <Select
          showSearch
          allowClear={true}
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
          {placedTo&&renderSysId(placedTo,'id')}
        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_cliPOT.creditTerm,option:validNum},
      {dataIndex:_cliPOT.sentToId,FormTag:
        <Select
          onChange={this.setCountry}
          showSearch
          allowClear={true}
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
          {sendTo&&renderSysId(sendTo,'id')}
        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_cliPOT.country,FormTag:
        <Select
          showSearch
          allowClear={true}
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {WORLD_COUNTRY.map(v=><Option  key={v.name} value={v.name}>{v.name}</Option>)}
        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_cliPOT.city,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliPOT.address,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_cliPOT.postCode,props:{style:{width:'85px'}},option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`clientPO_${item.dataIndex}`}),
      })
    );

    const formColumns3 = [
      {dataIndex:_cliPOT.currencyId,FormTag:
        <Select
          showSearch
          allowClear={true}
          onChange={(v)=>this.setState({currency:v})}
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
          {renderOption(_cur)}
        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_cliPOT.excRate,option:validNum,props:{style:{width:'86px'}}},
      {dataIndex:_cliPOT.amount,transform:divHundred,FormTag:<InputNumber
        style={{height:33}}
        formatter={this.formatM}
        parser={value => currency==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
        onChange={(e)=>{this.setState({amount_State:e})}}
      />,option:validNum},
      {dataIndex:_cliPOT.agencyFee,FormTag:<InputNumber
        style={{height:33}}
        formatter={this.formatM}
        parser={value => currency==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
        onChange={(e)=>{this.setState({agencyFee_State:e,current:'bill_fee'})}}
      />,transform:this.divHundred,option:validNumFalse},
      {dataIndex:_cliPOT.agencyIncentive,FormTag:<InputNumber
        style={{height:33}}
        formatter={this.formatM}
        parser={value => currency==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
        onChange={(e)=>{this.setState({agencyIn_State:e,current:'bill_incentive'})}}
      />,transform:this.divHundred,option:validNumFalse},
      {dataIndex:_cliPOT.productionCost,FormTag:<InputNumber
        style={{height:33}}
        formatter={this.formatM}
        parser={value => currency==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
      />,transform:this.divHundred,option:validNumFalse},
      {dataIndex:_cliPOT.travelCost,FormTag:<InputNumber
        style={{height:33}}
        formatter={this.formatM}
        parser={value => currency==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
      />,transform:this.divHundred,option:validNumFalse},
      {dataIndex:_cliPOT.tax,FormTag:<InputNumber
        style={{height:33}}
        formatter={this.formatM}
        parser={value => currency==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
        onChange={(e)=>{this.setState({tax_State:e})}}
      />,transform:this.divHundred,option:validNum,props:{onChange:(e)=>{this.setState({tax_State:e.target.value})},style:{width:'125px'}}},
      {dataIndex:_cliPOT.POFilePath,FormTag:
        <Upload
          name='photo'
          action={`${host}/common/upload?target=CPO&name=${cpoId}`}
          onChange={this.fileChange.bind(this,'POPath')}
        >
          <Button>
            <Icon type="upload" /> Click to Upload
          </Button>
        </Upload>,
        addSome:<Button size="small" type="primary"  onClick={this.openPSD.bind(this,POPath)} >{formatMessage({id:'viewPO'})}</Button>
        ,option:{rules: [{ required: true, message: 'Please upload' }]}},
      {dataIndex:_cliPOT.SowFilePath,FormTag:
        <Upload
          name='photo'
          action={`${host}/common/upload?target=CPO&name=${cpoId}`}
          onChange={this.fileChange.bind(this,'SOPath')}
        >
          <Button>
            <Icon type="upload" /> Click to Upload
          </Button>
        </Upload>,
        addSome:<Button size="small" type="primary"  onClick={this.openPSD.bind(this,SOPath)} >{formatMessage({id:'viewSO'})}</Button>
  ,option:{rules: [{ required: true, message: 'Please upload' }]}},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`clientPO_${item.dataIndex}`}),
      })
    );


    const billFormColumns_fee = [
      {dataIndex:_cliPOT.agencyFee,props:{disabled:true}},
      {dataIndex:_cliPOT.tax},
      {dataIndex:_cliPOT.amountFeeGross},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`clientPO_${item.dataIndex}`}),
      })
    );



    const billFormColumns_inc = [
      {dataIndex:_cliPOT.agencyIncentive,props:{disabled:true}},
      {dataIndex:_cliPOT.tax},
      {dataIndex:_cliPOT.amountInGross},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`clientPO_${item.dataIndex}`}),
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



    const countAvg = (billType_state,avg_value,avg_date,fee='',database='',title) => {
      //console.log('avg',billType_state,avg_value,avg_date,fee,database)

      let arr = []
      let data=[]
      if(params.id === 'new'){
        if(database==='database'){
          if(avg_value.length === 0 ) return []
          if(!avg_value) return []
          if(!avg_date ) return []
        }
        if(billType_state === 1){
          let mo = 100%avg_value===0?100/avg_value:Math.floor(100/avg_value);
          //console.log(mo)
          for(let c=0;c<avg_value;c++){
            arr.push(c);
            if(c==(avg_value-1)){
              let _obj={};
              let _per = add(mo,100%mo)
              let _amount = Math.floor(mul(fee,div(mo,100)));
              let _amount_last = sub(fee,mul(avg_value-1,_amount));
              let _tax_last = this.calculateTax(tax_State,_amount_last,amount_State);
              _obj.date = moment(avg_date).add(c, 'M');
              _obj.per = Number(_per);
              _obj.amount = Number(_amount_last)
              _obj.tax = Number(_tax_last);
              _obj.amountG = this.calculateAmountGross(_amount_last,_tax_last);
              _obj.keys = c
              data.push(_obj)
            }else{
              let _obj={};
              let _amount = Math.floor(mul(fee,div(mo,100)));
              let _tax = this.calculateTax(tax_State,_amount,amount_State);
              _obj.date = moment(avg_date).add(c, 'M');
              _obj.per = Number(mo);
              _obj.amount = Number(_amount);
              _obj.tax = Number(_tax);
              _obj.amountG = this.calculateAmountGross(_amount,_tax);
              _obj.keys = c
              //console.log('momo',_obj)
              data.push(_obj)
            }
          }

        }else{
          let mo = avg_value===0||!avg_value?0:Math.floor(100/avg_value);
          //console.log(mo)
          for(let c=0;c<mo;c++){
            arr.push(c);
            if(c==(mo-1)){
              let _obj={};
              let _per = add(avg_value,100%avg_value)
              let _amount_last = sub(fee,mul(fee,mul(mo-1,avg_value/100)));
              let _tax_last = this.calculateTax(tax_State,_amount_last,amount_State);
              _obj.date = moment(avg_date).add(c, 'M');
              _obj.per = Number(_per);
              _obj.amount = Number(_amount_last)
              _obj.tax = Number(_tax_last);
              _obj.amountG = this.calculateAmountGross(_amount_last,_tax_last);
              _obj.keys = c
              data.push(_obj)
            }else{
              let _obj={};
              let _amount = mul(fee,div(avg_value,100));
              let _tax = this.calculateTax(tax_State,_amount,amount_State);
              _obj.date = moment(avg_date).add(c, 'M');
              _obj.per = Number(avg_value);
              _obj.amount = Number(_amount);
              _obj.tax = Number(_tax);
              _obj.amountG = this.calculateAmountGross(_amount,_tax);
              _obj.keys = c
              data.push(_obj)
            }
          }
        }
      }else{
        let bill = clientPOInfo&&clientPOInfo.get('billingPlans').toJS()
        if(title === 'fee'){
          bill.map((v,i)=>{
            if(v.billCategory==='agencyFee'){
              arr.push(i)
              let obj = {},arr1=[],arr2=[]
              obj.date = v.date
              obj.per = v.percentage
              obj.amount = this.divHundred(v.net)
              obj.amountG = this.divHundred(v.gross)
              obj.tax = this.divHundred(v.tax)
              obj.status = v.flowStatus
              obj.id = v.id
              obj.keys = v.id
              data.push(obj)

              data.map(v=>{
                if(v.status === 'billing'){
                  arr1.push(v)
                }
              })
              data.map(v=>{
                if(v.status !== 'billing'){
                  arr2.push(v)
                }
              })
              data = [...arr1,...arr2]

            }
          })
        }else{
          bill.map((v,i)=>{
            if(v.billCategory==='agencyIncentive'){
              arr.push(i)
              let obj = {},arr1=[],arr2=[]
              obj.date = v.date
              obj.per = v.percentage
              obj.amount = this.divHundred(v.net)
              obj.amountG = this.divHundred(v.gross)
              obj.tax = this.divHundred(v.tax)
              obj.status = v.flowStatus
              obj.id = v.id
              obj.keys = v.id
              data.push(obj)

              data.map(v=>{
                if(v.status === 'billing'){
                  arr1.push(v)
                }
              })
              data.map(v=>{
                if(v.status !== 'billing'){
                  arr2.push(v)
                }
              })
              data = [...arr1,...arr2]
            }
          })
        }
      }

      if(database==='database'){
        return data
      }else{
        return arr
      }
    };

    const sum=(arr)=>{
      if(arr.length==0){
        return 0;
      }
      else if(arr.length==1){
        return arr[0];
      }else{
        return arr[0]+sum(arr.slice(1));
      }
    }

    //算出除了最后一项其他项的总数
    const countValue =(arr,source)=>{
      let obj = {},_amount=0,_tax=0,_amountG=0,_per = 0
      for(let v=0;v<arr.length-1;v++){
        _amount=add(_amount,Number(arr[v].amount))
        _tax=add(_tax,Number(arr[v].tax))
        _amountG=add(_amountG,Number(arr[v].amountG))
        _per=_per+Number(arr[v].per)
      }
      //console.log('-per',_per)
      //console.log('source',source)
      obj.amount = sub(Number(source.amount),_amount)
      obj.tax = sub(Number(source.tax),_tax)
      obj.amountG = sub(Number(source.amountG),_amountG)
      obj.per = 100-_per
      obj.keys = Math.round((Math.random()*10000000))
      //console.log('objobj',obj)
      return obj
    }

    const fee_tax = this.calculateTax(tax_State,agencyFee_State,amount_State)
    const in_tax = this.calculateTax(tax_State,agencyIn_State,amount_State)
    const fee_g = this.calculateAmountGross(agencyFee_State,fee_tax)
    const in_g = this.calculateAmountGross(agencyIn_State,in_tax)

    const renderHandledAvg = (key) => {
      const { getFieldsValue,setFieldsValue} = this.props.form;
      const {agencyFee_State} = this.state
      let g = getFieldsValue()
      let _amount_f = [],_tax_f = [],_amountG_f= [],_amount_i = [],_tax_i = [] ,_amountG_i = []
      let fee_arr = [],in_arr = [] ,fee_key=[],in_key=[]
      for(let k in g ){
        if (k.substring(0, 2) == 'fe') {
          fee_arr.push(g[k])
          fee_key.push(k)
        }else if (k.substring(0, 2) == 'in'){
          in_arr.push(g[k])
          in_key.push(k)
        }
      }

      let source = {}
      if(key ==='key-fee'){
        source.amount = agencyFee_State;
        source.amountG = fee_g;
        source.tax = fee_tax;
        let result = {}
        let result_key = fee_key.pop()
        result[result_key] = countValue(fee_arr,source)
        setFieldsValue(result)

      }else{
        source.amount = agencyIn_State;
        source.amountG = in_g;
        source.tax = in_tax;
        let result = {}
        let result_key = in_key.pop()
        result[result_key] = countValue(in_arr,source)
        setFieldsValue(result)
      }


      for(let k in g ){
        if (k.substring(0, 2) == 'fe') {
          _amount_f.push(Number(g[k].amount))
          _tax_f.push(Number(g[k].tax))
          _amountG_f.push(Number(g[k].amountG))
        }else if (k.substring(0, 2) == 'in'){
          _amount_i.push(Number(g[k].amount))
          _tax_i.push(Number(g[k].tax))
          _amountG_i.push(Number(g[k].amountG))
        }
      }

      //console.log('sum',sum(_amount_f))
      this.setState({
        handled_amount_fee:sum(_amount_f),
        handled_tax_fee:sum(_tax_f),
        handled_amountG_fee:sum(_amountG_f),
        handled_amount_in:sum(_amount_i),
        handled_tax_in:sum(_tax_i),
        handled_amountG_in:sum(_amountG_i)
      })
    }

    const avgTitle = [{id:'index',l:'36.2px',r:28},{id:'billDate',l:164,r:'3.2%'},{id:'billPer',l:'8%',r:'3.5%'},{id:'billAmount',l:'13.5%',r:'2%'},{id:'billTax',l:'8.5%',r:'2.5%'},{id:'billAmG',l:'16.5%'}]


    const renderBillingPlan =(billType_state,avg_value,billStartDate,fee,title,key)=>{
      // console.log('00000000',countAvg(billType_state,avg_value,billStartDate,fee,'database',title))
      const database = countAvg(billType_state,avg_value,billStartDate,fee,'database',title)

      getFieldDecorator(key, { initialValue:database });
      const keys = getFieldValue(key);

      const renderForm = params.id === 'new'&&keys.length>0&&database.length>0||params.id !== 'new'&&keys.length>0

      const formItems = keys.map((k, index) => {
        if(renderForm) {
          return (
            <FormItem
              {...formItemLayout}
              label=''
              required={false}
              key={k.keys}
            >
              {getFieldDecorator(`${title}-${k.keys}`)(<PriceInput arr={k.length} k={k} index={index} superState={this.state} superFee={fee} dataAll={keys} />)}
              {k.status!=='billing'?
              <Icon
                  className="dynamic-delete-button"
                  type="minus-circle-o"
                  style={{marginLeft:"10px"}}
                  onClick={() => this.remove(index,key,keys,k)}
                />:<p style={{display:'inline-block',marginLeft:10}} >Billing</p>}
            </FormItem>
          );
        }
      });

      const showAvgMethod = params.id==='new'
      return (
        <Row>
          {showAvgMethod&&<Row style={{marginTop:10,paddingLeft:17}}>
            <RadioGroup onChange={(e)=>{
                                  let obj = {}
                                  obj[`billType_${title}`] = e.target.value;
                                  obj[`billValue_${title}`] = '';
                                  obj[`billDate_${title}`] = null;
                                  this.setState(obj);
                       }} value={this.state[`billType_${title}`]}>
              <Radio value={1}>{formatMessage({id:'avg_month'})}</Radio>
              <Radio value={2}>{formatMessage({id:'avg_per'})}</Radio>
            </RadioGroup>
            <p style={{marginTop:7}}>Average by <span style={{borderBottom:'1px solid black',display:'inline-block',margin:'0 3px'}}><Input style={{width:52,border:0,outline:'none',textAlign:'center',fontWeight:'bold'}}   value={avg_value} onChange={this.handleChange.bind(this,`billValue_${title}`,'input',true)}/></span> <span>{billType_state===1?'month':'%'}</span> , starting from <DatePicker format="YYYY-MM-DD" value={billStartDate} onChange={this.handleChange.bind(this,`billDate_${title}`,'date',false)} /></p>
          </Row>}
          { <Row>
            <ul style={{display:'flex',marginTop:20,borderBottom:'1px solid #d7d7d7',paddingBottom:8,paddingLeft:17}}>
              {avgTitle.map(v=>(<li style={{width:v.l,fontWeight:'bold',marginRight:v.r,listStyleType:'none'}} key={v.id}>{formatMessage({id:v.id})}</li>))}
            </ul>
          </Row>}
          <Row style={{marginTop:'10px',paddingLeft:17}}>
            <Form>
              {formItems}
              <Row style={{display:'flex',justifyContent:'flex-end',margin:'15px 21%'}}>
                {/*<p style={{marginRight:'9%'}}><span style={{marginRight:5}}>{formatMessage({id:'billAmount'})}:</span><span  style={{color:'#CC3300'}}>{current==='bill_fee'?handled_amount_fee:handled_amount_in}/</span><span >{current==='bill_fee'?agencyFee_State:agencyIn_State}</span></p>*/}
                {/*<p style={{marginRight:'9%'}}><span style={{marginRight:5}}>{formatMessage({id:'billTax'})}:</span><span  style={{color:'#CC3300'}}>{current==='bill_fee'?handled_tax_fee:handled_tax_in}/</span><span >{current==='bill_fee'?fee_tax:in_tax}</span></p>*/}
                {/*<p style={{marginRight:'9%'}}><span style={{marginRight:5}}>{formatMessage({id:'billAmG'})}:</span><span style={{color:'#CC3300'}}>{current==='bill_fee'?handled_amountG_fee:handled_amountG_in}/</span><span >{current==='bill_fee'?fee_g:in_g}</span></p>*/}
                <Button onClick={renderHandledAvg.bind(this,key)}>{formatMessage({id:'calculate'})}</Button>
              </Row>
              <FormItem {...formItemLayoutWithOutLabel}>
                <Button type="dashed" onClick={this.add.bind(this,key)} style={{ width: '60%' }}>
                  <Icon type="plus" />{formatMessage({id:'add'})}
                </Button>
              </FormItem>
            </Form>
          </Row>
        </Row>
      )
    }

    const rightContent = params.id==='new'?null:clientPOInfo&&<Row  className="inv-badge">
      <Badge status="processing"   text={formatMessage({id:`${clientPOInfo&&clientPOInfo.get('flowStatus')}`})} />
    </Row>
    const ifHasFeeOrIn = Number(agencyFee_State) > 0 || Number(agencyIn_State)> 0;
    const ifHasFee = Number(agencyFee_State) > 0;
    const ifHasIn = Number(agencyIn_State) > 0;
    const autoFill = this.autoField
    const isAbaondoned = clientPOInfo&&clientPOInfo.get('flowStatus') ==='abandoned'
    const isToSubmit = clientPOInfo&&clientPOInfo.get('flowStatus') ==='toSubmit'
    const isRefused = clientPOInfo&&clientPOInfo.get('flowStatus') ==='refusedByFD'
    const isfinished = clientPOInfo&&clientPOInfo.get('flowStatus') ==='finished'
    const isToApprove = clientPOInfo&&clientPOInfo.get('flowStatus') ==='toApproveByFD'
    const isRunning = clientPOInfo&&clientPOInfo.get('flowStatus') ==='running'
    const isToRun = clientPOInfo&&clientPOInfo.get('flowStatus') ==='toRun'
    const approve  = params.id!=='new'&&isToApprove&&ifFinDirector&&!isCopy
    const reject = params.id!=='new'&&!isCopy&&isToApprove&&ifFinDirector&&!isToSubmit&&!isAbaondoned||params.id!=='new'&&!isCopy&&isToRun&&ifFinDirector&&!isToSubmit&&!isAbaondoned||params.id!=='new'&&!isCopy&&isRunning&&ifFinDirector&&!isToSubmit&&!isAbaondoned||params.id!=='new'&&!isCopy&&!isRefused&&ifFinDirector&&!isToSubmit&&!isAbaondoned
    const saveBtn = params.id==='new'||isCopy||isToSubmit||isRunning&&ifFinDirector||isToRun&&ifFinDirector
    const subBtn = params.id==='new'||isCopy||isToSubmit||isRefused
    return (
      <Row style={{position:'relative'}}>
        <Title rightContent={rightContent}  title={formatMessage({id:`${_tit.client_po_details}`})} />
          <Spin   spinning={ modalLoad } tip={formatMessage({id:'loading'})} >
            <Row style={{paddingBottom:100,overflowX:'auto'}}>
              <Row type='flex' justify='start'  style={{marginTop:61,width:1400}}>
                <Row style={{width:'949px',paddingBottom:40,borderBottom:'1px solid #e9e9e9',position:'relative',paddingLeft:'35px',paddingTop:'18px'}}>
                  <Row style={{marginBottom:20,borderBottom:'1px solid #e9e9e9',paddingBottom:20}}>
                    <p style={{margin:'5px 0 10px 0',fontWeight:'bold'}}>Basic Info: </p>
                    <SimpleForm
                      columns={ formColumns1 }
                      //initial={params.id!=='new'?clientPOInfo:Immutable.fromJS({})} colSpan={12}
                      initial={clientPOInfo}
                      colSpan={12}
                      labelCol={{span:7}}
                      ref={f=>this.form1=f} />
                  </Row>
                  <Row style={{marginBottom:20,borderBottom:'1px solid #e9e9e9',paddingBottom:20}}>
                    <p style={{margin:5,fontWeight:'bold'}}>Client Info : </p>
                    <SimpleForm
                      columns={ formColumns2 }
                      //initial={params.id!=='new'?clientPOInfo:Immutable.fromJS({})} colSpan={12}
                      initial={clientPOInfo&&clientPOInfo}
                      colSpan={12}
                      labelCol={{span:7}}
                      ref={f=>this.form2=f} />
                  </Row>
                  <Row>
                    <p style={{margin:5,fontWeight:'bold'}}>Budget info : </p>
                    <SimpleForm
                      columns={ formColumns3 }
                      //initial={params.id!=='new'?clientPOInfo:Immutable.fromJS({})} colSpan={12}
                      initial={clientPOInfo&&clientPOInfo}
                      colSpan={12}
                      labelCol={{span:7}}
                      ref={f=>this.form3=f} />
                  </Row>
                  {/*params.id!=='new'&&<Button size="small" type="primary" style={{height:32,marginLeft:'64.5%'}} onClick={this.openPSD.bind(this,clientPOInfo&&clientPOInfo.get('POFilePath'))} >{formatMessage({id:'viewPO'})}</Button>*/}
                  {/*params.id!=='new'&&<Button size="small" type="primary" style={{height:32,marginLeft:15}} onClick={this.openPSD.bind(this,clientPOInfo&&clientPOInfo.get('SowFilePath'))} >{formatMessage({id:'viewSO'})}</Button>*/}
                  {params.id!=='new'&&<Button size="small" style={{position:'absolute',marginLeft:'210px',top:'53px',left:'50%',height:32}} onClick={this.changedVersion} >{formatMessage({id:'changed'})}</Button>}
                  {/*测试按钮开始*/}
                  {params.id==='new'&&<Button size="small" style={{position:'absolute',marginLeft:'210px',top:0,left:'50%',height:32}} onClick={()=>this.getData()} >{"填充测试数据"}</Button>}
                  {/*测试按钮结束*/}
                </Row>
                {params.id!=='new'&&<Row style={{marginTop:25}} >
                  {reject&&<Button onClick={this.reject}  style={{marginBottom:20}} type='danger'>{formatMessage({id:'cpoAbandon'})}</Button>}
                  <p style={{fontWeight:'bold',borderBottom:'1px solid #e9e9e9',marginBottom:20,padding:'10px 0'}}>{formatMessage({id:'cpoLog'})}</p>
                  <Timeline>
                    {clientPOInfo&&clientPOInfo.get('logs')&&clientPOInfo.get('logs').map(v=>(
                      <Timeline.Item>
                        <p>
                          <span style={{textTransform:'Capitalize'}}>{v.get('operator')} </span><span>{v.get('operation')} </span><span>{v.get('type')}</span>{v.get('remark')&&<span>---{v.get('remark')}</span>}<span style={{display:'inline-block',marginLeft:10}}>{v.get('createdAt')}</span>
                        </p>
                      </Timeline.Item>))}
                  </Timeline>
                </Row>}
              </Row>
              {ifHasFeeOrIn&&<Row>
                <Row style={{marginTop:10}}>
                  <p style={{fontSize:18,fontWeight:'bold',color:'black'}}>{formatMessage({id:'bill_plan'})} </p>
                  <Tabs activeKey={current} onChange={(k)=>{this.setState({current:k})}}>
                    {ifHasFee&&<TabPane tab={formatMessage({id:'bill_fee'})} key="bill_fee">
                      {/*<div className='cpo-mask'></div>*/}
                      <Row style={{paddingRight:'40%',paddingBottom:10,borderBottom:'1px solid #d7d7d7',paddingLeft:17}}>
                        <SimpleForm  columns={ billFormColumns_fee } initial={autoFill(_cliPOT.agencyFee,agencyFee_State)} colSpan={24} labelCol={{span:7}} ref={f=>this.bill_form_fee=f} />
                      </Row>
                      <Row>
                        {renderBillingPlan(billType_fee,billValue_fee,billDate_fee,agencyFee_State,'fee','key-fee')}
                      </Row>
                    </TabPane>}
                    {ifHasIn&&<TabPane tab={formatMessage({id:'bill_incentive'})} key="bill_incentive">
                      <Row style={{paddingRight:'40%',paddingBottom:10,borderBottom:'1px solid #d7d7d7',paddingLeft:17}}>
                      <SimpleForm  columns={ billFormColumns_inc } initial={autoFill(_cliPOT.agencyIncentive,agencyIn_State)} colSpan={24} labelCol={{span:7}} ref={f=>this.bill_form_incentive=f} />
                      </Row>
                       <Row>
                        {renderBillingPlan(billType_in,billValue_in,billDate_in,agencyIn_State,'in','key-in')}
                      </Row>
                    </TabPane>}
                  </Tabs>
                </Row>
                </Row>}
              <div  ref={f=>this.btnCss=f}  className='btn-fixed' >
                {subBtn&&<Button onClick={this.handleModal.bind(this,'submit')} type='primary' size="large" style={{marginRight:10}}>{params.id==='new'?formatMessage({id:'new_submit_btn'}):formatMessage({id:'save_submit_btn'})}</Button>}
                {saveBtn&&<Button onClick={this.handleModal.bind(this,'save')} type='primary' size="large" style={{marginRight:10}}>{params.id==='new'?formatMessage({id:'new_btn'}):formatMessage({id:'save_btn'})}</Button>}
                {approve&&<Button onClick={this.handleModal.bind(this,'agree','agree')} type='primary' style={{marginRight:10}} size="large">{formatMessage({id:'cpoApprove'})}</Button>}
                {reject&&<Button onClick={this.handleModal.bind(this,'disagree','agree')} type='danger' style={{marginRight:10}} size="large">{formatMessage({id:'cpoReject'})}</Button>}
                <Button onClick={()=>{const {dispatch} = this.props ;dispatch(pathJump('/client_po'))}}  size="large">{formatMessage({id:'cancel'})}</Button>
              </div>
            </Row>
          </Spin>

      </Row>
    )
  }
}

ClientPODetails.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  clientPO : state.getIn(['clientPO','clientPO']),
  count : state.getIn(['clientPO','count']),
  clientPOInfo: state.getIn(['clientPO','clientPOInfo']),
  billTo : state.getIn(['billTo','billTo']),
  client : state.getIn(['client','client']),
  placedTo : state.getIn(['placedTo','placedTo']),
  sendTo : state.getIn(['sendTo','sendTo']),
  userInfo : state.getIn(['userInfo','userLoginInfo']),
});

export default Form.create()(injectIntl(connect(mapStateToProps)(ClientPODetails)))


class PriceInput extends React.Component {
  constructor(props) {
    super(props);
    //console.log('propsssss',props)
    const value = this.props.value || {};
    this.state = {
      date:'',
      per:'',
      amount:'',
      amountG:'',
      tax:'',
    };
  }

  calculateTax=(tax,fee,amount)=>{
    //console.log('666',tax,fee,amount)
    let re = mul(tax,div(fee,sub(amount,tax)))
    return re.toFixed(2)
  }

  componentWillMount(){
    const {k} = this.props;
    if(k != undefined){
      this.setState({
        date:moment(k.date),
        per:typeof(k.per)=='undefined'?k.percentage:k.per,
        amount:typeof(k.amount)=='undefined'?k.net:k.amount,
        amountG:typeof(k.amountG)=='undefined'?k.gross:k.amountG,
        tax:k.tax,
        id:k.id
      },this.triggerChange({date:moment(k.date),per:k.per,amount:k.amount,amountG:k.amountG,tax:k.tax}))
    }
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    let value

    // console.log('----',nextProps)
    if ('value' in nextProps) {
        value = nextProps.value;
        this.setState(value);
    }
  }



  handleFormChange = (state,needTarget,e) => {
    const {superFee} = this.props;
    let obj = {}
    let va = ''
    // console.log('-------',superFee)
    //console.log('change',state,needTarget)
    if(needTarget){
      if(e.target.value>superFee){
        va = superFee
      }else{
        va = e.target.value
      }
    }else{
      if(state==='date'){
        va = moment(e).format('YYYY-MM-DD')
      }else{
        va = e
      }
    }
    obj[state] = va
    this.triggerChange(obj)
  }

  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    const {superState,superFee,update,k} = this.props
    //console.log(this.props)
    if (onChange) {
      if(changedValue.hasOwnProperty('amount')&&typeof(changedValue.amount)!='undefined'){
        let obj = {}
        let _amount  = changedValue.amount
        obj.amount = _amount;
        obj.per = ((_amount/superFee)*100).toFixed(2);
        obj.tax = this.calculateTax(superState.tax_State,_amount,superState.amount_State);
        obj.amountG = (Number(obj.amount) + Number(obj.tax)).toFixed(2)
        obj.date = moment(k.date).format('YYYY-MM-DD')
        obj.id = k.id
        obj.keys  = k.id
        onChange(Object.assign({}, obj));
      }else if(changedValue.hasOwnProperty('per')&&typeof(changedValue.per)!='undefined'){
        let obj = {}
        let _per  = changedValue.per
        let _amount = superFee*_per
        obj.amount = _amount;
        obj.per = _per;
        obj.tax = this.calculateTax(superState.tax_State,_amount,superState.amount_State);
        obj.amountG = Number(obj.amount) + Number(obj.tax)
        obj.date = moment(k.date).format('YYYY-MM-DD')
        obj.id = k.id
        obj.keys  = k.id
        onChange(Object.assign({}, obj));
      }else{
        onChange(Object.assign({}, this.state, changedValue));
      }
    }
  }

  render() {
    const { size,index,k} = this.props;
    const state = this.state;
    //console.log('price_state',state)
    return (
      <span>
        <p style={{textAlign:'center',float:'left',height:29,width:29,textDecoration:'underline',marginRight:36}}>{index + 1}</p>
         <DatePicker
           value={moment(state.date)}
           onChange={this.handleFormChange.bind(this,'date',false)}
           disabled={k&&k.status ==='billing'}
         />
        <InputNumber

          value={state.per}
          type="text"
          placeholder={"billing"}
          size={size}
          onChange={this.handleFormChange.bind(this,'per',false)}
          style={{ width: '10%', marginLeft: '3%' ,height:33}}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
          disabled
        />
        <Input
          value={state.amount}
          type="text"
          placeholder={"amount"}
          size={size}
          onChange={this.handleFormChange.bind(this,'amount',true)}
          style={{ width: '16%', marginLeft: '3%' }}
          disabled={k&&k.status ==='billing'}
        />
        <Input
          value={state.tax}
          type="text"
          placeholder={"tax"}
          size={size}
          onChange={this.handleFormChange.bind(this,'tax',true)}
          style={{ width: '10%', marginLeft: '3%' }}
          disabled
        />
        <Input
          value={state.amountG}
          type="text"
          placeholder={"billing amount"}
          size={size}
          onChange={this.handleFormChange.bind(this,'amountG',true)}
          style={{ width: '16%', marginLeft: '3%' }}
          disabled
        />
      </span>
    );
  }
}

