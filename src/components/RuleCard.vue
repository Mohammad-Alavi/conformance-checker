<template>
  <v-card
    class="rule-card h-100"
    variant="outlined"
    hover
  >
    <!-- Header with severity indicator -->
    <div class="rule-card__header pa-4 pb-2">
      <div class="d-flex align-center justify-space-between mb-2">
        <v-chip
          :color="severityColor"
          size="small"
          variant="flat"
          class="font-weight-medium text-capitalize"
        >
          <v-icon start size="small">{{ severityIcon }}</v-icon>
          {{ rule.severity }}
        </v-chip>
        <v-chip
          :color="rule.content_type === 'objective' ? 'primary' : 'secondary'"
          size="small"
          variant="tonal"
          class="text-capitalize"
        >
          <v-icon start size="x-small">
            {{ rule.content_type === 'objective' ? 'mdi-target' : 'mdi-flag-checkered' }}
          </v-icon>
          {{ rule.content_type }}
        </v-chip>
      </div>

      <h3 class="text-subtitle-1 font-weight-bold rule-title">
        {{ rule.title }}
      </h3>

      <div class="text-caption text-medium-emphasis mt-1">
        <v-icon size="x-small" class="mr-1">mdi-identifier</v-icon>
        {{ rule.rule_id }}
        <span v-if="rule.version" class="ml-2">
          <v-icon size="x-small" class="mr-1">mdi-tag</v-icon>
          v{{ rule.version }}
        </span>
      </div>
    </div>

    <!-- Description -->
    <v-card-text class="pt-0 pb-2">
      <p class="text-body-2 text-medium-emphasis rule-description">
        {{ rule.description || 'No description provided' }}
      </p>

      <!-- Meta info chips -->
      <div class="d-flex flex-wrap ga-2 mt-3">
        <v-chip size="x-small" variant="tonal" color="primary">
          <v-icon start size="x-small">mdi-folder</v-icon>
          {{ rule.category || 'General' }}
        </v-chip>
        <v-chip size="x-small" variant="tonal">
          <v-icon start size="x-small">mdi-target</v-icon>
          {{ rule.target_field || 'title' }}
        </v-chip>
        <v-chip size="x-small" variant="tonal" color="info">
          <v-icon start size="x-small">mdi-scale-balance</v-icon>
          {{ formatWeight(rule.weight) }}x
        </v-chip>
        <v-chip v-if="rule.quick_fix_type" size="x-small" variant="tonal" color="success">
          <v-icon start size="x-small">mdi-auto-fix</v-icon>
          {{ formatQuickFix(rule.quick_fix_type) }}
        </v-chip>
      </div>

      <!-- Validation hint preview -->
      <div v-if="rule.validation_hint" class="mt-3 pa-2 bg-grey-lighten-4 rounded">
        <div class="d-flex align-center mb-1">
          <v-icon size="x-small" color="info" class="mr-1">mdi-tooltip-check</v-icon>
          <span class="text-caption font-weight-medium">Validation Hint</span>
        </div>
        <p class="text-caption text-medium-emphasis mb-0 validation-hint">
          {{ rule.validation_hint }}
        </p>
      </div>
    </v-card-text>

    <!-- Examples (collapsible) -->
    <v-expand-transition>
      <div v-if="showExamples" class="px-4 pb-2">
        <v-divider class="mb-3" />

        <div v-if="rule.good_examples?.length" class="mb-3">
          <div class="d-flex align-center mb-1">
            <v-icon color="success" size="small" class="mr-1">mdi-check-circle</v-icon>
            <span class="text-caption font-weight-medium">Good Examples</span>
          </div>
          <div v-for="(example, i) in rule.good_examples.slice(0, 3)" :key="'good-' + i" class="text-caption text-success ml-5 mb-1">
            "{{ example }}"
          </div>
          <div v-if="rule.good_examples.length > 3" class="text-caption text-medium-emphasis ml-5">
            +{{ rule.good_examples.length - 3 }} more...
          </div>
        </div>

        <div v-if="rule.bad_examples?.length">
          <div class="d-flex align-center mb-1">
            <v-icon color="error" size="small" class="mr-1">mdi-close-circle</v-icon>
            <span class="text-caption font-weight-medium">Bad Examples</span>
          </div>
          <div v-for="(example, i) in rule.bad_examples.slice(0, 3)" :key="'bad-' + i" class="text-caption text-error ml-5 mb-1">
            "{{ example }}"
          </div>
          <div v-if="rule.bad_examples.length > 3" class="text-caption text-medium-emphasis ml-5">
            +{{ rule.bad_examples.length - 3 }} more...
          </div>
        </div>

        <div v-if="!rule.good_examples?.length && !rule.bad_examples?.length" class="text-caption text-medium-emphasis">
          No examples available for this rule.
        </div>
      </div>
    </v-expand-transition>

    <v-divider />

    <!-- Actions -->
    <v-card-actions class="pa-2">
      <v-btn
        size="small"
        variant="text"
        @click="showExamples = !showExamples"
      >
        <v-icon start size="small">
          {{ showExamples ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>
        {{ showExamples ? 'Less' : 'Examples' }}
      </v-btn>
      <v-spacer />
      <v-tooltip text="Edit rule" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            size="small"
            variant="text"
            color="primary"
            @click="$emit('edit', rule)"
          >
            <v-icon size="small">mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip text="Delete rule" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            size="small"
            variant="text"
            color="error"
            @click="$emit('delete', rule)"
          >
            <v-icon size="small">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rule: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'delete'])

const showExamples = ref(false)

const severityColor = computed(() => {
  const colors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
  }
  return colors[props.rule.severity] || 'grey'
})

const severityIcon = computed(() => {
  const icons = {
    critical: 'mdi-alert-octagon',
    high: 'mdi-alert',
    medium: 'mdi-alert-circle',
    low: 'mdi-information',
  }
  return icons[props.rule.severity] || 'mdi-help-circle'
})

function formatWeight(weight) {
  const num = parseFloat(weight)
  return isNaN(num) ? '1.0' : num.toFixed(1)
}

function formatQuickFix(type) {
  if (!type) return ''
  // Convert snake_case to Title Case
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
.rule-card {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.rule-card:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

.rule-title {
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rule-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.validation-hint {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
</style>
