/**
 * Created by Yurek on 2017/7/11.
 */

import React from 'react'
import { injectIntl } from 'react-intl'
import { Badge,Row , message , Spin ,Button ,Pagination,Modal,Col,Select,Input ,DatePicker,Upload,Icon ,Tooltip   } from  'antd'
import { connect } from 'react-redux'
import {ImmutableTable} from '../../../../../components/antd/Table'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SimpleForm from '../../../../../components/antd/SimpleForm'
import {Link} from 'react-router'
import { pathJump } from '../../../../../utils/'
import TopSearch from '../../../../../components/search/topSearch'
import Title from '../../../../../components/title/title'
import {currency,rootPath,systemStatus,host,titles as _tit ,product_tableField as _prodT} from '../../../../../config'
import {WORLD_COUNTRY} from '../../../../../country_config'
import Immutable from 'immutable'
import {formatDate,formatMoney,configDirectory,configDirectoryObject,configCate,renderPic} from '../../../../../utils/formatData'
import {getFormRequired} from '../../../../../utils/common'
import { fetchProductInfo,newProduct,altProduct } from '../modules/product_details'
import {fetchClient } from '../../../client/modules/client'
const Option = Select.Option;
const Search = Input.Search;


class ProductInfoPage extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      loading : false,
      form:true

    }
  }


  componentWillMount(){
    const {dispatch,params,location} = this.props;
    //console.log('this.props',this.props)
    this.setState({loading:true});
    dispatch(fetchClient())

    if(params.id ==='new'){
      this.setState({loading: false,form:true})
    }else{
      this.setState({form:false})
      dispatch(fetchProductInfo(params.id)).then((e)=>{
        if(e.error){
          message.error(e.error.message);
        }else{
          this.setState({loading: false})
        }
      });
    }

  }


  getRequiredMessage=(e,type)=>{
    return getFormRequired(this.props.intl.formatMessage({id:'input_require'},{name:e}),type)
  };

  handleModal=(t)=>{
    const {dispatch,params,intl:{formatMessage}} = this.props;
    this.form.validateFields((err, values) => {
      if (!err) {
        //console.log('receive form value',values)
        this.setState({loading:true})
        //console.log('value',values)
        if(params.id === 'new'){
          values = {
            ...values,
            operation:t
          }
          dispatch(newProduct(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({loading:false})
            }else{
              this.setState({loading:false})
              message.success(formatMessage({id:'save_ok'}))
              dispatch(pathJump('/product'))
            }
          })
        }else{
          values = {
            ...values,
            operation:t
          }
          dispatch(altProduct(params.id,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
              this.setState({loading:false})
            }else{
              this.setState({loading:false})
              message.success(formatMessage({id:'save_ok'}))
              dispatch(pathJump('/product'))
            }
          })
        }
      }
    });
  };



  billDetails=(id)=>{
    const {dispatch} = this.props;
    this.setState({loading:true})
    dispatch(fetchProductInfo(id)).then(e=>{
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
    dispatch(fetchProductInfo(id)).then(e=>{
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
    const {dispatch,productInfo,intl:{formatMessage}} = this.props;
    this.setState({modalTLoad:true})
    let _record = productInfo.toJS()
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

  productFlowStatus=()=>{
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


  onSearch=(state,e)=>{
    const {dispatch} = this.props;
    let json = {
      //[key]:this.state[value],
      name_like:this.state.searchText1,
      code:this.state.searchText2,
      'product.clientId':this.state.searchText3
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
    const {params,intl:{formatMessage},location:{pathname},count,product,productInfo,client} = this.props;
    const { form,searchText1,searchText2,searchText3,loading ,currentPage ,modal ,modalLoad ,itemId ,modal_t,status,modalTLoad ,slideList,previewVisible,previewImage} = this.state
    //console.log('state',this.state)

    const formColumns = [
      {dataIndex:_prodT.name, option:this.getRequiredMessage(formatMessage({id:'required_fields'}))},
      {dataIndex:_prodT.currencyId,FormTag:
        <Select>
          {currency.map(v=><Option key={v} >{v}</Option>
          )}
        </Select>,option: { rules: [{ required: true, message: 'Please select' }] }},
      {dataIndex:_prodT.clientId,deep:['product','clientId'],FormTag:
        <Select
          onChange={this.setCreditTerm}
          allowClear={true}
          showSearch
          placeholder={formatMessage({id:'pleaseSelect'})}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {client&&client.map(v=>(
            v.get('validFlag')==='Y'&&<Option key={v.get('id')} value={v.get('id')} >{v.get('id')}</Option>
          ))}

        </Select>,option:{rules: [{ required: true, message: 'Please select' }]}},

      {dataIndex:_prodT.validDate,FormTag:<DatePicker />,option: { rules: [{ required: true, message: 'Please select' }] }},
      {dataIndex:_prodT.contactName},
      {dataIndex:_prodT.title},
      {dataIndex:_prodT.phoneNum},
      {dataIndex:_prodT.email},
      {dataIndex:_prodT.faxNum},
    ].map(
      item=>({
        ...item,
        title:formatMessage({id:`product_${item.dataIndex}`}),
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
      //console.log(clientPOInfo)
      let bold = column.bold
      let text
      if(productInfo){
        text=column.deep?productInfo.getIn(column.deep):productInfo.get(column.dataIndex)
      }else{
        text= ''
      }

      return (
        <Col key={column.dataIndex} span={column.span || 8 } className='payment-item'>
          <Col span={8}  className="payment-label" style={{color:'#999'}}>{formatMessage({id:`product_${column.dataIndex}`})}</Col>
          <Col span={16}  className="payment-value" style={{color:'#333333',...bold&&{fontWeight:"bold"}}}>{
            renderForm(text,column)
          }</Col>
        </Col>
      )};

    const rightContent = params.id==='new'?null:<Row style={{margin:'23px 0',marginLeft:15}} className="inv-badge">
      <Badge status="processing"   text={productInfo&&formatMessage({id:productInfo&&productInfo.getIn(['product','flowStatus'])})} />
    </Row>

    return (
      <Row>
        <Title rightContent={productInfo&&rightContent} title={params.id==='new'?formatMessage({id:'newProduct'}):productInfo&&productInfo.get('name')} />
        <Row style={{marginTop:61}}>
          {form&&<Spin  spinning={ loading } tip="creating..." >
            <Row>
              <SimpleForm columns={ formColumns } initial={params.id==='new'?Immutable.fromJS([]):productInfo} colSpan={12} labelCol={{span:7}} ref={f=>this.form=f} />
            </Row>
            <Row  style={{marginTop:40,textAlign:'center'}}>
              {<Button onClick={this.handleModal.bind(this,'submit')} type='primary' size="large" style={{marginRight:10}}>{formatMessage({id:'new_submit_btn'})}</Button>}
              {<Button onClick={this.handleModal.bind(this,'save')}  size="large" style={{marginRight:10}}>{params.id==='new'?formatMessage({id:'new_btn'}):formatMessage({id:'save_btn'})}</Button>}
              <Button onClick={()=>{const {dispatch} = this.props ;dispatch(pathJump('/product'))}}  size="large">{formatMessage({id:'cancel'})}</Button>
            </Row>
          </Spin>}
          {!form&&<Row >
            <Row className="payment-read">
              {formColumns.map(columnMap)}
            </Row>
            <Row  style={{marginTop:40,textAlign:'center'}}>
              {productInfo&&productInfo.getIn(['product','flowStatus'])!=='submitted'&&<Button onClick={()=>this.setState({form:true})} type='primary' size="large" style={{marginRight:10}}>{formatMessage({id:'edit'})}</Button>}
              <Button onClick={()=>{const {dispatch} = this.props ;dispatch(pathJump('/product'))}}  size="large">{formatMessage({id:'cancel'})}</Button>
            </Row>
          </Row>}
        </Row>
      </Row>
    )
  }
}




ProductInfoPage.propTypes = {
  pathJump : React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  //product : state.getIn(['product','product']),
  productInfo: state.getIn(['productInfo','productInfo']),
  client : state.getIn(['client','client']),
});

export default injectIntl(connect(mapStateToProps)(ProductInfoPage))


//const WrappedSystemUser = Form.create()();



