import StyledCard from "@components/styled-card";
import StyledInput from "@components/styled-input";
import { StashViewSettings } from "pages/poe/stash-view";

export function StashViewSearchCard({
  stashViewSettings,
  setStashViewSettings,
}: {
  stashViewSettings: StashViewSettings;
  setStashViewSettings: (e: StashViewSettings) => void;
}) {
  return (
    <>
      <StyledCard>
        <div className="flex flex-col space-y-2">
          <StyledInput
            value={stashViewSettings.searchString}
            placeholder="Search..."
            onChange={(e) => {
              setStashViewSettings({ ...stashViewSettings, searchString: e });
            }}
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-content-accent bg-gray-100 border-gray-300 rounded"
              checked={stashViewSettings.filterCheckedTabs}
              onChange={(e) => {
                setStashViewSettings({
                  ...stashViewSettings,
                  filterCheckedTabs: !stashViewSettings.filterCheckedTabs,
                });
              }}
            />
            <div>
              Filter ({stashViewSettings.checkedTabIds.length}) Selected Tabs
            </div>
          </div>
        </div>
      </StyledCard>
    </>
  );
}
