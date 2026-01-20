<template>
  <div class="conformance-result">
    <!-- Overall Score Card -->
    <v-card
      :color="overallCardColor"
      variant="tonal"
      class="mb-6"
      rounded="lg"
    >
      <v-card-item>
        <template #prepend>
          <v-avatar :color="isConformant ? 'success' : 'error'" size="64">
            <v-icon size="32">{{ isConformant ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
          </v-avatar>
        </template>
        <v-card-title class="text-h5">
          {{ isConformant ? 'Conformant' : 'Non-Conformant' }}
        </v-card-title>
        <v-card-subtitle>
          {{ conformance?.overall_message || 'Analysis complete' }}
        </v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <v-row>
          <!-- Conformance Score -->
          <v-col cols="6" sm="3">
            <div class="text-center">
              <v-progress-circular
                :model-value="conformanceScore"
                :color="getScoreColor(conformanceScore)"
                :size="80"
                :width="8"
              >
                <span class="text-h6 font-weight-bold">{{ conformanceScore }}%</span>
              </v-progress-circular>
              <div class="text-caption mt-2">Conformance</div>
            </div>
          </v-col>

          <!-- Confidence Score -->
          <v-col cols="6" sm="3">
            <div class="text-center">
              <v-progress-circular
                :model-value="confidenceScore"
                color="info"
                :size="80"
                :width="8"
              >
                <span class="text-h6 font-weight-bold">{{ confidenceScore }}%</span>
              </v-progress-circular>
              <div class="text-caption mt-2">Confidence</div>
            </div>
          </v-col>

          <!-- Distance to Conformance -->
          <v-col cols="6" sm="3">
            <div class="text-center">
              <v-progress-circular
                :model-value="100 - distanceToConformance"
                :color="getScoreColor(100 - distanceToConformance)"
                :size="80"
                :width="8"
              >
                <span class="text-h6 font-weight-bold">{{ distanceToConformance }}%</span>
              </v-progress-circular>
              <div class="text-caption mt-2">Distance</div>
            </div>
          </v-col>

          <!-- Type Assessment -->
          <v-col cols="6" sm="3">
            <div class="text-center">
              <v-avatar :color="typeMatches ? 'success' : 'warning'" size="80">
                <v-icon size="40">{{ typeIcon }}</v-icon>
              </v-avatar>
              <div class="text-caption mt-2">
                {{ detectedType }}
                <v-chip v-if="!typeMatches" size="x-small" color="warning" class="ml-1">
                  Mismatch
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Type Mismatch Warning -->
    <v-alert
      v-if="typeAssessment?.is_mismatch"
      type="warning"
      variant="tonal"
      class="mb-6"
      rounded="lg"
    >
      <v-alert-title>
        <v-icon class="mr-1">mdi-swap-horizontal</v-icon>
        Content Type Mismatch
      </v-alert-title>
      <p class="mb-2">
        This content was submitted as a <strong>{{ contentType }}</strong> but appears to be a
        <strong>{{ typeAssessment?.detected_type }}</strong>.
      </p>
      <div v-if="alternatives.length > 0">
        <p class="text-subtitle-2 mb-2">Suggested alternatives:</p>
        <v-chip
          v-for="alt in alternatives"
          :key="alt.type"
          class="mr-2 mb-2"
          color="info"
          variant="outlined"
        >
          {{ alt.type }}: {{ alt.suggested_content }}
        </v-chip>
      </div>
    </v-alert>

    <!-- Tabs for Details -->
    <v-tabs v-model="activeTab" color="primary" grow class="mb-4">
      <v-tab value="violations" :disabled="violations.length === 0">
        <v-badge :content="violations.length" :color="violations.length > 0 ? 'error' : 'grey'" inline>
          <v-icon start>mdi-alert-octagon</v-icon>
          Violations
        </v-badge>
      </v-tab>
      <v-tab value="strengths" :disabled="strengths.length === 0">
        <v-badge :content="strengths.length" :color="strengths.length > 0 ? 'success' : 'grey'" inline>
          <v-icon start>mdi-check-bold</v-icon>
          Strengths
        </v-badge>
      </v-tab>
      <v-tab value="quickfixes" :disabled="quickFixes.length === 0">
        <v-badge :content="quickFixes.length" :color="quickFixes.length > 0 ? 'info' : 'grey'" inline>
          <v-icon start>mdi-wrench</v-icon>
          Quick Fixes
        </v-badge>
      </v-tab>
      <v-tab value="suggestions" :disabled="suggestions.length === 0">
        <v-badge :content="suggestions.length" :color="suggestions.length > 0 ? 'primary' : 'grey'" inline>
          <v-icon start>mdi-lightbulb</v-icon>
          Suggestions
        </v-badge>
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <!-- Violations Tab -->
      <v-tabs-window-item value="violations">
        <v-card variant="outlined" rounded="lg">
          <v-list v-if="violations.length > 0" lines="three">
            <v-list-item
              v-for="(violation, index) in violations"
              :key="index"
              :class="getSeverityClass(violation.severity)"
            >
              <template #prepend>
                <v-avatar :color="getSeverityColor(violation.severity)" size="40">
                  <v-icon color="white">{{ getSeverityIcon(violation.severity) }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ violation.rule_id }}: {{ violation.message }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ violation.details || violation.description }}
              </v-list-item-subtitle>
              <template #append>
                <v-chip :color="getSeverityColor(violation.severity)" size="small" variant="flat">
                  {{ violation.severity }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center text-medium-emphasis">
            <v-icon size="48" class="mb-2">mdi-party-popper</v-icon>
            <p>No violations found!</p>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Strengths Tab -->
      <v-tabs-window-item value="strengths">
        <v-card variant="outlined" rounded="lg">
          <v-list v-if="strengths.length > 0" lines="two">
            <v-list-item v-for="(strength, index) in strengths" :key="index">
              <template #prepend>
                <v-avatar color="success" size="40">
                  <v-icon color="white">mdi-check</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ strength.rule_id || `Strength ${index + 1}` }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ strength.message || strength }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center text-medium-emphasis">
            <v-icon size="48" class="mb-2">mdi-emoticon-neutral</v-icon>
            <p>No specific strengths identified</p>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Quick Fixes Tab -->
      <v-tabs-window-item value="quickfixes">
        <v-card variant="outlined" rounded="lg">
          <v-list v-if="quickFixes.length > 0" lines="three">
            <v-list-item v-for="(fix, index) in quickFixes" :key="index">
              <template #prepend>
                <v-avatar color="info" size="40">
                  <v-icon color="white">mdi-auto-fix</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ fix.action || fix.type }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ fix.description }}
              </v-list-item-subtitle>
              <div v-if="fix.result_preview" class="mt-2">
                <v-chip color="success" variant="tonal" class="text-wrap" style="white-space: normal; height: auto;">
                  <v-icon start>mdi-arrow-right</v-icon>
                  {{ fix.result_preview }}
                </v-chip>
              </div>
              <template #append>
                <v-btn
                  v-if="fix.result_preview"
                  color="primary"
                  variant="tonal"
                  size="small"
                  @click="$emit('apply-fix', fix)"
                >
                  <v-icon start>mdi-check</v-icon>
                  Apply
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center text-medium-emphasis">
            <v-icon size="48" class="mb-2">mdi-wrench-outline</v-icon>
            <p>No quick fixes available</p>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Suggestions Tab -->
      <v-tabs-window-item value="suggestions">
        <v-card variant="outlined" rounded="lg">
          <v-list v-if="suggestions.length > 0" lines="two">
            <v-list-item v-for="(suggestion, index) in suggestions" :key="index">
              <template #prepend>
                <v-avatar color="primary" size="40">
                  <v-icon color="white">mdi-lightbulb-on</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ suggestion.category || `Suggestion ${index + 1}` }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ suggestion.message || suggestion.text || suggestion }}
              </v-list-item-subtitle>
              <div v-if="suggestion.example" class="mt-2">
                <v-chip color="info" variant="tonal" size="small">
                  Example: {{ suggestion.example }}
                </v-chip>
              </div>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center text-medium-emphasis">
            <v-icon size="48" class="mb-2">mdi-lightbulb-off-outline</v-icon>
            <p>No additional suggestions</p>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- UI Hints -->
    <v-card v-if="uiHints && Object.keys(uiHints).length > 0" class="mt-6" variant="outlined" rounded="lg">
      <v-card-title class="text-subtitle-1">
        <v-icon class="mr-2">mdi-information-outline</v-icon>
        Recommended Actions
      </v-card-title>
      <v-card-text>
        <v-chip-group>
          <v-chip
            v-if="uiHints.show_type_conversion"
            color="warning"
            variant="flat"
            prepend-icon="mdi-swap-horizontal"
          >
            Consider converting content type
          </v-chip>
          <v-chip
            v-if="uiHints.highlight_violations"
            color="error"
            variant="flat"
            prepend-icon="mdi-alert"
          >
            Review violations
          </v-chip>
          <v-chip
            v-if="uiHints.suggest_rewrite"
            color="info"
            variant="flat"
            prepend-icon="mdi-pencil"
          >
            Consider rewriting
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  originalTitle: {
    type: String,
    default: '',
  },
  originalDescription: {
    type: String,
    default: '',
  },
})

