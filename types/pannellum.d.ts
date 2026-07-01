declare module "pannellum" {
  interface ViewerOptions {
    type: "equirectangular" | "cubemap" | "multires";
    panorama: string;
    autoLoad?: boolean;
    autoRotate?: number;
    showControls?: boolean;
    compass?: boolean;
    keyboardZoom?: boolean;
    mouseZoom?: boolean;
    hfov?: number;
    minHfov?: number;
    maxHfov?: number;
  }

  interface Viewer {
    destroy(): void;
  }

  export function viewer(element: HTMLElement | string, options: ViewerOptions): Viewer;
  
  const pannellum: {
    viewer: typeof viewer;
  };
  export default pannellum;
}

declare module "pannellum/build/pannellum.js";

declare global {
  interface Window {
    pannellum?: {
      viewer: (element: HTMLElement | string, options: any) => any;
    };
  }
}

