import { StorePersistor, StoreProvider } from "@/hooks/useStore";
import { enableStaticRendering } from "mobx-react-lite";
import type { AppProps } from "next/app";

enableStaticRendering(typeof window === undefined);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <StoreProvider>
        <StorePersistor>
          <Component {...pageProps} />
        </StorePersistor>
      </StoreProvider>
    </>
  );
}
