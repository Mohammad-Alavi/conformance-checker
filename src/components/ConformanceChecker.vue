<template>
  <v-container class="conformance-checker" fluid>
    <!-- Header -->
    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="10" lg="8">
        <div class="text-center">
          <h1 class="text-h3 font-weight-bold mb-2">
            <v-icon size="large" color="primary" class="mr-2">mdi-check-decagram</v-icon>
            Conformance Checker
          </h1>
          <p class="text-body-1 text-medium-emphasis">
            Validate your objectives and goals against conformance rules using AI-powered analysis
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Input Form -->
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="4" class="pa-6" rounded="lg">
          <v-card-title class="text-h5 mb-4">
            <v-icon class="mr-2">mdi-pencil-outline</v-icon>
            Check Your Content
          </v-card-title>

          <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
            <!-- Content Type Selection -->
            <v-btn-toggle
              v-model="contentType"
              mandatory
              color="primary"
              variant="outlined"
              divided
              class="mb-6 w-100"
            >
              <v-btn value="objective" class="flex-grow-1" size="large">
                <v-icon start>mdi-target</v-icon>
                Objective
                <v-tooltip activator="parent" location="bottom">
                  Time-bound, measurable targets with specific deadlines
                </v-tooltip>
              </v-btn>
              <v-btn value="goal" class="flex-grow-1" size="large">
                <v-icon start>mdi-flag-checkered</v-icon>
                Goal
                <v-tooltip activator="parent" location="bottom">
                  Aspirational outcomes without specific timelines or metrics
                </v-tooltip>
              </v-btn>
            </v-btn-toggle>

            <!-- Title Input -->
            <v-textarea
              v-model="title"
              label="Title"
              :placeholder="titlePlaceholder"
              :rules="[rules.required, rules.minLength(10)]"
              variant="outlined"
              rows="3"
              auto-grow
              counter
              class="mb-4"
              :hint="titleHint"
              persistent-hint
            >
              <template #prepend-inner>
                <v-icon color="primary">mdi-format-title</v-icon>
              </template>
            </v-textarea>

            <!-- Description Input -->
            <v-textarea
              v-model="description"
              label="Description (Optional)"
              placeholder="Provide additional context or details..."
              variant="outlined"
              rows="2"
              auto-grow
              counter
              class="mb-4"
              hint="Add context that complements but doesn't repeat the title"
              persistent-hint
            >
              <template #prepend-inner>
                <v-icon color="secondary">mdi-text-box-outline</v-icon>
              </template>
            </v-textarea>

            <!-- Submit Button -->
            <v-btn
              type="submit"
              color="primary"
              size="x-large"
              block
              :loading="loading"
              :disabled="!formValid || loading"
              class="mt-4"
            >
              <v-icon start>mdi-magnify-scan</v-icon>
              Check Conformance
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-row v-if="error" justify="center" class="mt-6">
      <v-col cols="12" md="10" lg="8">
        <v-alert type="error" variant="tonal" closable @click:close="resetError">
          <v-alert-title>Error</v-alert-title>
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Loading Skeleton -->
    <v-row v-if="loading" justify="center" class="mt-6">
      <v-col cols="12" md="10" lg="8">
        <LoadingSkeleton />
      </v-col>
    </v-row>

    <!-- Results Section -->
    <v-row v-else-if="result" justify="center" class="mt-6">
      <v-col cols="12" md="10" lg="8">
        <ConformanceResult
          :result="result"
          :content-type="contentType"
          :original-title="title"
          :original-description="description"
          @apply-fix="applyFix"
        />
      </v-col>
    </v-row>

    <!-- Examples Section -->
    <v-row justify="center" class="mt-8">
      <v-col cols="12" md="10" lg="8">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
              Examples & Guidelines
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <h4 class="text-h6 mb-2 text-success">
                    <v-icon color="success">mdi-target</v-icon>
                    Good Objectives
                  </h4>
                  <ul class="text-body-2">
                    <li>Increase forest coverage by 20% by Q4 2025</li>
                    <li>Train 500 community members in sustainable practices within 18 months</li>
                    <li>Reduce deforestation rate by 30% by December 2026</li>
                  </ul>
                </v-col>
                <v-col cols="12" md="6">
                  <h4 class="text-h6 mb-2 text-info">
                    <v-icon color="info">mdi-flag-checkered</v-icon>
                    Good Goals
                  </h4>
                  <ul class="text-body-2">
                    <li>Create sustainable forest ecosystems</li>
                    <li>Establish resilient communities through environmental stewardship</li>
                    <li>Restore degraded landscapes to support biodiversity</li>
                  </ul>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useConformanceApi } from '@/composables/useConformanceApi'
import ConformanceResult from './ConformanceResult.vue'
import LoadingSkeleton from './LoadingSkeleton.vue'

const { loading, error, result, checkConformance, reset } = useConformanceApi()

const formRef = ref(null)
const formValid = ref(false)
const contentType = ref('objective')
const title = ref('')
const description = ref('')

const rules = {
  required: (v) => !!v || 'This field is required',
  minLength: (min) => (v) => (v && v.length >= min) || `Minimum ${min} characters required`,
}

const titlePlaceholder = computed(() => {
  return contentType.value === 'objective'
    ? 'e.g., Increase forest coverage by 20% in the northern region by Q4 2025'
    : 'e.g., Create sustainable forest ecosystems that support biodiversity'
})

const titleHint = computed(() => {
  return contentType.value === 'objective'
    ? 'Objectives should be time-bound, measurable, and specific'
    : 'Goals should be aspirational without specific timelines or metrics'
})

async function handleSubmit() {
  if (!formValid.value) return

  try {
    await checkConformance(contentType.value, title.value, description.value)
  } catch (e) {
    // Error is handled by the composable
  }
}

function resetError() {
  reset()
}

function applyFix(fix) {
  if (fix.field === 'title' && fix.result_preview) {
    title.value = fix.result_preview
  } else if (fix.field === 'description' && fix.result_preview) {
    description.value = fix.result_preview
  }
}
</script>

<style scoped>
.conformance-checker {
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.w-100 {
  width: 100%;
}
</style>
