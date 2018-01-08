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
    DAFDetail_tableField as _DAFDeT,
    DAFDetail_type as _clientPOType,
    currency as _cur,

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
  updateDAF
} from "../../DAF_detail_edit/modules/DAF_detail_edit";
import "./DAF_detail_show_.scss";
const Option = Select.Option;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

const TabPane = Tabs.TabPane;
const { MonthPicker, RangePicker } = DatePicker;
import moment from "moment";

class DAFDetailShow extends React.Component {
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
    }
  }
  componentWillMount = () => {
    const { dispatch, params } = this.props;
    dispatch(fetchDAFInfo(params.id))
  };

  componentDidUpdate(preProps, preState) {
    const { vendorType,location,vendorFP,loc_disabled,FP_disabled,tax_disabled } = this.state;
    console.log(66, vendorType);
  }


  openPSD = v => {
    window.open(v);
  };

  render() {
    const {
      intl: { formatMessage },
      location: { pathname },
      count,
      clientPO,
      DAFInfo,
      params,
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
    console.log("DAFInfo", DAFInfo && DAFInfo.toJS());


    const renderOption = config => {
      if (config && config.length > 0) {
        return config.map(v => <Option key={v}>{v}</Option>);
      }
    };

    // console.log(320, this.form1, this.form2, this.form3);

    const renderSysId = (data, item) => {
      return data.map(v => <Option key={v.get(item)}>{v.get(item)}</Option>);
    };

    // Basic Info.
    const formColumns1 = [
      { dataIndex: _DAFDeT.name },
      { dataIndex: _DAFDeT.date },
      {
        dataIndex: _DAFDeT.purchaseType,
      },
      { dataIndex: _DAFDeT.clientDetailId },
      { dataIndex: _DAFDeT.projectName },
      { dataIndex: _DAFDeT.vendorDetailId },
      { dataIndex: _DAFDeT.GADUsr },
      {dataIndex: _DAFDeT.currencyId,},
      { dataIndex: _DAFDeT.budget },
      { dataIndex: _DAFDeT.description,span:24,labelSpan:5,valueSpan:19},
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `DAFDetail_${item.dataIndex}` }),
    }));
    // Business Info
    const formColumns2 = [
      {
        dataIndex: _DAFDeT.isWPP,span:12,
      },
      {
        dataIndex: _DAFDeT.service,span:12,
      },
      {
        dataIndex: _DAFDeT.reasonIndexs,span:24,labelSpan:5,valueSpan:19
      },
      {
        dataIndex: _DAFDeT.rationale,span:24,labelSpan:5,valueSpan:19

      }
    ].map(item => ({
      ...item,
      title: formatMessage({ id: `DAFDetail_${item.dataIndex}` }),
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
      if(DAFInfo){
        text=column.deep?DAFInfo.getIn(column.deep):DAFInfo.get(column.dataIndex)
      }else{
        text= ''
      }
      return (
        <Col key={column.dataIndex} span={column.span || 8 } className='payment-item'>
          {!column.noLabel&&<Col span={column.labelSpan||10}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`DAFDetail_${column.dataIndex}`})}</Col>}
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
          <Col span={column.labelSpan||10}  className="payment-label" style={{fontWeight:'bold'}}>{formatMessage({id:`DAFDetail_${column.dataIndex}`})}</Col>
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
           <Col span={6}>{formatMessage({ id: `${_tit.DAF}` })}</Col>
           <Col span={18}>{DAFInfo&&DAFInfo.toJS().name}</Col>
           {/* <Col span={12}><span className="icon-span status"></span>{formatMessage({ id: `${DAFInfo&&DAFInfo.toJS().flowStatus}`})}</Col> */}
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
          </Row>
          <Row style={{ marginTop: 40, textAlign: "center" }}>
            <Button
                onClick={() => {
                  const {dispatch,params} = this.props
                  dispatch(pathJump(`/DAF/DAF_detail_edit/${params.id}`))
                }}
                type="primary"
                size="large"
                style={{ marginRight: 10 }}
              >
                {formatMessage({ id: "edit" })}

              </Button>
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

DAFDetailShow.propTypes = {
  pathJump: React.PropTypes.func
};

const mapStateToProps = state => {
  console.log(354, state, state && state.toJS());
  //处理数据
  let _DAFInfo = state&&state.toJS()&&state.toJS().DAFDetailEdit&&state.toJS().DAFDetailEdit.DAFInfo
  if(_DAFInfo&&_DAFInfo.isWPP){
    _DAFInfo.isWPP = (_DAFInfo.isWPP==="Y")?"Yes":"No"
  }
  console.log(324,_DAFInfo)
  return {
    DAFInfo: Immutable.fromJS(_DAFInfo),
  };
};


export default Form.create()(
  injectIntl(connect(mapStateToProps)(DAFDetailShow))
);
