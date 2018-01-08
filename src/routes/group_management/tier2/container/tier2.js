/**
 * Created by Yurek on 2017/8/21.
 */
import React from 'react'
import { injectIntl } from 'react-intl'
import { TreeSelect  ,Tabs ,InputNumber ,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Icon,Tooltip,Table,Popconfirm  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { EditableCell } from '../../../../components/antd/EditableCell'
import { pathJump } from '../../../../utils/'
import moment from 'moment'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {titles as _tit ,tier2_tableField as _T2TF} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,formatDateToM,divHundred,cloneObj} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { delPro ,newPro , altPro,updateTier2,fetchTier4 ,altTier3 ,fetchTier2Info,newTier3,newTier4 ,delTier3,delTier4,altTier4,moveTier,updateEstimateCost} from '../modules/tier2'
import { fetchTier1Info } from '../../tier1/modules/tier1'
import {fetchClientPO} from '../../../clientPO/modules/client_po'
const Option = Select.Option;
const Search = Input.Search;
import '../../group/group_detail/container/group.scss'
const { MonthPicker, RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;


class Tier2 extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      itemId:null,
      modal:false,
      modalLoad:false,
      modalBp:false,
      modal_c:false,
      editIndex:-1,
      readOnly:false,  //true => tier2 form and column can't edit
      editable: false,
      dataSource_tier4:[],
      dataSource_tier3:[],
      cpoCount:0,
      tierCount:0,
      tier_load:false,
      tier2Amount:0,
      selectedTier3:[],
      tier4Count:0,
      moveTier_modal:false,
      tierAll:null,
      addTier3Table:false,
      addTier4Table:false,
      estiModal:false,
      estiValue : [],
      modalLoading:false,
      estiDate:[moment(),moment().add(1,'months')],
      startValue: null,
      endValue: null,
      endOpen: false,
      expandedRowKeys:[],
      expandedRowChildKeys:[],
      viewTier3:null,
      vierTier4:null,
      viewPro:null,
      tier2RestMoney:0,
      blockName:false,
      current:'tier3',
      fromTier3Changed:false,
      treeSelect_pro:[],
      fromTier4Changed:false,
      pro_cpoChanged:false,
      edit4:null,
      move_tier_type:null,
      tier3H:[],
      tier2All:[],
    }
  }

  fetchFun=()=>{
    const {dispatch,params,location} = this.props;
    this.setState({loading:true})

    dispatch(fetchTier2Info(params.id))
      .then(e=>{
      if(e.payload){
        let idArr = []
        let id2Arr = []
        e.payload.tier3s.map(v=>{
            idArr.push(v.id)
            v.tier4s&&v.tier4s.map(item=>{
              id2Arr.push(item.id)
            })
          })
        this.tier3.setFieldsValue({tier2Rest:formatMoney(e.payload.restAmount/100)})
        this.setState({
          expandedRowKeys:idArr,
          //expandedRowChildKeys:id2Arr
        })
        this.setState({
          treeSelect_pro:this.renderTreeSelect(e.payload.tier3s),
          tier2Amount:e.payload.amount/100,
          tier2RestMoney:e.payload.restAmount/100,
          groupId:e.payload.groupId,
          tier1Id:e.payload.tier1Id,
        })
        let _tier3 = []
        e.payload.tier3s.map((v,i)=>{
          let arr = []
          let _tier4 = []
          v.estimateCosts.map(t=>{
            t.cost = t.cost/100
            arr.push(t)
          });
          v.amount = v.amount/100;
          v.open = v.open/100;
          v.planned = v.planned/100;
          v.committed = v.committed/100;
          v.restAmount = v.restAmount/100;
          v.key = i
          v.estimateCosts = arr
          v.tier4s.map(t=>{
            t.amount = t.amount/100;
            t.open = (t.open || 0)/100;
            t.planned = (t.planned || 0)/100;
            t.committed = (t.committed || 0)/100;
            t.restAmount = t.restAmount/100
            _tier4.push(t)
          })
          v.tier4s = _tier4
          _tier3.push(v)
        })

        this.setState({
          loading:false,
          tier3Count:e.payload.tier3s.length,
          dataSource_tier3:_tier3
        })
        this.setState({tier3Field:{tier2Rest:formatMoney(e.payload.restAmount/100)}})
        dispatch(fetchClientPO({groupId:e.payload.groupId}))
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:false});
    this.fetchFun()
  }

  preOption=(data)=>{
    if(data){
      let arr = []
      data.map(v=>{
        if(!v.tier2Id&&v.currencyId===this.state.currency){
          arr.push(v.id)
        }
      })
      return arr
    }else{
      return []
    }
  }

  handleModal = (v) => {
    const {dispatch,params,intl:{formatMessage}} = this.props;
    const {move_tier_type,edit3,edit4} = this.state
    let json = {
      target:{
        id:move_tier_type==='tier3'?edit3.get('id'):edit4.get('id'),
        name:move_tier_type
      },
      to:{
        id:this.state.selectedMove,
        name:move_tier_type==='tier3'?'tier2':'tier3'
      }
    }
    dispatch(moveTier(json,params.id)).then(e=>{
      if(e.error){
        message.error(e.error.message)
        this.setState({modalLoad:false})
      }else{
        this.setState({modalLoad:false,moveTier_modal:false,tier2All:[],selectedMove:null})
        this.fetchFun()
        message.success(formatMessage({id:'move_ok'}))
      }
    })
  };

  handleEstiModal=()=>{
    const {dispatch,intl:{formatMessage},params} = this.props;
    let _value = this.state.estiValue.slice(0);
    let result = [];
    //_value.map(v=>{
    //  result.push(Object.values(v)[0])
    //})

    _value.map(v=>{
      let obj = {}
      obj.cost = v.cost*100
      obj.period = moment(v.period).format('YYYY-MM')
      obj.tier4Id = this.state.selectedTier4.id
      result.push(obj)
    })
    let json = {
      estimateCosts:result,
      tier4Id:this.state.selectedTier4.id
    }

    dispatch(updateEstimateCost(json,'put',params.id)).then(e=>{
      if(e.error){
        message.error(e.error.message)
        this.setState({modalLoading:false})
      }else{
        this.setState({modalLoading:false,estiModal:false})
        this.fetchFun()
        message.success(formatMessage({id:'saveSuccess'}))
      }
    })
  }


  updateAmount = () => {
    const {dataSource} = this.state;
    let amount = 0
    dataSource.map(v=>{
      amount = amount+v.amountNtax
    })
    this.form.setFieldsValue({amount})
  }


  cpoTax = (obj, type) => {
    let fee = obj[type]
    let taxRate = fee / (obj.amount - obj.tax)
    return (fee+obj.tax * taxRate)/100
  }


  onCellChange = (index, key) => {
    return (value) => {
      const dataSource_tier4 = [...this.state.dataSource_tier4];
      dataSource_tier4[index][key] = value;
      this.setState({ dataSource_tier4 });
    };
  };


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

  addMonth=(mo,i)=>{
    return mo.add(i,'months')
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

  onTierCellChange = (index, key) => {
    return (value) => {
      const dataSource_tier3 = [...this.state.dataSource_tier3];
      dataSource_tier3[index][key] = value;
      this.setState({ dataSource_tier3 });
    };
  }

  onTier4CellChange = (index, key) => {
    return (value) => {
      const dataSource_tier4 = [...this.state.dataSource_tier4];
      dataSource_tier4[index][key] = value;
      this.setState({ dataSource_tier4 });
    };
  }


  delTier=(record,data)=>{
    const {dispatch,intl:{formatMessage},params} = this.props;
    this.setState({tier_load:true})
    let action
    if(data ==='dataSource_tier4'){
      action = delTier4
    }else{
      action = delTier3
    }
    dispatch(action(record.id,params.id)).then(e=>{
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
    _data.splice(index, 1);
    let obj = {}
    obj[data] = _data
    if(record.hasOwnProperty('id')){
      this.setState(obj,this.delTier(record,data));
    }else{
      this.setState(obj);
    }
  };


  saveTier = (data) => {
    const {dispatch,params,intl:{formatMessage}} =this.props
    data = {
      ...data,
      tier2Id : params.id,
      amount : data.amount*100
    }
    this.setState({tier_load:true})
    if(data.id){
      dispatch(altTier3(data.id,data,params.id)).then(e=>{
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
      data = {
        ...data,
        groupId:this.state.groupId
      }
      dispatch(newTier3(data,params.id)).then(e=>{
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

  saveTier4 = (data) => {
    const {dispatch,params,intl:{formatMessage}} =this.props

    let _3id
    this.state.dataSource_tier3.map(v=>{
      if(v.name === data.tier3Id){
        _3id = v.id
      }
    }
    )
    data = {
      ...data,
      tier3Id : _3id,
      amount : data.amount*100
    }
    this.setState({tier_load:true})
    if(data.id){
      dispatch(altTier4(data.id,data,params.id)).then(e=>{
        if(e.error){
          message.error(e.error.message)
          this.setState({tier_load:false})
        }else{
          this.setState({tier_load:false})
          this.fetchTier4Fun(this.state.selectedTier3)
          message.success(formatMessage({id:'save_ok'}))
        }
      })
    }else{
      data = {
        ...data,
        groupId:this.state.groupId
      }
      dispatch(newTier4(data,params.id)).then(e=>{
        if(e.error){
          message.error(e.error.message)
          this.setState({tier_load:false})
        }else{
          this.setState({tier_load:false})
          this.fetchTier4Fun(this.state.selectedTier3)
          message.success(formatMessage({id:'save_ok'}))
        }
      })
    }
  };

  fetchTier4Fun = (arr)=> {
    const {dispatch} = this.props;
    let _arr = [];
    this.state.dataSource_tier3.map(v=>{
      arr.map(t=>{
        if(v.name === t){
          _arr.push(v.id)
        }
      })
    })

    let json = {
      tier3Id_in:_arr.join(','),
      'group.startDate_like':arr.length>0?moment().format('YYYY'):1890
    }
    dispatch(fetchTier4(json)).then(e=>{
      if(e.error){
        message.error(e.error.message)
      }else{
        let _tier4 = []
        e.payload.map((v,i)=>{
          v.amount = v.amount/100;
          v.open = v.open/100;
          v.planned = v.planned/100;
          v.committed = v.committed/100;
          v.key = i

          let _esti = [];
          v.estimateCosts.map(t=>{
            t.cost = t.cost/100;
            let obj = {}
            obj[t.period] = t
            _esti.push(obj)
          })
          v.estimateCosts = _esti
          _tier4.push(v)
        })
        this.setState({tier4Count:e.payload.length})
        this.setState({dataSource_tier4:_tier4})
      }
    })
  }

  select=(v)=>{
    let data = [...this.state.selectedTier3,v]
    this.setState({selectedTier3:data},this.fetchTier4Fun(data))
  }

  deselect=(v)=>{
    let data = this.state.selectedTier3;
    data.map((t,i)=>{
      if(v===t){
        data.splice(i, 1);
      }
    })

    this.setState({selectedTier3:data},this.fetchTier4Fun(data))
  }

  calAmount = (data,type) => {
    let result = 0
    data.map(v=>{
      result = result + Number(v[type])
    })
    return formatMoney(result)
  }



  calEstimate = (type,data,field) => {
    let result = 0
    let estiArr = [],compareArr=[],estiIndexArr = []

    data.map(v=>{
      v.estimateCosts.map(t=>{
        if(type === t.period){
          estiIndexArr.push(field==='tier4'?(t.cost/100):t.cost)
        }
      })
    })
    estiIndexArr.map(v=>{
      result=result+Number(v)
    })
    return formatMoney(result)
  }

  addTableItem = (table,data,field) => {
    const {intl:{formatMessage}} = this.props
    let arr = []
    if(!data) return table
    data.map((v,i,r)=>{
      v.estimateCosts.map((t,i,r)=>{
        let obj ={
          title:t.period,
          children:[{
            title: this.calEstimate(t.period,data,field),
            dataIndex:t.period,
            render:(text,record)=>{
              let _r = record.toJS()
              let re = 0
              if(_r['estimateCosts'].length>0) {
                _r['estimateCosts'].map(a=> {
                  if (a.period === t.period) {
                    re = a.cost
                  }
                })
                return formatMoney(field==='tier4'?(re/100):re)
              }else{
                  return (<i>{formatMessage({id:'notSet'})}</i>)
              }
            },className: 'column-money',width:150}
          ]}
        arr.push(obj)
      })
    })

    let result = [], hash = {},_result = [];
    for (let i = 0; i<arr.length; i++) {
      let elem = arr[i].title;
      if (!hash[elem]) {
          result.push(arr[i])
      }
      hash[elem] = true;
    }

    let addArr=[]
    if(field==='tier3'){
      if(this.state.tier3H.length !== 0){
        this.setState({tier3H:result})
      }
    }else if(field==='tier4'){
      for(let i = 0; i < this.state.tier3H.length; i++){
        let obj = this.state.tier3H[i];
        let num = obj.title;
        let isExist = false;
        for(let j = 0; j < result.length; j++){
          let aj = result[j];
          let n = aj.title;
          if(n == num){
            isExist = true;
            break;
          }
        }
        if(!isExist){
          _result.push(obj);
        }
      }
    }
    result = [...result,..._result];
    result.sort((a,b)=>{
      return moment(a.title) - moment(b.title)
    })
    arr = [...table,...result]
    return arr
  }

  changeEsti=(date,index,value)=>{
    const estiValue = [...this.state.estiValue];
    estiValue[index]['cost'] = value;
    estiValue[index][Object.keys(estiValue[index])[0]]['cost'] = value;
    estiValue[index][Object.keys(estiValue[index])[0]]['tier4Id'] = this.state.selectedTier4.id;
    this.setState({estiValue})
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

  scrollFun=()=>{
    const {tier3H,addTier4Table} = this.state
    if(addTier4Table){
      if(tier3H.length===0){
        return {x:0,y:0}
      }else{
        return { x:1300+(tier3H.length*150),y: 500 }
      }
    }else{
      return {x:0,y:0}
    }

  }


  moveTierFun=(field)=>{
    const {dispatch,params,intl:{formatMessage}} =this.props
    if(field === 'tier3'){
      if(!this.state.edit3) return message.error(formatMessage({id:'selectTier3'}))
      dispatch(fetchTier1Info(this.state.tier1Id)).then(e=>{
        if(e.payload){
          this.setState({tier2All:e.payload.tier2s,move_tier_type:field})
          this.setState({moveTier_modal:true})
        }else{
          message.error(e.error.message)
        }
      })
    }else{
      if(!this.state.edit4) return message.error(formatMessage({id:'selectTier4'}))
      this.setState({moveTier_modal:true,move_tier_type:field})
    }
  }

  reduce = (v) => {
    return formatMoney(divHundred(v))
  }

  addTable=()=>{
    this.setState({addTier3Table:true})
  }

  closeTable = ()=> {
    this.setState({addTier3Table:false})
  }

  expandRow=(record)=>{
    this.forceUpdate()
  }

  expandRowChild=(record)=>{
    this.forceUpdate()
  }


  // allExpand=()=>{
  //   const {tier2Info} = this.props
  //   let idArr = []
  //   if(tier2Info){
  //     tier2Info.get('tier3s').forEach(v=>{
  //       idArr.push(v.get('id'))
  //     })
  //   }

  //   return idArr
  // }

  resetForm=(field)=>{
    this[field].resetFields()
    if(field==='tier3'){
      this.setState({tier3Field:{tier2Rest:formatMoney(this.state.tier2RestMoney)},blockName_tier3:false},()=>this.tier3.setFieldsValue({tier2Rest:formatMoney(this.state.tier2RestMoney)}))
    }else if(field==='tier4'){
      this.setState({tier4Field:{tier3Rest:formatMoney((this.state.edit4.get('supRestAmount'))/100)},blockName_tier4:false,diff:null,estiValue:[],selectEsti:0,edit4:null})
    }else{
      this.setState({proField:{tier4Rest:formatMoney((this.state.editPro.get('supRestAmount'))/100)},blockName_pro:false,editPro:null})
    }
  }

  // openAll=()=>{
  //   const {group} = this.props;
  //   if(this.state.open_all){
  //     this.setState({expandedRowKeys:[],open_all:false})
  //   }else{
  //     if(group){
  //       let _group = [];
  //       group.forEach(v=>{
  //         _group.push(v.get('id'))
  //       })
  //       this.setState({expandedRowKeys:_group,open_all:true})
  //     }
  //   }
  // }

  changeWidth=(v,width)=>{
    let result = []
     v.map(t=>{
      if(t.dataIndex === _T2TF.name){
        t.children[0].width = width
        result.push(t)
      }else{
        result.push(t)
      }
    })
    return result
  }

  handleForm=(form)=>{
    const {dispatch,params,intl:{formatMessage},tier2Info} = this.props;
    this[form].validateFields((err, values) => {
      if (!err) {
        //console.log('receive form value',values)
        if(form ==='tier2'){
          this.setState({loading:true})
          values={
            ...values,
            amount:values.amount*100,
            groupId:tier2Info.get('groupId'),
            tier1Id:tier2Info.get('tier1Id'),
            budgetAllocated:tier2Info.get('budgetAllocated'),
          }
          dispatch(updateTier2(params.id,values)).then(e=>{
            if(e.error){
              this.setState({loading:false})
              message.error(e.error.message)
            }else{
              this.fetchFun()
              this.setState({loading:false})
              message.success(formatMessage({id:'save_ok'}))
            }
          })

        }
      }
    });
  };

  findTier3Name=(tier3Id)=>{
    const {dataSource_tier3} = this.state;
    return dataSource_tier3.map(v=>{
      v.tier4s.map(t=>{
        if(t.tier3Id===tier3Id){
          return v.name
        }
      })
    })
  }


  editForm=(record)=>{
    if(!record) return
    scrollTo(0,300)
    if(record.has('tier2Id')){
      let obj = {
        name:record.get('name'),
        description:record.get('description'),
        amount:formatMoney(record.get('amount')),
        tier2Rest:formatMoney(this.state.tier2RestMoney)
      }

      this.tier3.setFieldsValue(obj)
      this.setState({edit3:record,blockName_tier3:true,tier3Field:obj,current:'tier3'})
    }else if(record.has('tier3Id')){
      let obj = {
        tier3Name:record.get('tier3Id'),
        name:record.get('name'),
        description:record.get('description'),
        amount:formatMoney(record.get('amount')),
        tier3Rest:formatMoney(record.get('supRestAmount')/100),
      }
      this.setState({edit4:record,blockName_tier4:true,tier4Field:obj,current:'tier4'},()=>this.tier4.setFieldsValue(obj))
      let _record = record.toJS()
      if(_record.estimateCosts.length>0){
        let _esti = []
        _record.estimateCosts.map(t=>{
          let obj = {},sub={}
          sub.cost = t.cost/100;
          obj[t.period] = sub
          obj.cost = t.cost/100;
          obj.period = t.period
          _esti.push(obj)
        })
        this.setState({
          selectEsti: _record.amount,
          selectedTier4: _record,
          diff: _record.estimateCosts.length - 1,
          estiValue: _esti,
          startTime: moment(_record.estimateCosts[0].period),
          endTime: moment(_record.estimateCosts[_record.estimateCosts.length - 1].period)
        })
      }else{
        this.setState({selectEsti:_record.amount,selectedTier4:_record,diff:null,startTime:null,endTime:null})
      }
    }else{
      let obj = {
        tier4Name:record.get('tier4Id'),
        name:record.get('name'),
        tier4Rest:formatMoney(record.get('supRestAmount')/100),
        cpo:record.getIn(['clientPo','id']),
        amount:formatMoney(record.get('amount')/100),
        description:record.get('description')
      }
      this.setState({editPro:record,blockName_pro:true,proField:obj,current:'project'},()=>this.pro.setFieldsValue(obj)
      )
    }
  }


  deepCopy=(p, c)=> {
  var c = c || {};
  for (var i in p) {
    if (typeof p[i] === 'object') {
      c[i] = (p[i].constructor === Array) ? [] : {};
      this.deepCopy(p[i], c[i]);
    } else {
      c[i] = p[i];
    }
  }
  return c;
}

  c=(v,_data)=>{
    let obj = this.deepCopy(v)
    obj['children'][0]['title'] = this.calAmount(_data,obj.dataIndex)
    return obj
  }

  changeAmount=(column,data)=>{
    const _column = column.slice(0)
    let _data = data.toJS().slice(0)
    let arr = []
    _column.map(v=>{
      if(v.dataIndex !==_T2TF.name && v.dataIndex !==_T2TF.description){
        arr.push(this.c(v,_data))

      }else{
        arr.push(v)
      }
    })

    return arr
  }

  saveT=(field)=>{
    const { dispatch,params,intl:{formatMessage} } = this.props;
    if(field==='tier3'){
        this.tier3.validateFields((err, values) =>{
          if (!err) {
            values={
              ...values,
              groupId:this.state.groupId,
              tier2Id:params.id,
              amount:parseFloat(values.amount)*100,
              budgetAllocated: 0,
            }
            if(this.state.tier3Field&&Object.keys(this.state.tier3Field).length>1){
              dispatch(altTier3(this.state.edit3.get('id'),values,params.id)).then(e=>{
                if(e.payload){
                  this.fetchFun()
                  message.success(formatMessage({id:'saveSuccess'}))
                }else{
                  message.error(e.error.message)
                }
              })
            }else{
              dispatch(newTier3(values,params.id)).then(e=>{
                if(e.payload){
                  this.fetchFun()
                  message.success(formatMessage({id:'saveSuccess'}))
                }else{
                  message.error(e.error.message)
                }
              })
            }
          }

        })
    }else if(field === 'tier4'){
      this.tier4.validateFields((err, values) =>{
        if (!err) {
          values={
            ...values,
            groupId:this.state.groupId,
            tier3Id:this.state.fromTier3Changed?this.state.fromTier3:this.state.edit4.get('tier3Id'),
            amount:parseFloat(values.amount)*100,
            budgetAllocated: 0,
          }
          if(this.state.tier4Field&&Object.keys(this.state.tier4Field).length>1){
            dispatch(altTier4(this.state.edit4.get('id'),values,params.id)).then(e=>{
              if(e.payload){
                this.fetchFun()
                message.success(formatMessage({id:'saveSuccess'}))
              }else{
                message.error(e.error.message)
              }
            })
          }else{
            dispatch(newTier4(values,params.id)).then(e=>{
              if(e.payload){
                this.fetchFun()
                message.success(formatMessage({id:'saveSuccess'}))
              }else{
                message.error(e.error.message)
              }
            })
          }
        }
      })
    }else{
      this.pro.validateFields((err, values) =>{
        if (!err) {
          values={
            ...values,
            groupId:this.state.groupId,
            tier4Id:this.state.fromTier4Changed?this.state.fromTier4:this.state.editPro.get('tier4Id'),
            amount:parseFloat(values.amount)*100,
            clientPoId:this.state.pro_cpoChanged?this.state.pro_cpo:this.state.editPro.get('clientPoId'),
          }
          if(this.state.proField&&Object.keys(this.state.proField).length>1){
            dispatch(altPro(this.state.editPro.get('id'),values,params.id)).then(e=>{
              if(e.payload){
                this.fetchFun()
                message.success(formatMessage({id:'saveSuccess'}))
              }else{
                message.error(e.error.message)
              }
            })
          }else{
            dispatch(newPro(values,params.id)).then(e=>{
              if(e.payload){
                this.fetchFun()
                message.success(formatMessage({id:'saveSuccess'}))
              }else{
                message.error(e.error.message)
              }
            })
          }
        }
      })
    }
  }


  renderTreeSelect=(data)=>{
    let treeArr= []
    data.map(v=>{
      let obj = {},cArr = []
      obj.label = v.name
      obj.value = v.id
      obj.key = v.id
      obj.disabled = true
      v.tier4s.map(t=>{
        let obj = {}
        obj.label = t.name
        obj.value = t.id
        obj.key = t.id
        cArr.push(obj)
      })
      obj.children = v.tier4s.length>0?cArr:undefined
      treeArr.push(obj)
    })
    return treeArr
  }

  changeProFrom = (e)=>{
    let _rest
    this.state.dataSource_tier3.map(v=>{
      v.tier4s.map(t=>{
        if(t.id === e){
          _rest = t.restAmount
        }
      })
    })
    this.setState({fromTier4:e,fromTier4Changed:true})
    this.pro.setFieldsValue({tier4Name:e,tier4Rest:formatMoney(_rest)})
  }

  changeTier4From = (e) =>{
    let _rest
    this.state.dataSource_tier3.map(v=>{
        if(v.id === e){
          _rest = v.restAmount
        }
    })

    this.setState({fromTier3:e,fromTier3Changed:true})
    this.tier4.setFieldsValue({tier3Name:e,tier3Rest:formatMoney(_rest)})
  }

  delForm =(field) => {
    const {dispatch,params,intl:{formatMessage}} = this.props
    if(field === 'tier3'){
      if(!this.state.edit3) return message.error(formatMessage({id:'selectTier3'}))
      dispatch(delTier3(this.state.edit3.get('id'),params.id)).then(e=>{
        if(e.payload){
          this.fetchFun()
          message.success(formatMessage({id:'delSuccess'}))
        }else{
          message.error(e.error.message)
        }
      })
    }else if(field === 'tier4'){
      if(!this.state.edit4) return message.error(formatMessage({id:'selectTier4'}))
      dispatch(delTier4(this.state.edit4.get('id'),params.id)).then(e=>{
        if(e.payload){
          this.fetchFun()
          message.success(formatMessage({id:'delSuccess'}))
        }else{
          message.error(e.error.message)
        }
      })
    }else{
      if(!this.state.editPro) return message.error(formatMessage({id:'selectPro'}))
      dispatch(delPro(this.state.editPro.get('id'),params.id)).then(e=>{
        if(e.payload){
          this.fetchFun()
          message.success(formatMessage({id:'delSuccess'}))
        }else{
          message.error(e.error.message)
        }
      })
    }
  }


  render(){
    const {intl:{formatMessage},params,location:{pathname,query},tier2Info,client,clientPO,tier4} = this.props;
    const { tier3H,move_tier_type,current,expandedRowKeys,expandedRowChildKeys,startTime,endTime,endOpen,modalLoading,selectedTier4,estiDate,selectEsti,estiModal,addTier4Table,addTier3Table,tier2All,modalLoad,moveTier_modal,selectedTier3,itemId ,loading,readOnly,editIndex ,dataSource_tier4,dataSource_tier3,tier_load,tier2RestMoney } = this.state
    //console.log('state',this.state)
    const formColumns = [
      {dataIndex:_T2TF.name,props:{disabled:true}},
      {dataIndex:_T2TF.amount,transform:this.reduce},
      {dataIndex:_T2TF.approverId},
      {dataIndex:_T2TF.description},
      {dataIndex:_T2TF.groupId,props:{disabled:true},deep:['group','name']},
      // {dataIndex:_T2TF.currencyId,props:{disabled:true}},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`tier2_${item.dataIndex}`}),
      })
    );

    const proColumns = [
      {dataIndex:_T2TF.name,
        title:'Project',
          width:91,
          render:(text,record) =><a onClick={this.editForm.bind(this,record)} >{record.get(_T2TF.name)}</a>
      },
      {dataIndex:_T2TF.amount,
        render:(text,record) => formatMoney(record.get(_T2TF.amount)/100),
        className: 'column-money th-right',
        width:175
      },
      {dataIndex:_T2TF.flowStatus,
        render:(text,record) => record.get(_T2TF.flowStatus),
        className: 'column-center',
        width:150
      },
      {dataIndex:'cpo-desc',
        render:(text,record) => record.getIn(['clientPo','clientPo_description',0]),
        className: 'th-center',
        width:150
      },
      {dataIndex:'PE-code',
        render:(text,record) => record.get('PECode'),
        className: 'column-center',
        width:150
      },
      {dataIndex:_T2TF.description,
        render:(text,record) => record.get(_T2TF.description),
        className: 'th-center',
      },
    ].map(
      item=>({
        ...item,
        title:item.title?item.title:formatMessage({id:`tier1_${item.dataIndex}`}),
      })
    );

    const tier4_Columns = [
      //{dataIndex:_T2TF.operation,
      //  children:[{
      //    title: 'Total',
      //    dataIndex:_T2TF.operation,
      //    render: (text, record, index) => {
      //      return (
      //        <Row style={{display:'flex',justifyContent:'space-between'}}>
      //          <a onClick={this.saveTier.bind(this,record)} >{formatMessage({id:'save_btn'})}</a>
      //          <span>|</span>
      //          <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(index,'dataSource_tier3',false,record)}>
      //            <a href="#">{formatMessage({id:'deleteItem'})}</a>
      //          </Popconfirm>
      //          <span>|</span>
      //          <a onClick={this.moveTierFun.bind(this,record,'tier3')} >{formatMessage({id:'trans'})}</a>
      //        </Row>
      //      );
      //    },width:150,className:'column-center'}]
      //},
      {dataIndex:_T2TF.name,
        title:'Tier 4',
        children:[{
          title: 'Total',
          dataIndex:_T2TF.name,
          width:100,
          render:(text,record) =><a onClick={this.editForm.bind(this,record)} >{record.get(_T2TF.name)}</a>
        }]
      },
      {dataIndex:_T2TF.amount,children:[{
        title: this.calAmount(dataSource_tier3,_T2TF.amount),
        dataIndex:_T2TF.amount,render:(text,record) => formatMoney(record.get(_T2TF.amount)),
        className: 'column-money th-right',
        width:175}]
      },
      {dataIndex:_T2TF.open,
        children:[{
          title: this.calAmount(dataSource_tier3,_T2TF.open),
          dataIndex:_T2TF.open,render:(text,record) => formatMoney(record.get(_T2TF.open)),
          className: 'column-money',
          width:150}],
      },
      {dataIndex:_T2TF.planned,
        children:[{
          title: this.calAmount(dataSource_tier3,_T2TF.planned),
          dataIndex:_T2TF.planned,render:(text,record)=>formatMoney(record.get(_T2TF.planned)),
          className: 'column-money',
          width:150}],
      },
      {dataIndex:_T2TF.committed,
        children:[{
          title: this.calAmount(dataSource_tier3,_T2TF.committed),
          dataIndex: _T2TF.committed,render:(text,record)=>formatMoney(record.get(_T2TF.committed)),
          className: 'column-money',width:150
        }]},
      {dataIndex:_T2TF.description,
        children:[{
          title: '',
          dataIndex:_T2TF.description,render:(text,record)=>record.get(_T2TF.description),
        }]
      }
    ].map(
      item=>({
        ...item,
        title:item.title?item.title:formatMessage({id:`tier1_${item.dataIndex}`}),
      })
    );

    const tierColumns = [
      //{dataIndex:_T2TF.operation,
      //  children:[{
      //    title: 'Total',
      //    dataIndex:_T2TF.operation,
      //    render: (text, record, index) => {
      //      return (
      //        <Row style={{display:'flex',justifyContent:'space-between'}}>
      //          <a onClick={this.saveTier.bind(this,record)} >{formatMessage({id:'save_btn'})}</a>
      //          <span>|</span>
      //          <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(index,'dataSource_tier3',false,record)}>
      //            <a href="#">{formatMessage({id:'deleteItem'})}</a>
      //          </Popconfirm>
      //          <span>|</span>
      //          <a onClick={this.moveTierFun.bind(this,record,'tier3')} >{formatMessage({id:'trans'})}</a>
      //        </Row>
      //      );
      //    },width:150,className:'column-center'}]
      //},
      {dataIndex:_T2TF.name,
        title:'Tier 3',
        children:[{
          title: 'Total',
          dataIndex:_T2TF.name,
          width:150,
          render:(text,record) =><a onClick={this.editForm.bind(this,record)} >{record.get(_T2TF.name)}</a>
        }]
      },
      {dataIndex:_T2TF.amount,children:[{
        title: this.calAmount(dataSource_tier3,_T2TF.amount),
        dataIndex:_T2TF.amount,render:(text,record) => formatMoney(record.get(_T2TF.amount)),
        className: 'column-money th-right',
        width:175}]
        },
      {dataIndex:_T2TF.open,
        children:[{
          title: this.calAmount(dataSource_tier3,_T2TF.open),
          dataIndex:_T2TF.open,render:(text,record) => formatMoney(record.get(_T2TF.open)),
          className: 'column-money',
          width:150}],
        },
      {dataIndex:_T2TF.planned,
        children:[{
          title: this.calAmount(dataSource_tier3,_T2TF.planned),
          dataIndex:_T2TF.planned,render:(text,record)=>formatMoney(record.get(_T2TF.planned)),
          className: 'column-money',
          width:150}],
        },

      {dataIndex:_T2TF.committed,
        children:[{
          title: this.calAmount(dataSource_tier3,_T2TF.committed),
          dataIndex: _T2TF.committed,render:(text,record)=>formatMoney(record.get(_T2TF.committed)),
          className: 'column-money',width:150
          }]},
      {dataIndex:_T2TF.description,
        children:[{
          title: '',
          dataIndex:_T2TF.description,render: (text, record) => (
            <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{record.get(_T2TF.description)}</p>}>{record.get(_T2TF.description)&&record.get(_T2TF.description).length>10?<span>{record.get(_T2TF.description).substring(0,10)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{record.get(_T2TF.description)}</span>}</Tooltip></div>
      </span>)
        }]

      }
    ].map(
      item=>({
        ...item,
        title:item.title?item.title:formatMessage({id:`tier1_${item.dataIndex}`}),
      })
    );

    const tier4Columns = [
      {dataIndex:_T2TF.operation,
        children:[{
          title: 'Total',
          dataIndex:_T2TF.operation,
          render: (text, record, index) => {
            return (
              <Row style={{display:'flex',justifyContent:'space-between'}}>
                <a onClick={this.saveTier4.bind(this,record)} >{formatMessage({id:'save_btn'})}</a>
                <span>|</span>
                <Popconfirm title="Are you sure to delete this line" okText={'OK'} cancelText={'Cancel'}  onConfirm={() => this.onDelete(index,'dataSource_tier4',false,record)}>
                  <a href="#">{formatMessage({id:'deleteItem'})}</a>
                </Popconfirm>
                <span>|</span>
                <a onClick={this.moveTierFun.bind(this,record,'tier4')} >{formatMessage({id:'trans'})}</a>
              </Row>
            );
          },width:91,className:'column-center'}]
      },

      {dataIndex:_T2TF.tier3Id,
        children:[{
          title: '',
          dataIndex:_T2TF.tier3Id,
          render: (text, record, index) => (

            <EditableCell
              value={record.tier3.name}
              onChange={this.onCellChange(index, 'tier3Id')}
              option={selectedTier3}
              tag="select"
            />
          ),width:150
        }]
      },

      {dataIndex:_T2TF.name,
        children:[{
          title: '',
          dataIndex:_T2TF.name,
          render: (text, record, index) => (
            <EditableCell
              value={text}
              onChange={this.onTier4CellChange(index, 'name')}
              tag="input"
              renderHighLight={(v)=><a onClick={()=>{
                const{dispatch} = this.props
                dispatch(pathJump('/tier_4/tier4_detail/'+v))
                }
              }>{v}</a>}
            />
          ),width:150
        }]

      },
      {dataIndex:_T2TF.amount,children:[{
        title: this.calAmount(dataSource_tier4,_T2TF.amount),
        dataIndex:_T2TF.amount,
        render: (text, record, index) => (
          <EditableCell
            value={formatMoney(record.amount)}
            onChange={this.onTier4CellChange(index, 'amount')}
            tag="input"
            renderHighLight={(v)=><a onClick={()=>{
                if(record.estimateCosts.length>0){
                  this.setState({
                    estiModal:true,
                    selectEsti:text,
                    selectedTier4:record,
                    diff:record.estimateCosts.length-1,
                    estiValue:record.estimateCosts,
                    startTime:moment(record.estimateCosts[0].period, "MM-DD-YYYY"),
                    endTime:moment(record.estimateCosts[record.estimateCosts.length-1].period, "MM-DD-YYYY")
                  })
                }else{
                  this.setState({estiModal:true,selectEsti:text,selectedTier4:record})
                }
              }
            }>{v}</a>}
          />
        ),className: 'column-money th-right'}]},
      {dataIndex:_T2TF.open,
        children:[{
          title: this.calAmount(dataSource_tier4,_T2TF.open),
          dataIndex:_T2TF.open,render:text=>formatMoney(text),
          className: 'column-money',}]},
      {dataIndex:_T2TF.planned,
        children:[{
          title: this.calAmount(dataSource_tier4,_T2TF.planned),
          dataIndex:_T2TF.planned,render:text=>formatMoney(text),
          className: 'column-money',}]},
      {dataIndex:_T2TF.committed,
        children:[{
          title: this.calAmount(dataSource_tier4,_T2TF.committed),
          dataIndex: _T2TF.committed,render:text=>formatMoney(text),
          className: 'column-money'}]},
      {dataIndex:_T2TF.description,
        children:[{
          title: '',
          dataIndex:_T2TF.description,
          render: (text, record, index) => (
            <EditableCell
              value={text}
              onChange={this.onTier4CellChange(index, 'description')}
              tag="input"
            />
          ),width:300
        }]
      }
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`tier4_${item.dataIndex}`}),
      })
    );

    const formColumns_tier3 = [
      {dataIndex:_T2TF.name,props:this.state.blockName_tier3?{disabled:true}:{}},
      {dataIndex:_T2TF.tier2Rest,props:{disabled:true}},
      {dataIndex:_T2TF.description},
      {dataIndex:_T2TF.amount},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`tier2_${item.dataIndex}`}),
      })
    );

    const formColumns_tier4 = [
      {dataIndex:_T2TF.tier3Name,FormTag:
      <Select onChange={this.changeTier4From} allowClear={true}  >
        {this.state.dataSource_tier3&&this.state.dataSource_tier3.map(v=><Option key={v.id} value={v.id} >{v.name}</Option>)}
      </Select>},
      {dataIndex:_T2TF.name,props:this.state.blockName_tier4?{disabled:true}:{}},
      {dataIndex:_T2TF.tier3Rest,props:{disabled:true}},
      {dataIndex:_T2TF.description},
      {dataIndex:_T2TF.amount},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`tier2_${item.dataIndex}`}),
      })
    );

    const formColumns_tier4_esti = [
      ...formColumns_tier4,
      {dataIndex:_T2TF.esti,FormTag:<Icon className='esti-icon'  onClick={()=>this.setState({estiModal:true})} type="setting" />},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`tier2_${item.dataIndex}`}),
      })
    );

    const formColumns_pro = [
      {dataIndex:_T2TF.tier4Name,FormTag:
        <TreeSelect
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treeData={this.state.treeSelect_pro}
          placeholder="Please select"
          treeDefaultExpandAll
          onChange={this.changeProFrom}
        />},
      {dataIndex:_T2TF.name,props:this.state.blockName_pro?{disabled:true}:{}},
      {dataIndex:_T2TF.tier4Rest,props:{disabled:true}},
      {dataIndex:_T2TF.cpo,FormTag:
        <Select  allowClear={true} onChange={(e)=>this.setState({pro_cpo:e,pro_cpoChanged:true})}>
          {clientPO&&clientPO.toJS().map(v=><Option key={v.id} value={v.id} >{v.description}</Option>)}
        </Select>},
      {dataIndex:_T2TF.amount},
      {dataIndex:_T2TF.description},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`tier2_${item.dataIndex}`}),
      })
    );




    const moveSelect = move_tier_type==='tier3'?tier2All:dataSource_tier3
    const expandedRowRender4 = (record) => {
      const _data = record.get('projects')
      console.log(_data&&_data.toJS())
      return (
        <Row>
          <ImmutableTable
            columns={proColumns}
            dataSource={_data}
            pagination={false}
            rowKey={record =>record.get('id')}
            bordered={false}
            locale={{emptyText:formatMessage({id:'noProFormData'})}}
          />
        </Row>
      );
    };

    const tabs = (tab,field) => {
      return(
        <Row>
          <Row style={{height:'188px'}}>
            <SimpleForm  columns={ tab }  colSpan={12} labelCol={{span:7}} ref={f=>this[field]=f} />
          </Row>
          <Row className="btn-common">
            <Button onClick={this.saveT.bind(this,field)} type="primary">{formatMessage({id:'save_btn'})}</Button>
            <Button onClick={this.delForm.bind(this,field)} type="danger">{formatMessage({id:'delete_btn'})}</Button>
            <Button onClick={this.resetForm.bind(this,field)} >{formatMessage({id:'reset_btn'})}</Button>
            {field!=='pro'&&<Button onClick={this.moveTierFun.bind(this,field)}>{formatMessage({id:'trans_btn'})}</Button>}
          </Row>
        </Row>
      )
    };

    const expandedRowRender = (record) => {
      let estiArr = [] ,arr = []
      const _data = record.get('tier4s')
      const _column = this.changeAmount(tier4_Columns,_data)
        return (
          <Row>
            <ImmutableTable
              columns={addTier4Table?this.addTableItem(_column,_data.toJS(),'tier4'):_column}
              dataSource={_data}
              expandedRowRender={(record)=>expandedRowRender4(record)}
              pagination={false}
              bordered={false}
              defaultExpandAllRows
              rowKey={record => record.get('id')}
              expandRowByClick
              // expandedRowKeys={expandedRowChildKeys}
              // onExpand={(expanded,record)=>this.expandRowChild(record)}
              locale={{emptyText:formatMessage({id:'noTier4FormData'})}}
            />
          </Row>
        );
    };
    return (
      <Row>
        <Title  title={formatMessage({id:`${_tit.tier2}`})} />
        <Spin   spinning={ loading } tip="Processing...">
          <Row style={{marginBottom:20,marginTop:61}}>
            <Row style={{marginTop:30}}>
              <SimpleForm columns={ formColumns } initial={tier2Info} colSpan={12} labelCol={{span:7}} ref={f=>this.tier2=f} />
            </Row>
            <Row className="btn-common">
              <Button type="primary" onClick={this.handleForm.bind(this,'tier2')} >{formatMessage({id:'save_btn'})}</Button>
              <Button onClick={()=>history.back() }>{formatMessage({id:'back'})}</Button>
            </Row>
          </Row>
        </Spin>
        {/*<Row style={{margin:'20px 0',display:'flex'}}>
          <Table
            loading={tier_load}
            title={()=>
            <Row style={{display:'flex'}} >
              <p style={{fontWeight:'bold'}}>{formatMessage({id:'inputTier3'})}</p>
              <Row style={{display:'flex',marginLeft:'320px'}}>
              <p style={{fontWeight:'bold'}}>{formatMessage({id:'tier2Rest'})} : </p>
              <p style={{fontWeight:'bold',marginLeft:5}}>{formatMoney(tier2RestMoney)}</p>
              </Row>
            </Row>
            }
            columns={addTier3Table?this.addTableItem(tierColumns,dataSource_tier3):tierColumns}
            dataSource={dataSource_tier3}
            rowClassName={(e,index)=>index===editIndex?'editRow':index%2===0?'row-a':'row-b'}
            className="group-table"
            bordered
            size="small"
            pagination={false}
            footer={data=>(
              <Row type="flex" justify='space-between'>
                <Col>
                  <Button  onClick={this.addNewTierData}><Icon type="plus" />{formatMessage({id:'add'})}</Button>
                </Col>
              </Row>
            )}
          />

          {!addTier3Table&&<Icon type="caret-right"  style={{fontSize:26,color:'#d7d7d7'}}  onClick={this.addTable} />}
          {addTier3Table&&<Icon type="caret-left"  style={{fontSize:26,color:'#d7d7d7'}}  onClick={this.closeTable} />}
        </Row>*/}
        {/*<Row style={{display:'flex'}}>
          <Table
            loading={tier_load}
            title={()=>
            <Row style={{display:'flex'}} >
              <p style={{fontWeight:'bold',lineHeight:'27px'}}>{formatMessage({id:'inputTier4'})}</p>
              <Row style={{display:'flex',marginLeft:30}}>
              <p style={{fontWeight:'bold',lineHeight:'27px'}}>{formatMessage({id:'selectSomeTier3'})} : </p>
                <Select
                  mode="multiple"
                  style={{ width: '300px' ,marginLeft:10}}
                  placeholder="Please select"
                  value={this.state.selectedTier3}
                  onSelect={this.select}
                  onDeselect={this.deselect}
                >
                  {dataSource_tier3.map(v=>(<Option key={v.name} >{v.name}</Option>))}
                </Select>
              </Row>
            </Row>
            }
            locale={{emptyText:formatMessage({id:'addTier4'})}}
            columns={addTier4Table?this.addTableItem(tier4Columns,dataSource_tier4):tier4Columns}
            dataSource={dataSource_tier4}
            rowClassName={(e,index)=>index===editIndex?'editRow':index%2===0?'row-a':'row-b'}
            className="group-table"
            bordered
            size="small"
            rowKey={record=>record.id}
            pagination={false}
            footer={data=>(
              <Row type="flex" justify='space-between'>
                <Col>
                  <Button  onClick={this.addNewTier4Data}><Icon type="plus" />{formatMessage({id:'add'})}</Button>
                </Col>
              </Row>
            )}
          />
          {!addTier4Table&&<Icon  type="caret-right"  style={{fontSize:26,color:'#d7d7d7'}}   onClick={()=>this.setState({addTier4Table:true})} />}
          {addTier4Table&&<Icon type="caret-left"  style={{fontSize:26,color:'#d7d7d7'}} onClick={()=>this.setState({addTier4Table:false})} />}
        </Row>*/}

        <Tabs defaultActiveKey="tier3" activeKey={current} onChange={(k)=>{this.setState({current:k})}} style={{margin:'20px 0',paddingBottom:20}} tabBarStyle={{textAlign:'center'}} >
          <TabPane tab="Tier 3" key="tier3">
            {tabs(formColumns_tier3,'tier3')}
          </TabPane>
          <TabPane tab="Tier 4" key="tier4">
            {tabs(this.state.edit4?formColumns_tier4_esti:formColumns_tier4,'tier4')}
          </TabPane>
          <TabPane tab="Project" key="project">
            {tabs(formColumns_pro,'pro')}
          </TabPane>
        </Tabs>
        <ImmutableTable
          loading={loading}
          columns={addTier4Table?this.addTableItem(tierColumns,dataSource_tier3,'tier3'):tierColumns}
          dataSource={Immutable.fromJS(dataSource_tier3)}
          expandedRowRender={(record)=>expandedRowRender(record)}
          rowKey={record => record.get('id')}
          expandRowByClick
          defaultExpandAllRows
          title={()=>(
            <Row>
              <Button onClick={()=>this.setState({addTier4Table:!addTier4Table})}>{addTier4Table?formatMessage({id:'closeEsti'}):formatMessage({id:'openEsti'})}</Button>
            </Row>
          )}
          expandedRowKeys={expandedRowKeys}
          onExpand={(expanded,record)=>this.expandRow(record)}
          bordered={true}
          locale={{emptyText:formatMessage({id:'noTier3FormData'})}}
          scroll={this.scrollFun()}
          style={{marginBottom:36}}
        />
        <Modal
          visible={moveTier_modal}
          onCancel={()=>this.setState({moveTier_modal:false})}
          title={formatMessage({id:'moveTier'})}
          onOk={this.handleModal}
          maskClosable={false}
          width={600}
        >
          <Spin  spinning={ modalLoad } tip="Processing..." >
            <Row style={{display:'flex',justifyContent:'center'}}>
              <Select style={{width:300}} allowClear={true}  onChange={(v)=>this.setState({selectedMove:v})} placeholder={move_tier_type==='tier3'?formatMessage({id:'moveTier2'}):formatMessage({id:'moveTier3'})} >
                {moveSelect.map(v=><Option key={v.id}>{v.name}</Option>)}
              </Select>
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
                    formatter={value => formatMoney(value)}
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

Tier2.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  tier4 : state.getIn(['tier2','tier4']),
  tier2Info : state.getIn(['tier2','tier2Info']),
  client : state.getIn(['client','client']),
  clientPO : state.getIn(['clientPO','clientPO']),

});


export default injectIntl(connect(mapStateToProps)(Tier2))


//const WrappedSystemUser = Form.create()();



