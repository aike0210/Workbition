declare module '*.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.sass' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.less' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.svg' {
  import * as React from 'react'
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}

declare module '*.bmp' {
  const src: string
  export default src
}

declare module '*.mp4' {
  const src: string
  export default src
}

declare module '*.webm' {
  const src: string
  export default src
}

declare module '*.ogg' {
  const src: string
  export default src
}

declare module '*.mp3' {
  const src: string
  export default src
}

declare module '*.wav' {
  const src: string
  export default src
}

declare module '*.flac' {
  const src: string
  export default src
}

declare module '*.aac' {
  const src: string
  export default src
}

declare module '*.woff' {
  const src: string
  export default src
}

declare module '*.woff2' {
  const src: string
  export default src
}

declare module '*.eot' {
  const src: string
  export default src
}

declare module '*.ttf' {
  const src: string
  export default src
}

declare module '*.otf' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_ENABLE_WEBSOCKET: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_ENABLE_FILE_UPLOAD: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_ENABLE_DEVTOOLS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}