<template>
  <div class="conformance-result">
    <!-- Main Status Card -->
    <v-card class="result-card mb-4" :class="statusCardClass" elevation="0">
      <v-card-text class="pa-5">
        <div class="d-flex align-center mb-3">
          <!-- Status Icon -->
          <v-avatar :color="statusColor" size="48" class="mr-4">
            <v-icon color="white" size="28">{{ statusIcon }}</v-icon>
          </v-avatar>

          <!-- Status Text & Scores -->
          <div class="flex-grow-1">
            <h3 class="text-h6 font-weight-bold mb-1">{{ statusLabel }}</h3>
            <div class="d-flex align-center flex-wrap ga-3">
              <v-chip
                v-if="hasConformanceScore"
                size="small"
                :color="statusColor"
                variant="tonal"
              >
                <v-icon start size="small">mdi-percent</v-icon>
                Score: {{ conformanceScore }}%
                <v-tooltip activator="parent" location="bottom" max-width="300">
                  <span><strong>Conformance Score:</strong> How well your {{ contentType }} meets best practices. 100% means fully conformant with all criteria.</span>
                </v-tooltip>
              </v-chip>
              <v-chip
                v-if="hasConfidenceScore"
                size="small"
                color="info"
                variant="tonal"
              >
                <v-icon start size="small">mdi-shield-check</v-icon>
                Confidence: {{ confidenceScore }}%
                <v-tooltip activator="parent" location="bottom" max-width="300">
                  <span><strong>Confidence Level:</strong> How certain the AI is about its assessment. Higher confidence means the analysis is more reliable.</span>
                </v-tooltip>
              </v-chip>
            </div>
          </div>

          <!-- Type Mismatch Badge -->
          <v-chip
            v-if="!typeMatches"
            color="warning"
            variant="flat"
            class="ml-2"
          >
            <v-icon start size="small">mdi-swap-horizontal</v-icon>
            Detected as {{ detectedType }}
            <v-tooltip activator="parent" location="bottom" max-width="300">
              <span><strong>Type Mismatch:</strong> The AI detected that your input better matches a {{ detectedType }} than an {{ contentType }}. Consider switching types for more accurate validation.</span>
            </v-tooltip>
          </v-chip>
        </div>

        <!-- Overall Message -->
        <p v-if="conformance?.overall_message" class="text-body-2 text-medium-emphasis mb-0 pl-16">
          {{ conformance.overall_message }}
        </p>
      </v-card-text>
    </v-card>

    <!-- Type Mismatch Conversion Card -->
    <v-card
      v-if="showConversionPrompt && conversionTargetType"
      class="mb-4"
      color="warning"
      variant="tonal"
    >
      <v-card-text class="pa-4">
        <div class="d-flex align-center flex-wrap ga-3">
          <v-icon color="warning" class="mr-2">mdi-information</v-icon>
          <span class="text-body-2 flex-grow-1">
            This appears to be a <strong>{{ conversionTargetType }}</strong> rather than an {{ contentType }}.
            <span v-if="typeAssessment?.reason" class="text-medium-emphasis">
              {{ typeAssessment.reason }}
            </span>
          </span>
          <v-btn
            color="warning"
            variant="flat"
            @click="applyConversion()"
          >
            <v-icon start>mdi-swap-horizontal</v-icon>
            Switch to {{ conversionTargetType }}
            <v-tooltip activator="parent" location="bottom" max-width="300">
              <span>Change the validation type to {{ conversionTargetType }} and keep your current input. This will allow you to re-validate with the correct type.</span>
            </v-tooltip>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Quick Fixes Section -->
    <v-card v-if="quickFixes.length > 0" class="mb-4" variant="outlined">
      <v-card-text class="pa-4">
        <div class="d-flex align-center mb-3">
          <v-icon color="info" class="mr-2">mdi-auto-fix</v-icon>
          <span class="text-subtitle-2 font-weight-medium">Quick Fixes Available</span>
          <v-tooltip location="right" max-width="300">
            <template #activator="{ props }">
              <v-icon v-bind="props" size="small" class="ml-2 text-medium-emphasis">mdi-help-circle-outline</v-icon>
            </template>
            <span>One-click improvements to instantly enhance your {{ contentType }}. Click a fix to automatically apply it to your input.</span>
          </v-tooltip>
        </div>
        <div class="d-flex flex-wrap ga-2">
          <v-btn
            v-for="(fix, index) in quickFixes"
            :key="index"
            color="info"
            variant="tonal"
            @click="applyQuickFix(fix)"
            class="text-none"
          >
            <v-icon start size="small">mdi-wrench</v-icon>
            {{ getQuickFixLabel(fix) }}
            <v-tooltip activator="parent" location="bottom" max-width="350">
              <div class="pa-2">
                <div v-if="fix.current && fix.current !== '[empty]'" class="mb-2">
                  <strong>Current:</strong>
                  <div class="text-caption mt-1">{{ fix.current }}</div>
                </div>
                <div v-if="fix.suggestion" class="mb-2">
                  <strong>Will add:</strong>
                  <div class="text-caption mt-1">{{ fix.suggestion }}</div>
                </div>
                <v-divider class="my-2" />
                <div>
                  <strong>Result:</strong>
                  <div class="text-caption mt-1 text-success">{{ fix.result_preview }}</div>
                </div>
              </div>
            </v-tooltip>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Details Sections -->
    <div v-if="hasDetails" class="details-section">
      <!-- Strengths -->
      <v-card v-if="strengths.length > 0" class="mb-3" variant="outlined">
        <v-card-title class="d-flex align-center py-3 px-4 bg-success-subtle">
          <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
          <span class="text-subtitle-1">Strengths</span>
          <v-chip size="small" color="success" class="ml-2">{{ strengths.length }}</v-chip>
          <v-tooltip location="right" max-width="300">
            <template #activator="{ props }">
              <v-icon v-bind="props" size="small" class="ml-2 text-medium-emphasis">mdi-help-circle-outline</v-icon>
            </template>
            <span>Aspects of your {{ contentType }} that already meet best practices. These are what you're doing well.</span>
          </v-tooltip>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-list class="py-0">
            <v-list-item
              v-for="(strength, index) in strengths"
              :key="index"
              class="border-b"
            >
              <template #prepend>
                <v-icon color="success" size="small" class="mr-3">mdi-check</v-icon>
              </template>
              <v-list-item-title class="text-body-2 text-wrap">
                {{ typeof strength === 'string' ? strength : (strength.message || strength.description) }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Violations -->
      <v-card v-if="violations.length > 0" class="mb-3" variant="outlined">
        <v-card-title class="d-flex align-center py-3 px-4 bg-error-subtle">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          <span class="text-subtitle-1">Issues Found</span>
          <v-chip size="small" color="error" class="ml-2">{{ violations.length }}</v-chip>
          <v-tooltip location="right" max-width="300">
            <template #activator="{ props }">
              <v-icon v-bind="props" size="small" class="ml-2 text-medium-emphasis">mdi-help-circle-outline</v-icon>
            </template>
            <span>Problems identified in your {{ contentType }} that should be addressed. Severity indicates priority: critical/high issues need immediate attention.</span>
          </v-tooltip>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-list class="py-0">
            <v-list-item
              v-for="(violation, index) in violations"
              :key="index"
              class="border-b"
            >
              <template #prepend>
                <v-icon :color="getSeverityColor(violation.severity)" size="small" class="mr-3">
                  {{ getSeverityIcon(violation.severity) }}
                </v-icon>
              </template>
              <v-list-item-title class="text-body-2 text-wrap">
                {{ violation.description || violation.message }}
              </v-list-item-title>
              <template #append>
                <v-chip
                  size="x-small"
                  :color="getSeverityColor(violation.severity)"
                  variant="tonal"
                >
                  {{ violation.severity || 'info' }}
                  <v-tooltip activator="parent" location="left" max-width="250">
                    <span>{{ getSeverityTooltip(violation.severity) }}</span>
                  </v-tooltip>
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Suggestions -->
      <v-card v-if="suggestions.length > 0" class="mb-3" variant="outlined">
        <v-card-title class="d-flex align-center py-3 px-4 bg-primary-subtle">
          <v-icon color="primary" class="mr-2">mdi-lightbulb</v-icon>
          <span class="text-subtitle-1">Suggestions</span>
          <v-chip size="small" color="primary" class="ml-2">{{ suggestions.length }}</v-chip>
          <v-tooltip location="right" max-width="300">
            <template #activator="{ props }">
              <v-icon v-bind="props" size="small" class="ml-2 text-medium-emphasis">mdi-help-circle-outline</v-icon>
            </template>
            <span>Recommendations to improve your {{ contentType }}. Click "Apply" buttons to use the suggested examples directly.</span>
          </v-tooltip>
        </v-card-title>
        <v-card-text class="pa-4">
          <div v-for="(suggestion, index) in suggestions" :key="index" class="mb-4 last:mb-0">
            <div class="text-subtitle-2 font-weight-medium mb-2 text-capitalize">
              {{ suggestion.target }} improvements:
            </div>
            <ul class="text-body-2 pl-5 mb-3">
              <li v-for="(imp, i) in suggestion.improvements" :key="i" class="mb-1">
                {{ imp }}
              </li>
            </ul>
            <v-btn
              v-if="suggestion.example"
              color="primary"
              variant="tonal"
              size="small"
              @click="applySuggestionExample(suggestion)"
              class="text-none"
            >
              <v-icon start size="small">mdi-pencil</v-icon>
              Apply: "{{ truncateText(suggestion.example, 50) }}"
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

const emit = defineEmits(['apply-fix', 'action'])

// Computed properties for easy access
const conformance = computed(() => props.result?.conformance || {})
const analysis = computed(() => props.result?.analysis || {})
const typeAssessment = computed(() => analysis.value?.type_assessment || {})
const uiHints = computed(() => typeAssessment.value?.ui_hints || {})

const isConformant = computed(() => conformance.value?.is_conformant === true)

// Distance-based status category
const distanceCategory = computed(() => {
  const distance = conformance.value?.distance_to_conformance
  if (distance === undefined || distance === null || isConformant.value) return 'conformant'
  if (distance === 0) return 'conformant'
  if (distance <= 30) return 'minor'
  if (distance <= 70) return 'moderate'
  return 'major'
})

// Status color
const statusColor = computed(() => {
  switch (distanceCategory.value) {
    case 'conformant': return 'success'
    case 'minor': return 'warning'
    case 'moderate': return 'orange'
    case 'major': return 'error'
    default: return 'info'
  }
})

// Card background class
const statusCardClass = computed(() => {
  return `status-${distanceCategory.value}`
})

// Status icon
const statusIcon = computed(() => {
  switch (distanceCategory.value) {
    case 'conformant': return 'mdi-check-circle'
    case 'minor': return 'mdi-alert'
    case 'moderate': return 'mdi-wrench'
    case 'major': return 'mdi-close-circle'
    default: return 'mdi-information'
  }
})

// Status label
const statusLabel = computed(() => {
  switch (distanceCategory.value) {
    case 'conformant': return 'Fully Conformant!'
    case 'minor': return 'Almost There - Minor Tweaks Needed'
    case 'moderate': return 'Needs Work - Moderate Revisions'
    case 'major': return 'Significant Revisions Required'
    default: return 'Non-Conformant'
  }
})

// Handle conformance_score as object {raw, weighted, max_possible} or number
const hasConformanceScore = computed(() => {
  const score = conformance.value?.conformance_score
  if (score === null || score === undefined) return false
  if (typeof score === 'object') {
    return score.weighted !== undefined || score.raw !== undefined
  }
  return !isNaN(score)
})

const conformanceScore = computed(() => {
  const score = conformance.value?.conformance_score
  if (!score) return 0
  if (typeof score === 'object') {
    if (score.weighted !== undefined) return Math.round(score.weighted)
    if (score.raw !== undefined && score.max_possible) {
      return Math.round((score.raw / score.max_possible) * 100)
    }
    return 0
  }
  return score <= 1 ? Math.round(score * 100) : Math.round(score)
})

// Confidence is in type_assessment.confidence (already 0-100)
const hasConfidenceScore = computed(() => {
  const score = typeAssessment.value?.confidence
  return score !== null && score !== undefined && !isNaN(score)
})

const confidenceScore = computed(() => {
  const score = typeAssessment.value?.confidence
  if (!score) return 0
  return score <= 1 ? Math.round(score * 100) : Math.round(score)
})

const detectedType = computed(() => typeAssessment.value?.detected_type || props.contentType)
const typeMatches = computed(() => !typeAssessment.value?.is_mismatch)

// Supported types for conversion (temporary - only objective and goal are implemented)
const SUPPORTED_CONVERSION_TYPES = ['objective', 'goal']

// Show conversion prompt when there's a type mismatch AND the target type is supported
const showConversionPrompt = computed(() => {
  // First check if the detected type is one we support
  const detectedType = typeAssessment.value?.detected_type
  if (detectedType && !SUPPORTED_CONVERSION_TYPES.includes(detectedType.toLowerCase())) {
    return false
  }

  // Then check if there's a mismatch
  if (typeAssessment.value?.is_mismatch === true) {
    return true
  }
  // Fallback to ui_hints if no mismatch
  if (uiHints.value?.show_conversion_prompt !== undefined) {
    return uiHints.value.show_conversion_prompt
  }
  return false
})

// Get the target type for conversion - prioritize detected_type from API
const conversionTargetType = computed(() => {
  // First priority: detected_type from type_assessment
  if (typeAssessment.value?.detected_type) {
    return typeAssessment.value.detected_type
  }
  // Second priority: alternatives array if provided
  const alts = typeAssessment.value?.alternatives || []
  const alt = alts.find(a => a.can_create && a.conversion) || alts[0]
  return alt?.type || null
})

const violations = computed(() => analysis.value?.violations || [])
const strengths = computed(() => analysis.value?.strengths || [])
const quickFixes = computed(() => props.result?.quick_fixes || [])
const suggestions = computed(() => props.result?.suggestions || [])

const hasDetails = computed(() => {
  return violations.value.length > 0 || strengths.value.length > 0 || suggestions.value.length > 0
})

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

function getSeverityTooltip(severity) {
  const s = severity?.toLowerCase()
  if (s === 'critical') return 'Critical: Must be fixed immediately. This issue severely impacts the quality of your input.'
  if (s === 'high') return 'High: Should be addressed soon. This is an important issue that affects conformance.'
  if (s === 'medium') return 'Medium: Consider fixing. This issue moderately affects the quality.'
  return 'Low: Minor issue. Nice to fix but not essential.'
}

function getQuickFixLabel(fix) {
  const type = fix.type || fix.action || 'Fix'
  return type.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}


function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function applyQuickFix(fix) {
  const field = fix.target === 'description' ? 'description' : 'title'
  emit('apply-fix', {
    field,
    result_preview: fix.result_preview
  })
}

function applyConversion() {
  // Switch to the detected type from the API - keep the original inputs as-is
  if (conversionTargetType.value) {
    emit('action', `switch_to_${conversionTargetType.value}`)
  }
}

function applySuggestionExample(suggestion) {
  const field = suggestion.target === 'description' ? 'description' : 'title'
  emit('apply-fix', { field, result_preview: suggestion.example })
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

.result-card {
  border-radius: 12px;
  overflow: hidden;
}

.status-conformant {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.02) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-minor {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 193, 7, 0.02) 100%);
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-moderate {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 152, 0, 0.02) 100%);
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.status-major {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(244, 67, 54, 0.02) 100%);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.bg-success-subtle {
  background: rgba(76, 175, 80, 0.08);
}

.bg-error-subtle {
  background: rgba(244, 67, 54, 0.08);
}

.bg-primary-subtle {
  background: rgba(var(--v-theme-primary), 0.08);
}

.border-b:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.text-wrap {
  white-space: normal;
  word-wrap: break-word;
}

.last\:mb-0:last-child {
  margin-bottom: 0;
}
</style>
