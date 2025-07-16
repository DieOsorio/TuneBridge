import { ReactNode } from "react";
import { RolesProvider } from "./RolesContext";
import { InstrumentDetailsProvider } from "./InstrumentDetailsContext";
import { SingerDetailsProvider } from "./SingerDetailsContext";
import { DjDetailsProvider } from "./DjDetailsContext";
import { ProducerDetailsProvider } from "./ProducerDetailsContext";
import { ComposerDetailsProvider } from "./ComposerDetailsContext";
import { MediaLinksProvider } from "./MediaLinksContext";

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider = ({ children }: MusicProviderProps) => {
  return (
    <RolesProvider>
      <MediaLinksProvider>
        <InstrumentDetailsProvider>
          <SingerDetailsProvider>
            <DjDetailsProvider>
              <ProducerDetailsProvider>
                <ComposerDetailsProvider>{children}</ComposerDetailsProvider>
              </ProducerDetailsProvider>
            </DjDetailsProvider>
          </SingerDetailsProvider>
        </InstrumentDetailsProvider>
      </MediaLinksProvider>
    </RolesProvider>
  );
};
