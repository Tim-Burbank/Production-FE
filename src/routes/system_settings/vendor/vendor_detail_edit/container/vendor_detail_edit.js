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
import AddableForm from "../../../../../components/addableForm/AddableForm";
import VisitForm from "./component/VisitForm";
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
  newVendor,
  updateVendor
} from "../modules/vendor_detail_edit";
import "./vendor_detail_edit_.scss";
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from "moment";
// import { fetchVendorInfo } from '../../modules/vendor';
import { vendorInfo } from "../../../../../testData";

class VendorDetailEdit extends React.Component {
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
      // bankInfo : Immutable.fromJS([{}]),
      // tax_disabled: false,
      // loc_disabled: false,
      // FP_disabled: false,
      filePath: {
        COBC: "",
        BHD: "",
        NDA: "",
        BL: "",
        AL: ""
      },
      fileLists: {
        COBC: [],
        BHD: [],
        NDA: [],
        BL: [],
        AL: []
      }
    };
  }
  componentWillMount = () => {
    const { dispatch, params } = this.props;
    if (params.id === "new") {
      let vendorInfo_ = JSON.parse(localStorage.getItem("vendorInfo_")) || {};
      let bankInfo_ = JSON.parse(localStorage.getItem("bankInfo_")) || [{}];
      vendorInfo_["vendorBanks"] = bankInfo_;
      console.log(103, vendorInfo_);
      let filePath = {
        COBC: vendorInfo_.COBC,
        BHD: vendorInfo_.BHD,
        NDA: vendorInfo_.NDA,
        BL: vendorInfo_.BL,
        AL: vendorInfo_.AL
      };
      localStorage.setItem("FilePath_",JSON.stringify(filePath))
      let fileLists = {
        COBC: [],
        BHD: [],
        NDA: [],
        BL: [],
        AL: []
      }
      for(var key in filePath){
        if(filePath[key]){
          fileLists[key].push({
            uid: 1,
            name: filePath[key],
            status:"done",
            response:{
              obj:filePath[key],
              status:"success"
            }
          })
        }
      }
      this.setState({
        fileLists,
        filePath,
        vendorType:vendorInfo_.vendorType,
        location:vendorInfo_.location,
        vendorFP:vendorInfo_.vendorFP,
        taxRate: vendorInfo_.taxRate,
      });
      dispatch({
        type: "FETCH_VENDOR_INFO",
        payload: vendorInfo_
      });
    } else {
      dispatch(fetchVendorInfo(params.id)).then(e => {
        if (e.payload) {
          let filePath = {
            COBC: e.payload.COBC,
            BHD: e.payload.BHD,
            NDA: e.payload.NDA,
            BL: e.payload.BL,
            AL: e.payload.AL
          };
          let fileLists = {
            COBC: [],
            BHD: [],
            NDA: [],
            BL: [],
            AL: []
          }
          for(var key in filePath){
            if(filePath[key]){
              fileLists[key].push({
                uid: 1,
                name: filePath[key],
                status:"done",
                response:{
                  obj:filePath[key],
                  status:"success"
                }
              })
            }
          }

          this.setState({
            vendorType: e.payload.vendorType,
            filePath,
            fileLists
          });
        }
      });
    }
  };

  componentDidUpdate(preProps, preState) {
    const { vendorType,location,vendorFP,loc_disabled,FP_disabled,tax_disabled } = this.state;
    console.log(66, vendorType);

    if (vendorType === "TaxBureau") {
      this.form1.setFieldsValue({
        location:"domestic",
        vendorFP:"Common",
        taxRate: 0,
      });
    }
    if(location ==="oversea"){
      this.form1.setFieldsValue({
        vendorFP:"INV",
        taxRate: 0,
      });
    }
    if(location ==="domestic"&&vendorFP==="Common"){
      this.form1.setFieldsValue({
        taxRate: 0,
      });
    }
  }

  onFetch = (values, limit, offset, cur = 1) => {
    this.setState({ loading: true, currentPage: cur });
    const { dispatch } = this.props;
    values = {
      ...values,
      limit: limit,
      offset: offset
    };
    dispatch(fetchClientPO(values)).then(e => {
      if (e.error) {
        message.error(e.error.message);
        this.setState({ loading: false });
      } else {
        this.setState({ loading: false });
      }
    });
  };

  fileChange = (state, info) => {
    // console.log(state,info)
    const { filePath, fileLists } = this.state;
    if (info.file.status !== "uploading") {
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`, 1);
      console.log(180, info.file);
      filePath[state] = info.file.response.obj;
      console.log(190, fileLists);
      this.setState({
        filePath
      });
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`, 1);
    }
    localStorage.setItem("FilePath_",JSON.stringify(filePath))
    fileLists[state] = info.fileList.slice(-1);
    this.setState({
      fileLists
    });
  };

  getRequiredMessage = (e, type) => {
    return getFormRequired(
      this.props.intl.formatMessage({ id: "input_require" }, { name: e }),
      type
    );
  };

  openPSD = v => {
    window.open(v);
  };

  // formatM = value => {
  //   let parts = value.toString().split(".");
  //   parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //   if (parts[1]) {
  //     parts[1] = parts[1].substring(0, 2);
  //   }
  //   return `${this.state.currency === "CNY" ? "￥" : "$"} ${parts.join(".")}`;
  // };

  //添加测试数据
  getData = () => {
    const { dispatch } = this.props;
    const data = require("../../../../../testData").vendorInfo;
    localStorage.setItem("vendorInfo_", JSON.stringify(data));
    let filePath = {
      COBC: data.COBC,
      BHD: data.BHD,
      NDA: data.NDA,
      BL: data.BL,
      AL: data.AL
    };
    localStorage.setItem("FilePath_", JSON.stringify(filePath));
    this.setState({
      filePath
    });
    dispatch({
      type: "FETCH_VENDOR_INFO",
      payload: data
    });
  };

  clearData = () => {
    const { dispatch } = this.props;
    const data = {};
    // localStorage.setItem("vendorInfo_", JSON.stringify(data));
    let filePath = {
      COBC: data.COBC,
      BHD: data.BHD,
      NDA: data.NDA,
      BL: data.BL,
      AL: data.AL
    };
    localStorage.clear()
    this.setState({
      filePath
    });
    this.setState({
      bankInfo:[{}]
    })
    dispatch({
      type: "FETCH_VENDOR_INFO",
      payload: data
    });
  };

  //提交
  handleModal = option => {
    const {dispatch,params} = this.props
    const {filePath} = this.state
    console.log(`option`, option);
    let values = {
      operation :option,
    };
    this.form1.validateFieldsAndScroll((err,value)=>{
      if(value){
        values = {
          ...values,
          ...value
        }
      }
    })
    this.form2.validateFieldsAndScroll((err,value)=>{
      if(value){
        values = {
          ...values,
          ...value
        }
      }
    })
    this.form3.validateFieldsAndScroll((err, value) => {
      if (err) {
        message.error("Bank Info 还有没填的项", 1);
        return
      }
      console.log(value)
      let vendorBanks = []
      for(var key in value){
        let arr = key.split("_")
        vendorBanks[arr[1]] ={
          ...vendorBanks[arr[1]],
          [arr[0]]:value[key]
        }
      }
      values.vendorBanks = vendorBanks
    })
    this.form4.validateFieldsAndScroll((err,value)=>{
      if(value){
        console.log("form4",this.form4)
        let isVisit = localStorage.getItem("isVisit")
        let isConflict = localStorage.getItem("isConflict")
        // if(value.vi)
        if(isVisit==="Y"){
          if(!value.visitDate){
            message.error(`visitDate 请填写`,1)
            return
          }
          if(!value.visitor){
            message.error(`visitor 请填写`,1)
            return
          }
          if(!value.visitResult){
            message.error(`visitResult 请填写`,1)
            return
          }
          let visitFilePath = localStorage.getItem("visitFilePath")
          if(!visitFilePath){
            message.error(`请上传 Visit Report 文件`,1)
            return
          }
        }
        if(isConflict==="Y"){
          if(!value.conflictName){
            message.error(`conflictName 请填写`)
            return
          }
          if(!value.conflictTitle){
            message.error(`conflictTitle 请填写`)
            return
          }
          if(!value.relation){
            message.error(`relation 请填写`)
            return
          }
        }
        if(!value.vendorCity){
          message.error(`vendorCity 请填写`)
          return
        }
        values = {
          ...values,
          ...value,
          isVisit:isVisit,
          isConflict:isConflict,
        }
      }
    })
    //最后的上传文件的
    console.log("filePath",filePath)
    for(let key in filePath){
      if(key ==="AL"){
        continue
      }
      if(!filePath[key]){
        message.error(`请上传${key}`,1)
        return
      }
    }
    values = {
      ...values,
      ...filePath,
    }
    console.log(407,values)
    if(params.id==="new"){
      dispatch(newVendor(values)).then(e=>{
        if(e.error){
          message.error(e.error.message)
        }else{
          localStorage.clear()
          dispatch(pathJump("/vendor"))
        }
      })
    }else{
      dispatch(updateVendor(params.id,values)).then(e=>{
        if(e.error){
          message.error(e.error.message)
        }else{
          localStorage.clear()
          dispatch(pathJump("/vendor"))
        }
      })

    }
  };

  //除bank之外的所有表单值改变时，触发
  inputChange = (name, value) => {
    console.log("name", name, "e", value);
    const { params } = this.props;
    if (params.id !== "new") return;

    console.log("有个表单的值改变了");
    let values = {};
    let vendorInfo_ = JSON.parse(localStorage.getItem("vendorInfo_")) || {};
    console.log(208, vendorInfo_);
    vendorInfo_[name] = value;
    localStorage.setItem("vendorInfo_", JSON.stringify(vendorInfo_));
  };

  uploadContent = array => {
    const { filePath, fileLists } = this.state;
    console.log(filePath, fileLists);
    return array.map(item => (
      <Col span={24} key={item.dataIndex} style={{ margin: "8px 32px" }}>
        <Col span={12}>{item.label}</Col>
        <Col span={12}>
          <Upload
            name="photo"
            action={`${host}/common/upload/`}
            onChange={info => this.fileChange(item.dataIndex, info)}
            onPreview={file => this.openPSD(file.response.obj)}
            fileList={fileLists[item.dataIndex]}
          >
            <Button>
              <Icon type="upload" /> upload
            </Button>
          </Upload>
        </Col>
      </Col>
    ));
  };

  render() {
    const {
      intl: { formatMessage },
      location: { pathname },
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
      tax_disabled,
      FP_disabled,
      loc_disabled
    } = this.state;

    const { getFieldDecorator, getFieldValue } = this.props.form;

    console.log("state", this.state);
    console.log("props", this.props);
    console.log("vendorInfo", vendorInfo && vendorInfo.toJS());
    console.log("bankInfo", bankInfo);
    console.log(350,vendorType,location,vendorFP)
    console.log("form1",this.form1,"form2",this.form2,"form3",this.form3,"form4",this.form4)


    const renderOption = config => {
      if (config && config.length > 0) {
        return config.map(v => <Option key={v}>{v}</Option>);
      }
    };

    // console.log(320, this.form1, this.form2, this.form3);

    const renderSysId = (data, item) => {
      return data.map(v => <Option key={v.get(item)}>{v.get(item)}</Option>);
    };

    // const validNum = {
    //   rules: [
    //     {
    //       type: "number",
    //       required: true,
    //       transform(value) {
    //         if (value || value === 0 || value !== undefined) {
    //           return Number(value);
    //         }
    //       },
    //       message: "Please enter a positive number"
    //     }
    //   ]
    // };
    // const validNumFalse = {
    //   rules: [
    //     {
    //       type: "number",
    //       required: false,
    //       transform(value) {
    //         if (value || value === 0 || value !== undefined) {
    //           return Number(value);
    //         }
    //       },
    //       message: "Please enter a positive number"
    //     }
    //   ]
    // };
    // const validMoney = {
    //   rules: [
    //     {
    //       type: "string",
    //       required: true,
    //       pattern: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/,
    //       transform(value) {
    //         if (value) {
    //           return value.toString();
    //         }
    //       },
    //       message: "Please enter the number"
    //     }
    //   ]
    // };

    // const bankAconut = {
    //   rules: [
    //     {
    //       type: "string",
    //       required: true,
    //       transform(value) {
    //         if (value || value === 0 || value !== undefined) {
    //           value = value.replace(/\s/g, '').replace(/(\d{4})/g, "$1 ");
    //           console.log(599,value)
    //           //优化语句：如果当前位置是空格字符，则自动清除掉
    //           if (value.charAt(value.length - 1) == ' ') {
    //               value = value.substring(0,value.length - 1);
    //           }
    //           return value;
    //         }
    //       },
    //       message: "Please enter a positive number"
    //     }
    //   ]
    // };

    // Basic Info.
    const formColumns1 = [
      { dataIndex: _venDeT.nameEN, option: { rules: [{ required: true }] } },
      { dataIndex: _venDeT.nameCN },
      {
        dataIndex: _venDeT.contactPerson,
        option: { rules: [{ required: true }] }
      },
      { dataIndex: _venDeT.title, option: { rules: [{ required: true }] } },
      { dataIndex: _venDeT.telephone, option: { rules: [{ required: true }] } },
      { dataIndex: _venDeT.email, option: { rules: [{ required: true }] } },
      { dataIndex: _venDeT.addressEN },
      { dataIndex: _venDeT.addressCN },
      {
        dataIndex: _venDeT.vendorType,
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            onChange={value =>{
              this.setState({ vendorType: value })
              this.inputChange("vendorType", value)
            }}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(vendorTypeArr)}
          </Select>
        ),
        option: { rules: [{ required: true, message: "Please select" }] }
      },
      { dataIndex: _venDeT.fax, option: { rules: [{ required: true }] } },
      {
        dataIndex: _venDeT.location,
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            disabled={vendorType==="TaxBureau"?true:false}
            onChange={value =>{
              this.setState({ location: value });
              this.inputChange("location", value)
            }}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(location_)}
          </Select>
        ),
        option: { rules: [{ required: true, message: "Please select" }] }
      },
      {
        dataIndex: _venDeT.vendorFP,
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            disabled={(vendorType==="TaxBureau"||location==="oversea")?true:false}
            onChange={value => {
              this.setState({ vendorFP: value });
              this.inputChange("vendorFP", value)
            }}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(vendorFP_)}
          </Select>
        ),
        option: { rules: [{ required: true, message: "Please select" }] }
      },
      {
        dataIndex: _venDeT.taxRate,
        //FormTag: <Input disabled={vendorType === "TaxBureau" ? true : false} />
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            disabled = {(vendorType==="TaxBureau"||location==="oversea"||location==="domestic"&&vendorFP==="Common")?true:false}
            onChange={value => this.inputChange("taxRate", value)}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(taxRate)}
          </Select>
        ),
        option: { rules: [{ required: true, message: "Please select" }] }
      },
      {
        dataIndex: _venDeT.validDate,
        option: { rules: [{ required: true }] },
        FormTag: (
          <DatePicker
            onChange={value => this.inputChange("validDate", value)}
          />
        )
      }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` }),
      props: { onChange: e => this.inputChange(item.dataIndex, e.target.value) }
    }));
    // Business Info
    const formColumns2 = [
      {
        dataIndex: _venDeT.natureOfBusiness,
        option: { rules: [{ required: true }] }
      },
      {
        dataIndex: _venDeT.currencyId,
        option: { rules: [{ required: true }] },
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            onChange={value => this.inputChange("currencyId", value)}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(_cur)}
          </Select>
        )
      },
      {
        dataIndex: _venDeT.expectedValue,
        option: { rules: [{ required: true }] }
      },
      {
        dataIndex: _venDeT.referral,
        option: { rules: [{ required: true }] }
      }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` }),
      props: { onChange: e => this.inputChange(item.dataIndex, e.target.value) }
    }));
    // Bank Info
    const formColumns3 = [
      {
        dataIndex: _venDeT.companyName,
        option: { rules: [{ required: true }] }
      },
      {
        dataIndex: _venDeT.currencyId,
        option: { rules: [{ required: true }] },
        FormTag: 1
      },
      { dataIndex: _venDeT.bankName, option: { rules: [{ required: true }] } },
      {
        dataIndex: _venDeT.bankAddress,
        option: { rules: [{ required: true }] }
      },
      {
        dataIndex: _venDeT.accountNum,
        option: { rules: [{ required: true }] }
      },
      {
        dataIndex: _venDeT.accountAddress,
        option: { rules: [{ required: true }] }
      },
      { dataIndex: _venDeT.swiftCode, option: { rules: [{ required: true }] } }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `venDetail_${item.dataIndex}` })
    }));

    const filesUpload = [
      {
        dataIndex: "COBC",
        label: "1. Signed/Chopped WPP Code of Business Conduct - for suppliers"
      },
      { dataIndex: "BHD", label: "2. Signed/Chopped Blue Hive Declaration" },
      { dataIndex: "NDA", label: "3. Signed/Chopped Non-Disclosure Agreement" },
      { dataIndex: "BL", label: "4. Business License / Certificate" },
      { dataIndex: "AL", label: "5. Account License" }
    ];

    const labelCol = {
      xs: { span: 24 },
      sm: { span: 7 }
    };
    const wrapperCol = {
      xs: { span: 24 },
      sm: { span: 14 }
    };

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      }
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 }
      }
    };
    const amountLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 8, offset: 14 }
      }
    };

    return (
      <Row style={{ paddingBottom: 100, position: "relative" }}>
        <SecondTitle
        rightContent={<div>
            {/*测试按钮开始*/}
            {params.id === "new" && (
              <Button
                size="small"
                style={{
                  height: 32
                }}
                onClick={() => this.getData()}
              >
                {"填充测试数据"}
              </Button>
            )}
            {params.id === "new" && (
              <Button
                size="small"
                style={{
                  height: 32
                }}
                onClick={() => this.clearData()}
              >
                {"清除测试数据"}
              </Button>
            )}
            {/*测试按钮结束*/}
        </div>}
         title={<Row>
           <Col span={12}>{formatMessage({ id: `${_tit.vendor_detail_edit}` })}</Col>
           <Col span={12}><span className="icon-span status"></span>{formatMessage({ id: `${vendorInfo&&vendorInfo.toJS().vendor&&vendorInfo.toJS().vendor.flowStatus||"new_btn"}`})}</Col>
         </Row>
        } />
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
              style={{ marginBottom: 20, borderBottom: "1px solid #e9e9e9" }}
            >
              <p style={{ margin: "5px 0 10px 0", fontWeight: "bold",color:"#00c1de" }}>
                Basic Info.
              </p>
              <SimpleForm
                columns={formColumns1}
                initial={vendorInfo}
                colSpan={12}
                labelCol={{ span: 7 }}
                ref={f => (this.form1 = f)}
              />
            </Row>
            <Row
              style={{ marginBottom: 20, borderBottom: "1px solid #e9e9e9" }}
            >
              <p style={{ margin: 5, fontWeight: "bold",color:"#00c1de" }}>Business Info. </p>
              <SimpleForm
                columns={formColumns2}
                initial={vendorInfo}
                colSpan={12}
                labelCol={{ span: 7 }}
                ref={f => (this.form2 = f)}
              />
            </Row>
            <Row
              style={{
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: "1px solid #e9e9e9"
              }}
            >
              <p style={{ margin: 5, fontWeight: "bold",color:"#00c1de" }}>Bank Info. </p>
              <AddableForm
                columns={formColumns3}
                colSpan={12}
                initial={bankInfo}
                sessionStorageName={params.id === "new" ? "bankInfo_" : ""}
                ref={f => (this.form3 = f)}
              />
            </Row>
            <Row
              style={{
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: "1px solid #e9e9e9"
              }}
            >
              <p style={{ margin: "15px 5px", fontWeight: "bold",color:"#00c1de" }}>
                Please Check If We Have Considered The Following
              </p>
              <VisitForm
                initial={vendorInfo}
                sessionStorageName={params.id === "new" ? "bankInfo_" : ""}
                ref={f => (this.form4 = f)}
              />
            </Row>

            <Row style={{ marginBottom: 20, paddingBottom: 20 }}>
              <p style={{ margin: "15px 5px", fontWeight: "bold",color:"#00c1de" }}>
                CHECKLIST FOR NEW VENDOR
              </p>
              {this.uploadContent(filesUpload)}
            </Row>
          </Row>
          <Row style={{ marginTop: 40, textAlign: "center" }}>
            {
              <Button
                onClick={() => this.handleModal("submit")}
                type="primary"
                size="large"
                style={{ marginRight: 10 }}
              >
                {params.id === "new"
                  ? formatMessage({ id: "new_submit_btn" })
                  : formatMessage({ id: "save_submit_btn" })}
              </Button>
            }
            {
              <Button
                onClick={() => this.handleModal("save")}
                type="primary"
                size="large"
                style={{ marginRight: 10 }}
              >
                {params.id === "new"
                  ? formatMessage({ id: "new_btn" })
                  : formatMessage({ id: "save_btn" })}
              </Button>
            }
            {/* {approve&&<Button onClick={this.handleModal.bind(this,'agree','agree')} type='primary' style={{marginRight:10}} size="large">{formatMessage({id:'cpoApprove'})}</Button>}
              {reject&&<Button onClick={this.handleModal.bind(this,'disagree','agree')} type='danger' style={{marginRight:10}} size="large">{formatMessage({id:'cpoReject'})}</Button>} */}
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

VendorDetailEdit.propTypes = {
  pathJump: React.PropTypes.func
};

const mapStateToProps = state => {
  console.log(354, state, state && state.toJS());
  return {
    vendorInfo: state.getIn(["vendorDetailEdit", "vendorInfo"]),
    bankInfo: state.getIn(["vendorDetailEdit", "bankInfo"])
  };
};


export default Form.create()(
  injectIntl(connect(mapStateToProps)(VendorDetailEdit))
);
