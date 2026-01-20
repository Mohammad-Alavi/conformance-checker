<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar elevation="2" color="surface">
      <template #prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none" />
      </template>

      <v-app-bar-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-check-decagram</v-icon>
        <span class="font-weight-bold">Conformance Checker</span>
      </v-app-bar-title>

      <template #append>
        <v-btn
          icon
          @click="toggleTheme"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>
        <v-btn
          icon
          href="https://github.com"
          target="_blank"
          title="View on GitHub"
        >
          <v-icon>mdi-github</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer (Mobile) -->
    <v-navigation-drawer v-model="drawer" temporary class="d-md-none">
      <v-list>
        <v-list-item prepend-icon="mdi-home" title="Home" to="/" />
        <v-list-item prepend-icon="mdi-information" title="About" @click="showAbout = true" />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <ConformanceChecker />
    </v-main>

    <!-- Footer -->
    <v-footer app class="text-center d-flex flex-column">
      <div class="text-medium-emphasis text-caption">
        Powered by n8n workflows and AI
      </div>
      <v-divider class="my-2" />
      <div class="text-caption">
        {{ new Date().getFullYear() }} - Conformance Checker
      </div>
    </v-footer>

    <!-- About Dialog -->
    <v-dialog v-model="showAbout" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-information</v-icon>
          About Conformance Checker
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            The Conformance Checker is an AI-powered tool that validates your objectives and goals
            against established conformance rules.
          </p>
          <h4 class="text-subtitle-1 font-weight-bold mb-2">Features:</h4>
          <ul class="mb-4">
            <li>Validate Objectives (time-bound, measurable targets)</li>
            <li>Validate Goals (aspirational outcomes)</li>
            <li>Get detailed violation analysis</li>
            <li>Receive quick fix suggestions</li>
            <li>Apply fixes with one click</li>
          </ul>
          <v-alert type="info" variant="tonal" density="compact">
            <strong>Tip:</strong> Objectives should have specific timelines and metrics,
            while Goals should be aspirational without specific numbers.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="showAbout = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import ConformanceChecker from '@/components/ConformanceChecker.vue'

const theme = useTheme()
const drawer = ref(false)
const showAbout = ref(false)

const isDark = computed(() => theme.global.current.value.dark)

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
</style>
