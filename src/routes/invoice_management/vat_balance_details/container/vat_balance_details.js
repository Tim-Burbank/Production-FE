/**
 * Created by Maoguijun on 2017/8/14.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Form,InputNumber,Radio,Row , message ,Card, Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip ,Menu,Tabs,Popconfirm  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import {AddTable,SmallSelectionTable,SelectableCell} from '../../../../components/AddTable/AddTable'
import {AddVatTable} from '../../../../components/AddVatTable/AddVatTable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {host,titles as _tit ,VatBalance_tableVATField as VatBalanceVTF,VatBalance_tableINVField as VatBalanceITF,VatBalance_tableAbandonField as VatBalanceATF,currency as _cur,balanceType,FPCate as _FPC} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {format,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,add,sub,mul,div} from '../../../../utils/formatData'
import { getFormRequired } from '../../../../utils/common'
import { fetchVatBalance ,newVatBalance ,altVatBalance ,fetchVatBalanceInfo,updateVatBalance,fetchDisable} from '../modules/vat_balance_details'
import { fetchBillTo } from '../../../system_settings/bill_to/modules/bill_to'
import { fetchClientPO,fetchClientPOInfo } from '../../../clientPO/modules/client_po'
import { opInvoice,fetchInvoice ,fetchInvoiceInfo ,newInvoice ,altInvoice,disabledCPO,agreeCPO} from '../../../invoice_management/modules/invoice_management'
import { fetchClient , fetchClientInfo } from '../../../system_settings/client/modules/client'
import TableTitle from '../../../../components/TableTitle/TableTitle'
import {fetchVAT ,newVAT,updateVAT,delVAT,fetchVATInfo } from '../../../VAT_list/modules/VAT_list.js'
import './vat_balance_details.css'
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
let uuid = 9999
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment'


class VatBalanceDetails extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      modal_abandon    : false,
      modal_payOff     : false,
      itemId           : '',//浮层选择的index
      id               : '',//vatBalance的查询id
      isSave           : false,
      loading          : false,
      previewImage     : '',
      currentPage      : 1,
      modal            : false,
      modalLoad        : false,
      itemId           : null,
      modal_t          : false,
      status           : false,
      modalTLoad       : false,
      slideList        : [],
      clientPoId       : '',
      clientId         : '',
      currencyId       : '',
      BillToId         : '',
      balanceTypeId    : '',
      // CurrencyId    : '',
      approver         : [],
      FPCategoryId     : '',
      ApproverId       : '',

      billToId         : '',
      sentToId         : '',
      clientPoDetailId : '',
      FormItems        : Immutable.fromJS([]),

      //inv 表格
      balance_collected: Immutable.fromJS([]),//已选择的数据
      balance_toCollect: Immutable.fromJS([]),//待选择的数据
      balance_credit   : Immutable.fromJS([]),//已废弃或者已冲抵的
      INVselectOption  : '',//下拉框选到的项
      INVisable        : '',
      CNY              : 0,
      INVselectList    : [],//INV下拉框选项
      isInvList        : false,

      //vat 表格
      VATisable        : '',
      VATselectList    : [],//VAT下拉框选项
      vat_toSelect     : Immutable.fromJS([]),
      vat_selected     : Immutable.fromJS([]),
      vat_credit       : Immutable.fromJS([]),
      vatIndex         : 0,//vat数组的计数器
      vat_selected_org : Immutable.fromJS([]),//没有经过处理的vatlist

      net_total        : 0,
      tax_total        : 0,
      gross_total      : 0,
      VatInfo          : Immutable.fromJS([]),
      VatInfo_credit   : Immutable.fromJS([]),
      VatInfo_org      : Immutable.fromJS([]),

      //上传
      picModal         : false,
      uploadId         : '',
      slideList        : [],
      isChange         : false,//这个是带数据过来之后用来记录是否有人点击了下拉框
      withInv          : false//检测是否带数据过来了
    }
  }



  /**
   *
   *
   * @memberof VatBalanceDetails
   */
  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props', this.props)
    this.setState({
      INVisable:!this.state.INVselectList.length,
      VATisable:this.state.VATselectList.length,
    })
    dispatch(fetchBillTo());
    dispatch(fetchClient());
    dispatch(fetchClientPO());
    // dispatch(fetchInvoice());

    if (params.id !== 'new') {
      //console.log(66,params)
      this.setState({ modalLoad: true });
      // dispatch(fetchInvoice());
      console.log(123,params.id.slice(0,4))
      if(params.id.slice(0,4) === "vat=" ){
        let values = {
          "VATBalanceDetail.VATId":params.id.slice(4),
          // "VATBalanceDetail.invoiceId":params.id,
        }
        this.seeVATBalanceWithId(values)
      }else{
        let values = {
          // "VATBalanceDetail.VATId":params.id,
          "VATBalanceDetail.invoiceId":params.id,
        }
        this.seeVATBalanceWithId(values)
      }
    }
  }


  //查看是的请求
  seeVATBalanceWithId=(values)=>{
    const {dispatch} = this.props
    dispatch(fetchVatBalanceInfo(values)).then((e)=>{
      if(e.payload){
        // //console.log(89,e.payload)
        let balance_collected=[],balance_credit=[],vat_selected=[],vat_credit=[]
        console.log(153,e.payload.obj)
        dispatch(fetchDisable(e.payload.obj.id)).then(event=>{
          if(event.error){
            message.error(event.error.message)
          }else{
            console.log(157,event.payload)
            event.payload.obj.vats.map(item=>{
              item.gross /=100
              item.net /=100
              item.tax /=100
              item.clientPoIdDescription = item.clientPoDetail.description
            })
            event.payload.obj.invs.map(item=>{
              item.gross /=100
              item.net /=100
              item.tax /=100
              item.clientPoIdDescription = item.clientPoDetail.description
            })
            console.log(167,event.payload)
            this.setState({
              vat_credit:Immutable.fromJS(event.payload.obj.vats),
              balance_credit:Immutable.fromJS(event.payload.obj.invs),
            })
          }
        })
        balance_collected = e.payload.invoices
        vat_selected = e.payload.vats
        //排序
        balance_collected.sort((a,b)=>a.index-b.index).map(item=>          item.clientPoIdDescription = item.clientPoDetail.description)
        vat_selected.sort((a,b)=>a.index-b.index)

        let CNY = 0,total_net=0,total_tax=0,total_gross=0;
        balance_collected.forEach(item=>{
          CNY +=item.gross
        })
        //添加三个状态
        this.setState({
          vat_selected_org:Immutable.fromJS(vat_selected)
        })
        vat_selected.map(item=>{
          item.statusBB=true
          item.statusCC=true
          item.actualInvoiceDate = moment(item.actualInvoiceDate)
          item.gross = item.gross/100
          item.net = item.net/100
          item.tax = item.tax/100
        })
        vat_selected.forEach(item=>{
          total_gross +=item.gross
          total_tax +=item.tax
          total_net +=item.net
        })
        //console.log(112,balance_collected,balance_credit,vat_selected,vat_credit)
        //console.log(169,e.payload.obj,e.payload.invoices  )
        //填充表单
        this.setState({
          modalLoad: false,
          // balance_credit:Immutable.fromJS(balance_credit),
          vat_selected:Immutable.fromJS(vat_selected),
          // vat_credit:Immutable.fromJS(vat_credit),
          FormItems:e.payload.obj,
          id:e.payload.obj.id,
          gross_total:total_gross,
          tax_total:total_tax,
          net_total:total_net,
          balance_collected:Immutable.fromJS(balance_collected),
          CNY:CNY,

          clientPoId:e.payload.obj.clientPoId,
        });
        console.log(216,e.payload.obj,e.payload.invoices[0])
        this.formRef.setFieldsValue({
          ...e.payload.obj,
          ...e.payload.invoices[0],
          description:e.payload.obj.description
        })
      }else{
        message.error(e.error.message);
        const {params} = this.props
        // let parma = params.id.slice()
        dispatch(pathJump("/invoice_management/vat_balance_details/new"))
        this.setState({modalLoad:false})
      }
    })
  }
  componentDidUpdate(nextProps, nextState) {
    //console.log(90000,this.state,nextState)
    const {dispatch, params,intl:{formatMessage}} = this.props
    const {clientId,currencyId,clientPoId,ApproverId,FPCategoryId, BillToId,isable,balanceTypeId, CurrencyId, INVselectOption, balance_toCollect,balance_collected,INVselectList,VATselectOption,vat_desc,vat_selected,vat_net,createTime,filePath,statusBB,statusCC} = this.state
    // console.log(132,clientPoId, clientId, ApproverId, INVselectOption)

    let invList = sessionStorage.getItem("invList")&&JSON.parse(sessionStorage.getItem("invList"))
    console.log(281,invList)
    // invList&&this.setState({
    //   isInvList:true
    // })
    if(invList){
      !this.state.isInvList&&this.setState({
        isInvList:true,
      })
      !this.state.withInv&&this.setState({
        withInv:true
      })
    }else{
      this.state.isInvList&&this.setState({
        isInvList:false
      })
    }

    if(params.id==="new"&&invList){
      //新建的时候先看看有没有带数据过来
      let invList = sessionStorage.getItem("invList")&&JSON.parse(sessionStorage.getItem("invList"))
      console.log(146,invList)
      if(invList&&invList.length>0){
        const {clientPoId,clientPoDetail:{clientId,currencyId},FPCategory,approverId}=invList[0]
        let formItems ={clientPoId,clientId,currencyId,FPCategory,approverId}
        console.log(151,formItems)
        let value = {
          obj:formItems,
          invoices:invList,
          vats:[],
        }
        dispatch({
          type:"FETCH_VAT_BALANCE_INFO",
          payload:value
        })
        let CNY=0
        invList.forEach(item=>{
          CNY+=item.gross
          item.clientPoIdDescription = item.clientPoDetail.description
        })
        this.setState({
          clientPoId,
          FPCategoryId:FPCategory,
          ApproverId:approverId,
          balance_collected:Immutable.fromJS(invList),
          CNY,
        })

        sessionStorage.setItem("invList","")
      }
    }

    // console.log(325,clientPoId,nextState.clientPoId)
    if(clientPoId !=nextState.clientPoId){
      if(clientPoId){
        //清空client,currencyId
        // this.setState({
        //   clientId:'',
        //   currencyId:'',
        //   FPCategoryId:'',
        //   approverId:'',
        // }),
        // this.formRef.setFieldsValue({
        //   FPCategory:formatMessage({id:'pleaseSelect'}),
        //   approverId:formatMessage({id:'pleaseSelect'}),
        // })

        //console.log('开始发请求')
        dispatch(fetchClientPOInfo(clientPoId)).then(e=>{
          this.setState({
            clientId:e.payload.clientId,
            FPCategoryId:e.payload.FPCategory,
            currencyId:e.payload.currencyId,
            billToId:e.payload.billToId,
            sentToId:e.payload.sentToId,
            clientPoDetailId:e.payload.clientPoDetailId,
          })
        })
      }
    }
    if(clientId !=nextState.clientId){
      //console.log(154,clientId,nextState.clientId)
      if(clientId){
        //console.log('开始发请求client',clientId)
        dispatch(fetchClientInfo(clientId)).then(e=>{
          //console.log(157,e.payload)
          let approvers = []
          e.payload.approvers.forEach(item=>{
            for(let key in item){
              approvers.push(item[key])
            }
          })
          //console.log(163,approvers)
          this.setState({
            approver:approvers,
          })
        })
      }
    }
    //填充表单
    this.formRef.setFieldsValue({
      clientId:clientId,
      currencyId:currencyId,
    })

    if (clientPoId != nextState.clientPoId || FPCategoryId != nextState.FPCategoryId||ApproverId != nextState.ApproverId) {
      if (clientPoId && FPCategoryId && ApproverId) {
      //发起请求前，初始化一些状态
      //如果invList 存在则不清空
        !this.state.isInvList&&this.setState({
          INVselectList: [],
          INVisable:0,
          balance_collected:Immutable.fromJS([]),
        })
        let valuesINV = {
          'clientPoId_like':clientPoId,
          'FPCategory': FPCategoryId,
          'approverId': ApproverId,
          flowStatus_notIn:"toSubmit,toApproveByFD,collected,charged,abandoned",
        }
        //请求invoice
        dispatch(fetchInvoice(valuesINV)).then(e=>{
          if(e.error){
            message.error(e.error.message);
            this.setState({
              loading: false,
            })
          }else{
            let s=[]
            e.payload.objs.map(item=>{
                s.push(item.id)
                item.clientPoIdDescription = item.clientPoDetail.description
            })
            //剔除invList 中有的
            if(this.state.balance_collected){
              let _invList = this.state.balance_collected.toJS()

              s = s.filter(item=>{
                let a ,isNotSame = false
                for(let i=0;i<_invList.length;i++){
                  console.log(418,_invList[i])
                  if(item===_invList[i].id){
                    continue
                  }else{
                    isNotSame = true
                    a = item
                  }
                }
                return a
              })
            }

            if(!this.state.isInvList&&this.state.isChange){
              this.setState({
                CNY:0
              })
            }
            this.setState({
              loading: false,
              balance_toCollect: Immutable.fromJS(e.payload.objs),
              INVselectList: s,
              INVisable:!(s.length),
              INVselectOption:'',
            })
          }
        })
      }
    }
    if (INVselectOption != nextState.INVselectOption) {
      //console.log(183, balance_toCollect, INVselectOption,INVselectList,isable)
      let sp = {mes:'空对象'}
      balance_toCollect.forEach(item => {
        //console.log(...item);
        if (item.get('id') === INVselectOption) {
          sp = item
        }
      })
      //console.log(190, balance_collected, sp)
      let nextSelctList = []
      INVselectList.forEach(item => {
        if (item !== INVselectOption) {
          nextSelctList.push(item)
        }
      })
      let CNY=0
      balance_collected.forEach(item=>{
        CNY += item.get('gross')
      })
      //console.log(348,sp)
      if(!sp.mes){
        CNY += sp.get('gross')
      }
      this.setState({
        balance_collected: Immutable.fromJS([...balance_collected.toArray(), sp]),
        INVselectList: nextSelctList,
        INVisable:!(nextSelctList.length),
        CNY:CNY
      })
    }
  }
  //新增一行数据
  handleVatAdd=()=>{
    //console.log('add',this.state.vatIndex)
    let _vatIndex=this.state.vatIndex
    this.setState({
      vatIndex:_vatIndex+1,
      vat_selected:Immutable.fromJS([...this.state.vat_selected.toArray(),{index:_vatIndex}])
    })
    //console.log(371,this.state.vat_selected.toArray())
  }
  //修改单元格的数据
  editCell=(index,name,value)=>{
    //console.log(335,index,name,value)
    let _vat_selected = this.state.vat_selected.toJS()
    _vat_selected[index][name]=value
    this.setState({
      vat_selected:Immutable.fromJS(_vat_selected)
    })
  }
  //保存一行数据并新建一个vat//并统计数据
  rowSave=(index)=>{
    let _vat_selected = this.state.vat_selected.toJS()
    _vat_selected[index].statusBB=true
    _vat_selected[index].statusCC=true
    let _net_total=0,_tax_total=0,_gross_total=0
    _vat_selected.forEach(item=>{
      _net_total+=item.net
      _tax_total+=item.tax
      _gross_total+=item.gross
    })
    //console.log(346,_vat_selected[index])
    this.newVAT(_vat_selected[index],()=>this.setState({
      vat_selected:Immutable.fromJS(_vat_selected),
      net_total:_net_total,
      tax_total:_tax_total,
      gross_total:_gross_total,
    }))
  }
  //新增或更新 一条vat
  newVAT = (value,cb) => {
    this.formRef.validateFields((err,valueF)=>{
      const {FPCategory,clientPoId,approverId} = valueF
      const {dispatch } =this.props
      const {billToId,sentToId,clientPoDetailId } = this.state
      let values={
        ...value,
        taxRate:'1',
        FPType:'common',
        FPCategory:FPCategory,
        clientPoId:clientPoId,
        approverId:approverId,
        billToId:billToId,
        sentToId:sentToId,
        clientPoDetailId:clientPoDetailId,
      }
      Object.assign(values,{gross:Math.round(value.gross*100),tax:Math.round(value.tax*100),net:Math.round(value.net*100)})
      //console.log(379,value)
      dispatch(newVAT(values)).then(e=>{
        if(e.error){
          //不能新建则更新
          dispatch(updateVAT(values.id,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
            }else{
              cb()
              message.success('vat更新成功')
            }
          })
        }else{
          cb()
          message.success('vat新建成功')
        }
      })
    })
  }
  //修改一行数据
  rowEdit=(index)=>{
    let _vat_selected = this.state.vat_selected.toJS()
    _vat_selected[index].statusBB=false
    this.setState({
      vat_selected:Immutable.fromJS(_vat_selected)
    })
  }
  //根据net计算tax,gross
  calculate=(index,value)=>{
    //console.log(398,value)
    let _vat_selected = this.state.vat_selected.toJS()
    _vat_selected[index].gross=parseFloat(value)
    _vat_selected[index].net=parseFloat(value)/1.06
    _vat_selected[index].tax=parseFloat(value)*0.06/1.06
    this.setState({
      vat_selected:Immutable.fromJS(_vat_selected)
    })
  }
  //取消新建
  deleteRow=(index)=>{
    let _vat_selected = this.state.vat_selected.toJS()
    _vat_selected.pop()
    this.setState({
      vat_selected:Immutable.fromJS(_vat_selected)
    })
  }
  //废弃一条vat
  abandonRow=(index,id)=>{
    //console.log(475,index,id)
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchVATInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){

        let _VatInfo = e.payload
        _VatInfo.gross = _VatInfo.gross/100
        _VatInfo.tax = _VatInfo.tax/100
        _VatInfo.net = _VatInfo.net/100
        _VatInfo.actualInvoiceDate =_VatInfo.actualInvoiceDate? moment(_VatInfo.actualInvoiceDate).format('YYYY-MM-DD'):''
        _VatInfo.dueDate = _VatInfo.dueDate?moment(_VatInfo.dueDate).format('YYYY-MM-DD'):''

        this.setState({
          itemId:id,
          modal_abandon:true,
          loading:false,
          VatInfo:Immutable.fromJS(_VatInfo)
        })
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }
  //确认废弃
  handleModal_abandon=(id)=>{
    const {dispatch,params} = this.props
    // let _vat_selected = this.state.vat_selected.toJS()
    // //console.log(469,_vat_selected[index].id)
    dispatch(delVAT(id)).then(e=>{
      if(e.error){
        message.error(e.error.message)
      }else{
        message.success(`${id}已被废弃！`)
        //更新当前表格数据
        if(params.id.slice(0,4) === "vat=" ){
          let values = {
            "VATBalanceDetail.VATId":params.id.slice(4),
          }
          this.seeVATBalanceWithId(values)
        }else{
          let values = {
            "VATBalanceDetail.invoiceId":params.id,
          }
          this.seeVATBalanceWithId(values)
        }
        this.setState({
          modal_abandon:false,
          itemId:null,
        })
      }
    })

  }

  //冲抵一条vat
  payOffRow=(id)=>{
    //console.log(511,id)
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchVATInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        let values = {
          ...e.payload,
          ...e.payload.clientPoDetail,
          id:'',
          gross : e.payload.gross/100,
          tax : e.payload.tax/100,
          net : e.payload.net/100,
        }

        delete values.actualInvoiceDate
        delete values.dueDate

        this.setState({
          VatInfo_org:Immutable.fromJS(e.payload)//没有处理的vatInfo
        })
        let _VatInfo = e.payload
        _VatInfo.gross = _VatInfo.gross/100
        _VatInfo.tax = _VatInfo.tax/100
        _VatInfo.net = _VatInfo.net/100
        _VatInfo.actualInvoiceDate =_VatInfo.actualInvoiceDate? moment(_VatInfo.actualInvoiceDate).format('YYYY-MM-DD'):''
        _VatInfo.dueDate = _VatInfo.dueDate?moment(_VatInfo.dueDate).format('YYYY-MM-DD'):''

        this.setState({
          itemId:id,
          modal_payOff:true,
          loading:false,
          VatInfo:Immutable.fromJS(_VatInfo),
          VatInfo_credit:Immutable.fromJS(values),
        })
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }

  //确认冲抵
  handleModal_payOff=(id)=>{
    const {dispatch,params}=this.props
    const {VatInfo_credit,VatInfo_org} = this.state
    this.formCredit.validateFields((err,value)=>{
      if(err){
        message.error(err.message)
      }else{
        console.log(530,VatInfo_org.toJS())
        let values = {
          ...value,
          gross:VatInfo_org.get('gross'),
          tax:VatInfo_org.get('tax'),
          net:VatInfo_org.get('net'),
          FPType:'creditNote',
          VATId:id,
          usedType: "client",
          taxRate: "1",
          clientPoDetailId:VatInfo_credit.get('clientPoDetailId'),
          FPCategory:VatInfo_credit.get('FPCategory'),
        }
        console.log(553,values)
        dispatch(newVAT(values)).then(e=>{
          if(e.error){
            message.error(e.error.message)
          }else{
            //更新表格数据
            message.success(`${id}已经被${value.id}冲抵！`)
            let values = {}
            if(params.id.slice(0,4) === "vat=" ){
              values = {
                "VATBalanceDetail.VATId":params.id.slice(4),
              }
            }else{
              values = {
                "VATBalanceDetail.invoiceId":params.id,
              }
              this.seeVATBalanceWithId(values)
            }


            this.setState({
              modal_payOff:false,
              itemId:null,
            },()=>this.seeVATBalanceWithId(values))
          }
        })
      }
    })
  }

  // 处理数据vatBalance
  vatCollectBalance = (invs, vats) => {
    let result = []

    invs = invs.sort((prev, next) => next.index > prev.index).map(i => Object.assign({}, i))
    vats = vats.sort((prev, next) => next.index > prev.index).map(i => Object.assign({}, i))

    console.log(invs, vats)
    for (let inv of invs) {
      let restAmount = inv.gross

      for (let vat of vats) {
        if (vat.gross === 0 || restAmount === 0) {
          continue
        }

        if (restAmount >= vat.gross) {
          result.push({
            invoiceId: inv.id,
            VATId: vat.id,
            gross: vat.gross
          })
          restAmount -= vat.gross
          vat.gross = 0
        } else {
          result.push({
            invoiceId: inv.id,
            VATId: vat.id,
            gross: restAmount
          })
          vat.gross -= restAmount
          restAmount = 0
        }
      }
    }
    console.log(result)
    return result
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

  //上传
  beforeUpload=(file)=> {
    console.log(643,file.type)
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('You can only upload PDF file!');
    }
    // const isLt2M = file.size / 1024 / 1024 < 10;
    // if (!isLt2M) {
    //   message.error('PDF must smaller than 10MB!');
    // }
    // return isPDF && isLt2M;
    return isPDF
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleSlideChange = ({ fileList }) =>{
    // if(fileList[0].status ==="done"){
    //   message.success(`${fileList[0].name}   upload success`)
    // }
    console.log(672,fileList)
    this.setState({ slideList:fileList })
  }

  handlePicModal=()=>{
    const {dispatch,params} = this.props
    const {vat_selected_org,uploadId,slideList,vat_selected,billToId,sentToId,clientPoDetailId } = this.state
    let _vat_selected = vat_selected.toJS()
    console.log(670,slideList)
    _vat_selected[uploadId].filePath = slideList[0].response.obj||""
    _vat_selected[uploadId].gross *=100
    _vat_selected[uploadId].net *=100
    _vat_selected[uploadId].tax *=100
    console.log(691,_vat_selected)
    //以防客户先上传再保存
    this.formRef.validateFields((error,value)=>{
      if(value){
        const {FPCategory,clientPoId,approverId} = value
        let values={
          ..._vat_selected[uploadId],
          taxRate:'1',
          FPType:'common',
          FPCategory:FPCategory,
          clientPoId:clientPoId,
          approverId:approverId,
          billToId:billToId,
          sentToId:sentToId,
          clientPoDetailId:clientPoDetailId,
        }
        dispatch(updateVAT(values.id,values)).then(e=>{
          if(e.error){
            message.error(e.error.message)
          }else{
            values.gross /=100
            values.net /=100
            values.tax /=100
            _vat_selected[uploadId] = values
            this.setState({
              uploadId:null,
              picModal:false,
              slideList:[],
              vat_selected:Immutable.fromJS(_vat_selected)
            })
          }
        })
      }
    })
  }
  deletePDF=(index)=>{
    const {dispatch,params} = this.props
    const {vat_selected_org,uploadId,slideList,vat_selected,billToId,sentToId,clientPoDetailId } = this.state
    let _vat_selected = vat_selected.toJS()
    _vat_selected[index].filePath = " "
    //以防客户先上传再保存
    this.formRef.validateFields((error,value)=>{
      if(value){
        const {FPCategory,clientPoId,approverId} = value
        let values={
          ..._vat_selected[index],
          taxRate:'1',
          FPType:'common',
          FPCategory:FPCategory,
          clientPoId:clientPoId,
          approverId:approverId,
          billToId:billToId,
          sentToId:sentToId,
          clientPoDetailId:clientPoDetailId,
        }
        dispatch(updateVAT(values.id,values)).then(e=>{
          if(e.error){
            message.error(e.error.message)
          }else{
            values.gross /=100
            values.net /=100
            values.tax /=100
            _vat_selected[uploadId] = values
            this.setState({
              uploadId:null,
              picModal:false,
              slideList:[],
              vat_selected:Immutable.fromJS(_vat_selected)
            })
          }
        })
      }
    })
  }

  render(){
    const {intl:{formatMessage},location:{pathname},count,invoice,FormItems,VatBalance,VatBalanceInfo,params,Invoices,Vats,billTo,client,clientPO} = this.props;
    const {
      isSave,
      loading,
      previewImage,
      currentPage,
      modal,
      modalLoad,
      itemId,
      modal_abandon,
      modal_payOff,
      modal_t,
      status,
      modalTLoad,
      slideList,
      clientPoId,
      clientId,
      BillToId,
      balanceTypeId,
      currencyId,
      approver,

      balance_collected,
      balance_toCollect,
      balance_credit,
      INVisable,
      INVselectList,
      CNY,
      // total_amount,
      // bankCharge_amount,
      VATselectList,
      vat_selected,
      vat_toSelect,
      vat_credit,
      net_total,
      tax_total,
      gross_total,
      VATisable,
      // VatBalanceInfo_copy,
      invoice_copy,
      VatInfo,
      VatInfo_credit,
      picModal,
      uploadId,
      //FormItems
      withInv
    } = this.state
    const { getFieldDecorator, getFieldValue } = this.props.form;
    console.log(948,withInv)
    //console.log(273,clientId,currencyId)
    //console.log('state',this.state,VatInfo,VatInfo&&VatInfo.toJS(),VatInfo_credit,VatInfo_credit&&VatInfo_credit.toJS())
    //console.log('props', this.props)
    //console.log('VatBalanceInfo', VatBalanceInfo, 2,VatInfo)
    //console.log(204,balance_collected,balance_toCollect,balance_credit,balance_credit.size,vat_selected,vat_selected.size)
    // if(params.id==="new"){
    //   if(FormItems.length>0){
    //     // this.formRef&&this.formRef.setFieldsValue(FormItems)
    //   }
    // }

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
      const {balance_collected,vat_selected,id} = this.state
      const {dispatch,params} =this.props
      //console.log(499,balance_collected.toJS(),vat_selected.toJS())
      this.formRef.validateFields((err,value)=>{
        if(err){
          //console.log(err)
        }else{
          //console.log(506,value)
          //分本位处理数据
          let _vat_selected = vat_selected.toJS()
          let _balance_collected = balance_collected.toJS()
          console.log(_vat_selected)
          _vat_selected.map(v=>{
            v.gross=v.gross*100
            v.net=v.net*100
            v.tax=v.tax*100
          })
          console.log(_vat_selected)

          let VATBalanceDetails = this.vatCollectBalance(_balance_collected,_vat_selected)
          //console.log(508,VATBalanceDetails)
          let values = {
            ...value,
            VATBalanceDetails,
            amount:this.state.CNY,
          }
          console.log(618,id,values)
          dispatch(updateVatBalance(id,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
            }else{
              message.success('配平更新成功')
              dispatch(pathJump('/invoice_management'))
            }
          })
        }
      })
    }


    const newCreate = () =>{
      const {balance_collected,vat_selected} = this.state
      const {dispatch} =this.props
      //console.log(499,balance_collected.toJS(),vat_selected.toJS())
      this.formRef.validateFields((err,value)=>{
        if(err){
          //console.log(err)
        }else{
          //console.log(506,value)
          //分本位处理数据
          let _vat_selected = vat_selected.toJS()
          let _balance_collected = balance_collected.toJS()
          _vat_selected.map(v=>{
            v.gross=v.gross*100
            v.net=v.net*100
            v.tax=v.tax*100
          })
          // console.log(1013,_balance_collected,_vat_selected)
          let VATBalanceDetails = this.vatCollectBalance(_balance_collected,_vat_selected)
          //console.log(508,VATBalanceDetails)
          let values = {
            ...value,
            VATBalanceDetails,
            amount:this.state.CNY,
          }
          console.log(958,values)
          dispatch(newVatBalance(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
            }else{
              message.success('配平成功')
              dispatch(pathJump('/VAT_list'))
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
      {dataIndex:VatBalanceITF.clientPoId,FormTag:
        <Select
          showSearch
          allowClear={true}
          onSelect={value=>{this.setState({clientPoId:value,isChange:true})}}
          placeholder={formatMessage({id:'pleaseSelect'})}
          disabled={(params.id!=="new"||withInv)?true:false}
          optionFilterProp="children"
           filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
        {renderOption(getSearchList(clientPO))}
        </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] },

      },
      {dataIndex:VatBalanceITF.FPCategory,FormTag:
        <Select
          showSearch
          allowClear={true}
          onSelect={value=>{this.setState({FPCategoryId:value,isChange:true})}}
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          disabled={(params.id!=="new"||withInv)?true:false}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
          {_FPC.map(v=><Option  key={v} value={v}>{formatMessage({id:v})}</Option>)}
        </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] },
      },
      { dataIndex: VatBalanceITF.clientId,FormTag:<Input disabled/>, props: { onChange: e => {const value= e.target.value; this.setState({ total_amount: parseFloat(value)||0 }) } } },
      {dataIndex:VatBalanceITF.approverId,FormTag:
        <Select
          showSearch
          allowClear={true}
          placeholder={formatMessage({ id: 'pleaseSelect' })}
          onSelect={value=>{this.setState({ApproverId:value,isChange:true})}}
          disabled={(params.id!=="new"||withInv)?true:false}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
           {renderOption(approver)}
        </Select>,
        option: { rules: [{ required: true, message: 'Please select' }] }
      },
      {dataIndex:VatBalanceITF.currencyId,FormTag:<Input disabled/>, props: { onChange: e => {const value= e.target.value; this.setState({ bankCharge_amount: parseFloat(value)||0 }) } }},
      {dataIndex:VatBalanceITF.description,formTag:<Input/>},

    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `VatBalanceITF_${item.dataIndex}` }),
        placeholder: formatMessage({ id: `VatBalanceITF_${item.dataIndex}` }),
      })
    );
    //废弃和冲抵的vat展示
    const abandonFormColumns = [
      {dataIndex:VatBalanceATF.id},
      {dataIndex:VatBalanceATF.description},
      {dataIndex:VatBalanceATF.actualInvoiceDate},
      {dataIndex:VatBalanceATF.dueDate},
      {dataIndex:VatBalanceATF.clientId,deep:['clientPoDetail','clientId']},
      {dataIndex:VatBalanceATF.billToId,deep:['clientPoDetail','billToId']},
      {dataIndex:VatBalanceATF.clientPoId},
      // {dataIndex:VatBalanceATF.currencyId,deep:['clientPoDetail','currencyId']},
      {dataIndex:VatBalanceATF.net},
      {dataIndex:VatBalanceATF.sentToId,deep:['clientPoDetail','sentToId']},
      {dataIndex:VatBalanceATF.tax},
      {dataIndex:VatBalanceATF.approverId},
      {dataIndex:VatBalanceATF.gross},
      {dataIndex:VatBalanceATF.placedToId,deep:['clientPoDetail','placedToId']},
      {dataIndex:VatBalanceATF.FPCategory},
    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `VatBalanceATF_${item.dataIndex}` }),
      })
    );
    //冲抵浮层表单
    const creditFormColumns = [
      {dataIndex:VatBalanceATF.id},
      {dataIndex:VatBalanceATF.description},
      {dataIndex:VatBalanceATF.actualInvoiceDate,
        FormTag:<DatePicker />
      },
      {dataIndex:VatBalanceATF.dueDate,
        FormTag:<DatePicker/>
      },
      {dataIndex:VatBalanceATF.clientId,FormTag:<Input disabled/>},
      {dataIndex:VatBalanceATF.billToId,FormTag:<Input disabled/>},
      {dataIndex:VatBalanceATF.clientPoId,FormTag:<Input disabled/>},
      // {dataIndex:VatBalanceATF.currencyId,FormTag:<Input disabled/>},
      {dataIndex:VatBalanceATF.net,FormTag:<Input disabled/>},
      {dataIndex:VatBalanceATF.sentToId,FormTag:<Input disabled/>},
      {dataIndex:VatBalanceATF.tax,FormTag:<Input disabled/>},
      {dataIndex:VatBalanceATF.approverId,FormTag:<Input disabled/>},
      {dataIndex:VatBalanceATF.gross,FormTag:<Input disabled/>},
    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `VatBalanceATF_${item.dataIndex}` }),
        placeholder: formatMessage({ id: `VatBalanceATF_${item.dataIndex}` }),
      })
    );

    //inv表格
    const INVenColumns = [
      { dataIndex: VatBalanceITF.index,
        width:'5%',
        //fixed:'left',
        render: (text,record, index) =>index+1
      },
      {
        dataIndex: VatBalanceITF.id,
        width:'18%',
        render: (text) => {
          if (text) {
            return text
          } else {
            return (<Select defaultValue={text} allowClear={true}  style={{ width: '100%' }} mode='combobox' onSelect={value => this.setState({INVselectOption:value})}>
              {renderOption(INVselectList)}
            </Select>)
          }
        }
      },
      {dataIndex:VatBalanceITF.clientPoIdDescription,width:"30%"},
      { title:TableTitle(formatMessage({ id: `VatBalanceITF_gross` }),formatMoney(CNY/100)),
        dataIndex:VatBalanceITF.gross,
        width:'15%',
        render:text=>formatMoney(text/100||''),
        className: 'column-money',
      },
      {dataIndex:VatBalanceITF.description,width:"30%"},
    ].map(
      item=>{
        if(!item.title){
          return({
            ...item,
            title: formatMessage({ id: `VatBalanceITF_${item.dataIndex}` }),
          })
        }else{
          return item
        }
      }
    );
    //vat表格
    const VATenColumns = [
      { dataIndex: VatBalanceVTF.index,
         render: (text,record, index) =>index+1,
         width:'5%',
        //  fixed:'left',
      },
      {
        dataIndex: VatBalanceVTF.id,
        width:'10%',
        render: (text,record, index) => {
          if (record.get('statusBB')) {
            return text
          } else {
            return (<Input placeholder={'填写vat名称'} defaultValue={text} onBlur={e=>this.editCell(index,'id',e.target.value)}/>)
          }
        }
      },
      {dataIndex:VatBalanceVTF.description,
        width:"20%",
        render: (text,record, index) => {
          if (record.get('statusBB')) {
            return text
          } else {
            return (<Input placeholder={'填写Description'} defaultValue={text} onBlur={e=>this.editCell(index,'description',e.target.value)}/>)
          }
        }
      },
      {dataIndex:VatBalanceVTF.actualInvoiceDate,
        width:"15%",
        render: (text,record, index) => {
          if (record.get('statusBB')) {
            if(typeof(text)=='object'){
              return moment(text).format('YYYY-MM-DD');
            }else{
              return '请选择开票日期'
            }
          } else {
            return (<DatePicker onChange={value=>{this.editCell(index,'actualInvoiceDate',value)}} defaultValue={text}/>)
          }
        }
      },

      { title:TableTitle(formatMessage({ id: `VatBalanceVTF_net` }),formatMoney(net_total)),
        dataIndex:VatBalanceVTF.net,
        width:'10%',
        render:text=>formatMoney(text||''),
        className: 'column-money',
      },
      { title:TableTitle(formatMessage({ id: `VatBalanceVTF_tax` }),formatMoney(tax_total)),
        dataIndex:VatBalanceVTF.tax,
        render:text=>formatMoney(text||''),
        width:'10%',
        className: 'column-money',
      },
      { title:TableTitle(formatMessage({ id: `VatBalanceVTF_gross` }),formatMoney(gross_total)),
        dataIndex:VatBalanceVTF.gross,
        width:'10%',
        className: 'column-money',
        render:(text,record,index)=>{
          if(record.get('statusBB')){
            return formatMoney(text||'')
          }else{
            return (<Input placeholder={'填写gross'} defaultValue={text} onBlur={e=>{
              let value =e.target.value;
              this.calculate(index,value);
            }}/>)
          }
        },
      },

      { title: formatMessage({ id: `VatBalanceVTF_operation` }),
        dataIndex:'filePath',
        colSpan:3,
        width:"5%",
        render:(text,record,index)=>{
          return (text!==""&&text!==" "&&text!==undefined&&text!==null)?<Popconfirm title="Are you sure to delete this PDF" okText={'OK'} cancelText={'Cancel'}  onConfirm={()=>this.deletePDF(index)} trigger="hover">
            <a onClick={()=>window.open(text)}>{formatMessage({ id: `check` })}</a>
        </Popconfirm>:<a onClick={()=>{
          console.log(1116,record,record.get('statusBB'))
          if(!record.get('statusBB')){
            message.error('请您先保存再上传PDF')
            return
          }
          this.setState({picModal:true,uploadId:index})
          }}>{formatMessage({ id: `upload` })}</a>
        },
      },
      {
        title:'',
        dataIndex:'statusBB',
        colSpan:0,
        width:"5%",
        render:(text,record,index)=>{
          return text?<a onClick={()=>this.rowEdit(index)}>{formatMessage({ id: `edit` })}</a>:<a onClick={()=>this.rowSave(index)}>{formatMessage({ id: `save_btn` })}</a>
        }
      },
      {
        title:'',
        dataIndex:'statusCC',
        colSpan:0,
        width:"7%",
        render:(text,record,index)=>{
          return text?<div>
                {moment().isSame(record.get('actualInvoiceDate'),'month')?<a onClick={()=>this.abandonRow(index,record.get('id'))}>{formatMessage({ id: `abandon` })}</a>:<a onClick={()=>this.payOffRow(record.get('id'))}>{formatMessage({ id: `payOff` })}</a>
                }
            </div>:<a onClick={()=>this.deleteRow(index)}>{formatMessage({ id: `cancel` })}</a>
        }
      },
    ].map(
      item=>{
        if(!item.hasOwnProperty('title')){
          return ({
            ...item,
            title: formatMessage({ id: `VatBalanceVTF_${item.dataIndex}` }),
          })
        }else{
          return item
        }
      }
    );
    //disable里main的inv
    const INVdisColumns = [
      { dataIndex: VatBalanceITF.index,
         render: (text,record, index) =>index+1},
      { dataIndex: VatBalanceITF.id,width:'300px' },
      { dataIndex: VatBalanceITF.clientPoId,},
      { dataIndex: VatBalanceITF.gross,
        render:(text)=>formatMoney(text),className:'column-money' },

      { dataIndex: VatBalanceITF.flowStatus, render: (text) => { return(formatMessage({ id: text })) } },
    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `VatBalanceITF_${item.dataIndex}` }),
      })
    );
    //disable里面的vat
    const VATdisColumns = [
      { dataIndex: VatBalanceVTF.index,
         render: (text,record, index) =>index+1},
      { dataIndex: VatBalanceVTF.id,},
      { dataIndex: VatBalanceVTF.clientPoId,},
      { dataIndex: VatBalanceVTF.gross,
        render:(text)=>formatMoney(text),className:'column-money' },

      { dataIndex: VatBalanceVTF.flowStatus, render: (text) => { return(formatMessage({ id: text })) } },
    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `VatBalanceVTF_${item.dataIndex}` }),
      })
    );

    const renderForm=(v,column)=>{
      if(v == undefined || v=='') return

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
      let bold = column.bold
      let text
      if(VatInfo){
        text=column.deep?VatInfo.getIn(column.deep):VatInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item'>
          <Col span={12}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`VatBalanceATF_${column.dataIndex}`})}</Col>
          <Col span={12}  className="payment-value" style={{textAlign:'right'}}>{
            renderForm(text,column)
          }</Col>
        </Col>
      )
    }



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

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    )

    return (

      <Row style={{paddingBottom:100}}>
        <Title title={formatMessage({id:`${_tit.vat_balance_details}`})} />
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
                columns={INVenColumns}
                dataSource={balance_collected}
                isable={INVisable}
                ref={t=>this.tabel = t}
                //scroll={{ x: 1200 }}
                rowKey={record =>record.id}
                />
            </Row>
            <Row style={{marginTop:'36px'}}>
              <AddVatTable
                rowSelection={true}
                pagination={false}
                columns={VATenColumns}
                dataSource={vat_selected}
                isable={false}
                upDown={true}
                ref={t=>this.tabele = t}
                //scroll={{ x: 1600 }}
                handleAdd={this.handleVatAdd}
                rowKey={record =>record.id}
                />
            </Row>

            <Row  style={{marginTop:40,textAlign:'center'}}>
              {params.id==='new'&&<Button  type='primary' size="large" style={{marginRight:10}} onClick={newCreate}>{itemId===null?formatMessage({id:'new_btn'}):formatMessage({id:'save_btn'})}</Button>}
              {params.id!=='new'&&<Button  type='primary' size="large" style={{marginRight:10}} onClick={saveChange}>{formatMessage({id:'save_change'})}</Button>}
              <Button onClick={()=>{const {dispatch} = this.props ;dispatch(pathJump('/invoice_management'))}}  size="large">{formatMessage({id:'cancel'})}</Button>
            </Row>
              {((params.id!=='new'&&balance_credit.size>0)||(params.id!=='new'&&vat_credit.size>0))&&<Row>
                <Card style={{ backgroundColor: '#ddd', marginTop: '16px' }} title='disable'>
                  {balance_credit.size>0&&<ImmutableTable
                    pagination={false}
                    columns={INVdisColumns}
                    dataSource={balance_credit}
                    rowKey={record =>record.get("id")}
                  />}
                  {vat_credit.size>0&&<ImmutableTable
                    style={{marginTop:'24px'}}
                    pagination={false}
                    columns={VATdisColumns}
                    dataSource={vat_credit}
                    rowKey={record =>record.get("id")}
                  />}
                </Card>
              </Row>}
            <Modal
              visible={modal_abandon}
              title={formatMessage({id:'abandonVat'})}
              maskClosable={false}
              width={700}
              onCancel={()=>this.setState({modal_abandon:false,itemId:null})}
              footer={
                <Row>
                  <Button type="danger" onClick={()=>this.handleModal_abandon(itemId)}>{formatMessage({id:'abandon'})}</Button>
                  <Button onClick={()=>this.setState({modal_abandon:false,itemId:null})} >{formatMessage({id:'cancel'})}</Button>
                </Row>
              }
            >
              <Spin  spinning={ modalTLoad } tip="creating..." >
                <Row className="payment-read">
                  {abandonFormColumns.map(columnMap)}
                </Row>
              </Spin>
            </Modal>

            <Modal
              visible={modal_payOff}
              title={formatMessage({id:'payOffVat'})}
              maskClosable={false}
              width={700}
              onCancel={()=>this.setState({modal_payOff:false,itemId:null})}
              footer={
                <Row>
                  <Button type="danger" onClick={()=>this.handleModal_payOff(itemId)}>{formatMessage({id:'payOff'})}</Button>
                  <Button onClick={()=>this.setState({modal_payOff:false,itemId:null})} >{formatMessage({id:'cancel'})}</Button>
                </Row>
              }
            >
              <Spin  spinning={ modalTLoad } tip="creating..." >
                {/* <Row>
                  <Col className="payment-read" sm={{span:12}}>
                      {abandonFormColumns.map(columnMap)}
                  </Col>
                  <Col sm={{span:12}}>
                    <SimpleForm
                        columns={creditFormColumns}
                        initial={VatInfo_credit}
                        colSpan={12} labelCol={{ span: 7 }}
                        hideRequiredMark={true}
                        ref={f=>{this.formCredit = f}} />
                  </Col>
                </Row> */}
                <p style={{margin:'20px 0',textAlign:'center',fontWeight:'bold',fontSize:'16px'}}>{formatMessage({id:'payOffFrom'})}</p>
                <Row className="payment-read" style={{margin:'0 25px'}}>
                  {abandonFormColumns.map(columnMap)}
                </Row>
                <Row style={{margin:'50px 0'}}>
                  <p style={{margin:'20px 0',textAlign:'center',fontWeight:'bold',fontSize:'16px'}}>{formatMessage({id:'payOffTo'})}</p>
                  <SimpleForm
                    columns={ creditFormColumns }
                    initial={VatInfo_credit}
                    colSpan={12}
                    labelCol={{span:7}}
                    ref={f=>this.formCredit=f} />
                </Row>
                <Row style={{textAlign:'center',marginBottom:20}}>
                  <Button size="large" style={{marginRight:10}} type="primary" onClick={this.handleModal} >{formatMessage({id:'createNsubmit'})}</Button>
                  <Button size="large"  onClick={()=>{this.setState({modal:false})}} >{formatMessage({id:'cancel'})}</Button>
                </Row>
              </Spin>
            </Modal>
            <Modal
              visible={picModal}
              onCancel={()=>this.setState({uploadId:null,picModal:false,slideList:[]})}
              title={formatMessage({id:'uploadVat'})}
              onOk={this.handlePicModal}
              maskClosable={false}
              width={500}
            >
              <Row style={{marginTop:50,marginBottom:50}}>
                <Upload
                  listType="picture-card"
                  action={`${host}/common/upload`}
                  beforeUpload={this.beforeUpload}
                  onPreview={this.handlePreview}
                  onChange={this.handleSlideChange}
                  fileList={slideList}
                  name='photo'
                >
                {slideList.length >= 1 ? null : uploadButton}
                </Upload>
              </Row>
            </Modal>
          </Spin>
      </Row>
    )
  }



}


VatBalanceDetails.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => {
  console.log(277,state&&state.toJS())
  // let _vat_credit = state.getIn([])
  return({
    invoice : state.getIn(['invoice','invoices']),
    VatBalance : state.getIn(['VatBalance','VatBalance']),
    // VatInfo : state.getIn(['vatList','vatsInfo']),
    count : state.getIn(['VatBalance','count']),
    VatBalanceInfo: state.getIn(['vat_balance_details','VatBalanceInfo']),
    Invoices:state.getIn(['vat_balance_details','invoices']),
    Vats:state.getIn(['vat_balance_details','vats']),
    FormItems:state.getIn(['vat_balance_details','formItems']),
    billTo : state.getIn(['billTo','billTo']),
    client : state.getIn(['client','client']),
    clientPO : state.getIn(['clientPO','clientPO']),
    // vat_credit:Immutable.fromJS(_vat_credit),
    // balance_credit:Immutable.fromJS(_balance_credit),
  });
}

export default Form.create()(injectIntl(connect(mapStateToProps)(VatBalanceDetails)))
