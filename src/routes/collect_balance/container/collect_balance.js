/**
 * Created by Maoguijun on 2017/8/7.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row, message, Spin, Button, Pagination, Modal, Col, Select, Input,DatePicker, Upload, Icon, Tooltip ,Table} from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../utils/'
import TopSearch from '../../../components/search/topSearch'
import Title from '../../../components/title/title'
import {host,titles as _tit ,CollectBalance_tableField as CollectBalanceTF,rootPath,BudgetType,ClientPLStatus} from '../../../config'
import {WORLD_COUNTRY} from '../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../utils/formatData'
import {getFormRequired} from '../../../utils/common'
import { fetchCollectBalance ,newCollectBalance ,altCollectBalance ,fetchCollectBalanceInfo} from '../modules/collect_balance'
import { fetchClient } from '../../system_settings/client/modules/client'
import { fetchBillTo } from '../../system_settings/bill_to/modules/bill_to'
import moment from 'moment'
import './collect_balance.css'
const Option = Select.Option;
const Search = Input.Search;


class CollectBalance extends React.Component{
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
      slideList: [],
      count:0,
    }
  }





  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    dispatch(fetchClient())
    dispatch(fetchBillTo())
    dispatch(fetchCollectBalance()).then((e)=>{
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
    const year = new Date().getFullYear();
    values.year=values.year?values.year:year
    values={
      ...values,
      limit: limit,
      offset:offset
    };
    dispatch(fetchCollectBalance(values)).then((e)=>{
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


  handleModal=()=>{
    const {dispatch,params,intl:{formatMessage}} = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {
        //console.log('receive form value',values)
        this.setState({modalLoad:true})
        //console.log('value',values)
        if(this.state.itemId == null){
          this.form.resetFields()

          dispatch(newCollectBalance(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }else{
          dispatch(altCollectBalance(this.state.itemId,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null,currentPage:1})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }
      }
    });
  };



  billDetails=(id)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchCollectBalanceInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        let _Arr=[];
        _Arr.push({
          uid: e.payload.logo,
          status: 'done',
          percent: 100,
          url: e.payload.logo,
        });
        this.setState({slideList:_Arr})
        this.setState({itemId:id,modal:true})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }

  handleStatus=(status,id)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchCollectBalanceInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        let _Arr=[];
        _Arr.push({
          uid: e.payload.logo,
          status: 'done',
          percent: 100,
          url: e.payload.logo,
        });
        this.setState({slideList:_Arr})
        this.setState({itemId:id,status:status==1,modal_t:true})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }



  handleModal_t=()=>{
    const {dispatch,CollectBalanceInfo} = this.props;
    this.setState({modalTLoad:true})
    let _record = CollectBalanceInfo.toJS()
    let action =_record.status==1?'disable':'enable'
    let json = {
      ..._record,
      status:_record.status==1?0:1
    }
    dispatch(altCollectBalance(action,this.state.itemId,json)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:null,modal_t:false,currentPage:1})
        this.setState({modalTLoad:false})
      }else{
        this.setState({modalTLoad:false})
        message.error(e.error.message)
      }
    })
  };

  getcontent=()=>{
    const {intl:{formatMessage}} = this.props
    return (
      <Col>
        <Button onClick={()=>{
        const {dispatch} = this.props;
        dispatch(pathJump(rootPath.collect_balance_details+'/new'))
        }} type='primary'>{formatMessage({id:'new_btn'})}</Button>
      </Col>
    )
  };
  billDetails=(id)=>{
    const {dispatch} = this.props;
    dispatch(pathJump('/collect_balance/collect_balance_details/'+id))
  }

  render(){
    const {intl:{formatMessage},location:{pathname},count,CollectBalance,clientPO,client,billTo,CollectBalanceInfo,roles,ldap} = this.props;
    const { loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    const columns = [
      {
        dataIndex: CollectBalanceTF.id,
        render: text => (<a onClick={this.billDetails.bind(this,text)}>{text}</a>)
      },
      {dataIndex: CollectBalanceTF.balanceType,},
      {dataIndex:CollectBalanceTF.clientId,},
      {dataIndex:CollectBalanceTF.billToId,},
      {dataIndex:CollectBalanceTF.Description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>10?<span>{text.substring(0,10)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>)},
      {dataIndex:CollectBalanceTF.amount,className:'column-money',render:text=>formatMoney(text/100||"")},
      // {dataIndex:CollectBalanceTF.bankCharge,},
      {dataIndex:CollectBalanceTF.currencyId,},
      {dataIndex:CollectBalanceTF.createdAt,render:date=>moment(date).format('YYYY-MM-DD'),},
    ].map(
      item =>({
        ...item,
        title: formatMessage({ id: `CollectBalanceTF_${item.dataIndex}` }),
      })
    );

    const formColumns = [
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`billingPL_${item.dataIndex}`}),
      })
    );
    const getSearchList=(List)=>{
      let set = new Set();
      if(List&&List.size>0){
        //console.log(361,List,List.toArray())
        List.toArray().forEach(item=>{
          set.add(item.get('id'))
        })
      }
      return [...set]
    }
    this.formColumns=[
      {dataIndex:'clientDetail.clientId_like',type:'select',mode:'combobox',
      noLocal:true,selectOption:getSearchList(client),placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'billToId_like',type:'select',mode:'combobox',noLocal:true,selectOption:getSearchList(billTo),placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'description_like',FormTag:'input',noLocal:true},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )


    let searchProps={
      formColumns:this.formColumns,
      onSave: this.onFetch,
        rightContent:this.getcontent()
    };
  //console.log(351,CollectBalance,count)
    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.collect_balance}`})} />
        <TopSearch  {...searchProps} />
          <Table
            loading={loading}
            columns={columns}
            dataSource={CollectBalance&&CollectBalance.toJS()}
            pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
            //onChange={this.changeTable}
            size="small"
            rowKey={record => record.id}
            rowClassName={(record,index)=>{
              if(record.balanceStatus=='N'){
                return "balanceNot"
              }else{
                return index%2===0?'row-a':'row-b'
              }
            }}
          />
      </Row>
    )
  }

}


CollectBalance.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) =>{
  //console.log(396,...state)
  return({
    CollectBalance : state.getIn(['collect_balance','CollectBalance']),
    count : state.getIn(['collect_balance','count']),
    CollectBalanceInfo: state.getIn(['collect_balance','CollectBalanceInfo ']),
    // clientPO : state.getIn(['clientPO','clientPO']),
    client : state.getIn(['client','client']),
    billTo : state.getIn(['billTo','billTo']),
  });
}


export default injectIntl(connect(mapStateToProps)(CollectBalance))


//const WrappedSystemUser = Form.create()();



