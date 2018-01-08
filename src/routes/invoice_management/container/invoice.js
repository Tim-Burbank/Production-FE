import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  'components-table-demo-nested ant-table-expanded-row > td:last-child': {
    'padding': [{ 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 48 }, { 'unit': 'px', 'value': 0 }, { 'unit': 'px', 'value': 8 }]
  },
  'components-table-demo-nested ant-table-expanded-row > td:last-child ant-table-thead th': {
    'borderBottom': [{ 'unit': 'px', 'value': 1 }, { 'unit': 'string', 'value': 'solid' }, { 'unit': 'string', 'value': '#e9e9e9' }]
  },
  'components-table-demo-nested ant-table-expanded-row > td:last-child ant-table-thead th:first-child': {
    'paddingLeft': [{ 'unit': 'px', 'value': 0 }]
  },
  'components-table-demo-nested ant-table-expanded-row > td:last-child ant-table-row td:first-child': {
    'paddingLeft': [{ 'unit': 'px', 'value': 0 }]
  },
  'components-table-demo-nested ant-table-expanded-row ant-table-row:last-child td': {
    'border': [{ 'unit': 'string', 'value': 'none' }]
  },
  'components-table-demo-nested ant-table-expanded-row ant-table-thead > tr > th': {
    'background': 'none'
  },
  'components-table-demo-nested table-operation a:not(:last-child)': {
    'marginRight': [{ 'unit': 'px', 'value': 24 }]
  },
  'row-invat': {
    'background': '#C7F5E6'
  },
  'row-incollect': {
    'background': '#E1F883'
  },
  'row-incollect-invat': {
    'background': '#BEFFBB'
  },
  'icon-span': {
    'display': 'inline-block',
    'padding': [{ 'unit': 'px', 'value': 6 }, { 'unit': 'px', 'value': 6 }, { 'unit': 'px', 'value': 6 }, { 'unit': 'px', 'value': 6 }],
    'borderRadius': '50%',
    'lineHeight': [{ 'unit': 'px', 'value': 16 }],
    'marginRight': [{ 'unit': 'px', 'value': 6 }],
    'position': 'relative',
    'top': [{ 'unit': 'px', 'value': 2 }]
  },
  'no-expand ant-table-row-expand-icon': {
    'display': 'none'
  }
});
