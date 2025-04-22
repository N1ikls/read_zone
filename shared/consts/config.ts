import type {
  AliasToken,
  OverrideToken,
} from 'ant-design-vue/es/theme/interface';

const components: OverrideToken = {
  Button: {
    borderRadius: 10,
    borderRadiusSM: 10,
    borderRadiusLG: 10,
    borderRadiusOuter: 10,
    borderRadiusXS: 10,
    colorText: '#050505',
    colorLink: '#050505',
  },
};

export const theme = {
  token: {
    colorPrimary: '#0862E0',
    colorPrimaryHover: '#0048B8',
    colorPrimaryActive: '#003386',
    borderRadius: 7,
    colorLink: '#050505',
    colorLinkActive: '#050505',
    colorLinkHover: '#050505',
    fontFamily: '"Lato", "Lato Fallback: Arial", sans-serif',
  } as AliasToken,
};