defineEmits(['apply-fix'])

const activeTab = ref('violations')

// Computed properties for easy access
const conformance = computed(() => props.result?.conformance || {})
const analysis = computed(() => props.result?.analysis || {})
const typeAssessment = computed(() => analysis.value?.type_assessment || {})

const isConformant = computed(() => conformance.value?.is_conformant === true)
const conformanceScore = computed(() => Math.round((conformance.value?.conformance_score || 0) * 100))
const confidenceScore = computed(() => Math.round((conformance.value?.confidence_score || 0) * 100))
const distanceToConformance = computed(() => Math.round((conformance.value?.distance_to_conformance || 0) * 100))

const detectedType = computed(() => typeAssessment.value?.detected_type || props.contentType)
const typeMatches = computed(() => !typeAssessment.value?.is_mismatch)
const alternatives = computed(() => typeAssessment.value?.alternatives || [])
const uiHints = computed(() => typeAssessment.value?.ui_hints || {})

const violations = computed(() => analysis.value?.violations || [])
const strengths = computed(() => analysis.value?.strengths || [])
const quickFixes = computed(() => props.result?.quick_fixes || [])
const suggestions = computed(() => props.result?.suggestions || [])

const overallCardColor = computed(() => {
  return isConformant.value ? 'success' : 'error'
})

const typeIcon = computed(() => {
  const type = detectedType.value?.toLowerCase()
  if (type === 'objective') return 'mdi-target'
  if (type === 'goal') return 'mdi-flag-checkered'
  if (type === 'task') return 'mdi-checkbox-marked'
  if (type === 'activity') return 'mdi-run'
  return 'mdi-help-circle'
})

function getScoreColor(score) {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

function getSeverityColor(severity) {
  const s = severity?.toLowerCase()
  if (s === 'critical') return 'error'
  if (s === 'high') return 'warning'
  if (s === 'medium') return 'info'
  return 'grey'
}

function getSeverityIcon(severity) {
  const s = severity?.toLowerCase()
  if (s === 'critical') return 'mdi-alert-octagon'
  if (s === 'high') return 'mdi-alert'
  if (s === 'medium') return 'mdi-information'
  return 'mdi-information-outline'
}

function getSeverityClass(severity) {
  const s = severity?.toLowerCase()
  if (s === 'critical') return 'violation-critical'
  if (s === 'high') return 'violation-high'
  return ''
}
</script>

<style scoped>
.conformance-result {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.violation-critical {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.violation-high {
  border-left: 4px solid rgb(var(--v-theme-warning));
}
</style>
