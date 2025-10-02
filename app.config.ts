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
    input: {
      slots: {
        base: 'focus:bg-[none] placeholder:text-[#C2C2C2] placeholder:italic placeholder-text-base',
      },
      variants: {
        variant: {
          subtle: 'ring-0',
        },
        color: {
          secondary: 'bg-[#F5F5F5]',
        },
      },
    },
  },
});
