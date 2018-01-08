/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../utils/'
import TopSearch from '../../../components/search/topSearch'
import Title from '../../../components/title/title'
import {host,titles as _tit ,authority_tableField as _autT} from '../../../config'
import {WORLD_COUNTRY} from '../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../utils/formatData'
import {getFormRequired} from '../../../utils/common'
import { fetchAuthority ,newAuthority ,altAuthority ,fetchAuthorityInfo,fetchRoles ,fetchLdap} from '../modules/authority_management'
const Option = Select.Option;
const Search = Input.Search;


class Authority extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      previewImage:'',
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
      gadUser:[]
    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    ////console.log('this.props',this.props)
    this.setState({loading:true});

    dispatch(fetchRoles())
    dispatch(fetchAuthority({'role.id':'Group-Account-Director'})).then(e=>{
      if(e.payload){
        this.setState({gadUser:e.payload.objs})
        dispatch(fetchAuthority()).then((e)=>{
          if(e.error){
            message.error(e.error.message);
          }else{
            this.setState({
              loading: false,
              count:e.payload.count
            })
          }
        });
      }else{
        message.error(e.error.message);
      }
    })

  }

  onFetch = (values,limit,offset,cur=1,p) =>{
    this.setState({ loading:true,currentPage:cur });
    const { dispatch } = this.props;
    values={
      ...values,
      limit:limit,
      offset:offset
    };
    dispatch(fetchAuthority(values)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({loading:false})
      }else{
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
    ////console.log(pagination, filters, sorter)
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
        ////console.log('receive form value',values)
        this.setState({modalLoad:true})
        ////console.log('value',values)
        if(this.state.itemId == null){
          this.form.resetFields()

          dispatch(newAuthority(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }else{
          dispatch(altAuthority(this.state.itemId,values)).then(e=>{
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
    dispatch(fetchAuthorityInfo(id)).then(e=>{
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
    dispatch(fetchAuthorityInfo(id)).then(e=>{
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

  handleChangeLdap=(v)=>{
    const {dispatch} = this.props;
    if(v.length>2){
      let json = {
        cn:v
      }
      dispatch(fetchLdap(json)).then(e=>{
        if(e.payload&&e.payload.length ===1) {
          let item = e.payload[0]
          let obj = {
            ...item,
            name: item.cn,
          }
          this.form.setFieldsValue(obj)
        }
      })
      this.forceUpdate()
    }
  }


  handleModal_t=()=>{
    const {dispatch,authorityInfo} = this.props;
    this.setState({modalTLoad:true})
    let _record = authorityInfo.toJS()
    let action =_record.status==1?'disable':'enable'
    let json = {
      ..._record,
      status:_record.status==1?0:1
    }
    dispatch(altAuthority(action,this.state.itemId,json)).then(e=>{
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
        <Button onClick={()=>{this.setState({modal:true,itemId:null})}} type='primary'>{formatMessage({id:'new_btn'})}</Button>
      </Col>
    )
  };

  render(){
    const {intl:{formatMessage},location:{pathname},ldapDep,count,authority,authorityInfo,roles,ldap} = this.props;
    const { loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage,gadUser} = this.state
    //console.log('state',this.state)
    //console.log('ldap',ldap)
    const columns = [
      {dataIndex:_autT.id,render: text => <a onClick={this.billDetails.bind(this,text)}>{text}</a>,},
      {dataIndex:_autT.name},
      {dataIndex:_autT.department},
      {dataIndex:_autT.title},
      {dataIndex:_autT.GADUsr},
      {dataIndex:_autT.mail},
      {dataIndex:_autT.telephoneNumber},
      {dataIndex:_autT.roles,render:text =>(
        <div>
          {text&&text.map(v=><p style={{margin:0}}>{v.get('name')}</p>)}
        </div>
      )},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`authority_${item.dataIndex}`}),
      })
    );

    const formColumns = [
      {dataIndex:_autT.id,FormTag:
    <Select
      mode="combobox"
      notFoundContent="Not found"
      showArrow={false}
      allowClear={true}
      optionFilterProp="children"
      onChange={this.handleChangeLdap}
      filterOption={false}
      defaultActiveFirstOption={false}
    >
      {typeof(ldap)=='undefined'?null:ldap.toJS().map(v=><Option  key={v.cn} value={v.cn}>{v.cn}</Option>)}
    </Select>},
      {dataIndex:_autT.name},
      {dataIndex:_autT.department},
      {dataIndex:_autT.title},
      {dataIndex:_autT.mail},
      {dataIndex:_autT.telephoneNumber},
      {dataIndex:_autT.roles,FormTag:
        <Select placeholder="Please select" allowClear={true}  mode="multiple">
          {roles&&roles.toJS().map(v=><Option  key={v.id} value={v.id}>{v.id}</Option>)}
        </Select>},
      {dataIndex:_autT.managerUsr,FormTag:
        <Select
          showSearch
          placeholder="Please select"
          optionFilterProp="children"
          allowClear={true}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {authority&&authority.toJS().map(v=><Option  key={v.id} value={v.id}>{v.id}</Option>)}
        </Select>},
      {dataIndex:_autT.GADUsr,FormTag:
        <Select placeholder="Please select" allowClear={true} >
          {gadUser&&gadUser.map(v=><Option  key={v.id} value={v.id}>{v.id}</Option>)}
        </Select>},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`authority_${item.dataIndex}`}),
      })
    );


    const renderForm=(v,column)=>{
      //console.log('form',v)
      if(v === undefined || v==='') return

      if(column.trans){
        return column.trans(v,column.config)
      }else if(column.format){
        return column.format(v).map((t,i)=>(
          <Row key={i} >
            {t}
          </Row>
        ))
      }else if(column.render){
        return column.render(v)
      }else{
        return v
      }
    }

    const columnMap=column=>{
      //console.log(authorityInfo)
      let bold = column.bold
      let text
      if(authorityInfo){
        text=column.deep?authorityInfo.getIn(column.deep):authorityInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item'>
          <Col span={12}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`placed_to_${column.dataIndex}`})}</Col>
          <Col span={12}  className="payment-value" style={bold&&{fontWeight:"bold"}}>{
            renderForm(text,column)
          }</Col>
        </Col>
      )};

    this.formColumns=[
      {dataIndex:'id_like',formTag:'input'},
      {dataIndex:'department_like',type:'selectSearch',selectOption:ldapDep?ldapDep:[],placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'GADusr_like',type:'selectSearch',selectOption:Immutable.fromJS(gadUser),placeholder:formatMessage({id:'pleaseSelect'})},
      {dataIndex:'telephoneNumber',formTag:'input',props:{placeholder:'Extension number'}},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    this.expandColumns=[
      {dataIndex:'title_like',formTag:'input'},

    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`search_${item.dataIndex}`}),
      })
    )

    let searchProps={
      formColumns:this.formColumns,
      onSave:this.onFetch,
      rightContent:this.getcontent(),
      limit:99999,
      expand:true,
      expandForm:this.expandColumns
    };

    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.authority_management}`})} />
        <TopSearch  {...searchProps} />
        <ImmutableTable
          loading={loading}
          columns={columns}
          dataSource={authority}
          rowKey={record =>record.get("id")}
          pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
          //onChange={this.changeTable}
        />
        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false,itemId:null,slideList:[]})}
          title={formatMessage({id:'newInfo'})}
          onOk={this.handleModal}
          maskClosable={false}
          width={600}
        >
          <Spin  spinning={ modalLoad } tip="creating..." >
            <Row>
              <SimpleForm columns={ formColumns } initial={itemId==null?Immutable.fromJS([]):authorityInfo} colSpan={24} labelCol={{span:7}} ref={f=>this.form=f} />
            </Row>
          </Spin>
        </Modal>
      </Row>
    )
  }

}


Authority.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  authority : state.getIn(['authorityManagement','authority']),
  count : state.getIn(['authorityManagement','count']),
  roles : state.getIn(['authorityManagement','roles']),
  ldap : state.getIn(['authorityManagement','ldap']),
  ldapDep : state.getIn(['authorityManagement','ldapDep']),
  authorityInfo: state.getIn(['authorityManagement','authorityInfo']),
});

export default injectIntl(connect(mapStateToProps)(Authority))


//const WrappedSystemUser = Form.create()();



