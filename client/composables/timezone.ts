import { getTimezoneFlag } from "@shared/dates"
import { computed } from "@vue/reactivity"
import { ref, toValue, type MaybeRefOrGetter, type Ref } from "vue"

export const overrideWithBrowserTimezone = ref(false)

export const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

export function useTimezoneSetting(customTimezone?: MaybeRefOrGetter<string | undefined>): {
  timezone: Ref<string>, flag: Ref<string>
} {
  const timezone = computed(() => {
    if (overrideWithBrowserTimezone.value) return browserTimezone
    return toValue(customTimezone) || browserTimezone
  })
  const flag = computed(() => getTimezoneFlag(timezone.value))
  return { timezone, flag }
}
