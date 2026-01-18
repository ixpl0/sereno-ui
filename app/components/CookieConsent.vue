<script setup lang="ts">
type CookieConsentValue = 'all' | 'essential' | null

const COOKIE_KEY = 'cookie_consent'

const consentCookie = useCookie<CookieConsentValue>(COOKIE_KEY, {
  default: () => null,
  maxAge: 60 * 60 * 24 * 365,
})

const isVisible = ref(false)
const isExpanded = ref(false)

const acceptAll = () => {
  consentCookie.value = 'all'
  isVisible.value = false
}

const acceptEssentialOnly = () => {
  consentCookie.value = 'essential'
  isVisible.value = false
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

onMounted(() => {
  if (consentCookie.value === null) {
    isVisible.value = true
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <div class="bg-base-100 shadow-2xl rounded-lg p-5 border border-base-300">
          <button
            type="button"
            class="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-base-content/50 hover:text-base-content transition-colors"
            aria-label="Закрыть"
            @click="acceptEssentialOnly"
          >
            <Icon
              name="lucide:x"
              class="w-4 h-4"
              aria-hidden="true"
            />
          </button>

          <h3 class="text-lg font-semibold text-base-content pr-6">
            Мы используем Cookies
          </h3>

          <p class="mt-2 text-sm text-base-content/70">
            Продолжая пользоваться сайтом, вы соглашаетесь на обработку
            обязательных cookie.
            <a
              href="/files/legal/privacy-policy.pdf"
              target="_blank"
              rel="noopener"
              class="text-primary hover:underline"
            >Прочитать Политику конфиденциальности</a>.
          </p>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-96"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 max-h-96"
            leave-to-class="opacity-0 max-h-0"
          >
            <div
              v-if="isExpanded"
              id="cookie-details"
              class="overflow-hidden"
            >
              <p class="mt-3 pt-3 border-t border-base-content/10 text-sm text-base-content/70">
                Мы используем файлы cookie для обеспечения работы сайта,
                анализа трафика и персонализации контента. Обязательные cookie
                необходимы для корректной работы сервиса и не могут быть отключены.
              </p>
            </div>
          </Transition>

          <div class="mt-4 flex items-center justify-between">
            <UiButton
              variant="primary"
              size="sm"
              @click="acceptAll"
            >
              Согласен
            </UiButton>

            <button
              type="button"
              class="flex items-center gap-1 text-sm text-base-content/60 hover:text-base-content transition-colors"
              :aria-expanded="isExpanded"
              aria-controls="cookie-details"
              @click="toggleExpanded"
            >
              <span>Подробности</span>
              <Icon
                name="lucide:chevron-up"
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': isExpanded }"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
