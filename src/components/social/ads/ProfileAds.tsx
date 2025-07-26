import { useTranslation } from "react-i18next";
import { useAds } from "../../../context/social/adsContext";
import { useAuth } from "../../../context/AuthContext";

import ErrorMessage from "../../../utils/ErrorMessage";
import AdCard from "./AdCard";
import ShinyText from "../../ui/ShinyText";
import PlusButton from "../../ui/PlusButton";
import AdsListSkeleton from "./skeletons/AdsListSkeleton";
import Button from "../../ui/Button";

import type { MusicianAd } from "../../../context/social/adsActions";

interface ProfileAdsProps {
  profileId: string;
}

const ProfileAds: React.FC<ProfileAdsProps> = ({ profileId }) => {
  const { t } = useTranslation("ads");
  const { user } = useAuth();
  const { fetchInfiniteByUser } = useAds();

  const {
    data: ads,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = fetchInfiniteByUser(profileId);

  const ownProfile = user?.id === profileId;

  if (isLoading) return <AdsListSkeleton isProfileView />;
  if (error) return <ErrorMessage error={error.message} />;

  const userAds: MusicianAd[] = ads ? ads.pages.flat() : [];

  return (
    <div className="mx-auto text-center w-full">
      <h2 className="text-center font-semibold mb-4">
        <ShinyText
          text={t("profileAds.title")}
          speed={3}
          className="text-3xl tracking-wide"
        />
      </h2>

      {ownProfile && (
        <PlusButton
          label={t("adsPage.buttons.createAd")}
          to="/ads/new"
          showLabelOnMobile={true}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userAds.length > 0 ? (
          userAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} publisherId={profileId} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400">
            {t("profileAds.empty")}
          </p>
        )}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <Button
          className="!w-1/2 md:!w-1/3 !font-bold mt-4 !mx-auto hover:!text-sky-600"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage
            ? t("profileAds.buttons.loading")
            : t("profileAds.buttons.loadMore")}
        </Button>
      )}
    </div>
  );
};

export default ProfileAds;
