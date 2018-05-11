import * as React from 'react';

export default (Page: React.ComponentClass<any>) => {
  if (document.currentScript && (document.currentScript as HTMLScriptElement).src
    && (document.currentScript as any).__defer__
  ) {
    (document.currentScript as any).__defer__.resolve(Page);
  }
}
