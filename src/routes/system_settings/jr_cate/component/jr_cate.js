/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Switch,Tabs,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {jrCate,jrLevel,rootPath,systemStatus,host,titles as _tit ,jr_tableField as _jrT} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchJr,newJr,altJr } from '../modules/jr_cate'
const Option = Select.Option;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

class JrPage extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      search1: false,
      search2: false,
      search3: false,
      loading : false,
      searchText1: '',
      searchText2: '',
      searchText3: '',
      filtered: false,
      modalLoad:false,

    }
  }
  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    let json = {
      limit:999,
      offset:0
    }
    dispatch(fetchJr(json)).then((e)=>{
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
    dispatch(fetchJr(values)).then((e)=>{
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
        this.setState({modalLoad:true})

          dispatch(newJr(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false})
            }else{
              this.setState({modalLoad:false,modal:false})
              this.form.resetFields()
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }

    });
  };



  billDetails=(id,e)=>{
    const {dispatch} = this.props;
    console.log('-----',id)
    dispatch(pathJump('/jr_details/'+id))
  }

  //handleStatus=(status,id)=>{
  //  const {dispatch} = this.props;
  //  this.setState({loading:true})
  //  dispatch(fetchProductInfo(id)).then(e=>{
  //    //console.log("eeee",e)
  //    if(e.payload){
  //      let _Arr=[];
  //      _Arr.push({
  //        uid: e.payload.logo,
  //        status: 'done',
  //        percent: 100,
  //        url: e.payload.logo,
  //      });
  //      this.setState({slideList:_Arr})
  //      this.setState({itemId:id,status:status==1,modal_t:true})
  //      this.setState({loading:false})
  //    }else{
  //      this.setState({loading:false})
  //      message.error(e.error.message)
  //    }
  //  })
  //}


  handleModal_t=()=>{
    const {dispatch,jrInfo,intl:{formatMessage}} = this.props;
    this.setState({modalTLoad:true})
    let _record = jrInfo.toJS()
    let action =_record.status===1?'disable':'enable'
    let json = {
      ..._record,
      status:_record.status===1?0:1
    }
    dispatch(altPlacedTo(action,this.state.itemId,json)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:null,modal_t:false,currentPage:1})
        this.setState({modalTLoad:false})
        message.success(_record.status===1?formatMessage({id:'abandonSuccess'}):formatMessage({id:'enabledSuccess'}))
      }else{
        this.setState({modalTLoad:false})
        message.error(e.error.message)
      }
    })
  };

  beforeUpload=(file)=> {
    const isJPG = file.type === 'image/jpeg'||file.type ==='image/png';
    if (!isJPG) {
      message.error('You can only upload JPG or PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error('Image must smaller than 5MB!');
    }
    return isJPG && isLt2M;
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  jrFlowStatus=()=>{
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
      name_like:this.state.searchText1,
      code:this.state.searchText2,
      'jr.clientId':this.state.searchText3
    }

    this.setState({loading:true,
      [state]: false,
    })

    dispatch(fetchProduct(json)).then((e)=>{
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

  switchFun=(id,v)=>{
    const {dispatch} = this.props
    let json = {
      JRTypeLevel:v?'Default':'Others'
    }
    this.setState({loading:true})
    dispatch(altJr(id,json)).then((e)=>{
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


  render(){
    const {intl:{formatMessage},location:{pathname},count,jr,jrInfo} = this.props;
    const { searchText1,searchText2,searchText3,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    //console.log('state',this.state)

    const columns = [
      {dataIndex:_jrT.id,},
      {dataIndex:_jrT.JRTypeLevel,render:(text,record)=><Switch  checked={text&&text==='Default'} checkedChildren="Default" unCheckedChildren="Others" onChange={this.switchFun.bind(this,record&&record.get('id'))} />}
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`jr_${item.dataIndex}`}),
      })
    );

    const formColumns = [
      {dataIndex:_jrT.id,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_jrT.JRTypeCategory,FormTag:
      <Select>
        {jrCate.map(v=><Option key={v}>{v}</Option>)}
      </Select>,option: { rules: [{ required: true, message: 'Please select category' }] }},
      {dataIndex:_jrT.JRTypeLevel,FormTag:
        <Select>
          {jrLevel.map(v=><Option key={v}>{v}</Option>)}
        </Select>,option: { rules: [{ required: true, message: 'Please select level' }] }},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`jr_${item.dataIndex}`}),

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
      //console.log(jrInfo)
      let bold = column.bold
      let text
      if(jrInfo){
        text=column.deep?jrInfo.getIn(column.deep):jrInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item' style={column.style}>
          <Col span={12}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`placed_to_${column.dataIndex}`})}</Col>
          <Col span={12}  className="payment-value" >{
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

    return (
      <Row>
        <Title title={formatMessage({id:`${_tit.jr_cate}`})} />
        <Row style={{marginTop:61}}>
          <Button onClick={()=>this.setState({modal:true})} style={{marginBottom:10,backgroundColor:'#00c1de',color:"#fff",border:0}} >{formatMessage({id:'new_btn'})}</Button>
          <Row >
            <Tabs defaultActiveKey="main">
              <TabPane tab="Main Category" key="main">
                <ImmutableTable
                  loading={loading}
                  columns={columns}
                  dataSource={jr&&jr.filter((e)=>{return e.get('JRTypeCategory') === 'MainCategory'})}
                  rowKey={record =>record.get("id")}
                  //pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
                  //onChange={this.changeTable}
                  style={{width:300}}
                />
              </TabPane>
              <TabPane tab="Sub Category" key="sub">
                <ImmutableTable
                  loading={loading}
                  columns={columns}
                  dataSource={jr&&jr.filter((e)=>{return e.get('JRTypeCategory') === 'SubCategory'})}
                  rowKey={record =>record.get("id")}
                  //pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
                  //onChange={this.changeTable}
                  style={{width:300}}
                />
              </TabPane>
            </Tabs>
          </Row>

          <Modal
            visible={modal}
            onCancel={()=>this.setState({modal:false})}
            title={formatMessage({id:'create'})}
            onOk={this.handleModal}
            maskClosable={false}
            width={500}
          >
            <Spin  spinning={ modalLoad } tip="Creating..." >
              <Row>
                <SimpleForm columns={ formColumns }  colSpan={24} labelCol={{span:7}} ref={f=>this.form=f} />
              </Row>
            </Spin>
          </Modal>
        </Row>
      </Row>
    )
  }
}


JrPage.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  jr : state.getIn(['jr','jr']),
  count : state.getIn(['jr','count']),
  jrInfo: state.getIn(['jr','jrInfo']),
});

export default injectIntl(connect(mapStateToProps)(JrPage))


//const WrappedSystemUser = Form.create()();



