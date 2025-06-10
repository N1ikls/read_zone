import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';

export const theme: ThemeConfig = {
  components: {
    Button: {
      borderRadius: 10,
      borderRadiusSM: 10,
      borderRadiusLG: 10,
      borderRadiusOuter: 10,
      borderRadiusXS: 10,
      colorText: '#050505',
      colorLink: '#050505',
    },
    Breadcrumb: {
      fontSize: 15,
      fontWeightStrong: 400,
    },
  },
  token: {
    colorPrimary: '#0862E0',
    colorPrimaryHover: '#0048B8',
    colorPrimaryActive: '#003386',
    colorLink: '#050505',
    colorLinkActive: '#050505',
    colorLinkHover: '#050505',
    fontFamily: '"Lato", "Lato Fallback: Arial", sans-serif',
  },
};
