/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_HUME_API_KEY?: string;
  readonly VITE_ACRCLOUD_ACCESS_KEY?: string;
  readonly VITE_ACRCLOUD_ACCESS_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
