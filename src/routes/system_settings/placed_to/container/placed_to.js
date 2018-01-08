/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {host,titles as _tit ,placed_to_tableField as _plaT} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic,getToolTip} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchPlacedTo ,newPlacedTo ,altPlacedTo ,fetchPlacedToInfo } from '../modules/placed_to'
const Option = Select.Option;
const Search = Input.Search;
const { TextArea } = Input;

class PlacedTo extends React.Component{
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
      count:0
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
    dispatch(fetchPlacedTo(json)).then((e)=>{
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
    dispatch(fetchPlacedTo(values)).then((e)=>{
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
            logo:values["logo"].file.response.obj
          }
          dispatch(newPlacedTo(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null,slideList:[]})
              message.success(formatMessage({id:'save_ok'}))
            }
          })
        }else{
          values = {
            ...values,
            logo:values["logo"].file.response.obj
          }
          dispatch(altPlacedTo(this.state.itemId,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({modalLoad:false,itemId:null})
            }else{
              this.setState({modalLoad:false,modal:false,itemId:null,currentPage:1,slideList:[]})
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
    dispatch(fetchPlacedToInfo(id)).then(e=>{
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
    dispatch(fetchPlacedToInfo(id)).then(e=>{
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
    const {dispatch,placedToInfo,intl:{formatMessage}} = this.props;
    this.setState({modalTLoad:true})
    let _record = placedToInfo.toJS()
    let action =_record.status==1?'disable':'enable'
    let json = {
      ..._record,
      status:_record.status==1?0:1
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

  //handleSlideChange = (file) =>{
  //  //console.log(file)
  //  file.fileList.map(v=>{
  //    if(v.status=='done'){
  //      if(v.response){
  //        this.setState({slideList:v.response.Location})
  //      }
  //    }
  //  });
  //  this.setState({slideList:file.fileList})
  //};

  handleSlideChange = ({ fileList }) => this.setState({ slideList:fileList })

  getcontent=()=>{
    const {intl:{formatMessage}} = this.props
    return (
      <Col>
        <Button onClick={()=>{this.setState({modal:true,itemId:null})}} type='primary'>{formatMessage({id:'new_btn'})}</Button>
      </Col>
    )
  };


  render(){
    const {intl:{formatMessage},location:{pathname},count,placedTo,placedToInfo} = this.props;
    const { loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    //console.log('state',this.state)
    const columns = [
      {
        dataIndex: _plaT.id,
        fixed:'left',
        width: 150,
        render: text => <a onClick={this.billDetails.bind(this, text)}>{text}</a>,
      },
      {dataIndex:_plaT.nameEN},
      {dataIndex:_plaT.nameCN},
      {dataIndex:_plaT.description,render:text=>getToolTip(text)},
      {dataIndex:_plaT.country,},
      {dataIndex:_plaT.city,},
      {dataIndex:_plaT.address,render:text=>getToolTip(text)},
      {dataIndex:_plaT.postCode,width: 150,},
      {dataIndex:_plaT.bankName,},
      {dataIndex:_plaT.bankAccount,},
      {dataIndex:_plaT.bankNum,},
      {dataIndex:_plaT.swiftCode,},
      {dataIndex:_plaT.logo,width:70,render: (text, record) => (
        <span>
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip title={<img src={text}/>}><span className='highlight'>{formatMessage({id:'check'})}</span></Tooltip></div>
      </span>)},
      {dataIndex:_plaT.status,width:70,render:text=><span style={text==1?{color:'green'}:{color:'red'}} >{text==1?formatMessage({id:'normal'}):formatMessage({id:'disabled'})}</span>},
      {
        dataIndex: _plaT.operation,
        fixed:'right',
        width:100,
        render: (text, record) => (
          <a onClick={this.handleStatus.bind(this,record.get('status'),record.get('id'))} >{record.get('status')==1?formatMessage({id:'toDisabled'}):formatMessage({id:'toNormal'})}</a>
        ),},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`placed_to_${item.dataIndex}`}),
      })
    );


    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    const formColumns = [
      {dataIndex:_plaT.id,props:{disabled:this.state.itemId!==null},option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_plaT.country,FormTag:
        <Select
          showSearch
          optionFilterProp="children"
          allowClear={true}
          placeholder="Country"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {WORLD_COUNTRY.map(v=><Option  key={v.name} value={v.name}>{v.name}</Option>)}
        </Select>,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_plaT.nameEN,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_plaT.city,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_plaT.nameCN,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_plaT.address,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_plaT.bankName,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_plaT.postCode},
      {dataIndex:_plaT.bankAccount,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},

      {dataIndex:_plaT.bankNum,option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_plaT.swiftCode},
      {dataIndex:_plaT.description,colSpan:24,form_style:{height:'100%'},FormTag:<TextArea placeholder="Description" rows={4}></TextArea>,style:{marginLeft:'-139px'}},
      {dataIndex:_plaT.logo,form_style:{height:225},FormTag:
        <Upload
          listType="picture-card"
          action={`${host}/common/upload`}
          beforeUpload={this.beforeUpload}
          onPreview={this.handlePreview}
          onChange={this.handleSlideChange}
          fileList={slideList}
          name='photo'
        >
          {slideList.length >= 1 ? null : uploadButton}
        </Upload>,render:renderPic},
    ].map(
      item=>({
        ...item,
        title: formatMessage({ id: `placed_to_${item.dataIndex}` }),
        width:item.width?item.width:150,
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
      //console.log(placedToInfo)
      let bold = column.bold
      let text
      if(placedToInfo){
        text=column.deep?placedToInfo.getIn(column.deep):placedToInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 24 } className='payment-item' style={column.form_style}>
          <span className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`placed_to_${column.dataIndex}`})}</span>
          <span  className="payment-value" >{
            renderForm(text,column)
          }</span>
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
        <Title title={formatMessage({id:`${_tit.placed_to}`})} />
        <TopSearch  {...searchProps} />
        <ImmutableTable
          loading={loading}
          columns={columns}
          dataSource={placedTo}
          rowKey={record =>record.get("id")}
          pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
          //onChange={this.changeTable}
          scroll={{x:2150}}
        />
        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false,itemId:null,slideList:[]})}
          title={formatMessage({id:'newInfo'})}
          onOk={this.handleModal}
          maskClosable={false}
          width={1000}
        >
          <Spin  spinning={ modalLoad } tip="creating..." >
            <Row>
              <SimpleForm columns={ formColumns } initial={itemId==null?Immutable.fromJS([]):placedToInfo} colSpan={12} labelCol={{span:7}} ref={f=>this.form=f} />
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={modal_t}
          title={status?formatMessage({id:'toDisabled'}):formatMessage({id:'toNormal'})}
          maskClosable={false}
          width={600}
          onCancel={()=>this.setState({modal_t:false,itemId:null})}
          footer={
          <Row>
          <Button onClick={()=>this.setState({modal_t:false,itemId:null})} >{formatMessage({id:'cancel'})}</Button>
          <Button type="danger" onClick={this.handleModal_t}>{status?formatMessage({id:'disableThis'}):formatMessage({id:'enableThis'})}</Button>
          </Row>
          }
        >
          <Spin  spinning={ modalTLoad } tip="creating..." >
            <Row className="payment-read">
              {formColumns.map(columnMap)}
            </Row>
          </Spin>
        </Modal>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </Row>
    )
  }

}

PlacedTo.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  placedTo : state.getIn(['placedTo','placedTo']),
  count : state.getIn(['placedTo','count']),
  placedToInfo: state.getIn(['placedTo','placedToInfo']),
});

export default injectIntl(connect(mapStateToProps)(PlacedTo))



//const WrappedSystemUser = Form.create()();



