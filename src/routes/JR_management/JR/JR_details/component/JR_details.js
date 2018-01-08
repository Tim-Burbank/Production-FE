/**
 * Created by Yurek on 2017/8/21.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Checkbox,Popconfirm,Badge,Form,InputNumber,Radio,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Menu,Tabs,Card,Table  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../../components/antd/Table'
import { EditableCell } from '../../../../../components/antd/EditableCell'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump,ifFin } from '../../../../../utils/'

import TopSearch from '../../../../../components/search/topSearch'
import Title from '../../../../../components/title/title'
import {JR_tableField as _JRT , host,titles as _tit ,clientPO_tableField as _cliPOT,clientPO_type as _clientPOType,currency as _cur,rootPath,groupDetails_tableField as _inT , WHT as _WHT,WHTPayType,tier2_tableField as _T2TF} from '../../../../../config'
import {WORLD_COUNTRY} from '../../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoneyToNum,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,add,sub,mul,div,divHundred} from '../../../../../utils/formatData'
import { getFormRequired } from '../../../../../utils/common'
import { fetchClient } from '../../../../system_settings/client/modules/client'
import { fetchClientPO } from '../../../../clientPO/modules/client_po'
import { fetchAuthority } from '../../../../authority_management/modules/authority_management'
import { fetchJr,newJr,altJr } from '../../../../system_settings/jr_cate/modules/jr_cate'
import {newJRMain, fetchProject, fetchWht, fetchJRMainInfo,fetchJRId,fetchTier4,altJRMain,altJROpt,abdJR} from '../../modules/JR'
import { fetchDAF } from '../../../DAF/modules/DAF'
import { fetchProduct } from '../../../../system_settings/product/modules/product'
import {fetchVendor } from '../../../../system_settings/vendor/modules/vendor'
import {updateEstimateCost } from '../../../../group_management/tier2/modules/tier2'
const { TextArea } = Input;
const RadioButton = Radio.Button;
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment'
import './JR_detail.scss'


class JRDetailsPage extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      itemId: null,
      modal: false,
      modalLoad: false,
      editIndex: -1,
      readOnly: false,  //true => group form and column can't edit
      editable: false,
      cpoCount: 0,
      tierCount: 0,
      tier_load: false,
      groupAmount: 0,
      groupRestMoney: 0,
      // JRInfo:Immutable.fromJS([]),
      per_type: 'smallAmount',
      currency: 'CNY',
      abandonDAF: false,
      detail: [{
        vendorDetailId: '',
        vendorCode: '',
        net: '',
        gross: '',
        PETax: '',
        PEGross: '',
        File: '',
        location: 'domestic'
      }],
      SubCateLoad: false,
      MainCateLoad: false,
      MainCategory: [],
      SubCategory: [],
      loading: false,
      DAF: [],
      cpoTaxRate: 0,
      PEIndex: 0,
      SubCategory_value: [],
      MainCategory_value: '',
      modal_pro: false,
      modalProLoad: false,
      stiModal: false,
      estiValue: [],
      modalLoading: false,
      estiDate: [moment(), moment().add(1, 'months')],
      startValue: null,
      endValue: null,
      endOpen: false,
      JRId: null,
      estimate: [],
      adHandle:false,      //客户总监审批
      finHandle:false,  //财务审批
      fmHandle:false,   //财务总监审批

    }
  }



  componentDidMount(){
    const {dispatch,params,location,userInfo} = this.props;
    //console.log('this.props',this.props)
    // this.setState({loading:true});
    if(params.id !== 'new'){
      this.setState({loading:true,JRId:params.id})
      dispatch(fetchJRMainInfo(params.id)).then(e=>{
        if(e.payload){
          let item = e.payload;
          if(item.flowType === 'Create'){
            if(item.flowStatus === 'toApproveByAD'){
              this.setState({adHandle:true})
            }else if(item.flowStatus === 'toApproveByFinance'){
              this.setState({finHandle:true})
            }
          }else{
            if(item.flowStatus === 'toApproveByAD'){
              this.setState({adHandle:true})
            }else if(item.flowStatus === 'toApproveByFinance'){
              this.setState({finHandle:true})
            }else if(item.flowStatus === 'toApproveByFM'){
              this.setState({fmHandle:true})
            }
          }

          let main,sub=[]
          e.payload.JRTypes.map(v=>{
            if(v.JRTypeCategory==='MainCategory'){
              main = v.id
            }else{
              sub=[...sub,v.id]
            }
          })

          if(e.payload.flowStatus!=='toSubmit'){
            this.setState({readOnly:true,})
          }

          this.setState({
            MainCategory_value:main,
            SubCategory_value:sub,
            detail:e.payload.JR_VendorDetails,
            loading:false,
            currency:e.payload.currencyId,
            setiValue:e.payload.estimateCosts,
            flowStatus:e.payload.flowStatus,
            flowType:e.payload.flowType,
            startTime: e.payload.estimateCosts.length>0?moment(e.payload.estimateCosts[0].period):'',
            endTime: e.payload.estimateCosts.length>0?moment(e.payload.estimateCosts[e.payload.estimateCosts.length - 1].period):'',
            selectEsti:e.payload.estimateCosts.reduce((acc,cur)=>acc+cur.cost,0),
            estiValue:e.payload.estimateCosts,
            diff:e.payload.estimateCosts.length
          });
        }else{
          this.setState({loading:false});
          message.error(e.error.message);
        }
      })
    }

    dispatch(fetchClientPO()).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({
        })
      }
    });
    dispatch(fetchTier4({
      'group.startDate_like':moment().format('YYYY')
    })).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({
        })
      }
    });

    dispatch(fetchClient()).then(e=>{
      if(e.payload){
        // this.setState({loading:false});
      }else{
        // this.setState({loading:false});
        message.error(e.error.message);
      }
    })
    // console.log('ppppp',userInfo)
    dispatch(fetchProduct()).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{

      }
    });

    dispatch(fetchVendor()).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{

      }
    });

    const year = moment().year()
    dispatch(fetchDAF({year})).then(e=>{
      if(e.payload){
        this.setState({DAF:e.payload.rows.filter((v)=>{return v.flowStatus === 'effective'})})
      }else{
        message.error(e.error.message);
      }
    })

    dispatch(fetchProject({GADUsr:userInfo&&userInfo.get('GADUsr')})).then(e=>{
      if(e.payload){
        // this.setState({loading:false});
      }else{
        // this.setState({loading:false});
        message.error(e.error.message);
      }
    })
    dispatch(fetchJr()).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({SubCategory:e.payload.objs.filter((v)=>{return v.JRTypeCategory === 'SubCategory'&& v.JRTypeLevel === 'Default'})})
        this.setState({MainCategory:e.payload.objs.filter((v)=>{return v.JRTypeCategory === 'MainCategory'&& v.JRTypeLevel === 'Default'})})
      }
    });
    dispatch(fetchAuthority({'role.id':'Group-Account-Director'})).then(e=>{
      if(e.payload){
        this.setState({gadUser:e.payload.objs})
      }else{
        message.error(e.error.message);
      }
    })
  }


  handleModal = (v) => {
    const {dispatch,params,intl:{formatMessage}} = this.props;
    const {detail} = this.state
    this.form.validateFields((err, values) => {
      if (!err) {
        console.log('receive form value',values)
        this.setState({loading:true});

        // this.setState({loading:true})
        //console.log('value',values)
        values = {
          ...values,
          purchaseType:this.state.per_type,
          JRTypes:[...this.state.SubCategory_value,this.state.MainCategory_value],
          JR_VendorDetails:detail,
          currencyId:this.state.currency,
          net:Number(detail[0]['net']) + detail[0]['WHTNet']?Number(detail[0]['WHTNet']):0,
          tax:Number(detail[0]['tax']) + detail[0]['WHTTax']?Number(detail[0]['WHTTax']):0,
          gross:Number(detail[0]['gross']) + detail[0]['gross']?Number(detail[0]['WHTTax']):0,
          receivedDate:values['receivedDate']?values['receivedDate'].format("YYYY-MM-DD"):'',
          operation:v,
          estimateCosts:this.state.estimate
        }
        console.log('ppppppp',values)

        if(params.id==='new'){
          dispatch(newJRMain(values)).then(e=>{
            if(e.payload){
              this.setState({loading:false});
            }else{
              this.setState({loading:false});
              message.error(e.error.message);
            }
          })
        }else{
          dispatch(altJRMain(params.id,values)).then(e=>{
            if(e.payload){
              this.setState({loading:false});
              message.success('Update success')
              history.back()
            }else{
              this.setState({loading:false});
              message.error(e.error.message);
            }
          })
        }

      }
    });
  };

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

  changeType=(e)=>{
    this.setState({per_type:e.target.value})
    const newData=[{vendorDetailId:'',vendorCode:'',net:'',gross:'',PETax:'',PEGross:'',File:'',location:'domestic'}]
    const newThreeData=[
      {vendorDetailId:'',vendorCode:'',net:'',gross:'',PETax:'',PEGross:'',File:'',location:'domestic'},
      {vendorDetailId:'',vendorCode:'',net:'',gross:'',PETax:'',PEGross:'',File:'',location:'domestic'},
      {vendorDetailId:'',vendorCode:'',net:'',gross:'',PETax:'',PEGross:'',File:'',location:'domestic'},
    ]
    if(e.target.value==='nonLowBid'||e.target.value==='threeBid'){
      this.setState({detail:newThreeData})
    }else{
      this.setState({detail:newData})
    }
  }

  changeProduct=(e)=>{
    const {dispatch,product} = this.props
    product.forEach(v=>{
      if(v.get('id') === e){
        console.log('llll',v.toJS())
        this.form.setFieldsValue({productCode:v.get('code')})
      }
    })
  };

  changeProject=(e)=>{
    const {dispatch,project} = this.props

    project.forEach(v=>{
      if(v.get('id') === e){
        console.log('llll',v.toJS())
        dispatch(fetchProduct({"product.clientId":v.getIn(['client','clientId'])})).then(e=>{
          if(e.payload){
          }else{
            message.error(e.error.message);
          }
        })
        dispatch(fetchJRId({brief:v.getIn(['client','brief'])})).then(e=>{
          if(e.payload){
            this.setState({JRId:e.payload})
            this.form.setFieldsValue({id:e.payload})

          }else{
            message.error(e.error.message);
          }
        })
        this.form.setFieldsValue({
          GADUsr:v.getIn(['clientPo','GADUsr']),
          clientDetailId:v.getIn(['client','id']),
          clientCode:v.getIn(['client','code']),
          description:v.get('description'),
          cpoTaxRate:v.getIn(['clientPo','taxRate']),
          currency:v.getIn(['clientPo','currencyId']),
        })
        this.typeForm.setFieldsValue({currencyId:v.getIn(['clientPo','currencyId'])})
      }
    })
  };

  changeFormVendor=(index)=>{
    return (value)=>{
      const {vendor}  =this.props;
      let detail = [...this.state.detail];
      let v_detail
      vendor.map(v=>{
        if(v.get('id')===value){
          v_detail = v
        }
      })
      detail[index]['vendorDetailId'] = value;
      detail[index]['vendorCode'] = v_detail.get('code');
      detail[index]['taxRate'] = v_detail.get('taxRate');
      detail[index]['location'] = v_detail.get('location')
      if(this.state.currency === 'CNY'&&v_detail.get('location')==='oversea'){
        detail[index]['hasTaxBureau'] = 'Y'
      }else{
        detail[index]['hasTaxBureau'] = 'N'
      }
      console.log('1111111data',this.state.detail);
      this.setState({ detail });
    }
  }

  calNet=(gross,taxRate)=>{
    return div(Number(gross),add(1,Number(taxRate))).toFixed(2)
  }

  changeGross=(index,taxRate,cpoTaxRate)=>{
    return (e)=>{
      if(!taxRate) return

      let value = e.target.value
      let detail = [...this.state.detail];
      const net = this.calNet(value,taxRate)
      const tax = mul(net,Number(cpoTaxRate))
      detail[index]['gross'] = value;
      detail[index]['net'] = net
      detail[index]['tax'] = tax
      detail[index]['PETax'] = tax
      detail[index]['PEGross'] = add(net,tax)
      if(index === 0){
        detail[index]['validFlag'] = 'Y'
      }else{
        detail[index]['validFlag'] = 'N'
      }
      console.log('222222data',this.state.detail);
      this.setState({ detail });
    }
  };

  calWHT=(e)=>{
    const{dispatch} = this.props;
    let type = this.form_WHT.getFieldValue('taxBear')
    console.log('------',formatMoneyToNum(this.form_WHT.getFieldValue('invAmount')))
    let amount = formatMoneyToNum(this.form_WHT.getFieldValue('invAmount'))
    if(!type&&!amount) return
    let json = {
      amount,
      type,

      rate :e.target.value,
    }

    // this.setState({modalLoad:true})
    dispatch(fetchWht(json)).then(e=>{
      if(e.payload){
        // this.setState({modalLoad:false});
        let obj={}
        for(let k in e.payload){
          obj[k] = formatMoney(e.payload[k])

        }
        this.form_WHT.setFieldsValue(obj)
      }else{
        // this.setState({modalLoad:false});
        message.error(e.error.message);
      }
    })
  }

  calWHTNet=(PEGross,cpoTaxRate,vendorNet)=>{
    return sub(div(PEGross,add(1,cpoTaxRate)).toFixed(2),vendorNet).toFixed(2)
  }


  handleWHT=()=>{
    let detail = [...this.state.detail];
    const total = this.form_WHT.getFieldValue('total')
    const PEGross = Number(formatMoneyToNum(total)) + Number(formatMoneyToNum(detail[this.state.PEIndex]['net']));
    const WHTNet = this.calWHTNet(PEGross,this.state.cpoTaxRate,detail[this.state.PEIndex]['net']);
    detail[this.state.PEIndex]['total'] = total;
    detail[this.state.PEIndex]['invAmount'] = this.form_WHT.getFieldValue('invAmount');
    detail[this.state.PEIndex]['vatIn'] = this.form_WHT.getFieldValue('vatIn');
    detail[this.state.PEIndex]['taxBear'] = this.form_WHT.getFieldValue('taxBear');
    detail[this.state.PEIndex]['surtax'] = this.form_WHT.getFieldValue('surtax');
    detail[this.state.PEIndex]['WHTex'] = this.form_WHT.getFieldValue('WHTex');
    detail[this.state.PEIndex]['incTax'] = this.form_WHT.getFieldValue('incTax');
    detail[this.state.PEIndex]['taxableAmount'] = this.form_WHT.getFieldValue('taxableAmount');

    detail[this.state.PEIndex]['PETax'] = total;
    detail[this.state.PEIndex]['PEGross'] = PEGross
    detail[this.state.PEIndex]['WHTPaymentType'] = this.form_WHT.getFieldValue('taxBear')
    detail[this.state.PEIndex]['excRate'] = this.form_WHT.getFieldValue('WHTex')
    detail[this.state.PEIndex]['WHTNet'] = WHTNet
    detail[this.state.PEIndex]['WHTTax'] = Number(formatMoneyToNum(total)) - Number(WHTNet)
    detail[this.state.PEIndex]['WHTGross'] = total
    detail[this.state.PEIndex]['currencyId'] = this.typeForm.getFieldValue('currencyId')
    this.setState({ detail ,modal:false});
  }


  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }

  onStartChange = (value) => {
    this.setState({startTime:value})
  }

  changeEsti=(date,index,value)=>{
    const estiValue = [...this.state.estiValue];
    estiValue[index]['cost'] = value;
    estiValue[index][Object.keys(estiValue[index])[0]]['cost'] = value;
    estiValue[index][Object.keys(estiValue[index])[0]]['JRId'] = this.state.JRId;
    this.setState({estiValue})
  }

  handleEstiModal=()=>{
    const {dispatch,intl:{formatMessage},params} = this.props;
    let _value = this.state.estiValue.slice(0);
    let result = [];
    //_value.map(v=>{
    //  result.push(Object.values(v)[0])
    //})
    console.log('[[[pppppp',_value)

    _value.map(v=>{
      let obj = {}
      obj.cost = v.cost
      obj.period = moment(v.period).format('YYYY-MM')
      obj.id = v.id?v.id:undefined
      // obj.JRId = this.state.JRId
      result.push(obj)
    })

    this.setState({estimate:result,estiModal:false})
    if(params.id!=='new'){
      let values = {
        estimateCosts:result,
        operation: "save",
        JR_VendorDetails:this.state.detail,
      }
      this.setState({modalLoading:true})
      dispatch(altJRMain(params.id,values)).then(e=>{
        if(e.payload){
          this.setState({modalLoading:false});
          message.success('Update success')
          history.back()
        }else{
          this.setState({modalLoading:false});
          message.error(e.error.message);
        }
      })
    }


  }

  onEndChange = (value) => {
    this.setState({endTime:value})
    if(this.state.startTime){
      const _start = this.state.startTime.clone()
      let diff = value.diff(_start,'month')
      this.setState({diff})
      let _esti = []
      if(this.state.estiValue.length>0){
        let _d = diff+1
        if(_start.format('YYYY-MM') === this.state.estiValue[0].period){
          if(_d>this.state.estiValue.length){
            for(let i=0;i<_d-this.state.estiValue.length;i++){
              //console.log('iii',i)
              let obj =  {},obj_out={}
              obj.cost = ''
              obj.description = ''
              obj.period = _start.clone().add(i+this.state.estiValue.length,'months').format('YYYY-MM')
              obj_out[obj.period] = obj
              obj_out.period = _start.clone().add(i+this.state.estiValue.length,'months').format('YYYY-MM')
              _esti.push(obj_out)
            }
            console.log('0000000',_esti)
            this.setState({estiValue:[...this.state.estiValue,..._esti]})
          }else {
            _esti = [...this.state.estiValue]
            for (let i = 0; i < this.state.estiValue.length - _d; i++) {
              _esti.pop()
            }
            this.setState({estiValue: _esti})
          }
        }else{
          let arr = this.state.estiValue.slice(0)
          for(let k=0;k<arr.length;k++){
            if(arr[k]['period']=== _start.format('YYYY-MM')){
              arr.splice(0,k)
              break
            }
          }
          if(arr.length<this.state.estiValue.length){
            for(let i=0;i<this.state.estiValue.length-arr;i++){
              //console.log('iii',i)
              let obj =  {},obj_out={}
              obj.cost = ''
              obj.description = ''
              obj.period = _start.clone().add(i+arr.length,'months').format('YYYY-MM')
              obj_out[obj.period] = obj
              obj_out.period = _start.clone().add(i+arr.length,'months').format('YYYY-MM')
              arr.push(obj_out)
            }
            this.setState({estiValue:arr})
          }
        }
      }else{
        for(let i=0;i<diff+1;i++){
          let obj =  {},obj_out={}
          obj.cost = ''
          obj.description = ''
          obj.period = _start.clone().add(i,'months')
          obj_out[obj.period.format('YYYY-MM')] = obj
          obj_out.period = _start.clone().add(i,'months').format('YYYY-MM')
          _esti.push(obj_out)
        }
        this.setState({estiValue:_esti})
      }

    }
  }

  renderEsti=()=>{
    if(this.state.diff){
      let a = []
      this.state.estiValue.map((v,i)=>
        a.push(<Row style={{display:'flex',margin:'5px 0'}} key={i} >
          <DatePicker style={{marginRight:5}} value={moment(v.period)} disabled format="YYYY-MM"/>
          <InputNumber style={{width:200}} value={v.cost} onChange={this.changeEsti.bind(this,moment(this.state.estiDate[0]).add(i,'months').format("YYYY-MM"),i)} />
        </Row>)
      )
      return a
    }
  }

  handleApprove=(opt)=>{
    const { dispatch ,params} = this.props;
    const {flowStatus,flowType} = this.props;

    this.setState({loading:true})
    if(opt==='abandon'){
      dispatch(abdJR(params.id)).then(e=>{
        if(e.payload){
          this.setState({loading:false});
          message.success('Abandon success')
          history.back()
        }else{
          this.setState({loading:false});
          message.error(e.error.message);
        }
      })
    }else{
      dispatch(altJROpt(params.id,opt)).then(e=>{
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

  }

  setEdit=(v)=>{
    this.setState({readOnly:v})
  }


  render(){
    const {intl:{formatMessage},params,location:{pathname,query},JRInfo,vendor,client,clientPO,jrCate,dispatch,project,userInfo,product,tier4} = this.props;
    const { flowStatus,adHandle,finHandle,fmHandle, flowType,JRId,startTime,endTime,endOpen,selectedTier4,estiDate,selectEsti,modalLoading,estiModal,modalProLoad,modal_pro,MainCategory_value,SubCategory_value,modalLoad,modal,cpoTaxRate,DAF,SubCateLoad,MainCateLoad,detail,currency,per_type,gadUser,itemId ,loading,readOnly,editIndex , dataSource,dataSource_tier1,tier_load,groupRestMoney } = this.state
    console.log('state',this.state)
    console.log('llllpppppp',userInfo&&userInfo.toJS())

    const formColumns = [
      {dataIndex:_JRT.projectId,FormTag:
        <Select
          showSearch
          placeholder="Select a project"
          optionFilterProp="children"
          onChange={this.changeProject}
          style={{width:252}}
          // onFocus={handleFocus}
          // onBlur={handleBlur}
          filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
        >
          {project&&project.map(v=><Option key={v.get('id')} value={v.get('id')}>{v.get('name')}</Option>)}
        </Select>},
      {dataIndex:_JRT.id,props:{disabled:true}},
      {dataIndex:_JRT.receivedDate,FormTag:<DatePicker />,trans:formatDate,transform:moment},
      {dataIndex:_cliPOT.GADUsr,FormTag:
        <Select placeholder="Please select" allowClear={true} >
          {gadUser&&gadUser.map(v=><Option  key={v.id} value={v.id}>{v.id}</Option>)}
        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_cliPOT.clientDetailId,FormTag:
        <Select
          allowClear={true}
          disabled
          showSearch
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {client&&client.map(v=>(
            v.get('validFlag')==='Y'&&<Option key={v.get('id')} value={v.get('clientDetailId')} >{v.get('id')}</Option>
          ))}
        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},
      {dataIndex:_JRT.clientCode,props:{disabled:true},deep:['clientDetail','code']},
      {dataIndex:_JRT.productId,FormTag:
        <Select
          allowClear={true}
          showSearch
          placeholder={formatMessage({id:'pleaseSelect'})}
          onChange={this.changeProduct}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
        >
          {product&&product.map(v=>
            v.get('validFlag')==='Y'&&(<Option key={v.get('id')} value={v.get('id')} >{v.get('name')}</Option>
          ))}
        </Select>},
      {dataIndex:_JRT.productCode,props:{disabled:true},deep:['product','productDetails',0,'code']},
      {dataIndex:_JRT.description,span:24,colSpan:24,style:{marginLeft:'-2.1%'},labelCol:{span:4},FormTag:<TextArea rows={2}  />},
      {dataIndex:_JRT.brief,span:24,colSpan:24,labelCol:{span:4},style:{marginLeft:'-2.1%'},FormTag:<TextArea rows={2} />},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`JRDetail_${item.dataIndex}`}),
      })
    );

    const formColumns_WHT= [
      {dataIndex:_WHT.invAmount,props:{disabled:true}},
      {dataIndex:_WHT.vatIn,props:{disabled:true}},
      {dataIndex:_WHT.taxBear,FormTag:
        <Select >
          <Option key='ByGTBSH'>By GTB SH</Option>
          <Option key='BySupplier'>By Supplier</Option>
        </Select>},
      {dataIndex:_WHT.surtax,props:{disabled:true}},
      {dataIndex:_WHT.WHTex,props:{onChange:this.calWHT}},
      {dataIndex:_WHT.incTax,props:{disabled:true}},
      {dataIndex:_WHT.taxableAmount,props:{disabled:true}},
      {dataIndex:_WHT.total},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`WHT_${item.dataIndex}`}),
      })
    );

    const typeColumns = [
      {dataIndex:_JRT.currencyId,props:{disabled:true}},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`JRDetail_${item.dataIndex}`}),
      })
    );


    const typeDAFColumns = [
      {dataIndex:_JRT.currencyId,props:{disabled:true}},
      {dataIndex:_JRT.DAFId,FormTag:
        <Select
          allowClear={true}
          showSearch
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
        >
          {DAF.map(v=>(<Option key={v.id} value={v.id} >{v.name}</Option>
          ))}
        </Select>},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`JRDetail_${item.dataIndex}`}),
      })
    );

    const formColumns_pro = [
      {dataIndex:_T2TF.tier4Name,},
      {dataIndex:_T2TF.tier4Rest,props:{disabled:true}},
      {dataIndex:_T2TF.cpo,FormTag:
        <Select  allowClear={true} onChange={(e)=>this.setState({pro_cpo:e,pro_cpoChanged:true})}>
          {clientPO&&clientPO.toJS().map(v=><Option key={v.id} value={v.id} >{v.description}</Option>)}
        </Select>},
      {dataIndex:_T2TF.currencyId,},
      {dataIndex:_T2TF.amount},
      {dataIndex:_T2TF.name},
      {dataIndex:_T2TF.description},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`tier2_${item.dataIndex}`}),
      })
    );


    const renderForm=(v,column)=>{
      // //console.log('form',v)
      if(v == undefined || v=='') return
      if(column.trans){
        return column.trans(v)
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
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item'>
          <span   className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`JRDetail_${column.dataIndex}`})}</span>
          <span   className="payment-value" style={bold&&{fontWeight:"bold"}}>{
            renderForm(text,column)
          }</span>
        </Col>
      )};

    const cateDetail = (type,radio)=>{
      let Group = radio?RadioGroup:CheckboxGroup
      let Item = radio?Radio:Checkbox
      return (
          <Row style={{paddingBottom:20}}>
            <p style={{margin:'7px 0'}}>{formatMessage({id:type})} : </p>
            <Row style={{marginTop:20}}>
              <Group  onChange={(e)=>this.setState({[`${type}_value`]:e.target?e.target.value:e})} value={this.state[`${type}_value`]}>
                {
                  this.state[type].map(v=>
                    <Item key={v.id} value={v.id}>{v.id}</Item>
                  )
                }
              </Group>
            </Row>
            <Row type='flex' justify='start' style={{marginTop:15}}>
              <p style={{lineHeight:'24.5px'}}>Others :</p>
              <Input style={{margin:'0 10px',width:150}} onChange={(e)=>this.setState({[`${type}_input`]:e.target.value})}/>
              <Button style={{backgroundColor:'#f7f7f7'}} onClick={()=>{
                let tar = {}
                tar.id = this.state[`${type}_input`]
                tar.JRTypeCategory = type
                tar.JRTypeLevel = 'Others'
                this.setState({cateLoad:true})
                dispatch(newJr(tar)).then(e=>{
                  if(e.error){
                    message.error(e.error.message)
                    this.setState({cateLoad:false})
                  }else{
                    this.setState({cateLoad:false})
                    let obj = {}
                    obj[type] = [...this.state[type],tar]
                    this.setState(obj)
                  }
                })
              }}>Add</Button>
            </Row>
          </Row>
        )
    }


    const columns = [
      {  dataIndex: _JRT.vendorDetailId,width:120,render:(text,record,index)=>
        readOnly?<span>{text}</span>:<Select onChange={this.changeFormVendor(index)}
                style={{width:120}}
                value={record.vendorDetailId}
        >
        {vendor&&vendor.map(v=>
          v.get('validFlag')==='Y'&&<Option key={v.get('id')}>{v.get('nameEN')}</Option>)}
      </Select>},
      {  dataIndex: _JRT.vendorCode},
      {  dataIndex: _JRT.net ,render:text=>formatMoney(text),shouldRender:true},
      {  dataIndex: _JRT.gross,render:(text,record,index)=>readOnly?<span>{record.gross}</span>:<Input value={record.gross} disabled={record.vendorDetailId.length===0} onChange={this.changeGross(index,record.taxRate,cpoTaxRate)}/>},
      {  dataIndex: _JRT.PETax,render:(text,record,index)=>readOnly?<span>{text}</span>:record.location==='oversea'&&currency==='CNY'?
        <a onClick={() => {
        this.setState({modal: true, PEIndex: index},
          () => this.form_WHT.setFieldsValue({
            invAmount: formatMoney(record.gross),
            vatIn : !isNaN(record.vatIn)?formatMoney(record.vatIn):record.vatIn,
            taxBear: record.taxBear,
            surtax: !isNaN(record.surtax)?formatMoney(record.surtax):record.surtax,
            WHTex: record.WHTex,
            incTax: !isNaN(record.incTax)?formatMoney(record.incTax):record.incTax,
            taxableAmount: !isNaN(record.taxableAmount)?formatMoney(record.taxableAmount):record.taxableAmount,
            total: !isNaN(record.total)?formatMoney(record.total):record.total,
          }))
      }
      }>{record.PETax.length>0?record.PETax:formatMessage({id:'calculation'})}</a>:formatMoney(text)
        ,shouldRender:true},
      {  dataIndex: _JRT.PEGross ,render:text=>formatMoney(text),shouldRender:true},
      {  dataIndex: _JRT.File,width:200},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`JRDetail_${item.dataIndex}`}),
      })
    );

    const rightContent = params.id==='new'?null:<Row style={{margin:'27px 0',marginLeft:15}} className="inv-badge">
      <Badge status="processing"   text={`${JRInfo&&formatMessage({id:`JR_${JRInfo&&JRInfo.get('flowType')}`}) } - ${JRInfo&&formatMessage({id:`JR_${JRInfo&&JRInfo.get('flowStatus')}`})}`} />
    </Row>


    const showDAFBtn = per_type==='nonLowBid'&&params.id!=='new'||per_type==='directAward'&&params.id!=='new'
    const showDAF = per_type==='nonLowBid'||per_type==='directAward'
    const ad = ifFin('Account-Director',userInfo&&userInfo.toJS()),
      fd = ifFin('Finance-Director',userInfo&&userInfo.toJS()),
      fm = ifFin('Finance-Manager',userInfo&&userInfo.toJS()),
      ifFinGroup = fd||fm
    const canChange = params.id==='new'||JRInfo&&JRInfo.get('flowStatus')==='toSubmit'

    const canEdit = readOnly &&flowStatus!=='abandoned'&&flowStatus!=='effective'
    const isADApprover = JRInfo&&JRInfo.get('flowStatus') ==='toApproveByAD'
    return (
      <Row style={{paddingBottom:50}}>
        <Title  title={formatMessage({id:`${_tit.JR_detail}`})} rightContent={JRInfo&&rightContent}  />
        {/* <Title  title={<Row>
            <Col span={10}>{formatMessage({id:`${_tit.group_detail}`})}</Col>
            <Col span={10} offset={4}>
              <Button onClick={()=>this.getData()}>{"自动添加测试数据"}</Button>
            </Col>
          </Row>} /> */}
        <Spin   spinning={ loading } tip="Processing...">
          <Row style={{paddingBottom:100,overflowX:'auto'}}>
          <Row style={{marginTop:61}}>
            <Row type='flex' justify='start' style={{borderBottom:'1px solid #ddd'}}>
              <p className='small_title' style={{marginRight:8}} >{params.id==='new'?'New JR':'JR Information'}</p>
              <Button onClick={()=>{const {dispatch} = this.props ;dispatch(pathJump('/JR'))}}  size="small" style={{backgroundColor:'#f7f7f7',marginTop:7}}><Icon type="rollback" />{formatMessage({id:'returnToJR'})}</Button>
            </Row>
            {
              <Row type='flex' justify='start' className='top-form' style={{width:1500}} >
                <p  className='main_title' >Basic Info</p>
                {readOnly?
                  JRInfo&&<Row  className="payment-read" style={{width:800}}>
                    {formColumns.map(v=>columnMap(v,JRInfo))}
                  </Row>:
                  <Row  style={{width:1126}}>
                  <SimpleForm columns={ formColumns } initial={params.id === 'new'?Immutable.fromJS([]):JRInfo} colSpan={12} labelCol={{span:7}} ref={f=>this.form=f} />
                    <Button className='create-btn' onClick={()=>this.setState({modal_pro:true})} >{formatMessage({id:'create'})}</Button>
                  </Row>}
              </Row>}
          </Row>
          <Row type='flex' justify='start' className='top-form' >
            <p className='main_title'  >Purchase Type</p>
              <Row>
                {!readOnly&&
                  <Row>
                    <RadioGroup size="large" value={per_type} onChange={this.changeType}>
                      <RadioButton value="smallAmount">{currency==='CNY'?'< ￥60,000.00':'< $10,000.00'}</RadioButton>
                      <RadioButton value="threeBid">3-Bid Lowest Bid</RadioButton>
                      <RadioButton value="nonLowBid">3-Bid Non-lowest Bid</RadioButton>
                      <RadioButton value="directAward">Direct Award</RadioButton>
                    </RadioGroup>
                  </Row>
                }
                {readOnly?
                  JRInfo&&<Row className="payment-read" >
                    {typeDAFColumns.map(v=>columnMap(v,JRInfo))}
                  </Row>:
                  <Row>
                    <Row style={{marginLeft:-61,marginTop:30}}>
                    <SimpleForm columns={ showDAF?typeDAFColumns:typeColumns } initial={params.id === 'new'?Immutable.fromJS([]):JRInfo} colSpan={12} labelCol={{span:7}} ref={f=>this.typeForm=f} />
                    </Row>
                    {showDAFBtn&&<Row className='DAF-checkbox'>
                      <Checkbox onChange={(e)=>this.setState({abandonDAF:e})}>{formatMessage({id:'abandonDaf'})}</Checkbox>
                    </Row>}
                  </Row>
                }

              {<Table
                columns={columns}
                dataSource={detail}
                // onRowClick={(record,index)=>readOnly?this.setState({editIndex:-1}):this.setState({editIndex:index})}
                rowClassName={(record,index)=>index===0?'row-highlight':''}
                bordered
                pagination={false}
                rowKey={record=>record.id}
                size="small"
              />


              }
                {<Button style={{margin:'15px 0'}} disabled={!JRId} onClick={()=>{
                  const{dispatch} = this.props;
                  this.setState({loading:true})
                  dispatch(fetchJRMainInfo(params.id)).then(e=>{
                    if(e.payload){
                      this.setState({
                        startTime: e.payload.estimateCosts.length>0?moment(e.payload.estimateCosts[0].period):'',
                        endTime: e.payload.estimateCosts.length>0?moment(e.payload.estimateCosts[e.payload.estimateCosts.length - 1].period):'',
                        selectEsti:e.payload.estimateCosts.reduce((acc,cur)=>acc+cur.cost,0),
                        loading:false,
                        estiModal:true
                      });
                    }else{
                      this.setState({loading:false});
                      message.error(e.error.message);
                    }
                  })
                }}>{formatMessage({id:'estimate'})}</Button>}
            </Row>
          </Row>
          <Row type='flex' justify='start' className='top-form' >
            <p className='main_title' >Category</p>
            <Row>
              {readOnly?
                <Row className="payment-read" style={{border:0}}>
                  <Col span={ 24 } className='payment-item' style={{borderRight:0}}>
                    <span   className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:'MainCategory'})}</span>
                    <span   className="payment-value" >{
                      MainCategory_value
                    }</span>
                  </Col>
                </Row>
                :
                <Row style={{borderBottom:'1px dashed #ddd'}}>
                <Spin   spinning={ MainCateLoad } tip="Processing...">
                {cateDetail('MainCategory',true)}
                </Spin>
              </Row>}
              {readOnly?
                <Row className="payment-read" style={{border:0}}>
                  <Col span={ 24 } className='payment-item' style={{border:0}}>
                    <span   className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:'SubCategory'})}</span>
                    <span   className="payment-value" >{
                      SubCategory_value.join(',')
                    }</span>
                  </Col>
                </Row>
                :<Row  style={{marginTop:15}} >
                <Spin   spinning={ SubCateLoad } tip="Processing...">
                {cateDetail('SubCategory',false)}
                </Spin>
              </Row>}
            </Row>
          </Row>
          <Row style={{marginTop:30,textAlign:'center'}}>
            {readOnly&&<Row style={{marginBottom:'15px'}}>
              {adHandle&&ad&&<Button onClick={this.handleApprove.bind(this,'adApprove')} type='primary' size="large" style={{marginRight:10}}>{formatMessage({id:'ad-agree'})}</Button>}
              {adHandle&&ad&&<Button onClick={this.handleApprove.bind(this,'adRefuse')} type='danger' size="large">{formatMessage({id:'ad-disagree'})}</Button>}
              {finHandle&&ifFinGroup&&<Button onClick={this.handleApprove.bind(this,flowType==='Create'?'financeApproveToEffective':'financeApproveToFM')} type='primary' size="large" style={{marginRight:10}}>{formatMessage({id:'fin-agree'})}</Button>}
              {finHandle&&ifFinGroup&&<Button onClick={this.handleApprove.bind(this,'financeRefuse')} type='danger' size="large">{formatMessage({id:'fin-disagree'})}</Button>}
              {fmHandle&&fm&&<Button onClick={this.handleApprove.bind(this,'financeApproveToEffective')} type='primary' size="large" style={{marginRight:10}}>{formatMessage({id:'fm-agree'})}</Button>}
              {fmHandle&&fm&&<Button onClick={this.handleApprove.bind(this,'fmRefuse')} type='danger' size="large">{formatMessage({id:'fm-disagree'})}</Button>}
            </Row>}
            <Row>
              {!readOnly&&<Button onClick={this.handleModal.bind(this,'submit')} type='primary' size="large" style={{marginRight:10}}>{params.id==='new'?formatMessage({id:'new_submit_btn'}):formatMessage({id:'save_submit_btn'})}</Button>}
              {canChange&&<Button onClick={this.handleModal.bind(this,'save')}  size="large" style={{marginRight:10}}>{params.id==='new'?formatMessage({id:'new_btn'}):formatMessage({id:'save_btn'})}</Button>}
              {canEdit&&<Button onClick={()=>{
                Modal.confirm({
                  title: 'Do you want edit this JR ?',
                  content: 'This is an important operation',
                  okText:'Edit anyway',
                  okType:'danger',
                  onOk:()=>this.setEdit(false)
                });
                }
              }  size="large" style={{marginRight:10}}>{formatMessage({id:'edit'})}</Button>}
              {canEdit&&<Button onClick={this.handleApprove.bind(this,'abandon')} type='danger' size="large" style={{marginRight:10}}>{formatMessage({id:'abandon'})}</Button>}
              {<Button onClick={()=>{const {dispatch} = this.props ;dispatch(pathJump('/JR'))}}  size="large">{formatMessage({id:'cancel'})}</Button>}
            </Row>
           </Row>
          </Row>
        </Spin>
        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false})}
          title={formatMessage({id:'WHTCal'})}
          onOk={this.handleWHT}
          maskClosable={false}
          width={900}
        >
          <Spin  spinning={ modalLoad } tip="Processing..." >
            <Row>
              <SimpleForm columns={ formColumns_WHT }  colSpan={12} labelCol={{span:7}} ref={f=>this.form_WHT=f} />
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modal_pro}
          onCancel={()=>this.setState({modal_pro:false})}
          title={formatMessage({id:'createProject'})}
          onOk={this.handlePro}
          maskClosable={false}
          width={500}
        >
          <Spin  spinning={ modalProLoad } tip="Processing..." >
            <Row>
              <SimpleForm columns={ formColumns_pro }  colSpan={24} labelCol={{span:7}} ref={f=>this.form_pro=f} />
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={estiModal}
          onCancel={()=>this.setState({estiModal:false})}
          title={formatMessage({id:'estimate'})}
          onOk={this.handleEstiModal}
          maskClosable={false}
          width={600}
        >
          <Spin  spinning={ modalLoading } tip="Processing..." >
            <Row style={{display:'flex',justifyContent:'center'}}>
              <Row>
                <Row style={{display:'flex',marginBottom:10,marginLeft:'-14px'}}>
                  <p style={{marginRight:10,fontWeight:'bold'}}>{formatMessage({id:'esti_date'})} :</p>
                  <MonthPicker
                    value={startTime}
                    placeholder="Start"
                    onChange={this.onStartChange}
                    onOpenChange={this.handleStartOpenChange}
                    style={{marginRight:10}}
                  />
                  <MonthPicker
                    value={endTime}
                    placeholder="End"
                    onChange={this.onEndChange}
                    open={endOpen}
                    onOpenChange={this.handleEndOpenChange}
                  />
                </Row>
                <Row style={{display:'flex'}}>
                  <p style={{marginRight:10,fontWeight:'bold'}}>{formatMessage({id:'esti_amount'})} :</p>
                  <InputNumber
                    style={{width:170,textAlign:'right'}}
                    value={selectEsti}
                    // formatter={value => formatMoney(value)}
                    onChange={(value)=>this.setState({selectEsti:value})}
                    //formatter={value => `${selectedTier4&&selectedTier4.group.currencyId==='CNY'?'￥':'$'} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    //parser={value => selectedTier4&&selectedTier4.group.currencyId==='CNY'?value.replace(/\￥\s?|(,*)/g, ''):value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Row>
                <Row style={{marginTop:10}}>
                  <p style={{fontWeight:'bold'}} ><span>Month</span><span style={{marginLeft:130}} >Amount</span></p>
                  {this.renderEsti()}
                </Row>
                <Button type="dashed" onClick={()=>{this.setState({diff:null,estiValue:[],startTime:null,endTime:null})}} >{formatMessage({id:'resetAll'})}</Button>
              </Row>
            </Row>
          </Spin>
        </Modal>
      </Row>
    )
  }
}


JRDetailsPage.propTypes = {
  pathJump : React.PropTypes.func,
};

const mapStateToProps = (state) =>{
  return ({
    JRInfo: state.getIn(['JR','JRInfo']),
    tier4: state.getIn(['JR','tier4']),
    jrCate : state.getIn(['jr','jr']),
    project: state.getIn(['JR','project']),
    wht: state.getIn(['JR','wht']),
    client : state.getIn(['client','client']),
    userInfo : state.getIn(['userInfo','userLoginInfo']),
    product : state.getIn(['product','product']),
    vendor : state.getIn(['vendor','vendors']),
    JRId: state.getIn(['JR','JRId']),
    clientPO : state.getIn(['clientPO','clientPO']),

  });
}

export default injectIntl(connect(mapStateToProps)(JRDetailsPage))
