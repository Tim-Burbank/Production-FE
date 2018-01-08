/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Switch,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump,ifFin } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {picurl,rootPath,systemStatus,host,titles as _tit ,raiseInv_tableField as _RIT} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchRaiseInv,newRaiseInv,altRaiseInv} from '../modules/raiseInv'
const Option = Select.Option;
const Search = Input.Search;
const { TextArea } = Input;
const confirm = Modal.confirm;



class RaiseInvPage extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      search1: false,
      search2: false,
      search3: false,
      search4: false,
      loading : false,
      searchText1: '',
      searchText2: '',
      searchText3: '',
      searchText4: '',
      filtered: false,
      filteredInfo: null,
      expandTable:false,
      modal:false,
      remark:'',
      stage:null

    }
  }


  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    // this.setState({loading:true});
    let json = {
      limit:9999,
      offset:0
    }
    dispatch(fetchRaiseInv(json)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({
          loading: false,
        })
      }
    });
  }

  onFetch = (values,limit,offset,cur=1,p) =>{
    this.setState({ loading:true,currentPage:cur });
    const { dispatch } = this.props;
    values={
      ...values,
      limit:limit,
      offset:offset
    };
    dispatch(fetchRaiseInv(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      } else {
        this.setState({
          loading: false,
        })
      }
    });
  };


  changeTable = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      // sortedInfo: sorter,
    });
  }



  handleModal=(opt)=>{
    const { dispatch ,params,intl:{formatMessage}} = this.props;

    if(!this.state.stage) return

    let _json = {
      ids:this.state.selectedRowKeys.join(','),
      remark:this.state.remark
    }
    this.setState({loading:true})
    dispatch(altRaiseInv(opt,_json)).then(e=>{
      if(e.payload){
        this.setState({loading:false,modal:false,stage:null,remark:''});
        message.success('Operation success')
      }else{
        this.setState({loading:false});
        message.error(e.error.message);
      }
    })
  }


  handleApprove=(opt,type)=>{
    const { dispatch ,params,intl:{formatMessage}} = this.props;
    const {flowStatus,flowType,} = this.props;

    let _state = this.state
    let that = this
    if(this.state.selectedRowKeys.length===0) return message.warn('Please select one item')
    this.setState({stage:opt})

    function showConfirm() {
      confirm({
        title: 'Do you want to approve these items?',
        content: <Row>
          {_state.selectedRowKeys.map(v=><p>{v}</p>)}
        </Row>,
        onOk() {
          that.handleModal(opt)
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    }
    function showDeleteConfirm() {
      confirm({
        title: 'Are you sure disapprove these items?',
        content: <Row>
          {_state.selectedRowKeys.map(v=> <p>{v}</p>)}
        </Row>,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
          that.setState({modal:true})
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    }

    if(type===1){
      showConfirm()
    }else{
      showDeleteConfirm()
    }
  }


  onInputChange = (key,e) => {
    this.setState({ [key]: e.target.value });
  }


  getcontent=()=>{
    const {intl:{formatMessage}} = this.props
    return (
      <Col>
        <Button onClick={()=>{this.setState({modal:true,itemId:null})}} type='primary'>{formatMessage({id:'new_btn'})}</Button>
      </Col>
    )
  };

  clearFilters = () => {
    const {dispatch} = this.props;
    this.setState({ filteredInfo: null,searchText1:'',searchText2:'',searchText3:'',searchText4:'',loading:true });
    dispatch(fetchRaiseInv()).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({
          loading: false,
        })
      }
    });
  }


  render(){
    const {intl:{formatMessage},location:{pathname},count,raiseInv,raiseInvInfo,userInfo} = this.props;
    const { stage,remark,searchText4,expandTable,searchText1,searchText2,searchText3,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    //console.log('state',this.state)
    let {  filteredInfo } = this.state;
    filteredInfo = filteredInfo || Immutable.fromJS({});

    const columns = [
      {dataIndex:_RIT.id},
      {dataIndex:_RIT.flowStatus,render:(text,record)=>formatMessage({id:`RaiseInv_${text}`})},
      {dataIndex:_RIT.peCode,render:(text,record)=>record.getIn(['PE','code'])},
      {dataIndex:_RIT.description,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<p>{text}</p>}>{text&&text.length>5?<span>{text.substring(0,5)+' ··· '}<Icon type="question-circle-o" /></span>:<span>{text}</span>}</Tooltip></div>
      </span>),width: 150},
      {dataIndex:_RIT.currency},
      {dataIndex:_RIT.percentage,render:text=>text&&text*100},
      {dataIndex:_RIT.net},
      {dataIndex:_RIT.tax},
      {dataIndex:_RIT.gross},
      {dataIndex:_RIT.clientEmail,render:text=>text&&<Button onClick={()=>window.open(picurl+text)}>Open</Button>},
      {dataIndex:_RIT.remark},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`raiseInvDetail_${item.dataIndex}`}),
      })
    );

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({selectedRowKeys,selectedRows})
      },
      onSelect: (record, selected, selectedRows) => {
        console.log(record, selected, selectedRows);
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        console.log(selected, selectedRows, changeRows);
      },
    };

    const
      gad = ifFin('Group-Account-Director',userInfo&&userInfo.toJS()),
      fd = ifFin('Finance-Director',userInfo&&userInfo.toJS()),
      fm = ifFin('Finance-Manager',userInfo&&userInfo.toJS()),
      ifFinGroup = fd||fm

    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.raiseInv}`})} />
        <Row style={{marginTop:61}}>

          <Row type='flex' justify='start' style={{marginBottom:15}}>
            {gad&&<Button type='primary' onClick={this.handleApprove.bind(this,'gadApprove',1)}  size='large'>{formatMessage({id:'gad-agree'})}</Button>}
            {gad&&<Button type='danger' onClick={this.handleApprove.bind(this,'gadRefuse',2)}  size='large' style={{marginLeft:15}}>{formatMessage({id:'gad-disagree'})}</Button>}
            {ifFinGroup&&<Button type='primary' onClick={this.handleApprove.bind(this,'financeApprove',1)}  style={{marginLeft:15}} size='large'>{formatMessage({id:'fin-agree'})}</Button>}
            {ifFinGroup&&<Button type='danger' onClick={this.handleApprove.bind(this,'financeRefuse',2)}  size='large' style={{marginLeft:15}}>{formatMessage({id:'fin-disagree'})}</Button>}
          </Row>

          <ImmutableTable
            loading={loading}
            columns={columns}
            dataSource={raiseInv}
            rowSelection={rowSelection}
            rowKey={record =>record.get("id")}
            pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
            onChange={this.changeTable}
            scroll={{x:1700}}
          />
        </Row>
        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false,stage:null})}
          title='Raise Invoice'
          onOk={this.handleModal.bind(this,stage)}
          maskClosable={false}
          width={500}
        >
          <Row>
            <p style={{margin:'10px 0'}}>Remark : </p>
            <TextArea rows={4}  value={remark} onChange={(v)=>this.setState({remark:v.target.value})}/>
          </Row>
        </Modal>
      </Row>
    )
  }
}




RaiseInvPage.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  raiseInv : state.getIn(['raiseInv','raiseInv']),
  count : state.getIn(['raiseInv','count']),
  raiseInvInfo: state.getIn(['raiseInv','raiseInvInfo']),
  userInfo : state.getIn(['userInfo','userLoginInfo']),
});

export default injectIntl(connect(mapStateToProps)(RaiseInvPage))


//const WrappedSystemUser = Form.create()();



