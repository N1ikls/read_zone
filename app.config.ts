export default defineAppConfig({
  ui: {
    checkbox: {
      slots: {
        base: 'ring-2 ring-[#0862E0]',
      },
      defaultVariants: {
        size: 'lg',
        color: 'info',
      },
    },
    table: {
      slots: {
        tbody: 'divide-y-0',
      },
    },
  },
});
