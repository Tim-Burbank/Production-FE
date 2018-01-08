/**
 * Created by Maoguijun on 2017/10/14.
 */

import React, { PureComponent } from "react";
import { injectIntl } from "react-intl";
import {
  Badge,
  Timeline,
  Form,
  InputNumber,
  Radio,
  Row,
  message,
  Spin,
  Button,
  Pagination,
  Modal,
  Col,
  Select,
  Input,
  DatePicker,
  Upload,
  Icon,
  Tooltip,
  Menu,
  Tabs
} from "antd";
import { connect } from "react-redux";
import { ImmutableTable } from "../../../../../components/antd/Table";
import ImmutablePropTypes from "react-immutable-proptypes";
import SimpleForm from "../../../../../components/antd/SimpleForm";
import { Link } from "react-router";
import { pathJump, ifFin } from "../../../../../utils/";
import TopSearch from "../../../../../components/search/topSearch";

// import Title from "../../../../../components/title/title";

import SecondTitle from "../../../../../components/secondTitle/secondTitle";
import {
    host,
    titles as _tit,
    vendorDetail_tableField as _venDeT,
    venDetail_type as _clientPOType,
    currency as _cur,
    vendorTypeArr,
    location_,
    vendorFP_,
    taxRate,
    vendorType
} from '../../../../../config';
import { WORLD_COUNTRY } from "../../../../../country_config";
import Immutable from "immutable";
import {
  formatDate,
  formatMoney,
  configDirectory,
  configDirectoryObject,
  configCate,
  renderPic,
  divHundred,
  add,
  sub,
  mul,
  div
} from "../../../../../utils/formatData";
import { getFormRequired } from "../../../../../utils/common";
import {
  fetchVendorInfo,
  fetchVendor2Info,
  newVendor,
  updateVendor
} from "../../vendor_detail_edit/modules/vendor_detail_edit";
import { fetchRequisition ,newRequisition ,altRequisition ,fetchRequisitionInfo } from '../../../../personal_center/requisition/modules/requisition'
import "./vendor_detail_show_.scss";
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from "moment";
import '../../../../../components/antd/SimpleForm.css';

