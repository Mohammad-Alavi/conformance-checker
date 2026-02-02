<template>
  <div class="conformance-checker">
    <!-- Form Card -->
    <v-card class="form-card mb-6" elevation="2">
      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <!-- Type Selection with Clear Labels -->
          <div class="type-selection mb-6">
            <label class="text-body-2 text-medium-emphasis d-block mb-2">What are you validating?</label>
            <v-btn-toggle
              v-model="contentType"
              mandatory
              color="primary"
              variant="outlined"
              class="type-toggle ga-3"
            >
              <v-btn value="objective" class="px-6">
                <v-icon start>mdi-target</v-icon>
                Objective
                <v-tooltip activator="parent" location="bottom" max-width="250">
                  <span>Time-bound targets with specific metrics and deadlines</span>
                </v-tooltip>
              </v-btn>
              <v-btn value="goal" class="px-6">
                <v-icon start>mdi-flag-checkered</v-icon>
                Goal
                <v-tooltip activator="parent" location="bottom" max-width="250">
                  <span>Aspirational outcomes without specific numbers</span>
                </v-tooltip>
              </v-btn>
            </v-btn-toggle>
          </div>

          <!-- Main Input with Helper Text -->
          <v-textarea
            v-model="title"
            :label="contentType === 'objective' ? 'Your Objective' : 'Your Goal'"
            :placeholder="titlePlaceholder"
            :rules="[rules.required, rules.minLength(10)]"
            variant="outlined"
            rows="2"
            auto-grow
            clearable
            class="mb-2"
          >
            <template #details>
              <span class="text-caption">
                {{ contentType === 'objective'
                  ? 'Include specific metrics, quantities, and a deadline'
                  : 'Describe your aspirational outcome without specific numbers'
                }}
              </span>
            </template>
          </v-textarea>

          <!-- Optional Description (always visible) -->
          <v-textarea
            v-model="description"
            label="Additional Context (Optional)"
            placeholder="Add any extra details that help explain your objective or goal..."
            variant="outlined"
            rows="2"
            auto-grow
            clearable
            class="mb-2"
          />

          <!-- Action Row -->
          <div class="d-flex justify-end mt-4">
            <v-btn
              type="submit"
              color="primary"
              size="large"
              :loading="loading"
              :disabled="!formValid || loading"
              class="px-8"
            >
              <v-icon start>mdi-check-circle</v-icon>
              Validate
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-6"
      @click:close="resetError"
    >
      <template #title>Validation Error</template>
      {{ error }}
    </v-alert>

    <!-- Loading State -->
    <v-card v-if="loading" class="loading-card pa-8 text-center" variant="outlined">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
        width="4"
        class="mb-4"
      />
      <p class="text-body-1 text-medium-emphasis mb-1">Analyzing your {{ contentType }}...</p>
      <p class="text-caption text-disabled">This usually takes a few seconds</p>
    </v-card>

    <!-- Results Section -->
    <v-slide-y-transition>
      <ConformanceResult
        v-if="result && !loading"
        :result="result"
        :content-type="contentType"
        :original-title="title"
        :original-description="description"
        @apply-fix="applyFix"
        @action="handleAction"
      />
    </v-slide-y-transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useConformanceApi } from '@/composables/useConformanceApi'
import ConformanceResult from './ConformanceResult.vue'

const { loading, error, result, checkConformance, reset } = useConformanceApi()

const formRef = ref(null)
const formValid = ref(false)
const contentType = ref('objective')
const title = ref('')
const description = ref('')

const rules = {
  required: (v) => !!v || 'This field is required',
  minLength: (min) => (v) => (v && v.length >= min) || `Please enter at least ${min} characters`,
}

const titlePlaceholder = computed(() => {
  return contentType.value === 'objective'
    ? 'e.g., Reduce operational costs by 15% through automation by December 2025'
    : 'e.g., Become the industry leader in sustainable manufacturing practices'
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

function handleAction(action) {
  // Handle secondary actions from ui_hints and conversion actions
  if (action.includes('goal')) {
    contentType.value = 'goal'
  } else if (action.includes('objective')) {
    contentType.value = 'objective'
  }
  // Only reset if it's not a conversion action (we want to keep the converted content)
  if (!action.startsWith('switch_to_')) {
    reset()
  }
}
</script>

<style scoped>
.conformance-checker {
  width: 100%;
}

.form-card {
  border-radius: 12px;
}

.type-toggle {
  width: 100%;
}

.type-toggle .v-btn {
  flex: 1;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  border-radius: 4px !important;
}

.type-toggle .v-btn.v-btn--active {
  border-color: rgb(var(--v-theme-primary)) !important;
}

.loading-card {
  border-radius: 12px;
}
</style>
