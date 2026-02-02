<template>
  <v-card
    class="rule-card h-100"
    :class="{ 'rule-card--inactive': !rule.is_active }"
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
          class="font-weight-medium"
        >
          <v-icon start size="small">{{ severityIcon }}</v-icon>
          {{ rule.severity }}
        </v-chip>
        <v-chip
          :color="rule.content_type === 'objective' ? 'primary' : 'secondary'"
          size="small"
          variant="tonal"
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
      </div>
    </div>

    <!-- Description -->
    <v-card-text class="pt-0 pb-2">
      <p class="text-body-2 text-medium-emphasis rule-description">
        {{ rule.description }}
      </p>

      <!-- Meta info chips -->
      <div class="d-flex flex-wrap ga-2 mt-3">
        <v-chip size="x-small" variant="tonal" color="primary">
          <v-icon start size="x-small">mdi-folder</v-icon>
          {{ rule.category }}
        </v-chip>
        <v-chip size="x-small" variant="tonal">
          <v-icon start size="x-small">mdi-target</v-icon>
          {{ rule.target_field }}
        </v-chip>
        <v-chip size="x-small" variant="tonal" color="info">
          <v-icon start size="x-small">mdi-scale-balance</v-icon>
          {{ rule.weight }}x
        </v-chip>
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
          <div v-for="(example, i) in rule.good_examples.slice(0, 2)" :key="'good-' + i" class="text-caption text-success ml-5">
            "{{ example }}"
          </div>
        </div>

        <div v-if="rule.bad_examples?.length">
          <div class="d-flex align-center mb-1">
            <v-icon color="error" size="small" class="mr-1">mdi-close-circle</v-icon>
            <span class="text-caption font-weight-medium">Bad Examples</span>
          </div>
          <div v-for="(example, i) in rule.bad_examples.slice(0, 2)" :key="'bad-' + i" class="text-caption text-error ml-5">
            "{{ example }}"
          </div>
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
      <v-btn
        icon
        size="small"
        variant="text"
        color="primary"
        @click="$emit('edit', rule)"
        title="Edit rule"
      >
        <v-icon size="small">mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        icon
        size="small"
        variant="text"
        color="error"
        @click="$emit('delete', rule)"
        title="Delete rule"
      >
        <v-icon size="small">mdi-delete</v-icon>
      </v-btn>
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

.rule-card--inactive {
  opacity: 0.6;
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
</style>
