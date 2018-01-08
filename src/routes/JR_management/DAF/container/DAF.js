/**
 * Created by Yurek on 2017/8/21.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Icon,Tooltip  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import moment from 'moment'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {titles as _tit ,DAF_tableField as _DAFT} from '../../../../config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,formatDateToM,divHundred} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchDAF ,newDAF ,altDAF ,fetchDAFInfo } from '../modules/DAF'
const Option = Select.Option;
const Search = Input.Search;



class DAF extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      filterDropdownVisible: false,
      loading : false,
      currentPage:1,
      itemId:null,
      count:0,
      searchText: '',
      filtered: false,
      expandedRowKeys:[],
      open_all:false,
      lockModal:false,
      lockContent:null,

    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    let json = {
      //limit:13,
      //offset:0
      year:2017
    }
    dispatch(fetchDAF(json)).then((e)=>{
      if(e.error){
        this.setState({loading: false})
        message.error(e.error.message);
      }else{
        this.setState({loading: false})
      }
    });
  }

  onFetch = (values,limit,offset,cur=1) =>{
    this.setState({
      loading:true,
      searchOption:values,
      currentPage:cur,
      filterDropdownVisible: false,
      filtered: !!this.state.searchText
    });
    const { dispatch } = this.props;
    values={
      ...values,
      limit:limit,
      offset:offset
    };
    dispatch(fetchDAF(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      } else {
        this.setState({loading: false})
      }
    });
  };

  changeTable=(pagination, filters, sorter) => {
    //console.log(pagination, filters, sorter)
    const limit=13;
    const offset=(pagination.current-1)*limit;
    this.onFetch(this.state.searchOption,limit,offset,pagination.current)
  };

  DAFDetails=(id,record)=>{
    const {dispatch} = this.props;
    dispatch(pathJump('/DAF/DAF_detail_show/'+id))
  }

  handleStatus=(status,id)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchDAFInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:id,status:status==1,modal_t:true})
        this.setState({loading:false})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }

  onInputChange = (e) => {
    this.setState({ searchText: e.target.value });
  }

  year=()=>{
    let arr = []
    let _y = Number(moment().format('YYYY'))
    arr.push((_y-2).toString())
    arr.push((_y-1).toString())
    arr.push((_y).toString())
    arr.push((_y+1).toString())
    return arr
  }

  handleModal_t=()=>{
    const {dispatch} = this.props;
    this.setState({modalTLoad:true})
    let json = {
      status:this.state.status?0:1
    }


    dispatch(altDAF(this.state.itemId,json)).then(e=>{
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



  render(){
    const {intl:{formatMessage},location:{pathname},count,DAF,DAFInfo} = this.props;
    const { lockModal,open_all,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad,expandedRowKeys } = this.state
    //console.log('state',this.state)
    const columns = [
      {dataIndex:_DAFT.name,render:(text,record,index)=>(<a onClick={()=>this.DAFDetails(record.get("id"),record)}>{text}</a>)},
      {dataIndex:_DAFT.date},
      {dataIndex:_DAFT.purchaseType},
      {dataIndex:_DAFT.client,render:(text,record,index)=>(record.toJS()&&record.toJS().clientDetail&&record.toJS().clientDetail.nameCN)},
      {dataIndex:_DAFT.projectName},
      {dataIndex:_DAFT.description,render:text=>(
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>)},
      {dataIndex:_DAFT.buyer},
      {dataIndex:_DAFT.team},
      {dataIndex:_DAFT.vendor,render:(text,record,index)=>(record.toJS()&&record.toJS().vendorDetail&&record.toJS().vendorDetail.nameCN)},
      {dataIndex:_DAFT.currencyId},
      {dataIndex:_DAFT.budget},
      {dataIndex:_DAFT.rationale,render:text=>(
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>)},
      {dataIndex:_DAFT.service,render:text=>(
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>)},

    ].map(
      item=>({
        ...item,
        title:item.title?item.title:formatMessage({id:`DAFT_${item.dataIndex}`}),
      })
    );

    this.formColumns=[
      {dataIndex:'year',type:'selectSearch',selectOption:this.year(),placeholder:formatMessage({id:'pleaseSelect'}),dataType:'year'},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    return (

      <Row>
        <Title title={formatMessage({id:`${_tit.DAF}`})} />
        {/*<TopSearch  {...searchProps} />*/}
        <Row style={{marginBottom:10,marginTop:61}}>
          <div className="custom-filter-dropdown">
            <Button onClick={()=>{
            const {dispatch} = this.props;
            dispatch(pathJump('DAF/DAF_detail_edit/new'))
            }} style={{marginRight:20}}>{formatMessage({id:'new_btn'})}</Button>
            <Input
              ref={ele => this.searchInput = ele}
              placeholder="Search year"
              value={this.state.searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onFetch.bind(null,{year:this.state.searchText})}
            />
            <Button type="primary" style={{marginRight:10}} onClick={this.onFetch.bind(null,{year:this.state.searchText})}>Search</Button>
          </div>
        </Row>

        <ImmutableTable
          loading={loading}
          columns={columns}
          dataSource={DAF}
          pagination={{ pageSize: 20,total:count,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items`}}
          //onChange={this.changeTable}
          rowKey={record => record.get('id')}
          expandedRowKeys={expandedRowKeys}
        />
        {/* <Modal
          visible={lockModal}
          onCancel={()=>this.setState({lockModal:false,lockContent:null})}
          title={formatMessage({id:'lockTitle'})}
          maskClosable={false}
          width={350}
          footer={null}
        >
          <Row style={{margin:'0 30px 20px'}}>
            {this.lockContent()}
          </Row>
        </Modal> */}

      </Row>
    )
  }
}



DAF.propTypes = {
  pathJump : React.PropTypes.func,
};

const mapStateToProps = (state) =>{
  console.log(255,state&&state.toJS())
  return({
   DAF : state.getIn(['DAF','DAF']),
   count : state.getIn(['DAF','count']),
   DAFInfo: state.getIn(['DAF','DAFInfo']),
 });
}

export default injectIntl(connect(mapStateToProps)(DAF))


//const WrappedSystemUser = Form.create()();



