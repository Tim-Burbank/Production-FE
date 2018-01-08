/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker ,Menu,Tooltip,Icon,Upload  } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../utils/'
import moment from 'moment';
import TopSearch from '../../../../components/search/topSearch'
import Title from '../../../../components/title/title'
import {titles as _tit ,message_tableField as _mesT,personInfo_tableField as _perT,host} from '../../../../config'
import {WORLD_COUNTRY} from '../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate} from '../../../../utils/formatData'
import {getFormRequired} from '../../../../utils/common'
import { fetchMessages ,altMessages ,fetchPersonalInfo,delSign } from '../modules/personal_information'
import { fetchClientInfo } from '../../../system_settings/client/modules/client'
const Option = Select.Option;
const Search = Input.Search;
const confirm = Modal.confirm;
import './personal_information.scss'





class PersonalInformation extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      loading : false,
      currentPage:1,
      modal:false,
      picModal:false,
      slideList:[],
      delPicModal:false,
      delPicLoad:false,
      selectedNum:[],
      count:0,
      userInfo:null
    }
  }

  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('lololololo',window.sessionStorage)
    //console.log('this.props',this.props)
    this.setState({loading:true});
    let per_info = JSON.parse(window.sessionStorage.ifLogin)
    //console.log('perperper',per_info)
    this.setState({userInfo:per_info.obj})
    dispatch(fetchPersonalInfo(per_info.obj.id)).then(
      dispatch(fetchMessages()).then((e)=>{
        if(e.error){
          message.error(e.error.message);
        }else{
          this.setState({
            loading: false,
            count:e.payload.count,
          })
        }
      })
    )
  }



  onFetch = (values,limit,offset,cur=1,p) =>{
    this.setState({ loading:true,currentPage:cur });
    const { dispatch } = this.props;
    values={
      ...values,
      limit:limit,
      offset:offset
    };
    dispatch(fetchRequisition(values)).then((e)=>{
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

  submitModal = (v) => {
    const {dispatch,params,intl:{formatMessage}} = this.props;

    this.setState({modalLoad:true})
    let json = {
      operation:v,
      remark:this.state.comments,
      cartesisCode:this.state.cartesis,
      code:this.state.adpCode,
    }
    dispatch(altRequisition(this.state.record.get('id'),json)).then(e=>{
      if(e.error){
        message.error(e.error.message)
        this.setState({modalLoad:false,itemId:null})
      }else{
        this.setState({modalLoad:false,modal:false,itemId:null,currentPage:1,comments:null,cartesisCode:'',code:''})
        message.success(formatMessage({id:'save_ok'}))
      }
    })
  }

  handleModal=(v)=>{
    const {dispatch,params,intl:{formatMessage}} = this.props;
    let _sub = this.submitModal
    //console.log('agree',v)
    if(v === 'disagree'){
      if(this.state.comments == null){
        message.error(formatMessage({id:'comments_tip'}))
      }
    }else if(v === 'agree'){
      if(this.state.adpCode.length ===0||this.state.cartesis.length ===0) {
        message.error(formatMessage({id:'code_tip'}))
      }else{
        confirm({
          title: formatMessage({id:'cfmCode_title'}),
          content: <div>
            <p><span>Adept Code : </span><span>{this.state.adpCode}</span></p>
            <p><span>Cartesis : </span><span>{this.state.cartesis}</span></p>
          </div>,
          onOk() {
            _sub(v)
          }
        });
      }
    }

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

  handleSlideChange = ({ fileList }) => this.setState({ slideList:fileList })


  billDetails=(id,record)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchClientInfo(id)).then(e=>{
      //console.log("eeee",e)
      if(e.payload){
        this.setState({itemId:id,action_state:record.get('action'),flowStatus_state:record.get('applyStatus'),record:record})
        this.setState({loading:false})
        this.setState({modal:true})
      }else{
        this.setState({loading:false})
        message.error(e.error.message)
      }
    })
  }

  handleSave = ()=>{
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

  handleDelPic=(id)=>{
    const {dispatch} = this.props;
    let json = {
      id:id
    }
    this.setState({delPicLoad:true})
  dispatch(delSign(json,this.state.userInfo.id)).then(e=>{
    if(e.payload){
      this.setState({delPicLoad:false})
    }
  })
  }

  handleClick=(e)=>{
    const {dispatch,params,location} = this.props;
    //console.log('click ', e);
    this.setState({load:true});
    this.setState({
      current: e.key,
    });
    let json;

    if(e.key == 'pending'){
      json = {
        applyStatus:'waitToHandle',
        limit:13,
        offset:0
      }
    }else if(e.key == 'processing'){
      json = {
        applyStatus:'handling',
        limit:13,
        offset:0
      }
    }else{
      json = {
        applyStatus:'handled',
        limit:13,
        offset:0
      }
    }
    dispatch(fetchRequisition(json)).then((e)=>{
      if(e.error){
        message.error(e.error.message);
        this.setState({load:false})
      }else{
        this.setState({load:false})
      }
    });
  }
  renderSign = (v) => {
    const {intl:{formatMessage}} = this.props;
    //console.log('too',v)
    return (<span>
      {v.map((a,i)=>(
          <span >
          <div style={{display:'inline-block',marginRight:'15px'}}><Tooltip key={i} title={<img src={a.get('filePath')}/>}><span style={{color:'#00c1de'}} >{i+1}</span></Tooltip></div>
      </span>
        )
      )}
      <Button onClick={()=>{this.setState({picModal:true,slideList:[]})}} style={{marginRight:'10px'}}  size="small">{formatMessage({id:'upload_sign'})}</Button>
      {v.toJS().length>0&&<Button onClick={()=>{this.setState({delPicModal:true})}} style={{marginRight:'10px'}}  size="small">{formatMessage({id:'handleSign'})}</Button>}
    </span>)
  }

  handlePicModal=()=>{
    const {dispatch} = this.props
    console.log(293,this.state.slideList)
    dispatch(fetchPersonalInfo(this.state.userInfo.id)).then(()=>{this.setState({picModal:false})})
  }



  readMsg=(text,id)=>{
    const {dispatch} = this.props;
    let _arr = [];
    _arr.push(id)
    let json ={
      id_in:_arr
    }
    dispatch(altMessages(json))
    this.setState({message_de:text,modal:true})


  }


  renderRow=(record, index)=>{
    //console.log('row',record,index)
    if(record.get('readFlag')==='N'){
      return 'unread'
    }else{
      return 'read'
    }
  }


  readYet=()=>{
    const {dispatch,messages,intl:{formatMessage}} = this.props;
    let arr= [];
    //console.log(messages.toJS())
    let _msg = messages.toJS()
    if(this.state.selectedNum.length === 0){
      return message.warning(formatMessage({id:'noSelect'}));
    }else{
      this.state.selectedNum.map(v=>{
        arr.push(_msg[v]['id'])
      })
      let json = {
        id_in:arr
      }
      dispatch(altMessages(json)).then(()=>this.setState({selectedNum:[]}))
    }
  }

  render(){
    const {intl:{formatMessage},location:{pathname},count,messages,personalInfo} = this.props;
    const { selectedNum,loading ,currentPage,delPicLoad,modal,message_de,picModal ,slideList,previewImage,previewVisible,delPicModal} = this.state
    //console.log('state',this.state)
    //console.log('propp',this.props)
    const columns = [
      {dataIndex:_mesT.readFlag,render:(text)=>(<p>{text==='N'?<img style={{width:18,paddingTop:3}} src={require("../../../../../public/mail1.png")} />:<img style={{width:18,paddingTop:3}} src={require("../../../../../public/mail2.png")} />}</p>)},
      {dataIndex:_mesT.msg,render:(text,record)=>(<p style={record.get('readFlag')==='N'?{color:'#333',cursor:'pointer'}:{color:'#999',cursor:'pointer'}} onClick={this.readMsg.bind(this,text,record.get('id'))} >{text}</p>)},
      {dataIndex:_mesT.createdAt,render:(text,record)=>(<p style={record.get('readFlag')==='N'?{color:'#999'}:{color:'#999'}} >{text}</p>)},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`messages_${item.dataIndex}`}),
      })
    );

    const column = [
      {dataIndex:_perT.id},
      {dataIndex:_perT.name},
      {dataIndex:_perT.department},

      {dataIndex:_perT.title},
      {dataIndex:_perT.mail},
      {dataIndex:_perT.telephoneNumber},
      {dataIndex:_perT.signatures,render:this.renderSign},
    ];

    const renderForm=(v,column)=>{
      //console.log('form',v)
      if(v == undefined || v=='') return

      if(column.trans){
        return column.trans(v,column.config)
      }else if(column.render){
        return column.render(v)
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

    const Selection = {
      selectedRowKeys:selectedNum,
      onChange: (selectedRowKeys, selectedRows) => {
        //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({selectedNum:selectedRowKeys});
        this.setState({selectedRows:selectedRows})
      }
    };




    const columnMap=column=>{
      let bold = column.bold
      let text
      if(personalInfo){
        text=column.deep?personalInfo.getIn(column.deep):personalInfo.get(column.dataIndex)
      }else{
        text= ''
      }

      return (
        <Col key={column.dataIndex} span={column.span || 24} style={{ padding: 13,borderBottom:'1px solid #d7d7d7'}}>
          <span   className="payment-label">{formatMessage({id:`personalInfo_${column.dataIndex}`})}</span>
          <span   className="payment-value" style={bold&&{fontWeight:"bold"}}>{
            renderForm(text,column)
          }</span>

        </Col>
      )};

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <Row style={{position:'relative',height:'100vh'}}>
        <Title title={formatMessage({id:`${_tit.personal_information}`})} />
        <Row style={{marginBottom:10,marginTop:61}}>
          <Button  disabled={selectedNum.length===0} style={{marginTop:13}} onClick={this.readYet}>{formatMessage({id:'readYet'})}</Button>
        </Row>
        <ImmutableTable
          loading={loading}
          style={{width:'72%'}}
          rowSelection={Selection}
          columns={columns}
          dataSource={messages}
          pagination={{ pageSize: 20,total:count ,showQuickJumper:count>20,showTotal:total => `Total ${total} items , Each page : 20  items` }}
          //onChange={this.changeTable}
          bordered={false}
          rowClassName={this.renderRow}
        />


        <Row className="payment-read person" >
          <p style={{fontSize:16,color:'#333',borderLeft:'4px solid #6d7781',borderBottom:'1px solid #d7d7d7',padding:'9px 22px',backgroundColor:'#F5f6FA'}}>{formatMessage({id:'personInfo_title'})} </p>
          {column.map(columnMap)}
        </Row>
        <Modal
          visible={modal}
          onCancel={()=>this.setState({modal:false})}
          title={formatMessage({id:'message'})}
          footer={null}
          maskClosable={false}
        >
          <Row style={{marginBottom:50}}>
              <Col span="24">
                <p style={{textIndent:'2rem',lineHeight:'24px'}}>{message_de}</p>
              </Col>
          </Row>
        </Modal>
        <Modal
          visible={delPicModal}
          onCancel={()=>this.setState({delPicModal:false})}
          title={formatMessage({id:'handleSign'})}
          footer={null}
          maskClosable={false}
          style={{overflow:'auto'}}
        >
          <Spin  spinning={delPicLoad} tip="Processing" >
            <Row style={{marginTop:50,paddingBottom:50,display:'flex',justifyContent:'center',overflow:'auto'}}>
              {personalInfo&&personalInfo.get('signatures').map(v=>(
                <div style={{marginRight:15}}>
                  <img style={{width:200,height:200,display:'block'}} src={v.get('filePath')} />
                  <Button style={{marginLeft:75,marginTop:13}} onClick={this.handleDelPic.bind(this,v.get('id'))} type="danger" size="small">{formatMessage({id:'delete_btn'})}</Button>
                </div>
              )
              )}
            </Row>
          </Spin>
        </Modal>
        <Modal
          visible={picModal}
          onCancel={()=>this.setState({picModal:false})}
          title={formatMessage({id:'uploadSign'})}
          onOk={this.handlePicModal}
          maskClosable={false}
          width={500}
        >

          <Row style={{marginLeft:'39%'}}>
            <Upload
              listType="picture-card"
              action={`${host}/accounts/signature?target=signature&name=${personalInfo&&personalInfo.get('name')}`}
              beforeUpload={this.beforeUpload}
              onPreview={this.handlePreview}
              onChange={this.handleSlideChange}
              fileList={slideList}
              name='signature'
            >
              {slideList.length >= 1 ? null : uploadButton}
            </Upload>
          </Row>
        </Modal>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </Row>
    )
  }
}


PersonalInformation.propTypes = {
  pathJump : React.PropTypes.func,
};




const mapStateToProps = (state) => ({
  personalInfo : state.getIn(['personalInformation','personalInformation']),
  messages : state.getIn(['personalInformation','messages']),
  count : state.getIn(['personalInformation','count']),
});

export default injectIntl(connect(mapStateToProps)(PersonalInformation))





