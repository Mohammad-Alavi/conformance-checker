<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar elevation="0" color="transparent" class="app-bar-blur">
      <v-app-bar-title class="d-flex align-center">
        <router-link to="/" class="logo-link d-flex align-center text-decoration-none">
          <v-icon color="primary" size="28" class="mr-2">mdi-brain</v-icon>
          <span class="text-h6 font-weight-bold">Conformance AI</span>
          <v-chip size="x-small" color="primary" variant="flat" class="ml-2">DEMO</v-chip>
        </router-link>
      </v-app-bar-title>

      <template #append>
        <!-- Navigation Tabs -->
        <v-tabs
          :model-value="currentRoute"
          color="primary"
          class="nav-tabs mr-4"
          density="compact"
        >
          <v-tab
            to="/"
            value="home"
            class="text-none"
          >
            <v-icon start size="small">mdi-home</v-icon>
            Validator
          </v-tab>
          <v-tab
            to="/rules"
            value="rules"
            class="text-none"
          >
            <v-icon start size="small">mdi-book-cog</v-icon>
            Rules
          </v-tab>
        </v-tabs>

        <v-btn
          variant="text"
          class="mr-2"
          @click="showAbout = true"
        >
          <v-icon start>mdi-information-outline</v-icon>
          <span class="d-none d-sm-inline">How it works</span>
        </v-btn>
        <v-btn
          icon
          variant="text"
          @click="toggleTheme"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Main Content with Router View -->
    <v-main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <!-- Footer -->
    <v-footer class="footer-minimal py-4">
      <v-container>
        <div class="d-flex align-center justify-center flex-wrap ga-2 text-medium-emphasis text-caption">
          <span>Built by</span>
          <a href="https://explorer.land/" target="_blank" rel="noopener" class="explorer-link d-inline-flex align-center">
            <v-icon size="16" class="mr-1">mdi-compass</v-icon>
            <span class="font-weight-medium">Explorer.land</span>
          </a>
          <v-divider vertical class="mx-2" />
          <span>&copy; {{ new Date().getFullYear() }} Conformance AI</span>
          <v-divider vertical class="mx-2" />
          <v-chip size="x-small" color="primary" variant="outlined">Proof of Concept</v-chip>
        </div>
      </v-container>
    </v-footer>

    <!-- How it Works Dialog -->
    <v-dialog v-model="showAbout" max-width="600">
      <v-card class="pa-2">
        <v-card-title class="text-h5 d-flex align-center pt-4">
          <v-icon color="primary" class="mr-3" size="28">mdi-brain</v-icon>
          How Conformance AI Works
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="text-body-1 mb-4">
            Conformance AI is a flexible validation engine that checks inputs against configurable rulesets using advanced language models.
          </p>

          <!-- Architecture Highlight -->
          <v-alert
            variant="tonal"
            color="info"
            density="compact"
            class="mb-4"
          >
            <template #prepend>
              <v-icon>mdi-cog-outline</v-icon>
            </template>
            <div class="text-body-2">
              <strong>Flexible Architecture:</strong> The underlying engine supports any ruleset. This demo uses "Goals & Objectives" as an example validation scenario.
            </div>
          </v-alert>

          <h4 class="text-subtitle-2 font-weight-medium mb-3">Demo Ruleset: Goals & Objectives</h4>
          <v-row class="mb-4">
            <v-col cols="12" sm="6">
              <v-card variant="tonal" color="primary" class="pa-4 h-100">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2">mdi-target</v-icon>
                  <span class="font-weight-bold">Objectives</span>
                </div>
                <p class="text-body-2 mb-0">
                  Time-bound, measurable targets with specific metrics and deadlines.
                </p>
                <p class="text-caption text-medium-emphasis mt-2 mb-0 font-italic">
                  "Reduce CO2 emissions by 25% by December 2025"
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card variant="tonal" color="secondary" class="pa-4 h-100">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2">mdi-flag-checkered</v-icon>
                  <span class="font-weight-bold">Goals</span>
                </div>
                <p class="text-body-2 mb-0">
                  Aspirational outcomes that define your vision without specific numbers.
                </p>
                <p class="text-caption text-medium-emphasis mt-2 mb-0 font-italic">
                  "Create a sustainable and carbon-neutral organization"
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <h4 class="text-subtitle-1 font-weight-bold mb-3">What You'll Get:</h4>
          <v-list density="compact" class="bg-transparent">
            <v-list-item prepend-icon="mdi-check-circle" class="px-0">
              <v-list-item-title class="text-body-2">Conformance score and confidence rating</v-list-item-title>
            </v-list-item>
            <v-list-item prepend-icon="mdi-alert-circle" class="px-0">
              <v-list-item-title class="text-body-2">Detailed violation analysis with severity levels</v-list-item-title>
            </v-list-item>
            <v-list-item prepend-icon="mdi-auto-fix" class="px-0">
              <v-list-item-title class="text-body-2">One-click quick fixes to improve your text</v-list-item-title>
            </v-list-item>
            <v-list-item prepend-icon="mdi-lightbulb-on" class="px-0">
              <v-list-item-title class="text-body-2">Suggestions with example improvements</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />

          <h4 class="text-subtitle-1 font-weight-bold mb-3">Rules Management:</h4>
          <p class="text-body-2 mb-0">
            Visit the <router-link to="/rules" class="text-primary" @click="showAbout = false">Rules page</router-link> to view, create, edit, and manage the validation rules that power the conformance engine.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="showAbout = false" size="large">
            Got it!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useRoute } from 'vue-router'

const theme = useTheme()
const route = useRoute()
const showAbout = ref(false)

const isDark = computed(() => theme.global.current.value.dark)
const currentRoute = computed(() => {
  if (route.path === '/rules') return 'rules'
  return 'home'
})

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}
</script>

<style>
/* Global styles */
html {
  overflow-y: auto !important;
}

.v-application {
  font-family: 'Roboto', sans-serif;
}

.app-bar-blur {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.8) !important;
}

.logo-link {
  color: inherit;
}

.logo-link:hover {
  opacity: 0.9;
}

.nav-tabs .v-tab {
  min-width: auto;
  padding: 0 16px;
}

.footer-minimal {
  background: transparent !important;
}

.explorer-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  transition: opacity 0.2s;
}

.explorer-link:hover {
  opacity: 0.8;
}

/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
