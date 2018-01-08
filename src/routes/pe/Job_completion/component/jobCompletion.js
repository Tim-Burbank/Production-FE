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
import {rootPath,systemStatus,host,titles as _tit ,jobCompletion_tableField as _JCT} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchJobC,fetchJobCInfo ,altJobC} from '../modules/jobCompletion'
const Option = Select.Option;
const Search = Input.Search;
const { TextArea } = Input;
const confirm = Modal.confirm;



class JobCompletionPage extends React.Component{
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
    dispatch(fetchJobC(json)).then((e)=>{
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
    dispatch(fetchJobC(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      } else {
        this.setState({loading: false})
      }
    });
  };


  changeTable = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      // sortedInfo: sorter,
    });
  };



  jobCompletionFlowStatus=()=>{
    const {intl:{formatMessage}} = this.props;
    let arr = Object.keys(systemStatus)
    let re = []
    arr.map(v=>{
      let obj = {}
      obj.text = formatMessage({id:v})
      obj.value = v
      re.push(obj)
    })
    return re
  }

  onSearch=(state,e)=>{
    const {dispatch} = this.props;
    let json = {
      //[key]:this.state[value],
      id_like:this.state.searchText1,
      'clientDetail.clientId':this.state.searchText2,
      'product.productDetail.name_like':this.state.searchText3,
      'project.clientPoId_like':this.state.searchText4
    }

    this.setState({loading:true,
      [state]: false,
    })

    dispatch(fetchJobCompletion(json)).then((e)=>{
      if(e.error){
        this.setState({loading:false})
        message.error(e.error.message);
      }else{
        this.setState({
          loading: false,

        })
      }
    });

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
    dispatch(fetchJobCompletion()).then((e)=>{
      if(e.error){
        message.error(e.error.message);
      }else{
        this.setState({
          loading: false,
        })
      }
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
    dispatch(altJobC(opt,_json)).then(e=>{
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
        title: opt==='complete'?'Do you want to complete these items?':'Do you want to approve these items?',
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

  render(){
    const {intl:{formatMessage},location:{pathname},count,jobCompletion,jobCompletionInfo,userInfo} = this.props;
    const { remark,stage,searchText4,expandTable,searchText1,searchText2,searchText3,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    //console.log('state',this.state)
    let {  filteredInfo } = this.state;
    filteredInfo = filteredInfo || Immutable.fromJS({});

    const columns = [
      {dataIndex:_JCT.status},
      {dataIndex:_JCT.peCode},
      {dataIndex:_JCT.description},
      {dataIndex:_JCT.currency},
      {dataIndex:_JCT.peNet},
      {dataIndex:_JCT.ar},
      {dataIndex:_JCT.ap},
      {dataIndex:_JCT.remark},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`jobCompletionDetail_${item.dataIndex}`}),
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

    const ad = ifFin('Account-Director',userInfo&&userInfo.toJS()),
          fm = ifFin('Finance-Manager',userInfo&&userInfo.toJS()),
          fd = ifFin('Finance-Director',userInfo&&userInfo.toJS()),
          ifFinGroup = fd||fm


    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.jobCompletion}`})} />
        <Row style={{marginTop:61}}>
          <Row type='flex' justify='start' style={{marginBottom:15}}>
            {ad&&<Button type='primary' size='large' onClick={this.handleApprove.bind(this,'adApprove',1)}>{formatMessage({id:'ad-agree'})}</Button>}
            {ad&&<Button type='danger' size='large'  onClick={this.handleApprove.bind(this,'adRefuse',2)} style={{marginLeft:15}}>{formatMessage({id:'ad-disagree'})}</Button>}
            {fm&&<Button type='primary' size='large' onClick={this.handleApprove.bind(this,'fmApprove',1)} style={{marginLeft:15}}>{formatMessage({id:'fm-agree'})}</Button>}
            {fm&&<Button type='danger' size='large' onClick={this.handleApprove.bind(this,'fmRefuse',2)} style={{marginLeft:15}}>{formatMessage({id:'fm-disagree'})}</Button>}
            {ifFinGroup&&<Button  size='large' onClick={this.handleApprove.bind(this,'complete',1)} style={{marginLeft:15}}>{formatMessage({id:'fin-end'})}</Button>}
          </Row>
          <ImmutableTable
            loading={loading}
            columns={columns}
            dataSource={jobCompletion}
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




JobCompletionPage.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  jobCompletion : state.getIn(['jobCompletion','jobCompletion']),
  count : state.getIn(['jobCompletion','count']),
  jobCompletionInfo: state.getIn(['jobCompletion','jobCompletionInfo']),
  userInfo : state.getIn(['userInfo','userLoginInfo']),
});

export default injectIntl(connect(mapStateToProps)(JobCompletionPage))


//const WrappedSystemUser = Form.create()();



