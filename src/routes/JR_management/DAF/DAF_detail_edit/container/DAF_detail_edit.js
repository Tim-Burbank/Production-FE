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
  Tabs,
  Checkbox
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
    DAFDetail_tableField as _DAFDeT,
    currency as _cur,
    purchaseTypeArr
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
  fetchDAFInfo,
  newDAF,
  updateDAF,
  fetchClient,
  fetchProject,
  fetchVendor,
  fetchGADUser
} from "../modules/DAF_detail_edit";
import "./DAF_detail_edit_.scss";
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
import moment from "moment";
import { DAFInfo } from "../../../../../testData";
// import { pathJump } from './../../../../../utils';


class DAFDetailEdit extends React.Component {
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
      DAFInfo:Immutable.fromJS({
        purchaseType:"directAward",
        isWPP:"N"
      }),
      project:Immutable.fromJS([]),
      projectName:""
    };
  }
  componentWillMount = () => {
    const { dispatch, params } = this.props;
    dispatch(fetchClient())
    dispatch(fetchGADUser())
    dispatch(fetchVendor({year:2017}))
    dispatch(fetchProject()).then(e=>{
      if(e.payload){
        this.setState({
          project:Immutable.fromJS(e.payload.objs)
        })
      }
    })
    if(params.id==="new"){
      let DAFInfo = JSON.parse(localStorage.getItem("DAFInfo_"))||{}
      DAFInfo.date&&(DAFInfo.date = moment(DAFInfo.date))
      DAFInfo.purchaseType = DAFInfo.purchaseType||"directAward"
      DAFInfo.isWPP = DAFInfo.isWPP||"N"
      console.log(124,DAFInfo)
      this.setState({
        DAFInfo:Immutable.fromJS(DAFInfo)
      })
    }else{
      dispatch(fetchDAFInfo(params.id)).then(e=>{
        if(e.error){
          message.error(e.error)
        }else{
          console.log(e.payload)
          if(e.payload.date){
            e.payload.date = moment(e.payload.date)
          }
          if(e.payload.reasonIndexs){
            e.payload.reasonIndexs= e.payload.reasonIndexs.split(",")
          }
          this.setState({
            DAFInfo:Immutable.fromJS(e.payload)
          })
        }
      })
    }

  };
  // componentDidMount(){
  //   const {DAFInfo} = this.props
  //   this.setState({
  //     DAFInfo:Immutable.fromJS(DAFInfo)
  //   })
  // }
  // componentWillReceiveProps(next)

  componentDidUpdate(preProps, preState) {
    const {projectName,project,DAFInfo} = this.state
    if(preState.projectName!==projectName){
      let _project = project.toJS()
      let _DAFInfo = DAFInfo.toJS()
      _project.forEach(item=>{
        if(item.id===projectName){
          _DAFInfo.GADUsr = item.clientPo&&item.clientPo.GADUsr

          }
        })
      _DAFInfo.projectName = projectName
      this.setState({
        DAFInfo:Immutable.fromJS(_DAFInfo),
      })
    }
    //主要用来处理自动填充数据的
    if(preProps.DAFInfo!==this.props.DAFInfo){
      const {DAFInfo} = this.props
      console.log(166,DAFInfo&&DAFInfo.toJS())
      let _DAFInfo = DAFInfo&&DAFInfo.toJS()||{}
      _DAFInfo.date&&(_DAFInfo.date = moment(_DAFInfo.date))
      _DAFInfo.purchaseType = _DAFInfo.purchaseType||"directAward"
      _DAFInfo.isWPP = _DAFInfo.isWPP||"N"
      console.log(124,_DAFInfo)
      this.setState({
        DAFInfo:Immutable.fromJS(_DAFInfo)
      })
    }
  }

  getRequiredMessage = (e, type) => {
    return getFormRequired(
      this.props.intl.formatMessage({ id: "input_require" }, { name: e }),
      type
    );
  };

  //添加测试数据
  getData = () => {
    const { dispatch } = this.props;
    const data = require("../../../../../testData").DAFInfo;
    localStorage.setItem("DAFInfo_", JSON.stringify(data));
    dispatch({
      type: "FETCH_DAF_INFO",
      payload: data
    });
  };

  clearData = () => {
    const { dispatch } = this.props;
    const data = {};
    // localStorage.setItem("DAFInfo_", JSON.stringify(data));
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
      type: "FETCH_DAF_INFO",
      payload: data
    });
  };

  //提交
  handleModal = option => {
    const {dispatch,params} = this.props
    const {filePath} = this.state
    console.log(`option`, option);
    this.form1.validateFieldsAndScroll((err,value)=>{
      if(value){
        let values = {
          ...value,
          reasonIndexs:value.reasonIndexs.toString(),
          operation:option
        }
        if(params.id==="new"){
          dispatch(newDAF(values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
            }else{
              localStorage.clear()
              dispatch(pathJump("DAF"))
            }
          })
        }else{
          dispatch(updateDAF(params.id,values)).then(e=>{
            if(e.error){
              message.error(e.error.message)
            }else{
              localStorage.clear()
              dispatch(pathJump("DAF"))
            }
          })
        }
      }
    })
  };

  //除bank之外的所有表单值改变时，触发
  inputChange = (name, value) => {
    console.log("name", name, "e", value);
    const { params } = this.props;
    if (params.id !== "new") return;

    console.log("有个表单的值改变了");
    let values = {};
    let DAFInfo_ = JSON.parse(localStorage.getItem("DAFInfo_")) || {};
    console.log(208, DAFInfo_);
    DAFInfo_[name] = value;
    localStorage.setItem("DAFInfo_", JSON.stringify(DAFInfo_));
  };

  render() {
    const {
      intl: { formatMessage },
      location: { pathname },
      count,
      params,
      client,
      project,
      vendor,
      GADUser
    } = this.props;
    const {
      modalLoad,
      itemId,
      current,
      DAFInfo
    } = this.state;

    const { getFieldDecorator, getFieldValue } = this.props.form;

    console.log("state", this.state);
    console.log("props", this.props);
    console.log("DAFInfo", DAFInfo && DAFInfo.toJS());
    console.log("client",client&&client.toJS(),"vendor",vendor&&vendor.toJS(),"project",project&&project.toJS())

    const getSearchList = (List,secondId,moValue="") => {
      let arr=[]
      moValue=moValue.split(".")
      if (List) {
        List.toJS().forEach(item => {
          let value
          if(moValue.length===2){
            if(item[moValue[0]]){
              value = item[moValue[0]][moValue[1]]||item[moValue[0]][0][moValue[1]]
            }
          }else if(moValue.length===1){
            if(moValue[0]){
              value = item[moValue[0]]
            }else{
              value = item.id
            }
          }
          arr.push({
            label:item[secondId],
            value:value,
          })
        })
      }
      return arr
    }

    const renderOption = config => {
      if (config && config.length > 0) {
        return config.map(v => <Option key={v.value||v}>{v.label||v.value
        ||v}</Option>);
      }
    };
    const renderRadio = config => {
      if (config && config.length > 0) {
        return config.map(v =><Radio key={v.value}  value={v.value}>{v.title}</Radio>);
      }
    };
    const renderCheck = config => {
      if (config && config.length > 0) {
        return config.map(v =><Col key={v.title} span={v.labelCol||6}>
          <Checkbox   value={v.value}>{v.title}</Checkbox >
        </Col>);
      }
    };

    // console.log(320, this.form1, this.form2, this.form3);

    const renderSysId = (data, item) => {
      return data.map(v => <Option key={v.get(item)}>{v.get(item)}</Option>);
    };

    const checkOptions = [
      { title: 'Timing', value: 'Timing' },
      { title: 'Project Continuation', value: 'ProjectContinuation' },
      { title: 'Availability', value: 'Availability' },
      { title: 'Client Direction', value: 'ClientDirection' },
      { title: 'Specialized Experience/Talent', value: 'SpecializedExperience/Talent' },
      { title: 'Specifications', value: 'Specifications' },
      { title: 'Other (see Rational)', value: 'Other' },
    ]

    // Basic Info.
    const formColumns1 = [
      { dataIndex: _DAFDeT.name, option: { rules: [{ required: true }] } },
      {
        dataIndex: _DAFDeT.date,
        option: { rules: [{ required: true }] },
        FormTag: (
          <DatePicker
            onChange={value => this.inputChange("date", value)}
          />
        )
      },
      {
        dataIndex: _DAFDeT.purchaseType,
        option: { rules: [{ required: true }] },
        FormTag: (
          <RadioGroup
            onChange={e => this.inputChange("purchaseType", e.target.value)}
          >
            <Row>
              {renderRadio(purchaseTypeArr)}
            </Row>
          </RadioGroup>
        )
      },
      {
        dataIndex: _DAFDeT.clientDetailId,
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            onChange={value =>{
              // this.setState({ DAFType: value })
              this.inputChange("clientDetailId", value)
            }}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(getSearchList(client,"id","clientDetailId"))}
          </Select>
        ),
        option: { rules: [{ required: true, message: "Please select" }] }
      },
      {
        dataIndex: _DAFDeT.projectName,
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            onChange={value =>{
              this.setState({ projectName: value })
              this.inputChange("projectName", value)
            }}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(getSearchList(project))}
          </Select>
        ),
        option: { rules: [{ required: true, message: "Please select" }] }
      },
      {
        dataIndex: _DAFDeT.description ,
        colSpan:24,
      },
      {
        dataIndex: _DAFDeT.vendorDetailId,
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            onChange={value =>{
              this.inputChange("vendorDetailId", value)
            }}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(getSearchList(vendor,"nameEN","vendorBanks.vendorDetailId"))}
          </Select>
        ),
        option: { rules: [{ required: true, message: "Please select" }] }
      },
      {
        dataIndex: _DAFDeT.GADUsr,
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            onChange={value =>{
              this.inputChange("GADUsr", value)
            }}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(getSearchList(GADUser))}
          </Select>
        ),
        option: { rules: [{ required: true, message: "Please select" }] }
      },
      {
        dataIndex: _DAFDeT.currencyId,
        FormTag: (
          <Select
            showSearch
            placeholder={formatMessage({ id: "pleaseSelect" })}
            optionFilterProp="children"
            allowClear={true}
            onChange={value =>{
              this.inputChange("currencyId", value)
            }}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
          >
            {renderOption(_cur)}
          </Select>
        ),
        option: { rules: [{ required: true, message: "Please select" }] }
      },
      {
        dataIndex: _DAFDeT.budget,
        option: { rules: [{ required: true }] }
      },
      {
        dataIndex: _DAFDeT.isWPP,
        option: { rules: [{ required: true }] },
        colSpan:24,
        FormTag: (
          <RadioGroup
            onChange={value => this.inputChange("isWPP", value)}
          >
            <Row>
              {renderRadio([{title:"Yes",value:"Y"},{title:"No",value:"N"}])}
            </Row>
          </RadioGroup>
        )
      },
      {
        dataIndex: _DAFDeT.service,
        option: { rules: [{ required: true }] } ,
        colSpan:24
      },
      {
        dataIndex: _DAFDeT.reasonIndexs,
        colSpan:24,
        option: { rules: [{ required: true }] },
        FormTag: (
          <CheckboxGroup
            onChange={value => this.inputChange("reasonIndexs", value)}
          >
            <Row>
              {renderCheck(checkOptions)}
            </Row>
          </CheckboxGroup >
        )
      },
      {
        dataIndex: _DAFDeT.rationale,
        option: { rules: [{ required: true }] } ,
        colSpan:24,
        FormTag: (
          <TextArea
            onChange={e => this.inputChange("rationale", e.target.value)}
            autosize={{
              minRows: 3,
              maxRows: 10
            }}
          />
        )
      },
    ].map(item =>{
      if(item.colSpan===24){
        return ({
            ...item,
            title: formatMessage({ id: `DAFDetail_${item.dataIndex}` }),
            props: { onChange: e => this.inputChange(item.dataIndex, e.target.value) },
            labelCol: {
              xs: { span: 24 },
              sm: { span: 4 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 20 },
            },
          })
      }else{
        return({
          ...item,
          title: formatMessage({ id: `DAFDetail_${item.dataIndex}` }),
          props: { onChange: e => this.inputChange(item.dataIndex, e.target.value) },
          labelCol: {
            xs: { span: 24 },
            sm: { span: 8 },
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
          },
        })
      }
    } );

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
          <Col span={6}>{formatMessage({ id: `${_tit.DAF}` })}</Col>
          <Col span={18}>{DAFInfo&&DAFInfo.toJS().name}</Col>
         </Row>
        } />
        <Spin spinning={modalLoad} tip={formatMessage({ id: "loading" })}>
          <Row
            style={{
              width: "65%",
              minWidth: 1100,
              marginTop: 81,
              paddingBottom: 40,
              // borderBottom: "1px solid #e9e9e9",
              position: "relative"
            }}
          >

            <SimpleForm
              columns={formColumns1}
              initial={DAFInfo}
              colSpan={12}
              labelCol={{ span: 7 }}
              ref={f => (this.form1 = f)}
            />
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
            <Button
              onClick={() => {
                const { dispatch } = this.props;
                dispatch(pathJump("/DAF"));
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

DAFDetailEdit.propTypes = {
  pathJump: React.PropTypes.func
};

const mapStateToProps = state => {
  console.log(354, state, state && state.toJS());
  return {
    DAFInfo: state.getIn(["DAFDetailEdit", "DAFInfo"]),
    client: state.getIn(["DAFDetailEdit", "client"]),
    project: state.getIn(["DAFDetailEdit", "project"]),
    vendor: state.getIn(["DAFDetailEdit", "vendor"]),
    GADUser: state.getIn(["DAFDetailEdit", "GADUser"]),
  };
};


export default Form.create()(
  injectIntl(connect(mapStateToProps)(DAFDetailEdit))
);
