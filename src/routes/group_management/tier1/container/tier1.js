/**
 * Created by Maoguijun on 2017/8/21.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,Tooltip, DatePicker,Icon  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import moment from 'moment'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {titles as _tit ,tier1_tableField as _T1TF} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,formatDateToM} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchTier1 ,newTier1 ,altTier1 ,fetchTier1Info,fetchTier2,fetchGroup } from '../modules/tier1'
// import { fetchGroup ,newGroup ,altGroup ,fetchGroupInfo } from '../../group/modules/group'
import TableTitle from '../../../../components/TableTitle/TableTitle'
const Option = Select.Option;
const Search = Input.Search;



class Tier1 extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      filterDropdownVisible: false,
      loading : false,
      currentPage:1,
      count:0,
      searchText: '',
      filtered: false,
      total:{
        name:'total',
        groupId:' ',
        initAmount:0,
        lastMonthAmount:0,
        amount:0,
        open:0,
        planned:0,
        committed:0,
        description:'',
        operation:'',
      },//存放total
      expandedRowKeys:[],
      expand_all:false,
      modal_publish:false,
      itemId:null,
      lockModal:false,
      lockContent:Immutable.fromJS([])
    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    let year = moment().format('YYYY')

    dispatch(fetchGroup({year:year}))
    dispatch(fetchTier2({'group.startDate_like':year}))
    dispatch(fetchTier1()).then((e)=>{
      if(e.error){
        this.setState({loading: false})
        message.error(e.error.message);
      }else{
        this.setState({loading: false})
        this.sumTotal(e.payload.objs)
      }
    });
  }
  sumTotal(values){
    //计算各列total
    let _total = {
      initAmount:0,
      lastMonthAmount:0,
      amount:0,
      open:0,
      planned:0,
      committed:0,
    }
    values&&values.forEach(item=>{
      _total.initAmount +=item.initAmount
      _total.lastMonthAmount +=item.lastMonthAmount
      _total.amount +=item.amount
      _total.open +=item.open
      _total.planned +=item.planned
      _total.committed +=item.committed
    })
    //console.log(_total)
    this.setState({
      total:{...this.state.total,..._total}
    })
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
    dispatch(fetchTier1(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      } else {
        this.setState({loading: false})
        this.sumTotal(e.payload.objs)
      }
    });
  };

  changeTable=(pagination, filters, sorter) => {
    //console.log(pagination, filters, sorter)
    const limit=13;
    const offset=(pagination.current-1)*limit;
    this.onFetch(this.state.searchOption,limit,offset,pagination.current)
  };

  tier1Details=(id,record)=>{
    const {dispatch} = this.props;
    //console.log(130,record)
    if(record.has('groupLocks')&&record.get('groupLocks').size>0){
      this.setState({lockModal:true,lockContent:record.get('groupLocks')})
    }else{
      this.setState({loading:true})
      dispatch(pathJump('tier_1/tier1_detail/'+id))
    }
  }


  tier2Details=(id)=>{
    const {dispatch} = this.props;
    //console.log(130,id)
    this.setState({loading:true})
    dispatch(pathJump('tier2/'+id))
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

  //点击行展开扩展表格
  expandRow=(record)=>{
    this.forceUpdate()
  }
  //全部展开功能
  expandAll=()=>{
    const {expandedRowKeys} = this.state
    const {Tier1} = this.props
    if(this.state.expand_all){
      this.setState({
        expandedRowKeys:[],
        expand_all:false
      })
    }else{
      let _expandedRowKeys=[]
      Tier1&&Tier1.toJS().forEach(item=>{
        _expandedRowKeys.push(item.id)
      })
      this.setState({
        expandedRowKeys:_expandedRowKeys,
        expand_all:true
      })
    }

  }

  publishTier=(itmeId)=>{
    //console.log(itmeId)
    this.setState({
      modal_publish:false,
      itemId:null
    })
  }

  lockContent=()=> {
    const {group,intl:{formatMessage}} = this.props
    if(this.state.lockContent){
      const _content = this.state.lockContent&&this.state.lockContent.toJS()
      //console.log(214,_content)
      const labelArr = Object.keys(_content.length>0&&_content[0]);
      return labelArr.map(v=>(
          <Row style={{display:'flex',margin:'10px 0'}}>
            <Col>
              <p style={{marginRight:10,width:112,textAlign:'right',fontWeight:'bold'}}>{formatMessage({id: `lock_${v}`})} : </p>
            </Col>
            <Col>
              {_content.map(t=>(
                <Row>{t[v]}</Row>
              ))}
            </Col>
          </Row>
        )
      )
    }
  }



  render(){
    const {intl:{formatMessage},location:{pathname},count,Tier1,group,Tier2} = this.props;
    const { loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad,total, expandedRowKeys,expand_all,modal_publish,lockModal,lockContent } = this.state
    //console.log('state',this.state)

    //将List结构解压成数组
    const getSearchList = (List) => {
      let arr =[]
      if (List) {
        List.toArray().forEach(item => {
          arr.push({id:item.get('id'),name:item.get('name')})
        })
      }
      return arr
    }


    const columns = [
      {dataIndex:_T1TF.name,
        width:'180px',
        render: (text,record,index) => <a onClick={
          this.tier1Details.bind(this,record.get('id'),record&&record)
        }>{text}</a>,
      },
      {dataIndex:_T1TF.groupName,width:'180px',render:(text,record,index)=>record.toJS().group&&record.toJS().group.name},
      {dataIndex:_T1TF.initAmount,width:'180px'},
      {dataIndex:_T1TF.lastMonthAmount,width:'180px'},
      {dataIndex:_T1TF.amount,width:'180px'},
      {dataIndex:_T1TF.open,width:'180px'},
      {dataIndex:_T1TF.planned,width:'180px'},
      {dataIndex:_T1TF.committed,width:'180px'},
      {dataIndex:_T1TF.description,render:text=>(
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>)},
      {dataIndex:_T1TF.operation,width:'150px',render:(text,record,index)=><a onClick={()=>{this.setState({modal_publish:true,itemId:record.get('id')})}}>{formatMessage({id:`publish`})}</a>}

    ].map(
      item=>{
        if(item.dataIndex=='groupName'||item.dataIndex=='description'||item.dataIndex=='operation'){
          return {
            ...item,
            title:TableTitle(formatMessage({ id: `tier1_${item.dataIndex}` }),total[item.dataIndex]),
          }
        }else if(item.dataIndex=='name'){
          return {
            ...item,
            title:<Row>
              <span onClick={this.expandAll} style={{position:'absolute',left:-40,top:14,backgroundColor:'#D9DEE4'}} className={expand_all?'ant-table-row-expand-icon ant-table-row-expanded':'ant-table-row-expand-icon ant-table-row-collapsed'} ></span>
              {TableTitle(formatMessage({ id: `tier1_${item.dataIndex}` }),total[item.dataIndex])}

            </Row>
          }
        }else{
          return{
            ...item,
            className: 'column-money',
            title:TableTitle(formatMessage({ id: `tier1_${item.dataIndex}` }),formatMoney(total[item.dataIndex]/100)),
            render:text=>formatMoney(text/100)
          }
        }
      }



    );
    const exColumns = [
      {dataIndex:_T1TF.name,
        width:'180px',
        render: (text,record,index) => <a onClick={this.tier2Details.bind(this,record.get('id'),record&&record)}>{text}</a>,
      },
      // {dataIndex:_T1TF.groupId,width:'180px'},
      {dataIndex:_T1TF.groupName,width:'180px',render:(text,record,index)=>record.toJS().group&&record.toJS().group.name},
      {dataIndex:_T1TF.initAmount,width:'180px'},
      {dataIndex:_T1TF.lastMonthAmount,width:'180px'},
      {dataIndex:_T1TF.amount,width:'180px'},
      {dataIndex:_T1TF.open,width:'180px'},
      {dataIndex:_T1TF.planned,width:'180px'},
      {dataIndex:_T1TF.committed,width:'180px'},
      {dataIndex:_T1TF.description,render:text=>(
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>)},
      {dataIndex:_T1TF.approverId,width:'150px',render:(text,record,index)=>text?text:<a onClick={(text,record,index)=>{console.log(index)}}>{formatMessage({id:`tier1_${_T1TF.approverId}`})}</a>}

    ].map(
      item=>{
        if(item.dataIndex=='name'||item.dataIndex=='groupName'||item.dataIndex=='description'||item.dataIndex=='approverId'){
          return {
            ...item,
          }
        }else{
          return{
            ...item,
            className: 'column-money',
            render:text=>formatMoney(text/100)
          }
        }
      }
    );

    this.formColumns=[
      {dataIndex:'group.startDate_like',noLocal:true,type:'select',selectOption:this.year()},
      {dataIndex:'groupId_like',type:'select_obj',noLocal:true,selectOption:getSearchList(group)},
      {dataIndex:'id_like',type:'select_obj',noLocal:true,selectOption:getSearchList(Tier1)},
      {dataIndex:'tier2.id_like',type:'select_obj',noLocal:true,selectOption:getSearchList(Tier2)},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    const expandedRowRender = (record) => {
      let exData = record.get('tier2s')
      return (
        <ImmutableTable
          columns={exColumns}
          dataSource={exData}
          pagination={false}
          showHeader={false}
          rowKey={record => record.get('id')}
          style={{margin:'-7px -9px'}}
        />
      );
    };

    let searchProps={
      formColumns:this.formColumns,
      onSave:this.onFetch,
    };

    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.tier1}`})} />
        <TopSearch  {...searchProps} />
        <ImmutableTable
          loading={loading}
          columns={columns}
          dataSource={Tier1}
          pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items`}}
          //onChange={this.changeTable}
          expandedRowRender={record=>expandedRowRender(record)}
          rowKey={record => record.get('id')}
          scroll={{x:1880}}
          expandRowByClick
          expandedRowKeys={expandedRowKeys}
          onExpand={(expanded,record)=>this.expandRow(record)}
        />
        <Modal
          visible={modal_publish}
          title={formatMessage({id:'publish'})}
          maskClosable={false}
          width={400}
          onCancel={()=>this.setState({modal_publish:false,itemId:null})}
          footer={
            <Row>
              <Button type="primary" onClick={()=>this.publishTier(itemId)}>{formatMessage({id:'publish'})}</Button>
              <Button onClick={()=>this.setState({modal_publish:false,itemId:null})} >{formatMessage({id:'cancel'})}</Button>
            </Row>
          }
        >
          <Spin  spinning={ false } tip="creating..." >
            <Row>
              <h2>确认发布本月的 Tier 版本？</h2>
              <p style={{color:'#e43937'}}>如果本月已存在发布的版本，会覆盖该版本</p>
            </Row>
          </Spin>
        </Modal>
        <Modal
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
        </Modal>
      </Row>
    )
  }
}



Tier1.propTypes = {
  pathJump : React.PropTypes.func,
};

const mapStateToProps = (state) =>{
  return({
   Tier1 : state.getIn(['tier1','Tier1']),
   count : state.getIn(['tier1','count']),
   Tier1Info: state.getIn(['tier1','Tier1Info']),
   group : state.getIn(['tier1','groups']),
   Tier2 : state.getIn(['tier1','Tier2']),
 })
}

export default injectIntl(connect(mapStateToProps)(Tier1))


//const WrappedSystemUser = Form.create()();



