import React from "react";

declare global {
  namespace JSX {
    type ElementType = React.ReactNode | Promise<React.ReactNode>;
    interface Element extends ElementType {}
  }
}
