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
import {titles as _tit ,group_tableField as _groT,tier1_tableField as _T1TF} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,formatDateToM,divHundred} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchGroup ,newGroup ,altGroup ,fetchGroupInfo } from '../modules/group'
const Option = Select.Option;
const Search = Input.Search;



class Group extends React.Component{
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
      year:moment().get('year')
    }
    dispatch(fetchGroup(json)).then((e)=>{
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
    dispatch(fetchGroup(values)).then((e)=>{
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

  billDetails=(id,record)=>{
    const {dispatch} = this.props;
    if(record.get('locks').size>0){
      this.setState({lockModal:true,lockContent:record.get('locks')})
    }else{
      dispatch(pathJump('/group_detail/'+id))

    }
  }

  tierDetails=(id)=>{
    const {dispatch} = this.props;
    dispatch(pathJump('tier_1/tier1_detail/'+id))
  }

  handleStatus=(status,id)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchGroupInfo(id)).then(e=>{
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


    dispatch(altGroup(this.state.itemId,json)).then(e=>{
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

  //点击行展开扩展表格
  expandRow=(record)=>{
    this.forceUpdate()
  };

  openAll=()=>{
    const {group} = this.props;
    console.log('allexpandedRowKeys',this.state.expandedRowKeys)
    if(this.state.open_all){
      this.setState({expandedRowKeys:[],open_all:false})
    }else{
      if(group){
        let _group = [];
        group.forEach(v=>{
          _group.push(v.get('id'))
        })
        this.setState({expandedRowKeys:_group,open_all:true})
      }
    }
  }

  lockContent=()=> {
    const {group,intl:{formatMessage}} = this.props
    if(this.state.lockContent){
      const _content = this.state.lockContent.toJS()
      const labelArr = Object.keys(_content[0]);
      let renderArr = []
      labelArr.map(v=>{
        if(v!=='commonId'&&v!=='name'&&v!=='url'){
          renderArr.push(v)
        }
      })
      return renderArr.map((v,i)=>(
          <Row style={{display:'flex',margin:'10px 0'}}>
            <Col>
              <p style={{marginRight:10,width:112,textAlign:'right',fontWeight:'bold'}}>{formatMessage({id: `lock_${v}`})} : </p>
            </Col>
            <Col>
              {_content.map(t=>(
                v==='type'?<a onClick={()=>{
                const {dispatch} = this.props;
                let url
                if(t.type==='tier1'){
                  url = '/tier_1/tier1_detail/'+t.url
                }else{
                  url = '/tier2/'+t.url
                }
                dispatch(pathJump(url))
                }} >{t['type']+' '+t['name']}</a>:<Row>{t[v]}</Row>
              ))}
            </Col>
          </Row>
        )
      )
    }
  }


  render(){
    const {intl:{formatMessage},location:{pathname},count,group,groupInfo} = this.props;
    const { lockModal,open_all,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad,expandedRowKeys } = this.state
    console.log('state',this.state)
    const columns = [
      {dataIndex:_groT.name,render: (text,record) => <a onClick={this.billDetails.bind(this,record&&record.get('id'),record&&record)}>{text}</a>,title:<Row><span onClick={this.openAll} style={{position:'absolute',left:-32.5,backgroundColor:'#D9DEE4'}} className={open_all?'ant-table-row-expand-icon ant-table-row-expanded':'ant-table-row-expand-icon ant-table-row-collapsed'} ></span><span>{formatMessage({id:`group_${_groT.name}`})}</span></Row>},
      {dataIndex:_groT.currencyId},
      {dataIndex:_groT.clientId},
      {dataIndex:_groT.clientPos,render:text=>(
        <Row>
          {text&&text.map((v,i,r)=><div  style={i===r.size-1?{marginBottom:0}:{paddingBottom:5,borderBottom:'1px solid #e9e9e9'}} >{v.get('id')}</div>)}
        </Row>
      )},
      {dataIndex:_groT.amount,className: 'column-money',render:(text,record)=>(
        <Row>
          {record&&record.get('clientPos').map((v,i,r)=><div style={i===r.size-1?{marginBottom:0}:{paddingBottom:5,borderBottom:'1px solid #e9e9e9'}} >{formatMoney((v.getIn(['clientPoDetails',0,'productionGross']))/100)}</div>)}
        </Row>
      )},
      {dataIndex:_groT.budgetAllocated,render:text=>formatMoney(divHundred(text)),className: 'column-money'},
      {dataIndex:_groT.restAmount,render:text=> text<0?'('+formatMoney(divHundred(text))+')':formatMoney(divHundred(text)),className: 'column-money'},
      {dataIndex:_groT.description,render: (text, record) => (
        <span>
          {text&&<div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>}
      </span>)}
    ].map(
      item=>({
        ...item,
        width:180,
        title:item.title?item.title:formatMessage({id:`group_${item.dataIndex}`}),
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

    const tierColumn = [
      {dataIndex:_T1TF.name,
        render: (text,record) => <a onClick={this.tierDetails.bind(this,record&&record.get('id'))}>{text}</a>,
      },
      {dataIndex:_T1TF.initAmount,render:text=>formatMoney(text/100),className: 'column-money'},
      {dataIndex:_T1TF.lastMonthAmount,render:text=>formatMoney(text/100),className: 'column-money'},
      {dataIndex:_T1TF.amount,render:text=>formatMoney(text/100),className: 'column-money'},
      {dataIndex:_T1TF.open,render:text=>formatMoney(text/100),className: 'column-money'},
      {dataIndex:_T1TF.planned,render:text=>formatMoney(text/100),className: 'column-money'},
      {dataIndex:_T1TF.committed,render:text=>formatMoney(text/100),className: 'column-money'},
      {dataIndex:_T1TF.description,render: (text, record) => (
        <span>
          {text&&<div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>}
      </span>)}
    ].map(
      item=>({
        ...item,
        width:180,
        title:item.dataIndex===_T1TF.name?<a onClick={()=>{
        const {dispatch} = this.props;
        dispatch(pathJump('/tier_1'))
        }}>{formatMessage({id:`tier1_${item.dataIndex}`})}</a>:formatMessage({id:`tier1_${item.dataIndex}`}),
      })
    );


    const expandedRowRender = (record) => {
      const _data = record.get('tier1s')
      return (
        <Row>
          <ImmutableTable
            style={{margin:'-5px -9px -5px -8px'}}
            columns={tierColumn}
            dataSource={_data}
            pagination={false}
            bordered={false}
            rowKey={record =>record.get('id')}
          />
        </Row>
      );
    };

    return (

      <Row>
        <Title title={formatMessage({id:`${_tit.group}`})} />
        {/*<TopSearch  {...searchProps} />*/}
        <Row style={{marginBottom:10,marginTop:61}}>
          <div className="custom-filter-dropdown">
            <Button onClick={()=>{
            const {dispatch} = this.props;
            dispatch(pathJump('/group_detail/new_group'))
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
          dataSource={group}
          pagination={{ pageSize: 20,total:count,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items`}}
          //onChange={this.changeTable}
          expandedRowRender={(record)=>expandedRowRender(record)}
          rowKey={record => record.get('id')}
          expandRowByClick
          expandedRowKeys={expandedRowKeys}
          onExpand={(expanded,record)=>this.expandRow(record)}
          bordered={true}
        />
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



Group.propTypes = {
  pathJump : React.PropTypes.func,
};

const mapStateToProps = (state) => ({
  group : state.getIn(['group','group']),
  count : state.getIn(['group','count']),
  groupInfo: state.getIn(['group','groupInfo']),
});

export default injectIntl(connect(mapStateToProps)(Group))


//const WrappedSystemUser = Form.create()();



