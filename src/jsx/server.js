import { Fragment } from "react";

export function jsx(type, props, ...children) {
  if (type === Fragment) {
    return {
      type: Fragment,
      props: { ...props, children: children.flat() },
    };
  }

  return {
    type,
    props: {
      ...props,
      children: children.flat(),
    },
  };
}

export function jsxs(type, props) {
  return jsx(type, props);
}

export function jsxDEV(type, props) {
  return jsx(type, props);
}
