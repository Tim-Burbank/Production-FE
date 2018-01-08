/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import moment from 'moment'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {titles as _tit ,approver_tableField as _appT} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,formatDateToM} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchApprover ,newApprover ,altApprover ,fetchApproverInfo } from '../modules/approver'
const Option = Select.Option;
const Search = Input.Search;


class Approver extends React.Component{


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
      modalTLoad: false,
      count:0,
    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    let json = {
      limit:13,
      offset:0
    }
    dispatch(fetchApprover(json)).then((e)=>{
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
    values={
      ...values,
      limit:limit,
      offset:offset
    };
    dispatch(fetchApprover(values)).then((e)=>{
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
          values = {
            ...values,
            validDate:moment(values['validDate']).format('YYYY-MM-DD'),
            inValidDate:values['inValidDate']?moment(values['inValidDate']).format('YYYY-MM-DD'):undefined,
          }
          dispatch(newApprover(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }else{
          values = {
            ...values,
            validDate:moment(values['validDate']).format('YYYY-MM-DD'),
            inValidDate:moment(values['inValidDate']).format('YYYY-MM-DD'),
          }
          dispatch(altApprover(this.state.itemId,values)).then(e=>{
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
    dispatch(fetchApproverInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
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
    dispatch(fetchApproverInfo(id)).then(e=>{
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


  handleModal_t=()=>{
    const {dispatch} = this.props;
    this.setState({modalTLoad:true})
    let json = {
      status:this.state.status?0:1
    }
    dispatch(altApprover(this.state.itemId,json)).then(e=>{
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

  getcontent=()=>{
    const {intl:{formatMessage}} = this.props
    return (
      <Col>
        <Button onClick={()=>{this.setState({modal:true,itemId:null})}} type='primary'>{formatMessage({id:'new_btn'})}</Button>
      </Col>
    )
  };



  render(){
    const {intl:{formatMessage},location:{pathname},count,approver,approverInfo} = this.props;
    const { loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad } = this.state
    //console.log('state',this.state)
    const columns = [
      {dataIndex:_appT.id,render: text => <a onClick={this.billDetails.bind(this,text)}>{text}</a>,},
      {dataIndex:_appT.title},
      {dataIndex:_appT.phoneNum},
      {dataIndex:_appT.faxNum},
      {dataIndex:_appT.email},
      {dataIndex:_appT.validDate,render:text=>formatDateToM(text)},
      {dataIndex:_appT.inValidDate,render:text=>formatDateToM(text)},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`approver_${item.dataIndex}`}),
      })
    );



    const formColumns = [
      {dataIndex:_appT.id,props:{disabled:this.state.itemId!==null},option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_appT.title},
      {dataIndex:_appT.phoneNum,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_appT.faxNum},
      {dataIndex:_appT.email,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_appT.validDate,option:{rules: [{ required: true, message: 'Please select' }]},FormTag:<DatePicker />},
      {dataIndex:_appT.inValidDate,FormTag:<DatePicker />},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`approver_${item.dataIndex}`}),

      })
    );





    const renderForm=(v,column)=>{
      //console.log('form',v)
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
      //console.log(approverInfo)
      let bold = column.bold
      let text
      if(approverInfo){
        text=column.deep?approverInfo.getIn(column.deep):approverInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item'>
          <Col span={12}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`approver_${column.dataIndex}`})}</Col>
          <Col span={12}  className="payment-value" style={bold&&{fontWeight:"bold"}}>{
            renderForm(text,column)
          }</Col>
        </Col>
      )};


    this.formColumns=[
      {dataIndex:'id_like',formTag:'input'},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )


    let searchProps={
      formColumns:this.formColumns,
      onSave:this.onFetch,
      rightContent:this.getcontent()
    };


    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.approver}`})} />
        <TopSearch  {...searchProps} />
        <Row>
        </Row>
        <ImmutableTable
          loading={loading}
          columns={columns}
          dataSource={approver}
          rowKey={record =>record.get("id")}
          pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
          //onChange={this.changeTable}
        />

        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false,itemId:null})}
          title={itemId?formatMessage({id:'edit'}):formatMessage({id:'newInfo'})}
          onOk={this.handleModal}
          maskClosable={false}
          width={1000}
        >
          <Spin  spinning={ modalLoad } tip="creating..." >
            <Row>
              <SimpleForm columns={ formColumns } initial={itemId==null?Immutable.fromJS([]):approverInfo} colSpan={12} labelCol={{span:7}} ref={f=>this.form=f} />
            </Row>
          </Spin>
        </Modal>
      </Row>
    )
  }

}


Approver.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  approver : state.getIn(['approver','approver']),
  count : state.getIn(['approver','count']),
  approverInfo: state.getIn(['approver','approverInfo']),
});

export default injectIntl(connect(mapStateToProps)(Approver))


//const WrappedSystemUser = Form.create()();