class VendorDetailShow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewImage: "",
      loading: false,
      currentPage: 1,
      modal: false,
      modalLoad: false,
      itemId: null,
      modal_t: false,
      status: false,
      modalTLoad: false,
      vendorType: "",
      location:"",
      vendorFP:"",
      flowStatus:"new_btn",
      flowStatus_state:"",
      comments:"",
      cartesis:"",
      adpCode:"",
    };
  }
  componentWillMount = () => {
    const { dispatch, params,location } = this.props;
    if(!location.search){
      dispatch(fetchVendorInfo(params.id)).then(e=>{
        if(e.payload){
          // console.log(118,e.payload.vendor.flowStatus)
          this.setState({
            flowStatus:e.payload.vendor.flowStatus
          })
        }
      })
    }else{
      dispatch(fetchVendor2Info(params.id)).then(e=>{
        if(e.payload){
          // console.log(118,e.payload.flowStatus)
          let pArr = location.search.split("&")
          console.log(105,location)
          console.log(pArr)
          this.setState({
            flowStatus:e.payload.flowStatus,
            flowStatus_state:pArr[1]
          })
        }
      })
    }
  };

  openPSD = v => {
    window.open(v);
  };

  submitModal = (v) => {
    const {dispatch,params,intl:{formatMessage}} = this.props;
    let json = {
      operation:v,
      remark:this.state.comments,
      cartesisCode:this.state.cartesis,
      code:this.state.adpCode,
      target:"vendor"
    }
    let requestFlag = JSON.parse(sessionStorage.getItem("requestFlag"))
    if(!requestFlag){
      message.error("请重新进入本页")
      return
    }
    console.log(requestFlag,json)
    dispatch(altRequisition(requestFlag.action,requestFlag.id,json)).then(e=>{
      if(e.error){
        message.error(e.error.message)
      }else{
        message.success(formatMessage({id:'save_ok'}))
        sessionStorage.setItem("requestFlag","")
      }
    })
  }

  //提交
  handleModal=(v)=>{
    const {dispatch,params,intl:{formatMessage}} = this.props;
    let _sub = this.submitModal
    console.log('agree',v)
    if(v === 'disagree'){
      if(this.state.comments == null){
        message.error(formatMessage({id:'comments_tip'}))
      }else{
        _sub(v)
      }
    }else if(v === 'agree'){
      if(this.state.flowStatus_state ==='toTypeInCode'){
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
      } else {
        _sub(v)
      }
    }
  };

  render() {
    const {
      intl: { formatMessage },
      location: { pathname,search },
      count,
      clientPO,
      vendorInfo,
      params,
      bankInfo
    } = this.props;
    const {
      currency,
      modalLoad,
      itemId,
      current,
      vendorType,
      location,
      filePath,
      vendorFP,
      flowStatus,
      flowStatus_state
    } = this.state;
    console.log("flowStatus",flowStatus)
    console.log("search",search)
    const { getFieldDecorator, getFieldValue } = this.props.form;

    console.log("state", this.state);
    console.log("props", this.props);
    console.log("vendorInfo", vendorInfo && vendorInfo.toJS());

    // Basic Info.
    const formColumns1 = [
      { dataIndex: _venDeT.nameEN },
      { dataIndex: _venDeT.nameCN },
      {
        dataIndex: _venDeT.contactPerson,
      },
      { dataIndex: _venDeT.title },
      { dataIndex: _venDeT.telephone },
      { dataIndex: _venDeT.email },
      { dataIndex: _venDeT.addressEN },
      { dataIndex: _venDeT.addressCN },
      {dataIndex: _venDeT.vendorType,},
      { dataIndex: _venDeT.fax },
      { dataIndex: _venDeT.location,},
      { dataIndex: _venDeT.vendorFP,},
      { dataIndex: _venDeT.taxRate,},
      {dataIndex: _venDeT.validDate,}
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` }),
    }));
    // Business Info
    const formColumns2 = [
      {
        dataIndex: _venDeT.natureOfBusiness,span:24,labelSpan:6,valueSpan:18
      },
      {
        dataIndex: _venDeT.currencyId,span:12,
      },
      {
        dataIndex: _venDeT.expectedValue,span:12,
      },
      {
        dataIndex: _venDeT.referral,span:24,labelSpan:6,valueSpan:18

      }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` }),
    }));
    // Bank Info
    const formColumns3 = [
      {
        dataIndex: _venDeT.companyName,
      },
      {
        dataIndex: _venDeT.currencyId,
      },
      { dataIndex: _venDeT.bankName },
      {
        dataIndex: _venDeT.bankAddress,
      },
      {
        dataIndex: _venDeT.accountNum,
        trans:(v,pat)=>{
          return v.replace(/\s/g, '').replace(pat,"$1 ")
        },
        config:/(.{4})/g
      },
      {
        dataIndex: _venDeT.accountAddress,
      },
      { dataIndex: _venDeT.swiftCode }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` })
    }));
    //4.1
    const formColumns4_1 = [
      {
        dataIndex: _venDeT.visitDate,
        trans:(value)=>moment(value).format("YYYY-MM-DD")
      },
      {
        dataIndex: _venDeT.visitor,
      },
      {
        dataIndex: _venDeT.visitFilePath,
        trans:(value)=>{
          return (<Button style={{marginTop:-4}} onClick={()=>this.openPSD(value)}>{"查看文件"}</Button>)
        }
      },
      {
        dataIndex: _venDeT.visitResult,span:24,labelSpan:3,valueSpan:21
      },
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` })
    }));
    //4.2
    const formColumns4_2 = [
      {
        dataIndex: _venDeT.capabilities,span:24,labelSpan:0,valueSpan:24,noLabel:true
      },
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` })
    }));
    //4.3
    const formColumns4_3 = [
      {
        dataIndex: _venDeT.conflictName,span:12
      },
      {
        dataIndex: _venDeT.conflictTitle,span:12
      },
      {
        dataIndex: _venDeT.relation,span:24,labelSpan:3,valueSpan:21
      },
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` })
    }));
    //4.4
    const formColumns4_4 = [
      {
        dataIndex: _venDeT.vendorCity,span:24,labelSpan:8,valueSpan:16
      },
      {
        dataIndex: _venDeT.officeInChina,span:24,labelSpan:8,valueSpan:16
      },
      {
        dataIndex: _venDeT.officeOutChina,span:24,labelSpan:8,valueSpan:16
      },
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` })
    }));
    //request
    const remarkColumns = [
      {
        dataIndex: _venDeT.remark,FormTag:<Input onChange={(e)=>{
          // console.log(360,e.target)
          this.setState({
            comments:e.target.value
          })
        }}/>
      },
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` }),
    }));
    const requestColumns = [
      {
        dataIndex: _venDeT.code,FormTag:<Input onChange={(e)=>{
          // console.log(360,e.target)
          this.setState({
            code:e.target.value
          })
        }}/>
      },
      {
        dataIndex: _venDeT.cartesisCode,FormTag:<Input onChange={(e)=>{
          // console.log(360,e.target)
          this.setState({
            cartesisCode:e.target.value
          })
        }}/>
      },
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` }),
    }));

    const filesUpload = [
      {
        dataIndex: "COBC",
      },
      { dataIndex: "BHD", title: "2. Signed/Chopped Blue Hive Declaration" },
      { dataIndex: "NDA", title: "3. Signed/Chopped Non-Disclosure Agreement" },
      { dataIndex: "BL", title: "4. Business License / Certificate" },
      { dataIndex: "AL", title: "5. Account License" }
    ].map(item=>({
      ...item,
      span:24,
      labelSpan:12,
      valueSpan:12,
      trans:(value)=>(<Button style={{marginTop:-3}} onClick={()=>this.openPSD(value)}>{"查看文件"}</Button>)
    }));
    const renderForm=(v,column)=>{
      if(column.trans){
        return column.trans(v,column.config)
      }else if(column.format){
        return column.format(v).map((t,i)=>(
          <Row key={i} >
            {t}
          </Row>
        ))
      }else{
        return v.toString()
      }
    }

    const columnMap=column=>{
      let bold = column.bold
      let text
      if(vendorInfo){
        text=column.deep?vendorInfo.getIn(column.deep):vendorInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 8 } className='payment-item'>
          {!column.noLabel&&<Col span={column.labelSpan||10}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`venDetail_${column.dataIndex}`})}</Col>}
          <Col span={column.valueSpan||14}  className="payment-value">{
            renderForm(text,column)
          }</Col>
        </Col>
      )
    }
    const bankMap=(column,obj={})=>{
      let bold = column.bold
      let text
      text = obj[column.dataIndex]||""
      return (
        <Col key={column.dataIndex} span={column.span || 12 } className='payment-item'>
          <Col span={column.labelSpan||10}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`venDetail_${column.dataIndex}`})}</Col>
          <Col span={column.valueSpan||14}  className="payment-value">{
            renderForm(text,column)
          }</Col>
        </Col>
      )
    }

    const labelCol = {
      xs: { span: 24 },
      sm: { span: 7 }
    };
    const wrapperCol = {
      xs: { span: 24 },
      sm: { span: 14 }
    };

    return (
      <Row style={{ paddingBottom: 100, position: "relative" }}>
        <SecondTitle
          title={<Row>
           <Col span={6}>{formatMessage({ id: `${_tit.vendor_detail_edit}` })}</Col>
           <Col span={6}>{vendorInfo&&vendorInfo.toJS().nameCN}</Col>
           <Col span={12}><span className="icon-span status"></span>{formatMessage({ id:flowStatus})}</Col>
          </Row>}
        />
        <Spin spinning={modalLoad} tip={formatMessage({ id: "loading" })}>
          <Row
            style={{
              width: "65%",
              minWidth: 1100,
              marginTop: 61,
              paddingBottom: 40,
              borderBottom: "1px solid #e9e9e9",
              position: "relative"
            }}
          >
            <Row
              className="payment-read"
              style={{ marginBottom: 20,border:0 }}
            >
              <p style={{ margin: "5px 0 10px 0", fontWeight: "bold",color:"#00c1de" }}>
                Basic Info.
              </p>
              <Col className="wrap">
                {formColumns1.map(columnMap)}
              </Col>
            </Row>
            <Row
              className="payment-read"
              style={{ marginBottom: 20, border:0  }}
            >
              <p style={{ margin: 5, fontWeight: "bold",color:"#00c1de" }}>Business Info. </p>
              <Col className="wrap">
                {formColumns2.map(columnMap)}
              </Col>
            </Row>
            <Row
              className="payment-read"
              style={{
                marginBottom: 20,
                paddingBottom: 20,
                border:0
              }}
            >
              <p style={{ margin: 5, fontWeight: "bold",color:"#00c1de" }}>Bank Info. </p>
                {bankInfo&&bankInfo.toJS().map(item=>{
                  return <Row className="wrap" style={{marginTop:8}}>
                  {formColumns3.map(value=>bankMap(value,item))}</Row>
                })}
            </Row>
            <Row
              className="payment-read"
              style={{
                marginBottom: 20,
                // paddingBottom: 20,
                border:0
              }}
            >
              <p style={{ margin: "15px 5px", fontWeight: "bold",color:"#00c1de" }}>
                Please Check If We Have Considered The Following
              </p>
              <Row>
                <Col>
                  <p style={{margin:"10px 10px"}}>{`1.Site visit performed :${vendorInfo&&vendorInfo.get("isVisit")==="Y"?"Yes":"No"}`}</p>
                  {vendorInfo&&vendorInfo.get("isVisit")==="Y"&&<Col className="wrap">
                    {formColumns4_1.map(columnMap)}
                  </Col>}
                </Col>
                <Col>
                  <p style={{margin:"10px 10px"}}>{`2. Special capabilities of this vendor`}</p>
                  <Col className="wrap">
                    {formColumns4_2.map(columnMap)}
                  </Col>
                </Col>
                <Col>
                  <p style={{margin:"10px 10px"}}>{`3. Any potential conflict of interest with employees/directors : ${vendorInfo&&vendorInfo.get("isConflict")==="Y"?"Yes":"No"}`}</p>
                  {vendorInfo&&vendorInfo.get("isConflict")==="Y"&&<Col className="wrap">
                  {formColumns4_3.map(columnMap)}
                </Col>}
                </Col>
                <Col>
                  <p style={{margin:"10px 10px"}}>{`4. City / Office`}</p>
                  <Col className="wrap">
                    {formColumns4_4.map(columnMap)}
                  </Col>
                </Col>
              </Row>
            </Row>

            <Row className="payment-read" style={{ marginBottom: 20, border:0 }}>
              <p style={{ margin: "15px 5px", fontWeight: "bold",color:"#00c1de" }}>
                CHECKLIST FOR NEW VENDOR
              </p>
              <Col className="wrap">
                {filesUpload.map(columnMap)}
              </Col>
            </Row>
          </Row>
          <Row style={{marginTop:20, marginBottom: 20}}>
            <SimpleForm
              columns={remarkColumns}
              initial={vendorInfo}
              colSpan={12}
              labelCol={{ span: 7 }}
              ref={f => (this.form1 = f)}
            />
            {
              flowStatus_state==="toTypeInCode"&&<SimpleForm
              columns={requestColumns}
              initial={vendorInfo}
              colSpan={12}
              labelCol={{ span: 7 }}
              ref={f => (this.form1 = f)}
            />
            }
          </Row>
          <Row style={{ marginTop: 40, textAlign: "center" }}>
          {
            !search&&<Button
              onClick={() => {
                const {dispatch,params} = this.props
                dispatch(pathJump(`/vendor/vendor_detail_edit/${params.id}`))
              }}
              type="primary"
              size="large"
              style={{ marginRight: 10 }}
            >
              {formatMessage({ id: "edit" })}

            </Button>
          }

            {search&&(flowStatus==="submitted"||flowStatus==="updated")&&<Button
                onClick={() =>this.handleModal("agree") }
                type="primary"
                size="large"
                style={{ marginRight: 10 }}
              >
                {formatMessage({ id: "agree" })}

              </Button>
            }
            {search&&(flowStatus==="submitted"||flowStatus==="updated")&&<Button
                onClick={() =>this.handleModal("disagree") }
                type="danger"
                size="large"
                style={{ marginRight: 10 }}
              >
                {formatMessage({ id: "disagree" })}

              </Button>
            }
            <Button
              onClick={() => {
                const { dispatch } = this.props;
                dispatch(pathJump("/vendor"));
              }}
              size="large"
            >
              {formatMessage({ id: "cancel" })}
            </Button>
          </Row>
        </Spin>
      </Row>
    );
  }
}

VendorDetailShow.propTypes = {
  pathJump: React.PropTypes.func
};

const mapStateToProps = state => {
  console.log(354, state, state && state.toJS());
  return {
    vendorInfo: state.getIn(["vendorDetailEdit", "vendorInfo"]),
  };
};


export default Form.create()(
  injectIntl(connect(mapStateToProps)(VendorDetailShow))
);
