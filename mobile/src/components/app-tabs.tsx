import { NativeTabs } from "expo-router/native-tabs";
import { colors } from "@/components/ui";
import { useLarder } from "@/lib/larder/store";

export default function AppTabs() {
  const onboarded = useLarder((s) => s.onboarded);
  const count = useLarder((s) => s.list.filter((row) => !row.checked).length);

  return (
    <NativeTabs
      hidden={!onboarded}
      tintColor={colors.primary}
      backgroundColor={colors.bg}
      badgeBackgroundColor={colors.primary}
      labelStyle={{
        default: { color: colors.muted },
        selected: { color: colors.primary },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md={{ default: "home", selected: "home_filled" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cook">
        <NativeTabs.Trigger.Label>Cook</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" md="restaurant" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pantry">
        <NativeTabs.Trigger.Label>Pantry</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "archivebox", selected: "archivebox.fill" }}
          md="inventory_2"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="list">
        <NativeTabs.Trigger.Label>List</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "cart", selected: "cart.fill" }} md="shopping_cart" />
        {count > 0 ? <NativeTabs.Trigger.Badge>{String(count)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>Plan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
